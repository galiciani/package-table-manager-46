
import { TableData, useTableData } from '../context/TableContext';

interface SearchResultProps {
  results: {
    tableId: string;
    tableName: string;
    rows: Record<string, string | number>[];
  }[];
  searchTerm: string;
}

const SearchResults = ({ results, searchTerm }: SearchResultProps) => {
  const { tables, showGridLines } = useTableData();
  
  if (!searchTerm.trim()) {
    return (
      <div className="text-center py-8 text-gray-500">
        Digite um termo para buscar nos produtos
      </div>
    );
  }
  
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum resultado encontrado para "{searchTerm}"
      </div>
    );
  }

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
    <div className="space-y-6">
      <h2 className="text-lg font-medium">
        {results.reduce((sum, r) => sum + r.rows.length, 0)} resultados encontrados
      </h2>
      
      {results.map(result => {
        const table = tables.find(t => t.id === result.tableId) as TableData;
        
        return (
          <div key={result.tableId} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium">{result.tableName}</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    {table.columns.map(column => (
                      <th 
                        key={column.id}
                        className={`px-4 py-2 text-sm font-medium text-gray-500 ${
                          showGridLines ? 'border' : 'border-b'
                        }`}
                      >
                        {column.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, rowIndex) => (
                    <tr 
                      key={rowIndex}
                      className="hover:bg-gray-50"
                    >
                      {table.columns.map(column => (
                        <td 
                          key={`${rowIndex}-${column.id}`}
                          className={`px-4 py-2 text-sm text-gray-600 ${
                            showGridLines ? 'border' : ''
                          }`}
                        >
                          {row[column.accessor] !== undefined 
                            ? highlightText(String(row[column.accessor])) 
                            : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
