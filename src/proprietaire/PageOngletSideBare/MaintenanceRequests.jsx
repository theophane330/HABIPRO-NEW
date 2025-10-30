import React, { useState, useEffect } from 'react';
import { Eye, X, Loader, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, User, MapPin, Calendar, Phone, Mail, Star, Award } from 'lucide-react';

export default function MaintenanceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // États pour les prestataires
  const [prestataires, setPrestataires] = useState([]);
  const [filteredPrestataires, setFilteredPrestataires] = useState([]);
  const [loadingPrestataires, setLoadingPrestataires] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchPrestataires();
  }, []);

  // Filtrer les prestataires selon le type de demande
  useEffect(() => {
    if (selectedRequest && prestataires.length > 0) {
      filterPrestataires(selectedRequest.request_type);
    }
  }, [selectedRequest, prestataires]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        setRequests([]);
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching maintenance requests...');
      
      const response = await fetch('http://localhost:8000/api/maintenance-requests/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ DONNÉES REÇUES:', data);
        
        let requestsArray = [];
        
        if (Array.isArray(data)) {
          requestsArray = data;
        } else if (data.results && Array.isArray(data.results)) {
          requestsArray = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          requestsArray = data.data;
        } else {
          console.error('❌ Format de réponse non reconnu:', data);
          setError('Format de données invalide reçu du serveur');
        }
        
        console.log(`📊 ${requestsArray.length} demande(s) extraite(s)`);
        
        if (requestsArray.length === 0) {
          console.warn('⚠️ Aucune demande trouvée');
          fetchDebugInfo();
        }
        
        setRequests(requestsArray);
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status);
        
        if (response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          setError('Vous n\'avez pas les permissions nécessaires.');
        } else {
          setError(`Erreur serveur: ${response.status}`);
        }
        
        setRequests([]);
      }
    } catch (error) {
      console.error('💥 Erreur réseau:', error);
      setError('Impossible de se connecter au serveur.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des prestataires
  const fetchPrestataires = async () => {
    setLoadingPrestataires(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ Pas de token pour charger les prestataires');
        return;
      }
      
      console.log('👷 Chargement des prestataires...');
      
      const response = await fetch('http://localhost:8000/api/prestataires/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Prestataires chargés:', data);
        
        // Gérer différents formats de réponse
        let prestatairesArray = [];
        
        if (Array.isArray(data)) {
          prestatairesArray = data;
        } else if (data.results && Array.isArray(data.results)) {
          prestatairesArray = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          prestatairesArray = data.data;
        }
        
        console.log(`📊 ${prestatairesArray.length} prestataire(s) chargé(s)`);
        setPrestataires(prestatairesArray);
      } else {
        console.error('❌ Erreur chargement prestataires:', response.status);
      }
    } catch (error) {
      console.error('💥 Erreur réseau prestataires:', error);
    } finally {
      setLoadingPrestataires(false);
    }
  };

  // Filtrer les prestataires selon le type de demande
  const filterPrestataires = (requestType) => {
    console.log('🔍 Filtrage prestataires pour:', requestType);
    
    // Mapper les types de demande aux spécialités
    const typeToSpecialite = {
      'Plomberie': ['Plomberie'],
      'Électricité': ['Électricité', 'Éclairage'],
      'Climatisation': ['Climatisation'],
      'Serrure': ['Serrure', 'Sécurité'],
      'Peinture': ['Peinture', 'Maçonnerie'],
      'Autre': [] // Tous les prestataires pour "Autre"
    };
    
    const specialitesRecherchees = typeToSpecialite[requestType] || [];
    
    let filtered = prestataires;
    
    // Si le type est "Autre", afficher tous les prestataires
    if (requestType !== 'Autre' && specialitesRecherchees.length > 0) {
      filtered = prestataires.filter(p => {
        // Vérifier si le prestataire a au moins une des spécialités recherchées
        return p.specialites && p.specialites.some(s => 
          specialitesRecherchees.includes(s)
        );
      });
    }
    
    // Trier par disponibilité puis par note
    filtered.sort((a, b) => {
      // D'abord par disponibilité
      if (a.disponibilite === 'Disponible' && b.disponibilite !== 'Disponible') return -1;
      if (a.disponibilite !== 'Disponible' && b.disponibilite === 'Disponible') return 1;
      
      // Ensuite par note
      return (b.note || 0) - (a.note || 0);
    });
    
    console.log('✅ Prestataires filtrés:', filtered.length);
    setFilteredPrestataires(filtered);
  };

  const fetchDebugInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/debug/maintenance/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG INFO:', data);
        setDebugInfo(data);
      }
    } catch (error) {
      console.error('❌ Erreur debug:', error);
    }
  };

  const handleAction = async () => {
    setError('');
    setActionLoading(true);
    const token = localStorage.getItem('token');
    let url = `http://localhost:8000/api/maintenance-requests/${selectedRequest.id}/`;
    let body = {};

    try {
      if (actionType === 'start') {
        url += 'start-work/';
        if (selectedProvider) {
          body.provider = selectedProvider.nom;
        }
      } else if (actionType === 'resolve') {
        url += 'resolve/';
      } else if (actionType === 'reject') {
        url += 'reject/';
        if (!rejectReason || rejectReason.trim().length < 10) {
          setError('La raison du rejet doit contenir au moins 10 caractères');
          setActionLoading(false);
          return;
        }
        body.reason = rejectReason;
      } else if (actionType === 'assign') {
        url += 'assign-provider/';
        if (!selectedProvider) {
          setError('Veuillez sélectionner un prestataire');
          setActionLoading(false);
          return;
        }
        body.provider = selectedProvider.nom;
      }

      console.log('📤 Envoi action:', { url, body });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Action réussie:', result);
        
        setShowActionModal(false);
        setSelectedProvider(null);
        setRejectReason('');
        fetchRequests();
        setSelectedRequest(null);
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur action:', errorData);
        setError(errorData.error || errorData.message || 'Erreur lors de l\'action');
      }
    } catch (error) {
      console.error('💥 Erreur réseau:', error);
      setError('Erreur réseau lors de l\'action');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (type) => {
    setActionType(type);
    setShowActionModal(true);
    setError('');
    setSelectedProvider(null);
    setRejectReason('');
    
    if ((type === 'start' || type === 'assign') && selectedRequest) {
      filterPrestataires(selectedRequest.request_type);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      resolved: { 
        color: 'bg-green-100 text-green-700 border-green-300', 
        icon: <CheckCircle className="w-4 h-4" />, 
        text: 'Résolu',
        badgeColor: 'bg-green-500'
      },
      in_progress: { 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
        icon: <Clock className="w-4 h-4" />, 
        text: 'En cours',
        badgeColor: 'bg-yellow-500'
      },
      pending: { 
        color: 'bg-orange-100 text-orange-700 border-orange-300', 
        icon: <AlertTriangle className="w-4 h-4" />, 
        text: 'En attente',
        badgeColor: 'bg-orange-500'
      },
      rejected: { 
        color: 'bg-red-100 text-red-700 border-red-300', 
        icon: <XCircle className="w-4 h-4" />, 
        text: 'Rejeté',
        badgeColor: 'bg-red-500'
      }
    };
    return configs[status] || configs.pending;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: { color: 'bg-red-100 text-red-700 border-red-300', text: '🚨 Urgent' },
      high: { color: 'bg-orange-100 text-orange-700 border-orange-300', text: '⚠️ Haute' },
      normal: { color: 'bg-gray-100 text-gray-700 border-gray-300', text: '📋 Normale' }
    };
    return configs[priority] || configs.normal;
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    urgent: requests.filter(r => r.priority === 'urgent' && r.status !== 'resolved').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-red-500 mb-4" />
        <p className="text-gray-600 font-medium">Chargement des demandes de maintenance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔧 Gestion des Demandes de Maintenance</h1>
            <p className="text-gray-600 mt-1">Gérez et suivez toutes les demandes de vos locataires</p>
          </div>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
            Actualiser
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 border border-red-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError('')} className="text-red-900 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Info de debug */}
        {debugInfo && requests.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-yellow-900">🔍 Informations de diagnostic</h3>
              <button onClick={() => setDebugInfo(null)} className="text-yellow-700 hover:text-yellow-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Propriétés: {debugInfo.user_properties?.length || 0}</p>
              <p>• Total demandes DB: {debugInfo.database_stats?.total_requests || 0}</p>
              <p>• Demandes trouvées: {debugInfo.user_requests?.length || 0}</p>
              {debugInfo.user_properties?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-yellow-300">
                  <p className="font-semibold">Vos propriétés:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    {debugInfo.user_properties.map(p => (
                      <li key={p.id}>{p.titre} (ID: {p.id})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-1">En attente</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-1">En cours</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-1">Résolues</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-1">Urgentes</p>
            <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Toutes', count: stats.total },
            { value: 'pending', label: 'En attente', count: stats.pending },
            { value: 'in_progress', label: 'En cours', count: stats.inProgress },
            { value: 'resolved', label: 'Résolues', count: stats.resolved }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === filter.value
                  ? 'bg-gradient-to-r from-red-400 to-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Réf</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Locataire</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Propriété</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Priorité</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Prestataire</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map(request => {
                    const statusConfig = getStatusConfig(request.status);
                    const priorityConfig = getPriorityConfig(request.priority);
                    return (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{request.request_id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{request.tenant_name}</p>
                            <p className="text-sm text-gray-500">{request.tenant_phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{request.property_title}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {request.request_type_display || request.request_type}
                          </span>
                          <p className="text-xs text-gray-500">
                            {request.location_display || request.location}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${priorityConfig.color}`}>
                            {priorityConfig.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-sm border ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{request.provider || '—'}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-4 h-4" /> Gérer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-700">Aucune demande trouvée</p>
              <p className="text-sm mt-2">
                {requests.length === 0 
                  ? 'Aucune demande de maintenance n\'a été créée pour vos propriétés'
                  : 'Aucune demande ne correspond aux filtres sélectionnés'}
              </p>
              {requests.length === 0 && (
                <button
                  onClick={fetchDebugInfo}
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  🔍 Afficher les informations de diagnostic
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal détails */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Détails de la demande</h2>
                <p className="text-sm text-gray-500 mt-1">Référence: {selectedRequest.request_id}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* Colonne gauche */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations du locataire
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        {selectedRequest.tenant_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedRequest.tenant_name}</p>
                        <p className="text-sm text-gray-500">Locataire</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedRequest.tenant_phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedRequest.tenant_email}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Propriété concernée
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-bold text-gray-900">{selectedRequest.property_title}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.property_address}</p>
                    <p className="text-xs text-gray-500">{selectedRequest.property_type}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Description du problème</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">🔧</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedRequest.request_type_display || selectedRequest.request_type}
                        </p>
                        <p className="text-sm text-gray-600">
                          Emplacement: {selectedRequest.location_display || selectedRequest.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{selectedRequest.description}</p>
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Statut et priorité</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">État actuel</p>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold border ${getStatusConfig(selectedRequest.status).color}`}>
                        {getStatusConfig(selectedRequest.status).icon}
                        {getStatusConfig(selectedRequest.status).text}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Niveau de priorité</p>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-bold border ${getPriorityConfig(selectedRequest.priority).color}`}>
                        {getPriorityConfig(selectedRequest.priority).text}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Date de création</p>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {selectedRequest.created_at_formatted || new Date(selectedRequest.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedRequest.time_elapsed || 'Récent'}
                      </p>
                    </div>
                    {selectedRequest.provider && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Prestataire assigné</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="font-bold text-blue-900">{selectedRequest.provider}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Chronologie</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        {(selectedRequest.status !== 'pending' || selectedRequest.status === 'resolved') && (
                          <div className="w-0.5 h-full bg-orange-300 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-gray-900">Demande créée</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedRequest.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {selectedRequest.status !== 'pending' && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 ${getStatusConfig(selectedRequest.status).badgeColor} rounded-full flex items-center justify-center`}>
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          {selectedRequest.status === 'resolved' && (
                            <div className="w-0.5 h-full bg-green-300 mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-semibold text-gray-900">Prise en charge</p>
                          <p className="text-xs text-gray-500">En cours de traitement</p>
                        </div>
                      </div>
                    )}

                    {selectedRequest.status === 'resolved' && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Problème résolu</p>
                          <p className="text-xs text-gray-500">Demande traitée avec succès</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedRequest.status !== 'resolved' && selectedRequest.status !== 'rejected' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Actions disponibles</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openActionModal('start')}
                        className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Clock className="w-5 h-5" /> Démarrer le travail
                      </button>
                      <button
                        onClick={() => openActionModal('reject')}
                        className="px-4 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" /> Rejeter
                      </button>
                    </>
                  )}
                  {selectedRequest.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => openActionModal('resolve')}
                        className="px-4 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" /> Marquer comme résolu
                      </button>
                      <button
                        onClick={() => openActionModal('assign')}
                        className="px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                      >
                        Changer de prestataire
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal actions avec sélection de prestataires */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {actionType === 'start' && 'Démarrer le travail'}
              {actionType === 'resolve' && 'Confirmer la résolution'}
              {actionType === 'reject' && 'Rejeter la demande'}
              {actionType === 'assign' && 'Assigner un prestataire'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Sélection de prestataire */}
            {(actionType === 'start' || actionType === 'assign') && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Sélectionner un prestataire {actionType === 'start' && '(optionnel)'}
                </label>

                {loadingPrestataires ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-red-500" />
                    <span className="ml-2 text-gray-600">Chargement des prestataires...</span>
                  </div>
                ) : filteredPrestataires.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {filteredPrestataires.map((prestataire) => (
                      <div
                        key={prestataire.id}
                        onClick={() => setSelectedProvider(prestataire)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedProvider?.id === prestataire.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900">{prestataire.nom}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                prestataire.disponibilite === 'Disponible'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {prestataire.disponibilite}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              Contact: {prestataire.contact} • {prestataire.telephone}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mb-2">
                              {prestataire.specialites?.slice(0, 3).map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                                >
                                  {spec}
                                </span>
                              ))}
                              {prestataire.specialites?.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  +{prestataire.specialites.length - 3}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{prestataire.note || 0}/5</span>
                                <span className="text-gray-500">({prestataire.nb_avis} avis)</span>
                              </div>
                              
                              <div className="text-gray-600">
                                {prestataire.tarif_display || `${prestataire.tarif_min} - ${prestataire.tarif_max} FCFA`}
                              </div>
                            </div>
                            
                            {prestataire.experience && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <Award className="w-3 h-3" />
                                {prestataire.experience}
                              </div>
                            )}
                          </div>
                          
                          {selectedProvider?.id === prestataire.id && (
                            <CheckCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">
                      Aucun prestataire disponible pour ce type de demande
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Type: {selectedRequest?.request_type}
                    </p>
                  </div>
                )}

                {selectedProvider && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-900">
                      ✓ Prestataire sélectionné: {selectedProvider.nom}
                    </p>
                  </div>
                )}
              </div>
            )}

            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Raison du rejet *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="4"
                  placeholder="Expliquez pourquoi vous rejetez cette demande... (minimum 10 caractères)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {rejectReason.length}/10 caractères minimum
                </p>
              </div>
            )}

            {actionType === 'resolve' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Êtes-vous sûr de vouloir marquer cette demande comme résolue ? 
                  Le locataire sera notifié.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  'Confirmer'
                )}
              </button>
              <button
                onClick={() => setShowActionModal(false)}
                disabled={actionLoading}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}