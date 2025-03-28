
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './AuthContext';

interface UserContextType {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock data for users
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', title: 'Administrador' },
  { id: '2', name: 'Editor User', email: 'editor@example.com', role: 'editor', title: 'Editor de Conteúdo' },
  { id: '3', name: 'Viewer User', email: 'viewer@example.com', role: 'viewer', title: 'Visualizador' },
  { id: '4', name: 'João Silva', email: 'joao@example.com', role: 'editor', title: 'Gerente de Produto' },
  { id: '5', name: 'Maria Santos', email: 'maria@example.com', role: 'viewer', title: 'Operadora' },
];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from localStorage or use initial data
    const storedUsers = localStorage.getItem('packageUsers');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(INITIAL_USERS);
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('packageUsers', JSON.stringify(users));
    }
  }, [users]);

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = {
      ...user,
      id: Date.now().toString(),
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const updateUser = (id: string, updatedData: Partial<User>) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === id ? { ...user, ...updatedData } : user
      )
    );
  };

  const deleteUser = (id: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
  };

  return (
    <UserContext.Provider 
      value={{ 
        users, 
        addUser, 
        updateUser, 
        deleteUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserProvider');
  }
  return context;
}
