import { useState } from 'react';
import { useTableData, TableData, Column } from '../context/TableContext';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface TableFormProps {
  initialData?: TableData;
  onCancel: () => void;
}

const TableForm = ({ initialData, onCancel }: TableFormProps) => {
  const { addTable, updateTable } = useTableData();
  const isEditing = !!initialData;
  
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [columns, setColumns] = useState<Column[]>(
    initialData?.columns || [
      { id: '1', name: 'Código', accessor: 'code' },
      { id: '2', name: 'Descrição', accessor: 'description' }
    ]
  );
  const [rows, setRows] = useState<Record<string, string | number>[]>(
    initialData?.rows || [{ code: '', description: '' }]
  );

  const handleColumnAdd = () => {
    const newId = (Math.max(0, ...columns.map(c => parseInt(c.id))) + 1).toString();
    const newColumnName = `Coluna ${columns.length + 1}`;
    const accessor = newColumnName.toLowerCase().replace(/\s+/g, '_');
    
    setColumns([...columns, { id: newId, name: newColumnName, accessor }]);
    
    setRows(prevRows => 
      prevRows.map(row => ({
        ...row,
        [accessor]: ''
      }))
    );
  };

  const handleColumnDelete = (id: string) => {
    const column = columns.find(c => c.id === id);
    if (!column) return;
    
    setColumns(columns.filter(c => c.id !== id));
    
    setRows(prevRows => 
      prevRows.map(row => {
        const newRow = { ...row };
        delete newRow[column.accessor];
        return newRow;
      })
    );
  };

  const handleColumnChange = (id: string, field: 'name' | 'accessor', value: string) => {
    const column = columns.find(c => c.id === id);
    if (!column) return;
    
    const oldAccessor = column.accessor;
    const newColumns = columns.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    
    setColumns(newColumns);
    
    if (field === 'accessor' && oldAccessor !== value) {
      setRows(prevRows => 
        prevRows.map(row => {
          const newRow = { ...row };
          if (oldAccessor in newRow) {
            newRow[value] = newRow[oldAccessor];
            delete newRow[oldAccessor];
          }
          return newRow;
        })
      );
    }
  };

  const handleRowAdd = () => {
    const newRow: Record<string, string> = {};
    columns.forEach(col => {
      newRow[col.accessor] = '';
    });
    
    setRows([...rows, newRow]);
  };

  const handleRowDelete = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (rowIndex: number, accessor: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [accessor]: value
    };
    setRows(newRows);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Nome da tabela é obrigatório");
      return;
    }
    
    if (columns.length < 1) {
      toast.error("Adicione pelo menos uma coluna");
      return;
    }

    const tableData = {
      name,
      description,
      columns,
      rows
    };
    
    if (isEditing && initialData) {
      updateTable(initialData.id, tableData);
      toast.success("Tabela atualizada com sucesso");
    } else {
      addTable(tableData);
      toast.success("Tabela criada com sucesso");
    }
    
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Nome da Tabela</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Caixas de Papelão"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição da tabela"
            rows={1}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Colunas</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleColumnAdd}
          >
            <Plus size={16} className="mr-1" /> Adicionar Coluna
          </Button>
        </div>
        
        <div className="bg-gray-50 rounded-md p-4 space-y-2">
          {columns.map(column => (
            <div key={column.id} className="flex gap-3 items-center">
              <div className="flex-1">
                <Input
                  value={column.name}
                  onChange={(e) => handleColumnChange(column.id, 'name', e.target.value)}
                  placeholder="Nome da coluna"
                />
              </div>
              <div className="flex-1">
                <Input
                  value={column.accessor}
                  onChange={(e) => handleColumnChange(column.id, 'accessor', e.target.value)}
                  placeholder="Identificador"
                />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => handleColumnDelete(column.id)}
                disabled={columns.length <= 1}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Dados</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleRowAdd}
          >
            <Plus size={16} className="mr-1" /> Adicionar Linha
          </Button>
        </div>
        
        <div className="bg-gray-50 rounded-md p-4 space-y-3 overflow-x-auto">
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] gap-2 min-w-full">
            {columns.map(column => (
              <div key={column.id} className="font-medium text-sm text-gray-600">
                {column.name}
              </div>
            ))}
            <div></div>
          </div>
          
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] gap-2 min-w-full items-center">
              {columns.map(column => (
                <div key={`${rowIndex}-${column.id}`}>
                  <Input
                    value={row[column.accessor] || ''}
                    onChange={(e) => handleRowChange(rowIndex, column.accessor, e.target.value)}
                    placeholder={column.name}
                  />
                </div>
              ))}
              <div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRowDelete(rowIndex)}
                  disabled={rows.length <= 1}
                >
                  <X size={16} className="text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Atualizar' : 'Criar'} Tabela
        </Button>
      </div>
    </form>
  );
};

export default TableForm;
