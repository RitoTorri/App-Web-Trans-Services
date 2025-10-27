import type { ConfiguracionColumna, TableProps } from "./Table.types";
import type { Item } from "../../types/models";

function Table({
  data,
  columnas,
  onDelete,
  onEdit,
  emptyMessage = "No hay registros que mostrar.",
}: TableProps) {
  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto shadow-lg  rounded-box border border-gray-400  bg-base-100 ">
        <table className="table table-auto divide-y divide-gray-200 w-5xl">
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
                    {col.key === "actions" ? (
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => onEdit(item)}
                          className="btn text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
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
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="btn text-red-600 hover:text-red-900 font-medium transition-colors"
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
                    ) : (
                      item[col.key]
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
