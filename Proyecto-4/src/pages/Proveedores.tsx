import type { Proveedor } from "../types/models";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import React, {useEffect, useState } from "react";
import Modal from "../components/Modal/Modal";
import {
  apiRegistrar,
  apiObtener,
  apiEliminar,
  apiRestaurar,
  apiEditar,
  apiExportar
} from "../services/apiProveedor";

interface Contact {
  id?: number | null;
  contact_info: string;
}

interface RegisterFormState {
  name: string;
  rif: string;
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
    rif: "",
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

interface ProveedorState {
  registros: Item[];
  error: boolean;
  errorMsg: string;
}

const initialStateProveedores: ProveedorState = {
  registros: [] as Item[],
  error: false,
  errorMsg: "",
};

interface ProveedorEditarState {
  id: number | null;
  name: string;
  rif: string;
  correo: string;
  telefono: string;
  contacts?: Contact[];
  error: boolean;
  errorMsg: string;
}

const initialStateProveedoresEditar: ProveedorEditarState = {
  id: null,
  name: "",
  rif: "",
  correo: "",
  telefono: "",
  contacts: [
    {
      contact_info: "",
      id: null,
    },
  ],
  error: false,
  errorMsg: "",
};

const transformarRegistros = (registrosApi: Proveedor[]): Item[] => {
  return registrosApi.map((proveedor) => {
    const contacts = proveedor.provider_contacts || [];
    const emailObj = contacts.find((c: any) => c.contact_info.includes("@"));
    let phoneObj
    
    if(emailObj){
      phoneObj = contacts.find((c: any ) => c.id !== emailObj.id)
    }

    return {
      ...proveedor,
      correo: emailObj ? emailObj.contact_info : "N/A",
      telefono: phoneObj ? phoneObj.contact_info : "N/A",
    };
  });
};

function Proveedores() {
  const [state, setState] = useState<RegisterState>(initialState);

  const [stateProveedor, setStateProveedor] = useState<ProveedorState>(
    initialStateProveedores
  );
  const [stateProveedorInactivo, setStateProveedorInactivo] =
    useState<ProveedorState>(initialStateProveedores);

  const [nombreProveedor, setNombreProveedor] = useState<string | null>(null);

  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const [proveedorEditar, setProveedorEditar] = useState<ProveedorEditarState>(
    initialStateProveedoresEditar
  );
  const [camposModificados, setCamposModificados] = useState<
    Partial<ProveedorEditarState>
  >({});
  const [originalContacts, setOriginalContacts] = useState<Contact[]>([]);

  const [isLoadingActivos, setIsLoadingActivos] = useState<boolean>(true);
  const [isLoadingInactivos, setIsLoadingInactivos] = useState<boolean>(true);

  const [isExporting, setIsExporting] = useState<boolean>(false)

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [vistaActual, setVistaActual] = useState<"activos" | "inactivos">(
    "activos"
  );

  const [toRestoreId, setToRestoreId] = useState<number | null>(null);

  const accessToken = localStorage.getItem("token");
  const rolUser = localStorage.getItem("rol")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setState((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [name]: value,
      },
      error: false,
      errorMsg: "",
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

  const handleInputChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProveedorEditar((prevState) => {
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

  const onRifChangeEdit = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      part: "tipo" | "numero"
    ) => {
      const currentRif = proveedorEditar.rif || "J-";
      const partes = currentRif.split("-");
  
      const currentType = partes[0]
      const currentNumber = partes.slice(1).join("-")
  
      let newValue = ""
  
      if(part === "tipo"){
        newValue = `${e.target.value}-${currentNumber || ""}`
      }else{
        newValue = `${currentType || "J"}-${e.target.value}`
      }
  
      setProveedorEditar((prevState) => ({
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

   const rifCompletoEdit = proveedorEditar.rif || "";
  const partesEdit = rifCompletoEdit.split("-") 

  const letrasEdit = partesEdit[0]
  const numerosEdit = partesEdit.slice(1).join("-")

  const listarRegistros = async (terminoBusqueda = "") => {
    if (!accessToken) {
      setStateProveedor((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      console.error("Token no encontrado");
      setIsLoadingActivos(false);
      return;
    }

    let busqueda = "providers";
    let urlObtener = `${apiObtener}${busqueda}`;

    if (terminoBusqueda && terminoBusqueda.trim() !== "") {
      busqueda = "provider/search";
      const filterValue = encodeURIComponent(terminoBusqueda.trim());
      urlObtener = `${apiObtener}${busqueda}/${filterValue}`;
    }

    try {
      const response = await fetch(urlObtener, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      console.log("Datos: ", data);

      if (response.ok && data.success) {
        const registrosApi = data.details;
        const registrosParaTabla = transformarRegistros(registrosApi);

        setStateProveedor((prev) => ({
          ...prev,
          registros: registrosParaTabla,
        }));
      } else {
        setStateProveedor((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al cargar registros",
        }));
        console.error("Error: ", data.message);
      }
    } catch (error) {
      setStateProveedor((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error al alistar",
      }));
      console.log("Error del servidor", error);
    } finally {
      setIsLoadingActivos(false);
    }
  };

  const listarRegistrosInactivos = async (terminoBusqueda = "") => {
    if (!accessToken) {
      setStateProveedor((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      console.error("Token no encontrado");
      return;
    }

    let busqueda = "providers-deleted";
    let urlObtenerInactivos = `${apiObtener}${busqueda}`;

    if (terminoBusqueda && terminoBusqueda.trim() !== "") {
      busqueda = "provider/inactive/search";
      const filterValue = encodeURIComponent(terminoBusqueda.trim());
      urlObtenerInactivos = `${apiObtener}${busqueda}/${filterValue}`;
    }

    console.log("Url: ", urlObtenerInactivos);

    try {
      const response = await fetch(urlObtenerInactivos, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const resgistrosApi = data.details;
        const registrosParaTabla = transformarRegistros(resgistrosApi);

        setStateProveedorInactivo((prev) => ({
          ...prev,
          registros: registrosParaTabla,
        }));
      } else {
        setStateProveedorInactivo((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al cargar registros",
        }));

        console.error("Error: ", data.message);
      }
    } catch (error) {
      setStateProveedorInactivo((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error al alistar",
      }));
      console.error("Error de servidor: ", error);
    } finally {
      setIsLoadingInactivos(false);
    }
  };

  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !state.form.name ||
      !state.form.contact_email_info ||
      !state.form.contact_phone_info ||
      !state.form.rif
    ) {
      setState((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Por favor complete todos los campos.",
      }));
      return;
    }

    try {
      const { name, rif, contact_email_info, contact_phone_info } = state.form;

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

      const dataToSend = {
        name,
        rif,
        contacts: contacts,
      };

      const response = await fetch(apiRegistrar, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      const errorData = data.details[0]
      
      if (response.ok) {
        console.log("Registro exitoso");
        setSuccessMessage("Proveedor Registrado con éxito");
        setState(initialState);
        handleCloseModal();
        listarRegistros();

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        console.log("err: ",data.details)
        if(errorData === "Invalid RIF."){
          setState((prev) => ({
            ...prev,
            error:true,
            errorMsg: "Número de RIF invalido, intente de nuevo"
          }))
        }else if(data.details){
          console.log("")
        }
      }
    } catch (error) {
      console.log("Error de servidor: ", error);
    }
  };

  const manejadorSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();

    setProveedorEditar((prevState) => ({
      ...prevState,
      error: false,
      errorMsg: "",
    }));

    const datosEnviar: Partial<ProveedorEditarState & { contacts: Contact[] }> =
      {
        ...camposModificados,
      };

    const contactosModificadosAEnviar: Contact[] = [];

    if (proveedorEditar.contacts && originalContacts.length > 0) {
      proveedorEditar.contacts.forEach((currentContact) => {
        const original = originalContacts.find(
          (oc) => oc.id === currentContact.id
        );

        if (original && original.contact_info !== currentContact.contact_info) {
          contactosModificadosAEnviar.push(currentContact);
        }
      });
    }

    if (contactosModificadosAEnviar.length > 0) {
      datosEnviar.contacts = contactosModificadosAEnviar;
    }

    delete datosEnviar.correo;
    delete datosEnviar.telefono;


    if (!proveedorEditar.name || !proveedorEditar.rif) {
      setProveedorEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Por favor, complete todos los campos obligatorios",
      }));
      return;
    }

    if(proveedorEditar.telefono && proveedorEditar.telefono.length !== 11){
      setProveedorEditar((prev) => ({
        ...prev,
        error: true, 
        errorMsg: "Número de télefono invalido"
      }))
      return
    }

    if(Object.keys(datosEnviar).length === 0){
      setProveedorEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "No se han detectado cambios"
      }))
      return
    }

    if (proveedorEditar.id !== null) {
      await editarRegistro(proveedorEditar.id, datosEnviar);
    }
  };

  const eliminarRegistro = async () => {
    if (!accessToken) {
      setStateProveedor((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado",
      }));
    }

    try {
      const apiEliminarRegistro = `${apiEliminar}${toDeleteId}`;

      console.log("URL: ", apiEliminarRegistro);

      const response = await fetch(apiEliminarRegistro, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Emepleado Eliminado");
        setIsModalOpenDelete(false);
        setToDeleteId(null);
        listarRegistros();
        listarRegistrosInactivos();
      } else {
        setStateProveedor((prev) => ({
          ...prev,
          error: true,
          errorMsg: `Error: ${response.status}`,
        }));
      }
    } catch (error) {
      setStateProveedor((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error de Conexión",
      }));
      console.error("Error de conexion: ", error);
    }
  };

  const restaurarRegistro = async () => {
    if (!accessToken) {
      setStateProveedor((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no ecnontrado",
      }));
      return;
    }

    try {
      const apiRestaurarRegistro = `${apiRestaurar}${toRestoreId}`;

      const response = await fetch(apiRestaurarRegistro, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Proveedor restaurado");
        setIsModalOpenRestore(false);
        setToRestoreId(null);
        listarRegistros();
        listarRegistrosInactivos();
      } else {
        setStateProveedor((prev) => ({
          ...prev,
          error: true,
          errorMsg: data.message || `Error http: ${response.status}`,
        }));
        console.log("Error al restaurar");
      }
    } catch (error) {
      setStateProveedor((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error de conexion",
      }));
      console.error("Error de conexion ", error);
    }
  };

  const editarRegistro = async (
    idEditar: number,
    datosEditar: Partial<{
      name: string;
      rif: string;
      correo: string;
      telefono: string;
      contacts: Contact[];
    }>
  ) => {
    if (!accessToken) {
      setStateProveedor((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Token no encontrado",
      }));
      return;
    }

    

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
        setSuccessMessage("Proveedor Editado con  exito.");
        listarRegistros();
        setCamposModificados({});
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        console.error("Error en la edicion: ", data.details);
        if(data.details === "Provider with this rif already exists."){
        setProveedorEditar((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al editar, el RIF ya se encuntra registrar.",
        }));
      }
      }
    } catch (error) {
      console.error("Error de conexion: ", error);
      setProveedorEditar((prev) => ({
        ...prev,
        error: true,
        errorMsg: "No se puede conectar al servidor",
      }));
    }
  };

  const exportarRegistro = async () => {
    if(!accessToken){
      console.error("Token no encontrado")
      return
    }

    setIsExporting(true)
    try{
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
          console.error("Error al exportar: ", errorData.message)
        }catch{
          console.error("Error desconocido: ",errorMsg)
        }
      }

      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url

      a.download = 'reporte_proveedores_.pdf'
      
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)

    }catch(error){
      console.error("Error del servidor: ",error)
    }finally{
      setIsExporting(false)
    }
  }

  let columnas = [
    { key: "name", header: "Nombre" },
    { key: "rif", header: "rif" },
    { key: "telefono", header: "Teléfono" },
    { key: "correo", header: "Correo" },
    
  ];

  if(rolUser === "SuperUsuario"){
    const columnaAcciones = { key: "actions", header: "Acciones" }
    columnas.push(columnaAcciones)
  }



  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);

  const [isModalOpenRestore, setIsModalOpenRestore] = useState(false);

  const handleOpenModal = () => {
    setState(initialState)
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModalEdit = (proveedor: Item) => {
    const contactsApi = proveedor.provider_contacts || [];

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

    setProveedorEditar({
      id: proveedor.id,
      name: proveedor.name,
      rif: proveedor.rif,
      correo: contactosOrdenados[0].contact_info,
      telefono: contactosOrdenados[1].contact_info,
      contacts: contactosOrdenados,
      error: false,
      errorMsg: "",
    });

    setOriginalContacts(contactosOrdenados);
    setIsModalOpenEdit(true);
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
  };

  const handleOpenModalDelete = (id: number, nombre?: string) => {
    const nombreEstado = nombre ?? null;

    setNombreProveedor(nombreEstado);
    setToDeleteId(id);
    setIsModalOpenDelete(true);
  };

  const handleCloseModalDelete = () => {
    setIsModalOpenDelete(false);
  };

  const handleOpenModalRestore = (id: number, nombre?: string) => {
    const nombreEstado = nombre ?? null;

    setNombreProveedor(nombreEstado);
    setToRestoreId(id);
    setIsModalOpenRestore(true);
  };

  const handleCloseModalRestore = () => {
    setIsModalOpenRestore(false);
  };

  useEffect(() => {
    listarRegistros();
    listarRegistrosInactivos();
  }, []);

  const userRegistro = (
    //Logica para el envío del formulario
    <button
      form="FormularioProveedor"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Registrar
    </button>
  );

  const userEdit = (
    //Logica para el envío del formulario
    <button
      form="FormularioEditarProveedor"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Editar
    </button>
  );

  const userDelete = (
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

  const datosRenderizar =
    vistaActual === "activos"
      ? stateProveedor.registros
      : stateProveedorInactivo.registros;

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
            titulo="Proveedores"
            onRegister={handleOpenModal}
            onSearch={funcionBusqueda}
            onExport={exportarRegistro}
            isExporting={isExporting}
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
              Proveedores Activos ({stateProveedor.registros.length})
            </button>
            <button
              onClick={() => cambiarVista("inactivos")}
              className={` ${
                vistaActual === "inactivos"
                  ? "py-1 px-2 border-b-3  border-red-400 transition duration-300 cursor-pointer "
                  : "hover:bg-gray-100 transition-all cursor-pointer"
              }`}
            >
              Proveedores Inactivos ({stateProveedorInactivo.registros.length})
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
            />
          )}
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Nuevo Proveedor"
        acciones={userRegistro}
      >
        <form
          onSubmit={manejadorSubmit}
          id="FormularioProveedor"
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
              value={state.form.name}
              onChange={handleInputChange}
              placeholder="Ingrese el Nombre"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
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
              Teléfono:
            </label>
            <input
              type="number"
              name="contact_phone_info"
              value={state.form.contact_phone_info}
              onChange={handleInputChange}
              placeholder="Ingrese el Número de Teléfono"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo Electrónico:
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
        titulo="Editar Proveedor"
        acciones={userEdit}
      >
        <form
          onSubmit={manejadorSubmitEditar}
          id="FormularioEditarProveedor"
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
              value={proveedorEditar.name}
              onChange={handleInputChangeEdit}
              placeholder="Ingrese el Nombre"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
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
              Teléfono:
            </label>
            <input
              type="number"
              name="telefono"
              onChange={handleInputChangeEdit}
              value={proveedorEditar.telefono}
              placeholder="Ingrese el Número de Teléfono"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo Electrónico:
            </label>
            <input
              type="email"
              name="correo"
              onChange={handleInputChangeEdit}
              value={proveedorEditar.correo}
              placeholder="Ingrese el Correo Electrónico"
              className="border  border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
        </form>
        <div className="col-span-2 min-h-6 text-center p-0">
                    {proveedorEditar.errorMsg && (
                      <span className="text-red-600 text-sm m-0">
                        {proveedorEditar.errorMsg}
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
          ¿Está seguro de eliminar al Proveedor{" "}
          <span className="font-bold">{nombreProveedor || "Desconocido"}?</span>
        </p>
      </Modal>
      <Modal
        isOpen={isModalOpenRestore}
        onClose={handleCloseModalRestore}
        acciones={userRestore}
        titulo="Restaurar Registro"
      >
        <p className="text-lg">
          ¿Está seguro de restaurar al Proveedor{" "}
          <span className="font-bold">{nombreProveedor || "Desconocido"}?</span>
        </p>
      </Modal>
    </>
  );
}

export default Proveedores;
