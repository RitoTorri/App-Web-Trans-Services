import type { Item } from "../types/models";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import Modal from "../components/Modal/Modal";
import React, { useEffect, useMemo, useState } from "react";
import SelectClientes from "../components/SelectClientes";
import SelectVehiculos from "../components/SelectVehiculos";
import { apiObtener } from "../services/apiClientes";
import { apiVehiculos } from "../services/apiVehiculos";
import {
  apiRegistrar,
  apiObtenerServicios,
  actualizarServicio,
} from "../services/apiServicios";
import type { ServicioApi, ItemPlana } from "../types/servicos";
import { mapServiciosToTabla } from "../mappers/servicioMapper";
import type { EnglishStatus } from "../mappers/servicioMapper";
import { traducirEstado } from "../mappers/servicioMapper";


interface ServiceApi {
  vehicle_id: number;
  client_id: number;
  price: number;
  start_date: string;
  end_date: string;
}

interface PendingService extends RegisterFormState {
  temId: number;
  clientName?: string;
  vehiclePlate?: string;
}

interface RegisterFormState {
  vehicle_id: number;
  client_id: number;
  price: number;
  start_date: Date;
  end_date: Date;
}

interface RegisterState {
  form: RegisterFormState;
  error: boolean;
  errorMsg: string;
}

const initialState: RegisterState = {
  form: {
    vehicle_id: 0,
    client_id: 0,
    price: 0,
    start_date: new Date(),
    end_date: new Date(),
  },
  error: false,
  errorMsg: "",
};

interface ServiciosState {
  registros: ServicioApi[];
  error: boolean;
  errorMsg: string;
}

const initialServiciosState: ServiciosState = {
  registros: [] as [],
  error: false,
  errorMsg: "",
};

const formatDateToInput = (date: Date): string => {
  // Si la fecha existe y es un objeto Date, la formatea.
  if (date instanceof Date && !isNaN(date.getTime())) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`

  }
  return "";
};

function Servicios() {
  const accessToken = localStorage.getItem("token");
  const [state, setState] = useState<RegisterState>(initialState);

  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);

  const [currentClientName, setCurrentClientName] = useState("");
  const [currentVehiclePlate, setCurrentVehiclePlate] = useState("");

  const [selectClienteId, setSelectClienteId] = useState<number | null>(null);
  const [selectVehiculoId, setSelectVehiculoId] = useState<number | null>(null);

  const [stateServicio, setStateServicio] = useState<ServiciosState>(
    initialServiciosState
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)
  const [terminoBusqueda, setTerminoBusqueda] =useState<string>("")

  const urlClientes = `${apiObtener}all`;
  const urlVehiculos = `${apiVehiculos}`;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let newValue: any = value;

    if (name === "start_date" || name === "end_date") {
      if (value) {
        newValue = new Date(value);
      } else {
        newValue = new Date(NaN);
      }
    }

    setState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        [name]: newValue,
      },
    }));
  };

  const handleClienteChange = (id: number | null, nombre?: string) => {
    setSelectClienteId(id);
    if (nombre) setCurrentClientName(nombre);
    setState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        client_id: id ?? 0,
      },
    }));
  };

  const handleVehiculoChange = (id: number | null, placa?: string) => {
    setSelectVehiculoId(id);
    console.log(placa)
    if (placa) setCurrentVehiclePlate(placa);
    setState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        vehicle_id: id ?? 0,
      },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        [name]: value,
      },
      error: false,
      errorMsg: "",
    }));
  };

  const handleAddToList = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !state.form.client_id ||
      !state.form.vehicle_id ||
      !state.form.start_date ||
      !state.form.end_date ||
      !state.form.price
    ) {
      setState((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Complete los datos para agregar",
      }));
    }

    const newService: PendingService = {
      ...state.form,
      temId: Date.now(),
      clientName: currentClientName || `Cliente: ${state.form.client_id}`,
      vehiclePlate: currentVehiclePlate || `Vehiculo: ${state.form.vehicle_id}`,
    };

    setPendingServices((prev) => [...prev, newService]);

    setState((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        vehicle_id: 0,
        price: 0,
      },
      error: false,
      errorMsg: "",
    }));
    setSelectVehiculoId(null);
  };

  const handleRemoverFromList = (temId: number) => {
    setPendingServices((prev) => prev.filter((item) => item.temId !== temId));
  };

  const manejadorSubmit = async () => {
    if (pendingServices.length === 0) {
      setState((prev) => ({
        ...prev,
        error: true,
        errorMsg: "No hay servicios agregados en la lista",
      }));
    }

    try {
      const servicesPayload = pendingServices.map((item) => ({
        vehicle_id: item.vehicle_id,
        client_id: item.client_id,
        price: parseFloat(String(item.price)),
        start_date: item.start_date.toISOString().split("T")[0],
        end_date: item.end_date.toISOString().split("T")[0],
      }));

      const dataToSend = { services: servicesPayload };

      console.log("Lote: ", dataToSend);

      const response = await fetch(apiRegistrar, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log("Registro exitoso");
        setPendingServices([]);
        setState(initialState);
        setSuccessMessage("Servicio Registrado con éxito.");
        listarRegistros();
        handleCloseModal();
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error("Error: ", errorData);
        setState((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al registrar",
        }));
      }
    } catch (error) {
      console.error("Error de servidor: ", error);
    }
  };

  const actualizarEstadoPagp = async (
    id: number,
    status: "paid" | "canceled"
  ) => {
    if (!accessToken) return;

    try {
      const urlActualizar = `${actualizarServicio}${status}/${id}`;

      const response = await fetch(urlActualizar, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Estado actualizado correctamente");
        listarRegistros();
        handleCloseModalDetalles();
      } else {
        console.error("Error: ", data.message);
      }
    } catch (error) {
      console.error("Error del servidor: ", error);
    }
  };

  const listarRegistros = async (searchArg?: string, statusArg?: string | null) => {
    if (!accessToken) {
      setStateServicio((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      console.error("Token no encontrado");
      return;
    }

    const searchFinal = searchArg !== undefined ? searchArg: terminoBusqueda

    const statusFinal = statusArg !== undefined ? statusArg : filtroEstado

    setTerminoBusqueda(searchFinal)
    setFiltroEstado(statusFinal)

   let filterContent: any = {};


    if (searchFinal && searchFinal.trim() !== "") {

      filterContent = searchFinal.trim(); 
    }

    if (statusFinal) {
      filterContent = statusFinal; 
    }

    const dataToSend = {
      filterSearch: filterContent,
    };

    console.log("Filtro: ", dataToSend);
    try {
      const response = await fetch(apiObtenerServicios, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      console.log("Datos:  ", data);

      if (response.ok && data.success) {
        const registrosApi = data.details;
        setStateServicio((prev) => ({
          ...prev,
          registros: registrosApi,
        }));
      } else {
        setStateServicio((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al cargar registros",
        }));
        console.error(data.message);
      }
    } catch (error) {
      setStateServicio((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error de conexion",
      }));
      console.error("Error del servidor: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const datosParaTabla: ItemPlana[] = useMemo(() => {
    return mapServiciosToTabla(stateServicio.registros);
  }, [stateServicio.registros]);

  const handleView = (itemGenerico: Item) => {
    const itemPlana = itemGenerico as unknown as ItemPlana;

    const registroCompleto = stateServicio.registros.find(
      (r) => r.services.id === itemPlana.id
    );

    if (registroCompleto) {
      handleOpeneModalDetales(registroCompleto);
    } else {
      console.error("No se encuentra ningun registro");
    }
  };

  useEffect(() => {
    listarRegistros();
  }, []);

  const columnas = [
    { key: "factura", header: "N° Factura" },
    { key: "cliente", header: "Cliente" },
    { key: "placa", header: "Placa Vehículo" },
    { key: "fecha_factura", header: "Fecha Factura" },
    { key: "monto_final", header: "Monto" },
    { key: "estado_pago", header: "Estado" },
    { key: "actions", header: "Acciones" },
  ];


  const modalActions = (
    <button
      onClick={manejadorSubmit}
      disabled={pendingServices.length === 0}
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Registrar ({pendingServices.length})
    </button>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpenDetalles, setIsModalOpenDetalles] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<ServicioApi | null>(null);

  const handleOpenModal = () => {
    setState(initialState);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingServices([]);
  };

  const handleOpeneModalDetales = (registro: ServicioApi) => {
    setRegistroSeleccionado(registro);
    setIsModalOpenDetalles(true);
  };

  const handleCloseModalDetalles = () => {
    setRegistroSeleccionado(null);
    setIsModalOpenDetalles(false);
  };

  const contadorServicios = useMemo(() => {
    const contador = {
      paid: 0,
      pending: 0,
      canceled: 0,
      total: stateServicio.registros.length,
    };

    return stateServicio.registros.reduce((acc, registro) => {
      const estado = registro.services.payment_status as keyof typeof contador;

      if (estado in acc) {
        acc[estado]++;
      }
      return acc;
    }, contador);
  }, [stateServicio.registros]);

  const estadoOriginal = registroSeleccionado?.services
    .payment_status as EnglishStatus;
  const estadoEspanol = traducirEstado(estadoOriginal);

  const renderDetallesBody = useMemo(() => {
    if (!registroSeleccionado) return null;

    return (
      <div className="space-y-6 p-2 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2 border-b pb-1">
              Información del Cliente
            </h3>
            <p>
              <span className="font-semibold">Nombre:</span>{" "}
              {registroSeleccionado.client.name}
            </p>
            <p>
              <span className="font-semibold">RIF:</span>{" "}
              {registroSeleccionado.client.rif}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2 border-b pb-1">
              Información del Vehículo
            </h3>
            <p>
              <span className="font-semibold">Placa:</span>{" "}
              {registroSeleccionado.vehicle.license_plate}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h3 className="font-bold text-gray-900 mb-2">Cronograma</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase">Inicio</p>
              <p className="font-medium">
                {new Date(
                  registroSeleccionado.services.star_date
                ).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Fin</p>
              <p className="font-medium">
                {new Date(
                  registroSeleccionado.services.end_date
                ).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Facturación</p>
              <p className="font-medium">
                {new Date(
                  registroSeleccionado.services.invoice_date
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t">
          

          

          {/* <div className="flex justify-between items-center mb-2 text-red-600">
            <span>
              Retención ISRL ({registroSeleccionado.retentions.rate_retention}
              %):
              <span className="text-xs text-gray-500 ml-1">
                ({registroSeleccionado.retentions.code_retention})
              </span>
            </span>
            <span className="font-mono">
              Bs -
              {parseFloat(
                registroSeleccionado.retentions.total_retention
              ).toFixed(2)}
            </span>
          </div> */}

          <div className="flex justify-between items-center mt-4 pt-2  border-gray-300">
            <span className="font-bold text-lg">Monto Total a Pagar:</span>
            <span className="font-bold text-xl text-blue-600 font-mono">
              Bs {registroSeleccionado.totalAmount}
            </span>
          </div>

          <div className="mt-4 flex justify-end">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                ${
                  estadoEspanol === "Pagado"
                    ? "bg-green-100 text-green-700"
                    : estadoEspanol === "Pendiente"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              Estado: {estadoEspanol}
            </span>
          </div>
        </div>
      </div>
    );
  }, [registroSeleccionado]);

  const renderDetallesAcciones = useMemo(() => {
    if (
      !registroSeleccionado ||
      registroSeleccionado.services.payment_status !== "pending"
    ) {
      return null;
    }

    const id = registroSeleccionado.services.id;

    return (
      <>
        <button
          onClick={() => {
            if (
              window.confirm(
                "¿Estás seguro de que deseas cancelar este servicio?"
              )
            ) {
              actualizarEstadoPagp(id, "canceled");
            }
          }}
          className="btn bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300"
        >
          Cancelar Pago
        </button>

        <button
          onClick={() => {
            if (window.confirm("¿Confirmar recepción del pago?")) {
              actualizarEstadoPagp(id, "paid");
            }
          }}
          className="btn bg-green-600 text-white hover:bg-green-700 border-green-600"
        >
          Registrar Pago
        </button>
      </>
    );
  }, [registroSeleccionado, actualizarEstadoPagp]);

  return (
    <>
      <main className="min-h-screen">
        {successMessage && (
          <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => setSuccessMessage(null)}
            >
              &times;
            </span>
          </div>
        )}
        <section className="flex flex-col flex-grow w-full items-center pl-4 pr-4">
          <ToolBar
            titulo="Servicios Prestados"
            onSearch={(texto) => listarRegistros(texto)}
            onRegister={handleOpenModal}
          />
          {isLoading ? (
            <div className="w-full flex items-center justify-center py-6">
              <span className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <>
              <div className="flex flex-row mb-4 w-full items-start gap-5">
                <button onClick={() => listarRegistros(undefined, null)} className={`cursor-pointer p-4 bg-white border border-gray-400 rounded-lg shadow-sm ${filtroEstado === null
                  ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-700 font-bold"
                  : "bg-white border-gray-400 hover:bg-gray-50 text-gray-700"
                }`}>
                Total: {contadorServicios.total}
                </button>
                <button onClick={() => listarRegistros(undefined, "pagado")} className={`cursor-pointer p-4 bg-white border border-gray-400 rounded-lg shadow-sm ${filtroEstado === "pagado"
                  ? "bg-blue-50 border-green-500 ring-1 ring-green-500 text-green-700 font-bold"
                  : "bg-white border-gray-400 hover:bg-gray-50 text-gray-700"
                }`}>
                   Pagados: {contadorServicios.paid}
                </button>
                <button onClick={() => listarRegistros(undefined, "pendiente")} className={`cursor-pointer p-4 bg-white border border-gray-400 rounded-lg shadow-sm ${filtroEstado === "pendiente"
                  ? "bg-blue-50 border-yellow-500 ring-1 ring-yellow-500 text-yellow-700 font-bold"
                  : "bg-white border-gray-400 hover:bg-gray-50 text-gray-700"
                }`}>
                  Pendientes: {contadorServicios.pending}
                </button>
                <button onClick={() => listarRegistros(undefined, "cancelado")} className={`cursor-pointer p-4 bg-white border border-gray-400 rounded-lg shadow-sm ${filtroEstado === "cancelado"
                  ? "bg-blue-50 border-red-500 ring-1 ring-red-500 text-red-700 font-bold"
                  : "bg-white border-gray-400 hover:bg-gray-50 text-gray-700"
                }`}>
                  Cancelados: {contadorServicios.canceled}
                </button>
              </div>
              <Table
                data={datosParaTabla}
                columnas={columnas}
                onView={handleView}
              />
            </>
          )}
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Servicio"
        acciones={modalActions}
      >
        <div className="grid grid-cols-1 gap-4">
         
          <div className="border border-gray-400 p-4 rounded-md ">
            <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">
              Datos del Servicio
            </h4>
            <form id="FormularioServicio" className="grid grid-cols-2 gap-3">
             
              <div>
                <SelectClientes
                  endpointUrl={urlClientes}
                  onClienteChange={(id, name) =>
                    handleClienteChange(id, name || undefined)
                  } 
                />
              </div>
              <div>
                <SelectVehiculos
                  endpointUrl={urlVehiculos}
                  onVehiculoChange={(id, placa) =>
                    handleVehiculoChange(id, placa || undefined)
                  } 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio:
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formatDateToInput(state.form.start_date)}
                  onChange={handleDateChange}
                  className="border border-gray-400 rounded-md shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin:
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formatDateToInput(state.form.end_date)}
                  onChange={handleDateChange}
                  className="border border-gray-400 rounded-md shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                />
              </div>

              <div className="flex items-end gap-2 col-span-2">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio:
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="price"
                    value={state.form.price}
                    onChange={handleInputChange}
                    className="border border-gray-400 rounded-md shadow-xs w-full p-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                  />
                </div>
                <button
                  onClick={handleAddToList}
                  type="button" 
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded h-10 mb-[1px]"
                >
                  + Agregar a Lista
                </button>
              </div>
            </form>

            {state.error && (
              <p className="text-red-500 text-sm mt-2">{state.errorMsg}</p>
            )}
          </div>

          <div className="border border-gray-400 rounded-md overflow-hidden">
            <div className="bg-gray-100 p-2 font-semibold text-sm border-b flex justify-between">
              <span>Servicios por Registrar</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {pendingServices.length}
              </span>
            </div>

            <div className="max-h-30 overflow-y-auto">
              {pendingServices.length === 0 ? (
                <p className="text-gray-400 text-sm p-4 text-center">
                  Agregue servicios usando el formulario de arriba.
                </p>
              ) : (
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Cliente / Vehículo</th>
                      <th className="px-3 py-2">Fechas</th>
                      <th className="px-3 py-2">Precio</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingServices.map((item) => (
                      <tr key={item.temId}>
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-900">
                            {item.clientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.vehiclePlate}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {item.start_date.toLocaleDateString()} -{" "}
                          {item.end_date.toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 font-mono">{item.price}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => handleRemoverFromList(item.temId)}
                            className="text-red-500 hover:text-red-700 font-bold"
                            title="Eliminar de la lista"
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        <div className="min-h-6 text-center">
          {state.error && (
            <span className="text-center text-red-500 text-sm m-0">
              {state.errorMsg}
            </span>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={isModalOpenDetalles}
        onClose={handleCloseModalDetalles}
        titulo="Detalles de Servicio"
        acciones={renderDetallesAcciones}
      >
        {renderDetallesBody}
      </Modal>
    </>
  );
}

export default Servicios;
