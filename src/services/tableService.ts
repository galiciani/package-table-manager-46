
// Re-export all table services for backward compatibility
import { supabase } from "@/integrations/supabase/client";
export { MeasurementTable, TableColumn, TableRow } from "./types/tableServiceTypes";
export { convertJsonToRecord } from "./utils/tableUtils";
export { fetchTables, fetchTableById } from "./tableRetrievalService";
export { createTable, updateTable, deleteTable } from "./tableCrudService";
export { searchProducts } from "./tableSearchService";
