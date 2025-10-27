import { Link } from "react-router-dom";

function InicioSesion() {
  return (
    <>
      <main className="flex h-screen justify-center items-center bg-gray-800">
        <section className="border w-xl h-120 flex flex-col justify-center items-center bg-gray-50 rounded-lg">
          <h1 className="text-3xl mb-10">Iniciar Sesión</h1>
          <form action="" className="flex flex-col w-lg gap-2 ">
            <label htmlFor="usuario" className="text-xl">
              Usuario:
            </label>
            <input
              type="text"
              className="border rounded p-3 mb-2 shadow-sm"
              placeholder="Ingrese su Usuario"
              name="usuario"
            />
            <label htmlFor="contraseña" className="text-xl">
              Contraseña:
            </label>
            <input
              type="password"
              className="border rounded p-3 shadow-sm"
              placeholder="Ingrese su Contraseña"
              name="contraseña"
            />

            <Link
              to="/paginainicio"
              className="btn  btn-outline w-2/3 self-center m-10 text-xl"
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
