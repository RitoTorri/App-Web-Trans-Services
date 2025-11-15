import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";
import type { Nomina } from "../types/models";
import type { Item } from "../types/models";
import Modal from "../components/Modal/Modal";
import {useState} from "react";

const ejemploNominas: Nomina[] = [
{
    id: 1,
    estado: "Pagada",
    id_empleado: 42,
    inicio_periodo: new Date('2025-10-01'), 
   // fin_periodo: new Date('2025-10-31'),
    salario_diario: 50.00,
    total_dias_pagados: 30,
   // salario_mensual: 1500.00,
   // salario_integral: 1800.00,
  //  ganancias_anuales: 21600.00, 
   // cotizaciones: 50.00,
   // seguridad_social: 150.00,
  //  fondo_desempleo: 10.00,
  //  fondo_ahorros: 20.00,
  //  total_deducciones: 230.00,
  //  salario_neto: 1570.00,
   // creado_en:new Date ('2025-11-15'),
  //  actualizado_en: new Date('2025-11-15'), 
},
];

function Nominas() {
    const Nomina = ejemploNominas;


    const columnas = [
    { key: "id", header: "ID" },
    { key: "estado", header: "Estado" },
    { key: "id_empleado", header: "ID Empleado" },
    { key: "inicio_periodo", header: "Inicio Periodo" },
    //{ key: "fin_periodo", header: "Fin Periodo" },
    { key: "salario_diario", header: "Salario Diario" },
    { key: "total_dias_pagados", header: "Días Pagados" },
   // { key: "salario_mensual", header: "Salario Mensual" },
    //{ key: "salario_integral", header: "Salario Integral" },
    //{ key: "salario_neto", header: "Salario Neto" }, 
    // { key: "ganancias_anuales", header: "Ganancias Anuales" },
    // { key: "cotizaciones", header: "Cotizaciones" },
    // { key: "seguridad_social", header: "Seguridad Social" },
    // { key: "fondo_desempleo", header: "Fondo Desempleo" },
    // { key: "fondo_ahorros", header: "Fondo Ahorros" },
    //{ key: "total_deducciones", header: "Total Deducciones" },
    // { key: "creado_en", header: "Fecha Creación" }, 
    // { key: "actualizado_en", header: "Última Actualización" },
    { key: "actions", header: "Acciones" } 
    ];

    const userRegistro = (
      //Logica para el envío del formulario
    <button className="btn bg-blue-500 hover:bg-blue-600 text-white">
        Registrar
    </button>
    );

    const userEdit = (
    //Logica para el envío del formulario
    <button className="btn bg-blue-500 hover:bg-blue-600 text-white">
        Registrar
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

    const handleOpenModalEdit = () =>{
    setIsModalOpenEdit(true);
}

const handleCloseModalEdit = () =>{
    setIsModalOpenEdit(false);
}

    const handleEdit = (item: Item) => {
    console.log("Editar");
    item;
};

    const handleDelete = (item: Item) => {
    console.log("Eliminar");
    item;
};

    const handleSearch = () => {
    console.log("Buscar");
};

  return (
    <>
      <main className="min-h-screen">
        <section className="flex flex-col flex-grow w-full items-center pl-4 pr-4">
          <ToolBar
            titulo="Nominas"
            onRegister={handleOpenModal}
            onSearch={handleSearch}
          />
          <Table
            data={Nomina}
            columnas={columnas}
            onEdit={handleOpenModalEdit}
            onDelete={handleDelete}
          />
        </section>
      </main>

    <Modal 
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      titulo="Registrar Nueva nomina"
      acciones={userRegistro}
      >
        <form action="" className="grid grid-cols-2 gap-3">
    <div>
        <label
            htmlFor="id"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            ID:
        </label>
        <input
            type="text"
            name="id"
            placeholder="Ingrese el ID"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    <div>
        <label
            htmlFor="estado"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            Estado:
        </label>
        <input
            type="text"
            name="estado"
            placeholder="Ingrese el Estado"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    <div>
        <label
            htmlFor="id_empleado"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            ID Empleado:
        </label>
        <input
            type="text"
            name="id_empleado"
            placeholder="Ingrese el ID Empleado"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    <div>
        <label
            htmlFor="inicio_periodo"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            Inicio Periodo:
        </label>
        <input
            type="text"
            name="inicio_periodo"
            placeholder="Ingrese el Inicio del Periodo"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    {/*
    <div>
        <label
            htmlFor="fin_periodo"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            Fin Periodo:
        </label>
        <input
            type="text"
            name="fin_periodo"
            placeholder="Ingrese el Fin del Periodo"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    */}
    <div>
        <label
            htmlFor="salario_diario"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            Salario Diario:
        </label>
        <input
            type="text"
            name="salario_diario"
            placeholder="Ingrese el Salario Diario"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    <div>
        <label
            htmlFor="total_dias_pagados"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            Días Pagados:
        </label>
        <input
            type="text"
            name="total_dias_pagados"
            placeholder="Ingrese los Días Pagados"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    {/*
    <div>
        <label
            htmlFor="salario_mensual"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            Salario Mensual:
        </label>
        <input
            type="text"
            name="salario_mensual"
            placeholder="Ingrese el Salario Mensual"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    <div>
        <label
            htmlFor="salario_integral"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            Salario Integral:
        </label>
        <input
            type="text"
            name="salario_integral"
            placeholder="Ingrese el Salario Integral"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    <div>
        <label
            htmlFor="total_deducciones"
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            Total Deducciones:
        </label>
        <input
            type="text"
            name="total_deducciones"
            placeholder="Ingrese el Total de Deducciones"
            className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        />
    </div>
    */}
</form>
    </Modal>
      <Modal
    isOpen={isModalOpenEdit}
    onClose={handleCloseModalEdit}
    titulo="Editar Proveedor"
    acciones={userEdit}
>
    <form action="" className="grid grid-cols-2 gap-3">
        <div>
            <label
                htmlFor="id"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                ID:
            </label>
            <input
                type="text"
                name="id"
                placeholder="Ingrese el ID"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        <div>
            <label
                htmlFor="estado"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                Estado:
            </label>
            <input
                type="text"
                name="estado"
                placeholder="Ingrese el Estado"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        <div>
            <label
                htmlFor="id_empleado"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                ID Empleado:
            </label>
            <input
                type="text"
                name="id_empleado"
                placeholder="Ingrese el ID Empleado"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        <div>
            <label
                htmlFor="inicio_periodo"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                Inicio Periodo:
            </label>
            <input
                type="text"
                name="inicio_periodo"
                placeholder="Ingrese el Inicio del Periodo"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        {/*
        <div>
          
            <label
                htmlFor="fin_periodo"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                Fin Periodo:
            </label>
            <input
                type="text"
                name="fin_periodo"
                placeholder="Ingrese el Fin del Periodo"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        */}
        <div>
            <label
                htmlFor="salario_diario"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                Salario Diario:
            </label>
            <input
                type="text"
                name="salario_diario"
                placeholder="Ingrese el Salario Diario"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        <div>
            <label
                htmlFor="total_dias_pagados"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                Días Pagados:
            </label>
            <input
                type="text"
                name="total_dias_pagados"
                placeholder="Ingrese los Días Pagados"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        {/*
        <div>
            <label
                htmlFor="salario_mensual"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                Salario Mensual:
            </label>
            <input
                type="text"
                name="salario_mensual"
                placeholder="Ingrese el Salario Mensual"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        <div>
            <label
                htmlFor="salario_integral"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                Salario Integral:
            </label>
            <input
                type="text"
                name="salario_integral"
                placeholder="Ingrese el Salario Integral"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        <div>
            <label
                htmlFor="salario_neto"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                Salario Neto:
            </label>
            <input
                type="text"
                name="salario_neto"
                placeholder="Ingrese el Salario Neto"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
          <div>
            <label
                htmlFor="total_deducciones"
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                Total Deducciones:
            </label>
            <input
                type="text"
                name="total_deducciones"
                placeholder="Ingrese el Total de Deducciones"
                className="border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
            />
        </div>
        <div></div> 
        */}
    </form>
</Modal>
    </>
  );
}

export default Nominas;