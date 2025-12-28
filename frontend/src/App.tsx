import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import React from 'react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PollsPage from './pages/PollsPage';
import { Header } from './components/layout/Header';
import PollDetailPage from './pages/PollDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import CreatePollPage from './pages/CreatePollPage';
import EditPollPage from './pages/EditPollPage';
import HomePage from './pages/HomePage';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};



function DashboardPage() {
  const { user } = useAuth();

  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Bienvenue sur votre tableau de bord
            </h2>
            <p className="text-gray-600">
              Vous êtes connecté en tant que {user.email}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  console.log('Rendu du composant App');


  const token = localStorage.getItem('token');
  console.log('Token dans App:', token);


  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <LoginPage />
                </AuthRoute>
              }
            />
            <Route
              path="/register"
              element={
                <AuthRoute>
                  <RegisterPage />
                </AuthRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/polls"
              element={
                <ProtectedRoute>
                  <PollsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/polls/new"
              element={
                <ProtectedRoute>
                  <CreatePollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/polls/:pollId/edit"
              element={
                <ProtectedRoute>
                  <EditPollPage />
                </ProtectedRoute>
              }
            />
            <Route path="/polls/:pollId" element={<PollDetailPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;