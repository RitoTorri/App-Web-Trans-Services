import Table from "../components/Table/Table";
import type { Item, Empleado } from "../types/models";
import ToolBar from "../components/Table/ToolBar";
import React, { useEffect, useState } from "react";
import Modal from "../components/Modal/Modal";
import { apiRegistrar, apiObtener,apiElminar, apiEditar } from "../services/apiEmpleados";

interface Contact {
  contact_info: string;
}

interface RegisterFormState {
  name: string;
  lastname: string;
  ci: string;
  rol: string;
  contact_email_info: string;
  contact_phone_info: string;
  contacts: Contact[];
}

interface RegisterState {
  form: RegisterFormState;
  error: boolean;
  errorMsg: string;
}

const initialState: RegisterState = {
  form: {
    name: "",
    lastname: "",
    ci: "",
    rol: "",
    contact_email_info: "",
    contact_phone_info: "",
    contacts: [
      {
        contact_info: "",
      },
    ],
  },
  error: false,
  errorMsg: "",
};

interface EmpleadosState {
  registros: Item[];
  error: boolean;
  errorMsg: string;
}

const initialStateEmpleados: EmpleadosState = {
  registros: [] as Item[],
  error: false,
  errorMsg: "",
};

const transformarRegistros = (registrosAPI: Empleado[]): Item[] => {
  return registrosAPI.map((empleado) => ({
    ...empleado,

    correo: empleado.employee_contacts?.[0]?.contact_info || "N/A",

    telefono: empleado.employee_contacts?.[1]?.contact_info || "N/A",
  }));
};

interface EmpleadoEditarState{
  id:number | null;
  name:string;
  lastname: string;
  ci:string;
  rol:string;
  telefono: string;
  correo: string;
  error: boolean;
  errorMsg: string;
}

const initialStateEmpleadosEditar:  EmpleadoEditarState ={
  id: null,
  name: "",
  lastname: "",
  ci: "",
  rol: "",
  telefono: "",
  correo: "",
  error: false,
  errorMsg: "",
}

function Empleados() {
  const [state, setState] = useState<RegisterState>(initialState);
  const [stateEmpleados, setStateEmpleados] = useState<EmpleadosState>(
    initialStateEmpleados
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [empleadoEditar, setEmpleadoEditar] = useState<EmpleadoEditarState>(initialStateEmpleadosEditar);

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

  const handleInputChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const{name, value} = e.target;

    setEmpleadoEditar((prevState) =>({
        ...prevState,
        [name]: value,
        error: false,
        errorMsg: "",
    }));

    setCamposModificados((prevFields) => ({
      ...prevFields,
      [name]: value,
    }))
  };

  const accessToken = localStorage.getItem("token");

  const listarRegistros = async () => {
    if (!accessToken) {
      setStateEmpleados((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado.",
      }));
      console.error("DEBUG: Token no encontrado");
      return;
    }

    try {
      const response = await fetch(apiObtener, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("DEBUG: estatus http de la respuesta", response.status);
      console.log("DEBUG: response.ok", response.ok);

      const data = await response.json();
      console.log("DEBUG contenido de la data", data);

      if (response.ok && data.success) {
        const registrosAPI = data.details;
        console.log("REGISTROS crudos", data.details);
        const registrosParaTabla = transformarRegistros(registrosAPI);

        setStateEmpleados((prev) => ({
          ...prev,
          registros: registrosParaTabla,
        }));
        console.error("DEBUG: Registros para la tabla", registrosParaTabla);
      } else {
        setStateEmpleados((prev) => ({
          ...prev,
          error: true,
          errorMsg: data.message || "Error al cargar registros",
        }));
        console.error("DEBUG: fallo logico", data.message);
      }
    } catch (error) {
      setStateEmpleados((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error al alistar",
      }));
      console.error("ERROR DE FETC", error);
    }
  };

  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({ ...prevState, error: false, errorMsg: "" }));

    if (
      !state.form.name ||
      !state.form.lastname ||
      !state.form.ci ||
      !state.form.rol
    ) {
      setState((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Por favor, complete todos los campos.",
      }));
      return;
    }

    try {
      const {
        name,
        lastname,
        ci,
        rol,
        contact_email_info,
        contact_phone_info,
      } = state.form;

      const contacts = [];

      if (contact_email_info) {
        contacts.push({
          contact_info: contact_email_info,
        });
      }

      if (contact_phone_info) {
        contacts.push({
          contact_info: contact_phone_info,
        });
      }

      const datoToSend = {
        name,
        lastname,
        ci,
        rol,
        contacts: contacts,
      };

      const response = await fetch(apiRegistrar, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(datoToSend),
      });

      if (response.ok) {
        console.log("Registrado con exito");

        setSuccessMessage("Empleado registrado con éxito")
        console.log("si")
        setState(initialState)
        handleCloseModal();

        listarRegistros();

        setTimeout(() =>{
          setSuccessMessage(null);
        }, 3000)

      } else {
        const errorData = await response.json();
        console.log(errorData); // Intentar leer el error del servidor
        setState((prev) => ({
          ...prev,
          error: true,
          errorMsg:
            "Ya existe un dato registrado, verifica que no hayas usado antes la cédula, correo o télefono.",
        }));
      }
    } catch (error) {
      console.error("Error de red o conexión: ", error);
      setState((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "No se puede conectar al servidor.",
      }));
    }
  };

  const manejadorSubmitEditar = async (e: React.FormEvent)=>{
    e.preventDefault();

    setEmpleadoEditar((prevState) => ({...prevState, error: false, errorMsg: ""}));

    if(Object.keys(camposModificados).length === 0){
      setEmpleadoEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "No se han detectado cambios"
      }))
      return;
    }

    if(empleadoEditar.id !== null){
    await editarRegistro(empleadoEditar.id, camposModificados);
  }

    if(
      !empleadoEditar.name ||
      !empleadoEditar.lastname ||
      !empleadoEditar.ci ||
      !empleadoEditar.rol 

    ){
      setEmpleadoEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Por favor, complete los campos obligatorios."
      }));
      return;
    }
  }

 

  const userRegistro = (
    //Logica para el envío del formulario
    <button
      form="FormularioEmpleado"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Registrar
    </button>
  );

  const userEdit = (
    //Logica para el envío del formulario
    <button form="FormularioEditarEmpleado" className="btn bg-blue-500 hover:bg-blue-600 text-white">
      Editar
    </button>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);

  const [camposModificados, setCamposModificados] = useState<Partial<EmpleadoEditarState>>({});

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenModalEdit = (empleado: Item) => {
    setEmpleadoEditar({
      id: empleado.id,
      name: empleado.name,
      lastname: empleado.lastname,
      ci: empleado.ci,
      rol: empleado.rol,
      telefono: empleado.telefono,
      correo: empleado.correo,
      error: false,
      errorMsg: "",
    })
    setIsModalOpenEdit(true);
  };

  const handleOpenModalDelete = () => {
    setIsModalOpenDelete(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
  };

  const handleCloseModalDelete = () => {
    setIsModalOpenDelete(false);
  }

  useEffect(() => {
    listarRegistros();
  }, []);

  const columnas = [
    { key: "name", header: "Nombre" },
    { key: "lastname", header: "Apellido" },
    { key: "ci", header: "Cédula" },
    { key: "rol", header: "Rol" },
    { key: "telefono", header: "Teléfono" },
    { key: "correo", header: "Correo" },
    { key: "actions", header: "Acciones" },
  ];


  const eliminarRegistro = async (idElminar: number) =>{
    if(!accessToken){
      setStateEmpleados(prev => ({...prev, error: true, errorMsg: "Token no encontrado"}))
    }

    try{
      const apiEliminarRegistro = `${apiElminar}${idElminar}`;

      console.log("URL: ", apiEliminarRegistro)

      const response = await fetch(apiEliminarRegistro, {
        method:"DELETE",
        headers:{
          Authorization: `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success){
        console.log("Empleado eliminado")

        listarRegistros();
      }else{
        setStateEmpleados(prev => ({
          ...prev,
          error: true,
          errorMsg: data.message || `Error http:${response.status} `
        }))
      }
    }catch (error){
      setStateEmpleados(prev => ({
        ...prev,
        error: true,
        errorMsg: "Error de conexion al intentar elminar"
      }))
      console.error("Error de conexion", error)
    }
  }

  const editarRegistro = async (idEditar: number, datosEditar: Partial<{name: string, lastname: string, ci: string, rol:string}>) =>{
    if(!accessToken){
      setStateEmpleados(prev => ({...prev, error:true, errorMsg:"Token no encontrado"}))
      return;
    }
      console.log(datosEditar)
    
    try{
      const apiEditarRegistro = `${apiEditar}${idEditar}`;

      

        const response = await fetch(apiEditarRegistro,{
          method:"PATCH",
          headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(datosEditar),
        });

        const data = await response.json();

        console.log(data)
        
        if(response.ok && data.success){
          console.log("Registro editado.")
          handleCloseModalEdit();
          setSuccessMessage("Empleado editado con exito.");
          listarRegistros();
          setCamposModificados({});
          setTimeout(() =>{
            setSuccessMessage(null);
          }, 3000)
        }else{
          console.error("Error en la edicion: ", data.message);
          setEmpleadoEditar(prev => ({
            ...prev,
            error: true,
            errorMsg: data.message || "Error al intentar editar"
          }))
        }
    }catch(error){
      console.error("Error de conexion", error);
      setEmpleadoEditar(prev => ({
        ...prev,
        error: true,
        errorMsg: "No se puede conectar al servidor"
      }))
    }
  }

   

  
  const userDelete = (
    //Logica para el envío del formulario
    <button  className="btn bg-blue-500 hover:bg-blue-600 text-white">
      Eliminar
    </button>
  );

  const handleSearch = () => {
    console.log("Buscar");
  };

  return (
    <>
      <main className="min-h-screen ">
        {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow" role="alert">
          <span className="block sm:inline">{successMessage}</span>
          <span 
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setSuccessMessage(null)}
          >
            &times;
          </span>
        </div>
      )}
        <section className="flex flex-col flex-grow items-center w-full pl-4 pr-4">
          <ToolBar
            titulo="Empleados"
            onSearch={handleSearch}
            onRegister={handleOpenModal}
          />
          <Table
            data={stateEmpleados.registros}
            columnas={columnas}
            onDelete={eliminarRegistro}
            onEdit={handleOpenModalEdit}
          />
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Empleado"
        acciones={userRegistro}
      >
        <form
          onSubmit={manejadorSubmit}
          id="FormularioEmpleado"
          className="grid grid-cols-2 gap-3"
        >
          
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre:
            </label>
            <input
              type="text"
              name="name"
              value={state.form.name}
              onChange={handleInputChange}
              placeholder="Ingrese el Nombre"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="lastname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Apellido:
            </label>
            <input
              type="text"
              name="lastname"
              value={state.form.lastname}
              onChange={handleInputChange}
              placeholder="Ingrese el Apellido"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="ci"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cédula:
            </label>
            <input
              type="text"
              name="ci"
              value={state.form.ci}
              onChange={handleInputChange}
              placeholder="Ingrese la Cédula"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="rol"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rol:
            </label>
            <input
              type="text"
              name="rol"
              value={state.form.rol}
              onChange={handleInputChange}
              placeholder="Ingrese el Rol"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="numero"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de telefono:
            </label>
            <input
              type="text"
              name="contact_phone_info"
              value={state.form.contact_phone_info}
              onChange={handleInputChange}
              placeholder="Ingrese el Número de Telefono"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico:
            </label>
            <input
              type="email"
              name="contact_email_info"
              value={state.form.contact_email_info}
              onChange={handleInputChange}
              placeholder="Ingrese el Correo Electrónico"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
         
        </form>
         <div className="min-h-6 text-center">
          {state.error &&(
              
              <span className="text-center text-red-500 text-sm m-0">{state.errorMsg}</span>
  
          )}
          </div>
      </Modal>
      <Modal
        isOpen={isModalOpenEdit}
        onClose={handleCloseModalEdit}
        titulo={`Editar empleado`}
        acciones={userEdit}
      >
        <form onSubmit={manejadorSubmitEditar} id="FormularioEditarEmpleado" className="grid grid-cols-2 gap-3">
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
              value={empleadoEditar.name}
              onChange={handleInputChangeEdit}
              placeholder="Ingrese el Nombre"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="apellido"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Apellido:
            </label>
            <input
              type="text"
              name="lastname"
              value={empleadoEditar.lastname}
              onChange={handleInputChangeEdit}
              placeholder="Ingrese el Apellido"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="cedula"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cédula:
            </label>
            <input
              type="number"
              name="ci"
              value={empleadoEditar.ci}
              onChange={handleInputChangeEdit}
              placeholder="Ingrese la Cédula"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="rol"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rol:
            </label>
            <input
              type="text"
              name="rol"
              value={empleadoEditar.rol}
              onChange={handleInputChangeEdit}
              placeholder="Ingrese el Rol"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="numero"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de telefono:
            </label>
            <input
              type="text"
              name="telefono"
              value={empleadoEditar.telefono}
              readOnly
              placeholder="Ingrese el Número de Telefono"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico:
            </label>
            <input
              type="email"
              name="correo"
              value={empleadoEditar.correo}
              readOnly
              placeholder="Ingrese el Correo Electrónico"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isModalOpenDelete}
        onClose={handleCloseModalDelete}
        titulo="¿Esta seguro que quiere eliminar?"
        acciones={userDelete}
      >
        <h1></h1>
      </Modal>
    </>
  );
}

export default Empleados;
