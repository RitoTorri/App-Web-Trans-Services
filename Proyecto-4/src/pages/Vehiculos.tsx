import ToolBar from "../components/Table/ToolBar";
import type { Vehiculo, Empleado, TipoVehiculo, Item } from "../types/models";
import Modal from "../components/Modal/Modal";
import { useState, useEffect } from "react";
import Table from "../components/Table/Table";
import {
  apiRegistrar,
  apiEditar,
  apiVehiculos,
  apiEliminar,
  apiReactivar,
  apiExportar,
  apiDisponibilidad,
} from "../services/apiVehiculos";
import { apiObtener as apiObtenerEmpleados } from "../services/apiEmpleados";
import { apiObtenerTipo } from "../services/apiTipo_vehiculos";
import {
  apiListarModelos,
  apiRegistrarModelo,
} from "../services/apiModelVehiculo";

interface RegisterFormState {
  driver_id: number;
  vehicle_model_id: number;
  license_plate: string;
  total_seats: number;
  vehicle_type_id: number;
}

interface RegisterState {
  form: RegisterFormState;
  error: boolean;
  errorMsg: string;
}

const initialState: RegisterState = {
  form: {
    driver_id: 0,
    vehicle_model_id: 0,
    license_plate: "",
    total_seats: 0,
    vehicle_type_id: 0,
  },
  error: false,
  errorMsg: "",
};

interface VehiculosState {
  registros: Vehiculo[];
  error: boolean;
  errorMsg: string;
}

const initialStateVehiculos: VehiculosState = {
  registros: [] as Vehiculo[],
  error: false,
  errorMsg: "",
};

interface VehiculoEditarState {
  id: number | null;
  driver_id: number;
  model: number;
  license_plate: string;
  total_seats: number;
  vehicle_type_id: number;
  error: boolean;
  errorMsg: string;
}

const initialStateVehiculoEditar: VehiculoEditarState = {
  id: null,
  driver_id: 0,
  model: 0,
  license_plate: "",
  total_seats: 0,
  vehicle_type_id: 0,
  error: false,
  errorMsg: "",
};

function Vehiculos() {
  const accessToken = localStorage.getItem("token");
  const rolUser = localStorage.getItem("rol")
  const [state, setState] = useState<RegisterState>(initialState);
  const [stateVehiculos, setStateVehiculos] = useState<VehiculosState>(
    initialStateVehiculos
  );
  const [vehiculosInactivos, setVehiculosInactivos] = useState<Vehiculo[]>([]);

  //lista de empleados(con rol choferes)
  const [listaChoferes, setListaChoferes] = useState<Empleado[]>([]);

  // tipos de vehículo
  const [listaTiposVehiculo, setListaTiposVehiculo] = useState<TipoVehiculo[]>(
    []
  );

  // Modelos de vehículo
  const [listaModelos, setListaModelos] = useState<{ id: number; name: string }[]>([]);
  const [isModalModelOpen, setIsModalModelOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [vehiculoEditar, setVehiculoEditar] = useState<VehiculoEditarState>(
    initialStateVehiculoEditar
  );
  const [camposModificados, setCamposModificados] = useState<
    Partial<VehiculoEditarState>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [isModalOpenRestore, setIsModalOpenRestore] = useState(false);

  const [isExportar, setIsExportar] = useState<boolean>(false);

  const [vistaActual, setVistaActual] = useState<"activos" | "inactivos">(
    "activos"
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehiculo | null>(null);

  // Availability State
  const [isModalAvailabilityOpen, setIsModalAvailabilityOpen] = useState(false);
  const [availabilityDates, setAvailabilityDates] = useState({ startDate: "", endDate: "" });
  const [availableVehicles, setAvailableVehicles] = useState<Vehiculo[]>([]);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const handleOpenModal = () => {
    setState(initialState);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModalEdit = (vehiculo: Vehiculo) => {
    setVehiculoEditar({
      id: vehiculo.id,
      driver_id: vehiculo.driver_id,
      model: vehiculo.model,
      license_plate: vehiculo.license_plate,
      total_seats: vehiculo.total_seats,
      vehicle_type_id: vehiculo.vehicle_type_id,
      error: false,
      errorMsg: "",
    });
    setIsModalOpenEdit(true);
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
  };

  const exportarRegistros = async () => {
    if (!accessToken) {
      console.error("Token no encontrado");
      return;
    }

    setIsExportar(true);

    try {
      const response = await fetch(apiExportar, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        try {
          const errorData = JSON.parse(errorMsg);
          console.error("Error al exportar: ", errorData.message);
        } catch (error) {
          console.error("Error desconocido: ", errorMsg);
        }
        return
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;

      a.download = "reporte_vehiculos.pdf";

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      console.log("Reporte descrgado");
    } catch (error) {
      console.error("Error del Servidor: ", error);
    } finally {
      setIsExportar(false);
    }
  };

  //funcion para los empleados activos con rol de chofer  y activos
  const cargarChoferes = async () => {
    if (!accessToken) return;

    const url = `${apiObtenerEmpleados}true/all`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const soloChoferes = data.details.filter(
          (emp: Empleado) => emp.rol.toLowerCase() === "chofer"
        );

        setListaChoferes(soloChoferes);
      } else {
        console.error("Error al cargar choferes:", data.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  //funcion para obtener los tipos de vehiculos
  const cargarTiposVehiculo = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(apiObtenerTipo, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setListaTiposVehiculo(data.details);
      } else {
        console.error("Error al cargar tipos de vehículo:", data.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  // Cargar Modelos
  const cargarModelos = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(apiListarModelos, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setListaModelos(data.details);
      }
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

  const handleInputChangeEdit = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setVehiculoEditar((prevState) => ({
      ...prevState,
      [name]: value,
      error: false,
      errorMsg: "",
    }));

    setCamposModificados((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  //carga registros de vehiculos
  const listarRegistros = async (terminoBusqueda = "") => {
    setIsLoading(true);
    if (!accessToken) {
      setStateVehiculos((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      console.error("DEBUG: Token no encontrado.");
      return;
    }

    const urlBusqueda = apiVehiculos;

    try {
      const response = await fetch(urlBusqueda, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      console.log("Datos",data)

      if (response.ok && data.success) {
        let registrosApi = data.details;
        
        if (terminoBusqueda && terminoBusqueda.trim() !== "") {
          const busqueda = terminoBusqueda.toLowerCase();
          registrosApi = registrosApi.filter((vehiculo: Vehiculo) => {
            return (
              (vehiculo.model &&
                vehiculo.model.toLowerCase().includes(busqueda)) ||
              (vehiculo.license_plate &&
                vehiculo.license_plate.toLowerCase().includes(busqueda))
            );
          });
        }

        setStateVehiculos((prev) => ({
          ...prev,
          registros: registrosApi.filter(
            (v: Vehiculo) => v.is_active !== false
          ),
        }));
        setVehiculosInactivos(
          registrosApi.filter((v: Vehiculo) => v.is_active === false)
        );
      } else {
        setStateVehiculos((prevState) => ({
          ...prevState,
          error: true,
          errorMsg: data.message || "Error al cargar registros",
        }));

        console.error("Fallo: ", data.message);
      }
    } catch (error) {
      setStateVehiculos((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Error de conexion",
      }));
      console.error("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    listarRegistros();
    cargarChoferes();
    cargarTiposVehiculo();
    cargarModelos();
  }, []);

  // Registrar Nuevo Modelo
  const handleRegistrarModelo = async () => {
    if (!newModelName.trim()) return;
    try {
      const response = await fetch(apiRegistrarModelo, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: newModelName }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage("Modelo registrado exitosamente.");
        cargarModelos(); // Refresh list
        setNewModelName("");
        setIsModalModelOpen(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(data.message || "Error al registrar modelo.");
      }
    } catch (error) {
      console.error("Error registering model:", error);
    }
  };

  //registrar vehiculo
  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({ ...prevState, error: false, errorMsg: "" }));

    if (
      !state.form.driver_id ||
      !state.form.vehicle_model_id ||
      !state.form.license_plate ||
      !state.form.total_seats ||
      !state.form.vehicle_type_id
    ) {
      setState((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Por favor complete todos los campos.",
      }));
      return;
    }
    try {
      const { driver_id, vehicle_model_id, license_plate, total_seats, vehicle_type_id} =
        state.form;

      const dataToSend = {
        driver_id: Number(driver_id),
        vehicle_model_id: Number(vehicle_model_id),
        license_plate: license_plate,
        total_seats: Number(total_seats),
        vehicle_type_id: Number(vehicle_type_id)
      };

      console.log("URL: ",apiRegistrar)

      const response = await fetch(apiRegistrar, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      console.log("Datos enviados:",dataToSend);

      

      if (response.ok) {
        console.log("Registrado con exito");
        setState(initialState);
        listarRegistros();
        setSuccessMessage("vehiculo registrado con éxito.");
        handleCloseModal();

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        const errorText = await response.text()
        console.error("Error del servidor: ",errorText)
        try{
          const errorData = JSON.parse(errorText);
            setState((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: errorData.message || "Error al registrar.",
            }));
        }catch(e){
          console.log("status: ",response.status)
        }
      }
    } catch (error) {
      console.error("Error de conexion: ", error);
      setState((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "No se puede conectar al servidor",
      }));
    }
  };

  //editar vehiculo
  const manejadorSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();

    setVehiculoEditar((prevState) => ({
      ...prevState,
      error: false,
      errorMsg: "",
    }));

    if (Object.keys(camposModificados).length === 0) {
      setVehiculoEditar((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "No se han detectado cambios",
      }));
      return;
    }

    if (vehiculoEditar.id !== null) {
      await editarRegistro(vehiculoEditar.id, camposModificados);
    }

    if (
      !vehiculoEditar.driver_id ||
      !vehiculoEditar.model ||
      !vehiculoEditar.license_plate ||
      !vehiculoEditar.total_seats ||
      !vehiculoEditar.vehicle_type_id
    ) {
      setVehiculoEditar((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Por favor, complete los campos obligatorios.",
      }));
      return;
    }
  };

  const editarRegistro = async (idEditar: number, datosEditar: any) => {
    if (!accessToken) {
      setStateVehiculos((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      return;
    }

    /// 1. Preparar datos para la API (Renombrar drive_id a driver_id)
    const payload = {
      ...(datosEditar.driver_id && {
        driver_id: Number(datosEditar.driver_id),
      }),
      ...(datosEditar.model && { model: datosEditar.model }),
      ...(datosEditar.total_seats && {
        total_seats: Number(datosEditar.total_seats),
      }),
      ...(datosEditar.vehicle_type_id && {
        vehicle_type_id: Number(datosEditar.vehicle_type_id),
      }),
      // is_active: true // Opcional según tu lógica
    };

    // 2. Necesitamos la placa actual para la URL.
    // Como 'vehiculoEditar' es un estado global, podemos acceder a la placa vieja desde ahí:
    const placaParaUrl = vehiculoEditar.license_plate;

    // 3. Construir URL: .../updateVehicle/:license_plate
    // Nota: Asegúrate que 'apiEditar' termine con "/" -> "http://.../updateVehicle/"
    const urlEdicion = `${apiEditar}${placaParaUrl}`;

    try {
      const response = await fetch(urlEdicion, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok && data.success) {
        console.log("Registro Editado");
        handleCloseModalEdit();
        setSuccessMessage("Vehiculo editado con éxito.");
        listarRegistros();
        setCamposModificados({});
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        console.error("Error en la edicion: ", data.message);
        setVehiculoEditar((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al intentar editar",
        }));
      }
    } catch (error) {
      console.error("Error de conexión: ", error);
      setVehiculoEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error al conectar al servidor.",
      }));
    }
  };

  const handleOpenModalDelete = (vehiculo: Vehiculo) => {
    setSelectedVehicle(vehiculo);
    setIsModalOpenDelete(true);
  };

  const handleCloseModalDelete = () => {
    setIsModalOpenDelete(false);
    setSelectedVehicle(null);
  };

  const handleOpenModalRestore = (vehiculo: Vehiculo) => {
    setSelectedVehicle(vehiculo);
    setIsModalOpenRestore(true);
  };

  const handleCloseModalRestore = () => {
    setIsModalOpenRestore(false);
    setSelectedVehicle(null);
  };

  const eliminarVehiculo = async () => {
    if (!accessToken || !selectedVehicle) return;

    try {
      const urlEliminar = `${apiEliminar}${selectedVehicle.license_plate.trim()}`;

      const response = await fetch(urlEliminar, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage("Vehículo desactivado con éxito.");
        handleCloseModalDelete();
        listarRegistros();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error("Error al eliminar:", data.message);
        // Podrías manejar un estado de error específico para el modal si lo deseas
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const reactivarVehiculo = async () => {
    if (!accessToken || !selectedVehicle) return;

    try {
      const urlReactivar = `${apiReactivar}${selectedVehicle.license_plate.trim()}`;
      const response = await fetch(urlReactivar, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage("Vehículo reactivado con éxito.");
        handleCloseModalRestore();
        listarRegistros();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error("Error al reactivar:", data.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }

  };

  const checkAvailability = async () => {
    if (!availabilityDates.startDate || !availabilityDates.endDate) {
      setAvailabilityError("Por favor seleccione fecha de inicio y fin.");
      return;
    }
    setAvailabilityError(null);
    try {
      const response = await fetch(`${apiDisponibilidad}?startDate=${availabilityDates.startDate}&endDate=${availabilityDates.endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAvailableVehicles(data.details);
      } else {
        setAvailabilityError(data.message || "Error al consultar disponibilidad.");
        setAvailableVehicles([]);
      }
    } catch (error) {
      setAvailabilityError("Error de conexión.");
      setAvailableVehicles([]);
    }
  };

  let columnas = [
    {
      key: "driver_id",
      header: "NOMBRE CONDUCTOR",
      render: (item: Item) => {
        const vehiculo = item as Vehiculo;
        const chofer = listaChoferes.find((c) => c.id === vehiculo.driver_id);
        return chofer ? `${chofer.name} ${chofer.lastname}` : "Sin Asignar";
      },
    },
    // {
    //   key: "model",
    //   header: "MODELO",
    //   render: (item: Item) => {
    //     const vehiculo = item as Vehiculo;
    //     // If model is an ID, find the name in listaModelos
    //     const modelo = listaModelos.find(m => m.id === vehiculo.model);
    //     return modelo ? modelo.name : vehiculo.model; // Fallback if it's still a string or not found
    //   }
    // },
    { key: "license_plate", header: "PLACA" },
    { key: "total_seats", header: "TOTAL ASIENTOS" },
    {
      key: "vehicle_type_id",
      header: "TIPO VEHICULO",
      render: (item: Item) => {
        const vehiculo = item as Vehiculo;
        const tipo = listaTiposVehiculo.find(
          (t) => t.id === vehiculo.vehicle_type_id
        );
        return tipo ? tipo.type_name : "Desconocido";
      },
    },
  ];

  if(rolUser === "SuperUsuario"){
    const columnaAcciones = { key: "actions", header: "Acciones" }
    columnas.push(columnaAcciones)
  }

  const onDeleteHandler = (id: number, nombre?: string) => {
    const vehiculo = stateVehiculos.registros.find((v) => v.id === id);
    if (vehiculo) handleOpenModalDelete(vehiculo);
  };

  const onRestoreHandler = (id: number, nombre?: string) => {
    const vehiculo = vehiculosInactivos.find((v) => v.id === id);
    if (vehiculo) handleOpenModalRestore(vehiculo);
  };

  const userRegistro = (
    <button
      form="FormularioVehiculo"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Registrar
    </button>
  );

  const userEdit = (
    <button
      form="FormularioEditarVehiculo"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Editar
    </button>
  );

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
        <section className="flex flex-col flex-grow items-center pl-4 pr-4">
          <ToolBar
            titulo="Vehículos"
            onRegister={handleOpenModal}
            onSearch={listarRegistros}
            onExport={exportarRegistros}
            isExporting={isExportar}
          />

          <div className="w-full flex justify-end mb-4 px-2">
            <button
              onClick={() => setIsModalAvailabilityOpen(true)}
              className="btn bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-check" viewBox="0 0 16 16">
                <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
              </svg>
              Consultar Disponibilidad
            </button>
          </div>

          <div className="w-full  flex items-center justify-around border border-gray-400 border-b-white rounded-lg rounded-b-none  shadow-md bg-white p-2">
            <button
              onClick={() => setVistaActual("activos")}
              className={` ${vistaActual === "activos"
                ? "py-1 px-2 border-b-3  border-green-500 transition duration-300 cursor-pointer"
                : "cursor-pointer"
                } `}
            >
              Vehículos Activos ({stateVehiculos.registros.length})
            </button>
            <button
              onClick={() => setVistaActual("inactivos")}
              className={` ${vistaActual === "inactivos"
                ? "py-1 px-2 border-b-3  border-red-400 transition duration-300 cursor-pointer "
                : "hover:bg-gray-100 transition-all cursor-pointer"
                } `}
            >
              Vehículos Inactivos ({vehiculosInactivos.length})
            </button>
          </div>

          {isLoading ? (
            <div className="w-full flex items-center justify-center py-6">
              <span className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <Table
              data={
                vistaActual === "activos"
                  ? stateVehiculos.registros
                  : vehiculosInactivos
              }
              columnas={columnas}
              onEdit={
                vistaActual === "activos"
                  ? (item) => handleOpenModalEdit(item as Vehiculo)
                  : undefined
              }
              onDelete={vistaActual === "activos" ? onDeleteHandler : undefined}
              onRestore={
                vistaActual === "inactivos" ? onRestoreHandler : undefined
              }
              emptyMessage={`No hay vehículos ${vistaActual}.`}
            />
          )}
        </section>
      </main>


      {/* Modal Disponibilidad */}
      <Modal
        isOpen={isModalAvailabilityOpen}
        onClose={() => setIsModalAvailabilityOpen(false)}
        titulo="Consultar Disponibilidad"
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="form-control w-full">
              <label className="label"><span className="label-text">Fecha Inicio</span></label>
              <input
                type="date"
                className="input input-bordered"
                value={availabilityDates.startDate}
                onChange={(e) => setAvailabilityDates(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="form-control w-full">
              <label className="label"><span className="label-text">Fecha Fin</span></label>
              <input
                type="date"
                className="input input-bordered"
                value={availabilityDates.endDate}
                onChange={(e) => setAvailabilityDates(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={checkAvailability}
          >
            Buscar Disponibles
          </button>

          {availabilityError && (
            <div className="alert alert-error text-sm py-2">
              {availabilityError}
            </div>
          )}

          <div className="divider">Resultados</div>

          <div className="overflow-y-auto max-h-60">
            {availableVehicles.length > 0 ? (
              <table className="table table-compact w-full">
                <thead>
                  <tr>
                    <th>Modelo</th>
                    <th>Placa</th>
                    <th>Asientos</th>
                  </tr>
                </thead>
                <tbody>
                  {availableVehicles.map(v => (
                    <tr key={v.id}>
                      <td>{v.model}</td>
                      <td>{v.license_plate}</td>
                      <td>{v.total_seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500">No hay resultados o no se ha realizado la búsqueda.</p>
            )}
          </div>

          <div className="modal-action">
            <button className="btn" onClick={() => setIsModalAvailabilityOpen(false)}>Cerrar</button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Vehículo"
        acciones={userRegistro}
      >
        <form
          id="FormularioVehiculo"
          onSubmit={manejadorSubmit}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label
              htmlFor="driver_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Chofer Asignado:
            </label>

            <select
              name="driver_id"
              value={state.form.driver_id}
              onChange={handleInputChange}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">-- Seleccione un Chofer --</option>

              {listaChoferes.map((chofer) => (
                <option key={chofer.id} value={chofer.id}>
                  {chofer.name} {chofer.lastname} (C.I: {chofer.ci})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="license_plate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Placa:
            </label>
            <input
              type="string"
              name="license_plate"
              onChange={handleInputChange}
              value={state.form.license_plate}
              placeholder="Ingrese Placa:"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="total_seats"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Numero De Asientos:
            </label>
            <input
              type="number"
              name="total_seats"
              onChange={handleInputChange}
              value={state.form.total_seats}
              placeholder="Ingrese el numero de AST"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="vehicle_type_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de Vehículo:
            </label>
            <select
              name="vehicle_type_id"
              value={state.form.vehicle_type_id}
              onChange={handleInputChange}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 uppercase"
            >
              <option value="">-- Seleccione Tipo --</option>

              {listaTiposVehiculo.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.type_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Modelo:
            </label>
            <div className="flex gap-2">
              <select
                name="vehicle_model_id"
                value={state.form.vehicle_model_id}
                onChange={handleInputChange}
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="">-- Seleccione Modelo --</option>
                {listaModelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsModalModelOpen(true);
                }}
                className="btn bg-green-500 hover:bg-green-600 text-white mb-2"
              >
                +
              </button>
            </div>
          </div>
          <div className="min-h-6 text-center">
            {state.error && (
              <span className="text-center text-red-500 text-sm m-0">
                {state.errorMsg}
              </span>
            )}
          </div>
        </form>
      </Modal >

      {/* Modal Editar */}
      < Modal
        isOpen={isModalOpenEdit}
        onClose={handleCloseModalEdit}
        titulo="Editar Vehículo"
        acciones={userEdit}
      >
        <form
          id="FormularioEditarVehiculo"
          onSubmit={manejadorSubmitEditar}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label
              htmlFor="driver_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Chofer Asignado:
            </label>

            <select
              name="driver_id"
              value={vehiculoEditar.driver_id}
              onChange={handleInputChangeEdit}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">-- Seleccione un Chofer --</option>

              {listaChoferes.map((chofer) => (
                <option key={chofer.id} value={chofer.id}>
                  {chofer.name} {chofer.lastname} (C.I: {chofer.ci})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="license_plate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Placa:
            </label>
            <input
              type="string"
              name="license_plate"
              value={vehiculoEditar.license_plate}
              readOnly
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in bg-gray-200 cursor-not-allowed"
            />
          </div>
          <div>
            <label
              htmlFor="total_seats"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Numero De Asientos:
            </label>
            <input
              type="number"
              name="total_seats"
              onChange={handleInputChangeEdit}
              value={vehiculoEditar.total_seats}
              placeholder="Ingrese el numero de AST"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="vehicle_type_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de Vehículo:
            </label>
            <select
              name="vehicle_type_id"
              value={vehiculoEditar.vehicle_type_id}
              onChange={handleInputChangeEdit}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 uppercase"
            >
              <option value="">-- Seleccione Tipo --</option>

              {listaTiposVehiculo.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.type_name}
                </option>
              ))}
            </select>
          </div>
          {/* <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Modelo:
            </label>
            <input
              type="text"
              name="model"
              onChange={handleInputChangeEdit}
              value={vehiculoEditar.model}
              placeholder="Ingrese el numero de AST"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div> */}
          <div className="min-h-6 text-center">
            {vehiculoEditar.error && (
              <span className="text-center text-red-500 text-sm m-0">
                {vehiculoEditar.errorMsg}
              </span>
            )}
          </div>
        </form>
      </Modal >

      {/* Modal Eliminar */}
      < Modal
        isOpen={isModalOpenDelete}
        onClose={handleCloseModalDelete}
        titulo="Desactivar Vehículo"
        acciones={
          < button
            onClick={eliminarVehiculo}
            className="btn bg-red-500 hover:bg-red-600 text-white"
          >
            Desactivar
          </button >
        }
      >
        <p>
          ¿Estás seguro de que deseas desactivar el vehículo con placa{" "}
          <strong>{selectedVehicle?.license_plate}</strong>?
        </p>
      </Modal >

      {/* Modal Restaurar */}
      < Modal
        isOpen={isModalOpenRestore}
        onClose={handleCloseModalRestore}
        titulo="Reactivar Vehículo"
        acciones={
          < button
            onClick={reactivarVehiculo}
            className="btn bg-green-500 hover:bg-green-600 text-white"
          >
            Reactivar
          </button >
        }
      >
        <p>
          ¿Estás seguro de que deseas reactivar el vehículo con placa{" "}
          <strong>{selectedVehicle?.license_plate}</strong>?
        </p>
      </Modal >

      {/* Modal Nuevo Modelo */}
      < Modal
        isOpen={isModalModelOpen}
        onClose={() => {
          setIsModalModelOpen(false);
          setIsModalOpen(true); // Reopen main modal
        }}
        titulo="Registrar Nuevo Modelo"
        acciones={
          < button
            onClick={handleRegistrarModelo}
            className="btn bg-blue-500 hover:bg-blue-600 text-white"
          >
            Guardar
          </button >
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Modelo:</label>
          <input
            type="text"
            value={newModelName}
            onChange={(e) => setNewModelName(e.target.value)}
            className="border border-gray-400 rounded-md w-full p-3"
            placeholder="Ej: Toyota Corolla"
          />
        </div>
      </Modal >
    </>
  );
}

export default Vehiculos;
