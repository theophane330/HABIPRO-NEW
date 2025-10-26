import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Bell, Mail, Phone, MapPin, FileText, LogOut } from 'lucide-react';

export default function ProfilLocataire() {
  // Charger les informations de l'utilisateur connecté
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        // Initialiser formData avec les vraies données de l'utilisateur
        setFormData({
          name: `${user.prenom || ''} ${user.nom || ''}`.trim(),
          idNumber: user.id_number || '',
          birthDate: user.birth_date || '',
          phone: user.telephone || '',
          email: user.email || '',
          address: user.adresse || '',
          city: user.ville || '',
          photo: null
        });
      } catch (error) {
        console.error('Erreur lors du chargement des informations utilisateur:', error);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    photo: null
  });

  const [preferences, setPreferences] = useState({
    smsPaiement: true,
    emailMaintenance: true,
    notificationsPush: true,
    messagesInstant: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });

  const [twoFA, setTwoFA] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (pref) => {
    setPreferences(prev => ({ ...prev, [pref]: !prev[pref] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const activities = [
    { date: '10/10/2025', action: 'Connexion réussie', details: 'depuis Chrome Mobile', icon: '✅' },
    { date: '09/10/2025', action: 'Mise à jour du profil', details: 'Téléphone modifié', icon: '✏️' },
    { date: '08/10/2025', action: 'Téléchargement de contrat', details: 'Studio Cocody', icon: '📥' },
    { date: '05/10/2025', action: 'Modification mot de passe', details: 'réussie', icon: '🔑' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">👤 Mon Profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations personnelles et vos préférences de compte.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-4 shadow-lg">
                  {currentUser ? `${currentUser.prenom?.[0] || ''}${currentUser.nom?.[0] || ''}`.toUpperCase() : 'L'}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {currentUser ? `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim() : 'Chargement...'}
                </h3>
                <p className="text-sm text-blue-600 font-semibold">Locataire {currentUser?.is_premium ? 'Premium' : ''}</p>
              </div>

              <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
                {currentUser?.adresse && (
                  <div>
                    <p className="text-gray-600">📍 {currentUser.adresse}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">📅 Membre depuis</p>
                  <p className="font-semibold text-gray-900">
                    {currentUser?.date_joined
                      ? new Date(currentUser.date_joined).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">📧 Email</p>
                  <p className="font-semibold text-gray-900 text-xs">{currentUser?.email || 'N/A'}</p>
                </div>
                {currentUser?.telephone && (
                  <div>
                    <p className="text-gray-600">📱 Téléphone</p>
                    <p className="font-semibold text-gray-900">{currentUser.telephone}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
                    localStorage.clear();
                    window.location.href = '/login';
                  }
                }}
                className="w-full mt-6 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Se déconnecter
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Notification de sauvegarde */}
            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-green-700">Modifications enregistrées</p>
                  <p className="text-sm text-green-600">Vos informations ont été mises à jour avec succès.</p>
                </div>
              </div>
            )}

            {/* Informations personnelles */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🪪 Informations personnelles</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nom complet</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro CNI/Passeport</label>
                    <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date de naissance</label>
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📞 Coordonnées</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone <span className="text-xs text-green-600">✅ Vérifié</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-xs text-green-600">✅ Vérifié</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ville</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Préférences */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Préférences de communication</h2>
              <div className="space-y-3">
                {[
                  { key: 'smsPaiement', label: 'Rappels de paiement par SMS', icon: '🔔' },
                  { key: 'emailMaintenance', label: 'Notifications de maintenance par email', icon: '📧' },
                  { key: 'notificationsPush', label: 'Notifications push dans l\'app', icon: '📱' },
                  { key: 'messagesInstant', label: 'Messages instantanés avec le propriétaire', icon: '💬' }
                ].map(pref => (
                  <div key={pref.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      <span>{pref.icon}</span>
                      {pref.label}
                    </label>
                    <button
                      onClick={() => handlePreferenceChange(pref.key)}
                      className={`w-12 h-6 rounded-full transition-all ${preferences[pref.key] ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${preferences[pref.key] ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sécurité */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔒 Sécurité du compte</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Changer le mot de passe</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Ancien mot de passe" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Nouveau mot de passe" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Confirmer le mot de passe" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Authentification à deux facteurs (2FA)</label>
                    <button
                      onClick={() => setTwoFA(!twoFA)}
                      className={`w-12 h-6 rounded-full transition-all ${twoFA ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${twoFA ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Sécurisez votre compte avec un code SMS ou une application</p>
                </div>
              </div>
            </div>

            {/* Historique d'activité */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🕓 Historique d'activité récente</h2>
              <div className="space-y-2">
                {activities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.details}</p>
                    </div>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Abonnement */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💎 Mon abonnement</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <p className="font-bold text-lg text-purple-600">Premium</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Renouvellement</p>
                  <p className="font-bold text-lg text-gray-900">30/11/2025</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">Accès à: Historique complet, IA Maintenance, Support expert prioritaire</p>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                🔄 Gérer mon abonnement
              </button>
            </div>

            {/* Bouton Enregistrer */}
            <div className="flex gap-3 pt-6">
              <button className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
                💾 Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}