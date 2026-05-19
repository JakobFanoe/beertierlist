import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TierlistPage from './components/Tierlist';
import Login from './Login';
import { AuthProvider, useAuth } from './AuthContext';
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><TierlistPage /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
