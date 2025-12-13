import type React from "react";
import { useEffect, useState } from "react";
import type { Vehiculo } from "../types/models";

interface SelectVehiculosProps{
    endpointUrl: string;
    onVehiculoChange: (vehiculoId: number | null, placa: string | null) => void;
}

const SelectVehiculos: React.FC<SelectVehiculosProps> = ({
    endpointUrl,
    onVehiculoChange,
}) => {
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
    const [cargando, setCargando] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const accessToken = localStorage.getItem("token");

    useEffect(() => {
        const obtenerVehiculos = async () => {
            try{
                const response = await fetch(endpointUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    }
                })

                if(!response.ok){
                    throw new Error(`Error http: ${response.status}`)
                }

                const data = await response.json()
                const registrosApi = data.details;
                const registrosActivos = registrosApi.filter((r: {is_active: boolean}) => r.is_active === true)
                
                setVehiculos(registrosActivos)
            }catch(error){
                if(error instanceof Error){
                    setError(error.message)
                }else{
                    setError("Error desconocido")
                }
            }finally{
                setCargando(false)
            }
        }
        obtenerVehiculos()
    }, [endpointUrl])

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;

        const selectId: number | null = value ? parseInt(value): null;

        let selectPlaca: string | null = null

        if(selectId !== null){
            const vehiculoEncontrado = vehiculos.find((vehiculo) => vehiculo.id === selectId)

            if(vehiculoEncontrado){
                selectPlaca = vehiculoEncontrado.license_plate
            }
        }
        onVehiculoChange(selectId, selectPlaca)
    }

    if(cargando){
        return(
            <select disabled>
                <option>Cargando Vehículos...</option>
            </select>
        )
    }

    if(error){
        return(
            <>
            <label htmlFor="vehiculoError" className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
            <div>
            <select disabled name="vehiculoError" className="max-h-64 overflow-y-auto border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in">
                <option value="Error">No hay Vehículos</option>
            </select>
            </div>
            </>
        )
        console.log(error)
    }

    return(
        <>
        <label
        htmlFor="vehiculoSeleccionado"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Vehículo:
      </label>
      <div>
      <select
        name="vehiculoSeleccionado"
        id="vehiculo-select"
        onChange={handleSelectChange}
        className="max-h-64 overflow-y-auto border border-gray-400 rounded-md mb-2 shadow-xs w-full p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ease-in"
      >
        <option value="">-- Selecciona un Vehículo --</option>

        {vehiculos.map((vehiculo) => (
          <option key={vehiculo.id} value={vehiculo.id}>
            {vehiculo.license_plate}
          </option>
        ))}
      </select>
      </div>
    </>
    )
}

export default SelectVehiculos;