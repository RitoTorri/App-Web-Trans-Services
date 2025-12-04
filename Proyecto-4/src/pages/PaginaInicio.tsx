import { VentasGrafica } from "../components/VentasGrafica";
import TasasDivisas from "../components/TasasDivisas";
import NavH from "../components/NavH";
import { ClientesFrecuentesGrafica } from "../components/Table/ClientesFrecuentesGrafica";
import { ProvedoresGrafica } from "../components/Table/ProvedoresGrafica";
import { CorrelacionGrafica } from "../components/CorrelacionGrafica";

function PaginaInicio() {
  return (
    <>
      <main className="min-h-screen">
        <section className="p-4">
          <NavH />
          <TasasDivisas/>
        <VentasGrafica/>
        <ClientesFrecuentesGrafica/>
        <ProvedoresGrafica/>
        <CorrelacionGrafica/>
        </section>
      </main>
    </>
  );
}

export default PaginaInicio;
