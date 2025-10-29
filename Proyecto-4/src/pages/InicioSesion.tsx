import { Link } from "react-router-dom";

function InicioSesion() {
  return (
    <>
      <main className="flex h-screen justify-center items-center bg-gray-800 ">
        <section className="w-xl h-130 flex flex-col justify-center items-center bg-white rounded-lg ">
          <h1 className="text-4xl mb-15 ">Iniciar Sesión</h1>
          <form action="" className="flex flex-col w-lg gap-2 ">
            <div className="mb-4">
              <label
                htmlFor="usuario"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Usuario:
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="bi bi-person absolute left-3 top-1/2 text-gray-400 h-6 w-6 "
                  viewBox="0 0 16 16"
                  style={{ top: '45%', transform: 'translateY(calc(-50% - 1px))' }}
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                </svg>
                <input
                  type="text"
                  className="border border-gray-400 rounded-md mb-2 shadow-xs w-full py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                  placeholder="Ingrese su Usuario"
                  name="usuario"
                />
              </div>
            </div>

            <div>
              <label
               htmlFor="contraseña"
               className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña:
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  
                  fill="currentColor"
                  className="bi bi-lock absolute left-3 top-1/2  text-gray-400 h-6 w-6" 
                  viewBox="0 0 16 16"
                  style={{ top: '45%', transform: 'translateY(calc(-50% - 1px))' }}
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"
                  />
                </svg>
                <input
                  type="password"
                  className="border border-gray-400 rounded-md mb-2 shadow-xs w-full py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                  placeholder="Ingrese su Contraseña"
                  name="contraseña"
                />
              </div>
            </div>
            <Link
              to="/paginainicio"
              className="btn btn-outline shadow-xs w-2/3 self-center m-10 text-xl text-white bg-gray-800 hover:bg-gray-900"
            >
              Acceder
            </Link>
          </form>
        </section>
      </main>
    </>
  );
}

export default InicioSesion;
