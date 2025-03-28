
import { useState } from 'react';
import Layout from '../components/Layout';
import { useTableData } from '../context/TableContext';
import { useUserData } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Table2, 
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { tables } = useTableData();
  const { users } = useUserData();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const totalProducts = tables.reduce((sum, table) => sum + table.rows.length, 0);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Tabelas</p>
                <h3 className="mt-1 text-3xl font-semibold">{tables.length}</h3>
              </div>
              <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
                <Table2 size={24} />
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Produtos</p>
                <h3 className="mt-1 text-3xl font-semibold">{totalProducts}</h3>
              </div>
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <FileText size={24} />
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
                  <h3 className="mt-1 text-3xl font-semibold">{users.length}</h3>
                </div>
                <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                  <Users size={24} />
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Seu Papel</p>
                <h3 className="mt-1 text-xl font-semibold">
                  {user?.role === 'admin' && 'Administrador'}
                  {user?.role === 'editor' && 'Editor'}
                  {user?.role === 'viewer' && 'Visualizador'}
                </h3>
              </div>
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <User size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Tabelas Recentes</h3>
            {tables.length > 0 ? (
              <div className="space-y-2">
                {tables.slice(0, 5).map((table) => (
                  <div key={table.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{table.name}</p>
                      <p className="text-sm text-gray-500">{table.rows.length} produtos</p>
                    </div>
                    <Link to={`/tables?id=${table.id}`}>
                      <Button variant="outline" size="sm">Ver</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma tabela cadastrada
              </div>
            )}
            <div className="mt-4">
              <Link to="/tables">
                <Button variant="link" className="p-0">Ver todas as tabelas</Button>
              </Link>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Ações Rápidas</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Button 
                className="flex h-auto flex-col items-center justify-center gap-2 rounded-lg p-6"
                asChild
              >
                <Link to="/tables">
                  <Table2 size={24} />
                  <span>Ver Tabelas</span>
                </Link>
              </Button>
              
              <Button 
                className="flex h-auto flex-col items-center justify-center gap-2 rounded-lg p-6"
                asChild
              >
                <Link to="/search">
                  <BarChart3 size={24} />
                  <span>Buscar Produtos</span>
                </Link>
              </Button>
              
              {isAdmin && (
                <Button 
                  className="flex h-auto flex-col items-center justify-center gap-2 rounded-lg p-6"
                  asChild
                >
                  <Link to="/users">
                    <Users size={24} />
                    <span>Gerenciar Usuários</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
