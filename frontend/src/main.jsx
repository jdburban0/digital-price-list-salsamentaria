import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import PublicList from './components/PublicList.jsx';
import './index.css'

// Definimos las rutas
const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicList />,
  },
  {
    path: "/admin",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)