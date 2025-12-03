import type { ServicioApi, ItemPlana } from "../types/servicos";

export const mapServiciosToTabla = (registrosApi: ServicioApi[]): ItemPlana[] => {
    return registrosApi.map(registro => {
        const fechaFactura =  registro.services.invoice_date
        ? new Date(registro.services.invoice_date).toLocaleDateString('es-VE')
        : 'N/A'

        const montoFinal = `${registro.totalAmount.toFixed(2)}`

        return{
            id: registro.services.id,

            factura: registro.services.invoice_number,
            cliente: registro.client.name,
            placa: registro.vehicle.license_plate,
            estado_pago: registro.services.payment_status,

            fecha_factura: fechaFactura,
            monto_final: montoFinal
        }
    })
}