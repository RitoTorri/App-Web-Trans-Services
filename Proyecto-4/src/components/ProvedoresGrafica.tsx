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

import { apiProveedores } from "../services/apiReportes";
import { useEffect } from "react";


// 🚀 Estos son los datos que usaremos para los proveedores
const datosProveedores = [
  {
    mes: "Noviembre",
    "Autosans Automotriz": 5,
    "Magna Partes C.A.": 3,
    "MAREA C.A.": 7,
  },
];

export function ProvedoresGrafica() {

  const accessToken = localStorage.getItem("token")

  const cargarReporte = async () => {
    try{
      const url = `${apiProveedores}2025/12`

      console.log("URL: ",url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const data = await response.json()

      if(response.ok && data.success){
        console.log("Exito: ",data.details)
      }else{
        console.error("Error: ",data.details)
      }
    }catch(error){
      console.error("Error del servidor: ",error)
    }
  }

  useEffect(() => {
    cargarReporte()
  }, [])

  return (
    // 💡 NOTA: La clase grid-cols-2 sugiere que aquí debería ir otra gráfica
    <section className="grid grid-cols-1 gap-4"> 


      {/* 🚀 Segundo Div - Gráfica de Proveedores (Nueva Adaptación) */}
      <div className="p-4 rounded-lg shadow-sm bg-white h-80 border border-gray-400 mt-5">
        <h2 className="text-xl pl-18 font-medium text-gray-800">
          Proveedores con mayor frecuencia de compra
        </h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            // 🚀 Usamos los datos de los proveedores
            data={datosProveedores} 
            margin={{ top: 5, right: 50, left: 20, bottom: 10 }}
            barGap={120}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" interval={0} />

            <YAxis
              label={{
                // 💡 Etiqueta ajustada a la métrica (unidades o facturas)
                value: "No. Compras", 
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip />
            <Legend />
            {/* 🚀 BARRA 1: Jesús Cortez */}
            <Bar
              dataKey="Autosans Automotriz"
              name="Autosans Automotriz"
              fill="#e91e63" // Color diferente para distinguir
              barSize={85}
            />
            {/* 🚀 BARRA 2: Yonathan Nieles */}
            <Bar
              dataKey="Magna Partes C.A."
              fill="#00bcd4" // Color diferente para distinguir
              name="Magna Partes C.A."
              barSize={85}
            />

            {/* 🚀 BARRA 3: Juan Perdomo */}
            <Bar
              dataKey="MAREA C.A."
              name="MAREA C.A."
              fill="#ff9800" // Color diferente para distinguir
              barSize={85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}