import uuid

import pytest
from fastapi import Response

from app.auth.auth import create_access_token
from app.auth.dependencies import authenticate_user, create_admin_user
from app.db import (
    Base,
    CategoryDB,
    CustomerDB,
    OrderDB,
    ProductDB,
    SessionLocal,
    SupplierDB,
    engine,
    seed_data,
)
from app.models.customer import CustomerCreate, CustomerUpdate
from app.models.order import OrderCreate, OrderUpdate
from app.models.product import ProductCreate, ProductUpdate
from app.api.routes.products import (
    create_product,
    delete_product,
    list_products,
    update_product,
)
from app.api.routes.customers import (
    create_customer,
    delete_customer,
    update_customer,
)
from app.api.routes.orders import create_order, delete_order, list_orders, update_order


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    seed_data()
    yield
    SessionLocal().close()


@pytest.fixture()
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def admin_user(db_session):
    create_admin_user(db_session)
    user = authenticate_user(db_session, "admin", "1234")
    assert user is not None
    return user


def test_admin_login(admin_user):
    token = create_access_token({"sub": admin_user.username})
    assert isinstance(token, str)
    assert token


def test_product_crud(db_session, admin_user):
    payload = ProductCreate(
        name=f"Queso-{uuid.uuid4().hex[:6]}",
        price=8500,
        categoria_id=1,
        supplier_id=1,
    )
    product = create_product(payload, db=db_session, user=admin_user)
    assert product.name.startswith("Queso-")

    response = Response()
    products = list_products(
        response=response,
        db=db_session,
        q=None,
        sort="name",
        order="asc",
        offset=0,
        limit=10,
    )
    assert isinstance(products, list)
    assert any(p.id == product.id for p in products)

    updated = update_product(
        product_id=product.id,
        payload=ProductUpdate(price=9900),
        db=db_session,
        user=admin_user,
    )
    assert updated.price == 9900

    delete_product(product_id=product.id, db=db_session, user=admin_user)
    assert db_session.query(ProductDB).filter_by(id=product.id).count() == 0


def test_customer_crud(db_session, admin_user):
    payload = CustomerCreate(
        name="Supermercado Central",
        email=f"ventas-{uuid.uuid4().hex[:6]}@central.com",
        phone="3007654321",
    )
    customer = create_customer(payload, db=db_session, _=admin_user)
    assert customer.email.endswith("@central.com")

    updated = update_customer(
        customer_id=customer.id,
        payload=CustomerUpdate(phone="3011112233"),
        db=db_session,
        _=admin_user,
    )
    assert updated.phone == "3011112233"

    delete_customer(customer_id=customer.id, db=db_session, _=admin_user)
    assert db_session.query(CustomerDB).filter_by(id=customer.id).count() == 0


def test_order_flow(db_session, admin_user):
    customer = create_customer(
        CustomerCreate(
            name="Restaurante El Buen Sabor",
            email=f"contacto-{uuid.uuid4().hex[:6]}@buen-sabor.com",
            phone="3020003344",
        ),
        db=db_session,
        _=admin_user,
    )
    product = create_product(
        ProductCreate(
            name=f"Lomito-{uuid.uuid4().hex[:6]}",
            price=12500,
            categoria_id=1,
            supplier_id=1,
        ),
        db=db_session,
        user=admin_user,
    )

    order = create_order(
        OrderCreate(
            customer_id=customer.id,
            product_id=product.id,
            quantity=5,
            status="pendiente",
            notes="Entrega en horas de la mañana",
        ),
        db=db_session,
        _=admin_user,
    )
    assert order.customer.name == "Restaurante El Buen Sabor"

    updated = update_order(
        order_id=order.id,
        payload=OrderUpdate(status="completado"),
        db=db_session,
        _=admin_user,
    )
    assert updated.status == "completado"

    orders = list_orders(db=db_session, _=admin_user, customer_id=None, status=None)
    assert any(o.id == order.id for o in orders)

    delete_order(order_id=order.id, db=db_session, _=admin_user)
    assert db_session.query(OrderDB).filter_by(id=order.id).count() == 0

    delete_customer(customer_id=customer.id, db=db_session, _=admin_user)
    delete_product(product_id=product.id, db=db_session, user=admin_user)


def test_seed_entities_exist(db_session):
    assert db_session.query(CategoryDB).count() > 0
    assert db_session.query(SupplierDB).count() > 0
