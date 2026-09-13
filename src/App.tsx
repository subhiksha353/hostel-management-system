import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { BrandingProvider } from './context/BrandingContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <BrandingProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </BrandingProvider>
    </BrowserRouter>
  );
};

export default App;
