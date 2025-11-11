from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from app.core.config import settings

# ---------------------------------------------------------------
# Configuracion de la base de datos SQLite
DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ---------------------------------------------------------------
# MODELOS

class CategoryDB(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    products = relationship("ProductDB", back_populates="category")


class SupplierDB(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

    products = relationship("ProductDB", back_populates="supplier")


class ProductDB(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    price = Column(Float, nullable=False)

    categoria_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)

    category = relationship("CategoryDB", back_populates="products")
    supplier = relationship("SupplierDB", back_populates="products")


# --- NUEVO MODELO: Usuarios ---
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)

# ---------------------------------------------------------------
# FUNCIONES DE INICIALIZACION

def init_db():
    """Crea las tablas si no existen."""
    Base.metadata.create_all(bind=engine)


def seed_data():
    """Inserta datos de ejemplo solo si la base esta vacia."""
    db = SessionLocal()
    try:
        # Semillas de categorias
        if db.query(CategoryDB).count() == 0:
            categorias = [
                CategoryDB(name="Lacteos"),
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
                    name="Carnicos del Valle",
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

    finally:
        db.close()

