import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pollsApi } from '../lib/api';
import type { Poll } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const PollsPage = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        const offset = (page - 1) * limit;
        const response = await pollsApi.getAllPolls({ limit, offset, search: searchTerm });
        setPolls(response.data.data);
        const total = response.data.meta?.total || 0;
        setTotalPages(Math.ceil(total / limit));
      } catch (err) {
        console.error('Erreur lors de la récupération des sondages:', err);
        setError('Impossible de charger les sondages. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchPolls();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, searchTerm]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !polls.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Liste des Sondages</h1>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {isAuthenticated && (user?.role === 'admin' || user?.role === 'vendor') && (
            <Link
              to="/polls/new"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap"
            >
              Créer
            </Link>
          )}
        </div>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun sondage disponible pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{poll.question}</h2>
                    {poll.description && (
                      <p className="mt-2 text-gray-600">{poll.description}</p>
                    )}
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span>Proposé par <span className="font-medium text-gray-700">{poll.creator?.username || 'Inconnu'}</span></span>
                      <span className="mx-2">•</span>
                      <span>Créé le {formatDate(poll.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>Se termine le {formatDate(poll.endsAt)}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${poll.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {poll.isActive ? 'Actif' : 'Terminé'}
                  </span>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {parseFloat(String(poll.reward)).toFixed(2)} € à gagner
                  </div>
                  {poll.hasVoted ? (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-green-600 font-medium">
                        Vous avez déjà voté
                      </span>
                    </div>
                  ) : (
                    <Link
                      to={`/polls/${poll.id}`}
                      className="inline-flex items-center text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Participer
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-gray-600">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PollsPage;
