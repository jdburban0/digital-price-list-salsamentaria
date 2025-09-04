import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [search, setSearch] = useState('');

  // Función para obtener productos
  const fetchProducts = async (query = '') => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products?q=${query}`);
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Crear producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price) }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear producto');
      }
      const newProduct = await response.json(); // Obtener el producto creado
      setProducts([...products, newProduct]); // Agregar el nuevo producto a la lista
      setName('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    console.log("Producto creado:", newProduct);
    setProducts([...products, newProduct]);
  };

  return (
    <div className="container">
      <h1>Lista de Precios - Salsamentaria</h1>

      {/* Formulario de creación */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="0.01"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Agregar Producto'}
        </button>
      </form>

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Estados de carga y error */}
      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {/* Lista de productos */}
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;