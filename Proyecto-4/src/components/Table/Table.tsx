import type { ConfiguracionColumna, TableProps } from "./Table.types";
import type { Item } from "../../types/models";


type PaymentStatus = "Cancelado" | "Pagado" | "Pendiente" | "pendiente" | "pagado" | "cancelled" | "draft" | "paid";

/**
 * Devuelve las clases Tailwind para el color de fondo y texto del estado de pago.
 * @param status
 * @returns
 */
export const getStatusClasses = (status: PaymentStatus): string => {
  switch (status) {
    case "Pagado":
      return "bg-green-100 text-green-800 border-green-400";
    case "pagado":
      return "bg-green-100 text-green-800 border-green-400"
    case "paid":
      return "bg-green-100 text-green-800 border-green-400"
    case "Pendiente":
      return "bg-yellow-100 text-yellow-800 border-yellow-400";
    case "pendiente":
      return "bg-yellow-100 text-yellow-800 border-yellow-400";
    case "draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-400";
    case "Cancelado":
      return "bg-red-100 text-red-800 border-red-400";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function Table({
  data,
  columnas,
  onDelete,
  onEdit,
  onRestore,
  onView,
  emptyMessage = "No hay registros que mostrar.",
}: TableProps) {
  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 rounded-lg">
        {emptyMessage}
      </div>
    );
  }



  return (
    <>
      <div className="w-full  overflow-x-auto shadow-lg  rounded-box border border-gray-400  rounded-t-none  bg-base-100 ">
        <table className="table table-auto divide-y divide-gray-200 w-full">
          <thead className="bg-gray-50">
            <tr>
              {columnas.map((col: ConfiguracionColumna) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((item: Item) => (
              <tr
                key={item.id}
                className="hover:bg-indigo-50/50 transition-colors duration-150 "
              >
                {columnas.map((col: ConfiguracionColumna) => (
                  <td
                    key={col.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center"
                  >
                    {col.render ? (
                      col.render(item)
                    ) : col.key === "actions" ? (
                      onEdit || onDelete || onRestore || onView ? (
                        <div className="flex space-x-2 justify-center">
                          {onRestore &&  (
                            <button
                              className="btn  font-extrabold"
                              onClick={() => {
                                const name = (item as any)["name"] || "";
                                const lastName =
                                  (item as any)["lastname"] || "";

                                const nombreCompleto =
                                  `${name} ${lastName}`.trim();

                                onRestore(item.id, nombreCompleto);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                className="bi bi-arrow-counterclockwise"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"
                                />
                                <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466" />
                              </svg>
                            </button>
                          )}
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              title="Ver Detalles"
                              className="btn text-blue-600 hover:text-blue-900 font-medium transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="bi bi-eye"
                                viewBox="0 0 16 16"
                              >
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                              </svg>
                            </button>
                          )}

                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="btn  text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
                              title="Editar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="bi bi-pencil-square"
                                viewBox="0 0 16 16"
                              >
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                <path
                                  fill-rule="evenodd"
                                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                />
                              </svg>
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                const name = (item as any)["name"] || "";
                                const lastName =
                                  (item as any)["lastname"] || "";

                                const nombreCompleto =
                                  `${name} ${lastName}`.trim();

                                onDelete(item.id, nombreCompleto);
                              }}
                              className="btn bg-red-500 text-white hover:bg-red-600 font-medium transition-colors"
                              title="Eliminar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="bi bi-trash3"
                                viewBox="0 0 16 16"
                              >
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : null
                    ) : col.key === "estado_pago" || col.key === "status" ? (
                      <span
                        className={`
                px-3 py-1 inline-flex text-sm leading-5 font-semibold 
                rounded-lg border 
                ${getStatusClasses(item[col.key] as PaymentStatus)}
              `}
                      >
                        {item[col.key] as string}
                      </span>
                    ) : (
                      (item as any)[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Table;
