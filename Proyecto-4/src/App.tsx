import { BrowserRouter, Route, Routes } from "react-router-dom";
import PaginaInicio from "./pages/PaginaInicio";
import InicioSesion from "./pages/InicioSesion";
import Empleados from "./pages/Empleados";
import Servicios from "./pages/Servicios";
import Compras from "./pages/Compras";
import Proveedores from "./pages/Proveedores";
import Clientes from "./pages/Clientes";
import Nominas from "./pages/Nominas";
import Vehiculos from "./pages/Vehiculos";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";
import ProtectedRoute from "./Routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioSesion />} />
        <Route path="/login" element={<InicioSesion />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/paginainicio" element={<PaginaInicio />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/cuentas" element={<Compras />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/nominas" element={<Nominas />} />
          <Route path="/reportes" element={<Reportes/>}/>
        </Route>
        <Route element={<ProtectedRoute requiredRol="SuperUsuario" />}>  
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
