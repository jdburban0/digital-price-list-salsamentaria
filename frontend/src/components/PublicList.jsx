import { useState, useEffect } from "react";
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

    // --- Paginación y orden ---
    const [page, setPage] = useState(0);
    const [limit] = useState(10); // Mostrar más en la vista pública
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState("name");
    const [order, setOrder] = useState("asc");

    // --- Obtener categorías y proveedores (necesarios para mostrar nombres) ---
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

    // --- UI Principal ---
    return (
        <div className="app-container">
            <header className="header public-header">
                <div className="header-center">
                    <h1>Salsamentaría Burbano</h1>
                    <p>Lista de Precios</p>
                </div>
            </header>

            <main className="main">
                {/* BUSCADOR Y ORDEN */}
                <section className="controls-section">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0); // Resetear página al buscar
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
                                const newOrder = order === "asc" ? "desc" : "asc";
                                setOrder(newOrder);
                                setPage(0);
                            }}
                        >
                            {order === "asc" ? "⬆️" : "⬇️"}
                        </button>
                    </div>
                </section>

                {/* LISTA DE PRODUCTOS */}
                <section className="products-section">
                    <h2>Productos ({total})</h2>
                    {error && <p className="error">{error}</p>}
                    {loading && <p className="loading-text">Cargando...</p>}

                    <div className="products-grid">
                        {!loading && products.map((p) => (
                            <div key={p.id} className="product-card public-card">
                                <h3>{p.name}</h3>
                                <p className="product-price">
                                    ${p.price.toLocaleString("es-CO", { minimumFractionDigits: 0 })} COP
                                </p>
                                <p className="categoria">
                                    Categoría:{" "}
                                    {categories.find((c) => c.id === p.categoria_id)?.name ?? "N/A"}
                                </p>
                                <p className="categoria">
                                    Proveedor:{" "}
                                    {suppliers.find((s) => s.id === p.supplier_id)?.name ?? "N/A"}
                                </p>
                            </div>
                        ))}
                    </div>

                    {!products.length && !loading && !error && (
                        <p className="loading-text">No se encontraron productos.</p>
                    )}

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

export default PublicList;