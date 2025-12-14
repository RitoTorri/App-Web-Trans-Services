export interface ToolBarProps {
  titulo: string;

  onSearch?: (searchTerm: string) => void;

  onRegister: () => void;
  onExport?: () => void;
  isExporting?: boolean;
}
