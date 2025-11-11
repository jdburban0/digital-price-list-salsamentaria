from datetime import datetime
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    create_engine,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from app.core.config import settings

# ---------------------------------------------------------------
# Configuración de la base de datos SQLite
DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ---------------------------------------------------------------
# MODELOS
class CategoryDB(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    products = relationship("ProductDB", back_populates="category", cascade="all, delete")


class SupplierDB(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

    products = relationship("ProductDB", back_populates="supplier", cascade="all, delete")


class CustomerDB(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)

    orders = relationship("OrderDB", back_populates="customer", cascade="all, delete-orphan")


class ProductDB(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    price = Column(Float, nullable=False)

    categoria_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)

    category = relationship("CategoryDB", back_populates="products")
    supplier = relationship("SupplierDB", back_populates="products")
    orders = relationship("OrderDB", back_populates="product", cascade="all, delete")


class OrderDB(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="pendiente")
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("CustomerDB", back_populates="orders")
    product = relationship("ProductDB", back_populates="orders")


# --- MODELO: Usuarios ---
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)


# ---------------------------------------------------------------
# FUNCIONES DE INICIALIZACIÓN

def init_db():
    """Crea las tablas si no existen."""
    Base.metadata.create_all(bind=engine)


def seed_data():
    """Inserta datos de ejemplo solo si la base está vacía."""
    from sqlalchemy.exc import IntegrityError

    db = SessionLocal()
    try:
        # Semillas de categorías
        if db.query(CategoryDB).count() == 0:
            categorias = [
                CategoryDB(name="Lácteos"),
                CategoryDB(name="Embutidos"),
                CategoryDB(name="Abarrotes"),
                CategoryDB(name="Bebidas"),
            ]
            db.add_all(categorias)
            db.commit()

        # Semillas de proveedores
        if db.query(SupplierDB).count() == 0:
            proveedores = [
                SupplierDB(
                    name="Burbano Family",
                    phone="3104567890",
                    email="burbano@salsa.com",
                ),
                SupplierDB(
                    name="Cárnicos del Valle",
                    phone="3169876543",
                    email="contacto@carnicosvalle.com",
                ),
                SupplierDB(
                    name="Quesera San Juan",
                    phone="3156547890",
                    email="ventas@queserasj.com",
                ),
            ]
            db.add_all(proveedores)
            db.commit()

        # Semillas de clientes
        if db.query(CustomerDB).count() == 0:
            clientes = [
                CustomerDB(name="Distribuciones La 14", email="contacto@la14.com", phone="3152223344"),
                CustomerDB(name="Mercado Express", email="ventas@mercadoexpress.com", phone="3169991122"),
            ]
            db.add_all(clientes)
            db.commit()

    except IntegrityError:
        db.rollback()
    finally:
        db.close()
