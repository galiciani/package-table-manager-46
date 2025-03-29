
export interface Column {
  id: string;
  name: string;
  accessor: string;
}

export interface TableData {
  id: string;
  name: string;
  description: string;
  columns: Column[];
  rows: Record<string, string | number>[];
}

export interface SearchResult {
  tableId: string;
  tableName: string;
  rows: Record<string, string | number>[];
}
