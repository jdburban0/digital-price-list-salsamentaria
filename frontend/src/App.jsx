import { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import { getToken, removeToken, isAuthenticated } from "./utils/auth";

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
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("asc");

  // --- Formulario ---
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  // --- Obtener categorías y proveedores ---
  const fetchCategoriesAndSuppliers = async () => {
    try {
      const [categoriesRes, suppliersRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/suppliers`),
      ]);
      if (!categoriesRes.ok || !suppliersRes.ok)
        throw new Error("Error al obtener datos iniciales");

      setCategories(await categoriesRes.json());
      setSuppliers(await suppliersRes.json());
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar categorías o proveedores");
    }
  };

  // --- Obtener productos (con búsqueda, paginación y orden) ---
  // --- Obtener productos (con búsqueda, paginación y orden) ---
  const fetchData = async (query = "", offset = 0) => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/products`);
      url.searchParams.append("q", query);
      url.searchParams.append("offset", offset);
      url.searchParams.append("limit", limit);
      url.searchParams.append("sort", sort);
      url.searchParams.append("order", order);

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al obtener productos");

      const data = await res.json();

      //leemos el total directamente desde la cabecera
      const totalCount = res.headers.get("x-total-count"); // minúscula por compatibilidad
      console.log("Total recibido del backend:", totalCount);

      setTotal(parseInt(totalCount || "0"));
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // --- Cargar datos al iniciar ---
  useEffect(() => {
    fetchCategoriesAndSuppliers();
    fetchData();
  }, []);

  // --- Buscar en tiempo real ---
  useEffect(() => {
    const delay = setTimeout(() => fetchData(search, page * limit), 400);
    return () => clearTimeout(delay);
  }, [search, sort, order, page]);

  // --- Crear producto ---
  // --- Crear producto ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price.trim() || !categoryId || !supplierId) {
      setError("Por favor completa todos los campos");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);

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

      // Recargar la lista completa y el total
      await fetchData(search, page * limit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };


  // --- Eliminar producto ---
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
      // Recargar lista y total actualizados
      await fetchData(search, page * limit);
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

  // --- Login View ---
  if (!loggedIn) {
    return (
      <div className="app-container">
        {statusMessage && (
          <div className="status-overlay fade">
            <p>{statusMessage}</p>
          </div>
        )}
        <LoginForm API_URL={API_URL} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // --- Main UI ---
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
          <h1>Salsamentaría Burbano</h1>
          <p>Sistema de gestión de productos</p>
        </div>
      </header>

      <main className="main">
        {/* FORMULARIO */}
        <section className="form-section">
          <h2>Nuevo Producto</h2>
          <form onSubmit={handleSubmit}>
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

            {error && <p className="error">{error}</p>}
            {success && <p className="form-success">{success}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Agregar"}
            </button>
          </form>
        </section>

        {/* BUSCADOR */}
        <section className="search-section">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        {/* CONTROLES DE ORDEN */}
        <div className="sort-controls">
          <label>Ordenar por:</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              fetchData(search, page * limit);
            }}
          >
            <option value="name">Nombre</option>
            <option value="price">Precio</option>
            <option value="categoria">Categoría</option>
          </select>

          <button
            onClick={() => {
              const newOrder = order === "asc" ? "desc" : "asc";
              setOrder(newOrder);
              fetchData(search, page * limit);
            }}
          >
            {order === "asc" ? "⬆️ Ascendente" : "⬇️ Descendente"}
          </button>
        </div>

        {/* LISTA DE PRODUCTOS */}
        <section className="products-section">
          <h2>Productos ({total})</h2>
          {loading && <p>Cargando...</p>}
          <div className="products-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <div>
                  <h3>{p.name}</h3>
                  <p>
                    ${p.price.toLocaleString("es-CO", { minimumFractionDigits: 2 })} COP
                  </p>
                  <p className="categoria">
                    Categoría:{" "}
                    {categories.find((c) => c.id === p.categoria_id)?.name ?? p.categoria_id}
                  </p>
                  <p className="categoria">
                    Proveedor:{" "}
                    {suppliers.find((s) => s.id === p.supplier_id)?.name ?? p.supplier_id}
                  </p>
                </div>
                <button onClick={() => deleteProduct(p.id)}>✕</button>
              </div>
            ))}
            {!products.length && !loading && <p>No hay productos aún.</p>}
          </div>

          {/* PAGINACIÓN */}
          {!loading && total > limit && (
            <div className="pagination">
              <button
                disabled={page === 0}
                onClick={() => {
                  const newPage = Math.max(page - 1, 0);
                  setPage(newPage);
                  fetchData(search, newPage * limit);
                }}
              >
                ← Anterior
              </button>

              <span>
                Página {page + 1} de {Math.ceil(total / limit)}
              </span>

              <button
                disabled={(page + 1) * limit >= total}
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  fetchData(search, newPage * limit);
                }}
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

