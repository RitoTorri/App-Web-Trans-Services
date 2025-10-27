import { Link } from "react-router-dom";

function SideBar() {
  return (
    <>
      <aside className="min-w-64  flex-none bg-gray-800 text-white p-4 space-y-4 h-screen shadow-xs flex flex-col">
        <Link
          to="/paginainicio"
          className="text-2xl font-bold text-center p-5 border-b-2"
        >
          Trans Services
        </Link>
        <nav className="flex flex-col space-y-4">
          <Link to="/empleados" className="hover:bg-gray-700 px-3 py-2 rounded">
            Empleados
          </Link>
          <Link to="/clientes" className="hover:bg-gray-700 px-3 py-2 rounded">
            Clientes
          </Link>
          <Link to="/servicios" className="hover:bg-gray-700 px-3 py-2 rounded">
            Servicios Prestados
          </Link>
          <Link to="/cuentas" className="hover:bg-gray-700 px-3 py-2 rounded">
            Cuentas Pendientes
          </Link>
          <Link
            to="/proveedores"
            className="hover:bg-gray-700 px-3 py-2 rounded"
          >
            Provedores
          </Link>
        </nav>

        <div className="mt-auto">
          <Link to="/" className="hover:bg-gray-700 px-3 py-2 rounded block">
            Cerrar Sesión
          </Link>
        </div>
      </aside>
    </>
  );
}

export default SideBar;
