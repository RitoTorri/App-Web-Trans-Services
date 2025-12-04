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
import type { EnglishStatus} from "../mappers/servicioMapper";
import { traducirEstado } from "../mappers/servicioMapper";

interface RegisterFormState {
  vehicle_id: number;
  client_id: number;
  price: number;
  start_date: Date;
  end_date: Date;
  isrl: number;
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
    isrl: 0,
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
  registros: [] as  [],
  error: false,
  errorMsg: "",
};

const formatDateToInput = (date: Date): string => {
  // Si la fecha existe y es un objeto Date, la formatea.
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }
  return "";
};

function Servicios() {
  const accessToken = localStorage.getItem("token");
  const [state, setState] = useState<RegisterState>(initialState);

  const [selectClienteId, setSelectClienteId] = useState<number | null>(null);
  const [selectVehiculoId, setSelectVehiculoId] = useState<number | null>(null);

  const [stateServicio, setStateServicio] = useState<ServiciosState>(
    initialServiciosState
  );

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  const handleClienteChange = (id: number | null) => {
    setSelectClienteId(id);
    setState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        client_id: id ?? 0,
      },
    }));
  };

  const handleVehiculoChange = (id: number | null) => {
    setSelectVehiculoId(id);
    console.log("VehiculoSeleccionado: ", id);
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

  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({ ...prevState, error: false, errorMsg: "" }));

    if (
      !state.form.client_id ||
      !state.form.vehicle_id ||
      !state.form.start_date ||
      !state.form.end_date ||
      !state.form.isrl ||
      !state.form.price
    ) {
      setState((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Por favor, complete todos los datos.",
      }));
      return;
    }

    try {
      const { client_id, vehicle_id, start_date, end_date, isrl, price } =
        state.form;

      const dataToSend = {
        client_id,
        vehicle_id,
        start_date: start_date.toISOString().split("T")[0],
        end_date: end_date.toISOString().split("T")[0],
        isrl: parseFloat(String(isrl)),
        price: parseFloat(String(price)),
      };

      console.log(dataToSend);

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
        setState(initialState);
        setSuccessMessage("Servicio Registrado con éxito.")
        listarRegistros();
        handleCloseModal();

        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } else {
        const errorData = await response.json();
        console.error("Error: ", errorData);
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

  const listarRegistros = async (terminoBusqueda = "") => {
    if (!accessToken) {
      setStateServicio((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      console.error("Token no encontrado");
      return;
    }

    let filterBody = {
      filterSearch: {},
    };

    if (terminoBusqueda && terminoBusqueda.trim() !== "") {
      filterBody = {
        filterSearch: terminoBusqueda,
      };
    }

    console.log("Filtro: ", filterBody);
    try {
      const response = await fetch(apiObtenerServicios, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(filterBody),
      });

      const data = await response.json();

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
    }finally{
      setIsLoading(false)
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
    { key: "monto_final", header: "Monto Neto" },
    { key: "estado_pago", header: "Estado" },
    { key: "actions", header: "Acciones" },
  ];

  const userRegistro = (
    //Logica para el envío del formulario
    <button
      form="FormularioServicio"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Registrar
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

  const estadoOriginal = registroSeleccionado?.services.payment_status as EnglishStatus
  const estadoEspanol = traducirEstado(estadoOriginal)

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

        <div className="border-t pt-4">
          <h3 className="font-bold text-lg text-gray-900 mb-3">
            Resumen Financiero
          </h3>

          <div className="flex justify-between items-center mb-2">
            <span>Precio Base:</span>
            <span className="font-mono text-gray-600">
              Bs {parseFloat(registroSeleccionado.services.price).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center mb-2 text-red-600">
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
          </div>

          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-300">
            <span className="font-bold text-lg">Monto Total a Pagar:</span>
            <span className="font-bold text-xl text-blue-600 font-mono">
              Bs {registroSeleccionado.totalAmount.toFixed(2)}
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
            onSearch={listarRegistros}
            onRegister={handleOpenModal}
          />
          { isLoading ? (
            <div className="w-full flex items-center justify-center py-6">
              <span className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <>
          <div className="flex flex-row mb-4 w-full items-start gap-5">
            <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
              <span>Total: {contadorServicios.total}</span>
            </div>
            <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
              <span>Servicios Pagados: {contadorServicios.paid}</span>
            </div>
            <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
              <span>Servicios Pendintes: {contadorServicios.pending}</span>
            </div>
            <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
              <span>Servicios Cancelados: {contadorServicios.canceled}</span>
            </div>
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
        acciones={userRegistro}
      >
        <form
          id="FormularioServicio"
          onSubmit={manejadorSubmit}
          className="grid grid-cols-2 gap-3"
        >
          <div>
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
