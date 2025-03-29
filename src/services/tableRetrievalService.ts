
import { supabase } from "@/integrations/supabase/client";
import { TableData, Column } from "@/types/tableTypes";
import { MeasurementTable, TableColumn, TableRow } from "./types/tableServiceTypes";
import { convertJsonToRecord } from "./utils/tableUtils";

/**
 * Fetches all tables from the database
 */
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

/**
 * Fetches a specific table by ID
 */
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
