import SideBar from "../components/SideBar";
import type { Proveedor } from "../types/models";
import type { Item } from "../types/models";
import Table from "../components/Table/Table";
import ToolBar from "../components/Table/ToolBar";

const ejemploProveedores: Proveedor[] = [
  {
    id: 1,
    id_factura: "1278932",
    fecha_compra: "2025-10-12",
    descripcion: "Diez Cauchos",
    total: "12520Bs",
  },
];

function Provedores() {
  const proveedor = ejemploProveedores;

  const columnas = [
    { key: "id_factura", header: "Número de Factura" },
    { key: "fecha_compra", header: "Fecha de la Compra" },
    { key: "descripcion", header: "Descripción" },
    { key: "total", header: "Total" },
    { key: "actions", header: "Acciones" },
  ];

  const handleEdit = (item: Item) => {
    console.log("Editar");
    item;
  };

  const handleDelete = (item: Item) => {
    console.log("Eliminar");
    item;
  };

  const handleRegister = () => {
    console.log("Registrar");
    //Logica para el formulario de registro
  };

  const handleSearch = () => {
    console.log("Buscar");
  };

  return (
    <>
      <main className="flex">
        <SideBar />
        <section className="flex flex-col flex-grow w-full items-center">
          <ToolBar
            titulo="Proveedores"
            onRegister={handleRegister}
            onSearch={handleSearch}
          />
          <Table
            data={proveedor}
            columnas={columnas}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </>
  );
}

export default Provedores;
