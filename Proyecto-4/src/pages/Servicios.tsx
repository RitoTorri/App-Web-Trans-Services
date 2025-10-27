import SideBar from "../components/SideBar";
import type { Servicio } from "../types/models";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";

const ejemploServicios: Servicio[] = [
  {
    id: 1,
    nombre_cliente: "Yonathan Nieles",
    placa_vehiculo: "LMH-012",
    hora_inicio: "1:00pm",
    hora_finalizacion: "10:20pm",
    precio: "2500bs",
    estado_pago: "Pendiente",
  },
];

function Servicios() {
  const servicio = ejemploServicios;

  const columnas = [
    { key: "nombre_cliente", header: "Nombre del Cliente" },
    { key: "placa_vehiculo", header: "Placa del Vehículo" },
    { key: "hora_inicio", header: "Hora de Inicio" },
    { key: "hora_finalizacion", header: "Hora de Finalización" },
    { key: "precio", header: "Precio" },
    { key: "estado_pago", header: "Estado del Pago" },
    { key: "actions", header: "Acciones" },
  ];

  const handleEdit = (item: Item) => {
    console.log("Editar");
    item;
  };

  

  const handleRegister = () => {
    console.log("Registrar");
    //Logica para el formulario de registro
  };

  const handleSearch = () => {
    console.log("Buscar");
  };

  return (
    <>
      <main className="flex">
        <SideBar />
        <section className="flex flex-col flex-grow w-full  items-center">
          <ToolBar
            titulo="Servicios Prestados"
            onSearch={handleSearch}
            onRegister={handleRegister}
          />
          <Table data={servicio} columnas={columnas} onEdit={handleEdit} />
        </section>
      </main>
    </>
  );
}

export default Servicios;
