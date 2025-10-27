import type { Item } from "../../types/models";

export interface ConfiguracionColumna {
  key: string;
  header: string;
}

export interface TableProps {
  data: Item[];
  columnas: ConfiguracionColumna[];

  onEdit: (item: Item) => void;
  onDelete?: (item: Item) => void;

  emptyMessage?: string;
}
