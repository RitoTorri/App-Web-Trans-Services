import type { Item } from "../../types/models";



export interface ConfiguracionColumna {
  key: string;
  header: string;
  render?: (item: Item) => React.ReactNode;
}

export interface TableProps {
  data: Item[];
  columnas: ConfiguracionColumna[];

  onEdit?: (item: Item) => void;
  onDelete?: (id: number, nombre?: string) => void;
  onRestore?: (id: number, nombre?: string) => void;
  onView?: (item: Item) => void;
  emptyMessage?: string;
}
