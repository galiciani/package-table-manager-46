
import { useState } from 'react';
import { toast } from 'sonner';
import { TableData } from '@/types/tableTypes';
import { 
  createTable as createTableService, 
  updateTable as updateTableService, 
  deleteTable as deleteTableService,
  fetchTableById
} from '@/services/tableService';

export function useTableOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addTable = async (tableData: Omit<TableData, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTable = await createTableService(tableData);
      toast.success("Tabela criada com sucesso");
      return newTable;
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
      await updateTableService(id, updatedData);
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
      await deleteTableService(id);
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
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const table = await fetchTableById(id);
      return table;
    } catch (err) {
      console.error("Erro ao selecionar tabela:", err);
      setError("Não foi possível carregar os detalhes da tabela.");
      toast.error("Erro ao carregar tabela");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addTable,
    updateTableData,
    deleteTableById,
    selectTable,
    isLoading,
    error
  };
}
