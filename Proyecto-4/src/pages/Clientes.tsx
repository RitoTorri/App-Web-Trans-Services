import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import type { Item } from "../types/models";
import Modal from "../components/Modal/Modal";
import React, { useEffect, useState } from "react";
import { apiRegistrar, apiObtener, apiEditar, apiExportar } from "../services/apiClientes";

interface RegisterFormState {
  name: string;
  rif: string;
  contact: string;
  address: string;
}

interface RegisterState {
  form: RegisterFormState;
  error: boolean;
  errorMsg: string;
}

const initialState: RegisterState = {
  form: {
    name: "",
    rif: "",
    contact: "",
    address: "",
  },
  error: false,
  errorMsg: "",
};

interface ClientesState {
  registros: Item[];
  error: boolean;
  errorMsg: string;
}

const initialStateClientes: ClientesState = {
  registros: [] as Item[],
  error: false,
  errorMsg: "",
};

interface ClienteEditarState {
  id: number | null;
  rif: string;
  name: string;
  contact: string;
  address: string;
  error: boolean;
  errorMsg: string;
}

const initialStateClienteEditar: ClienteEditarState = {
  id: null,
  rif: "",
  name: "",
  contact: "",
  address: "",
  error: false,
  errorMsg: "",
};

function Clientes() {
  const accessToken = localStorage.getItem("token");

  const [state, setState] = useState<RegisterState>(initialState);

  const [stateClientes, setStateClientes] =
    useState<ClientesState>(initialStateClientes);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [clienteEditar, setClienteEditar] = useState<ClienteEditarState>(
    initialStateClienteEditar
  );

  const [camposModificados, setCamposModificados] = useState<
    Partial<ClienteEditarState>
  >({});

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportar, setIsExportar] = useState<boolean>(false)

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

  const handleInputChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setClienteEditar((prevState) => ({
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

  const onRifChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    part: "tipo" | "numero"
  ) => {
    const currentRif = state.form.rif || "J-";
    const partes = currentRif.split("-");

    const currentType = partes[0];
    const currentNumber = partes.slice(1).join("-");

    let newValue = "";

    if (part === "tipo") {
      newValue = `${e.target.value}-${currentNumber || ""}`;
    } else {
      newValue = `${currentType || "J"}-${e.target.value}`;
    }

    const sytheticEvent = {
      target: {
        name: "rif",
        value: newValue,
      },
    };

    handleInputChange(sytheticEvent as any);
  };

  const rifCompleto = state.form.rif || "";
  const partes = rifCompleto.split("-");

  const letra = partes[0];

  const numero = partes.slice(1).join("-");

  const onRifChangeEdit = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    part: "tipo" | "numero"
  ) => {
    const currentRif = clienteEditar.rif || "J-";
    const partes = currentRif.split("-");

    const currentType = partes[0]
    const currentNumber = partes.slice(1).join("-")

    let newValue = ""

    if(part === "tipo"){
      newValue = `${e.target.value}-${currentNumber || ""}`
    }else{
      newValue = `${currentType || "J"}-${e.target.value}`
    }

    setClienteEditar((prevState) => ({
      ...prevState,
      rif: newValue,
      error: false,
      errorMsg: ""
    }))

    setCamposModificados((prevFields) => ({
      ...prevFields,
      rif: newValue
    }))
  }

  const rifCompletoEdit = clienteEditar.rif || "";
  const partesEdit = rifCompletoEdit.split("-") 

  const letrasEdit = partesEdit[0]
  const numerosEdit = partesEdit.slice(1).join("-")

  //Cargar registros clientes
  const listarRegistros = async (terminoBusqueda = "") => {
    setIsLoading(true);
    if (!accessToken) {
      setStateClientes((prevState) => ({
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

        setStateClientes((prev) => ({
          ...prev,
          registros: registrosApi,
        }));
      } else {
        setStateClientes((prevState) => ({
          ...prevState,
          error: true,
          errorMsg: data.message || "Error al cargar registros",
        }));

        console.error("Fallo: ", data.message);
      }
    } catch (error) {
      setStateClientes((prevState) => ({
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
  }, []);

  //Registrar Clientes
  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({ ...prevState, error: false, errorMsg: "" }));

    if (
      !state.form.name ||
      !state.form.contact ||
      !state.form.rif ||
      !state.form.address
    ) {
      setState((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Por favor complete todos los campos.",
      }));
      return;
    }

    try {
      const { name, contact, rif, address } = state.form;

      const dataToSend = {
        name,
        contact,
        rif,
        address,
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

      const errorData = await response.json();

      const dataRif = errorData.details[0]

      const dataContact = errorData.details

      if(dataContact === "The contact already exists."){
        setState((prev) => ({
          ...prev,
          error:true,
          errorMsg: "El número de teléfono ya se encuntra registrado"
        }))
        return
      }

      if(dataRif === 'Invalid rif. Code be must a RIF. Example: V-1234567-8'){
        setState((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Número de RIF invalido, intente de nuevo"
        }))
        return
      }

      if (response.ok) {
        console.log("Registrado con exito");
        setState(initialState);
        listarRegistros();
        setSuccessMessage("Cliente registrado con éxito.");
        handleCloseModal();

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else{
        console.error(errorData);
        setState((prevState) => ({
          ...prevState,
          error: true,
          errorMsg: "Error al Intentar Registrar",
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

  //Editar Cliente
  const manejadorSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();

    setClienteEditar((prevState) => ({
      ...prevState,
      error: false,
      errorMsg: "",
    }));

    if (Object.keys(camposModificados).length === 0) {
      setClienteEditar((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "No se han detectado cambios",
      }));
      return;
    }

    if (clienteEditar.id !== null) {
      await editarRegistro(clienteEditar.id, camposModificados);
    }

    if (
      !clienteEditar.address ||
      !clienteEditar.contact ||
      !clienteEditar.name ||
      !clienteEditar.rif
    ) {
      setClienteEditar((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Por favor, complete los campos obligatorios.",
      }));
      return;
    }
  };

  const editarRegistro = async (
    idEditar: number,
    datosEditar: Partial<{
      name: string;
      address: string;
      contact: string;
      rif: string;
    }>
  ) => {
    if (!accessToken) {
      setStateClientes((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      return;
    }
    console.log(datosEditar);

    try {
      const apiEditarRegistro = `${apiEditar}${idEditar}`;

      const response = await fetch(apiEditarRegistro, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(datosEditar),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok && data.success) {
        console.log("Registro Editado");
        handleCloseModalEdit();
        setSuccessMessage("Cliente editado con éxito.");
        listarRegistros();
        setCamposModificados({});
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        console.error("Error en la edicion: ", data.message);
        setClienteEditar((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al intentar editar",
        }));
      }
    } catch (error) {
      console.error("Error de conexión: ", error);
      setClienteEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error al conectar al servidor.",
      }));
    }
  };

  const exportarRegistros = async () => {
    if(!accessToken){
      console.log("Token no encontrado")
      return
    }

    setIsExportar(true)

    try {
      const response = await fetch(apiExportar, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if(!response.ok){
        const errorMsg = await response.text()
        try{
          const errorData = JSON.parse(errorMsg)
          console.error("Error al exporatar: ", errorData.message)
        }catch{
          console.error("Error desconocido: ", errorMsg)
        }
      }

      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url

      a.download = 'reporte_clientes_.pdf'
      
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)

      console.log("Reporte descargado")
      
    } catch (error) {
      console.error("Error del servidor: ", error)
    }finally{
      setIsExportar(false)
    }
  }

  const columnas = [
    { key: "name", header: "Nombre" },
    { key: "rif", header: "Rif" },
    { key: "contact", header: "Teléfono" },
    { key: "address", header: "Dirección" },
    { key: "actions", header: "Acciones" },
  ];

  const userRegistro = (
    //Logica para el envío del formulario
    <button
      form="FormularioCliente"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Registrar
    </button>
  );

  const userEdit = (
    //Logica para el envío del formulario
    <button
      form="FormularioEditarCliente"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
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

  const handleOpenModalEdit = (cliente: Item) => {
    setClienteEditar({
      id: cliente.id,
      name: cliente.name,
      address: cliente.address,
      rif: cliente.rif,
      contact: cliente.contact,
      error: false,
      errorMsg: "",
    });

    setCamposModificados({})
    setIsModalOpenEdit(true);
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
  };

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
        <section className="flex flex-col flex-grow w-full items-center  pl-4 pr-4">
          <ToolBar
            titulo="Clientes"
            onRegister={handleOpenModal}
            onSearch={listarRegistros}
            onExport={exportarRegistros}
            isExporting={isExportar}
          />
          {isLoading ? (
            <div className="w-full flex items-center justify-center py-6">
              <span className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <>
            <div className="flex flex-row mb-4 w-full">
              <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
                <span>Total: {stateClientes.registros.length}</span>
              </div>
            </div>
            <Table
              data={stateClientes.registros}
              columnas={columnas}
              onEdit={handleOpenModalEdit}
            />
            </>
          )}
        </section>
      </main>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Cliente"
        acciones={userRegistro}
      >
        <form
          id="FormularioCliente"
          onSubmit={manejadorSubmit}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre:
            </label>
            <input
              type="text"
              name="name"
              onChange={handleInputChange}
              value={state.form.name}
              placeholder="Ingrese el Nombre"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>

          <div>
            <label
              htmlFor="rif"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              RIF:
            </label>
            <div className="flex items-center w-full gap-1">
              <select
                name="tipoRif"
                onChange={(e) => onRifChange(e, "tipo")}
                value={letra}
                className=" bg-white rounded-md mb-2 shadow-xs p-3 border  border-gray-400 cursor-pointer font-semibold focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
              >
                <option value="J">J</option>
                <option value="V">V</option>
              </select>
              <input
                type="text"
                name="rif"
                value={numero}
                onChange={(e) => onRifChange(e, "numero")}
                placeholder="Ingrese el RIF"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Teléfono:
            </label>
            <input
              type="text"
              name="contact"
              onChange={handleInputChange}
              value={state.form.contact}
              placeholder="Ingrese el Número de Teléfono"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="direccion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dirección:
            </label>
            <input
              type="text"
              name="address"
              onChange={handleInputChange}
              value={state.form.address}
              placeholder="Ingrese la Dirección"
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
        isOpen={isModalOpenEdit}
        onClose={handleCloseModalEdit}
        titulo="Editar Cliente"
        acciones={userEdit}
      >
        <form
          id="FormularioEditarCliente"
          onSubmit={manejadorSubmitEditar}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre:
            </label>
            <input
              type="text"
              name="name"
              value={clienteEditar.name}
              onChange={handleInputChangeEdit}
              placeholder="Ingrese el Nombre"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="rif"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              RIF:
            </label>
            <div className="flex items-center w-full gap-1">
              <select
               name="tipoRif"
               onChange={(e) => onRifChangeEdit(e, "tipo")}
               value={letrasEdit}
               className="bg-white rounded-md mb-2 shadow-xs p-3 border  border-gray-400 cursor-pointer font-semibold focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
              >
               
                <option value="J">J</option>
                 <option value="V">V</option>
              </select>
            <input
              type="text"
              name="rif"
              value={numerosEdit}
              onChange={(e) => onRifChangeEdit(e, "numero")}
              placeholder="Ingrese el RIF"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
            </div>
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Teléfono:
            </label>
            <input
              type="text"
              name="contact"
              onChange={handleInputChangeEdit}
              value={clienteEditar.contact}
              placeholder="Ingrese el Número de Teléfono"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="direccion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dirección:
            </label>
            <input
              type="text"
              name="address"
              onChange={handleInputChangeEdit}
              value={clienteEditar.address}
              placeholder="Ingrese la Dirección"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div className="col-span-2 text-center m-0  min-h-6">
            {clienteEditar.errorMsg && (
              <span className="text-red-600 text-sm m-0">
                {clienteEditar.errorMsg}
              </span>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Clientes;
