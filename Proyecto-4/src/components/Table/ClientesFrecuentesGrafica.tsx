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

const datosClientes = [
  {
    mes: "Noviembre",
    "Empresa el Tunal": 12,
    "Empresas Polar": 14,
    "Farmatodo": 9,
  },
];

const datosEmpleados = [
  {
    mes: "Noviembre",
    "Jesús Cortez": 5,
    "Yonathan Nieles": 3,
    "Juan Perdomo": 7,
  },
];

export function ClientesFrecuentesGrafica() {
  return (
    <>
      <section className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg shadow-sm bg-white h-80 border border-gray-400 mt-5">
          <h2 className="text-xl pl-18 font-medium text-gray-800">
            Clientes con Mayor Frecuencia
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosClientes}
              margin={{ top: 5, right: 50, left: 20, bottom: 10 }}
              barGap={40}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" interval={0} />

              <YAxis
                label={{
                  value: "No. Servicios",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip />

              <Legend />
              <Bar
                dataKey="Empresa el Tunal"
                name="Empresa el Tunal"
                fill="#4caf50"
                barSize={85}
              />
              <Bar
                dataKey="Empresas Polar"
                fill="#3f51b5"
                name="Empresas Polar"
                barSize={85}
              />

              <Bar
                dataKey="Farmatodo"
                name="Farmatodo"
                fill="#ffc107"
                barSize={85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-4 rounded-lg shadow-sm bg-white h-80 border border-gray-400 mt-5">
          <h2 className="text-xl pl-18 font-medium text-gray-800">
            Conductores con más vaijes realizados
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosEmpleados}
              margin={{ top: 5, right: 50, left: 20, bottom: 10 }}
              barGap={40}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" interval={0} />

              <YAxis
                label={{
                  value: "No. Viajes",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip />

              <Legend />
               <Bar
                dataKey="Juan Perdomo"
                name="Juan Perdomo"
                fill="#007ACC"
                barSize={85}
              />
              <Bar
                dataKey="Jesús Cortez"
                fill="#4CAF50"
                name="Jesús Cortez"
                barSize={85}
              />
              <Bar
                dataKey="Yonathan Nieles"
                name="Yonathan Nieles"
                fill="#FF9800"
                barSize={85}
              />
              

             
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
