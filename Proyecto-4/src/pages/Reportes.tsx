import { VentasGrafica } from "../components/VentasGrafica";
import { ClientesFrecuentesGrafica } from "../components/ClientesFrecuentesGrafica";
import { ProvedoresGrafica } from "../components/ProvedoresGrafica";
import { GastosDetalladosGrafica } from "../components/GastosDetalladosGrafica";
import { useState } from "react";

type TabOption = "ventas" | "gastos" | "proveedores" | "clientes";

function Reportes() {
    const [activeTab, setActiveTab] = useState<TabOption>("ventas");

    const renderContent = () => {
        switch (activeTab) {
            case "ventas":
                return <VentasGrafica />;
            case "gastos":
                return <GastosDetalladosGrafica />;
            case "proveedores":
                return <ProvedoresGrafica />;
            case "clientes":
                return <ClientesFrecuentesGrafica />;
            default:
                return <VentasGrafica />;
        }
    };

    return (
        <main className="min-h-screen">
            <section className="pr-1 pl-1 pt-5 flex flex-col gap-6 max-w-7xl mx-auto">
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-400 p-2">
                    <nav className="flex space-x-1" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab("ventas")}
                            className={`
                                flex-1 py-2.5 px-3 text-center rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                                ${activeTab === "ventas" 
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" 
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
                            `}
                        >
                            Ventas y Gastos
                        </button>

                        <button
                            onClick={() => setActiveTab("gastos")}
                            className={`
                                flex-1 py-2.5 px-3 text-center rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                                ${activeTab === "gastos" 
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" 
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
                            `}
                        >
                            Gastos Detallados
                        </button>

                        <button
                            onClick={() => setActiveTab("proveedores")}
                            className={`
                                flex-1 py-2.5 px-3 text-center rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                                ${activeTab === "proveedores" 
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" 
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
                            `}
                        >
                            Proveedores
                        </button>

                        <button
                            onClick={() => setActiveTab("clientes")}
                            className={`
                                flex-1 py-2.5 px-3 text-center rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                                ${activeTab === "clientes" 
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" 
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
                            `}
                        >
                            Clientes y Conductores
                        </button>
                    </nav>
                </div>

                <div className="transition-all ease-in-out duration-300">
                    {renderContent()}
                </div>

            </section>
        </main>
    );
}

export default Reportes;