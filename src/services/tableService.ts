import { supabase } from "@/integrations/supabase/client";
import { Column, TableData, SearchResult } from "@/types/tableTypes";
import { Json } from "@/integrations/supabase/types";

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

const convertJsonToRecord = (jsonData: Json): Record<string, string | number> => {
  if (typeof jsonData !== 'object' || jsonData === null) {
    throw new Error("Dados inválidos: não é um objeto");
  }
  
  const result: Record<string, string | number> = {};
  
  for (const [key, value] of Object.entries(jsonData)) {
    if (typeof value === 'string' || typeof value === 'number') {
      result[key] = value;
    } else if (value !== null && value !== undefined) {
      result[key] = String(value);
    }
  }
  
  return result;
};

export const fetchTables = async (): Promise<TableData[]> => {
  try {
    const { data: tables, error: tablesError } = await supabase
      .from('measurement_tables')
      .select('*')
      .order('name');

    if (tablesError) throw tablesError;

    const result: TableData[] = [];

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

      const mappedColumns: Column[] = columns.map(col => ({
        id: col.id,
        name: col.name,
        accessor: col.accessor
      }));

      const mappedRows = rows.map(row => convertJsonToRecord(row.data));

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

export const fetchTableById = async (id: string): Promise<TableData | null> => {
  try {
    const { data: table, error: tableError } = await supabase
      .from('measurement_tables')
      .select('*')
      .eq('id', id)
      .single();

    if (tableError) {
      if (tableError.code === 'PGRST116') return null;
      throw tableError;
    }

    const { data: columns, error: columnsError } = await supabase
      .from('table_columns')
      .select('*')
      .eq('table_id', id)
      .order('sequence_order');

    if (columnsError) throw columnsError;

    const { data: rows, error: rowsError } = await supabase
      .from('table_rows')
      .select('*')
      .eq('table_id', id);

    if (rowsError) throw rowsError;

    const mappedColumns: Column[] = columns.map(col => ({
      id: col.id,
      name: col.name,
      accessor: col.accessor
    }));

    const mappedRows = rows.map(row => convertJsonToRecord(row.data));

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

export const createTable = async (table: Omit<TableData, 'id'>): Promise<TableData> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("Usuário não autenticado");
    }

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

export const updateTable = async (id: string, tableData: Partial<TableData>): Promise<void> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("Usuário não autenticado");
    }

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

    if (tableData.columns) {
      const { error: deleteError } = await supabase
        .from('table_columns')
        .delete()
        .eq('table_id', id);

      if (deleteError) throw deleteError;

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

    if (tableData.rows) {
      const { error: deleteError } = await supabase
        .from('table_rows')
        .delete()
        .eq('table_id', id);

      if (deleteError) throw deleteError;

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

export const searchProducts = async (term: string): Promise<SearchResult[]> => {
  try {
    const { data: tables, error: tablesError } = await supabase
      .from('measurement_tables')
      .select('id, name');

    if (tablesError) throw tablesError;

    const results: SearchResult[] = [];

    for (const table of tables) {
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
        continue;
      }

      if (rows && rows.length > 0) {
        results.push({
          tableId: table.id,
          tableName: table.name,
          rows: rows.map(row => convertJsonToRecord(row.data))
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Erro ao pesquisar produtos:", error);
    throw error;
  }
};
