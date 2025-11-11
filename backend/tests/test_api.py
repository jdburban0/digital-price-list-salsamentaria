from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine, SessionLocal, CategoryDB, SupplierDB

client = TestClient(app)


def _get_token():
    res = client.post(
        "/login",
        data={"username": "admin", "password": "1234"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


def _unique(name: str) -> str:
    import time
    return f"{name}_{int(time.time() * 1000)}"

# --- SETUP (asegura base limpia) ---
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Crea datos de base si no existen
if db.query(CategoryDB).count() == 0:
    db.add_all([
        CategoryDB(name="Lacteos"),
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
    """Prueba la creacion de un producto."""
    data = {
        "name": "Queso Campesino",
        "price": 8500,
        "categoria_id": 1,
        "supplier_id": 1
    }
    token = _get_token()
    response = client.post(
        "/products",
        json=data,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code in [200, 201, 409]
    if response.status_code != 409:
        product = response.json()
        assert product["name"] == "Queso Campesino"
        assert "id" in product


def test_get_products():
    """Prueba la obtencion de productos."""
    response = client.get("/products")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    assert len(products) >= 1


def test_update_product():
    """Prueba la actualizacion de un producto existente."""
    response = client.get("/products")
    product_id = response.json()[0]["id"]

    update_data = {"price": 9000}
    token = _get_token()
    res = client.put(
        f"/products/{product_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["price"] == 9000


def test_delete_product():
    """Prueba la eliminacion de un producto."""
    response = client.get("/products")
    product_id = response.json()[0]["id"]

    token = _get_token()
    res = client.delete(
        f"/products/{product_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 204


def test_categories_and_suppliers():
    """Prueba lectura de categorias y proveedores."""
    res_cat = client.get("/categories")
    res_sup = client.get("/suppliers")
    assert res_cat.status_code == 200
    assert res_sup.status_code == 200
    assert len(res_cat.json()) >= 2
    assert len(res_sup.json()) >= 2


def test_register_user_success():
    username = _unique("user")
    payload = {
        "username": username,
        "email": f"{username}@test.com",
        "password": "abcd",
        "invite_code": "BUrBAN02o25",
    }
    res = client.post("/register", json=payload)
    assert res.status_code in (200, 201)
    body = res.json()
    assert "message" in body


def test_categories_crud_protected():
    token = _get_token()
    name = _unique("TemporalCat")
    # Crear
    res = client.post(
        "/categories",
        json={"name": name},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code in (200, 201)
    cat = res.json()
    cat_id = cat["id"]
    # Actualizar
    res = client.put(
        f"/categories/{cat_id}",
        json={"name": name + "_up"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    # Eliminar (debe funcionar si no hay productos asociados)
    res = client.delete(
        f"/categories/{cat_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 204


def test_suppliers_crud_protected():
    token = _get_token()
    name = _unique("ProveedorTemp")
    # Crear
    res = client.post(
        "/suppliers",
        json={"name": name, "phone": "12345", "email": "temp@test.com"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code in (200, 201)
    sup = res.json()
    sup_id = sup["id"]
    # Actualizar
    res = client.put(
        f"/suppliers/{sup_id}",
        json={"phone": "67890"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    # Eliminar
    res = client.delete(
        f"/suppliers/{sup_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 204

