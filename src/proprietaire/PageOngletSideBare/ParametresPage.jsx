import React, { useState } from 'react';
import { Settings, User, Building2, Globe, Bell, CreditCard, Shield, Users, Database, RefreshCw, Save, X, Lock, Mail, Phone, Upload, Camera, LogOut, Smartphone, Clock, DollarSign, Calendar, Download } from 'lucide-react';

export default function ParametresPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);

  // États pour le profil utilisateur
  const [profileData, setProfileData] = useState({
    fullName: "Kouassi Jean-Marc",
    email: "jean.kouassi@immo.ci",
    phone: "+225 07 89 45 12 34",
    whatsapp: "+225 07 89 45 12 34",
    profileImage: null
  });

  // États pour l'entreprise
  const [companyData, setCompanyData] = useState({
    agencyName: "ImmoCI Premium",
    logo: null,
    address: "Cocody Angré, Zone 4, Abidjan",
    slogan: "Votre partenaire immobilier de confiance"
  });

  // États pour les préférences
  const [preferences, setPreferences] = useState({
    language: "fr",
    theme: "light",
    timezone: "GMT+0",
    currency: "FCFA",
    dateFormat: "dd/mm/yyyy"
  });

  // États pour les notifications
  const [notifications, setNotifications] = useState({
    mobileEmail: true,
    paymentAlerts: true,
    rentReminders: true,
    securityAlerts: true
  });

  // États pour la sécurité
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    showLoginHistory: false
  });

  // États pour les paramètres avancés
  const [advanced, setAdvanced] = useState({
    autoBackup: true,
    aiTestMode: false
  });

  const sections = [
    { id: 'profile', label: 'Profil utilisateur', icon: User },
    { id: 'company', label: 'Informations entreprise', icon: Building2 },
    { id: 'preferences', label: 'Préférences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'advanced', label: 'Paramètres avancés', icon: Settings }
  ];

  const handleSaveAll = () => {
    alert('Tous les paramètres ont été enregistrés avec succès !');
    setHasChanges(false);
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler les modifications ?')) {
      // Réinitialiser les états
      setHasChanges(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Êtes-vous sûr de vouloir restaurer les paramètres par défaut ?')) {
      alert('Paramètres restaurés par défaut');
      setHasChanges(false);
    }
  };

  const handleImageUpload = (type) => {
    alert(`Upload d'image pour: ${type}`);
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {profileData.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <button
            onClick={() => handleImageUpload('profile')}
            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <Camera size={16} className="text-gray-600" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{profileData.fullName}</h3>
          <p className="text-gray-600 text-sm">{profileData.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom complet
          </label>
          <input
            type="text"
            value={profileData.fullName}
            onChange={(e) => {
              setProfileData({...profileData, fullName: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => {
              setProfileData({...profileData, email: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => {
              setProfileData({...profileData, phone: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            value={profileData.whatsapp}
            onChange={(e) => {
              setProfileData({...profileData, whatsapp: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => alert('Changement de mot de passe')}
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <Lock size={18} />
          Modifier mon mot de passe
        </button>
      </div>

      <button
        onClick={() => alert('Profil mis à jour')}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
      >
        🔒 Mettre à jour mes informations
      </button>
    </div>
  );

  const renderCompanySection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
            {companyData.logo ? (
              <img src={companyData.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Building2 size={32} className="text-gray-400" />
            )}
          </div>
          <button
            onClick={() => handleImageUpload('logo')}
            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} className="text-gray-600" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{companyData.agencyName}</h3>
          <p className="text-gray-600 text-sm">{companyData.slogan}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom de l'agence / propriétaire
          </label>
          <input
            type="text"
            value={companyData.agencyName}
            onChange={(e) => {
              setCompanyData({...companyData, agencyName: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Adresse complète
          </label>
          <textarea
            value={companyData.address}
            onChange={(e) => {
              setCompanyData({...companyData, address: e.target.value});
              setHasChanges(true);
            }}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Slogan / Phrase d'accroche (optionnel)
          </label>
          <input
            type="text"
            value={companyData.slogan}
            onChange={(e) => {
              setCompanyData({...companyData, slogan: e.target.value});
              setHasChanges(true);
            }}
            placeholder="Ex: Votre partenaire immobilier de confiance"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={() => alert('Informations entreprise enregistrées')}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
      >
        💾 Enregistrer les modifications
      </button>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Globe size={16} className="inline mr-2" />
            Langue
          </label>
          <select
            value={preferences.language}
            onChange={(e) => {
              setPreferences({...preferences, language: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 Anglais</option>
            <option value="es">🇪🇸 Espagnol</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Thème
          </label>
          <select
            value={preferences.theme}
            onChange={(e) => {
              setPreferences({...preferences, theme: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          >
            <option value="light">☀️ Clair</option>
            <option value="dark">🌙 Sombre</option>
            <option value="auto">🔄 Automatique</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Clock size={16} className="inline mr-2" />
            Fuseau horaire
          </label>
          <select
            value={preferences.timezone}
            onChange={(e) => {
              setPreferences({...preferences, timezone: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          >
            <option value="GMT+0">GMT +0 (Abidjan)</option>
            <option value="GMT+1">GMT +1 (Paris)</option>
            <option value="GMT-5">GMT -5 (New York)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <DollarSign size={16} className="inline mr-2" />
            Monnaie par défaut
          </label>
          <select
            value={preferences.currency}
            onChange={(e) => {
              setPreferences({...preferences, currency: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          >
            <option value="FCFA">FCFA (Franc CFA)</option>
            <option value="EUR">€ (Euro)</option>
            <option value="USD">$ (Dollar US)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-2" />
            Format de date
          </label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => {
              setPreferences({...preferences, dateFormat: e.target.value});
              setHasChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          >
            <option value="dd/mm/yyyy">JJ/MM/AAAA (31/12/2025)</option>
            <option value="mm/dd/yyyy">MM/JJ/AAAA (12/31/2025)</option>
            <option value="yyyy-mm-dd">AAAA-MM-JJ (2025-12-31)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Smartphone className="text-indigo-600" size={20} />
            <div>
              <div className="font-semibold text-gray-900">Notifications Mobile / Email</div>
              <div className="text-sm text-gray-600">Recevoir des notifications sur mobile et par email</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.mobileEmail}
              onChange={(e) => {
                setNotifications({...notifications, mobileEmail: e.target.checked});
                setHasChanges(true);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="text-green-600" size={20} />
            <div>
              <div className="font-semibold text-gray-900">Alertes de paiement</div>
              <div className="text-sm text-gray-600">Notifications lors des paiements reçus ou en retard</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.paymentAlerts}
              onChange={(e) => {
                setNotifications({...notifications, paymentAlerts: e.target.checked});
                setHasChanges(true);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={20} />
            <div>
              <div className="font-semibold text-gray-900">Rappels automatiques de loyer</div>
              <div className="text-sm text-gray-600">Envoyer des rappels avant échéance de paiement</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.rentReminders}
              onChange={(e) => {
                setNotifications({...notifications, rentReminders: e.target.checked});
                setHasChanges(true);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="text-red-600" size={20} />
            <div>
              <div className="font-semibold text-gray-900">Alertes de sécurité</div>
              <div className="text-sm text-gray-600">Notifications pour mises à jour réglementaires et sécurité</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.securityAlerts}
              onChange={(e) => {
                setNotifications({...notifications, securityAlerts: e.target.checked});
                setHasChanges(true);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPaymentsSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3">Moyens de paiement connectés</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Smartphone size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Orange Money</div>
                <div className="text-sm text-gray-600">Connecté</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold">✓ Actif</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Smartphone size={20} className="text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">MTN Mobile Money</div>
                <div className="text-sm text-gray-600">Connecté</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold">✓ Actif</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Wave</div>
                <div className="text-sm text-gray-600">Non connecté</div>
              </div>
            </div>
            <button className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold hover:bg-indigo-200 transition-colors">
              + Connecter
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => alert('Configuration des intégrations')}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        🔗 Configurer les intégrations
      </button>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="text-green-600" size={20} />
            <div>
              <div className="font-semibold text-gray-900">Authentification à deux facteurs (2FA)</div>
              <div className="text-sm text-gray-600">Sécurité renforcée pour votre compte</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={security.twoFactorAuth}
              onChange={(e) => {
                setSecurity({...security, twoFactorAuth: e.target.checked});
                setHasChanges(true);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-gray-900">Journal de connexion</div>
            <button
              onClick={() => setSecurity({...security, showLoginHistory: !security.showLoginHistory})}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              {security.showLoginHistory ? 'Masquer' : 'Voir l\'historique'}
            </button>
          </div>
          {security.showLoginHistory && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-sm p-2 bg-white rounded">
                <div>
                  <div className="font-medium">💻 Windows - Chrome</div>
                  <div className="text-gray-600">IP: 192.168.1.10</div>
                </div>
                <div className="text-gray-600">Aujourd'hui, 14:30</div>
              </div>
              <div className="flex items-center justify-between text-sm p-2 bg-white rounded">
                <div>
                  <div className="font-medium">📱 Android - App Mobile</div>
                  <div className="text-gray-600">IP: 192.168.1.25</div>
                </div>
                <div className="text-gray-600">Hier, 09:15</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold text-gray-900 mb-3">Actions de sécurité</h4>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (window.confirm('Forcer la déconnexion sur tous les appareils ?')) {
                  alert('Déconnexion forcée sur tous les appareils');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              🔓 Forcer la déconnexion sur tous les appareils
            </button>
            <button
              onClick={() => alert('Lien de réinitialisation envoyé par email')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail size={18} />
              📧 Envoyer un lien de réinitialisation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSection = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">PRO</span>
          <h4 className="font-semibold text-gray-900">Fonctionnalités avancées</h4>
        </div>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="text-indigo-600" size={20} />
              <div>
                <div className="font-semibold text-gray-900">Rôles et permissions</div>
                <div className="text-sm text-gray-600">Gérer les accès utilisateurs (assistant, gestionnaire, comptable)</div>
              </div>
            </div>
            <button
              onClick={() => alert('Configuration des rôles et permissions')}
              className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
            >
              👥 Configurer
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="text-green-600" size={20} />
              <div>
                <div className="font-semibold text-gray-900">Sauvegarde automatique</div>
                <div className="text-sm text-gray-600">Sauvegarde quotidienne de la base de données</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={advanced.autoBackup}
                onChange={(e) => {
                  setAdvanced({...advanced, autoBackup: e.target.checked});
                  setHasChanges(true);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <div className="font-semibold text-gray-900">Mode test IA</div>
                <div className="text-sm text-gray-600">Simulation et tests des fonctionnalités IA</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={advanced.aiTestMode}
                onChange={(e) => {
                  setAdvanced({...advanced, aiTestMode: e.target.checked});
                  setHasChanges(true);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Import / Export de données</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => alert('Import de données CSV/Excel')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={18} />
            📥 Importer des données
          </button>
          <button
            onClick={() => alert('Export de données CSV/Excel')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            📤 Exporter des données
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Dernière sauvegarde</h4>
        <p className="text-sm text-gray-600">Aujourd'hui à 03:00 AM - Base de données complète (2.4 GB)</p>
        <button
          onClick={() => alert('Sauvegarde manuelle en cours...')}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Database size={18} />
          Lancer une sauvegarde manuelle
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'company':
        return renderCompanySection();
      case 'preferences':
        return renderPreferencesSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'payments':
        return renderPaymentsSection();
      case 'security':
        return renderSecuritySection();
      case 'advanced':
        return renderAdvancedSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="flex-1 flex p-4 gap-4 overflow-y-auto">
      <div className="flex-1 max-w-7xl mx-auto w-full">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-indigo-600" size={28} />
            Paramètres Généraux
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Gérez les préférences globales de votre compte, vos notifications, et la configuration du système
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu latéral */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {React.createElement(section.icon, { size: 20 })}
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {renderContent()}
            </div>

            {/* Boutons d'action globaux */}
            {hasChanges && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="text-sm font-medium text-gray-900">
                      Vous avez des modifications non enregistrées
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X size={18} />
                      ❌ Annuler
                    </button>
                    <button
                      onClick={handleSaveAll}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <Save size={18} />
                      ✅ Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton de réinitialisation */}
            <div className="mt-4">
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
                🔄 Restaurer les paramètres par défaut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}