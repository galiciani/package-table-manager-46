
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TableProvider } from "./context/TableContext";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import Search from "./pages/Search";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import ViewerLanding from "./pages/ViewerLanding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TableProvider>
          <UserProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    {(user) => user?.role === 'viewer' 
                      ? <ViewerLanding /> 
                      : <Navigate to="/dashboard" replace />
                    }
                  </ProtectedRoute>
                } />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'editor']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/tables" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'editor']}>
                      <Tables />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/search" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'editor']}>
                      <Search />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Users />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </UserProvider>
        </TableProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
