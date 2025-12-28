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

  const [createdPolls, setCreatedPolls] = useState<any[]>([]);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const { refreshUser } = useAuth();

  const { data: votesData, isLoading } = useQuery({
    queryKey: ['userVotes'],
    queryFn: async () => {
      const response = await getApiClient().get('/users/my-votes');
      return response.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (votesData?.data) {
      setVoteHistory(votesData.data);
      const total = votesData.data.reduce((sum: number, vote: VoteHistory) => sum + (parseFloat(String(vote.reward)) || 0), 0);
      setTotalEarned(total);
    }
  }, [votesData]);

  useEffect(() => {
    const fetchCreatedPolls = async () => {
      if (user?.role === 'vendor' || user?.role === 'admin') {
        try {
          const { pollsApi } = await import('../lib/api');
          const res = await pollsApi.getMyCreatedPolls();
          console.log("DEBUG: createdPolls data:", res.data.data);
          setCreatedPolls(res.data.data);
        } catch (err) {
          console.error("Failed to fetch created polls", err);
        }
      }
    };
    fetchCreatedPolls();
  }, [user]);

  const handleDeletePoll = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) {
      try {
        const { pollsApi } = await import('../lib/api');
        await pollsApi.deletePoll(id);
        setCreatedPolls(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error("Failed to delete poll", err);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }

    try {
      const { authApi } = await import('../lib/api');
      await authApi.addBalance(amount);
      await refreshUser();
      setIsBalanceModalOpen(false);
      setRechargeAmount('');
      alert("Solde rechargé avec succès !");
    } catch (err) {
      console.error("Failed to add balance", err);
      alert("Erreur lors du rechargement.");
    }
  };

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
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-indigo-700">
            <h3 className="text-lg leading-6 font-medium text-white">
              {user.role === 'vendor' ? 'Profil Vendeur' : 'Profil Utilisateur'}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-indigo-200">
              {user.role === 'vendor' ? 'Gérez vos sondages et votre solde' : 'Informations personnelles et historique des votes'}
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
                <dt className="text-sm font-medium text-gray-500">Rôle</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                  {user.role === 'admin' ? 'Admin' : user.role === 'vendor' ? 'Vendeur' : 'Utilisateur'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {user.role === 'vendor' ? 'Solde disponible' : 'Total gagné'}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-green-600 sm:mt-0 sm:col-span-2 flex items-center">
                  {user.role === 'vendor' ? `${Number(user.balance).toFixed(2)} €` : `${totalEarned.toFixed(2)} €`}
                  {user.role === 'vendor' && (
                    <button
                      onClick={() => setIsBalanceModalOpen(true)}
                      className="ml-4 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Recharger
                    </button>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {isBalanceModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsBalanceModalOpen(false)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Recharger mon solde
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Entrez le montant à ajouter à votre compte.
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleAddBalance} className="mt-5 sm:mt-6">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Montant (€)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    >
                      Ajouter
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => setIsBalanceModalOpen(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {(user.role === 'vendor' || user.role === 'admin') && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-orange-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-orange-800">Mes Sondages Créés</h3>
                <p className="mt-1 max-w-2xl text-sm text-orange-600">
                  Gérez vos sondages actifs et terminés
                </p>
              </div>
              <Link
                to="/polls/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Créer un sondage
              </Link>
            </div>
            {createdPolls.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                Vous n'avez pas encore créé de sondage.
                <div className="mt-2">
                  <Link to="/polls/new" className="text-indigo-600 hover:text-indigo-900 font-medium">Créer un sondage</Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Récompense/Vote</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {createdPolls.map((poll) => (
                      <tr key={poll.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{poll.question}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Number(poll.budget).toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Number(poll.reward).toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {poll.pollOptions?.reduce((acc: number, opt: any) => acc + opt.voteCount, 0) || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${poll.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {poll.isActive ? 'Actif' : 'Terminé'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/polls/${poll.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Modifier
                          </Link>
                          <button onClick={() => handleDeletePoll(poll.id)} className="text-red-600 hover:text-red-900">Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
                        +{parseFloat(String(vote.reward)).toFixed(2)} €
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
