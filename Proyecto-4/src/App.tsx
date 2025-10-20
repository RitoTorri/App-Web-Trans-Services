import { Route, Routes } from "react-router-dom";
import PaginaInicio from "./pages/PaginaInicio";
import InicioSesion from "./pages/InicioSesion";


function App(){
    return(
        <Routes>
            <Route path="/" element={<InicioSesion/>}/>
            <Route path="/paginainicio" element={<PaginaInicio/>}/>
        </Routes>
    )
}

export default App;
