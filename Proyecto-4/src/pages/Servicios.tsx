import type { Servicio } from "../types/models";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import Modal from "../components/Modal/Modal";
import React, { use, useState } from "react";
import SelectClientes from "../components/SelectClientes";
import SelectVehiculos from "../components/SelectVehiculos";
import { apiObtener } from "../services/apiClientes";
import { apiVehiculos } from "../services/apiVehiculos";
import { apiRegistrar } from "../services/apiServicios";

interface RegisterFormState{
  vehicle_id: number;
  client_id: number;
  price: number;
  start_date: Date;
  end_date: Date;
  isrl: number;
}

interface RegisterState{
  form: RegisterFormState;
  error: boolean;
  errorMsg: string;
}

const initialState : RegisterState = {
  form:{
    vehicle_id: 0,
    client_id: 0,
    price: 0,
    start_date: new Date(),
    end_date: new Date(),
    isrl: 0
  },
  error: false,
  errorMsg: ""
}

const formatDateToInput = (date: Date): string => {
    // Si la fecha existe y es un objeto Date, la formatea.
    if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }
    return '';
};

function Servicios() {

  const accessToken = localStorage.getItem("token");
  const [state, setState] = useState<RegisterState>(initialState)
  
  const [selectClienteId, setSelectClienteId] = useState<number | null>(null)
  const [selectVehiculoId, setSelectVehiculoId] = useState<number | null>(null)

  const urlClientes = `${apiObtener}all`
  const urlVehiculos = `${apiVehiculos}`

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    let newValue: any = value;

    if(name === "start_date" || name === "end_date"){
      if(value){
        newValue = new Date(value)
      }else{
        newValue = new Date(NaN)
      }
    }

    setState(prevState => ({
      ...prevState,
      form: {
        ...prevState.form,
        [name]: newValue
      }
    }))
  }

  const handleClienteChange = (id: number | null) => {
    setSelectClienteId(id)
    console.log("Cliente seleccionado: ",id)
    setState(prevState => ({
      ...prevState,
      form: {
        ...prevState.form,
        client_id: id ?? 0
      }
    }))
  }

  const handleVehiculoChange = (id: number | null) => {
    setSelectVehiculoId(id)
    console.log("VehiculoSeleccionado: ",id)
    setState(prevState => ({
      ...prevState,
      form: {
        ...prevState.form,
        vehicle_id: id ?? 0
      }
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        [name]: value
      },
      error: false,
      errorMsg: ""
    }))
  }

  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setState((prevState) => ({...prevState, error: false, errorMsg: ""}))

    if(
      !state.form.client_id ||
      !state.form.vehicle_id ||
      !state.form.start_date ||
      !state.form.end_date ||
      !state.form.isrl ||
      !state.form.price
    ){
      setState((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Por favor, complete todos los datos."
      }))
      return
    }

    try{
      const {client_id, vehicle_id, start_date, end_date, isrl, price} = state.form

      const dataToSend = {
        client_id,
        vehicle_id,
        start_date: start_date.toISOString().split('T')[0],
        end_date: end_date.toISOString().split('T')[0],
        isrl: parseFloat(String(isrl)),
        price: parseFloat(String(price))
      }

      console.log(dataToSend)

      const response = await fetch(apiRegistrar, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        }, 
        body: JSON.stringify(dataToSend)
      })

      if(response.ok){
        console.log("Registro exitoso")
        setState(initialState)
        handleCloseModal()
      }else{
        const errorData = await response.json()
        console.error("Error: ",errorData)

      }
    }catch(error){
      console.error("Error de servidor: ", error)
    }
  }

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
    <button form="FormularioServicio" className="btn bg-blue-500 hover:bg-blue-600 text-white">
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
    setState(initialState)
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
          
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Servicio"
        acciones={userRegistro}
      >
        <form id="FormularioServicio" onSubmit={manejadorSubmit}  className="grid grid-cols-2 gap-3">
          <div >
            <SelectClientes
              endpointUrl={urlClientes}
              onClienteChange={handleClienteChange}
            />
          </div>
          <div>
            <SelectVehiculos
              endpointUrl={urlVehiculos}
              onVehiculoChange={handleVehiculoChange}
            />
          </div>
          
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Inicio:
            </label>
            <input
              type="date"
              name="start_date"
              value={formatDateToInput(state.form.start_date)}
              onChange={handleDateChange}
              placeholder="Ingrese la Fecha de Inicio"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Finalización:
            </label>
            <input
              type="date"
              name="end_date"
              value={formatDateToInput(state.form.end_date)}
              onChange={handleDateChange}
              placeholder="Ingrese la Fecha de Finalización"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Precio del Servicio:
            </label>
            <input
              type="number"
              min="0"
              name="price"
              value={state.form.price}
              onChange={handleInputChange}
              placeholder="Ingrese el Precio"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="isrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Impuesto Sobre la Renta:
            </label>
            <input
              type="number"
              min="0"
              name="isrl"
              value={state.form.isrl}
              onChange={handleInputChange}
              placeholder="Ingrese el Impuesto Sobre la Renta"
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
