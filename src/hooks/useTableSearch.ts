
import { useState } from 'react';
import { toast } from 'sonner';
import { SearchResult } from '@/types/tableTypes';
import { searchProducts } from '@/services/tableService';

export function useTableSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProduct = async (term: string): Promise<SearchResult[]> => {
    if (!term.trim()) return [];

    setIsLoading(true);
    setError(null);
    try {
      const results = await searchProducts(term);
      return results;
    } catch (err) {
      console.error("Erro ao pesquisar produtos:", err);
      setError("Não foi possível realizar a pesquisa.");
      toast.error("Erro ao pesquisar produtos");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchProduct,
    isLoading,
    error
  };
}
