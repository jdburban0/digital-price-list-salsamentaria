import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function PublicList() {
    const API_URL = import.meta.env.VITE_API_URL;

    // --- Estados ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    // --- Paginación y orden ---
    const [page, setPage] = useState(0);
    const [limit] = useState(12);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState("name");
    const [order, setOrder] = useState("asc");

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

    // --- Obtener productos ---
    const fetchData = async (query = "", offset = 0) => {
        try {
            setLoading(true);
            setError(null);
            const url = new URL(`${API_URL}/products`);
            url.searchParams.append("q", query);
            url.searchParams.append("offset", offset);
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

    // --- Filtrar por categoría ---
    const filteredProducts = selectedCategory
        ? products.filter((p) => p.categoria_id === parseInt(selectedCategory))
        : products;

    // --- UI Principal ---
    return (
        <div className="app-container public-container">
            {/* HEADER */}
            <header className="header">
                <div className="header-left" style={{ position: 'absolute', left: '2rem' }}>
                    <Link to="/admin" className="public-link">
                        Admin
                    </Link>
                </div>
                <div className="header-center">
                    <h1>Salsamentaría Burbano</h1>
                    <p className="subtitle">
                        Lista de Precios Actualizada
                    </p>
                </div>
            </header>

            {/* BUSCADOR Y FILTROS */}
            <section className="controls-section">
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
                        style={{ paddingLeft: '1rem' }}
                    />
                </div>

                <div className="sort-controls">
                    <label>Categoría:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="">Todas</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
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
            </section>

            {/* ESTADÍSTICAS RÁPIDAS */}
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

            {/* LISTA DE PRODUCTOS */}
            <section className="products-section">
                <h2>
                    Catálogo de Productos
                    {selectedCategory && (
                        <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--gray-600)' }}>
                            {" "}— {categories.find((c) => c.id === parseInt(selectedCategory))?.name}
                        </span>
                    )}
                </h2>

                {error && (
                    <div className="error global-error">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="loading-text">
                        <div className="loading-spinner"></div>
                        <p>Cargando productos...</p>
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && !error && (
                    <div className="loading-text">
                        <p>No se encontraron productos.</p>
                    </div>
                )}

                <div className="products-grid">
                    {!loading &&
                        filteredProducts.map((p) => (
                            <div key={p.id} className="product-card">
                                <h3>{p.name}</h3>
                                <p className="product-price">
                                    ${p.price.toLocaleString("es-CO", {
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
                                        <span style={{ color: 'var(--gray-600)' }}>
                                            {suppliers.find((s) => s.id === p.supplier_id)
                                                ?.name ?? "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

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

            {/* FOOTER */}
            <footer style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'white',
                marginTop: '2rem'
            }}>
                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    © 2025 Salsamentaría Burbano — Proyecto Universitario
                </p>
            </footer>
        </div>
    );
}

export default PublicList;