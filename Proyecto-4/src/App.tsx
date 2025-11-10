import { BrowserRouter, Route, Routes } from "react-router-dom";
import PaginaInicio from "./pages/PaginaInicio";
import InicioSesion from "./pages/InicioSesion";
import Empleados from "./pages/Empleados";
import Servicios from "./pages/Servicios";
import Cuentas from "./pages/Cuentas";
import Proveedores from "./pages/Proveedores";
import Clientes from "./pages/Clientes";
import Nominas from "./pages/Nominas";
import Vehiculos from "./pages/Vehiculos";
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
          <Route path="/cuentas" element={<Cuentas />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/nominas" element={<Nominas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
