import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pollsApi } from '../lib/api';
import type { Poll, PollOption } from '../lib/api';

interface ApiPollResponse extends Omit<Poll, 'options'> {
  pollOptions?: PollOption[];
  options?: PollOption[];
  creator?: {
    id: string;
    username: string;
  };
}

const PollDetailPage = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        console.log('Chargement du sondage avec ID:', pollId);
        const response = await pollsApi.getPollById(pollId!);
        console.log('Réponse complète du serveur:', response);
        console.log('Données du sondage:', response.data);
        
        if (response.data && response.data.data) {
          const responseData = response.data.data as ApiPollResponse;
          const pollData: Poll = {
            ...responseData,
            options: responseData.pollOptions || responseData.options || []
          };
          console.log('Données du sondage mises à jour:', pollData);
          setPoll(pollData);
        } else {
          console.error('Structure de données inattendue:', response.data);
          setError('Format de données du sondage invalide');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du sondage:', err);
        setError('Impossible de charger le sondage. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    if (pollId) {
      fetchPoll();
    } else {
      setError('ID de sondage manquant');
      setLoading(false);
    }
  }, [pollId]);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOption) {
      setError('Veuillez sélectionner une option avant de voter.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Envoi du vote pour l\'option:', selectedOption);
      const response = await pollsApi.vote(pollId!, selectedOption);
      console.log('Réponse du serveur:', response.data);
      
      setVoteSuccess(true);
      
      try {
        const updatedPoll = await pollsApi.getPollById(pollId!);
        setPoll(updatedPoll.data.data);
      } catch (pollError) {
        console.error('Erreur lors du rechargement du sondage:', pollError);
      }
    } catch (err: any) {
      console.error('Erreur lors du vote:', err);
      
      if (err.response) {
        const errorMessage = err.response.data?.message || err.response.statusText;
        setError(`Erreur lors du vote: ${errorMessage}`);
      } else if (err.request) {
        setError('Le serveur ne répond pas. Vérifiez votre connexion Internet.');
      } else {
        setError('Erreur lors de l\'envoi du vote. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
    }
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

  if (!poll) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Sondage introuvable</strong>
          <span className="block sm:inline"> Le sondage demandé n'existe pas ou a été supprimé.</span>
        </div>
      </div>
    );
  }

  const options = poll.options || [];
  const hasOptions = options.length > 0;
  
  const totalVotes = hasOptions 
    ? options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{poll.question}</h1>
          {poll.description && (
            <p className="text-gray-600 mb-6">{poll.description}</p>
          )}

          {voteSuccess ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
              <strong className="font-bold">Merci pour votre vote !</strong>
              <span className="block sm:inline"> Votre vote a été enregistré avec succès.</span>
            </div>
          ) : !isAuthenticated ? (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-6">
              <p>Veuillez vous connecter pour voter à ce sondage.</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Se connecter
              </button>
            </div>
          ) : !hasOptions ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6">
              <p>Ce sondage ne contient aucune option de vote.</p>
            </div>
          ) : (
            <form onSubmit={handleVote} className="space-y-4">
              <div className="space-y-2">
                {options.map((option: PollOption) => (
                  <div key={option.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${option.id}`}
                      name="pollOption"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor={`option-${option.id}`}
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      {option.text}
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Voter'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Résultats</h2>
            {!hasOptions ? (
              <p className="text-gray-500">Aucune donnée de résultat disponible.</p>
            ) : totalVotes === 0 ? (
              <p className="text-gray-500">Aucun vote n'a encore été enregistré pour ce sondage.</p>
            ) : (
              <div className="space-y-3">
                {options.map((option: PollOption) => {
                  const optionVotes = option.voteCount || 0;
                  const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                  
                  return (
                    <div key={option.id} className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{option.text}</span>
                        <span>{percentage}% ({optionVotes} vote{optionVotes !== 1 ? 's' : ''})</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                <div className="text-xs text-gray-500 mt-2">
                  Total des votes : {totalVotes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetailPage;