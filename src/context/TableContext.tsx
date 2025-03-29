
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchTables } from '@/services/tableService';
import { TableData, SearchResult } from '@/types/tableTypes';
import { useTableOperations } from '@/hooks/useTableOperations';
import { useTableSearch } from '@/hooks/useTableSearch';
import { useTableUISettings } from '@/hooks/useTableUISettings';

interface TableContextType {
  tables: TableData[];
  selectedTable: TableData | null;
  addTable: (table: Omit<TableData, 'id'>) => Promise<void>;
  updateTable: (id: string, table: Partial<TableData>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  selectTable: (id: string | null) => void;
  searchProduct: (term: string) => Promise<SearchResult[]>;
  showGridLines: boolean;
  toggleGridLines: () => void;
  isLoading: boolean;
  error: string | null;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);
  
  // Import custom hooks
  const { 
    addTable: addTableOperation, 
    updateTableData, 
    deleteTableById, 
    selectTable: fetchTable,
    isLoading: operationsLoading,
    error: operationsError
  } = useTableOperations();
  
  const {
    searchProduct,
    isLoading: searchLoading,
    error: searchError
  } = useTableSearch();
  
  const { showGridLines, toggleGridLines } = useTableUISettings();

  // Compute combined loading and error states
  const isLoading = loadingTables || operationsLoading || searchLoading;
  const error = tablesError || operationsError || searchError;

  useEffect(() => {
    const loadTables = async () => {
      setLoadingTables(true);
      setTablesError(null);
      try {
        const data = await fetchTables();
        setTables(data);
      } catch (err) {
        console.error("Erro ao carregar tabelas:", err);
        setTablesError("Não foi possível carregar as tabelas.");
        toast.error("Erro ao carregar tabelas");
      } finally {
        setLoadingTables(false);
      }
    };

    loadTables();
  }, []);

  // Wrapper functions for operations that update the local state
  const addTable = async (tableData: Omit<TableData, 'id'>) => {
    const newTable = await addTableOperation(tableData);
    setTables(prevTables => [...prevTables, newTable]);
  };

  const updateTable = async (id: string, updatedData: Partial<TableData>) => {
    await updateTableData(id, updatedData);
    
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === id ? { ...table, ...updatedData } : table
      )
    );
    
    if (selectedTable?.id === id) {
      setSelectedTable(prev => prev ? { ...prev, ...updatedData } : null);
    }
  };

  const deleteTable = async (id: string) => {
    await deleteTableById(id);
    setTables(prevTables => prevTables.filter(table => table.id !== id));
    if (selectedTable?.id === id) {
      setSelectedTable(null);
    }
  };

  const selectTable = async (id: string | null) => {
    if (!id) {
      setSelectedTable(null);
      return;
    }
    
    const table = await fetchTable(id);
    setSelectedTable(table);
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
        toggleGridLines,
        isLoading,
        error
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

// Export types for use in other files
export type { TableData, Column } from '@/types/tableTypes';
