import ToolBar from "../components/Table/ToolBar";
import type { Vehiculo } from "../types/models";
import Modal from "../components/Modal/Modal";
import { useState } from "react";
import Table from "../components/Table/Table";
import type { Item } from "../types/models";

const ejemploVehiculos: Vehiculo[] = [
  {
    id: 1,
    placa: "JAO-637",
    total_asientos: "32",
    tipo: "Encava",
  },
];

function Vehiculos() {
  const vehiculo = ejemploVehiculos;

  const columnas = [
    { key: "placa", header: "Placa" },
    { key: "total_asientos", header: "Cantidad de Asientos" },
    { key: "tipo", header: "Tipo" },

    { key: "actions", header: "Acciones" },
  ];

  const userRegistro = (
    //Logica para el envío del formulario
    <button className="btn bg-blue-500 hover:bg-blue-600 text-white">
      Registrar
    </button>
  );

  const userEdit = (
    //Logica para el envío del formulario
    <button className="btn bg-blue-500 hover:bg-blue-600 text-white">
      Registrar
    </button>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

  const handleSearch = () => {
    console.log("Buscar");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModalEdit = () =>{
    setIsModalOpenEdit(true);
  }

  const handleCloseModalEdit = () =>{
    setIsModalOpenEdit(false);
  }

  const handleDelete = (item: Item) => {
    console.log("Eliminar");
    item;
  };

  const handleEdit = (item: Item) => {
    console.log("Editar");
    item;
  };

  return (
    <>
      <main className="min-h-screen">
        <section className="flex flex-col flex-grow items-center pl-4 pr-4">
          <ToolBar
            titulo="Vehículos"
            onSearch={handleSearch}
            onRegister={handleOpenModal}
          />
          <Table
            data={vehiculo}
            columnas={columnas}
            onDelete={handleDelete}
            onEdit={handleOpenModalEdit}
          />
        </section>
      </main>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Vehículo"
        acciones={userRegistro}
      >
        <form action="" className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="placa"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Placa:
            </label>
            <input
              type="text"
              name="placa"
              placeholder="Ingrese la Placa"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="asientos"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Asientos:
            </label>
            <input
              type="number"
              name="asientos"
              placeholder="Ingrese el Número de Asientos"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="tipo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo:
            </label>
            <input
              type="text"
              name="tipo"
              placeholder="Ingrese el Tipo"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isModalOpenEdit}
        onClose={handleCloseModalEdit}
        titulo="Editar Vehículo"
        acciones={userEdit}
      >
         <form action="" className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="placa"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Placa:
            </label>
            <input
              type="text"
              name="placa"
              placeholder="Ingrese la Placa"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="asientos"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Asientos:
            </label>
            <input
              type="number"
              name="asientos"
              placeholder="Ingrese el Número de Asientos"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="tipo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo:
            </label>
            <input
              type="text"
              name="tipo"
              placeholder="Ingrese el Tipo"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Vehiculos;
