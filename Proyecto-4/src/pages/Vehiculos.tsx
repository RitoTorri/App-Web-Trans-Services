import ToolBar from "../components/Table/ToolBar";
import type { Vehiculo, Empleado, TipoVehiculo } from "../types/models";//cambiamos el item x vehiculo y traemos la clase empleado
import Modal from "../components/Modal/Modal";
import { useState, useEffect } from "react";
import Table from "../components/Table/Table";
import { apiRegistrar, apiObtener, apiEditar } from "../services/apiVehiculos";
import { apiObtener as apiObtenerEmpleados } from "../services/apiEmpleados";//le cambiamos el nombre en este caso para no generar errores de sintaxis

import { apiObtenerTipo } from "../services/apiTipo_vehiculos";

//interfaces actualizadas para coincidir con la api
interface RegisterFormState {
  driver_id: number,
  model: string,
  license_plate: string,
  total_seats: number,
  vehicle_type_id: number
}

interface RegisterState {
  form: RegisterFormState;
  error: boolean;
  errorMsg: string;
}

const initialState: RegisterState = {
  form: {
    driver_id: 0,
    model: "",
    license_plate: "",
    total_seats: 0,
    vehicle_type_id: 0
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
  model: string;
  license_plate: string;
  total_seats: number;
  vehicle_type_id: number;
  error: boolean;
  errorMsg: string;
}

const initialStateVehiculoEditar: VehiculoEditarState = {
  id: null,
  driver_id: 0,
  model: "",
  license_plate: "",
  total_seats: 0,
  vehicle_type_id: 0,
  error: false,
  errorMsg: ""
};

function Vehiculos() {
  const accessToken = localStorage.getItem("token");
  const [state, setState] = useState<RegisterState>(initialState);
  const [stateVehiculos, setStateVehiculos] = useState<VehiculosState>(initialStateVehiculos);

  //lista de empleados(con rol choferes)
  const [listaChoferes, setListaChoferes] = useState<Empleado[]>([]);//guardamos las listas de los empleados ya existentes

  // tipos de vehículo
  const [listaTiposVehiculo, setListaTiposVehiculo] = useState<TipoVehiculo[]>([]); // guardamos las listas de los tipos que son 3 ya existentes

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [vehiculoEditar, setVehiculoEditar] = useState<VehiculoEditarState>(initialStateVehiculoEditar);
  const [camposModificados, setCamposModificados] = useState<Partial<VehiculoEditarState>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);


  //funcion para los empleados activos con rol de chofer  y activos
  const cargarChoferes = async () => {
    if (!accessToken) return;

    // Ajusta esta URL a tu endpoint real de búsqueda de empleados activos
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
        // 1. Accedemos a data.details (donde viene la lista)
        // 2. Filtramos por rol "chofer"
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
      // Asumiendo que tu API soporta '/all' al final o filtra directamente
      // Ajusta la URL según cómo funcione tu backend para traer "todos"
      const response = await fetch(apiObtenerTipo, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Asumiendo que data.details es el array de tipos
        setListaTiposVehiculo(data.details);
      } else {
        console.error("Error al cargar tipos de vehículo:", data.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleInputChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setVehiculoEditar((prevState) => ({
      ...prevState,
      [name]: value,
      error: false,
      errorMsg: ""
    }))

    setCamposModificados((prevFields) => ({
      ...prevFields,
      [name]: value
    }));
  }

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

    let filterValue = "all";

    if (terminoBusqueda && terminoBusqueda.trim() !== "") {
      filterValue = encodeURIComponent(terminoBusqueda.trim());
    }

    const urlBusqueda = `${apiObtener}${filterValue}`;

    try {
      const response = await fetch(urlBusqueda, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();


      if (response.ok && data.success) {
        const registrosApi = data.details;

        setStateVehiculos((prev) => ({
          ...prev,
          registros: registrosApi,
        }));
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
  }, []);

  //registrar vehiculo
  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({ ...prevState, error: false, errorMsg: "" }));

    if (
      !state.form.driver_id ||
      !state.form.model ||
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
      const { driver_id, model, license_plate, total_seats, vehicle_type_id } = state.form;

      const dataToSend = {
        driver_id: Number(driver_id),
        model: model,
        license_plate: license_plate,
        total_seats: Number(total_seats),
        vehicle_type_id: Number(vehicle_type_id)
      };

      const response = await fetch(apiRegistrar, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      console.log(dataToSend);

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
        const errorData = await response.json();
        console.error(errorData);
        setState((prevState) => ({
          ...prevState,
          error: true,
          errorMsg: "Ya existe un dato registrado.",
        }));
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
        errorMsg: "No se han detectado cambios"
      }))
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
        errorMsg: "Por favor, complete los campos obligatorios."
      }));
      return;
    }
  }

  const editarRegistro = async (
    idEditar: number,
    datosEditar: any
  ) => {
    if (!accessToken) {
      setStateVehiculos((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Token no encontrado"
      }))
      return;
    }
    //console.log(datosEditar);

    /// 1. Preparar datos para la API (Renombrar drive_id a driver_id)
    const payload = {
      ...(datosEditar.driver_id && { driver_id: Number(datosEditar.driver_id) }),
      ...(datosEditar.model && { model: datosEditar.model }),
      ...(datosEditar.total_seats && { total_seats: Number(datosEditar.total_seats) }),
      // is_active: true // Opcional según tu lógica
    };

    // 2. Necesitamos la placa actual para la URL. 
    // Como 'vehiculoEditar' es un estado global, podemos acceder a la placa vieja desde ahí:
    const placaParaUrl = vehiculoEditar.license_plate;

    // 3. Construir URL: .../updateVehicle/:license_plate
    // Nota: Asegúrate que 'apiEditar' termine con "/" -> "http://.../updateVehicle/"
    const urlEdicion = `${apiEditar}${placaParaUrl}`;


    try {
      //const apiEditarRegistro = `${apiEditar}${idEditar}`;

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
        console.log("Registro Editado")
        handleCloseModalEdit();
        setSuccessMessage("Vehiculo editado con éxito.");
        listarRegistros();
        setCamposModificados({});
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000);
      } else {
        console.error("Error en la edicion: ", data.message)
        setVehiculoEditar((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al intentar editar",
        }));
      }
    } catch (error) {
      console.error("Error de conexión: ", error)
      setVehiculoEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error al conectar al servidor.",
      }))
    }

  }

  const columnas = [
    { key: "driver_id", header: "ID CONDUCTOR" },
    { key: "model", header: "MODELO" },
    { key: "license_plate", header: "PLACA" },
    { key: "total_seats", header: "TOTAL ASIENTOS" },
    { key: "vehicle_type_id", header: "TIPO ID VEHICULO" },
    { key: "actions", header: "Acciones" },
  ];

  const userRegistro = (
    //Logica para el envío del formulario

    <button
      form="FormularioVehiculo"
      className="btn bg-blue-500 hover:bg-blue-600 text-white">
      Registrar
    </button>
  );

  const userEdit = (
    //Logica para el envío del formulario
    <button form="FormularioVehiculo" className="btn bg-blue-500 hover:bg-blue-600 text-white">
      Registrar
    </button>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

  //const handleSearch = () => {
  //  console.log("Buscar");
  //};

  const handleOpenModal = () => {
    setState(initialState)
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModalEdit = (vehiculo: Vehiculo) => {
    setVehiculoEditar({
      id: vehiculo.id,
      driver_id: vehiculo.drive_id,
      model: vehiculo.model,
      license_plate: vehiculo.license_plate,
      total_seats: vehiculo.total_seats,
      vehicle_type_id: vehiculo.vehicle_type_id,
      error: false,
      errorMsg: "",
    })
    setIsModalOpenEdit(true);
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
  }

  //onst handleDelete = (item: Item) => {
  //  console.log("Eliminar");
  // item;
  //};

  //const handleEdit = (item: Item) => {
  //console.log("Editar");
  //item;
  //};

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
          />
          {isLoading ? (
            <div className="w-full flex items-center justify-center py-6">
              <span className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <Table
              data={stateVehiculos.registros}
              columnas={columnas}
              onEdit={(item) => handleOpenModalEdit(item as Vehiculo)}
            />
          )}
        </section>
      </main>
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
              htmlFor="drive_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Chofer Asignado:
            </label>

            <select
              name="driver_id"
              // Usamos driver_id que es como se llama en tu modelo Vehiculo
              value={state.form.driver_id}
              onChange={handleInputChange}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">-- Seleccione un Chofer --</option>

              {listaChoferes.map((chofer) => (
                <option key={chofer.id} value={chofer.id}>
                  {/* Usamos nombre y apellido según tu modelo Empleado */}
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
            <input
              type="text"
              name="model"
              onChange={handleInputChange}
              value={state.form.model}
              placeholder="Ingrese el numero de AST"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div className="min-h-6 text-center">
            {state.error && (
              <span className="text-center text-red-500 text-sm m-0">
                {state.errorMsg}
              </span>
            )}
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isModalOpenEdit}
        onClose={handleCloseModalEdit}
        titulo="Editar Vehículo"
        acciones={userEdit}
      >
        <form id="FormularioEditarVehiculo" onSubmit={manejadorSubmitEditar} className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="drive_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Chofer Asignado (Editar):
            </label>
            <select
              name="driver_id"
              // Usamos vehiculoEditar.driver_id
              value={vehiculoEditar.driver_id}
              onChange={handleInputChangeEdit}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">-- Seleccione un Chofer --</option>
              {listaChoferes.map((chofer) => (
                <option key={chofer.id} value={chofer.id}>
                  {chofer.nombre} {chofer.apellido} (C.I: {chofer.cedula})
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
              onChange={handleInputChangeEdit}
              placeholder="Ingrese la placa"
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
              value={vehiculoEditar.total_seats}
              onChange={handleInputChangeEdit}
              placeholder="Ingrese el numero de AST"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div><div>
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
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value={0}>-- Seleccione Tipo --</option>

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
            <input
              type="text"
              name="model"
              value={vehiculoEditar.model}
              onChange={handleInputChangeEdit}
              placeholder="Ingrese el numero de AST"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div className="col-span-2 text-center m-0  min-h-6">
            {vehiculoEditar.errorMsg && (
              <span className="text-red-600 text-sm m-0">{vehiculoEditar.errorMsg}</span>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Vehiculos;
