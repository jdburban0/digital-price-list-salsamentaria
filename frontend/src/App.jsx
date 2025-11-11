import { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import ThemeToggle from "./components/Themetoggle";
import { getToken, removeToken, isAuthenticated } from "./utils/auth";
import { Link } from "react-router-dom";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  // --- Estados principales ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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

  // --- Estado para tabs de gestión ---
  const [activeTab, setActiveTab] = useState('categories');

  // --- Función para recargar TODOS los datos ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, suppliersRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/suppliers`),
      ]);
      if (!categoriesRes.ok || !suppliersRes.ok)
        throw new Error("Error al obtener datos iniciales");
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
  }, [search, sort, order, page, loggedIn]);

  // Auto-ocultar errores globales después de unos segundos
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  // Auto-ocultar éxitos globales después de unos segundos
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [success]);

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
    const name = editingCategory ? editingCategory.name : newCategoryName;
    if (!name.trim()) {
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
        body: JSON.stringify({ name: name.trim() }),
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
    const name = editingSupplier ? editingSupplier.name : newSupplierName;
    const phone = editingSupplier ? editingSupplier.phone : newSupplierPhone;
    const email = editingSupplier ? editingSupplier.email : newSupplierEmail;

    if (!name.trim()) {
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
      name: name.trim(),
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
        <div className="header-left" style={{ position: 'absolute', left: '2rem' }}>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        <div className="header-center">
          <h1>Panel de Administración</h1>
          <p className="subtitle">Salsamentaría Burbano</p>
        </div>
        <div className="header-right" style={{ position: 'absolute', right: '2rem' }}>
          <Link to="/" className="public-link">
            Ver Lista Pública
          </Link>
        </div>
      </header>

      {/* Mensajes globales */}
      {error && (
        <div
          className="popup-overlay"
          role="alertdialog"
          aria-live="assertive"
          onClick={() => setError(null)}
        >
          <div className="popup popup-error" onClick={(e) => e.stopPropagation()}>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div
          className="popup-overlay"
          role="status"
          aria-live="polite"
          onClick={() => setSuccess(null)}
        >
          <div className="popup popup-success" onClick={(e) => e.stopPropagation()}>
            <h3>Éxito</h3>
            <p>{success}</p>
          </div>
        </div>
      )}

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
      </div>

      <main>
        {/* GESTIÓN: Categorías y Proveedores con tabs */}
        <section className="form-section">
          <h2>Gestión de Catálogo</h2>

          {/* Tabs para alternar entre Categorías y Proveedores */}
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              Categorías
            </button>
            <button
              className={`tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}
              onClick={() => setActiveTab('suppliers')}
            >
              Proveedores
            </button>
          </div>

          {/* Contenido de Categorías */}
          {activeTab === 'categories' && (
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

          {/* Contenido de Proveedores */}
          {activeTab === 'suppliers' && (
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
                        placeholder="Email (opcional)"
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
                  <h3>Proveedores Existentes ({suppliers.length})</h3>
                  <div className="management-list">
                    {suppliers.map((s) => (
                      <div key={s.id} className="list-item">
                        <div className="list-item-content">
                          <span className="list-item-name">{s.name}</span>
                          <span className="list-item-detail">
                            {s.phone || "Sin teléfono"} {s.email && `• ${s.email}`}
                          </span>
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
                      <p className="empty-message">No hay proveedores creados</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* NUEVO PRODUCTO */}
        <section className="form-section">
          <h2>Nuevo Producto</h2>
          <form onSubmit={handleProductSubmit}>
            <input
              type="text"
              placeholder="Nombre del producto"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Precio (COP)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Seleccionar proveedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Agregar Producto"}
            </button>
          </form>
        </section>

        {/* LISTADO DE PRODUCTOS */}
        <section className="products-section">
          {/* Búsqueda y orden */}
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
                    $
                    {parseFloat(p.price).toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}{" "}
                    COP
                  </p>
                  <div className="product-meta">
                    <div className="meta-item">
                      <span className="meta-label">Categoría:</span>
                      <span className="meta-badge">
                        {categories.find((c) => c.id === p.categoria_id)
                          ?.name ?? "N/A"}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Proveedor:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {suppliers.find((s) => s.id === p.supplier_id)
                          ?.name ?? "N/A"}
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

          {/* Paginación */}
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
