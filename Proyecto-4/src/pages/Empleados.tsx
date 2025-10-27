import Table from "../components/Table/Table";
import SideBar from "../components/SideBar";
import type { Item, Empleado } from "../types/models";
import ToolBar from "../components/Table/ToolBar";

const ejemploEmpleados: Empleado[] = [
  {
    id: 1,
    nombre: "Yonathan",
    apellido: "Nieles",
    cedula: "31161696",
    rol: "Chofer",
  },
  {
    id: 2,
    nombre: "Jesús",
    apellido: "Cortez",
    cedula: "32150123",
    rol: "Contador",
  },
  {
    id: 3,
    nombre: "Juan",
    apellido: "Perdomo",
    cedula: "27198676",
    rol: "Mecanico",
  },
];

function Empleados() {
  const empleados = ejemploEmpleados;

  const columnas = [
    { key: "nombre", header: "Nombre" },
    { key: "apellido", header: "Apellido" },
    { key: "cedula", header: "Cédula" },
    { key: "rol", header: "Rol" },
    { key: "actions", header: "Acciones" },
  ];

  const handleEdit = (item: Item) => {
    console.log("Editar");
    item;
  };

  const handleDelete = (item: Item) => {
    console.log("Eliminar");
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
        <section className="flex flex-col flex-grow items-center w-full">
          <ToolBar
            titulo="Empleados"
            onSearch={handleSearch}
            onRegister={handleRegister}
          />
          <Table
            data={empleados}
            columnas={columnas}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </section>
      </main>
    </>
  );
}

export default Empleados;
