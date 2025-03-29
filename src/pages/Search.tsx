
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchResults from '../components/SearchResults';
import { useTableData } from '../context/TableContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

const Search = () => {
  const { searchProduct, showGridLines, toggleGridLines, isLoading, error } = useTableData();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ tableId: string, tableName: string, rows: Record<string, string | number>[] }[]>([]);
  const [searching, setSearching] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Perform search when debounced term changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedTerm) {
        setSearching(true);
        try {
          const results = await searchProduct(debouncedTerm);
          setSearchResults(results);
        } catch (error) {
          console.error("Erro ao realizar pesquisa:", error);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [debouncedTerm, searchProduct]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const results = await searchProduct(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Erro ao realizar pesquisa:", error);
    } finally {
      setSearching(false);
    }
  };

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </Layout>
    );
  }

  // Renderizar erro
  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Ocorreu um erro</h3>
          <p className="text-red-700">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produto por código, descrição ou qualquer característica..."
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={searching}>
              {searching ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Buscar
            </Button>
          </form>
          
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-sm text-gray-600">Mostrar linhas divisórias</span>
            <Switch 
              checked={showGridLines} 
              onCheckedChange={toggleGridLines}
              aria-label="Toggle grid lines"
            />
          </div>
        </div>
        
        <div>
          <SearchResults results={searchResults} searchTerm={debouncedTerm} />
        </div>
      </div>
    </Layout>
  );
};

export default Search;
