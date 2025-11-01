export interface Item {
  id: number;
  [key: string]: any;
}

export interface Empleado extends Item {
  nombre: string;
  apellido: string;
  cedula: string;
  rol: string;
  telefono: string;
  correo: string;
}

export interface Servicio extends Item{
  nombre_cliente: string;
  placa_vehiculo: string;
  hora_inicio: string;
  hora_finalizacion: string;
  precio: string;
  estado_pago: string;
}

export interface Cliente extends Item{
  nombre: string;
  rif: string;
  telefono:string;
  direccion: string;
  
}

export interface Proveedor extends Item{
  id_factura: string;
  fecha_compra: string;
  descripcion: string;
  total: string;
}
