
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  fetchTables, 
  fetchTableById, 
  createTable, 
  updateTable, 
  deleteTable,
  searchProducts
} from '../services/tableService';

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
  addTable: (table: Omit<TableData, 'id'>) => Promise<void>;
  updateTable: (id: string, table: Partial<TableData>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  selectTable: (id: string | null) => void;
  searchProduct: (term: string) => Promise<{ tableId: string, tableName: string, rows: Record<string, string | number>[] }[]>;
  showGridLines: boolean;
  toggleGridLines: () => void;
  isLoading: boolean;
  error: string | null;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [showGridLines, setShowGridLines] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar tabelas ao iniciar
  useEffect(() => {
    const loadTables = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTables();
        setTables(data);
      } catch (err) {
        console.error("Erro ao carregar tabelas:", err);
        setError("Não foi possível carregar as tabelas.");
        toast.error("Erro ao carregar tabelas");
      } finally {
        setIsLoading(false);
      }
    };

    loadTables();
  }, []);

  const addTable = async (tableData: Omit<TableData, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTable = await createTable(tableData);
      setTables(prevTables => [...prevTables, newTable]);
      toast.success("Tabela criada com sucesso");
    } catch (err) {
      console.error("Erro ao adicionar tabela:", err);
      setError("Não foi possível criar a tabela.");
      toast.error("Erro ao criar tabela");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTableData = async (id: string, updatedData: Partial<TableData>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateTable(id, updatedData);
      
      // Atualizar o estado local
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === id ? { ...table, ...updatedData } : table
        )
      );
      
      // Se a tabela selecionada foi atualizada, atualizar também
      if (selectedTable?.id === id) {
        setSelectedTable(prev => prev ? { ...prev, ...updatedData } : null);
      }
      
      toast.success("Tabela atualizada com sucesso");
    } catch (err) {
      console.error("Erro ao atualizar tabela:", err);
      setError("Não foi possível atualizar a tabela.");
      toast.error("Erro ao atualizar tabela");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTableById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteTable(id);
      setTables(prevTables => prevTables.filter(table => table.id !== id));
      if (selectedTable?.id === id) {
        setSelectedTable(null);
      }
      toast.success("Tabela excluída com sucesso");
    } catch (err) {
      console.error("Erro ao excluir tabela:", err);
      setError("Não foi possível excluir a tabela.");
      toast.error("Erro ao excluir tabela");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const selectTable = async (id: string | null) => {
    if (!id) {
      setSelectedTable(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const table = await fetchTableById(id);
      setSelectedTable(table);
    } catch (err) {
      console.error("Erro ao selecionar tabela:", err);
      setError("Não foi possível carregar os detalhes da tabela.");
      toast.error("Erro ao carregar tabela");
    } finally {
      setIsLoading(false);
    }
  };

  const searchProduct = async (term: string) => {
    if (!term.trim()) return [];

    setIsLoading(true);
    setError(null);
    try {
      return await searchProducts(term);
    } catch (err) {
      console.error("Erro ao pesquisar produtos:", err);
      setError("Não foi possível realizar a pesquisa.");
      toast.error("Erro ao pesquisar produtos");
      return [];
    } finally {
      setIsLoading(false);
    }
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
        updateTable: updateTableData, 
        deleteTable: deleteTableById, 
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
