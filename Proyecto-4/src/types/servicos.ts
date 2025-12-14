export interface ServicioApi{
  client: {
    name: string; rif: string;
  }
  retentions: {
    code_retention: string; rate_retention: string; total_retention: string;
  }
  services: {
    end_date: string; id: number; invoice_date: string;
    invoice_number: string; payment_status: string;
    price: string; star_date: string;
  }
  totalAmount: number | number;
  vehicle: {
  license_plate: string; 
  lastname_driver: string;
  name_driver: string;
}
  id: number;
}

export interface ItemPlana{
  id: number;
  factura: string;
  cliente: string;
  placa: string;
  nombre_conductor: string;
  apellido_conductor: string;
  fecha_factura: string;
  monto_final: string;
  estado_pago: string;
}