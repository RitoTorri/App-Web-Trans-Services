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
import { apiProveedores } from "../services/apiReportes"; 
import React, { useEffect, useState, useMemo } from "react";

// --- Constantes y Helpers (Sin cambios) ---
const MAPA_MESES: { [key: number]: string } = {
  1: "Enero",
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  10: "Octubre",
  11: "Noviembre",
  12: "Diciembre",
};

const getBarColor = (index: number) => {
  const colors = [
    "#e91e63",
    "#00bcd4",
    "#ff9800",
    "#4caf50",
    "#3f51b5",
    "#ffc107",
    "#9c27b0",
  ];
  return colors[index % colors.length];
};

const formatToInteger = (tickValue: number): string =>
  Math.round(tickValue).toString();

const transformarDataProveedores = (data: any[], mes: string) => {
  const transformed: any = { mes: mes };
  data.forEach((item) => {
    const key = item["Nombre de proveedor"];
    const value = item["Cantidad de compras realizadas"];
    if (key) transformed[key] = value;
  });
  return [transformed];
};

const obtenerKeys = (data: any[]) => {
  if (data.length === 0) return [];
  return Object.keys(data[0]).filter((key) => key !== "mes");
};

const calcularMaximo = (data: any[], keys: string[]): number => {
  if (data.length === 0 || keys.length === 0) return 0;
  let max = 0;
  const dataObject = data[0];
  keys.forEach((key) => {
    const value = dataObject[key];
    if (typeof value === "number" && value > max) max = value;
  });
  return max;
};

export function ProvedoresGrafica() {
  const accessToken = localStorage.getItem("token");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Estados de Filtros
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Estados de Visualización
  const [displayMonth, setDisplayMonth] = useState(MAPA_MESES[currentMonth]);
  const [displayYear, setDisplayYear] = useState(currentYear);
  const [proveedoresData, setProveedoresData] = useState<any[]>([]);
  const [proveedoresKeys, setProveedoresKeys] = useState<string[]>([]);

  // Estado para carga del PDF
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);

  const maxVal = useMemo(
    () => calcularMaximo(proveedoresData, proveedoresKeys),
    [proveedoresData, proveedoresKeys]
  );

  const yTicks = useMemo(() => {
    if (maxVal <= 0) return [0, 1];
    return Array.from({ length: maxVal + 1 }, (_, i) => i);
  }, [maxVal]);

  const cargarReporte = async (year: number, month: number) => {
    const yearString = year.toString();
    const monthString = month.toString().padStart(2, "0");
    const nombreMes = MAPA_MESES[month];
    const url = `${apiProveedores}${yearString}/${monthString}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const transformed = transformarDataProveedores(
          data.details || [],
          nombreMes
        );
        setProveedoresData(transformed);
        setProveedoresKeys(obtenerKeys(transformed));
      } else {
        setProveedoresData([]);
        setProveedoresKeys([]);
        console.error("Error o sin datos: ", data.details);
      }
      setDisplayMonth(nombreMes);
      setDisplayYear(year);
    } catch (error) {
      console.error("Error del servidor: ", error);
      setProveedoresData([]);
    }
  };

  // --- Nueva Función: Exportar PDF ---
  const exportarPDF = async () => {
    if (!accessToken) {
      console.error("Token no encontrado");
      return;
    }

    setLoadingPdf(true);
    const url =
      "http://localhost:3000/api/trans/services/reports/debt/providers/pdf";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error("Error al descargar el PDF");
      }

      // Convertir a Blob y descargar
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute(
        "download",
        `Reporte_Deuda_Proveedores_${new Date().toISOString().slice(0, 10)}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      // Limpieza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Error exportando PDF:", error);
      alert("No se pudo descargar el reporte PDF.");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarReporte(selectedYear, selectedMonth);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 2000 && value <= currentYear) setSelectedYear(value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  useEffect(() => {
    cargarReporte(currentYear, currentMonth);
  }, []);

  return (
    <main className="flex flex-col gap-4">
      <div className="bg-white rounded-md shadow-sm  p-2 border border-gray-400 flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-gray-700 mr-2">
            Exportar Lista de Proveedores a los que se les Adeuda:
          </span>
        </div>
        <div>
          <button
            onClick={exportarPDF}
            disabled={loadingPdf}
            className={`
              " cursor-pointer hover:text-red-600 border text-red-500 border-red-500 hover:bg-red-50 rounded-md flex items-center px-3 py-1 transition-colors disabled:opacity-50
              ${
                loadingPdf
                  ? "opacity-50 cursor-not-allowed bg-gray-50"
                  : "hover:bg-red-50 hover:text-red-600 bg-white"
              }
            `}
            title="Descargar reporte general de deuda con proveedores"
          >
            {loadingPdf ? (
              <span className="flex items-center px-3 justify-center">
                <span className="loading loading-spinner loading-md"></span>
              </span>
            ) : (
              <>
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
                Deuda
              </>
            )}
          </button>
        </div>
      </div>
      <section className="flex flex-col gap-4 mt-1">
        <div className="pb-4 pt-4  bg-white rounded-md border border-gray-400 shadow-md">
          <div className="flex flex-wrap items-center gap-4 ml-6">
            <div className="flex flex-col lg:flex-row items-center justify-between p-2 gap-4">
              <form
                onSubmit={handleBuscar}
                className="flex items-center mb-2 gap-3 p-2 border border-gray-200 bg-gray-50 rounded-sm shadow-sm"
              >
                <label
                  htmlFor="month-select"
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  Filtrar por:
                </label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {Object.entries(MAPA_MESES).map(([num, name]) => (
                    <option key={num} value={num}>
                      {name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={handleYearChange}
                  min="2000"
                  max={currentYear}
                  className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  className="btn text-white bg-blue-500 hover:bg-blue-600 rounded-md flex items-center px-3 py-1"
                  type="submit"
                >
                  Buscar
                </button>
              </form>
            </div>
          </div>

          {/* Gráfica */}
          <div className="p-4 rounded-sm shadow-sm bg-white h-96 border border-gray-200 ml-4 mr-4">
            <h2 className="text-xl font-medium text-gray-800 mb-4 pl-4">
              Proveedores con mayor frecuencia de compra ({displayMonth}{" "}
              {displayYear})
            </h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={proveedoresData}
                margin={{ top: 5, right: 50, left: 20, bottom: 40 }}
                barGap={20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis
                  ticks={yTicks}
                  tickFormatter={formatToInteger}
                  label={{
                    value: "No. Compras",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                {proveedoresKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key}
                    fill={getBarColor(index)}
                    barSize={60}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </main>
  );
}
