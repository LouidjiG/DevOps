import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '../lib/axios';

interface VoteHistory {
  id: number;
  question: string;
  optionText: string;
  votedAt: string;
  reward: number;
}

export const ProfilePage = () => {
  const { user } = useAuth();
  const [voteHistory, setVoteHistory] = useState<VoteHistory[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  const { data: votesData, isLoading } = useQuery({
    queryKey: ['userVotes'],
    queryFn: async () => {
      const response = await getApiClient().get('/api/users/my-votes');
      return response.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (votesData?.data) {
      setVoteHistory(votesData.data);
      const total = votesData.data.reduce((sum: number, vote: VoteHistory) => sum + (vote.reward || 0), 0);
      setTotalEarned(total);
    }
  }, [votesData]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Veuillez vous connecter</h2>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-indigo-700">
            <h3 className="text-lg leading-6 font-medium text-white">Profil Utilisateur</h3>
            <p className="mt-1 max-w-2xl text-sm text-indigo-200">
              Informations personnelles et historique des votes
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nom d'utilisateur</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.username}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.email}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total gagné</dt>
                <dd className="mt-1 text-sm font-semibold text-green-600 sm:mt-0 sm:col-span-2">
                  {totalEarned} points
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Historique des votes</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Tous vos votes passés et les récompenses gagnées
            </p>
          </div>
          
          {isLoading ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Chargement de l'historique...</p>
            </div>
          ) : voteHistory.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Aucun vote pour le moment</p>
              <Link
                to="/polls"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Voter maintenant
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Votre vote
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Récompense
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {voteHistory.map((vote) => (
                    <tr key={vote.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vote.question}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vote.optionText}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(vote.votedAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        +{vote.reward} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
