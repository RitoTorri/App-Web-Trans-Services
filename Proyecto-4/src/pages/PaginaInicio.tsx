import { VentasGrafica } from "../components/VentasGrafica";
import TasasDivisas from "../components/TasasDivisas";

function PaginaInicio() {
  return (
    <>
      <main className="min-h-screen">
        <section className="p-4">
          <TasasDivisas />
          <VentasGrafica />
        </section>
      </main>
    </>
  );
}

export default PaginaInicio;
