import Table from "../components/Table/Table";
import type { Item, Empleado } from "../types/models";
import ToolBar from "../components/Table/ToolBar";
import React, { useEffect, useState } from "react";
import Modal from "../components/Modal/Modal";
import {
  apiRegistrar,
  apiObtener,
  apiElminar,
  apiEditar,
  apiRestaurar,
  apiExportar
} from "../services/apiEmpleados";


interface Contact {
  id?: number | null;
  contact_info: string;
}

interface RegisterFormState {
  name: string;
  lastname: string;
  ci: string;
  rol: string;
  salary_monthly: number;
  date_of_entry: Date;
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
    salary_monthly: 0,
    date_of_entry: new Date(),
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
  return registrosAPI.map((empleado) => {
    const contacts = empleado.employee_contacts || [];
    const emailObj = contacts.find((c: any) => c.contact_info.includes("@"));
    const phoneObj = contacts.find((c: any) => c.id !== emailObj?.id);

    return {
      ...empleado,
      nombre_completo: `${empleado.nombre} ${empleado.apellido}`,

      correo: emailObj ? emailObj.contact_info : "N/A",
      telefono: phoneObj ? phoneObj.contact_info : "N/A",
    };
  });
};

interface EmpleadoEditarState {
  id: number | null;
  name: string;
  lastname: string;
  ci: string;
  rol: string;
  salary_monthly: number;
  date_of_entry: Date;
  telefono: string;
  correo: string;
  contacts?: Contact[];
  error: boolean;
  errorMsg: string;
}

const initialStateEmpleadosEditar: EmpleadoEditarState = {
  id: null,
  name: "",
  lastname: "",
  ci: "",
  rol: "",
  salary_monthly: 0,
  date_of_entry: new Date(),
  telefono: "",
  correo: "",
  contacts: [
    {
      contact_info: "",
      id: null,
    },
  ],
  error: false,
  errorMsg: "",
};

const formatDateToInput = (date: Date): string => {
  // Si la fecha existe y es un objeto Date, la formatea.
  if (date instanceof Date && !isNaN(date.getTime())) {
    const year = date.getUTCFullYear()
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = date.getUTCDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`;
  }
  return "";
};

const formatInvoiceDate = (dateString: string) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)

  if(isNaN(date.getTime())) return "N/A"

  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date)

  
};

function Empleados() {
  const [state, setState] = useState<RegisterState>(initialState);
  const [stateEmpleados, setStateEmpleados] = useState<EmpleadosState>(
    initialStateEmpleados
  );
  const [stateEmpleadosInactivos, setStateEmpleadosInactivos] =
    useState<EmpleadosState>(initialStateEmpleados);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [empleadoEditar, setEmpleadoEditar] = useState<EmpleadoEditarState>(
    initialStateEmpleadosEditar
  );

  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [nombreEmpleado, setNombreEmpleado] = useState<string | null>(null);

  const [toRestoreId, setToRestoreId] = useState<number | null>(null);

  const [isLoadingActivos, setIsLoadingActivos] = useState<boolean>(true);
  const [isLoadingInactivos, setIsLoadingInactivos] = useState<boolean>(true);
  const [isExportar, setIsExportar] = useState<boolean>(false)

  const [camposModificados, setCamposModificados] = useState<
    Partial<EmpleadoEditarState>
  >({});

  const [originalContacts, setOriginalContacts] = useState<Contact[]>([]);

  const [vistaActual, setVistaActual] = useState<"activos" | "inactivos">(
    "activos"
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
  
      let newValue: any = value;
  
      if (name === "date_of_entry") {
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
          [name]: newValue
        }
      }))
    }

   const handleDateChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target

    const dateForState = value ? `${value}T00:00:00` : ""

    const newDate = value ? new Date(dateForState) : new Date(NaN)

    setEmpleadoEditar((prevState) => ({
      ...prevState,
      [name]: newDate,
      error: false,
      errorMsg: ""
    }))

    setCamposModificados((prevFields) => ({
      ...prevFields,
      [name]: newDate
    }))
   } 
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

    setEmpleadoEditar((prevState) => {
      let nuevosContacts = prevState.contacts ? [...prevState.contacts] : [];
      if (name === "correo") {
        if (nuevosContacts[0]) {
          nuevosContacts[0] = { ...nuevosContacts[0], contact_info: value };
        }
      } else if (name === "telefono") {
        if (nuevosContacts[1]) {
          nuevosContacts[1] = { ...nuevosContacts[1], contact_info: value };
        }
      }

      return {
        ...prevState,
        [name]: value,
        contacts: nuevosContacts,
        error: false,
        errorMsg: "",
      };
    });
    if (name !== "correo" && name !== "telefono") {
      setCamposModificados((prevFields) => ({
        ...prevFields,
        [name]: value,
      }));
    }
  };

  const accessToken = localStorage.getItem("token");
  const rolUsuario = localStorage.getItem("rol")

  const listarRegistros = async (terminoBusqueda = "") => {
    setIsLoadingActivos(true);

    if (!accessToken) {
      setStateEmpleados((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado.",
      }));
      console.error("DEBUG: Token no encontrado");
      setIsLoadingActivos(false);
      return;
    }

    const activo = "true";
    let filterValue = "all";

    if (terminoBusqueda && terminoBusqueda.trim() !== "") {
      filterValue = encodeURIComponent(terminoBusqueda.trim());
    }

    const urlBusqueda = `${apiObtener}${activo}/${filterValue}`;

    try {
      const response = await fetch(urlBusqueda, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      console.log("DEBUG contenido de la data", data);

      if (response.ok && data.success) {
        const registrosAPI = data.details;
        const registrosParaTabla = transformarRegistros(registrosAPI);

        setStateEmpleados((prev) => ({
          ...prev,
          registros: registrosParaTabla,
        }));
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
    } finally {
      setIsLoadingActivos(false);
    }
  };

  //funciñon para cargar los empleados no activos
  const listarRegistrosInactivos = async (terminoBusqueda = "") => {
    setIsLoadingInactivos(true);

    if (!accessToken) {
      setStateEmpleadosInactivos((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "Token no encontrado.",
      }));
      console.log("DEBUG: Token no encontardo");
      return;
    }

    const activo = "false";
    let filterValue = "all";

    if (terminoBusqueda && terminoBusqueda.trim() !== "") {
      filterValue = encodeURIComponent(terminoBusqueda.trim());
    }

    const urlBusqueda = `${apiObtener}${activo}/${filterValue}`;

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
        const resgistrosTabla = transformarRegistros(registrosApi);

        setStateEmpleadosInactivos((prev) => ({
          ...prev,
          registros: resgistrosTabla,
        }));
      } else {
        setStateEmpleadosInactivos((prev) => ({
          ...prev,
          error: true,
          errorMsg: data.message || "Error al cargar registros.",
        }));
        console.error("DEBUG: fallo logico", data.message);
      }
    } catch (error) {
      setStateEmpleadosInactivos((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error al alistar.",
      }));
      console.log("Error logico", error);
    } finally {
      setIsLoadingInactivos(false);
    }
  };

  //Funcion para un nuevo registro
  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({ ...prevState, error: false, errorMsg: "" }));

    if (
      !state.form.name ||
      !state.form.lastname ||
      !state.form.ci ||
      !state.form.rol ||
      !state.form.contact_email_info ||
      !state.form.contact_phone_info ||
      !state.form.date_of_entry ||
      !state.form.salary_monthly
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
        date_of_entry,
        salary_monthly
      } = state.form;

      if(contact_phone_info.length !== 11){
        setState((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Número de teléfono invalido"
        }))
        return
      }

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
        date_of_entry: date_of_entry.toISOString().split("T")[0],
        salary_monthly,
        contacts: contacts,
      };

      console.log("Datos: ",datoToSend)

      const response = await fetch(apiRegistrar, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(datoToSend),
      });

      const errorData = await response.json();

      const dataCi = errorData.details[0]

      if(dataCi === "Error: ci is invalid."){
        setState((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Número de cédula invalido"
        }))
        return
      }

      if (response.ok) {
        console.log("Registrado con exito");

        setSuccessMessage("Empleado registrado con éxito");
        setState(initialState);
        handleCloseModal();

        listarRegistros();

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {

        console.log(errorData); // Intentar leer el error del servidor
        setState((prev) => ({
          ...prev,
          error: true,
          errorMsg:
            "Error al registrar, verifique los datos ingresados.",
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

  //Funcion para editar un registro
  const manejadorSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmpleadoEditar((prevState) => ({
      ...prevState,
      error: false,
      errorMsg: "",
    }));

    const datosAEnviar: any = {
      ...camposModificados
    }

    const contactosModificadosAEnviar: Contact[] = [];
    if (empleadoEditar.contacts && originalContacts.length > 0) {
      empleadoEditar.contacts.forEach((currentContact) => {
        const original = originalContacts.find(
          (oc) => oc.id === currentContact.id
        );

        if (original && original.contact_info !== currentContact.contact_info) {
          contactosModificadosAEnviar.push(currentContact);
        }
      });
    }

    if (contactosModificadosAEnviar.length > 0) {
      datosAEnviar.contacts = contactosModificadosAEnviar;
    }

    delete datosAEnviar.correo;
    delete datosAEnviar.telefono;

    if(datosAEnviar.date_of_entry && datosAEnviar.date_of_entry instanceof Date){
      if(!isNaN(datosAEnviar.date_of_entry.getTime())){
        datosAEnviar.date_of_entry =datosAEnviar.date_of_entry.toISOString().split("T")[0]
      }
    }

    if (
      !empleadoEditar.name ||
      !empleadoEditar.lastname ||
      !empleadoEditar.ci ||
      !empleadoEditar.rol
    ) {
      setEmpleadoEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Por favor, complete los campos obligatorios.",
      }));
      return;
    }

    if (Object.keys(datosAEnviar).length === 0) {
      setEmpleadoEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "No se han detectado cambios",
      }));
      return;
    }

    if (empleadoEditar.id !== null) {
      await editarRegistro(empleadoEditar.id, datosAEnviar);
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
  
        a.download = 'reporte_empleados.pdf'
        
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);

  const [isModalOpenRestore, setIsModalOpenRestore] = useState(false);

  const handleOpenModal = () => {
    setState(initialState)
    setIsModalOpen(true);
  };

  const handleOpenModalEdit = (empleado: Item) => {
    const contactsApi = empleado.employee_contacts || [];

    const emailFound = contactsApi.find((c: any) =>
      c.contact_info.includes("@")
    ) || { id: null, contact_info: "" };

    const phoneFound = contactsApi.find((c: any) => c.id !== emailFound.id) || {
      id: null,
      contact_info: "",
    };

    const contactosOrdenados: Contact[] = [
      { id: emailFound.id, contact_info: emailFound.contact_info },
      { id: phoneFound.id, contact_info: phoneFound.contact_info },
    ];

    setEmpleadoEditar({
      id: empleado.id,
      name: empleado.name,
      lastname: empleado.lastname,
      ci: empleado.ci,
      rol: empleado.rol,
      salary_monthly: empleado.salary_monthly,
      date_of_entry: new Date(empleado.date_of_entry),
      correo: contactosOrdenados[0].contact_info,
      telefono: contactosOrdenados[1].contact_info,
      contacts: contactosOrdenados,
      error: false,
      errorMsg: "",
    });
    setOriginalContacts(contactosOrdenados);
    setIsModalOpenEdit(true);
  };

  const handleOpenModalDelete = (id: number, nombre?: string) => {

    const nombreEstado = nombre ?? null;

    setNombreEmpleado(nombreEstado);
    setToDeleteId(id);
    setIsModalOpenDelete(true);
  };

  const handleOpenModalRestore = (id: number, nombre?: string) => {
    const nombreEstado = nombre ?? null;

    setNombreEmpleado(nombreEstado);
    setToRestoreId(id);
    setIsModalOpenRestore(true);
  };

  const handleCloseModalRestore = () => {
    setIsModalOpenRestore(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
    setCamposModificados({})
  };

  const handleCloseModalDelete = () => {
    setIsModalOpenDelete(false);
  };

  useEffect(() => {
    listarRegistros();
    listarRegistrosInactivos();
  }, []);

  let columnas = [
    { key: "ci", header: "Cédula" },
    { key: "name", header: "Nombre" },
    { key: "lastname", header: "Apellido" },
    { key: "rol", header: "Rol" },
    { key: "telefono", header: "Teléfono" },
    { key: "correo", header: "Correo" },
    {key: "salary_monthly", header: "Salario Mensual"},
    {key: "date_of_entry_visual", header: "Fecha de Entrada"},
  ];

  if(rolUsuario === "SuperUsuario"){
     const columnaAcciones = { key: "actions", header: "Acciones" }
     columnas.push(columnaAcciones)
  }


  const eliminarRegistro = async () => {
    if (!accessToken) {
      setStateEmpleados((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado",
      }));
    }

    try {
      const apiEliminarRegistro = `${apiElminar}${toDeleteId}`;

      console.log("URL: ", apiEliminarRegistro);

      const response = await fetch(apiEliminarRegistro, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Empleado eliminado");
        setIsModalOpenDelete(false);
        setToDeleteId(null);
        listarRegistros();
        listarRegistrosInactivos();
      } else {
        setStateEmpleados((prev) => ({
          ...prev,
          error: true,
          errorMsg: data.message || `Error http:${response.status} `,
        }));
      }
    } catch (error) {
      setStateEmpleados((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error de conexion al intentar elminar",
      }));
      console.error("Error de conexion", error);
    }
  };

  const restaurarRegistro = async () => {
    if (!accessToken) {
      setStateEmpleados((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      console.log("Token no encontrado");
    }

    try {
      const apiRestaurarRegistro = `${apiRestaurar}${toRestoreId}`;

      const response = await fetch(apiRestaurarRegistro, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Empleado restaurado");
        setIsModalOpenRestore(false);
        setToRestoreId(null);
        listarRegistros();
        listarRegistrosInactivos();
      } else {
        setStateEmpleados((prev) => ({
          ...prev,
          error: true,
          errorMsg: data.message || `ERROR http: ${response.status}`,
        }));
      }
    } catch (error) {
      setStateEmpleados((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error de conexion al intentar retaurar",
      }));

      console.log("Error: ", error);
    }
  };

  const editarRegistro = async (
    idEditar: number,
    datosEditar: Partial<{
      name: string;
      lastname: string;
      ci: string;
      rol: string;
      salary_monthly: number;
      date_of_entry: Date;
      telefono: string;
      correo: string;
      contacts: Contact[];
    }>
  ) => {
    if (!accessToken) {
      setStateEmpleados((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      return;
    }
    console.log("Los datos:", datosEditar);

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
        console.log("Registro editado.");
        handleCloseModalEdit();
        setSuccessMessage("Empleado editado con exito.");
        listarRegistros();
        setCamposModificados({});
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        console.error("Error en la edicion: ", data.message);
        setEmpleadoEditar((prev) => ({
          ...prev,
          error: true,
          errorMsg: data.message || "Error al intentar editar",
        }));
      }
    } catch (error) {
      console.error("Error de conexion", error);
      setEmpleadoEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "No se puede conectar al servidor",
      }));
    }
  };

  const registrosFormateados = stateEmpleados.registros.map((registro) => {
    return{
      ...registro,
      date_of_entry: registro.date_of_entry,
      date_of_entry_visual: formatInvoiceDate(registro.date_of_entry as unknown as string)
    }
  })

  const registrosFormateadosInactivos = stateEmpleadosInactivos.registros.map((registro) => {
    return{
      ...registro,
       date_of_entry: registro. date_of_entry,
        date_of_entry_visual: formatInvoiceDate(registro. date_of_entry as unknown as string)
    }
  })

  const datosRenderizar =
    vistaActual === "activos"
      ? registrosFormateados
      : registrosFormateadosInactivos

  
  const userDelete = (
    //Logica para el envío del formulario
    <button
      onClick={eliminarRegistro}
      className="btn bg-red-500 hover:bg-red-600 text-white"
    >
      Eliminar
    </button>
  );

  const userRestore = (
    <button
      onClick={restaurarRegistro}
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Restaurar
    </button>
  );

  const userRegistro = (
    <button
      form="FormularioEmpleado"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Registrar
    </button>
  );

  const userEdit = (
    <button
      form="FormularioEditarEmpleado"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Editar
    </button>
  );

  //funciones encargadas de las vistas:

  const cambiarVista = (nuevaVista: "activos" | "inactivos") => {
    setVistaActual(nuevaVista);

    if (nuevaVista === "activos") {
      listarRegistros("");
    } else {
      listarRegistrosInactivos("");
    }
  };

  const funcionBusqueda =
    vistaActual === "activos" ? listarRegistros : listarRegistrosInactivos;

  const isLoading =
    vistaActual === "activos" ? isLoadingActivos : isLoadingInactivos;

  const onEditHandler =
    vistaActual === "activos" ? handleOpenModalEdit : undefined;

  const onDeleteHandler =
    vistaActual === "activos" ? handleOpenModalDelete : undefined;

  const onRestoreHandler =
    vistaActual === "activos" ? undefined : handleOpenModalRestore;

  return (
    <>
      <main className="min-h-screen ">
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
        <section className="flex flex-col flex-grow items-center w-full pl-4 pr-4">
          <ToolBar
            key={vistaActual}
            titulo="Empleados"
            onSearch={funcionBusqueda}
            onRegister={handleOpenModal}
            onExport={exportarRegistros}
            isExporting={isExportar}
          />
          <div className="w-full  flex items-center justify-around border border-gray-400 border-b-white rounded-lg rounded-b-none  shadow-md bg-white p-2">
            <button
              onClick={() => cambiarVista("activos")}
              className={` ${
                vistaActual === "activos"
                  ? "py-1 px-2 border-b-3  border-green-500 transition duration-300 cursor-pointer"
                  : "cursor-pointer"
              }`}
            >
              Empleados Activos ({stateEmpleados.registros.length})
            </button>
            <button
              onClick={() => cambiarVista("inactivos")}
              className={` ${
                vistaActual === "inactivos"
                  ? "py-1 px-2 border-b-3  border-red-400 transition duration-300 cursor-pointer "
                  : "hover:bg-gray-100 transition-all cursor-pointer"
              }`}
            >
              Empleados Inactivos ({stateEmpleadosInactivos.registros.length})
            </button>
          </div>
          {isLoading ? (
            <div className="w-full flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <Table
              data={datosRenderizar}
              columnas={columnas}
              onDelete={onDeleteHandler}
              onEdit={onEditHandler}
              onRestore={onRestoreHandler}
              emptyMessage={`No hay empleados ${vistaActual}.`}
            />
          )}
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
          <div>
            <label htmlFor="date_of_entry" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de entrada: 
            </label>
            <input 
            type="date"
            name="date_of_entry"
            value={formatDateToInput(state.form.date_of_entry)}
            onChange={handleDateChange}
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">
              Salario Mensual:
            </label>
            <input 
            type="number"
            min="0"
            name="salary_monthly"
            onChange={handleInputChange}
            value={state.form.salary_monthly}
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
        titulo={`Editar empleado`}
        acciones={userEdit}
      >
        <form
          onSubmit={manejadorSubmitEditar}
          id="FormularioEditarEmpleado"
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
              type="number"
              name="telefono"
              value={empleadoEditar.telefono}
              onChange={handleInputChangeEdit}
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
              onChange={handleInputChangeEdit}
              placeholder="Ingrese el Correo Electrónico"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label htmlFor=""
            className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Entrada:
            </label>
            <input 
            type="date"
            name="date_of_entry"
            value={formatDateToInput(empleadoEditar.date_of_entry)}
            onChange={handleDateChangeEdit}
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label htmlFor="">
              Salario Mensual:
            </label>
            <input 
            type="number"
            name="salary_monthly"
            value={empleadoEditar.salary_monthly}
            onChange={handleInputChangeEdit}
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
        </form>
        <div className="col-span-2 min-h-6 text-center p-0">
            {empleadoEditar.errorMsg && (
              <span className="text-red-600 text-sm m-0">
                {empleadoEditar.errorMsg}
              </span>
            )}
          </div>
      </Modal>
      <Modal
        isOpen={isModalOpenDelete}
        onClose={handleCloseModalDelete}
        titulo="Eliminar Registro"
        acciones={userDelete}
      >
        <p className="text-lg">
          ¿Está seguro de eliminar al empleado <span className="font-bold">{nombreEmpleado || "Desconocido"}</span>
          ?
        </p>
      </Modal>
      <Modal
        isOpen={isModalOpenRestore}
        onClose={handleCloseModalRestore}
        titulo="Restaurar Registro"
        acciones={userRestore}
      >
        <p className="text-lg">
          ¿Está seguro de restaurar al empleado{" "}
          {nombreEmpleado || "Desconocido"}?
        </p>
      </Modal>
    </>
  );
}

export default Empleados;
