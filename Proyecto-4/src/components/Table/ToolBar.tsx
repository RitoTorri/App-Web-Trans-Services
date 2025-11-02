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
          <div className="relative min-w-64">
          <input
            type="text"
            placeholder="Buscar..."
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-400 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
          />
          <button className="absolute right-4 top-1 bottom-1 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search text-gray-600" viewBox="0 0 16 16">
  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
</svg>

          </button>

          </div>

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
