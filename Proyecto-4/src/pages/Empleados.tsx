import Table from "../components/Table/Table";
import SideBar from "../components/SideBar";
import type { Item, Empleado } from "../types/models";
import ToolBar from "../components/Table/ToolBar";
import { useState } from "react";
import Modal from "../components/Modal/Modal";

const ejemploEmpleados: Empleado[] = [
  {
    id: 1,
    nombre: "Yonathan",
    apellido: "Nieles",
    cedula: "31161696",
    rol: "Chofer",
    telefono: "04164537225",
    correo: "yonathannieles011@gmail.com"
  },
  {
    id: 2,
    nombre: "Jesús",
    apellido: "Cortez",
    cedula: "32150123",
    rol: "Contador",
    telefono: "04262839127",
    correo: "jesus@gmail.com"
  },
  {
    id: 3,
    nombre: "Juan",
    apellido: "Perdomo",
    cedula: "27198676",
    rol: "Mecanico",
    telefono: "04142730127",
    correo: "juanperdomoo@gmail.com"
  },
];

function Empleados() {
  const empleados = ejemploEmpleados;

  const userRegistro = (
    //Logica para el envío del formulario
    <button className="btn bg-blue-500 hover:bg-blue-600 text-white">
      Registrar
    </button>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const columnas = [
    { key: "nombre", header: "Nombre" },
    { key: "apellido", header: "Apellido" },
    { key: "cedula", header: "Cédula" },
    { key: "rol", header: "Rol" },
    { key: "telefono", header: "Teléfono" },
    { key: "correo", header: "Correo" },
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
            onRegister={handleOpenModal}
          />
          <Table
            data={empleados}
            columnas={columnas}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Empleado"
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
              htmlFor="cedula"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cédula:
            </label>
            <input
              type="text"
              name="cedula"
              placeholder="Ingrese la Cédula"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="rol"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rol:
            </label>
            <input
              type="text"
              name="rol"
              placeholder="Ingrese el Rol"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="rol"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de telefono:
            </label>
            <input
              type="text"
              name="rol"
              placeholder="Ingrese el Número de Telefono"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="rol"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico:
            </label>
            <input
              type="email"
              name="rol"
              placeholder="Ingrese el Correo Electrónico"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Empleados;
