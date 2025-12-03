import { VentasGrafica } from "../components/VentasGrafica";
import TasasDivisas from "../components/TasasDivisas";
import NavH from "../components/NavH";
import { ClientesFrecuentesGrafica } from "../components/Table/ClientesFrecuentesGrafica";

function PaginaInicio() {
  return (
    <>
      <main className="min-h-screen">
        <section className="p-4">
          <NavH />
          <TasasDivisas/>
        <VentasGrafica/>
        <ClientesFrecuentesGrafica/>
        </section>
      </main>
    </>
  );
}

export default PaginaInicio;
