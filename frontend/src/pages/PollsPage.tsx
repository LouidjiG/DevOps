import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pollsApi } from '../lib/api';
import type { Poll } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const PollsPage = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        const response = await pollsApi.getAllPolls();
        setPolls(response.data.data);
        console.error('Erreur lors de la récupération des sondages:', err);
        setError('Impossible de charger les sondages. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Liste des Sondages</h1>
        {isAuthenticated && user?.role === 'admin' && (
          <Link
            to="/polls/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Créer un sondage
          </Link>
        )}
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
                      <span>Créé le {formatDate(poll.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>Se termine le {formatDate(poll.endsAt)}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      poll.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {poll.isActive ? 'Actif' : 'Terminé'}
                  </span>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {poll.options?.length || 0} options • {poll.budget} € de récompense totale
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
        </div>
      )}
    </div>
  );
};

export default PollsPage;
