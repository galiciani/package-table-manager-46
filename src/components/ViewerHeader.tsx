
import { useAuth } from '../context/AuthContext';
import { LogOut, Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ViewerHeaderProps {
  onSearchChange: (value: string) => void;
  searchValue: string;
}

const ViewerHeader = ({ onSearchChange, searchValue }: ViewerHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">PackageTables</h1>
            <div className="ml-10 relative flex items-center w-full max-w-md">
              <SearchIcon className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar produto..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  {user?.name.charAt(0)}
                </div>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ViewerHeader;
