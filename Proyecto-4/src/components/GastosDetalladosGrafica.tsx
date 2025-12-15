import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useMemo } from "react";

const API_GASTOS_DETALLES =
  "http://localhost:3000/api/trans/services/reports/expenses/details";

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
    "#f44336",
    "#9c27b0",
    "#3f51b5",
    "#009688",
    "#ff9800",
    "#795548",
    "#607d8b",
  ];
  return colors[index % colors.length];
};

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString()}`;
};

const transformarDataGastos = (data: any[], nombreMes: string) => {
  const transformed: any = { mes: nombreMes };

  data.forEach((item) => {
    const key = item["Tipo de gasto"];

    const value = parseFloat(item["Total"]);

    if (key && !isNaN(value)) {
      transformed[key] = value;
    }
  });

  return [transformed];
};

const obtenerKeys = (data: any[]) => {
  if (data.length === 0) return [];
  return Object.keys(data[0]).filter((key) => key !== "mes");
};

export function GastosDetalladosGrafica() {
  const accessToken = localStorage.getItem("token");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [displayMonth, setDisplayMonth] = useState(MAPA_MESES[currentMonth]);
  const [displayYear, setDisplayYear] = useState(currentYear);

  const [gastosData, setGastosData] = useState<any[]>([]);
  const [gastosKeys, setGastosKeys] = useState<string[]>([]);

  const cargarReporte = async (year: number, month: number) => {
    const yearString = year.toString();
    const monthString = month.toString().padStart(2, "0");
    const nombreMes = MAPA_MESES[month];

    const url = `${API_GASTOS_DETALLES}/${yearString}/${monthString}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Transformar datos
        const transformed = transformarDataGastos(
          data.details || [],
          nombreMes
        );

        setGastosData(transformed);
        setGastosKeys(obtenerKeys(transformed));
      } else {
        setGastosData([]);
        setGastosKeys([]);
        console.warn("Sin datos o error:", data.message);
      }

      setDisplayMonth(nombreMes);
      setDisplayYear(year);
    } catch (error) {
      console.error("Error al cargar gastos:", error);
      setGastosData([]);
      setGastosKeys([]);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarReporte(selectedYear, selectedMonth);
  };

  useEffect(() => {
    cargarReporte(currentYear, currentMonth);
  }, []);

  return (
    <main className="pb-4 pt-2 bg-white rounded-md border border-gray-400 shadow-md">
      <section className="flex flex-col gap-4 mt-5">
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-3 w-fit ml-6">
          <form onSubmit={handleBuscar} className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filtrar gastos:
            </label>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              min="2000"
              max={currentYear}
              className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />

            <button
              type="submit"
              className="btn text-white bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-1 flex items-center"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="p-4 rounded-sm shadow-sm bg-white h-96 border border-gray-200 ml-4 mr-4">
          <h2 className="text-xl font-medium text-gray-800 mb-4 pl-4">
            Distribución de Gastos ({displayMonth} {displayYear})
          </h2>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={gastosData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />

              <YAxis
                tickFormatter={formatCurrency}
                label={{
                  value: "Monto Total ($)",
                  angle: -90,
                  position: "insideLeft",
                  offset: -5,
                }}
              />

              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend  verticalAlign="bottom" 
                height={60}/>

              {gastosKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                  fill={getBarColor(index)}
                  barSize={60}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}
