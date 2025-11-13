  export interface Item {
    id: number;
    [key: string]: any;
  }

  export interface Empleado extends Item {
    nombre: string;
    apellido: string;
    cedula: string;
    rol: string;
    contacts: {contact_info: string}[];
  }

export interface Servicio extends Item{
  nombre_cliente: string;
  placa_vehiculo: string;
  hora_inicio: string;
  hora_finalizacion: string;
  precio: string;
  estado_pago: string;
  salida: string;
  llegada: string;
}

export interface Cliente extends Item{
  nombre: string;
  rif: string;
  telefono:string;
  direccion: string;
  
}

export interface Proveedor extends Item{
  nombre: string;
  rif: string;
  contacto: string;
}

export interface Vehiculo extends Item{
  placa: string;
  total_asientos: string;
  tipo: string;
  
}
