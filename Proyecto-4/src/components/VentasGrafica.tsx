import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Definición de tipos para los datos (Gracias a TypeScript!)
interface VentaData {
  mes: string;
  ventas: number;
  gastos: number;
}

const datos: VentaData[] = [
  { mes: 'Ene', ventas: 4000, gastos: 2400 },
  { mes: 'Feb', ventas: 3000, gastos: 1398 },
  { mes: 'Mar', ventas: 2000, gastos: 1200 },
  { mes: 'Abr', ventas: 2780, gastos: 3008 },
  { mes: 'May', ventas: 1890, gastos: 3800 },
  { mes: 'Jun', ventas: 2390, gastos: 3800 },
];

export function VentasGrafica() {
  return (
    // ResponsiveContainer se asegura de que el gráfico se ajuste a su contenedor
    <div className="p-5 rounded-lg shadow-sm bg-white h-90">
      {/* 💡 Usa clases de Tailwind para estilizar el contenedor (div) */}
      <h2 className="text-xl pl-18 font-medium text-gray-800">Resumen Financiero Semestral</h2>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={datos}
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
  );
}