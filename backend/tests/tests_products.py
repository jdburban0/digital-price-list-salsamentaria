from fastapi.testclient import TestClient
from app.main import app

# Crear un cliente de prueba
client = TestClient(app)


def test_create_product():
    # Datos de prueba
    product_data = {
        "name": "Queso Campesino",
        "price": 12000.0,
        "categoria": "Lácteos"
    }

    # Realizar la solicitud POST
    response = client.post("/products", json=product_data)

    # Verificar el estado de la respuesta
    assert response.status_code == 201, f"Expected 201, got {response.status_code}. Response: {response.text}"

    # Verificar el contenido de la respuesta
    data = response.json()
    assert data["name"] == "Queso Campesino"
    assert data["price"] == 12000.0
    assert data["categoria"] == "Lácteos"
    assert "id" in data, "Response should include an id"

    # Verificar que el producto se haya agregado correctamente
    get_response = client.get("/products")
    assert get_response.status_code == 200
    products = get_response.json()
    assert any(p["name"] == "Queso Campesino" for p in products)
