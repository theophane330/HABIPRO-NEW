import { useState } from 'react';
import authService from '../services/authService';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    role: 'proprietaire'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!isLogin) {
        // Validation pour l'inscription
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          return;
        }

        // Appel à l'API d'inscription
        const result = await authService.register(formData);
        
        if (result.success) {
          setSuccess(`Inscription réussie ! Redirection vers l'espace ${result.data.user.role}...`);
          
          // Redirection après 1 seconde
          setTimeout(() => {
            if (result.data.user.role === 'proprietaire') {
              window.location.href = '/proprietaire';
            } else {
              window.location.href = '/locataire';
            }
          }, 1000);
        } else {
          setError(result.error);
        }

      } else {
        // Appel à l'API de connexion
        const result = await authService.login(formData.email, formData.password);

        if (result.success) {
          setSuccess(`Connexion réussie ! Redirection vers l'espace ${result.data.user.role}...`);
          
          // Redirection après 1 seconde
          setTimeout(() => {
            if (result.data.user.role === 'proprietaire') {
              window.location.href = '/proprietaire';
            } else {
              window.location.href = '/locataire';
            }
          }, 1000);
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Erreur inattendue lors du traitement de la requête');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col lg:flex-row">
        {/* Section gauche - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-50 to-purple-100 p-12 items-center justify-center relative">
          <div className="text-center">
            <div className="mb-8">
              <svg className="w-64 h-64 mx-auto" viewBox="0 0 400 400" fill="none">
                <circle cx="200" cy="180" r="120" fill="#E9D5FF" opacity="0.3"/>
                <path d="M200 280 C180 260, 160 240, 160 200 C160 160, 180 140, 200 140 C220 140, 240 160, 240 200 C240 240, 220 260, 200 280" fill="#8B5CF6"/>
                <circle cx="200" cy="160" r="35" fill="#F3E8FF"/>
                <path d="M165 200 C165 200, 175 220, 200 240 C225 220, 235 200, 235 200 L235 300 L165 300 Z" fill="#A78BFA"/>
                <g transform="translate(280, 200)">
                  <rect x="0" y="0" width="60" height="8" rx="4" fill="#FCD34D"/>
                  <circle cx="8" cy="4" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
                  <rect x="50" y="-8" width="8" height="8" fill="#FCD34D"/>
                  <rect x="50" y="8" width="8" height="8" fill="#FCD34D"/>
                </g>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-purple-900 mb-4">
              {isLogin ? 'Bienvenue !' : 'Rejoignez-nous !'}
            </h2>
            <p className="text-purple-700 text-lg">
              {isLogin 
                ? 'Connectez-vous pour gérer vos biens immobiliers' 
                : 'Créez votre compte et gérez vos propriétés facilement'}
            </p>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold ml-3">Gestion Immobilière</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Se connecter' : 'Créer un compte'}
          </h2>
          <p className="text-gray-500 mb-8">
            {isLogin ? 'Accédez à votre espace personnel' : 'Commencez à gérer vos propriétés'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="nom"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="prenom"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <input
                  type="tel"
                  name="telephone"
                  placeholder="Téléphone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Je suis :
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'proprietaire' }))}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        formData.role === 'proprietaire'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                      }`}
                    >
                      Propriétaire
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'locataire' }))}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        formData.role === 'locataire'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                      }`}
                    >
                      Locataire
                    </button>
                  </div>
                </div>
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            )}

            {!isLogin && (
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  En m'inscrivant, j'accepte les{' '}
                  <span className="text-purple-600 cursor-pointer hover:underline">
                    Conditions d'utilisation
                  </span>{' '}
                  et la{' '}
                  <span className="text-purple-600 cursor-pointer hover:underline">
                    Politique de confidentialité
                  </span>
                </label>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : (isLogin ? 'SE CONNECTER' : "S'INSCRIRE")}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setFormData({
                  nom: '',
                  prenom: '',
                  email: '',
                  telephone: '',
                  password: '',
                  confirmPassword: '',
                  role: 'proprietaire'
                });
              }}
              className="text-purple-600 hover:underline font-medium"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-blue-600 font-semibold text-sm">Facebook</span>
                </button>
                <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-blue-700 font-semibold text-sm">LinkedIn</span>
                </button>
                <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-red-500 font-semibold text-sm">Google</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;