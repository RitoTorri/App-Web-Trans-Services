import type React from "react";
import { useEffect, useState } from "react";
import type { Proveedor } from "../types/models";

interface SelectProveedoresProps {
  endpointUrl: string;
  onProveedorChange: (proveedorId: number | null) => void;
}

const SelectProveedores: React.FC<SelectProveedoresProps> = ({
  endpointUrl,
  onProveedorChange,
}) => {
  const [provedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = localStorage.getItem("token");

  useEffect(() => {
    const obtnerProveedores = async () => {
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
        setProveedores(registrosApi);
      } catch (error) {
        if (error instanceof Error) {
          setError("Error desconocido");
        }
      } finally {
        setCargando(false);
      }
    };
    obtnerProveedores();
  }, [endpointUrl]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    const selectId: number | null = value ? parseInt(value) : null;

    onProveedorChange(selectId);
  };

  if (cargando) {
    return (
      <select disabled>
        <option>Cargando Proveedores...</option>
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
       htmlFor="proveedorSeleccionado"
       className="block text-sm font-medium text-gray-700 mb-1">
        Proveedor: 
       </label>
       <div>
        <select name="proveedorSeleccionado" onChange={handleSelectChange}
        className="max-h-64 overflow-y-auto border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
        >
            <option value="">-- Selecciona un Proveedor --</option>
            {provedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.name} ({proveedor.rif})
                </option>
            ))
            }
        </select>
       </div>
    </>
  );
};

export default SelectProveedores;
