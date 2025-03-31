import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, 
  Users, 
  Table, 
  Search, 
  Menu, 
  X, 
  LogOut,
  Eye
} from 'lucide-react';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavLink = ({ to, icon, label, isActive, onClick }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center p-2 rounded-lg ${
        isActive 
          ? 'bg-indigo-100 text-indigo-700' 
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      onClick={onClick}
    >
      <div className="mr-3">{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isEditorOrAdmin = user?.role === 'editor' || user?.role === 'admin';

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-10 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-4 py-5">
              <h1 className="text-xl font-bold text-gray-800">PackageTables</h1>
              <button
                className="rounded p-1 text-gray-600 hover:bg-gray-100 lg:hidden"
                onClick={toggleSidebar}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 px-4 space-y-2">
              <NavLink
                to="/dashboard"
                icon={<LayoutGrid size={20} />}
                label="Dashboard"
                isActive={location.pathname === '/dashboard'}
                onClick={closeSidebar}
              />
              
              <NavLink
                to="/tables"
                icon={<Table size={20} />}
                label="Tabelas"
                isActive={location.pathname === '/tables'}
                onClick={closeSidebar}
              />
              
              <NavLink
                to="/search"
                icon={<Search size={20} />}
                label="Buscar Produtos"
                isActive={location.pathname === '/search'}
                onClick={closeSidebar}
              />
              
              {isAdmin && (
                <NavLink
                  to="/users"
                  icon={<Users size={20} />}
                  label="Usuários"
                  isActive={location.pathname === '/users'}
                  onClick={closeSidebar}
                />
              )}
              
              <NavLink
                to="/"
                icon={<Eye size={20} />}
                label="Ver Tabelas (Visualização)"
                isActive={location.pathname === '/'}
                onClick={closeSidebar}
              />
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  {user?.name.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.title}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              className="rounded p-1 text-gray-600 hover:bg-gray-100 lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-gray-800">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/tables' && 'Tabelas de Medidas'}
                {location.pathname === '/search' && 'Buscar Produtos'}
                {location.pathname === '/users' && 'Gestão de Usuários'}
              </h1>
            </div>
            <div className="flex items-center">
              <span className="mr-2 hidden text-sm text-gray-600 md:inline">
                {user?.email}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
