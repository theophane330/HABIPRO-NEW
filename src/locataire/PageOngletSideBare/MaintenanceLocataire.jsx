import React, { useState, useEffect } from 'react';
import { Plus, Eye, MessageCircle, X, AlertCircle, Loader } from 'lucide-react';

export default function MaintenanceLocataire() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    linked_property: '',
    request_type: 'Plomberie',
    location: 'Cuisine',
    description: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchRequests();
    fetchProperties();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token récupéré:', token ? 'Présent ✅' : 'Manquant ❌');
      
      if (!token) {
        console.error('❌ Aucun token trouvé dans localStorage');
        setError('Session expirée. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }
      
      console.log('📡 Envoi de la requête vers /api/maintenance-requests/');
      
      const response = await fetch('http://localhost:8000/api/maintenance-requests/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Status de la réponse:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        
        // ✅ LOGS DÉTAILLÉS
        console.log('='.repeat(80));
        console.log('✅ DONNÉES MAINTENANCE REÇUES:');
        console.log('Type:', typeof data);
        console.log('Est tableau?', Array.isArray(data));
        console.log('Données complètes:', JSON.stringify(data, null, 2));
        console.log('='.repeat(80));
        
        // ✅ Gérer différents formats de réponse
        let requestsArray = [];
        
        if (Array.isArray(data)) {
          requestsArray = data;
          console.log('📦 Format: Tableau direct');
        } else if (data.results && Array.isArray(data.results)) {
          requestsArray = data.results;
          console.log('📦 Format: { results: [...] }');
        } else if (data.data && Array.isArray(data.data)) {
          requestsArray = data.data;
          console.log('📦 Format: { data: [...] }');
        }
        
        console.log('📊 Demandes extraites:', requestsArray.length);
        if (requestsArray.length > 0) {
          console.log('📝 Premier élément:', requestsArray[0]);
          console.log('🔑 Clés disponibles:', Object.keys(requestsArray[0]));
        }
        
        setRequests(requestsArray);
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        }
        setRequests([]);
      }
    } catch (error) {
      console.error('💥 Erreur réseau:', error);
      setError('Erreur de connexion au serveur');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/locations/active/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Locations reçues:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          const props = data.map(location => ({
            id: location.property,
            titre: location.property_title
          }));
          console.log('Propriétés extraites:', props);
          setProperties(props);
        } else {
          console.log('Aucune location active trouvée');
          setProperties([]);
        }
      } else {
        console.error('Erreur response:', response.status);
        setProperties([]);
      }
    } catch (error) {
      console.error('Erreur fetch properties:', error);
      setProperties([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('📤 Données envoyées:', JSON.stringify(formData, null, 2));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/maintenance-requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log('📥 Réponse serveur:', responseData);

      if (response.ok) {
        setIsNewRequestModalOpen(false);
        fetchRequests(); // Recharger la liste
        setFormData({
          linked_property: '',
          request_type: 'Plomberie',
          location: 'Cuisine',
          description: '',
          priority: 'normal'
        });
      } else {
        setError(responseData.error || JSON.stringify(responseData));
        console.error('❌ Erreur validation:', responseData);
      }
    } catch (error) {
      setError('Erreur réseau');
      console.error('💥 Erreur:', error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      resolved: { color: 'bg-green-100 text-green-700 border-green-300', icon: '✅', text: 'Résolu' },
      in_progress: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🛠️', text: 'En cours' },
      pending: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🟡', text: 'En attente' },
      rejected: { color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴', text: 'Rejeté' }
    };
    return configs[status] || configs.pending;
  };

  const getTypeDisplay = (type) => {
    const types = {
      'Plomberie': 'Plomberie',
      'Électricité': 'Électricité',
      'Climatisation': 'Climatisation',
      'Serrure': 'Serrure',
      'Peinture': 'Peinture',
      'Autre': 'Autre'
    };
    return types[type] || type;
  };

  const getLocationDisplay = (location) => {
    const locations = {
      'Cuisine': 'Cuisine',
      'Salle de bain': 'Salle de bain',
      'Chambre': 'Chambre',
      'Salon': 'Salon',
      'Balcon': 'Balcon',
      'Entrée': 'Entrée',
      'Autre': 'Autre'
    };
    return locations[location] || location;
  };

  const getPriorityDisplay = (priority) => {
    const priorities = {
      'urgent': 'Urgent',
      'high': 'Élevé',
      'normal': 'Normal'
    };
    return priorities[priority] || priority;
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const stats = {
    total: requests.length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  // ✅ LOGS AVANT RENDU
  console.log('🎨 ÉTAT AVANT RENDU:');
  console.log('- Loading:', loading);
  console.log('- Requests:', requests);
  console.log('- Requests.length:', requests.length);
  console.log('- FilterStatus:', filterStatus);
  console.log('- FilteredRequests.length:', filteredRequests.length);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔧 Maintenance & Réparations</h1>
            <p className="text-gray-600 mt-1">Signalez un problème et suivez vos demandes</p>
          </div>
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Nouvelle demande
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">En cours</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Résolues</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Rejetées</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex gap-2">
          {[
            { value: 'all', label: 'Toutes' },
            { value: 'pending', label: 'En attente' },
            { value: 'in_progress', label: 'En cours' },
            { value: 'resolved', label: 'Résolues' }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === filter.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredRequests.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Réf</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Propriété</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Priorité</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map(request => {
                  console.log('🔄 Rendu demande:', request);
                  const statusConfig = getStatusConfig(request.status);
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold">{request.request_id || 'N/A'}</td>
                      <td className="px-6 py-4">{request.property_title || 'N/A'}</td>
                      <td className="px-6 py-4">{getTypeDisplay(request.request_type)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          request.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getPriorityDisplay(request.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg font-bold text-sm border ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700">Aucune demande trouvée</p>
              <p className="text-sm text-gray-500 mt-2">
                {requests.length === 0 
                  ? 'Créez votre première demande de maintenance' 
                  : 'Aucune demande ne correspond aux filtres sélectionnés'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouvelle demande */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Nouvelle demande de maintenance</h2>
              <button onClick={() => setIsNewRequestModalOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Propriété</label>
                <select
                  value={formData.linked_property}
                  onChange={(e) => setFormData({...formData, linked_property: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Sélectionnez une propriété</option>
                  {properties.length > 0 ? (
                    properties.map(prop => (
                      <option key={prop.id} value={prop.id}>
                        {prop.titre}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Aucune propriété disponible</option>
                  )}
                </select>
                {properties.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Vous devez avoir une location active pour créer une demande
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Type de problème</label>
                <select
                  value={formData.request_type}
                  onChange={(e) => setFormData({...formData, request_type: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="Plomberie">Plomberie</option>
                  <option value="Électricité">Électricité</option>
                  <option value="Climatisation">Climatisation</option>
                  <option value="Serrure">Serrure</option>
                  <option value="Peinture">Peinture</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Emplacement</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="Cuisine">Cuisine</option>
                  <option value="Salle de bain">Salle de bain</option>
                  <option value="Chambre">Chambre</option>
                  <option value="Salon">Salon</option>
                  <option value="Balcon">Balcon</option>
                  <option value="Entrée">Entrée</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  rows="4"
                  placeholder="Décrivez le problème en détail..."
                  required
                  minLength="10"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
                >
                  Envoyer la demande
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal détails */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Détails de la demande</h2>
              <button onClick={() => setSelectedRequest(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Informations</h3>
                <div>
                  <p className="text-sm text-gray-600">Référence</p>
                  <p className="font-bold">{selectedRequest.request_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Propriété</p>
                  <p className="font-bold">{selectedRequest.property_title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-bold">{getTypeDisplay(selectedRequest.request_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emplacement</p>
                  <p className="font-bold">{getLocationDisplay(selectedRequest.location)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedRequest.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-lg font-bold text-sm border ${getStatusConfig(selectedRequest.status).color}`}>
                    {getStatusConfig(selectedRequest.status).icon} {getStatusConfig(selectedRequest.status).text}
                  </span>
                </div>
                {selectedRequest.provider && (
                  <div>
                    <p className="text-sm text-gray-600">Prestataire</p>
                    <p className="font-bold">{selectedRequest.provider}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Chronologie</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-xs text-gray-600">
                      {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString() : 'N/A'}
                    </p>
                    <p className="font-bold">Demande créée</p>
                  </div>
                  {selectedRequest.status !== 'pending' && (
                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                      <p className="text-xs text-gray-600">En cours de traitement</p>
                      <p className="font-bold">Prise en charge</p>
                    </div>
                  )}
                  {selectedRequest.status === 'resolved' && (
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="text-xs text-gray-600">Résolu</p>
                      <p className="font-bold">Problème résolu</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}