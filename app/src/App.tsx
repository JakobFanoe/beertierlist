import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import TierlistPage from './components/Tierlist';
import Login from './Login';
import { AuthProvider, useAuth } from './AuthContext';
import NavBar from './components/NavBar';
import SpinWheel from './components/SpinWheel';
 
const AuthShell: React.FC = () => (
  <>
    <NavBar />
    <Outlet />
  </>
);

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

          <Route element={<RequireAuth><AuthShell /></RequireAuth>}>
            <Route path="/" element={<TierlistPage />} />
            <Route path="/wheel" element={<SpinWheel />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
