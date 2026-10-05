import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import TierlistPage from './components/tierlist/TierlistPage';
import Login from './components/login/LoginPage';
import { AuthProvider, useAuth } from './AuthContext';
import NavBar from './components/shared/NavBar';
import SpinWheel from './components/spinWheel/SpinWheelPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
