import React, { useState } from 'react';
import { Settings, User, Mail, Phone, Key, Sun, Moon, Zap, Globe, Lock, Shield, Bell, Database, HelpCircle, LogOut, Trash2, Eye, Clock, Save, RotateCcw, MessageSquare, FileText, Download, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState('light');
  const [displaySize, setDisplaySize] = useState('normal');
  const [language, setLanguage] = useState('fr');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [currency, setCurrency] = useState('FCFA');
  const [twoFactor, setTwoFactor] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('private');
  const [autoBackup, setAutoBackup] = useState(true);
  const [syncDevices, setSyncDevices] = useState(true);
  
  const [notifications, setNotifications] = useState({
    payment: { enabled: true, channels: ['email', 'push'] },
    rentReminder: { enabled: true, channels: ['sms', 'email'] },
    maintenance: { enabled: true, channels: ['push'] },
    messages: { enabled: true, channels: ['email', 'push'] },
    offers: { enabled: false, channels: [] }
  });

  const [expandedSections, setExpandedSections] = useState({
    account: true,
    appearance: true,
    language: true,
    security: true,
    notifications: true,
    data: true,
    support: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleNotificationChannel = (notifType, channel) => {
    setNotifications(prev => ({
      ...prev,
      [notifType]: {
        ...prev[notifType],
        channels: prev[notifType].channels.includes(channel)
          ? prev[notifType].channels.filter(c => c !== channel)
          : [...prev[notifType].channels, channel]
      }
    }));
  };

  const SettingCard = ({ icon: Icon, title, children, sectionKey }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        
        {isExpanded && (
          <div className="p-5 pt-0 border-t border-gray-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
      <div 
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : ''}`} />
      </div>
    </label>
  );

  const ChannelBadge = ({ channel, active, onClick }) => {
    const labels = { sms: 'SMS', email: 'E-mail', push: 'Push App' };
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          active 
            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
        }`}
      >
        {labels[channel]}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Paramètres du compte</h1>
          </div>
          <p className="text-gray-600 ml-11">Configurez vos préférences, la sécurité et l'apparence de votre espace HABIPRO.</p>
        </div>

        <div className="space-y-4">
          {/* 1. Paramètres du compte */}
          <SettingCard icon={User} title="Informations de base" sectionKey="account">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nom d'utilisateur</p>
                    <p className="font-semibold text-gray-900">Jean Kouassi</p>
                    <p className="text-xs text-blue-600 mt-1">Locataire · Premium</p>
                  </div>
                  <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors border border-blue-200">
                    ✏️ Modifier
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">jean.kouassi@email.com</p>
                    <p className="text-xs text-green-600">✓ Vérifié</p>
                  </div>
                </div>
                <button className="text-blue-600 text-sm font-medium hover:underline">✏️ Modifier</button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">+225 07 XX XX XX XX</p>
                </div>
                <button className="text-blue-600 text-sm font-medium hover:underline">✏️ Modifier</button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">Mot de passe</p>
                </div>
                <button className="text-blue-600 text-sm font-medium hover:underline">🔑 Changer</button>
              </div>
            </div>
          </SettingCard>

          {/* 2. Apparence et affichage */}
          <SettingCard icon={Sun} title="Thème & Interface" sectionKey="appearance">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Thème</p>
                <div className="space-y-2">
                  {[
                    { value: 'light', icon: Sun, label: 'Mode clair' },
                    { value: 'dark', icon: Moon, label: 'Mode sombre' },
                    { value: 'auto', icon: Zap, label: 'Thème automatique' }
                  ].map(({ value, icon: Icon, label }) => (
                    <label key={value} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="theme"
                        value={value}
                        checked={theme === value}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Taille d'affichage</p>
                <div className="flex gap-2">
                  {['normal', 'compact', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setDisplaySize(size)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        displaySize === size
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size === 'normal' ? 'Normale' : size === 'compact' ? 'Compacte' : 'Large'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SettingCard>

          {/* 3. Langue et région */}
          <SettingCard icon={Globe} title="Langue & Format régional" sectionKey="language">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">🌐 Langue</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">📅 Format de date</label>
                <select 
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                  <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">💰 Devise</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="FCFA">FCFA (Franc CFA)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>
            </div>
          </SettingCard>

          {/* 4. Confidentialité & sécurité */}
          <SettingCard icon={Lock} title="Sécurité et confidentialité" sectionKey="security">
            <div className="space-y-4">
              <ToggleSwitch 
                enabled={twoFactor}
                onChange={setTwoFactor}
                label="🧠 Authentification à deux facteurs (2FA)"
              />

              <div className="py-3 border-t border-gray-100">
                <button className="w-full text-left flex items-center justify-between hover:text-blue-600 transition-colors">
                  <span className="text-sm text-gray-700">🔔 Gestion des sessions</span>
                  <span className="text-xs text-blue-600">Se déconnecter de tous les appareils</span>
                </button>
              </div>

              <div className="py-3 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">👁️ Visibilité du profil</p>
                <div className="space-y-2">
                  {[
                    { value: 'public', label: 'Public' },
                    { value: 'private', label: 'Privé' },
                    { value: 'restricted', label: 'Restreint' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value={value}
                        checked={profileVisibility === value}
                        onChange={(e) => setProfileVisibility(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="py-3 border-t border-gray-100">
                <button className="w-full text-left flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">🚫 Supprimer mon compte</span>
                </button>
                <p className="text-xs text-gray-500 mt-2 ml-6">⚠️ La suppression du compte est irréversible.</p>
              </div>
            </div>
          </SettingCard>

          {/* 5. Notifications */}
          <SettingCard icon={Bell} title="Notifications & alertes" sectionKey="notifications">
            <div className="space-y-4">
              {[
                { key: 'payment', icon: '📱', label: 'Alertes de paiement' },
                { key: 'rentReminder', icon: '🧾', label: 'Rappel d\'échéance de loyer' },
                { key: 'maintenance', icon: '🛠️', label: 'Mise à jour de maintenance' },
                { key: 'messages', icon: '💬', label: 'Messages du propriétaire' },
                { key: 'offers', icon: '📢', label: 'Nouveaux services ou offres HABIPRO' }
              ].map(({ key, icon, label }) => (
                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">{icon} {label}</span>
                    <ToggleSwitch 
                      enabled={notifications[key].enabled}
                      onChange={(val) => setNotifications(prev => ({
                        ...prev,
                        [key]: { ...prev[key], enabled: val }
                      }))}
                      label=""
                    />
                  </div>
                  {notifications[key].enabled && (
                    <div className="flex gap-2">
                      <ChannelBadge 
                        channel="sms" 
                        active={notifications[key].channels.includes('sms')}
                        onClick={() => toggleNotificationChannel(key, 'sms')}
                      />
                      <ChannelBadge 
                        channel="email" 
                        active={notifications[key].channels.includes('email')}
                        onClick={() => toggleNotificationChannel(key, 'email')}
                      />
                      <ChannelBadge 
                        channel="push" 
                        active={notifications[key].channels.includes('push')}
                        onClick={() => toggleNotificationChannel(key, 'push')}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SettingCard>

          {/* 6. Données et synchronisation */}
          <SettingCard icon={Database} title="Données & sauvegarde" sectionKey="data">
            <div className="space-y-4">
              <ToggleSwitch 
                enabled={autoBackup}
                onChange={setAutoBackup}
                label="☁️ Sauvegarde automatique des données"
              />
              
              <ToggleSwitch 
                enabled={syncDevices}
                onChange={setSyncDevices}
                label="🔄 Synchronisation multi-appareils"
              />

              <div className="pt-3 border-t border-gray-100">
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">📂 Exporter mes données (PDF ou Excel)</span>
                </button>
              </div>

              <div>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">🧹 Vider le cache local</span>
                </button>
              </div>
            </div>
          </SettingCard>

          {/* 7. Assistance & support */}
          <SettingCard icon={HelpCircle} title="Support et aide" sectionKey="support">
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">📘 Centre d'aide / FAQ</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">💬 Contacter le support expert</span>
                <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Premium : prioritaire</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">🧾 Signaler un problème technique</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <Eye className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">🔗 Politique de confidentialité</span>
              </button>
            </div>
          </SettingCard>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Save className="w-5 h-5" />
            Enregistrer les modifications
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-5 h-5" />
            Réinitialiser
          </button>
        </div>

        {/* Déconnexion */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200">
            <LogOut className="w-5 h-5" />
            🚪 Se déconnecter
          </button>
        </div>

        {/* Bas de page */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">HABIPRO CI © 2025 – Tous droits réservés</p>
          <p className="mt-1">Version de l'application : 2.3.1</p>
        </div>
      </div>
    </div>
  );
}