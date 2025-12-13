
import TasasDivisas from "../components/TasasDivisas";
import NavH from "../components/NavH";


function PaginaInicio() {
  return (
    <>
      <main className="min-h-screen">
        <section className="p-4">
          <NavH />
          <TasasDivisas/>
        
        </section>
      </main>
    </>
  );
}

export default PaginaInicio;
