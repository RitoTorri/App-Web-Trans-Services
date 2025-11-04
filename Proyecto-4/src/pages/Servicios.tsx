import type { Servicio } from "../types/models";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import Modal from "../components/Modal/Modal";
import { useState } from "react";

const ejemploServicios: Servicio[] = [
  {
    id: 1,
    nombre_cliente: "Inversiones S&K",
    placa_vehiculo: "LMH-012",
    hora_inicio: "1:00pm",
    hora_finalizacion: "10:20pm",
    precio: "2500bs",
    estado_pago: "No Pagado",
    salida: "Barquisimeto",
    llegada: "Caracas",
  },
];

function Servicios() {
  const servicio = ejemploServicios;

  const columnas = [
    { key: "nombre_cliente", header: "Nombre del Cliente" },
    { key: "placa_vehiculo", header: "Placa del Vehículo" },
    { key: "salida", header: "Salida" },
    { key: "llegada", header: "Llegada" },
    { key: "hora_inicio", header: "Hora de Inicio" },
    { key: "hora_finalizacion", header: "Hora de Finalización" },
    { key: "precio", header: "Monto" },
    { key: "estado_pago", header: "Estado del Pago" },
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
      Editar
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

  const handleOpenModalEdit = () => {
    setIsModalOpenEdit(true);
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
  };

  const handleEdit = (item: Item) => {
    console.log("Editar");
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
            titulo="Servicios Prestados"
            onSearch={handleSearch}
            onRegister={handleOpenModal}
          />
          <Table
            data={servicio}
            columnas={columnas}
            onEdit={handleOpenModalEdit}
          />
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Servicio"
        acciones={userRegistro}
      >
        <form action="" className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Cliente:
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ingrese el Nombre del Cliente"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="placa"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Placa del Vehículo:
            </label>
            <input
              type="text"
              name="placa"
              placeholder="Ingrese la Placa del Vehículo"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="salida"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lugar de Salida:
            </label>
            <input
              type="text"
              name="salida"
              placeholder="Ingrese el Lugar de Salida"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="llegada"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lugar de Llegada:
            </label>
            <input
              type="text"
              name="llegada"
              placeholder="Ingrese el Lugar de Llegada"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="inicio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hora de Inicio:
            </label>
            <input
              type="text"
              name="inicio"
              placeholder="Ingrese la Hora de Inicio"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="fin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hora de Finalización:
            </label>
            <input
              type="text"
              name="fin"
              placeholder="Ingrese la Hora de Finalización"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="precio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Monto del Servicio:
            </label>
            <input
              type="number"
              min="0"
              name="precio"
              placeholder="Ingrese el Monto"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="estado"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Estado del Pago:
            </label>
            <input
              type="text"
              name="estado"
              placeholder="Ingrese el Estado del Pago"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isModalOpenEdit}
        onClose={handleCloseModalEdit}
        titulo="Editar Servicio"
        acciones={userEdit}
      >
        <form action="" className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Cliente:
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ingrese el Nombre del Cliente"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="placa"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Placa del Vehículo:
            </label>
            <input
              type="text"
              name="placa"
              placeholder="Ingrese la Placa del Vehículo"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="salida"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lugar de Salida:
            </label>
            <input
              type="text"
              name="salida"
              placeholder="Ingrese el Lugar de Salida"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="llegada"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lugar de Llegada:
            </label>
            <input
              type="text"
              name="llegada"
              placeholder="Ingrese el Lugar de Llegada"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="inicio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hora de Inicio:
            </label>
            <input
              type="text"
              name="inicio"
              placeholder="Ingrese la Hora de Inicio"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="fin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hora de Finalización:
            </label>
            <input
              type="text"
              name="fin"
              placeholder="Ingrese la Hora de Finalización"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="precio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Monto del Servicio:
            </label>
            <input
              type="number"
              min="0"
              name="precio"
              placeholder="Ingrese el Monto"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="estado"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Estado del Pago:
            </label>
            <input
              type="text"
              name="estado"
              placeholder="Ingrese el Estado del Pago"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Servicios;
