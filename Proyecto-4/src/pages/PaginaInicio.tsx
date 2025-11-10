import { VentasGrafica } from "../components/VentasGrafica";
import TasasDivisas from "../components/TasasDivisas";
import NavH from "../components/NavH";

function PaginaInicio() {
  return (
    <>
      <main className="min-h-screen">
        <section className="p-4">
          <NavH />
          <TasasDivisas/>
        <VentasGrafica/>
        </section>
      </main>
    </>
  );
}

export default PaginaInicio;
