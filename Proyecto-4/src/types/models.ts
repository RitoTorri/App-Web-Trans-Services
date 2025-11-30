  export interface Item {
    id: number;
    [key: string]: any;
  }

  export interface Empleado extends Item {
    nombre: string;
    apellido: string;
    cedula: string;
    rol: string;
    contacts: {contact_info: string , idContact?:number}[];
    nombre_completo: string;
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
  name: string;
  rif: string;
  contact:string;
  address: string;
}

export interface Proveedor extends Item{
  nombre: string;
  rif: string;
  contacto: string;
}

export interface Vehiculo extends Item{
    driver_id:number,
    model:string,
    license_plate:string,
    total_seats:number,
    vehicle_type_id:number
}

export interface Nomina extends Item {
    employee_id: number;  // Cambiado de 'id_empleado'
    period_start: string;   // Cambiado de 'inicio_periodo'
    period_end: string;     // Nuevo campo obligatorio
    daily_salary: number; // Cambiado de 'salario_diario'
    total_days_paid: number; // Cambiado de 'total_dias_pagados'
    ivss: number;         // Nuevo campo obligatorio
    pie: number;          // Nuevo campo obligatoriove
    faov: number;         // Nuevo campo obligatorio
}

export interface TipoVehiculo extends Item {
    type_name: string;   
    description: string; 
    created_at: string; 
}
