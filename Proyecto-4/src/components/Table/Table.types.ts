import type { Item } from "../../types/models";

export interface ConfiguracionColumna {
  key: string;
  header: string;
}

export interface TableProps {
  data: Item[];
  columnas: ConfiguracionColumna[];

  onEdit: (item: Item) => void;
  onDelete?: (id: number, nombre?: string) => void;

  emptyMessage?: string;
}
