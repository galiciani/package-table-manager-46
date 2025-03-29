
import { supabase } from "@/integrations/supabase/client";
import { TableData } from "@/types/tableTypes";

/**
 * Creates a new table in the database
 */
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

    const mappedColumns = newColumns.map(col => ({
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

/**
 * Updates an existing table in the database
 */
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

/**
 * Deletes a table from the database
 */
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
