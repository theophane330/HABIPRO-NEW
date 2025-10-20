import React, { useState } from 'react';

export default function MaintenanceModal({ isOpen, onClose }) {
  const [currentTab, setCurrentTab] = useState('type');
  const [formData, setFormData] = useState({
    type: '',
    priority: 'normal',
    description: '',
    location: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (formData.type && formData.description && formData.location) {
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        setFormData({
          type: '',
          priority: 'normal',
          description: '',
          location: ''
        });
        setCurrentTab('type');
      }, 2000);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'type', label: 'Type de problème', icon: '🔧' },
    { id: 'location', label: 'Localisation', icon: '📍' },
    { id: 'priority', label: 'Urgence', icon: '🔴' },
    { id: 'description', label: 'Description', icon: '📝' },
    { id: 'preview', label: 'Aperçu', icon: '👁️' }
  ];

  const maintenanceTypes = [
    { id: 'plomberie', label: 'Plomberie', icon: '🚰' },
    { id: 'electricite', label: 'Électricité', icon: '⚡' },
    { id: 'climatisation', label: 'Climatisation', icon: '❄️' },
    { id: 'serrure', label: 'Serrure', icon: '🔐' },
    { id: 'peinture', label: 'Peinture', icon: '🎨' },
    { id: 'autre', label: 'Autre', icon: '🔧' }
  ];

  const locations = [
    'Cuisine', 'Salle de bain', 'Chambre', 'Salon', 'Balcon', 'Entrée', 'Autre'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        
        {/* Header */}
        <div className="h-2 bg-gradient-to-r from-orange-400 via-red-400 to-pink-500"></div>
        
        <div className="p-6">
          {submitSuccess ? (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
              <p className="text-gray-600">Votre demande de maintenance a été transmise au propriétaire</p>
            </div>
          ) : (
            <>
              {/* Onglets */}
              <div className="border-b mb-6">
                <div className="flex gap-1 overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`px-4 py-3 whitespace-nowrap font-medium text-sm border-b-2 transition-all ${
                        currentTab === tab.id
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-1">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenu */}
              <div className="space-y-4 min-h-64">
                {/* Tab: Type */}
                {currentTab === 'type' && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quel type de problème ?</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {maintenanceTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => handleChange('type', type.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            formData.type === type.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-xs font-semibold text-gray-900">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Location */}
                {currentTab === 'location' && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Où est le problème ?</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {locations.map(loc => (
                        <button
                          key={loc}
                          onClick={() => handleChange('location', loc)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            formData.location === loc
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-semibold text-gray-900">{loc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Priority */}
                {currentTab === 'priority' && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quel est le niveau d'urgence ?</h3>
                    <div className="space-y-2">
                      {[
                        { id: 'normal', label: 'Normal', icon: '🔵' },
                        { id: 'high', label: 'Élevé', icon: '🟡' },
                        { id: 'urgent', label: 'Urgent', icon: '🔴' }
                      ].map(priority => (
                        <button
                          key={priority.id}
                          onClick={() => handleChange('priority', priority.id)}
                          className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                            formData.priority === priority.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl">{priority.icon}</span>
                          <span className="font-semibold text-gray-900">{priority.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Description */}
                {currentTab === 'description' && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Décrivez le problème</h3>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows="6"
                      placeholder="Donnez un maximum de détails pour que le propriétaire ou le prestataire puisse mieux comprendre..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">{formData.description.length}/500 caractères</p>
                  </div>
                )}

                {/* Tab: Preview */}
                {currentTab === 'preview' && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border-2 border-orange-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Récapitulatif</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-bold text-gray-900">
                          {maintenanceTypes.find(t => t.id === formData.type)?.label || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Localisation:</span>
                        <span className="font-bold text-gray-900">{formData.location || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Urgence:</span>
                        <span className="font-bold text-gray-900">
                          {formData.priority === 'normal' ? 'Normal' : formData.priority === 'high' ? 'Élevé' : 'Urgent'}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-orange-300">
                        <p className="text-gray-700 mb-2"><strong>Description:</strong></p>
                        <p className="text-gray-600">{formData.description || 'Aucune description'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.type || !formData.description || !formData.location}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <span>🔧</span> Envoyer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}