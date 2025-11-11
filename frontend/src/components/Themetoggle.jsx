import { useState, useEffect } from 'react';

function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // Actualizar color de la interfaz del navegador si esta disponible
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? 'dark light' : 'light dark');
  }, [theme]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const saved = localStorage.getItem('theme');
      if (!saved) setTheme(e.matches ? 'dark' : 'light');
    };
    if (mql && mql.addEventListener) mql.addEventListener('change', handler);
    return () => {
      if (mql && mql.removeEventListener) mql.removeEventListener('change', handler);
    };
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

export default ThemeToggle;
