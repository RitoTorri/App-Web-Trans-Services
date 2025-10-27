import SideBar from "../components/SideBar";
import foto from "../assets/icono-usuario.png";

function PaginaInicio() {
  return (
    <>
      <main className="flex min-h-screen">
        <SideBar />
        <div className="flex-1 flex mt-14 justify-center">
          <div className="bg-gray-50 w-5xl h-64  relative rounded-sm shadow-lg border flex items-end">
            <div className="bg-gray-800 px-6 py-2 w-xl h-12 absolute -top-3 left-1/2 transform  -translate-x-1/2  rounded-sm shadow-sm flex justify-center items-center">
              <p className="text-3xl text-white">Bienvenido</p>
            </div>
            <div className="  flex items-center w-full justify-between ">
              <div className="flex items-center">
                <div className="w-20 h-20 flex items-center">
                  <img
                    src={foto}
                    alt="usuario"
                    className="w-full h-full object-cover"
                  />
                  <p className="text-2xl">Usuario...</p>
                </div>
              </div>
              <p className="text-2xl p-5">Tasa Del Dolar</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default PaginaInicio;
