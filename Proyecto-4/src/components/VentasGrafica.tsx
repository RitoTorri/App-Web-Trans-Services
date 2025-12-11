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
import { data } from "react-router-dom";

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
  1: "Ene",
  2: "Feb",
  3: "Mar",
  4: "Abr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dic",
};

export function VentasGrafica() {
  const accessToken = localStorage.getItem("token");

  const [datosPrimerSemestre, setDatosPrimerSemestre] = useState<VentaData[]>(
    []
  );
  const [dataosSegundoSemestre, setDatosSegundoSemestre] = useState<
    VentaData[]
  >([]);

  const unificarDatosAnuales = (
    ganancias: APIData[],
    gastos: APIData[]
  ): VentaData[] => {
    const dataMap = new Map<number, { ventas: number; gastos: number }>();

    for (let i = 1; i <= 12; i++) {
      dataMap.set(i, { ventas: 0, gastos: 0 });
    }

    ganancias.forEach((item) => {
      const mesNumero = parseInt(item.Fecha.split("-")[1]);
      const ganancia = parseFloat(item["Ganancia Mensual"] || "0");

      if (mesNumero >= 1 && mesNumero <= 12) {
        dataMap.get(mesNumero)!.ventas = ganancia;
      }
    });

    gastos.forEach((item) => {
      const mesNumero = parseInt(item.Fecha.split("-")[1]);
      const gasto = parseFloat(item["Gasto Mensual"] || "0");

      if (mesNumero >= 1 && mesNumero <= 12) {
        dataMap.get(mesNumero)!.gastos = gasto;
      }
    });

    const datosAnuales: VentaData[] = Array.from(dataMap.entries()).map(
      ([mesNub, data]) => ({
        mes: Meses[mesNub],
        ventas: data.ventas,
        gastos: data.gastos,
      })
    );

    return datosAnuales;
  };

  const reporteGanaciasYGastos = async (busqueda = "") => {
    const currentYear = new Date().getFullYear();
    let yearToFetch = currentYear;

    if (busqueda && busqueda.trim() !== "") {
      yearToFetch = parseInt(busqueda.trim());
    }

    const yearString = encodeURIComponent(yearToFetch.toString());

    const urlGanancias = `${apiGananciasAnual}${yearString}`;
    const urlGastos = `${apiGastosAnual}${yearString}`;

    try {
      const [responseGanancias, responseGastos] = await Promise.all([
        fetch(urlGanancias, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(urlGastos, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
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
        console.error(
          "Error al obtener los datos: ",
          datosGanancias.message || datosGastos.message
        );
      }
    } catch (error) {
      console.error("Error del servidor: ", error);
    }
  };

  useEffect(() => {
    reporteGanaciasYGastos();
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();

    const input = e.currentTarget.querySelector(
      'input[type="number"]'
    ) as HTMLInputElement;
    if (input) {
      reporteGanaciasYGastos(input.value);
    }
  };

  const year = new Date().getFullYear();
  return (
    <main className=" pb-2 pt-2 bg-white rounded-sm border border-gray-400 shadow-md">
      <form
        onSubmit={handleBuscar}
        className="flex items-center justify-between gap-3 p-3 border border-gray-200 bg-gray-50 rounded-lg shadow-sm w-fit ml-6"
      >
        <div className="flex items-center gap-3">
        {/* 1. Etiqueta con estilo para mejorar la legibilidad */}
        <label
          htmlFor="year-input"
          className="text-sm font-medium text-gray-700 whitespace-nowrap"
        >
          Buscar por año:
        </label>

        {/* 2. Campo de entrada: más ancho y con animación */}
        <input
          id="year-input" // Agregamos un ID para accesibilidad (asociarlo con <label>)
          type="number"
          min="2000"
          max={year}
          placeholder="Ej: 2025"
          className="
            w-25
            border border-gray-300 
            rounded-md 
            px-2 py-1 
            text-sm 
            shadow-inner
            focus:outline-none 
            focus:ring-2 focus:ring-blue-500/50 
            focus:border-blue-500 
            transition-all duration-200
            
        "
        />
        </div>
        
        <button
          className="
           btn text-white bg-blue-500 hover:bg-blue-600 rounded-md flex items-center space-x-2 px-3 py-1
        "
          type="submit"
        >
          Buscar
        </button>
      </form>
      <div className="flex flex-row gap-4 m-4 justify-between">
        <div className="p-5 rounded-lg shadow-sm bg-white h-90 w-2/4 border border-gray-200">
          {/* 💡 Usa clases de Tailwind para estilizar el contenedor (div) */}
          <h2 className="text-xl  font-medium text-gray-800">
            Primer Semestre (Ene-Jun)
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={datosPrimerSemestre}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              {/* Componente para dibujar la cuadrícula de fondo */}
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />

              {/* Eje X (categorías, en este caso, el 'mes') */}
              <XAxis dataKey="mes" />

              {/* Eje Y (valores numéricos) */}
              <YAxis />

              {/* Tooltip: la caja que aparece al pasar el mouse */}
              <Tooltip />

              {/* Leyenda del gráfico */}
              <Legend />

              {/* Barras: dataKey apunta a la propiedad numérica en el objeto de datos */}
              <Bar dataKey="ventas" fill="#3b82f6" name="Ventas ($)" />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-5 rounded-lg shadow-sm bg-white h-90 w-2/4 border border-gray-200">
          {/* 💡 Usa clases de Tailwind para estilizar el contenedor (div) */}
          <h2 className="text-xl  font-medium text-gray-800">
            Segundo Semestre (Jul-Dic)
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dataosSegundoSemestre}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              {/* Componente para dibujar la cuadrícula de fondo */}
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />

              {/* Eje X (categorías, en este caso, el 'mes') */}
              <XAxis dataKey="mes" />

              {/* Eje Y (valores numéricos) */}
              <YAxis />

              {/* Tooltip: la caja que aparece al pasar el mouse */}
              <Tooltip />

              {/* Leyenda del gráfico */}
              <Legend />

              {/* Barras: dataKey apunta a la propiedad numérica en el objeto de datos */}
              <Bar dataKey="ventas" fill="#3b82f6" name="Ventas ($)" />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
