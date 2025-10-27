import { Route, Routes } from "react-router-dom";
import PaginaInicio from "./pages/PaginaInicio";
import InicioSesion from "./pages/InicioSesion";
import Empleados from "./pages/Empleados";
import Servicios from "./pages/Servicios";
import Cuentas from "./pages/Cuentas";
import Provedores from "./pages/Proveedores";
import Clientes from "./pages/Clientes";

function App(){
    return(
        <Routes>
            <Route path="/" element={<InicioSesion/>}/>
            <Route path="/paginainicio" element={<PaginaInicio/>}/>
            <Route path="/empleados" element={<Empleados/>}/>
            <Route path="/servicios" element={<Servicios/>}/>
            <Route path="/cuentas" element={<Cuentas/>}/>
            <Route path="/proveedores" element={<Provedores/>}/>
            <Route path="/clientes" element={<Clientes/>}/>
        </Routes>
    )
}

export default App;
