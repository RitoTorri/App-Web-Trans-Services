// src/components/Layout.jsx

import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";// Asegúrate de que la ruta a tu SideBar sea correcta

function Layout() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* 1. La barra lateral es fija y siempre visible */}
      <SideBar />

      {/* 2. El contenido principal tiene un margen a la izquierda para no quedar debajo del sidebar */}
      {/* El <Outlet> renderizará aquí el componente de la ruta actual (Empleados, Clientes, etc.) */}
      <main className="flex-1 ml-68">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;