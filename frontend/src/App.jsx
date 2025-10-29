import { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import { getToken, removeToken, isAuthenticated } from "./utils/auth";
import { Link, useNavigate } from "react-router-dom";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

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
  const [limit] = useState(6);
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
  const [editingCategory, setEditingCategory] = useState(null); // Guarda {id, name}

  // --- Formulario Proveedores ---
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [editingSupplier, setEditingSupplier] = useState(null); // Guarda {id, name, phone, email}

  // --- Función para recargar TODOS los datos ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Obtener categorías y proveedores PRIMERO
      const [categoriesRes, suppliersRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/suppliers`),
      ]);
      if (!categoriesRes.ok || !suppliersRes.ok)
        throw new Error("Error al obtener datos iniciales");
      setCategories(await categoriesRes.json());
      setSuppliers(await suppliersRes.json());

      // Obtener productos 
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

  // --- Cargar datos al iniciar (SOLO SI ESTÁ LOGUEADO) ---
  useEffect(() => {
    if (loggedIn) {
      fetchAllData();
    }
  }, [loggedIn]);

  // --- Recargar datos al cambiar paginación, búsqueda u orden ---
  useEffect(() => {
    if (loggedIn) {
      fetchAllData();
    }
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
      if (!res.ok) throw new Error(errData?.detail || "Error al crear producto");

      setSuccess("Producto agregado correctamente");
      setName("");
      setPrice("");
      setCategoryId("");
      setSupplierId("");
      setPage(0); // Volver a la página 1
      await fetchAllData(); // Recargar todo
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 2000);
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

      setSuccess("🗑️ Producto eliminado");
      setPage(0); // Volver a la página 1
      await fetchAllData(); // Recargar todo
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 2000);
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
      if (!res.ok) throw new Error(errData?.detail || "Error al guardar categoría");

      setSuccess(`Categoría ${editingCategory ? 'actualizada' : 'creada'}`);
      setNewCategoryName("");
      setEditingCategory(null);
      await fetchAllData(); // Recargar todo
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("¿Eliminar esta categoría? (No se podrá si tiene productos asociados)")) return;
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

      setSuccess("Categoría eliminada");
      await fetchAllData(); // Recargar todo
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 2000);
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
        body: JSON.stringify(payload), // Usamos el payload corregido
      });

      const errData = await res.clone().json().catch(() => null);
      if (!res.ok) {
        throw new Error(errData?.detail || "Error al guardar proveedor");
      }

      setSuccess(`Proveedor ${editingSupplier ? 'actualizado' : 'creado'}`);
      setNewSupplierName("");
      setNewSupplierPhone("");
      setNewSupplierEmail("");
      setEditingSupplier(null);
      await fetchAllData(); // Recargar todo
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!confirm("¿Eliminar esta proveedor? (No se podrá si tiene productos asociados)")) return;
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

      setSuccess("🗑️ Proveedor eliminado");
      await fetchAllData(); // Recargar todo
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSuccess(null), 2000);
    }
  };


  // --- Login / Logout ---
  const handleLoginSuccess = () => {
    setStatusMessage("Iniciando sesión...");
    setTimeout(() => {
      setLoggedIn(true);
      setStatusMessage("");
    }, 2000);
  };

  const handleLogout = () => {
    setStatusMessage("Cerrando sesión...");
    setTimeout(() => {
      removeToken();
      setLoggedIn(false);
      setStatusMessage("");
    }, 2000);
  };

  // --- Vista de Login ---
  if (!loggedIn) {
    return (
      <div className="app-container">
        {statusMessage && (
          <div className="status-overlay fade">
            <p>{statusMessage}</p>
          </div>
        )}
        <LoginForm API_URL={API_URL} onLoginSuccess={handleLoginSuccess} />
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" className="public-link">Ver lista pública de productos</Link>
        </div>
      </div>
    );
  }

  // --- UI Principal (Admin) ---
  return (
    <div className="app-container">
      {statusMessage && (
        <div className="status-overlay fade">
          <p>{statusMessage}</p>
        </div>
      )}

      <header className="header">
        <div className="header-left">
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        <div className="header-center">
          <h1>Panel de Administración</h1>
          <p>Salsamentaría Burbano</p>
        </div>
        <div className="header-right" style={{ position: 'absolute', right: 0 }}>
          <Link to="/" className="public-link">Ver Lista Pública</Link>
        </div>
      </header>

      {/* Mensajes globales de error/éxito */}
      {error && <p className="error global-error">{error}</p>}
      {success && <p className="form-success global-success">{success}</p>}

      <main className="main admin-main">
        {/* --- Sección de Gestión (Categorías y Proveedores) --- */}
        <div className="management-grid">
          {/* --- Formulario Categorías --- */}
          <section className="form-section card-shadow">
            <h2>{editingCategory ? "Editando Categoría" : "Nueva Categoría"}</h2>
            <form onSubmit={handleCategorySubmit} className="simple-form">
              <input
                type="text"
                placeholder="Nombre de categoría"
                value={editingCategory ? editingCategory.name : newCategoryName}
                onChange={(e) =>
                  editingCategory
                    ? setEditingCategory({ ...editingCategory, name: e.target.value })
                    : setNewCategoryName(e.target.value)
                }
              />
              <button type="submit" disabled={loading}>
                {editingCategory ? "Actualizar" : "Crear"}
              </button>
              {editingCategory && (
                <button type="button" className="cancel-btn" onClick={() => setEditingCategory(null)}>
                  Cancelar
                </button>
              )}
            </form>
            <div className="management-list">
              {categories.map((c) => (
                <div key={c.id} className="list-item">
                  <span>{c.name}</span>
                  <div className="list-item-buttons">
                    <button className="edit-btn" onClick={() => setEditingCategory(c)}>Editar</button>
                    <button className="delete-btn small-delete" onClick={() => handleDeleteCategory(c.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- Formulario Proveedores --- */}
          <section className="form-section card-shadow">
            <h2>{editingSupplier ? "Editando Proveedor" : "Nuevo Proveedor"}</h2>
            <form onSubmit={handleSupplierSubmit} className="simple-form">
              <input
                type="text"
                placeholder="Nombre de proveedor"
                value={editingSupplier ? editingSupplier.name : newSupplierName}
                onChange={(e) =>
                  editingSupplier
                    ? setEditingSupplier({ ...editingSupplier, name: e.target.value })
                    : setNewSupplierName(e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Teléfono (opcional)"
                value={editingSupplier ? editingSupplier.phone : newSupplierPhone}
                onChange={(e) =>
                  editingSupplier
                    ? setEditingSupplier({ ...editingSupplier, phone: e.target.value })
                    : setNewSupplierPhone(e.target.value)
                }
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={editingSupplier ? editingSupplier.email : newSupplierEmail}
                onChange={(e) =>
                  editingSupplier
                    ? setEditingSupplier({ ...editingSupplier, email: e.target.value })
                    : setNewSupplierEmail(e.target.value)
                }
              />
              <button type="submit" disabled={loading}>
                {editingSupplier ? "Actualizar" : "Crear"}
              </button>
              {editingSupplier && (
                <button type="button" className="cancel-btn" onClick={() => setEditingSupplier(null)}>
                  Cancelar
                </button>
              )}
            </form>
            <div className="management-list">
              {suppliers.map((s) => (
                <div key={s.id} className="list-item">
                  <span>{s.name} <small>({s.phone || "sin teléfono"})</small></span>
                  <div className="list-item-buttons">
                    <button className="edit-btn" onClick={() => setEditingSupplier(s)}>Editar</button>
                    <button className="delete-btn small-delete" onClick={() => handleDeleteSupplier(s.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* --- Sección de Productos --- */}
        <section className="form-section card-shadow">
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
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Agregar Producto"}
            </button>
          </form>
        </section>

        <section className="products-section">
          {/* BUSCADOR Y ORDEN */}
          <div className="controls-section card-shadow">
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
            <div className="sort-controls">
              <label>Ordenar por:</label>
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
                {order === "asc" ? "⬆️ Asc" : "⬇️ Desc"}
              </button>
            </div>
          </div>

          {/* LISTA DE PRODUCTOS */}
          <h2>Productos en Gestión ({total})</h2>
          {loading && <p className="loading-text">Cargando...</p>}

          <div className="products-grid">
            {!loading && products.map((p) => (
              <div key={p.id} className="product-card card-shadow">
                <div>
                  <h3>{p.name}</h3>
                  <p className="product-price">
                    ${parseFloat(p.price).toLocaleString("es-CO", { minimumFractionDigits: 0 })} COP
                  </p>
                  <p className="categoria">
                    Cat:{" "}
                    {categories.find((c) => c.id === p.categoria_id)?.name ?? "N/A"}
                  </p>
                  <p className="categoria">
                    Prov:{" "}
                    {suppliers.find((s) => s.id === p.supplier_id)?.name ?? "N/A"}
                  </p>
                </div>
                <button className="delete-btn" onClick={() => deleteProduct(p.id)}>✕</button>
              </div>
            ))}
          </div>

          {!products.length && !loading && !error && <p className="loading-text">No hay productos aún.</p>}

          {/* PAGINACIÓN */}
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
