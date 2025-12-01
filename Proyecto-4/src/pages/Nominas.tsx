import React, { useEffect, useState } from "react";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import type { Nomina, Item, Empleado } from "../types/models";
import Modal from "../components/Modal/Modal";
import {
    apiRegistrar,
    apiObtener,
    apiEditar,
} from "../services/apiNominas.ts";
import { apiObtener as apiObtenerEmpleados } from "../services/apiEmpleados";

const formatDate = (date: Date | string): string => {
    if (!date) return '';
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return String(date).split('T')[0];
};

// Interfaces actualizadas para coincidir con la API
interface RegisterFormState {
    employee_id: number;
    period_start: Date;
    period_end: Date;
    daily_salary: number;
    total_days_paid: number;
    ivss: number;
    pie: number;
    faov: number;
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
        daily_salary: 0,
        total_days_paid: 0,
        ivss: 0,
        pie: 0,
        faov: 0,
    },
    error: false,
    errorMsg: "",
};

interface NominasState {
    registros: Item[];
    error: boolean;
    errorMsg: string;
}

const initialStateNominas: NominasState = {
    registros: [] as Item[],
    error: false,
    errorMsg: "",
};

interface NominaEditarState {
    id: number | null;
    status: string;
    employee_id: number;
    period_start: Date;
    period_end: Date;
    daily_salary: number;
    total_days_paid: number;
    ivss: number;
    pie: number;
    faov: number;
    error: boolean;
    errorMsg: string;
}

const initialStateNominaEditar: NominaEditarState = {
    id: null,
    status: "draft",
    employee_id: 0,
    period_start: new Date(),
    period_end: new Date(),
    daily_salary: 0,
    total_days_paid: 0,
    ivss: 0,
    pie: 0,
    faov: 0,
    error: false,
    errorMsg: "",
};

function Nominas() {

    const accessToken = localStorage.getItem("token");
    const [state, setState] = useState<RegisterState>(initialState);
    const [stateNominas, setStateNominas] = useState<NominasState>(initialStateNominas);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [nominaEditar, setNominaEditar] = useState<NominaEditarState>(initialStateNominaEditar);
    const [camposModificados, setCamposModificados] = useState<Partial<NominaEditarState>>({});
    const [listaEmpleados, setListaEmpleados] = useState<Empleado[]>([]);

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

        if (['employee_id', 'daily_salary', 'total_days_paid', 'ivss', 'pie', 'faov'].includes(name)) {
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

    const handleInputChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: any = value;

        if (['employee_id', 'daily_salary', 'total_days_paid', 'ivss', 'pie', 'faov'].includes(name)) {
            processedValue = Number(value) || 0;
        } else if (['period_start', 'period_end'].includes(name)) {
            processedValue = new Date(value);
        }

        setNominaEditar((prevState) => ({
            ...prevState,
            [name]: processedValue,
            error: false,
            errorMsg: "",
        }));

        setCamposModificados((prevFields) => ({
            ...prevFields,
            [name]: processedValue,
        }));
    };

    const listarRegistros = async (terminoBusqueda = "") => {
        if (!accessToken) {
            setStateNominas((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "Token no encontrado",
            }));
            console.error("DEBUG: Token no encontrado.");
            return;
        }

        const filterBody = terminoBusqueda ? { filterSearch: { status: terminoBusqueda } } : {};

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
            console.log("Contenido: ", data);

            if (response.ok && data.success) {
                const registrosParseados: Nomina[] = data.details.map((item: any) => {
                    const apiPeriodStart = item.Payment_period?.from || item.period_start;
                    const apiPeriodEnd = item.Payment_period?.to || item.period_end;

                    return {
                        id: item.id || 0,
                        status: item.status || 'draft',
                        employee_id: item.employee?.id || 0,
                        period_start: apiPeriodStart ? new Date(apiPeriodStart) : new Date(),
                        period_end: apiPeriodEnd ? new Date(apiPeriodEnd) : new Date(),
                        daily_salary: Number(item.details?.salary_daily || item.daily_salary || 0),
                        total_days_paid: Number(item.details?.total_days_paid || item.total_days_paid || 0),
                        ivss: Number(item.description?.deductions?.ivss || item.ivss || 0),
                        pie: Number(item.description?.deductions?.pie || item.pie || 0),
                        faov: Number(item.description?.deductions?.faov || item.faov || 0),
                    }
                });

                setStateNominas((prev) => ({
                    ...prev,
                    registros: registrosParseados,
                }));
            } else {
                setStateNominas((prevState) => ({
                    ...prevState,
                    error: true,
                    errorMsg: data.message || "Error al cargar registros",
                }));
                console.error("Fallo: ", data.message);
            }
        } catch (error) {
            setStateNominas((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "Error de conexion",
            }));
            console.error("Error: ", error);
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

//        if (!accessToken) {
//            setState((prevState) => ({
//                ...prevState,
//                error: true,
//                errorMsg: "Token no encontrado. Por favor inicie sesión nuevamente.",
//            }));
//            return;
//        }

        if (
            !state.form.employee_id ||
            !state.form.period_start ||
            !state.form.period_end ||
            !state.form.daily_salary ||
            !state.form.total_days_paid ||
            state.form.ivss === undefined ||
            state.form.pie === undefined ||
            state.form.faov === undefined
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
                daily_salary: String(state.form.daily_salary),
                total_days_paid: String(state.form.total_days_paid),
                ivss: String(state.form.ivss),
                pie: String(state.form.pie),
                faov: String(state.form.faov),
            };

            console.log("Datos a enviar:", dataToSend);

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

    //Editar Nomina
    const manejadorSubmitEditar = async (e: React.FormEvent) => {
        e.preventDefault();
        setNominaEditar((prevState) => ({
            ...prevState,
            error: false,
            errorMsg: "",
        }));

        if (nominaEditar.status !== "draft") {
            setNominaEditar((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "solo se puede editar una nomina en estado draft."
            }))
            return;
        }

        if (Object.keys(camposModificados).length === 0) {
            setNominaEditar((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "No se han detectado cambios.",
            }));
            return;
        }

        if (
            !nominaEditar.employee_id ||
            !nominaEditar.period_start ||
            !nominaEditar.period_end ||
            !nominaEditar.daily_salary ||
            !nominaEditar.total_days_paid ||
            nominaEditar.ivss === undefined ||
            nominaEditar.pie === undefined ||
            nominaEditar.faov === undefined
        ) {
            setNominaEditar((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "Por favor, complete los campos obligatorios."
            }));
            return;
        }


        if (nominaEditar.id !== null) {
            await editarDatosRegistro(nominaEditar.id, camposModificados);
        }
    };


    const editarDatosRegistro = async (
        idEditar: number,
        datosEditar: Partial<{
            period_start: Date;
            period_end: Date;
            daily_salary: number;
            total_days_paid: number;
            ivss: number;
            pie: number;
            faov: number;
        }>
    ) => {
        if (!accessToken) {
            setStateNominas((prevState) => ({
                ...prevState,
                error: true,
                errorMsg: "Token no encontrado",
            }));
            return;
        }

        const dataToSend = {
            ...datosEditar,
            ...(datosEditar.period_start && { period_start: formatDate(datosEditar.period_start) }),
            ...(datosEditar.period_end && { period_end: formatDate(datosEditar.period_end) }),
        };

        try {
            const apiEditarRegistro = `${apiEditar}${idEditar}`;
            const response = await fetch(apiEditarRegistro, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();
            console.log("RESPUESTA DE EDITADO", data);

            if (response.ok && data.success) {
                console.log("Registro Editado")
                handleCloseModalEdit();
                setSuccessMessage("Nomina editado con éxito.");
                listarRegistros();
                setCamposModificados({});
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 3000);
            } else {
                console.error("Error en la edicion: ", data.message)
                setNominaEditar((prev) => ({
                    ...prev,
                    error: true,
                    errorMsg: data.message || "Error al editar la nómina.",
                }));
            }
        } catch (error) {
            console.error("Error de conexión: ", error)
            setNominaEditar((prev) => ({
                ...prev,
                error: true,
                errorMsg: "Error al conectar al servidor.",
            }));
        }
    };

    const editarStatusRegistro = async (id: number, nuevoStatus: string) => {
        if (!accessToken || !["draft", "cancelled", "paid"].includes(nuevoStatus)) {
            setNominaEditar((prev) => ({
                ...prev,
                error: true,
                errorMsg: "Status inválido o token no encontrado.",
            }));
            return;
        }
        try {
            const apiEditarStatus = `${apiEditar}${id}/${nuevoStatus}`;
            const response = await fetch(apiEditarStatus, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            console.log("Respuesta de cambio de status:", data);
            if (response.ok && data.success) {
                console.log("Status actualizado");
                handleCloseModalEdit();
                setSuccessMessage(`Status cambiado a '${nuevoStatus}' con éxito.`);
                listarRegistros();
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                console.error("Error al cambiar status:", data.message);
                setNominaEditar((prev) => ({
                    ...prev,
                    error: true,
                    errorMsg: data.message || "Error al cambiar el status.",
                }));
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            setNominaEditar((prev) => ({
                ...prev,
                error: true,
                errorMsg: "Error al conectar al servidor.",
            }));
        }
    };


    const columnas = [
        { key: "status", header: "Status" },
        { key: "employee_id", header: "Employee ID" },
        { key: "period_start", header: "Period Start" },
        { key: "period_end", header: "Period End" },
        { key: "daily_salary", header: "Daily Salary" },
        { key: "total_days_paid", header: "Total Days Paid" },
        { key: "ivss", header: "IVSS" },
        { key: "pie", header: "PIE" },
        { key: "faov", header: "FAOV" },
        { key: "actions", header: "Acciones" },
    ];

    const userRegistro = (
        //Logica para el envío del formulario
        <button
            form="FormularioNomina"
            className="btn bg-blue-500 hover:bg-blue-600 text-white"
        >
            Registrar
        </button>
    );

    const userEdit = (
        //Logica para el envío del formulario
        <button form="FormularioEditarNomina" className="btn bg-blue-500 hover:bg-blue-600 text-white">
            Editar
        </button>
    );

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoStatus = e.target.value;
        if (nominaEditar.id !== null) {
            editarStatusRegistro(nominaEditar.id, nuevoStatus);
        }
    };

    const handleOpenModalEdit = (nomina: Item) => {
        setNominaEditar({
            id: nomina.id,
            status: nomina.status || "draft",
            employee_id: nomina.employee_id,
            period_start: nomina.period_start instanceof Date ? nomina.period_start : new Date(nomina.period_start),
            period_end: nomina.period_end instanceof Date ? nomina.period_end : new Date(nomina.period_end),
            daily_salary: nomina.daily_salary,
            total_days_paid: nomina.total_days_paid,
            ivss: nomina.ivss || 0,
            pie: nomina.pie || 0,
            faov: nomina.faov || 0,
            error: false,
            errorMsg: "",
        });
        setIsModalOpenEdit(true);
    };

        const handleCloseModalEdit = () => {
        setIsModalOpenEdit(false);
    };

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
                    <ToolBar titulo="Nominas" onRegister={handleOpenModal} onSearch={listarRegistros} />
                    <Table data={stateNominas.registros} columnas={columnas} onEdit={handleOpenModalEdit} />
                </section>
            </main>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} titulo="Registrar Nueva Nómina" acciones={userRegistro}>
                <form id="FormularioNomina" onSubmit={manejadorSubmit} className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">Employee:</label>
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
                        <label htmlFor="period_start" className="block text-sm font-medium text-gray-700 mb-1">Period Start:</label>
                        <input
                            type="date"
                            name="period_start"
                            onChange={handleInputChange}
                            value={formatDate(state.form.period_start)}
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="period_end" className="block text-sm font-medium text-gray-700 mb-1">Period End:</label>
                        <input
                            type="date"
                            name="period_end"
                            onChange={handleInputChange}
                            value={formatDate(state.form.period_end)}
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="daily_salary" className="block text-sm font-medium text-gray-700 mb-1">Daily Salary:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="daily_salary"
                            onChange={handleInputChange}
                            value={state.form.daily_salary || ''}
                            placeholder="Ingrese el salario diario"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="total_days_paid" className="block text-sm font-medium text-gray-700 mb-1">Total Days Paid:</label>
                        <input
                            type="number"
                            name="total_days_paid"
                            onChange={handleInputChange}
                            value={state.form.total_days_paid || ''}
                            placeholder="Ingrese los días pagados"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="ivss" className="block text-sm font-medium text-gray-700 mb-1">IVSS:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="ivss"
                            onChange={handleInputChange}
                            value={state.form.ivss || ''}
                            placeholder="Ingrese la deducción IVSS"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="pie" className="block text-sm font-medium text-gray-700 mb-1">PIE:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="pie"
                            onChange={handleInputChange}
                            value={state.form.pie || ''}
                            placeholder="Ingrese la deducción PIE"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="faov" className="block text-sm font-medium text-gray-700 mb-1">FAOV:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="faov"
                            onChange={handleInputChange}
                            value={state.form.faov || ''}
                            placeholder="Ingrese la deducción FAOV"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                </form>
                <div className="min-h-6 text-center">
                    {state.error && <span className="text-center text-red-500 text-sm m-0">{state.errorMsg}</span>}
                </div>
            </Modal>

            {/* Modal de Edición */}
            <Modal isOpen={isModalOpenEdit} onClose={handleCloseModalEdit} titulo="Editar Nómina" acciones={userEdit}>
                <form id="FormularioEditarNomina" onSubmit={manejadorSubmitEditar} className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                        <select
                            name="status"
                            value={nominaEditar.status}
                            onChange={handleStatusChange}
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        >
                            <option value="draft">Draft</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">Employee:</label>
                        <select
                            name="employee_id"
                            value={nominaEditar.employee_id || ''}
                            onChange={handleInputChangeEdit}
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
                        <label htmlFor="period_start" className="block text-sm font-medium text-gray-700 mb-1">Period Start:</label>
                        <input
                            type="date"
                            name="period_start"
                            onChange={handleInputChangeEdit}
                            value={formatDate(nominaEditar.period_start)}
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="period_end" className="block text-sm font-medium text-gray-700 mb-1">Period End:</label>
                        <input
                            type="date"
                            name="period_end"
                            onChange={handleInputChangeEdit}
                            value={formatDate(nominaEditar.period_end)}
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="daily_salary" className="block text-sm font-medium text-gray-700 mb-1">Daily Salary:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="daily_salary"
                            onChange={handleInputChangeEdit}
                            value={nominaEditar.daily_salary || ''}
                            placeholder="Ingrese el salario diario"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="total_days_paid" className="block text-sm font-medium text-gray-700 mb-1">Total Days Paid:</label>
                        <input
                            type="number"
                            name="total_days_paid"
                            onChange={handleInputChangeEdit}
                            value={nominaEditar.total_days_paid || ''}
                            placeholder="Ingrese los días pagados"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="ivss" className="block text-sm font-medium text-gray-700 mb-1">IVSS:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="ivss"
                            onChange={handleInputChangeEdit}
                            value={nominaEditar.ivss || ''}
                            placeholder="Ingrese la deducción IVSS"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="pie" className="block text-sm font-medium text-gray-700 mb-1">PIE:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="pie"
                            onChange={handleInputChangeEdit}
                            value={nominaEditar.pie || ''}
                            placeholder="Ingrese la deducción PIE"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div>
                        <label htmlFor="faov" className="block text-sm font-medium text-gray-700 mb-1">FAOV:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="faov"
                            onChange={handleInputChangeEdit}
                            value={nominaEditar.faov || ''}
                            placeholder="Ingrese la deducción FAOV"
                            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
                        />
                    </div>
                    <div className="col-span-2 text-center m-0 min-h-6">
                        {nominaEditar.errorMsg && <span className="text-red-600 text-sm m-0">{nominaEditar.errorMsg}</span>}
                    </div>
                </form>
            </Modal>
        </>
    );

}

export default Nominas;