import type React from "react";
import { useState } from "react";
import { apiUrl } from "../services/apiLogin";
import { useNavigate } from "react-router-dom";

interface LoginFormState {
  username: string;
  password: string;
}

interface LoginState {
  form: LoginFormState;
  error: boolean;
  errorMsg: string;
}

const initialState: LoginState = {
  form: {
    username: "",
    password: "",
  },
  error: false,
  errorMsg: "",
};

function InicioSesion() {
  const [state, setState] = useState<LoginState>(initialState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

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
    setIsLoading(true);

    setState((prevState) => ({ ...prevState, error: false, errorMsg: "" }));

    try {
      const { username, password } = state.form;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!state.form.username || !state.form.password) {
        setState((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Por favor, completa todos los campos.",
        }));
        return; // Detiene el envío
      }

      const data = await response.json();

      console.log(data)

      if (response.ok) {
        localStorage.setItem("token", data.details.token);
        localStorage.setItem("username",data.details.user.username)
        
        console.log(localStorage.getItem('username'))
        navigate("/paginainicio", { replace: true });
      } else {
        setState((prevState) => ({
          ...prevState,
          error: true,
          errorMsg: "Credenciales Incorrectas.",
        }));
      }
    } catch (error) {
      console.error("Error de red o conexion: ", error);
      setState((prevState) => ({
        ...prevState,
        error: true,
        errorMsg: "No se puede conectar al servidor.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const isUserNameError = state.error && !state.form.username;
  const isPasswordError = state.error && !state.form.password;

  return (
    <>
      <main className="flex h-screen justify-center items-center bg-white ">
        <section className="w-xl flex flex-col justify-center items-center bg-slate-700 rounded-lg p-8 relative mt-16 shadow-xl">

          <div className="flex justify-center mb-8 w-60 h-60 flex-shrink-0 mx-auto rounded-full border-4 bg-sky-500 shadow-lg p-0.5 absolute -top-32 left-1/2 transform -translate-x-1/2 z-10" >
            <img 
              // ubicacion de la imagen
              src="https://i.pinimg.com/736x/14/20/fd/1420fdb2c1b84a55bc9a61e3050b0fa5.jpg" 
              alt="Logo de la Aplicación" 
              className="rounded-full w-full max-w-xs object-cover" 
              // En caso de error
              onError={(e) => {
                e.currentTarget.onerror = null; 
                e.currentTarget.src = "https://placehold.co/400x100/EF4444/ffffff?text=LOGO+FALLO";
                e.currentTarget.className = "bg-red-500 p-4 rounded-lg w-full max-w-xs object-cover";
              }}
            />
          </div>
          <div className="mt-32">
          <h1 className="text-4xl mb-15 text-center uppercase font-extrabold font-sans text-white">Iniciar Sesión</h1>
          <form
            onSubmit={manejadorSubmit}
            className="flex flex-col w-lg gap-2"
          >
            <div className="mb-4">
              <label
                htmlFor="usuario"
                className="block text-sm font-medium text-white mb-1 transition-all"
                id="labelnombre"
              >
                Usuario:
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="bi bi-person absolute left-3 top-1/2 text-gray-800 h-6 w-6 "
                  viewBox="0 0 16 16"
                  style={{
                    top: "45%",
                    transform: "translateY(calc(-50% - 1px))",
                  }}
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                </svg>
                <input
                  type="text"
                  className={`border border-white text-gray-800 bg-white  rounded-md mb-2 shadow-xs w-full py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in
                    ${
                      isUserNameError
                        ? "border-red-500 ring-red-500 "
                        : "border-gray-400"
                    }`}
                  placeholder="Ingrese su Usuario"
                  name="username"
                  value={state.form.username}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contraseña"
                className="block text-sm text-white font-medium text-gray-700 mb-1"
              >
                Contraseña:
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="bi bi-lock absolute left-3 top-1/2  text-gray-800 h-6 w-6"
                  viewBox="0 0 16 16"
                  style={{
                    top: "45%",
                    transform: "translateY(calc(-50% - 1px))",
                  }}
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"
                  />
                </svg>
                <input
                  type="password"
                  className={`border border-white text-gray-800 bg-white rounded-md mb-2 shadow-xs w-full py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in
                    ${
                      isPasswordError
                        ? "border-red-500 ring-red-500 "
                        : "border-gray-400"
                    }`}
                  placeholder="Ingrese su Contraseña"
                  name="password"
                  value={state.form.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="min-h-6">
              {state.error && (
                <span className="text-center text-red-500 text-sm m-0">
                  {state.errorMsg}
                </span>
              )}
            </div>
            <button
              disabled={isLoading}
              className="btn btn-outline shadow-xs w-2/3 self-center m-5 text-xl text-white bg-sky-600"
            >
              {isLoading ? (
                <div className="w-full flex items-center justify-center py-6">
                  <span className="loading loading-spinner loading-xl"></span>
                </div>
              ) : (
                "Acceder"
              )}
            </button>
            <div className="text-center text-xs text-white mt-5">
                <p>App-Web-Trans-Services / Proyecto-4</p>
            </div>
          </form>
          </div>
        </section>
      </main>
    </>
  );
}

export default InicioSesion;
