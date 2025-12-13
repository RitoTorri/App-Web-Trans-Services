import type { ServicioApi, ItemPlana } from "../types/servicos";

export type EnglishStatus = "pending" | "paid" | "canceled";
type SpanishStatus = "Pendiente" | "Pagado" | "Cancelado"

export const traducirEstado = (status: EnglishStatus) : SpanishStatus => {
    switch(status){
        case "pending":
            return "Pendiente";
        case "paid": 
            return "Pagado";
        case "canceled":
            return "Cancelado";
        default:
            return "Desconocido" as SpanishStatus            
    }
}

export const mapServiciosToTabla = (registrosApi: ServicioApi[]): ItemPlana[] => {
    return registrosApi.map(registro => {
        const fechaFactura =  registro.services.invoice_date
        ? new Date(registro.services.invoice_date).toLocaleDateString('es-VE')
        : 'N/A'

        const montoNumerico = Number(registro.totalAmount)

        const montoFinal = !isNaN(montoNumerico)
        ? montoNumerico.toFixed(2)
        : "0.00"

        const estatoTraducido = traducirEstado(registro.services.payment_status as EnglishStatus)

        return{
            id: registro.services.id,

            factura: registro.services.invoice_number,
            cliente: registro.client.name,
            placa: registro.vehicle.license_plate,
            estado_pago: estatoTraducido,
            nombre_conductor: registro.vehicle.name_driver,
            apellido_conductor: registro.vehicle.lastname_driver,
            fecha_factura: fechaFactura,
            monto_final: montoFinal
        }
    })
}