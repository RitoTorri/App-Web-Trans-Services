export interface Item {
  id: number;
  [key: string]: any;
}

export interface Empleado extends Item {
  nombre: string;
  apellido: string;
  cedula: string;
  rol: string;
  salario_mensual: number;
  fecha_entrada: Date;
  contacts: { contact_info: string; idContact?: number }[];
  nombre_completo: string;
}

export interface Servicio extends Item {
  vehicle_id: number;
  client_id: number;
  price: number;
  start_date: Date;
  end_date: Date;
  isrl: number;
}

export interface Cliente extends Item {
  name: string;
  rif: string;
  contact: string;
  address: string;
}

export interface Proveedor extends Item {
  nombre: string;
  rif: string;
  contacts: { contact_info: string }[];
}

export interface Vehiculo extends Item {
  driver_id: number,
  model: string,
  license_plate: string,
  total_seats: number,
  vehicle_type_id: number;
  is_active?: boolean;
}

export interface Nomina extends Item {
  employee_id: number;
  period_start: Date;
  period_end: Date;
  daily_salary: number;
  total_days_paid: number;
  ivss: number;
  pie: number;
  faov: number;
}

export interface TipoVehiculo extends Item {
  type_name: string;
  description: string;
  created_at: string;
}
