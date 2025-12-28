import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pollsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const EditPollPage = () => {
    const { pollId } = useParams<{ pollId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        question: '',
        description: '',
        endsAt: '',
        budget: '',
        reward: ''
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                if (!pollId) return;
                setLoading(true);
                const response = await pollsApi.getPollById(pollId);
                const poll = response.data.data;
                console.log('DEBUG: Poll Data Received:', poll);

                if (user?.role !== 'admin' && poll.userId !== user?.id) {
                    setError("Vous n'êtes pas autorisé à modifier ce sondage.");
                    setLoading(false);
                    return;
                }

                setFormData({
                    question: poll.question,
                    description: poll.description || '',
                    endsAt: poll.endsAt ? new Date(poll.endsAt).toISOString().slice(0, 16) : '',
                    budget: poll.budget ? String(poll.budget) : '',
                    reward: poll.reward ? String(poll.reward) : ''
                });
            } catch (err) {
                console.error('Failed to fetch poll:', err);
                setError('Impossible de charger le sondage.');
            } finally {
                setLoading(false);
            }
        };
        fetchPoll();
    }, [pollId, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pollId) return;

        if (!formData.question.trim()) {
            setError('La question est requise');
            return;
        }

        if (formData.question.trim().length < 5) {
            setError('La question doit faire au moins 5 caractères');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            await pollsApi.updatePoll(pollId, {
                question: formData.question,
                description: formData.description || undefined,
                endsAt: formData.endsAt || undefined,
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
                reward: formData.reward ? parseFloat(formData.reward) : undefined
            });

            navigate('/profile');
        } catch (err: any) {
            console.error('Erreur lors de la modification:', err);
            const errorMessage = err.response?.data?.message || 'Une erreur est survenue lors de la modification';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Chargement...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Modifier le sondage</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                        Question du sondage *
                    </label>
                    <input
                        type="text"
                        id="question"
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optionnel)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="edit_budget" className="block text-sm font-medium text-gray-700 mb-1">
                            Budget total (€)
                        </label>
                        <input
                            type="number"
                            id="edit_budget"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            min="1"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Montant total alloué à ce sondage.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="edit_reward" className="block text-sm font-medium text-gray-700 mb-1">
                            Récompense par vote (€)
                        </label>
                        <input
                            type="number"
                            id="edit_reward"
                            name="reward"
                            value={formData.reward}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Montant gagné par chaque votant.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options de réponse
                    </label>
                    <p className="text-sm text-gray-500 italic">
                        Les options ne peuvent pas être modifiées une fois le sondage créé (pour préserver l'intégrité des votes).
                    </p>
                </div>

                <div>
                    <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 mb-1">
                        Date de fin
                    </label>
                    <input
                        type="datetime-local"
                        id="endsAt"
                        name="endsAt"
                        value={formData.endsAt}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPollPage;
