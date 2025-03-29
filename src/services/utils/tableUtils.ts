
import { Json } from "@/integrations/supabase/types";

/**
 * Converts Supabase JSON data to a standardized Record object
 */
export const convertJsonToRecord = (jsonData: Json): Record<string, string | number> => {
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
