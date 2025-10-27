import SideBar from "../components/SideBar";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import type { Cliente } from "../types/models";
import type { Item } from "../types/models";

const ejemploClientes: Cliente[] = [
  {
    id: 1,
    nombre: "José",
    apellido: "Ramos",
    contacto: "Josee517@gmail.com",
    direccion: "Carrera 19 entre calle 50",
  },
];

function Clientes() {
  const cliente = ejemploClientes;

  const columnas = [
    { key: "nombre", header: "Nombre" },
    { key: "apellido", header: "Apellido" },
    { key: "contacto", header: "Contacto" },
    { key: "direccion", header: "Dirección" },
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
        <section className="flex flex-col flex-grow w-full items-center">
          <ToolBar
            titulo="Clientes"
            onRegister={handleRegister}
            onSearch={handleSearch}
          />
          <Table
            data={cliente}
            columnas={columnas}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </>
  );
}

export default Clientes;
