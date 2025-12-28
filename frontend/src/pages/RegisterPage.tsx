import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { UserIcon, ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {selectedRole ? 'Finalisez votre inscription' : 'Créez votre compte'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w">
          Ou{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            connectez-vous à votre compte existant
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!selectedRole ? (
            <div className="space-y-4">
              <p className="text-center text-gray-700 mb-6 font-medium">Quel type de compte souhaitez-vous créer ?</p>

              <button
                onClick={() => setSelectedRole('user')}
                className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <UserIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Utilisateur</h3>
                  <p className="text-sm text-gray-500">Je veux voter et gagner de l'argent</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole('vendor')}
                className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
              >
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <ShoppingBagIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Vendeur</h3>
                  <p className="text-sm text-gray-500">Je veux créer des sondages</p>
                </div>
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedRole(null)}
                className="mb-6 flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" /> Retour au choix
              </button>
              <RegisterForm preselectedRole={selectedRole} />
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
