
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchResults from '../components/SearchResults';
import { useTableData } from '../context/TableContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const { searchProduct, showGridLines, toggleGridLines } = useTableData();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProduct>>([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Perform search when debounced term changes
  useEffect(() => {
    if (debouncedTerm) {
      const results = searchProduct(debouncedTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [debouncedTerm, searchProduct]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = searchProduct(searchTerm);
    setSearchResults(results);
  };

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
            <Button type="submit">Buscar</Button>
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
