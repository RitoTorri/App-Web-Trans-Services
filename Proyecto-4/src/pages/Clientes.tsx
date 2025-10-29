import SideBar from "../components/SideBar";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import type { Cliente } from "../types/models";
import type { Item } from "../types/models";
import Modal from "../components/Modal/Modal";
import {useState} from "react";

const ejemploClientes: Cliente[] = [
  {
    id: 1,
    nombre: "José",
    apellido: "Ramos",
    telefono: "04126378129",
    correo: "Josee517@gmail.com",
    direccion: "Carrera 19 entre calle 50",
    
  },
];

function Clientes() {
  const cliente = ejemploClientes;

  const columnas = [
    { key: "nombre", header: "Nombre" },
    { key: "apellido", header: "Apellido" },
    { key: "telefono", header: "Teléfono" },
    { key: "correo", header: "Correo" },
    { key: "direccion", header: "Dirección" },
    { key: "actions", header: "Acciones" },
  ];

  const userRegistro = (
    //Logica para el envío del formulario
    <button className="btn bg-blue-500 hover:bg-blue-600 text-white">
      Registrar
    </button>
  )

  const [isModalOpen, setIsModalOpen] = useState(false);
  
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
    };

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
            onRegister={handleOpenModal}
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
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Cliente"
        acciones={userRegistro} 
      >
        <form action="" className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre:
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ingrese el Nombre"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="apellido"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Apellido:
            </label>
            <input
              type="text"
              name="apellido"
              placeholder="Ingrese el Apellido"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="apellido"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Teléfono:
            </label>
            <input
              type="text"
              name="telefono"
              placeholder="Ingrese el Teléfono"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
            </div>
            <div>
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo Eléctronico:
            </label>
            <input
              type="email"
              name="correo"
              placeholder="Ingrese el Correo Eléctronico"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Teléfono:
            </label>
            <input
              type="text"
              name="telefono"
              placeholder="Ingrese el Número de Teléfono"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="direccion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dirección:
            </label>
            <input
              type="text"
              name="direccion"
              placeholder="Ingrese la Dirección"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          

        </form>
      </Modal>
    </>
  );
}

export default Clientes;
