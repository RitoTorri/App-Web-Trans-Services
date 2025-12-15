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

import { apiClientesFrecuentes, apiEmpleados } from "../services/apiReportes";
import React, { useEffect, useState, useMemo } from "react";

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
    "#4caf50",
    "#3f51b5",
    "#ffc107",
    "#007ACC",
    "#FF9800",
    "#E91E63",
    "#00BCD4",
  ];
  return colors[index % colors.length];
};

const transformarData = (
  data: any[],
  mes: string,
  keyName: string,
  valueName: string
) => {
  const transformed: any = { mes: mes };

  data.forEach((item) => {
    const key = item[keyName];
    const value = item[valueName];
    transformed[key] = value;
  });

  return [transformed];
};

const obtenerKeys = (data: any[]) => {
  if (data.length === 0) return [];

  return Object.keys(data[0]).filter((key) => key !== "mes");
};

const formatToInteger = (tickValue: number): string => {
  return Math.round(tickValue).toString();
};

const calcularMaximoServicios = (data: any[], keys: string[]): number => {
  if (data.length === 0 || keys.length === 0) return 0;

  let max = 0;

  const dataObject = data[0];

  keys.forEach((key) => {
    const value = dataObject[key];
    if (typeof value === "number" && value > max) {
      max = value;
    }
  });
  return max;
};
export function ClientesFrecuentesGrafica() {
  const accessToken = localStorage.getItem("token");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectesMonth, setSelectedMonth] = useState(currentMonth);

  const [displayMonth, setDisplayMonth] = useState(MAPA_MESES[currentMonth]);
  const [displayYear, setDisplayYear] = useState(currentYear);

  const [clientesData, setClientesData] = useState<any[]>([]);
  const [empleadosData, setEmpleadosData] = useState<any[]>([]);
  const [clientesKeys, setClientesKeys] = useState<any[]>([]);
  const [empleadosKeys, setEmpleadosKeys] = useState<any[]>([]);

  const maxClientesValue = useMemo(
    () => calcularMaximoServicios(clientesData, clientesKeys),
    [clientesData, clientesKeys]
  );

  const maxEmpleadosValue = useMemo(
    () => calcularMaximoServicios(empleadosData, empleadosKeys),
    [empleadosData, empleadosKeys]
  );

  const clientesTicks = useMemo(() => {
    if (maxClientesValue <= 0) return [0, 1];
    return Array.from({ length: maxClientesValue + 1 }, (_, i) => i);
  }, [maxClientesValue]);

  const empleadosTicks = useMemo(() => {
    if (maxEmpleadosValue <= 0) return [0, 1];
    return Array.from({ length: maxEmpleadosValue + 1 }, (_, i) => i);
  }, [maxEmpleadosValue]);

  const cargarReportes = async (year: number, month: number) => {
    const yearString = year.toString();

    const monthString = month.toString().padStart(2, "0");
    const nombreMes = MAPA_MESES[month];

    const urlClientes = `${apiClientesFrecuentes}${yearString}/${monthString}`;
    const urlEmpleados = `${apiEmpleados}${yearString}/${monthString}`;

    try {
      const [respClientes, respEmpleados] = await Promise.all([
        fetch(urlClientes, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(urlEmpleados, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const dataClientes = await respClientes.json();
      const dataEmpleados = await respEmpleados.json();

      if (respClientes.ok && dataClientes.success) {
        const transformed = transformarData(
          dataClientes.details || [],
          nombreMes,
          "Clientes",
          "Servicios Solicitados"
        );
        setClientesData(transformed);
        setClientesKeys(obtenerKeys(transformed));
      } else {
        setClientesData([]);
        setClientesKeys([]);
        console.error("Error Clientes: ", dataClientes.message);
      }

      if (respEmpleados.ok && dataEmpleados.success) {
        const transformed = transformarData(
          dataEmpleados.details || [],
          nombreMes,
          "Conductor",
          "Viajes Realizados"
        );

        setEmpleadosData(transformed);
        setEmpleadosKeys(obtenerKeys(transformed));
      } else {
        setEmpleadosData([]), setEmpleadosKeys([]);
        console.error("Error Empleados: ", dataEmpleados.message);
      }

      setDisplayMonth(nombreMes);
      setDisplayYear(year);
    } catch (error) {
      console.error("Error en general: ", error);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();

    cargarReportes(selectedYear, selectesMonth);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 2000 && value <= currentYear) {
      setSelectedYear(value);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  useEffect(() => {
    cargarReportes(currentYear, currentMonth);
  }, []);

  const maxYear = new Date().getFullYear();

  return (
    <>
      <main className="pb-2 pt-2 bg-white rounded-md border border-gray-400 shadow-md">
        <form
          onSubmit={handleBuscar}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-sm shadow-sm w-fit border border-gray-200 ml-6"
        >
          <label
            htmlFor="month-select"
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            Filtrar por:
          </label>

          <select
            id="month-select"
            value={selectesMonth}
            onChange={handleMonthChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
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
            max={maxYear}
            placeholder="Año"
            className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
          />

          <button
            className="btn text-white bg-blue-500 hover:bg-blue-600 rounded-md flex items-center px-3 py-1"
            type="submit"
          >
            Buscar
          </button>
        </form>

        <section className="grid grid-cols-2 gap-4 m-4">
          <div className="p-4 rounded-sm shadow-sm bg-white h-80 border border-gray-200">
            <h2 className="text-xl font-medium text-gray-800">
              Clientes con mayor frecuencia ({displayMonth} {displayYear})
            </h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clientesData}
                margin={{ top: 5, right: 50, left: 20, bottom: 10 }}
                barGap={40}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" interval={0} />
                <YAxis
                  ticks={clientesTicks}
                  tickFormatter={formatToInteger}
                  label={{
                    value: "No. Servicios",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />

                {clientesKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key}
                    fill={getBarColor(index)}
                    barSize={85}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-sm shadow-sm bg-white h-80 border border-gray-200 ">
            <h2 className="text-xl font-medium text-gray-800">
              Conductores con más viajes realizados ({displayMonth}{" "}
              {displayYear})
            </h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={empleadosData}
                margin={{ top: 5, right: 50, left: 20, bottom: 10 }}
                barGap={40}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" interval={0} />
                <YAxis
                  ticks={empleadosTicks}
                  tickFormatter={formatToInteger}
                  label={{
                    value: "No. Viajes",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />

                {empleadosKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key}
                    fill={getBarColor(index)}
                    barSize={85}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </>
  );
}
