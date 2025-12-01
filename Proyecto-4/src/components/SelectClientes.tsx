import type React from "react";
import { useEffect, useState } from "react";
import type { Cliente } from "../types/models";

interface SelectClientesProps {
  endpointUrl: string;
  onClienteChange: (clienteId: number | null) => void;
}

const SelectClientes: React.FC<SelectClientesProps> = ({
  endpointUrl,
  onClienteChange,
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = localStorage.getItem("token");

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const response = await fetch(endpointUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error http: ${response.status}`);
        }

        const data = await response.json();
        const registrosApi = data.details;
        setClientes(registrosApi);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setCargando(false);
      }
    };
    obtenerClientes();
  }, [endpointUrl]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    const selectId: number | null = value ? parseInt(value) : null;

    onClienteChange(selectId);
  };

  if (cargando) {
    return (
      <select disabled>
        <option>Cargando Clientes...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select disabled>
        <option>Error: {error}</option>
      </select>
    );
  }
  return (
    <>
      <label
        htmlFor="clienteSeleccionado"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Cliente:
      </label>
      <div>
      <select
        name="clienteSeleccionado"
        id="cliente-select"
        onChange={handleSelectChange}
        className="max-h-64 overflow-y-auto border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
      >
        <option value="">-- Selecciona un Cliente --</option>

        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.name}
          </option>
        ))}
      </select>
      </div>
    </>
  );
};

export default SelectClientes;
