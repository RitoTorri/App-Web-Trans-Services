import { VentasGrafica } from "../components/VentasGrafica";
import { ClientesFrecuentesGrafica } from "../components/ClientesFrecuentesGrafica";
import { ProvedoresGrafica } from "../components/ProvedoresGrafica";


function Reportes() {
    return(
        <>
        <main className="min-h-screen">
            <section className="pr-4 pl-4 pt-5 flex flex-col gap-6">
                <VentasGrafica/>
                <ProvedoresGrafica/>
                <ClientesFrecuentesGrafica/>
            </section>
        </main>
        </>
    )
}

export default Reportes;