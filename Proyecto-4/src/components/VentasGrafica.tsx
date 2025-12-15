import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiGananciasAnual, apiGastosAnual } from "../services/apiReportes";
import React, { useEffect, useState } from "react";

// Interfaces
interface APIData {
  Fecha: string;
  "Ganancia Mensual"?: string;
  "Gasto Mensual"?: string;
}

interface VentaData {
  mes: string;
  ventas: number;
  gastos: number;
}

const Meses: { [key: number]: string } = {
  1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun",
  7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic",
};

export function VentasGrafica() {
  const accessToken = localStorage.getItem("token");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Estados para la Gráfica
  const [datosPrimerSemestre, setDatosPrimerSemestre] = useState<VentaData[]>([]);
  const [datosSegundoSemestre, setDatosSegundoSemestre] = useState<VentaData[]>([]);
  
  // Estados para Exportar PDF
  const [pdfYear, setPdfYear] = useState<number>(currentYear);
  const [pdfMonth, setPdfMonth] = useState<number>(currentMonth);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);

  // --- Lógica de Gráficas (Existente) ---
  const unificarDatosAnuales = (ganancias: APIData[], gastos: APIData[]): VentaData[] => {
    const dataMap = new Map<number, { ventas: number; gastos: number }>();
    for (let i = 1; i <= 12; i++) {
      dataMap.set(i, { ventas: 0, gastos: 0 });
    }

    ganancias.forEach((item) => {
      const mesNumero = parseInt(item.Fecha.split("-")[1]);
      const ganancia = parseFloat(item["Ganancia Mensual"] || "0");
      if (mesNumero >= 1 && mesNumero <= 12) dataMap.get(mesNumero)!.ventas = ganancia;
    });

    gastos.forEach((item) => {
      const mesNumero = parseInt(item.Fecha.split("-")[1]);
      const gasto = parseFloat(item["Gasto Mensual"] || "0");
      if (mesNumero >= 1 && mesNumero <= 12) dataMap.get(mesNumero)!.gastos = gasto;
    });

    return Array.from(dataMap.entries()).map(([mesNub, data]) => ({
      mes: Meses[mesNub],
      ventas: data.ventas,
      gastos: data.gastos,
    }));
  };

  const reporteGanaciasYGastos = async (busqueda = "") => {
    let yearToFetch = currentYear;
    if (busqueda && busqueda.trim() !== "") {
      yearToFetch = parseInt(busqueda.trim());
    }
    const yearString = encodeURIComponent(yearToFetch.toString());
    const urlGanancias = `${apiGananciasAnual}${yearString}`;
    const urlGastos = `${apiGastosAnual}${yearString}`;

    try {
      const [responseGanancias, responseGastos] = await Promise.all([
        fetch(urlGanancias, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(urlGastos, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);

      const datosGanancias = await responseGanancias.json();
      const datosGastos = await responseGastos.json();

      if (responseGanancias.ok && responseGastos.ok) {
        const datosUnificados = unificarDatosAnuales(
          datosGanancias.details || [],
          datosGastos.details || []
        );
        setDatosPrimerSemestre(datosUnificados.slice(0, 6));
        setDatosSegundoSemestre(datosUnificados.slice(6, 12));
      } else {
        console.error("Error datos:", datosGanancias.message || datosGastos.message);
      }
    } catch (error) {
      console.error("Error del servidor:", error);
    }
  };

  useEffect(() => {
    reporteGanaciasYGastos();
  }, []);

  const handleBuscarGrafica = (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input[type="number"]') as HTMLInputElement;
    if (input) reporteGanaciasYGastos(input.value);
  };

  // --- Lógica Nueva: Exportar PDF ---

  const descargarPDF = async (tipo: 'revenue' | 'expenses') => {
    if (!accessToken) {
      console.error("Token no encontrado");
      return;
    }

    setLoadingPdf(true);
    // Construcción de la URL basada en tu requerimiento
    // Nota: Asegúrate de que http://localhost:3000 sea correcto o usa una variable de entorno
    const baseUrl = "http://localhost:3000/api/trans/services/reports";
    const url = `${baseUrl}/${tipo}/pdf/${pdfYear}/${pdfMonth}`;
    const nombreArchivo = `Reporte_${tipo === 'revenue' ? 'Ganancias' : 'Gastos'}_${pdfMonth}_${pdfYear}.pdf`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error(`Error al descargar el reporte de ${tipo}`);
      }

      const blob = await response.blob();
      
      const urlBlob = window.URL.createObjectURL(blob);
      
          
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = "Reporte.pdf"
      
      document.body.appendChild(a)
      a.click()
      a.remove

      window.URL.revokeObjectURL(urlBlob)

      console.log("Reporte descargado.")

    } catch (error) {
      console.error("Error exportando PDF:", error);
      alert("Hubo un error al descargar el reporte PDF.");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-3 p-2 border border-gray-400 bg-white rounded-md shadow-sm justify-between">
          <div className="flex gap-2 items-center">
          <span className="text-sm font-bold text-gray-700 mr-2">Exportar:</span>
          <select 
            value={pdfMonth} 
            onChange={(e) => setPdfMonth(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.entries(Meses).map(([key, nombre]) => (
              <option key={key} value={key}>{nombre}</option>
            ))}
          </select>

          <input
            type="number"
            min="2000"
            max={currentYear + 1}
            value={pdfYear}
            onChange={(e) => setPdfYear(parseInt(e.target.value))}
            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          </div>
          <div className="flex gap-2 pl-2 \">
            <button 
              onClick={() => descargarPDF('revenue')}
              disabled={loadingPdf}
              className="text-green-600 hover:text-green-700 border border-green-600 hover:bg-green-50 rounded-md flex items-center px-3 py-1 transition-colors disabled:opacity-50"
              title="Descargar Reporte de Ganancias"
            >
               <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-filetype-pdf"
              viewBox="0 0 16 16"
            >
                
              <path
                fill-rule="evenodd"
                d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.6 11.85H0v3.999h.791v-1.342h.803q.43 0 .732-.173.305-.175.463-.474a1.4 1.4 0 0 0 .161-.677q0-.375-.158-.677a1.2 1.2 0 0 0-.46-.477q-.3-.18-.732-.179m.545 1.333a.8.8 0 0 1-.085.38.57.57 0 0 1-.238.241.8.8 0 0 1-.375.082H.788V12.48h.66q.327 0 .512.181.185.183.185.522m1.217-1.333v3.999h1.46q.602 0 .998-.237a1.45 1.45 0 0 0 .595-.689q.196-.45.196-1.084 0-.63-.196-1.075a1.43 1.43 0 0 0-.589-.68q-.396-.234-1.005-.234zm.791.645h.563q.371 0 .609.152a.9.9 0 0 1 .354.454q.118.302.118.753a2.3 2.3 0 0 1-.068.592 1.1 1.1 0 0 1-.196.422.8.8 0 0 1-.334.252 1.3 1.3 0 0 1-.483.082h-.563zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638z"
              />
            </svg>
              Ganancias
            </button>

            <button 
              onClick={() => descargarPDF('expenses')}
              disabled={loadingPdf}
              className="text-red-500 hover:text-red-600 border border-red-500 hover:bg-red-50 rounded-md flex items-center px-3 py-1 transition-colors disabled:opacity-50"
              title="Descargar Reporte de Gastos"
            >
               <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-filetype-pdf"
              viewBox="0 0 16 16"
            >
                
              <path
                fill-rule="evenodd"
                d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM1.6 11.85H0v3.999h.791v-1.342h.803q.43 0 .732-.173.305-.175.463-.474a1.4 1.4 0 0 0 .161-.677q0-.375-.158-.677a1.2 1.2 0 0 0-.46-.477q-.3-.18-.732-.179m.545 1.333a.8.8 0 0 1-.085.38.57.57 0 0 1-.238.241.8.8 0 0 1-.375.082H.788V12.48h.66q.327 0 .512.181.185.183.185.522m1.217-1.333v3.999h1.46q.602 0 .998-.237a1.45 1.45 0 0 0 .595-.689q.196-.45.196-1.084 0-.63-.196-1.075a1.43 1.43 0 0 0-.589-.68q-.396-.234-1.005-.234zm.791.645h.563q.371 0 .609.152a.9.9 0 0 1 .354.454q.118.302.118.753a2.3 2.3 0 0 1-.068.592 1.1 1.1 0 0 1-.196.422.8.8 0 0 1-.334.252 1.3 1.3 0 0 1-.483.082h-.563zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638z"
              />
            </svg>
              Gastos
            </button>
          </div>
        </div>
    
    <section className="pb-2 pt-2 bg-white rounded-md border border-gray-400 shadow-md">
      
      <div className="flex flex-col lg:flex-row items-center justify-between p-4 gap-4">
        
        <form
          onSubmit={handleBuscarGrafica}
          className="flex items-center gap-3 p-2 border border-gray-200 bg-gray-50 rounded-sm shadow-sm"
        >
          <label htmlFor="year-input-chart" className="text-sm font-medium text-gray-700">
            Gráfica Año:
          </label>
          <input
            id="year-input-chart"
            type="number"
            min="2000"
            max={currentYear + 1}
            defaultValue={currentYear}
            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="btn text-white bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-1 text-sm"
            type="submit"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-4 m-4 justify-between">
        <div className="p-5 rounded-sm shadow-sm bg-white h-90 w-full md:w-2/4 border border-gray-200">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Primer Semestre (Ene-Jun)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={datosPrimerSemestre}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#059669" name="Ventas ($)" />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-sm shadow-sm bg-white h-90 w-full md:w-2/4 border border-gray-200">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Segundo Semestre (Jul-Dic)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={datosSegundoSemestre}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#059669" name="Ventas ($)" />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
    </main>
  );
}
