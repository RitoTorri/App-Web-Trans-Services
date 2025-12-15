import React, { useEffect, useState, useMemo } from "react";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import type { Item, Empleado } from "../types/models";
import Modal from "../components/Modal/Modal";
import {
    apiRegistrar,
    apiObtener,
    apiModificarStatus,
} from "../services/apiNominas";
import { apiObtener as apiObtenerEmpleados } from "../services/apiEmpleados";

const formatDate = (date: Date | string): string => {
    if (!date) return '';
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return String(date).split('T')[0];
};

// Interfaces
interface RegisterFormState {
    employee_id: number;
    period_start: Date;
    period_end: Date;
}

interface RegisterState {
    form: RegisterFormState;
    error: boolean;
    errorMsg: string;
}

const initialState: RegisterState = {
    form: {
        employee_id: 0,
        period_start: new Date(),
        period_end: new Date(),

    },
    error: false,
    errorMsg: "",
};

interface NominasState {
    registros: any[];
    error: boolean;
    errorMsg: string;
}

const initialStateNominas: NominasState = {
    registros: [],
    error: false,
    errorMsg: "",
};



function Nominas() {

    const accessToken = localStorage.getItem("token");
    const [state, setState] = useState<RegisterState>(initialState);
    const [stateNominas, setStateNominas] = useState<NominasState>(initialStateNominas);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [listaEmpleados, setListaEmpleados] = useState<Empleado[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenDetalles, setIsModalOpenDetalles] = useState(false);
    const [registroSeleccionado, setRegistroSeleccionado] = useState<any | null>(null);

    const cargarEmpleados = async () => {
        if (!accessToken) return;
        const url = `${apiObtenerEmpleados}true/all`;
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setListaEmpleados(data.details);
            } else {
                console.error("Error al cargar empleados:", data.message);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: any = value;

        if (['employee_id'].includes(name)) {
            processedValue = Number(value) || 0;
        } else if (['period_start', 'period_end'].includes(name)) {
            processedValue = new Date(value);
        }

        setState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                [name]: processedValue,
            },
            error: false,
            errorMsg: "",
        }));
    };


    const listarRegistros = async (terminoBusqueda = "") => {
        setIsLoading(true);
        if (!accessToken) {
            setStateNominas((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "Token no encontrado",
            }));
            return;
        }

        let filterSearchPayload = {};

        if (terminoBusqueda) {
            const termino = terminoBusqueda.toLowerCase().trim();

            // 1. Detectar si es una fecha (Formato YYYY-MM-DD)
            // Ejemplo: 2025-12-13
            const esFecha = /^\d{4}-\d{2}-\d{2}$/.test(termino);

            if (esFecha) {
                // Según tu tercera foto, enviamos start y end iguales para buscar ese día exacto
                filterSearchPayload = {
                    dateStart: termino,
                    dateEnd: termino
                };
            } else if (['borrador', 'draft'].includes(termino)) {
                filterSearchPayload = { status: 'draft' };
            }
            else if (['pagada', 'pagado', 'paid'].includes(termino)) {
                filterSearchPayload = { status: 'paid' };
            }
            else if (['cancelada', 'cancelado', 'cancelled'].includes(termino)) {
                filterSearchPayload = { status: 'cancelled' };
            } else {
                //ojala dormir toda la semana 
            }
        }

        const filterBody = { filterSearch: filterSearchPayload };

        try {
            const response = await fetch(apiObtener, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(filterBody),
            });

            const data = await response.json();
            console.log("Contenido Nominas: ", data);

            if (response.ok && data.success && Array.isArray(data.details)) {
                setStateNominas((prev) => ({
                    ...prev,
                    registros: data.details,
                }));
            } else {
                setStateNominas((prevState) => ({
                    ...prevState,
                    error: true,
                    errorMsg: data.message || "Error al cargar registros",
                }));
            }
        } catch (error) {
            setStateNominas((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "Error de conexion",
            }));
            console.error("Error: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        listarRegistros();
        cargarEmpleados();
    }, []);

    //Registrar Nominas
    const manejadorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setState((prevState) => ({ ...prevState, error: false, errorMsg: "" }));

        if (
            !state.form.employee_id ||
            !state.form.period_start ||
            !state.form.period_end
        ) {
            setState((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "Por favor complete todos los campos.",
            }));
            return;
        }

        try {
            const dataToSend = {
                employee_id: String(state.form.employee_id),
                period_start: formatDate(state.form.period_start),
                period_end: formatDate(state.form.period_end),
            };

            const response = await fetch(apiRegistrar, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                console.log("Registrado con exito");
                setState(initialState);
                listarRegistros();
                setSuccessMessage("Nomina registrada con éxito.");
                handleCloseModal();

                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
            } else {
                const errorData = await response.json();
                console.error("error del servidor", errorData);
                setState((prevState) => ({
                    ...prevState,
                    error: true,
                    errorMsg: errorData.message || "error al registrar la nomina.",
                }));
            }
        } catch (error) {
            console.error("Error de conexion: ", error);
            setState((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "No se puede conectar al servidor",
            }));
        }
    };


    const editarStatusRegistro = async (id: number, nuevoStatus: string) => {
        if (!accessToken || !["draft", "cancelled", "paid"].includes(nuevoStatus)) {
            return;
        }
        try {
            const apiEditarStatus = `${apiModificarStatus}${id}/${nuevoStatus}`;
            const response = await fetch(apiEditarStatus, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();

            if (response.ok && data.success) {
                console.log("Status actualizado");
                handleCloseModalDetalles(); // Cerramos el modal de detalles
                setSuccessMessage(`Status cambiado a '${nuevoStatus}' con éxito.`);
                listarRegistros();
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                console.error("Error al cambiar status:", data.message);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    // Mappers y Datos para Tabla
    const datosParaTabla = useMemo(() => {

        const mapStatus: Record<string, string> = {
            draft: "Borrador",
            paid: "Pagada",
            cancelled: "Cancelada"
        };

        return stateNominas.registros.map((item) => ({
            id: item.id,
            id_empleado: item.employee?.id,
            empleado: `${item.employee?.name || ''} ${item.employee?.lastname || ''}`.trim(),
            periodo: `${formatDate(item.Payment_period?.from)} - ${formatDate(item.Payment_period?.to)}`,
            monto: `Bs ${item.description?.net_salary}`,
            status: mapStatus[item.status] || item.status,
            // Guardamos el objeto original para usarlo al editar/ver
            original: item
        }));
    }, [stateNominas.registros]);

    const columnas = [
        { key: "id", header: "Nro Empleado" },
        { key: "empleado", header: "Empleado" },
        { key: "periodo", header: "Periodo" },
        { key: "monto", header: "Monto Neto" },
        { key: "status", header: "Estado" },
        { key: "actions", header: "Acciones" },
    ];

    // Contadores
    const contadorNominas = useMemo(() => {
        const contador = {
            paid: 0,
            draft: 0,
            cancelled: 0,
            total: stateNominas.registros.length,
        };

        return stateNominas.registros.reduce((acc, registro) => {
            const estado = registro.status as keyof typeof contador;
            if (estado in acc) {
                acc[estado]++;
            }
            return acc;
        }, contador);
    }, [stateNominas.registros]);


    // Modals Handlers
    const handleOpenModal = () => {
        setState(initialState);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };



    const handleView = (itemTabla: any) => {
        setRegistroSeleccionado(itemTabla.original);
        setIsModalOpenDetalles(true);
    };

    const handleCloseModalDetalles = () => {
        setRegistroSeleccionado(null);
        setIsModalOpenDetalles(false);
    };


    // Renderers
    const userRegistro = (
        <button form="FormularioNomina" className="btn bg-blue-500 hover:bg-blue-600 text-white">
            Registrar
        </button>
    );


    const renderDetallesBody = useMemo(() => {
        if (!registroSeleccionado) return null;

        return (
            <div className="space-y-6 p-2 text-sm text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2 border-b pb-1">
                            Información del Empleado
                        </h3>
                        <p><span className="font-semibold">Nombre:</span> {registroSeleccionado.employee?.name} {registroSeleccionado.employee?.lastname}</p>
                        <p><span className="font-semibold">C.I:</span> {registroSeleccionado.employee?.ci}</p>
                        <p><span className="font-semibold">Rol:</span> {registroSeleccionado.employee?.rol}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2 border-b pb-1">
                            Periodo de Pago
                        </h3>
                        <p><span className="font-semibold">Desde:</span> {formatDate(registroSeleccionado.Payment_period?.from)}</p>
                        <p><span className="font-semibold">Hasta:</span> {formatDate(registroSeleccionado.Payment_period?.to)}</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <h3 className="font-bold text-gray-900 mb-2">Detalles del Cálculo</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <p>Salario Diario: <span className="font-mono">Bs {registroSeleccionado.details?.salary_daily}</span></p>
                        <p>Días Pagados: <span className="font-mono">{registroSeleccionado.details?.total_days_paid}</span></p>
                        <p>Salario Mensual: <span className="font-mono">Bs {registroSeleccionado.description?.monthly_salary}</span></p>
                        <p>Salario Quincenal: <span className="font-mono">Bs {registroSeleccionado.description?.salary_biweekly}</span></p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                        Deducciones y Neto
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-sm text-red-600 mb-3">
                        <p>SSO: Bs {registroSeleccionado.description?.deductions?.sso}</p>
                        <p>PIE: Bs {registroSeleccionado.description?.deductions?.pie}</p>
                        <p>FAOV: Bs {registroSeleccionado.description?.deductions?.faov}</p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-300">
                        <span className="font-bold text-lg">Total Deducciones:</span>
                        <span className="font-bold text-lg text-red-600 font-mono">
                            Bs {registroSeleccionado.description?.totalDeductions}
                        </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-xl">Sueldo Neto:</span>
                        <span className="font-bold text-2xl text-blue-600 font-mono">
                            Bs {registroSeleccionado.description?.net_salary}
                        </span>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${registroSeleccionado.status === "paid" ? "bg-green-100 text-green-700" :
                                registroSeleccionado.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-red-100 text-red-700"}`}>
                            Estado: {
                                registroSeleccionado.status === 'draft' ? 'Borrador' :
                                    registroSeleccionado.status === 'paid' ? 'Pagada' :
                                        registroSeleccionado.status === 'cancelled' ? 'Cancelada' :
                                            registroSeleccionado.status}
                        </span>
                    </div>
                </div>
            </div>
        );
    }, [registroSeleccionado]);

    const renderDetallesAcciones = useMemo(() => {
        if (!registroSeleccionado || registroSeleccionado.status !== "draft") {
            return null;
        }

        const id = registroSeleccionado.id;

        return (
            <>
                <button
                    onClick={() => {
                        if (window.confirm("¿Estás seguro de que deseas CANCELAR esta nómina?")) {
                            editarStatusRegistro(id, "cancelled");
                        }
                    }}
                    className="btn bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300"
                >
                    Cancelar Nómina
                </button>

                <button
                    onClick={() => {
                        if (window.confirm("¿Confirmar pago de nómina?")) {
                            editarStatusRegistro(id, "paid");
                        }
                    }}
                    className="btn bg-green-600 text-white hover:bg-green-700 border-green-600"
                >
                    Procesar Pago
                </button>
            </>
        );
    }, [registroSeleccionado]);

    return (
        <>
            <main className="min-h-screen">
                {successMessage && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow" role="alert">
                        <span className="block sm:inline">{successMessage}</span>
                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setSuccessMessage(null)}>
                            &times;
                        </span>
                    </div>
                )}
                <section className="flex flex-col flex-grow w-full items-center pl-4 pr-4">
                    <ToolBar titulo="Nóminas" onRegister={handleOpenModal} onSearch={listarRegistros} />

                    {isLoading ? (
                        <div className="w-full flex items-center justify-center py-6">
                            <span className="loading loading-spinner loading-xl"></span>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-row mb-4 w-full items-start gap-5">
                                <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
                                    <span>Total: {contadorNominas.total}</span>
                                </div>
                                <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
                                    <span>Pagadas: {contadorNominas.paid}</span>
                                </div>
                                <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
                                    <span>Borrador: {contadorNominas.draft}</span>
                                </div>
                                <div className="p-4 bg-white border border-gray-400 rounded-lg shadow-sm">
                                    <span>Canceladas: {contadorNominas.cancelled}</span>
                                </div>
                            </div>
                            <Table
                                data={datosParaTabla}
                                columnas={columnas}
                                onView={handleView}
                            />
                        </>
                    )}
                </section>
            </main>

            {/* Modal Registro */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} titulo="Registrar Nueva Nómina" acciones={userRegistro}>
                <form id="FormularioNomina" onSubmit={manejadorSubmit} className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">Empleado:</label>
                        <select
                            name="employee_id"
                            onChange={handleInputChange}
                            value={state.form.employee_id || ''}
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        >
                            <option value="">-- Seleccione un Empleado --</option>
                            {listaEmpleados.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} {emp.lastname} (C.I: {emp.ci})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="period_start" className="block text-sm font-medium text-gray-700 mb-1">Periodo de Inicio:</label>
                        <input
                            type="date"
                            name="period_start"
                            onChange={handleInputChange}
                            value={formatDate(state.form.period_start)}
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="period_end" className="block text-sm font-medium text-gray-700 mb-1">Periodo Final:</label>
                        <input
                            type="date"
                            name="period_end"
                            onChange={handleInputChange}
                            value={formatDate(state.form.period_end)}
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aclaratoria:</label>
                        <input
                            type="text"
                            placeholder="aplican los impuestos: faov,pie,sso"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                            readOnly />
                    </div>

                </form>
                <div className="min-h-6 text-center">
                    {state.error && <span className="text-center text-red-500 text-sm m-0">{state.errorMsg}</span>}
                </div>
            </Modal>


            {/* Modal Detalles */}
            < Modal
                isOpen={isModalOpenDetalles}
                onClose={handleCloseModalDetalles}
                titulo="Detalles de Nómina"
                acciones={renderDetallesAcciones}
            >
                {renderDetallesBody}
            </Modal >
        </>
    );

}

export default Nominas;