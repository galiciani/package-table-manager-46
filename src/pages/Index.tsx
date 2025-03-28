
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  useEffect(() => {
    // Redirect logic is handled directly in the component
    console.log('Redirecting from index to dashboard or login');
  }, []);

  return <Navigate to="/dashboard" replace />;
};

export default Index;
