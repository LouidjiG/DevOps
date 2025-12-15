import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollsApi } from '../lib/api';
// import { useAuth } from '../contexts/AuthContext';

const CreatePollPage = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    options: ['', ''],
    budget: '',
    reward: '',
    endsAt: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      setError('La question est requise');
      return;
    }

    const validOptions = formData.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      setError('Au moins deux options sont requises');
      return;
    }

    const budget = parseFloat(formData.budget);
    const reward = parseFloat(formData.reward);

    if (isNaN(budget) || budget <= 0) {
      setError('Le budget doit être un nombre positif');
      return;
    }

    if (isNaN(reward) || reward <= 0) {
      setError('La récompense doit être un nombre positif');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await pollsApi.createPoll({
        question: formData.question,
        description: formData.description || undefined,
        options: validOptions,
        budget,
        reward,
        endsAt: formData.endsAt || undefined
      });

      navigate('/polls');
    } catch (err) {
      console.error('Erreur lors de la création du sondage:', err);
      setError('Une erreur est survenue lors de la création du sondage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Créer un nouveau sondage</h1>

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
            placeholder="Exemple : Quel est votre langage de programmation préféré ?"
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
            placeholder="Décrivez plus en détail votre sondage..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options de réponse *
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Option ${index + 1}`}
                  required={index < 2}
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Supprimer cette option"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {formData.options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter une option
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget total (€) *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className="pl-7 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Montant total à répartir entre les participants
            </p>
          </div>

          <div>
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-1">
              Récompense par vote (€) *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="number"
                id="reward"
                name="reward"
                value={formData.reward}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className="pl-7 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Montant gagné par vote
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin (optionnel)
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
          <p className="mt-1 text-xs text-gray-500">
            Si non spécifié, le sondage durera 7 jours
          </p>
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/polls')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Création en cours...' : 'Créer le sondage'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePollPage;
