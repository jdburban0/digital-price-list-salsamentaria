from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine, SessionLocal, CategoryDB, SupplierDB

client = TestClient(app)

# --- SETUP (asegura base limpia) ---
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Crea datos de base si no existen
if db.query(CategoryDB).count() == 0:
    db.add_all([
        CategoryDB(name="Lácteos"),
        CategoryDB(name="Embutidos"),
    ])
    db.commit()

if db.query(SupplierDB).count() == 0:
    db.add_all([
        SupplierDB(name="Proveedor A", phone="12345", email="proveedora@test.com"),
        SupplierDB(name="Proveedor B", phone="67890", email="proveedorb@test.com"),
    ])
    db.commit()

db.close()


# --- TESTS ---

def test_create_product():
    """Prueba la creación de un producto."""
    data = {
        "name": "Queso Campesino",
        "price": 8500,
        "categoria_id": 1,
        "supplier_id": 1
    }
    response = client.post("/products", json=data)
    assert response.status_code in [200, 201]
    product = response.json()
    assert product["name"] == "Queso Campesino"
    assert "id" in product


def test_get_products():
    """Prueba la obtención de productos."""
    response = client.get("/products")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    assert len(products) >= 1


def test_update_product():
    """Prueba la actualización de un producto existente."""
    response = client.get("/products")
    product_id = response.json()[0]["id"]

    update_data = {"price": 9000}
    res = client.put(f"/products/{product_id}", json=update_data)
    assert res.status_code == 200
    assert res.json()["price"] == 9000


def test_delete_product():
    """Prueba la eliminación de un producto."""
    response = client.get("/products")
    product_id = response.json()[0]["id"]

    res = client.delete(f"/products/{product_id}")
    assert res.status_code == 204


def test_categories_and_suppliers():
    """Prueba lectura de categorías y proveedores."""
    res_cat = client.get("/categories")
    res_sup = client.get("/suppliers")
    assert res_cat.status_code == 200
    assert res_sup.status_code == 200
    assert len(res_cat.json()) >= 2
    assert len(res_sup.json()) >= 2
