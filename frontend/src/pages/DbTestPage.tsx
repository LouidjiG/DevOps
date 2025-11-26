import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface DbTestResponse {
  status: string;
  dbConnected: boolean;
  users?: unknown[];
  message?: string;
  error?: string;
}

export function DbTestPage() {
  const [data, setData] = useState<DbTestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get<DbTestResponse>('/db-test');
        setData(response.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Erreur lors de la récupération des données BDD',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Test connexion base de données</h1>

        {loading && <p>Chargement...</p>}

        {!loading && error && (
          <div className="text-red-600">
            <p className="font-semibold mb-2">Connexion BDD : ÉCHEC</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-4">
            <p className="text-green-600 font-semibold">
              Connexion BDD : ({data.status})
            </p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
