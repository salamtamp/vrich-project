export type TableColumn<T extends Record<string, unknown>> = {
  key: string;
  label: string;
  width?: string | number; // Optional, can be percent string for proportional sizing
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  bodyAlign?: 'left' | 'center' | 'right';
  bold?: boolean;
  sortable?: boolean;
};

export type TableProps<T extends Record<string, unknown>> = {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyStateComponent?: React.ReactNode;
  onClickRow?: (e: React.MouseEvent<HTMLTableRowElement>, row: T) => void;
  bodyRowProps?: React.HTMLAttributes<HTMLTableRowElement>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  // Selection features
  selectedRowIds?: string[];
  onSelectRow?: (rowId: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  rowIdKey?: string; // default: 'id'
  // Bulk approve
  onApproveSelected?: () => void;
  // Per-row checkbox disabled
  checkboxDisabled?: (row: T) => boolean;
};
