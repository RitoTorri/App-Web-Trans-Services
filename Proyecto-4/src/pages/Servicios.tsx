import SideBar from "../components/SideBar";
import type { Servicio } from "../types/models";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import Modal from "../components/Modal/Modal";
import { useState } from "react";

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

  

  const handleRegister = () => {
    console.log("Registrar");
    //Logica para el formulario de registro
  };

  const handleSearch = () => {
    console.log("Buscar");
  };

  return (
    <>
      <main className="min-h-screen">
        <SideBar />
        <section className="flex flex-col flex-grow w-full items-center pl-4 pr-4">
          <ToolBar
            titulo="Servicios Prestados"
            onSearch={handleSearch}
            onRegister={handleOpenModal}
          />
          <Modal
            isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Servicio"
        acciones={userRegistro} 
          >
            <h1>ha</h1>
          </Modal>
          <Table data={servicio} columnas={columnas} onEdit={handleEdit} />
        </section>
      </main>
    </>
  );
}

export default Servicios;
