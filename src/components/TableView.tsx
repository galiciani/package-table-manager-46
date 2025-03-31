
import { useState } from 'react';
import { useTableData } from '../context/TableContext';
import { TableData } from '@/types/tableTypes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';

interface TableViewProps {
  table: TableData;
  hideControls?: boolean;
}

const TableView = ({ table, hideControls = false }: TableViewProps) => {
  const { showGridLines, toggleGridLines } = useTableData();
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();
  
  const rowsPerPage = isMobile ? 5 : 10;
  const totalPages = Math.ceil(table.rows.length / rowsPerPage);
  
  const visibleRows = table.rows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-end gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page === 1}
        >
          Anterior
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <Button
              key={num}
              variant={num === page ? "default" : "outline"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setPage(num)}
            >
              {num}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(page + 1, totalPages))}
          disabled={page === totalPages}
        >
          Próximo
        </Button>
      </div>
    );
  };

  return (
    <div className="rounded-md bg-white shadow-sm">
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-t-md">
        <div>
          <h3 className="text-base font-medium text-gray-800">{table.name}</h3>
          <p className="text-xs text-gray-500">{table.description}</p>
        </div>
        
        {!hideControls && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Linhas divisórias</span>
            <Switch 
              checked={showGridLines} 
              onCheckedChange={toggleGridLines} 
              aria-label="Toggle grid lines"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              {table.columns.map((column) => (
                <th 
                  key={column.id} 
                  className={`px-3 py-2 text-xs font-medium text-gray-500 ${
                    showGridLines ? 'border' : 'border-b'
                  }`}
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {table.columns.map((column) => (
                  <td 
                    key={`${rowIndex}-${column.id}`} 
                    className={`px-3 py-1 text-sm text-gray-600 ${
                      showGridLines ? 'border' : ''
                    }`}
                  >
                    {row[column.accessor] !== undefined ? row[column.accessor] : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-3 py-2 bg-gray-50 rounded-b-md">
        {renderPagination()}
      </div>
    </div>
  );
};

export default TableView;
