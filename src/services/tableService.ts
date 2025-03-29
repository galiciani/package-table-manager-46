
import { supabase } from "@/integrations/supabase/client";
import { Column, TableData } from "@/context/TableContext";

export type MeasurementTable = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TableColumn = {
  id: string;
  table_id: string;
  name: string;
  accessor: string;
  sequence_order: number;
  created_at: string;
};

export type TableRow = {
  id: string;
  table_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
};

// Buscar todas as tabelas
export const fetchTables = async (): Promise<TableData[]> => {
  try {
    // Buscar todas as tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('measurement_tables')
      .select('*')
      .order('name');

    if (tablesError) throw tablesError;

    const result: TableData[] = [];

    // Para cada tabela, buscar suas colunas e linhas
    for (const table of tables) {
      const { data: columns, error: columnsError } = await supabase
        .from('table_columns')
        .select('*')
        .eq('table_id', table.id)
        .order('sequence_order');

      if (columnsError) throw columnsError;

      const { data: rows, error: rowsError } = await supabase
        .from('table_rows')
        .select('*')
        .eq('table_id', table.id);

      if (rowsError) throw rowsError;

      // Mapear colunas para o formato esperado pelo TableContext
      const mappedColumns: Column[] = columns.map(col => ({
        id: col.id,
        name: col.name,
        accessor: col.accessor
      }));

      // Mapear linhas (extrair os dados do campo JSONB)
      const mappedRows = rows.map(row => row.data);

      result.push({
        id: table.id,
        name: table.name,
        description: table.description || '',
        columns: mappedColumns,
        rows: mappedRows
      });
    }

    return result;
  } catch (error) {
    console.error("Erro ao buscar tabelas:", error);
    throw error;
  }
};

// Buscar uma única tabela pelo ID
export const fetchTableById = async (id: string): Promise<TableData | null> => {
  try {
    // Buscar a tabela
    const { data: table, error: tableError } = await supabase
      .from('measurement_tables')
      .select('*')
      .eq('id', id)
      .single();

    if (tableError) {
      if (tableError.code === 'PGRST116') return null; // Não encontrado
      throw tableError;
    }

    // Buscar colunas
    const { data: columns, error: columnsError } = await supabase
      .from('table_columns')
      .select('*')
      .eq('table_id', id)
      .order('sequence_order');

    if (columnsError) throw columnsError;

    // Buscar linhas
    const { data: rows, error: rowsError } = await supabase
      .from('table_rows')
      .select('*')
      .eq('table_id', id);

    if (rowsError) throw rowsError;

    // Mapear para o formato esperado
    const mappedColumns: Column[] = columns.map(col => ({
      id: col.id,
      name: col.name,
      accessor: col.accessor
    }));

    const mappedRows = rows.map(row => row.data);

    return {
      id: table.id,
      name: table.name,
      description: table.description || '',
      columns: mappedColumns,
      rows: mappedRows
    };
  } catch (error) {
    console.error("Erro ao buscar tabela por ID:", error);
    throw error;
  }
};

// Criar uma nova tabela
export const createTable = async (table: Omit<TableData, 'id'>): Promise<TableData> => {
  try {
    // Verificar se o usuário está autenticado
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("Usuário não autenticado");
    }

    // Inserir a tabela
    const { data: newTable, error: tableError } = await supabase
      .from('measurement_tables')
      .insert({
        name: table.name,
        description: table.description,
        created_by: userData.user.id
      })
      .select()
      .single();

    if (tableError) throw tableError;

    // Inserir as colunas
    const columnsToInsert = table.columns.map((col, index) => ({
      table_id: newTable.id,
      name: col.name,
      accessor: col.accessor,
      sequence_order: index + 1
    }));

    const { data: newColumns, error: columnsError } = await supabase
      .from('table_columns')
      .insert(columnsToInsert)
      .select();

    if (columnsError) throw columnsError;

    // Inserir as linhas
    if (table.rows.length > 0) {
      const rowsToInsert = table.rows.map(row => ({
        table_id: newTable.id,
        data: row
      }));

      const { error: rowsError } = await supabase
        .from('table_rows')
        .insert(rowsToInsert);

      if (rowsError) throw rowsError;
    }

    // Mapear colunas para o formato esperado
    const mappedColumns: Column[] = newColumns.map(col => ({
      id: col.id,
      name: col.name,
      accessor: col.accessor
    }));

    return {
      id: newTable.id,
      name: newTable.name,
      description: newTable.description || '',
      columns: mappedColumns,
      rows: table.rows
    };
  } catch (error) {
    console.error("Erro ao criar tabela:", error);
    throw error;
  }
};

// Atualizar uma tabela existente
export const updateTable = async (id: string, tableData: Partial<TableData>): Promise<void> => {
  try {
    // Verificar se o usuário está autenticado
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("Usuário não autenticado");
    }

    // Atualizar a tabela
    if (tableData.name !== undefined || tableData.description !== undefined) {
      const { error: tableError } = await supabase
        .from('measurement_tables')
        .update({
          name: tableData.name,
          description: tableData.description
        })
        .eq('id', id);

      if (tableError) throw tableError;
    }

    // Atualizar colunas
    if (tableData.columns) {
      // Primeiro remover todas as colunas existentes
      const { error: deleteError } = await supabase
        .from('table_columns')
        .delete()
        .eq('table_id', id);

      if (deleteError) throw deleteError;

      // Inserir as novas colunas
      const columnsToInsert = tableData.columns.map((col, index) => ({
        table_id: id,
        name: col.name,
        accessor: col.accessor,
        sequence_order: index + 1
      }));

      const { error: columnsError } = await supabase
        .from('table_columns')
        .insert(columnsToInsert);

      if (columnsError) throw columnsError;
    }

    // Atualizar linhas
    if (tableData.rows) {
      // Primeiro remover todas as linhas existentes
      const { error: deleteError } = await supabase
        .from('table_rows')
        .delete()
        .eq('table_id', id);

      if (deleteError) throw deleteError;

      // Inserir as novas linhas
      if (tableData.rows.length > 0) {
        const rowsToInsert = tableData.rows.map(row => ({
          table_id: id,
          data: row
        }));

        const { error: rowsError } = await supabase
          .from('table_rows')
          .insert(rowsToInsert);

        if (rowsError) throw rowsError;
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar tabela:", error);
    throw error;
  }
};

// Excluir uma tabela
export const deleteTable = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('measurement_tables')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao excluir tabela:", error);
    throw error;
  }
};

// Pesquisar produtos
export const searchProducts = async (term: string): Promise<{ tableId: string, tableName: string, rows: Record<string, string | number>[] }[]> => {
  try {
    // Primeiro, buscar todas as tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('measurement_tables')
      .select('id, name');

    if (tablesError) throw tablesError;

    const results: { tableId: string, tableName: string, rows: Record<string, string | number>[] }[] = [];

    for (const table of tables) {
      // Buscar linhas que contenham o termo em qualquer campo
      const { data: rows, error: rowsError } = await supabase
        .from('table_rows')
        .select('*')
        .eq('table_id', table.id)
        .textSearch('data', term, {
          type: 'websearch',
          config: 'english'
        });

      if (rowsError) {
        console.error(`Erro ao buscar linhas da tabela ${table.id}:`, rowsError);
        // Continuar para a próxima tabela
        continue;
      }

      if (rows && rows.length > 0) {
        // Adicionar resultados
        results.push({
          tableId: table.id,
          tableName: table.name,
          rows: rows.map(row => row.data)
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Erro ao pesquisar produtos:", error);
    throw error;
  }
};
