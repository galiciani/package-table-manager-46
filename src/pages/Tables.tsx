
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import TableView from '../components/TableView';
import TableForm from '../components/TableForm';
import { useTableData, TableData } from '../context/TableContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Edit, 
  Trash2,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const Tables = () => {
  const location = useLocation();
  const { tables, selectedTable, selectTable, deleteTable, isLoading, error } = useTableData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<TableData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const canEdit = user?.role === 'admin' || user?.role === 'editor';
  
  // Check if a specific table ID was provided in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableId = params.get('id');
    
    if (tableId) {
      selectTable(tableId);
    }
  }, [location.search, selectTable]);

  const handleEditTable = (table: TableData) => {
    setTableToEdit(table);
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDelete) {
      try {
        await deleteTable(confirmDelete);
        setConfirmDelete(null);
      } catch (error) {
        console.error("Erro ao excluir tabela:", error);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setTableToEdit(null);
  };

  const handleBackToList = () => {
    selectTable(null);
  };

  // Renderiza estado de carregamento
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

  // Renderiza erro
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
      {selectedTable ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToList}
            >
              <ChevronLeft size={16} className="mr-1" /> Voltar para lista
            </Button>
            
            {canEdit && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEditTable(selectedTable)}
                >
                  <Edit size={16} className="mr-1" /> Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => setConfirmDelete(selectedTable.id)}
                >
                  <Trash2 size={16} className="mr-1" /> Excluir
                </Button>
              </div>
            )}
          </div>
          
          <TableView table={selectedTable} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Tabelas de Medidas</h1>
            
            {canEdit && (
              <Button onClick={() => setShowForm(true)}>
                <Plus size={16} className="mr-1" /> Nova Tabela
              </Button>
            )}
          </div>
          
          {tables.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Nenhuma tabela cadastrada</h3>
              <p className="text-gray-500 mb-4">
                Crie sua primeira tabela para começar a organizar seus produtos.
              </p>
              
              {canEdit && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus size={16} className="mr-1" /> Nova Tabela
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tables.map((table) => (
                <div 
                  key={table.id} 
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => selectTable(table.id)}
                >
                  <h3 className="text-lg font-medium mb-1">{table.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{table.description}</p>
                  <div className="flex justify-between text-sm">
                    <span>{table.rows.length} produtos</span>
                    <span>{table.columns.length} colunas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Table Form Dialog */}
      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {tableToEdit ? 'Editar Tabela' : 'Nova Tabela'}
              </DialogTitle>
              <DialogDescription>
                {tableToEdit
                  ? 'Edite os detalhes da tabela existente'
                  : 'Preencha os detalhes para criar uma nova tabela'}
              </DialogDescription>
            </DialogHeader>
            
            <TableForm 
              initialData={tableToEdit}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta tabela? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Tables;
