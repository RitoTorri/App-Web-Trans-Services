import ToolBar from "../components/Table/ToolBar";
import Modal from "../components/Modal/Modal";
import React, { useEffect, useMemo, useState } from "react";
import SelectProveedores from "../components/SelectProveedor";
import { apiRegistrar, apiObtener } from "../services/apiCompras";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";


interface Taxes {
  code: string;
  name: string;
  percentage: number;
}

interface RegisterFormState {
  control_number: string;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  taxes: Taxes[];
}

interface RegisterState {
  form: RegisterFormState;
  error: boolean;
  errorMsg: string;
}

interface itemCompra {
  control_number: string;
  created_at: string;
  id: number;
  invoice_date: string;
  invoice_number: string;
  provider_id: number;
  status: string;
  subtotal: string;
  total_amount: string;
}

const initialState: RegisterState = {
  form: {
    control_number: "",
    invoice_number: "",
    invoice_date: "",
    subtotal: 0,
    taxes: [
      { code: "iva", name: "impuesto al valor agregado", percentage: 16 },
    ],
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
  if (dateString) {
    return new Date(dateString).toLocaleDateString("es-VE");
  }
  return "N/A";
};

function Compras() {
  const accessToken = localStorage.getItem("token");

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

    const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
    let urlObtener = apiObtener

    if(terminoBusqueda && terminoBusqueda.trim() !== ""){
        const busqueda = encodeURIComponent(terminoBusqueda.trim())
        urlObtener = `${apiObtener}/search/${busqueda}`
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
    }
  };

  useEffect(() => {
    listarRegistros();
  }, []);

  const manejadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, error: false, errorMsg: "" }));

    if (
      !state.form.control_number ||
      !state.form.invoice_date ||
      !state.form.invoice_number ||
      !state.form.subtotal
    ) {
      setState((prev) => ({
        ...prev,
        error: true,
        errorMsg: "Por favor, complete todos los campos.",
      }));
      return;
    }

    try {
      const { control_number, invoice_number, invoice_date, subtotal, taxes } =
        state.form;

      const dataToSend = {
        control_number,
        invoice_number,
        invoice_date,
        subtotal: parseFloat(String(subtotal)),
        taxes,
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
        listarRegistros()
        setState(initialState);
        setSuccessMessage("Factura registrada con éxito")
        handleCloseModal();

        setTimeout(() => {
            setSuccessMessage(null)
        },3000)
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

  const actualizarEstadoPago = async (id: number) => {
    if(!accessToken) return;
    try{
        const urlActualizar = `http://localhost:3000/api/trans/services/provider-invoice/${id}/status`

        const cuerpo = {"status": "pagado"}

        const response = await fetch(urlActualizar, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(cuerpo)
        })

        console.log("Cuerpo: ",cuerpo)

        const data = await response.json()

        if(response.ok){
            console.log("Estado actualizado")
            listarRegistros()
            handleCloseModalDetalles()
        }else{
            console.error("Error: ", data.message)
        }
    }catch(error){
        console.error("Error del servidor: ")
    }
  }

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

  const buscar = () => {
    console.log("buscar");
  };

  const handleProveedorChange = (id: number | null) => {
    console.log("Proveedor: ", id);
    setSelectProveedorId(id);
  };

  const columnas = [
    { key: "invoice_number", header: "Número de Factura" },
    { key: "created_at", header: "Fecha Factura" },
    { key: "total_amount", header: "Monto Neto" },
    { key: "status", header: "Estado" },
    { key: "actions", header: "Acciones" },
  ];

  const registrosFormateados = stateCompras.registros.map((registro) => {
    const fechaSinFormato = registro.created_at;

    return {
      ...registro,
      created_at: formatInvoiceDate(fechaSinFormato),
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
    if(!registroSeleccionado || registroSeleccionado.status !== "pendiente") return null;

    const id = registroSeleccionado.id;

    return(
        <>
            <button
                onClick={() => {if(window.confirm("¿Confirmar recepción del pago?")) {
                    actualizarEstadoPago(id)
                }}}
                className="btn bg-green-600 text-white hover:bg-green-700 border-green-600"
            >
                Registrar Pago
            </button>
        </>
    )
  }, [registroSeleccionado, actualizarEstadoPago])

  const renderDetallesBody = useMemo(() => {
    if (!registroSeleccionado) return null;

    return (
      <div className="space-y-6 p-2 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2 border-b pb-1">
              Información de la Factura
            </h3>
            <p>
              <span className="font-semibold">Nro. Factura:</span>{" "}
              {registroSeleccionado.invoice_number}
            </p>
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
              <span className="font-semibold">ID Proveedor:</span>{" "}
              {registroSeleccionado.provider_id}
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
              <p className="font-medium">
                {new Date(
                  registroSeleccionado.invoice_date
                ).toLocaleDateString()}
              </p>
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
              <p className="font-medium first-letter:uppercase">{registroSeleccionado.status}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-lg text-gray-900 mb-3">
            Resumen Financiero
          </h3>

          <div className="flex justify-between items-center mb-2">
            <span>Subtotal:</span>
            <span className="font-mono text-gray-600">
              Bs {parseFloat(registroSeleccionado.subtotal).toFixed(2)}
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
                    Bs +{ivaMonto.toFixed(2)}
                  </span>
                </div>
              );
            }
            return null;
          })()}

          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-300">
            <span className="font-bold text-lg">Monto Total a Pagar:</span>
            <span className="font-bold text-xl text-blue-600 font-mono">
              Bs {parseFloat(registroSeleccionado.total_amount).toFixed(2)}
            </span>
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
          <Table
            data={registrosFormateados}
            columnas={columnas}
            onView={handleView}
          />
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
              htmlFor="control_number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Control:
            </label>
            <input
              type="text"
              name="control_number"
              value={state.form.control_number}
              onChange={handleInputChange}
              placeholder="Ingrese el Número de Control"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="invoice_number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Factura:
            </label>
            <input
              type="text"
              name="invoice_number"
              value={state.form.invoice_number}
              onChange={handleInputChange}
              placeholder="Ingrese el Número de Factura"
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
          <div>
            <label
              htmlFor="subtotal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              SubTotal:
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
          <div>
            <label htmlFor="">Impuesto:</label>
            <input
              type="text"
              value="IVA"
              readOnly
              className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
          </div>
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
