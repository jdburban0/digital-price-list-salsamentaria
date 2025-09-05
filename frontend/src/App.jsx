import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoria, setCategoria] = useState(''); // Añadido
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Función para obtener productos
  const fetchProducts = async (query = '', sort = 'name', order = 'asc') => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products?q=${query}&sort=${sort}&order=${order}`
      );
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts(search, sortBy, sortOrder);
  }, []);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(search, sortBy, sortOrder);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, sortBy, sortOrder]);

  // Crear producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price: parseFloat(price),
          categoria: categoria.trim() // Añadido
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear producto');
      }

      const newProduct = await response.json();

      // Actualizar la lista localmente
      setProducts(prevProducts => [...prevProducts, newProduct]);

      // Limpiar el formulario
      setName('');
      setPrice('');
      setCategoria(''); // Añadido

      // Mostrar mensaje de éxito
      setTimeout(() => {
        setError(null);
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (newSort) => {
    if (newSort === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSort);
      setSortOrder('asc');
    }
  };

  // Función para eliminar producto
  const deleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (err) {
      setError('Error al eliminar producto');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">Salsamentaría Burbano</h1>
          <p className="subtitle">Sistema de gestión de productos</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Form Section */}
        <section className="form-section">
          <div className="form-header">
            <h2>Nuevo Producto</h2>
          </div>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                placeholder="Ingresa el nombre del producto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio (COP)</label>
              <input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoría</label>
              <input
                type="text"
                placeholder="Ej. Lácteos, Embutidos"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <span className="loading-spinner">Guardando...</span>
              ) : (
                <span>Agregar</span>
              )}
            </button>
          </form>
        </section>

        {/* Search and Controls */}
        <section className="controls-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="sort-controls">
            <button
              onClick={() => handleSortChange('name')}
              className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
            >
              Nombre {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('price')}
              className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
            >
              Precio {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        {/* Products List */}
        <section className="products-section">
          <div className="section-header">
            <h2>Productos</h2>
            <span className="product-count">
              {products.length} {products.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>

          {loading && !products.length ? (
            <div className="loading-state">
              <div className="loading-spinner-large">⏳</div>
              <p>Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No hay productos</h3>
              <p>
                {search
                  ? `No se encontraron productos que coincidan con "${search}"`
                  : 'Agrega tu primer producto usando el formulario anterior'}
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">
                      ${product.price.toLocaleString('es-CO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} COP
                    </p>
                    <p className="product-categoria">Categoría: {product.categoria}</p> {/* Añadido */}
                  </div>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="delete-btn"
                    title="Eliminar producto"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;