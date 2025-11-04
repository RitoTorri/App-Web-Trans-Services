import type { Proveedor } from "../types/models";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import { useState } from "react";
import Modal from "../components/Modal/Modal";

const ejemploProveedores: Proveedor[] = [
  {
    id: 1,
    nombre: "Anita Cauchos, S.A",
    rif: "J-293937299",
    contacto: "04145185937"
  },
];

function Proveedores() {
  const proveedor = ejemploProveedores;

  const columnas = [
    { key: "nombre", header: "Nombre" },
    { key: "rif", header: "rif" },
    { key: "contacto", header: "Contacto" },
    {key:"actions", header: "Acciones"}
   
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

  const handleEdit = (item: Item) => {
    console.log("Editar");
    item;
  };

  const handleDelete = (item: Item) => {
    console.log("Eliminar");
    item;
  };

  const handleSearch = () => {
    console.log("Buscar");
  };

  return (
    <>
      <main className="min-h-screen">
        <section className="flex flex-col flex-grow w-full items-center pl-4 pr-4">
          <ToolBar
            titulo="Proveedores"
            onRegister={handleOpenModal}
            onSearch={handleSearch}
          />
          <Table
            data={proveedor}
            columnas={columnas}
            onEdit={handleOpenModalEdit}
            onDelete={handleDelete}
          />
        </section>
      </main>

    <Modal 
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      titulo="Registrar Nuevo Proveedor"
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
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="rif"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              RIF:
            </label>
            <input
              type="text"
              name="rif"
              placeholder="Ingrese el RIF"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Teléfono:
            </label>
            <input
              type="text"
              name="telefono"
              placeholder="Ingrese el Nombre"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
      </form>
     </Modal>
      <Modal
        isOpen={isModalOpenEdit}
        onClose={handleCloseModalEdit}
        titulo="Editar Proveedor"
        acciones={userEdit}
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
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="rif"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              RIF:
            </label>
            <input
              type="text"
              name="rif"
              placeholder="Ingrese el RIF"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Teléfono:
            </label>
            <input
              type="text"
              name="telefono"
              placeholder="Ingrese el Nombre"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
      </form>
      </Modal>
     
    </>
  );
}

export default Proveedores;
