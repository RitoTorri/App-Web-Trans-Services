import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  
} from "recharts";

const datosCorrelacion = [
  { variableA: 10, variableB: 20 },
  { variableA: 15, variableB: 35 },
  { variableA: 20, variableB: 40 },
  { variableA: 25, variableB: 60 },
  { variableA: 30, variableB: 75 },
  { variableA: 35, variableB: 70 },
  { variableA: 40, variableB: 95 },
];

export function CorrelacionGrafica() {
  return (
    <div className="p-4 rounded-lg shadow-sm bg-white h-96 border border-gray-400 mt-5">
      <h2 className="text-xl font-medium text-gray-800 mb-4">
        Correlación: Ganancias vs. Ventas
      </h2>
      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="8 5" />
          
          {/* Eje X: Primera variable */}
          <XAxis 
            dataKey="variableA" 
            name="Variable A(Ej. Horas Trabajadas)" 
            type="number"
            label={{ value: 'Ventas', position: 'top' }}
          />
          
          {/* Eje Y: Segunda variable */}
          <YAxis 
            dataKey="variableB" 
            name="Variable B (Ej. Servicios Realizados)" 
            type="number" 
            label={{ value: 'Ganancias', angle: -90, position: 'left' }}
          />
          
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          
          {/* Los puntos de dispersión */}
          <Scatter 
            name="Observaciones" 
            data={datosCorrelacion} 
            fill="#8884d8" 
          />
          
          {/* Opcional: Línea de tendencia (Regresión) */}
          {/* Para mostrar la línea, necesitarías calcular la regresión lineal (pendient/intercepto)
              y añadir un <Line> aquí, lo cual es más complejo y no lo haré por defecto. */}
          
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}