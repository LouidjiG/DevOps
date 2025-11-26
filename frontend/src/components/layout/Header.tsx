import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-indigo-600 border-b-2 border-indigo-600'
      : 'text-gray-700 hover:text-indigo-600';

  return (
    <header className="bg-white/90 backdrop-blur border-b border-gray-200 mb-4">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-lg font-bold text-gray-900 tracking-tight">
            Vote2Earn
          </Link>
          <nav className="hidden sm:flex items-center space-x-4 text-sm">
            <Link
              to="/"
              className={`${isActive('/')} px-1 pb-1 transition-colors`}
            >
              Accueil
            </Link>
            {!user && (
              <>
                <Link
                  to="/register"
                  className={`${isActive('/register')} px-1 pb-1 transition-colors`}
                >
                  S'inscrire
                </Link>
                <Link
                  to="/login"
                  className={`${isActive('/login')} px-1 pb-1 transition-colors`}
                >
                  Se connecter
                </Link>
              </>
            )}
            {user && (
            <Link
              to="/profile"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Mon Profil
            </Link>
            )}
            {user && (
              <Link
                to="/polls"
                className={`${isActive('/polls')} px-1 pb-1 transition-colors`}
              >
                Sondages
              </Link>
            )}
            <Link
              to="/db-test"
              className={`${isActive('/db-test')} px-1 pb-1 transition-colors`}
            >
              Test BDD
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span className="hidden sm:inline text-gray-700 text-sm">
                Bonjour, <span className="font-medium">{user.username}</span>
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
