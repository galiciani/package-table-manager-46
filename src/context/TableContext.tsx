
import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface TableContextType {
  tables: TableData[];
  selectedTable: TableData | null;
  addTable: (table: Omit<TableData, 'id'>) => void;
  updateTable: (id: string, table: Partial<TableData>) => void;
  deleteTable: (id: string) => void;
  selectTable: (id: string | null) => void;
  searchProduct: (term: string) => { tableId: string, tableName: string, rows: Record<string, string | number>[] }[];
  showGridLines: boolean;
  toggleGridLines: () => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

// Mock data for tables
const INITIAL_TABLES: TableData[] = [
  {
    id: '1',
    name: 'Caixas de Papelão',
    description: 'Dimensões de caixas de papelão padrão',
    columns: [
      { id: '1', name: 'Código', accessor: 'code' },
      { id: '2', name: 'Descrição', accessor: 'description' },
      { id: '3', name: 'Comprimento (cm)', accessor: 'length' },
      { id: '4', name: 'Largura (cm)', accessor: 'width' },
      { id: '5', name: 'Altura (cm)', accessor: 'height' },
      { id: '6', name: 'Peso Máximo (kg)', accessor: 'maxWeight' },
    ],
    rows: [
      { code: 'CXP-001', description: 'Caixa Pequena', length: 20, width: 15, height: 10, maxWeight: 5 },
      { code: 'CXP-002', description: 'Caixa Média', length: 30, width: 25, height: 20, maxWeight: 10 },
      { code: 'CXP-003', description: 'Caixa Grande', length: 50, width: 40, height: 30, maxWeight: 20 },
      { code: 'CXP-004', description: 'Caixa Extra Grande', length: 60, width: 50, height: 40, maxWeight: 30 },
    ],
  },
  {
    id: '2',
    name: 'Embalagens Plásticas',
    description: 'Dimensões de embalagens plásticas',
    columns: [
      { id: '1', name: 'Código', accessor: 'code' },
      { id: '2', name: 'Tipo', accessor: 'type' },
      { id: '3', name: 'Diâmetro (cm)', accessor: 'diameter' },
      { id: '4', name: 'Altura (cm)', accessor: 'height' },
      { id: '5', name: 'Volume (ml)', accessor: 'volume' },
    ],
    rows: [
      { code: 'EP-001', type: 'Pote Redondo', diameter: 10, height: 5, volume: 250 },
      { code: 'EP-002', type: 'Pote Redondo Grande', diameter: 15, height: 8, volume: 500 },
      { code: 'EP-003', type: 'Garrafa', diameter: 8, height: 25, volume: 1000 },
      { code: 'EP-004', type: 'Garrafa Grande', diameter: 10, height: 30, volume: 2000 },
    ],
  },
];

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [showGridLines, setShowGridLines] = useState(false);

  useEffect(() => {
    // Load tables from localStorage or use initial data
    const storedTables = localStorage.getItem('packageTables');
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    } else {
      setTables(INITIAL_TABLES);
    }
  }, []);

  // Save tables to localStorage whenever they change
  useEffect(() => {
    if (tables.length > 0) {
      localStorage.setItem('packageTables', JSON.stringify(tables));
    }
  }, [tables]);

  const addTable = (table: Omit<TableData, 'id'>) => {
    const newTable = {
      ...table,
      id: Date.now().toString(),
    };
    setTables(prevTables => [...prevTables, newTable]);
  };

  const updateTable = (id: string, updatedData: Partial<TableData>) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === id ? { ...table, ...updatedData } : table
      )
    );
  };

  const deleteTable = (id: string) => {
    setTables(prevTables => prevTables.filter(table => table.id !== id));
    if (selectedTable?.id === id) {
      setSelectedTable(null);
    }
  };

  const selectTable = (id: string | null) => {
    if (!id) {
      setSelectedTable(null);
      return;
    }
    
    const table = tables.find(t => t.id === id) || null;
    setSelectedTable(table);
  };

  const searchProduct = (term: string) => {
    if (!term.trim()) return [];

    const normalizedTerm = term.toLowerCase();
    
    return tables.map(table => {
      // Search in all columns of all rows
      const matchingRows = table.rows.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(normalizedTerm)
        )
      );
      
      return {
        tableId: table.id,
        tableName: table.name,
        rows: matchingRows
      };
    }).filter(result => result.rows.length > 0);
  };

  const toggleGridLines = () => {
    setShowGridLines(prev => !prev);
  };

  return (
    <TableContext.Provider 
      value={{ 
        tables, 
        selectedTable, 
        addTable, 
        updateTable, 
        deleteTable, 
        selectTable,
        searchProduct,
        showGridLines,
        toggleGridLines
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTableData() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTableData must be used within a TableProvider');
  }
  return context;
}
