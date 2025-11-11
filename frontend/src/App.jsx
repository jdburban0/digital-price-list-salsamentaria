import { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import ThemeToggle from "./components/Themetoggle";
import { getToken, removeToken, isAuthenticated } from "./utils/auth";
import { Link } from "react-router-dom";

const ORDER_STATUSES = ["pendiente", "en preparación", "completado", "cancelado"];

function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  // --- Estados principales ---
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [statusMessage, setStatusMessage] = useState("");

  // --- Paginación y orden ---
  const [page, setPage] = useState(0);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("asc");

  // --- Formulario Productos ---
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  // --- Formulario Categorías ---
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  // --- Formulario Proveedores ---
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [editingSupplier, setEditingSupplier] = useState(null);

  // --- Formulario Clientes ---
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);

  // --- Formulario Pedidos ---
  const [orderCustomerId, setOrderCustomerId] = useState("");
  const [orderProductId, setOrderProductId] = useState("");
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderStatus, setOrderStatus] = useState(ORDER_STATUSES[0]);
  const [orderNotes, setOrderNotes] = useState("");

  // --- Estado para tabs de gestión ---
  const [activeTab, setActiveTab] = useState("categories");

  const formatCurrency = (value) =>
    parseFloat(value).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
    });

  const formatDate = (value) =>
    new Date(value).toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // --- Función para recargar TODOS los datos ---
  const fetchAllData = async () => {
    if (!API_URL) return;
    setLoading(true);
    const token = getToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [categoriesRes, suppliersRes, customersRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/suppliers`),
        fetch(`${API_URL}/customers`, { headers: authHeaders }),
      ]);

      if (!categoriesRes.ok || !suppliersRes.ok) {
        throw new Error("Error al obtener datos iniciales");
      }

      if (customersRes.status === 401) {
        setCustomers([]);
      } else if (!customersRes.ok) {
        throw new Error("Error al obtener clientes");
      } else {
        setCustomers(await customersRes.json());
      }

      setCategories(await categoriesRes.json());
      setSuppliers(await suppliersRes.json());

      const url = new URL(`${API_URL}/products`);
      url.searchParams.append("q", search);
      url.searchParams.append("offset", page * limit);
      url.searchParams.append("limit", limit);
      url.searchParams.append("sort", sort);
      url.searchParams.append("order", order);

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al obtener productos");

      const data = await res.json();
      const totalCount = res.headers.get("x-total-count");
      setTotal(parseInt(totalCount || "0"));
      setProducts(data);

      const allProductsRes = await fetch(
        `${API_URL}/products?offset=0&limit=200&sort=name&order=asc`
      );
      if (allProductsRes.ok) {
        setAllProducts(await allProductsRes.json());
      } else {
        setAllProducts(data);
      }

      if (token) {
        const ordersRes = await fetch(`${API_URL}/orders`, { headers: authHeaders });
        if (ordersRes.status === 401) {
          setOrders([]);
        } else if (!ordersRes.ok) {
          throw new Error("Error al obtener pedidos");
        } else {
          setOrders(await ordersRes.json());
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchAllData();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (loggedIn) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, order, page, loggedIn]);

  // --- CRUD Productos ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price.trim() || !categoryId || !supplierId) {
      setError("Por favor completa todos los campos de Producto");
      return;
    }
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          price: parseFloat(price),
          categoria_id: parseInt(categoryId),
          supplier_id: parseInt(supplierId),
        }),
      });

      const errData = await res.clone().json().catch(() => null);
      if (!res.ok)
        throw new Error(errData?.detail || "Error al crear producto");

      setSuccess("Producto agregado correctamente");
      setName("");
      setPrice("");
      setCategoryId("");
      setSupplierId("");
      setPage(0);
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar producto");

      setSuccess("Producto eliminado correctamente");
      setPage(0);
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // --- CRUD Categorías ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const catName = editingCategory ? editingCategory.name : newCategoryName;
    if (!catName.trim()) {
      setError("El nombre de la categoría no puede estar vacío");
      return;
    }
    setError(null);
    setSuccess(null);

    const url = editingCategory
      ? `${API_URL}/categories/${editingCategory.id}`
      : `${API_URL}/categories`;
    const method = editingCategory ? "PUT" : "POST";

    try {
      const token = getToken();
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: catName.trim() }),
      });

      const errData = await res.clone().json().catch(() => null);
      if (!res.ok)
        throw new Error(errData?.detail || "Error al guardar categoría");

      setSuccess(
        `Categoría ${editingCategory ? "actualizada" : "creada"} correctamente`
      );
      setNewCategoryName("");
      setEditingCategory(null);
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (
      !confirm(
        "¿Eliminar esta categoría? (No se podrá si tiene productos asociados)"
      )
    )
      return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 400) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al eliminar categoría");
      }
      if (!res.ok) throw new Error("Error al eliminar categoría");

      setSuccess("Categoría eliminada correctamente");
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // --- CRUD Proveedores ---
  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    const suppName = editingSupplier ? editingSupplier.name : newSupplierName;
    const phone = editingSupplier ? editingSupplier.phone : newSupplierPhone;
    const email = editingSupplier ? editingSupplier.email : newSupplierEmail;

    if (!suppName.trim()) {
      setError("El nombre del proveedor no puede estar vacío");
      return;
    }
    setError(null);
    setSuccess(null);

    const url = editingSupplier
      ? `${API_URL}/suppliers/${editingSupplier.id}`
      : `${API_URL}/suppliers`;
    const method = editingSupplier ? "PUT" : "POST";

    const payload = {
      name: suppName.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
    };

    try {
      const token = getToken();
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const errData = await res.clone().json().catch(() => null);
      if (!res.ok) {
        throw new Error(errData?.detail || "Error al guardar proveedor");
      }

      setSuccess(
        `Proveedor ${editingSupplier ? "actualizado" : "creado"} correctamente`
      );
      setNewSupplierName("");
      setNewSupplierPhone("");
      setNewSupplierEmail("");
      setEditingSupplier(null);
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (
      !confirm(
        "¿Eliminar este proveedor? (No se podrá si tiene productos asociados)"
      )
    )
      return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 400) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al eliminar proveedor");
      }
      if (!res.ok) throw new Error("Error al eliminar proveedor");

      setSuccess("Proveedor eliminado correctamente");
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // --- CRUD Clientes ---
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const customerName = editingCustomer ? editingCustomer.name : newCustomerName;
    const customerEmail = editingCustomer ? editingCustomer.email : newCustomerEmail;
    const customerPhone = editingCustomer ? editingCustomer.phone : newCustomerPhone;

    if (!customerName.trim() || !customerEmail.trim()) {
      setError("Nombre y correo del cliente son obligatorios");
      return;
    }

    const url = editingCustomer
      ? `${API_URL}/customers/${editingCustomer.id}`
      : `${API_URL}/customers`;
    const method = editingCustomer ? "PUT" : "POST";
    const payload = {
      name: customerName.trim(),
      email: customerEmail.trim(),
      phone: customerPhone.trim() || null,
    };

    try {
      const token = getToken();
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const errData = await res.clone().json().catch(() => null);
      if (!res.ok) {
        throw new Error(errData?.detail || "Error al guardar cliente");
      }

      setSuccess(
        `Cliente ${editingCustomer ? "actualizado" : "creado"} correctamente`
      );
      setNewCustomerName("");
      setNewCustomerEmail("");
      setNewCustomerPhone("");
      setEditingCustomer(null);
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 400) {
        const errData = await res.json();
        throw new Error(errData.detail || "No se puede eliminar el cliente");
      }
      if (!res.ok) throw new Error("Error al eliminar cliente");

      setSuccess("Cliente eliminado correctamente");
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // --- CRUD Pedidos ---
  const resetOrderForm = () => {
    setOrderCustomerId("");
    setOrderProductId("");
    setOrderQuantity(1);
    setOrderStatus(ORDER_STATUSES[0]);
    setOrderNotes("");
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!orderCustomerId || !orderProductId) {
      setError("Selecciona cliente y producto para el pedido");
      return;
    }

    const payload = {
      customer_id: parseInt(orderCustomerId),
      product_id: parseInt(orderProductId),
      quantity: Math.max(1, parseInt(orderQuantity)),
      status: orderStatus,
      notes: orderNotes.trim() || null,
    };

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const errData = await res.clone().json().catch(() => null);
      if (!res.ok) {
        throw new Error(errData?.detail || "Error al crear pedido");
      }

      setSuccess("Pedido registrado correctamente");
      resetOrderForm();
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const errData = await res.clone().json().catch(() => null);
      if (!res.ok) {
        throw new Error(errData?.detail || "Error al actualizar pedido");
      }

      setSuccess("Pedido actualizado correctamente");
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm("¿Eliminar este pedido?")) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar pedido");

      setSuccess("Pedido eliminado correctamente");
      await fetchAllData();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // --- Login / Logout ---
  const handleLoginSuccess = () => {
    setStatusMessage("Iniciando sesión...");
    setTimeout(() => {
      setLoggedIn(true);
      setStatusMessage("");
    }, 1500);
  };

  const handleLogout = () => {
    setStatusMessage("Cerrando sesión...");
    setTimeout(() => {
      removeToken();
      setLoggedIn(false);
      setStatusMessage("");
      setProducts([]);
      setAllProducts([]);
      setCustomers([]);
      setOrders([]);
    }, 1500);
  };

  // --- Vista de Login ---
  if (!loggedIn) {
    return (
      <div className="app-container">
        <ThemeToggle />
        {statusMessage && (
          <div className="status-overlay">
            <div className="loading-spinner"></div>
            <p>{statusMessage}</p>
          </div>
        )}
        <LoginForm API_URL={API_URL} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // --- UI Principal (Admin) ---
  return (
    <div className="app-container">
      <ThemeToggle />
      {statusMessage && (
        <div className="status-overlay">
          <div className="loading-spinner"></div>
          <p>{statusMessage}</p>
        </div>
      )}

      <header className="header">
        <div className="header-left" style={{ position: "absolute", left: "2rem" }}>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        <div className="header-center">
          <h1>Panel de Administración</h1>
          <p className="subtitle">Salsamentaría Burbano</p>
        </div>
        <div className="header-right" style={{ position: "absolute", right: "2rem" }}>
          <Link to="/" className="public-link">
            Ver Lista Pública
          </Link>
        </div>
      </header>

      {/* Mensajes globales */}
      {error && <div className="error global-error">{error}</div>}
      {success && <div className="success global-success">{success}</div>}

      {/* ESTADÍSTICAS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Productos</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categorías</div>
          <div className="stat-value">{categories.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Proveedores</div>
          <div className="stat-value">{suppliers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clientes</div>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pedidos</div>
          <div className="stat-value">{orders.length}</div>
        </div>
      </div>

      <main>
        {/* GESTIÓN: Categorías, Proveedores y Clientes con tabs */}
        <section className="form-section">
          <h2>Gestión de Catálogo</h2>

          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              Categorías
            </button>
            <button
              className={`tab-button ${activeTab === "suppliers" ? "active" : ""}`}
              onClick={() => setActiveTab("suppliers")}
            >
              Proveedores
            </button>
            <button
              className={`tab-button ${activeTab === "customers" ? "active" : ""}`}
              onClick={() => setActiveTab("customers")}
            >
              Clientes
            </button>
          </div>

          {activeTab === "categories" && (
            <div className="tab-content">
              <div className="management-section">
                <div className="management-form">
                  <h3>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</h3>
                  <form onSubmit={handleCategorySubmit} className="inline-form">
                    <input
                      type="text"
                      placeholder="Nombre de categoría"
                      value={editingCategory ? editingCategory.name : newCategoryName}
                      onChange={(e) =>
                        editingCategory
                          ? setEditingCategory({
                              ...editingCategory,
                              name: e.target.value,
                            })
                          : setNewCategoryName(e.target.value)
                      }
                    />
                    <div className="form-actions">
                      <button type="submit" disabled={loading}>
                        {editingCategory ? "Actualizar" : "Crear Categoría"}
                      </button>
                      {editingCategory && (
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => setEditingCategory(null)}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="management-list-container">
                  <h3>Categorías Existentes ({categories.length})</h3>
                  <div className="management-list">
                    {categories.map((c) => (
                      <div key={c.id} className="list-item">
                        <div className="list-item-content">
                          <span className="list-item-name">{c.name}</span>
                        </div>
                        <div className="list-item-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => setEditingCategory(c)}
                          >
                            Editar
                          </button>
                          <button
                            className="delete-btn small-delete"
                            onClick={() => handleDeleteCategory(c.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <p className="empty-message">No hay categorías creadas</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "suppliers" && (
            <div className="tab-content">
              <div className="management-section">
                <div className="management-form">
                  <h3>{editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
                  <form onSubmit={handleSupplierSubmit} className="supplier-form">
                    <input
                      type="text"
                      placeholder="Nombre de proveedor"
                      value={editingSupplier ? editingSupplier.name : newSupplierName}
                      onChange={(e) =>
                        editingSupplier
                          ? setEditingSupplier({
                              ...editingSupplier,
                              name: e.target.value,
                            })
                          : setNewSupplierName(e.target.value)
                      }
                    />
                    <div className="supplier-contacts">
                      <input
                        type="text"
                        placeholder="Teléfono (opcional)"
                        value={editingSupplier ? editingSupplier.phone : newSupplierPhone}
                        onChange={(e) =>
                          editingSupplier
                            ? setEditingSupplier({
                                ...editingSupplier,
                                phone: e.target.value,
                              })
                            : setNewSupplierPhone(e.target.value)
                        }
                      />
                      <input
                        type="email"
                        placeholder="Correo (opcional)"
                        value={editingSupplier ? editingSupplier.email : newSupplierEmail}
                        onChange={(e) =>
                          editingSupplier
                            ? setEditingSupplier({
                                ...editingSupplier,
                                email: e.target.value,
                              })
                            : setNewSupplierEmail(e.target.value)
                        }
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" disabled={loading}>
                        {editingSupplier ? "Actualizar" : "Crear Proveedor"}
                      </button>
                      {editingSupplier && (
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => setEditingSupplier(null)}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="management-list-container">
                  <h3>Proveedores ({suppliers.length})</h3>
                  <div className="management-list">
                    {suppliers.map((s) => (
                      <div key={s.id} className="list-item">
                        <div className="list-item-content">
                          <span className="list-item-name">{s.name}</span>
                          <span className="list-item-sub">{s.phone || "Sin teléfono"}</span>
                        </div>
                        <div className="list-item-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => setEditingSupplier(s)}
                          >
                            Editar
                          </button>
                          <button
                            className="delete-btn small-delete"
                            onClick={() => handleDeleteSupplier(s.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {suppliers.length === 0 && (
                      <p className="empty-message">No hay proveedores registrados</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="tab-content">
              <div className="management-section">
                <div className="management-form">
                  <h3>{editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}</h3>
                  <form onSubmit={handleCustomerSubmit} className="customer-form">
                    <input
                      type="text"
                      placeholder="Nombre del cliente"
                      value={editingCustomer ? editingCustomer.name : newCustomerName}
                      onChange={(e) =>
                        editingCustomer
                          ? setEditingCustomer({
                              ...editingCustomer,
                              name: e.target.value,
                            })
                          : setNewCustomerName(e.target.value)
                      }
                    />
                    <input
                      type="email"
                      placeholder="Correo del cliente"
                      value={editingCustomer ? editingCustomer.email : newCustomerEmail}
                      onChange={(e) =>
                        editingCustomer
                          ? setEditingCustomer({
                              ...editingCustomer,
                              email: e.target.value,
                            })
                          : setNewCustomerEmail(e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Teléfono (opcional)"
                      value={editingCustomer ? editingCustomer.phone ?? "" : newCustomerPhone}
                      onChange={(e) =>
                        editingCustomer
                          ? setEditingCustomer({
                              ...editingCustomer,
                              phone: e.target.value,
                            })
                          : setNewCustomerPhone(e.target.value)
                      }
                    />
                    <div className="form-actions">
                      <button type="submit" disabled={loading}>
                        {editingCustomer ? "Actualizar" : "Crear Cliente"}
                      </button>
                      {editingCustomer && (
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => setEditingCustomer(null)}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="management-list-container">
                  <h3>Clientes ({customers.length})</h3>
                  <div className="management-list">
                    {customers.map((c) => (
                      <div key={c.id} className="list-item">
                        <div className="list-item-content">
                          <span className="list-item-name">{c.name}</span>
                          <span className="list-item-sub">{c.email}</span>
                        </div>
                        <div className="list-item-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => setEditingCustomer(c)}
                          >
                            Editar
                          </button>
                          <button
                            className="delete-btn small-delete"
                            onClick={() => handleDeleteCustomer(c.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {customers.length === 0 && (
                      <p className="empty-message">No hay clientes registrados</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* FORMULARIO DE PRODUCTOS */}
        <section className="form-section">
          <h2>Agregar Producto</h2>
          <form onSubmit={handleProductSubmit} className="product-form">
            <div className="form-grid">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Precio"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
              />
            </div>
            <div className="form-grid">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Seleccionar proveedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Agregar Producto"}
            </button>
          </form>
        </section>

        {/* GESTIÓN DE PEDIDOS */}
        <section className="orders-section">
          <h2>Gestión de Pedidos</h2>
          <div className="orders-management">
            <form onSubmit={handleOrderSubmit} className="orders-form">
              <div className="form-row">
                <select
                  value={orderCustomerId}
                  onChange={(e) => setOrderCustomerId(e.target.value)}
                >
                  <option value="">Selecciona un cliente</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={orderProductId}
                  onChange={(e) => setOrderProductId(e.target.value)}
                >
                  <option value="">Selecciona un producto</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  placeholder="Cantidad"
                />
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="status-select"
                >
                  {ORDER_STATUSES.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Notas adicionales (opcional)"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
              <div className="form-actions">
                <button type="submit">Registrar pedido</button>
                <button type="button" className="cancel-btn" onClick={resetOrderForm}>
                  Limpiar
                </button>
              </div>
            </form>

            <div className="orders-list">
              {orders.length === 0 && (
                <p className="empty-message">No hay pedidos registrados</p>
              )}
              {orders.map((orderItem) => (
                <div key={orderItem.id} className="order-card">
                  <header>
                    <div>
                      <h3>Pedido #{orderItem.id}</h3>
                      <p className="order-meta">
                        <span>Fecha:</span> {formatDate(orderItem.created_at)}
                      </p>
                    </div>
                    <div className="order-status">
                      <span
                        className="status-badge"
                        data-status={orderItem.status}
                      >
                        {orderItem.status}
                      </span>
                      <select
                        className="status-select"
                        value={orderItem.status}
                        onChange={(e) => updateOrderStatus(orderItem.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </div>
                  </header>
                  <div className="order-body">
                    <p className="order-meta">
                      <span>Cliente:</span> {orderItem.customer?.name}
                    </p>
                    <p className="order-meta">
                      <span>Producto:</span> {orderItem.product?.name}
                    </p>
                    <p className="order-meta">
                      <span>Cantidad:</span> {orderItem.quantity}
                    </p>
                    <p className="order-meta">
                      <span>Total estimado:</span> ${" "}
                      {formatCurrency(orderItem.product?.price * orderItem.quantity || 0)} COP
                    </p>
                    {orderItem.notes && (
                      <p className="order-notes">“{orderItem.notes}”</p>
                    )}
                  </div>
                  <div className="order-actions">
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteOrder(orderItem.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LISTADO DE PRODUCTOS */}
        <section className="products-section">
          <div className="controls-section">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="search-input"
              />
            </div>
            <div className="sort-controls">
              <label>Ordenar:</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(0);
                }}
              >
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
                <option value="categoria">Categoría</option>
              </select>
              <button
                onClick={() => {
                  setOrder(order === "asc" ? "desc" : "asc");
                  setPage(0);
                }}
              >
                {order === "asc" ? "⬆️" : "⬇️"}
              </button>
            </div>
          </div>

          <h2>Productos en Gestión ({total})</h2>

          {loading && (
            <div className="loading-text">
              <div className="loading-spinner"></div>
              <p>Cargando...</p>
            </div>
          )}

          <div className="products-grid">
            {!loading &&
              products.map((p) => (
                <div key={p.id} className="product-card">
                  <h3>{p.name}</h3>
                  <p className="product-price">
                    ${" "}
                    {formatCurrency(p.price)} COP
                  </p>
                  <div className="product-meta">
                    <div className="meta-item">
                      <span className="meta-label">Categoría:</span>
                      <span className="meta-badge">
                        {categories.find((c) => c.id === p.categoria_id)?.name ?? "N/A"}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Proveedor:</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {suppliers.find((s) => s.id === p.supplier_id)?.name ?? "N/A"}
                      </span>
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteProduct(p.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>

          {!products.length && !loading && !error && (
            <p className="loading-text">No hay productos aún.</p>
          )}

          {!loading && total > limit && (
            <div className="pagination">
              <button
                disabled={page === 0}
                onClick={() => setPage(Math.max(page - 1, 0))}
              >
                ← Anterior
              </button>
              <span>
                Página {page + 1} de {Math.ceil(total / limit)}
              </span>
              <button
                disabled={(page + 1) * limit >= total}
                onClick={() => setPage(page + 1)}
              >
                Siguiente →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
