
import { useState, useEffect } from 'react';
import { useTableData } from '../context/TableContext';
import ViewerHeader from '../components/ViewerHeader';
import TableView from '../components/TableView';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const ViewerLanding = () => {
  const { tables, searchProduct, showGridLines, toggleGridLines } = useTableData();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProduct>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      const results = searchProduct(searchTerm);
      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchTerm, searchProduct]);

  // Helper function to highlight search term
  const highlightText = (text: string) => {
    if (!searchTerm.trim()) return text;
    
    const parts = String(text).split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <span key={index} className="bg-yellow-200 font-medium">{part}</span> 
        : part
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ViewerHeader 
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
      />
      
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {isSearching ? (
            // Search results view
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">
                {searchResults.reduce((sum, r) => sum + r.rows.length, 0)} resultados encontrados para "{searchTerm}"
              </h2>
              
              {searchResults.length > 0 ? (
                searchResults.map(result => {
                  const table = tables.find(t => t.id === result.tableId);
                  if (!table) return null;
                  
                  return (
                    <div key={result.tableId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b">
                        <h3 className="text-lg font-medium text-gray-900">{result.tableName}</h3>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {table.columns.map(column => (
                                <TableHead key={column.id}>
                                  {column.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.rows.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {table.columns.map(column => (
                                  <TableCell key={`${rowIndex}-${column.id}`}>
                                    {row[column.accessor] !== undefined 
                                      ? highlightText(String(row[column.accessor])) 
                                      : '-'}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500 text-lg">Nenhum resultado encontrado</p>
                </div>
              )}
            </div>
          ) : (
            // All tables view
            <div className="space-y-8">
              <h1 className="text-2xl font-bold text-gray-900">Tabelas de Medidas</h1>
              
              {tables.map(table => (
                <div key={table.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <h2 className="text-lg font-medium text-gray-900">{table.name}</h2>
                    {table.description && (
                      <p className="mt-1 text-sm text-gray-500">{table.description}</p>
                    )}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {table.columns.map(column => (
                            <TableHead key={column.id}>
                              {column.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? '' : 'bg-gray-50'}>
                            {table.columns.map(column => (
                              <TableCell key={`${rowIndex}-${column.id}`}>
                                {row[column.accessor] !== undefined ? row[column.accessor] : '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
              
              {tables.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500 text-lg">Nenhuma tabela cadastrada</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewerLanding;
