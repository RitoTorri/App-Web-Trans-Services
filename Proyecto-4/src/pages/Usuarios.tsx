import ToolBar from "../components/Table/ToolBar";
import Modal from "../components/Modal/Modal";
import { useEffect, useState } from "react";
import { apiObtener, apiRegistrar, apiEliminar } from "../services/apiUsuarios";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";

interface RegisterFormState {
  username: string;
  password: string;
  rol: string;
}

interface RegisterState {
  form: RegisterFormState;
  error: boolean;
  errorMsg: string;
}

const initialState: RegisterState = {
  form: {
    username: "",
    password: "",
    rol: "",
  },
  error: false,
  errorMsg: "",
};

interface UsuariosState {
  registros: Item[];
  error: boolean;
  errorMsg: string;
}

const initialStateUsuarios: UsuariosState = {
  registros: [] as Item[],
  error: false,
  errorMsg: "",
};

const formatInvoiceDate = (dateString: string) => {
  if (!dateString) {
    return "N/A";
  }

  const dateObj = new Date(dateString);
  const day = dateObj.getUTCDate();
  const month = dateObj.getUTCMonth() + 1;
  const year = dateObj.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

function Usuarios() {
  const accessToken = localStorage.getItem("token");

  const [state, setState] = useState<RegisterState>(initialState);
  const [stateUsuarios, setStateUsuarios] =
    useState<UsuariosState>(initialStateUsuarios);

  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);

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

  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({ ...prevState, error: false, errorMsg: "" }));

    if (!state.form.username || !state.form.password || !state.form.rol) {
      setState((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Por favor, complete todos los campos",
      }));
      return;
    }

    try {
      const { username, password, rol } = state.form;

      const dataToSend = {
        username,
        password,
        rol,
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

      if (response.ok) {
        console.log("Registrado con exito");
        setState(initialState);
        handleCloseModal();
      } else {
        console.error("Error: ", data.details);
      }
    } catch (error) {
      console.error("Error del servidor: ", error);
    }
  };

  const listarRegistros = async () => {
    if (!accessToken) {
      console.error("Token no encontrado");
      return;
    }

    try {
      const response = await fetch(apiObtener, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const registrosFormateados = data.details.map((item: any) => ({
          ...item,
          created_at: formatInvoiceDate(item.created_at),
        }));

        const registrosApi = data.details;
        console.log(registrosApi);
        setStateUsuarios((prev) => ({
          ...prev,
          registros: registrosFormateados,
        }));
      } else {
        console.error("Error al cargar registros");
      }
    } catch (error) {
      console.error("Error al cargar registros");
    }
  };

  const eliminarRegistro = async () => {
    if (!accessToken) {
      console.error("Token no encontrado");
      return;
    }

    try {
      const eliminarRegistro = `${apiEliminar}${toDeleteId}`;

      const response = await fetch(eliminarRegistro, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Usuario Eliminado");
        setIsModalOpenDelete(false);
        setToDeleteId(null);
        listarRegistros();
      } else {
        console.error("Error al elimar", data.details);
      }
    } catch (error) {
      console.error("Eror del servidor", error);
    }
  };

  useEffect(() => {
    listarRegistros();
  }, []);

  const columnas = [
    { key: "username", header: "Nombre de Usuario" },
    { key: "rol", header: "Rol" },
    { key: "created_at", header: "Fecha de Registro" },
    { key: "actions", header: "Acciones" }
  ];

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState<boolean>(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModalDelete = (id: number, name?: string, username?: string) => {
    const nombreEstado = username ?? null;

    setNombreUsuario(nombreEstado);
    setToDeleteId(id);
    setIsModalOpenDelete(true);
  };

  const handleCloseModalDelete = () => {
    setIsModalOpenDelete(false);
  };


  const userRegistro = (
    <button
      form="FormularioUsuario"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Registrar
    </button>
  );

  const userDelete = (
    //Logica para el envío del formulario
    <button
      onClick={eliminarRegistro}
      className="btn bg-red-500 hover:bg-red-600 text-white"
    >
      Eliminar
    </button>
  );

  return (
    <>
      <main className="min-h-screen">
        <section className="flex flex-col flex-grow w-full items-center pl-4 pr-4">
          <ToolBar
            onRegister={handleOpenModal}
            titulo="Usuarios"
          />
          <Table
            data={stateUsuarios.registros}
            columnas={columnas}
            onDelete={handleOpenModalDelete} 
          />
        </section>
      </main>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Registrar Usuario"
        acciones={userRegistro}
      >
        <form
          id="FormularioUsuario"
          onSubmit={manejadorSubmit}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Usuario:
            </label>
            <input
              type="text"
              name="username"
              onChange={handleInputChange}
              placeholder="Ingrese el Nombre de USuario"
              value={state.form.username}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor=""
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña:
            </label>
            <input
              type="password"
              name="password"
              onChange={handleInputChange}
              placeholder="Ingrese la Contraseña"
              value={state.form.password}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor=""
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rol:
            </label>
            <select
              name="rol"
              value={state.form.rol}
              onChange={handleInputChange}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            >
              <option value="" disabled>
                -- Seleccione un Rol --
              </option>
              <option value="SuperUsuario">SuperUsuario (Acceso Total)</option>
              <option value="Administrador">
                Administrador (Permisos para Crear y Consultar)
              </option>
              <option value="Invitado">Invitado (Solo Visualización)</option>
            </select>
          </div>
        </form>
        <div className="col-span-2 text-center m-0  min-h-6">
          {state.error && (
            <span className="text-red-600 text-sm m-0">{state.errorMsg}</span>
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
          ¿Está seguro de eliminar al usuario <span className="font-bold">{nombreUsuario || "Desconocido"}</span>
          ?
        </p>
      </Modal>
    </>
  );
}

export default Usuarios;
