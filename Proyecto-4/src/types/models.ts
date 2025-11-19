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
  placa: string;
  total_asientos: string;
  tipo: string;
  
}

export interface Nomina extends Item{
  estado: string;
  id_empleado: number;
  inicio_periodo: Date;
  //fin_periodo: Date;
  salario_diario: number;
  total_dias_pagados: number;
 // salario_mensual: number;
  //salario_integral: number;
 // ganancias_anuales: number;
 // cotizaciones: number; 
 // seguridad_social: number;
 // fondo_desempleo: number;
 // fondo_ahorros: number;
  //total_deducciones: number;
  //salario_neto: number;
 // creado_en: Date;
 // actualizado_en: Date;
}
