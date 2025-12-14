import ToolBar from "../components/Table/ToolBar";
import Modal from "../components/Modal/Modal";
import React, { useEffect, useMemo, useState } from "react";
import SelectProveedores from "../components/SelectProveedor";
import { apiRegistrar, apiObtener } from "../services/apiCompras";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";

interface RegisterFormState {
  description: string;
  invoice_date: string;
  subtotal: number;
}

interface RegisterState {
  form: RegisterFormState;
  error: boolean;
  errorMsg: string;
}

interface itemCompra {
  control_number: string;
  created_at: string;
  description: string;
  total_bs: string;
  id: number;
  provider: {
    name: string;
    rif: string;
  };
  invoice_date: string;
  provider_id: number;
  status: string;
  subtotal: string;
  total_amount: string;
}

const initialState: RegisterState = {
  form: {
    description: "",
    invoice_date: "",
    subtotal: 0,
  },
  error: false,
  errorMsg: "",
};

interface CompraState {
  registros: Item[];
  error: boolean;
  errorMsg: string;
}

const initialStateCompras: CompraState = {
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

const contarEstadosDePago = (registros: any[]): Record<string, number> => {
  if (!registros || registros.length === 0) {
    return {};
  }

  const counts = registros.reduce((accumulator, registro) => {
    const status = registro.status;
    accumulator[status] = (accumulator[status] || 0) + 1;
    return accumulator;
  }, {} as Record<string, number>);

  return counts;
};

function Compras() {
  const accessToken = localStorage.getItem("token");
  const rol = localStorage.getItem('rol')

  const [state, setState] = useState<RegisterState>(initialState);
  const [stateCompras, setStateCompras] =
    useState<CompraState>(initialStateCompras);

  const [selectProveedorId, setSelectProveedorId] = useState<number | null>(
    null
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalOpenDetalles, setIsModalOpenDetalles] =
    useState<boolean>(false);

  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<itemCompra | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  const urlProveedores = "http://localhost:3000/api/trans/services/providers";

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

  const listarRegistros = async (terminoBusqueda = "") => {
    if (!accessToken) {
      console.error("Token no encontrado");
      return;
    }
    let urlObtener = apiObtener;

    if (terminoBusqueda && terminoBusqueda.trim() !== "") {
      const busqueda = encodeURIComponent(terminoBusqueda.trim());
      urlObtener = `${apiObtener}/search/${busqueda}`;
    }

    if(fechaHasta && fechaDesde){
      const fechaHastaFormateada = encodeURIComponent(fechaHasta.trim())
      const fechaDesdeFormateada = encodeURIComponent(fechaDesde.trim())
      urlObtener = `${apiObtener}-range?start=${fechaDesdeFormateada}&end=${fechaHastaFormateada}`
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


      console.log('ROL: ',rol)

      if (response.ok && data.success) {
        const registrosApi = data.details;
        console.log("Registros", registrosApi);
        setStateCompras((prev) => ({
          ...prev,
          registros: registrosApi,
        }));
      } else {
        setStateCompras((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al cargar registros",
        }));
        console.error("Error: ", data.message);
      }
    } catch (error) {
      setStateCompras((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error del servidor",
      }));
      console.error("Error del servidor", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    listarRegistros();
  }, []);

  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, error: false, errorMsg: "" }));

    if (
      !state.form.invoice_date ||
      !state.form.subtotal ||
      !state.form.description
    ) {
      setState((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Por favor, complete todos los campos.",
      }));
      return;
    }

    try {
      const { invoice_date, subtotal, description } = state.form;

      const dataToSend = {
        description,
        invoice_date,
        subtotal: parseFloat(String(subtotal)),
      };

      const urlObtener = `${apiRegistrar}${selectProveedorId}`;

      const response = await fetch(urlObtener, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      console.log("Datos enviados: ", dataToSend);
      console.log("URL: ", urlObtener);

      if (response.ok) {
        console.log("Registrado con exito");
        listarRegistros();
        setState(initialState);
        setSuccessMessage("Factura registrada con éxito");
        handleCloseModal();

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error("Error: ", errorData);
        setState((prev) => ({
          ...prev,
          error: true,
          errorMsg: "Error al registrar",
        }));
      }
    } catch (error) {
      console.error("Error del servidor: ", error);
      setState((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Error del servidor",
      }));
    }
  };

  const actualizarEstadoPago = async (id: number, status: "pagado" | "cancelado") => {
    if (!accessToken) return;
    try {
      const urlActualizar = `http://localhost:3000/api/trans/services/provider-invoice/${id}/status`;

      const cuerpo = { status: status };

      const response = await fetch(urlActualizar, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(cuerpo),
      });

      console.log("Cuerpo: ", cuerpo);

      const data = await response.json();

      if (response.ok) {
        console.log("Estado actualizado");
        listarRegistros();
        handleCloseModalDetalles();
      } else {
        console.error("Error: ", data.message);
      }
    } catch (error) {
      console.error("Error del servidor: ");
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpeneModalDetales = (registro: itemCompra) => {
    setRegistroSeleccionado(registro);
    setIsModalOpenDetalles(true);
  };
  const handleView = (item: Item) => {
    const itemConId = item as unknown as itemCompra;

    const registroEncontrado = stateCompras.registros.find(
      (r) => r.id === itemConId.id
    );

    if (registroEncontrado) {
      handleOpeneModalDetales(registroEncontrado as itemCompra);
    } else {
      console.log("No hay registro");
    }
  };

  const handleCloseModalDetalles = () => {
    setRegistroSeleccionado(null);
    setIsModalOpenDetalles(false);
  };

  const handleProveedorChange = (id: number | null) => {
    console.log("Proveedor: ", id);
    setSelectProveedorId(id);
  };

  const statusCount = useMemo(() => {
    return contarEstadosDePago(stateCompras.registros);
  }, [stateCompras.registros]);

  const columnas = [
    { key: "control_number", header: "Número de Control" },
    { key: "invoice_date", header: "Fecha Factura" },
    { key: "total_amount", header: "Monto Neto($)" },
    { key: "status", header: "Estado" },
    { key: "actions", header: "Acciones" },
  ];

  const registrosFormateados = stateCompras.registros.map((registro) => {
    const fechaSinFormato = registro.invoice_date;

    return {
      ...registro,
      invoice_date: formatInvoiceDate(fechaSinFormato),
    };
  });

  const userRegistro = (
    <button
      form="FormularioFactura"
      className="btn bg-blue-500 hover:bg-blue-600 text-white"
    >
      Registrar
    </button>
  );

  const renderDetallesAcciones = useMemo(() => {
    if (!registroSeleccionado || registroSeleccionado.status !== "pendiente")
      return null;

    const id = registroSeleccionado.id;

    return (
      <>
        <button
          onClick={() => {
            if (window.confirm("¿Cancelar recepción del pago?")){
              actualizarEstadoPago(id, "cancelado")
            }
          }}
          className="btn bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300"
        >
          Cancelar Pago
        </button>

        <button
          onClick={() => {
            if (window.confirm("¿Confirmar recepción del pago?")) {
              actualizarEstadoPago(id,"pagado");
            }
          }}
          className="btn bg-green-600 text-white hover:bg-green-700 border-green-600"
        >
          Registrar Pago
        </button>

      </>
    );
  }, [registroSeleccionado, actualizarEstadoPago]);

  const renderDetallesBody = useMemo(() => {
    if (!registroSeleccionado) return null;

    const invoiceDateObj = new Date(registroSeleccionado.invoice_date);

    const formattedInvoiceDate = `${invoiceDateObj.getUTCDate()}/${
      invoiceDateObj.getUTCMonth() + 1
    }/${invoiceDateObj.getFullYear()}`;

    return (
      <div className="space-y-4 p-2 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2 border-b pb-1">
              Información de la Factura
            </h3>
            <p>
              <span className="font-semibold">Nro. Control:</span>{" "}
              {registroSeleccionado.control_number}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2 border-b pb-1">
              Información del Proveedor
            </h3>
            <p>
              <span className="font-semibold">Nombre:</span>{" "}
              {registroSeleccionado.provider.name}
            </p>
            <p>
              <span className="font-semibold">RIF:</span>
              {registroSeleccionado.provider.rif}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h3 className="font-bold text-gray-900 mb-2">Fechas Importantes</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase">
                Fecha de Factura
              </p>
              <p className="font-medium">{formattedInvoiceDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">
                Fecha de Registro
              </p>
              <p className="font-medium">
                {new Date(registroSeleccionado.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Estado</p>
              <p className="font-medium first-letter:uppercase">
                {registroSeleccionado.status}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h3 className="font-bold text-gray-900 mb-2">Descripción</h3>
          <div>
            <p className="font-medium">{registroSeleccionado.description}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-lg text-gray-900 mb-3">
            Resumen Financiero
          </h3>

          <div className="flex justify-between items-center mb-2">
            <span>Subtotal:</span>
            <span className="font-mono text-gray-600">
              $ {parseFloat(registroSeleccionado.subtotal).toFixed(2)}
            </span>
          </div>

          {(() => {
            const subtotal = parseFloat(registroSeleccionado.subtotal);
            const total = parseFloat(registroSeleccionado.total_amount);
            const ivaMonto = total - subtotal; // Diferencia entre subtotal y total

            if (ivaMonto > 0) {
              return (
                <div className="flex justify-between items-center mb-2">
                  <span>Impuesto (IVA):</span>
                  <span className="font-mono text-green-600">
                    $ +{ivaMonto.toFixed(2)}
                  </span>
                </div>
              );
            }
            return null;
          })()}

          <div className="flex flex-col mt-4 pt-2 border-t gap-2 border-gray-300">
            <div className="flex justify-between">
            <span className="font-bold text-lg">Monto Total a Pagar:</span>
            <span className="font-bold text-xl text-blue-600 font-mono">
              $ {parseFloat(registroSeleccionado.total_amount).toFixed(2)}
            </span>
            </div>
            {registroSeleccionado.total_bs && (
              <div className="flex justify-between">
              <span className="font-semibold text-base ">Conversión:</span>
              <span className="font-semibold text-lg text-blue-400 font-mono">Bs {parseFloat(registroSeleccionado.total_bs).toFixed(2)}</span>
            </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${
                      registroSeleccionado.status === "pagado"
                        ? "bg-green-100 text-green-700"
                        : registroSeleccionado.status === "pendiente"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
            >
              Estado: {registroSeleccionado.status}
            </span>
          </div>
        </div>
      </div>
    );
  }, [registroSeleccionado]);

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
            onRegister={handleOpenModal}
            onSearch={listarRegistros}
            titulo="Compras"
          />
          {isLoading ? (
            <div className="w-full flex items-center justify-center py-6">
              <span className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <>
              <div className="flex flex-row mb-4 w-full items-start gap-5">
                <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
                  Total: {stateCompras.registros.length}
                </div>
                <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
                  Pagados: {statusCount["pagado"]}
                </div>
                <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
                  Pendientes: {statusCount["pendiente"]}
                </div>
                <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
                  Cancelados: {statusCount["cancelado"]}
                </div>
              </div>
              <div className="w-full flex items-center mb-4 gap-2 bg-white p-2 rounded shadow-sm border border-gray-400">
                <span>De: </span>
                <div>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="border border-gray-400 rounded-md shadow-inner  p-1.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                  />
                </div>
                <span>Hasta:</span>
                <div>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="border border-gray-400 rounded-md shadow-inner  p-1.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                  />
                </div>
                <button
                  className="btn bg-blue-500 pt-2 pb-2 text-white rounded hover:bg-blue-600"
                  onClick={() => listarRegistros()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                  </svg>
                </button>
                {(fechaDesde || fechaHasta) && (
                  <button
                    onClick={() => {
                      setFechaDesde("");
                      setFechaHasta("");
                    }}
                    className="btn text-xs bg-red-400 text-white"
                  >
                    Limpiar Fechas
                  </button>
                )}
              </div>

              <Table
                data={registrosFormateados}
                columnas={columnas}
                onView={handleView}
              />
            </>
          )}
        </section>
      </main>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo="Generar Factura"
        acciones={userRegistro}
      >
        <form
          id="FormularioFactura"
          onSubmit={manejadorSubmit}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <SelectProveedores
              endpointUrl={urlProveedores}
              onProveedorChange={handleProveedorChange}
            />
          </div>
          <div>
            <label
              htmlFor="invoice_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de la Factura:
            </label>
            <input
              type="date"
              name="invoice_date"
              value={state.form.invoice_date}
              onChange={handleInputChange}
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor=""
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción:
            </label>
            <input
              type="text"
              name="description"
              onChange={handleInputChange}
              value={state.form.description}
              maxLength={30}
              placeholder="Ingrese la Descripción"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="subtotal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              SubTotal ($):
            </label>
            <input
              type="number"
              min="0"
              name="subtotal"
              value={state.form.subtotal}
              onChange={handleInputChange}
              placeholder="Ingrese el SubTotal"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          {/* <div>
            <label htmlFor="">Impuesto:</label>
            <input
              type="text"
              value="IVA"
              readOnly
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div> */}
        </form>
      </Modal>
      <Modal
        isOpen={isModalOpenDetalles}
        onClose={handleCloseModalDetalles}
        titulo="Detalles Factura"
        acciones={renderDetallesAcciones}
      >
        {renderDetallesBody}
      </Modal>
    </>
  );
}

export default Compras;
