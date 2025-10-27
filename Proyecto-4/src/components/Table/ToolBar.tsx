import React from "react";
import type { ToolBarProps } from "./ToolBar.types";

function ToolBar({ titulo, onSearch, onRegister }: ToolBarProps) {
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  };

  return (
    <>
      <div className="flex justify-between w-4xl items-center mb-5 p-4 bg-white shadow-md rounded-lg m-10 border border-gray-400">
        <h1 className="text-2xl font-bold text-gray-800">{titulo}</h1>

        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar..."
            onChange={handleSearch}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-64 transition duration-150 ease-in-out"
          />

          <button
            onClick={onRegister}
            className="btn text-white bg-blue-500 hover:bg-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              className="bi bi-plus-circle-fill"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
            </svg>
            Registrar Nuevo
          </button>
        </div>
      </div>
    </>
  );
}

export default ToolBar;
