import React from "react";

function NavH() {
 const nombreUsuario = localStorage.getItem('username')

  return (
    <div className="drawer ">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col ">
        {/* Navbar */}
        <div className="navbar w-full bg-white my-4 rounded-lg border border-gray-400 shadow-sm">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-2"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          {/* Contenedor para el título y el icono, centrados verticalmente */}

          <div className="navbar w-full h-16 px-4 bg-white">
            <div className="mx-2 flex-1 flex items-center gap-2">
              {/* SVG del icono de bus, centrado al mismo nivel */}
              
              <span className="text-3xl font-bold ">
                Bienvenido
              </span>
            </div>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal">
              {/* Navbar menu content here */}
              <li>
                <div className="p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-person-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                    <path
                      fill-rule="evenodd"
                      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                    />
                  </svg>
                  <span>{nombreUsuario}</span>
                </div>
              </li>

              <li>
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost rounded-full"
                  >
                    <div className="indicator">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-bell"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                      </svg>
                      {/* Notificación: cambiar '8' por el número de items actual */}
                      <span className="badge badge-sm indicator-item">10</span>
                    </div>
                  </div>
                  <div
                    tabIndex={0}
                    className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow"
                  >
                    <div className="card-body">
                      <span className="text-lg font-bold">
                        8 Notificaciones
                      </span>
                      <span className="text-info">Lee los mensajes</span>
                      <div className="card-actions">
                        <button className="btn btn-primary btn-block">
                          View cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* Page content here */}
      </div>
    </div>
  );
}

export default NavH;
