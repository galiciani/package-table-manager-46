
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
