
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/tableTypes";
import { convertJsonToRecord } from "./utils/tableUtils";

/**
 * Searches for products across all tables
 */
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
