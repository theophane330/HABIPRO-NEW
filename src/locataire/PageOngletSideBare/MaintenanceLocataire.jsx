import React, { useState } from 'react';
import { Plus, Eye, MessageCircle, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import MaintenanceModal from '../ActionsRapides/MaintenanceModal';

export default function MaintenanceLocataire() {
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Données des demandes
  const requests = [
    {
      id: 'MT-001',
      property: 'Studio Cocody',
      type: 'Électricité',
      date: '04/10/2025',
      status: 'pending',
      provider: null,
      description: 'Prise murale défectueuse',
      priority: 'high'
    },
    {
      id: 'MT-002',
      property: 'Appartement Yopougon',
      type: 'Plomberie',
      date: '28/09/2025',
      status: 'in_progress',
      provider: 'KONE Services',
      description: 'Fuite sous l\'évier',
      priority: 'urgent'
    },
    {
      id: 'MT-003',
      property: 'Studio Riviera',
      type: 'Serrure',
      date: '20/09/2025',
      status: 'resolved',
      provider: 'IB Technic',
      description: 'Serrure porte bloquée',
      priority: 'normal'
    },
    {
      id: 'MT-004',
      property: 'Appartement Cocody',
      type: 'Climatisation',
      date: '15/09/2025',
      status: 'resolved',
      provider: 'Cool Air CI',
      description: 'Unité AC ne refroidit plus',
      priority: 'high'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return '✅';
      case 'in_progress': return '🛠️';
      case 'pending': return '🟡';
      case 'rejected': return '🔴';
      default: return '❓';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'resolved': return 'Résolu';
      case 'in_progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  const selectedRequest = requests.find(r => r.id === selectedRequestId);
  const filteredRequests = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  const stats = {
    total: requests.length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              🔧 Maintenance & Réparations
            </h1>
            <p className="text-gray-600 mt-1">Déclarez une panne, suivez vos demandes et consultez les interventions passées.</p>
          </div>
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Nouvelle demande
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total demandes</p>
            <p className="text-3xl font-bold text-gray-900">🔧 {stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">En cours</p>
            <p className="text-3xl font-bold text-yellow-600">🛠️ {stats.inProgress}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Résolues</p>
            <p className="text-3xl font-bold text-green-600">✅ {stats.resolved}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Rejetées</p>
            <p className="text-3xl font-bold text-red-600">❌ {stats.rejected}</p>
          </div>
        </div>

        {/* Filtrage */}
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
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === filter.value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {selectedRequest ? (
          // Vue Détails
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <button
              onClick={() => setSelectedRequestId(null)}
              className="text-blue-500 hover:text-blue-700 font-semibold mb-6 flex items-center gap-2"
            >
              ← Retour à la liste
            </button>

            <div className="grid grid-cols-2 gap-8">
              {/* Résumé */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé du problème</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Référence</p>
                    <p className="font-bold text-lg">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Propriété</p>
                    <p className="font-bold">{selectedRequest.property}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type de problème</p>
                    <p className="font-bold">{selectedRequest.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-bold">{selectedRequest.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date du signalement</p>
                    <p className="font-bold">{selectedRequest.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-lg font-bold text-sm border ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)} {getStatusText(selectedRequest.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suivi */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Suivi des interventions</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-xs text-gray-600">04/10/2025</p>
                    <p className="font-bold text-gray-900">Signalement du locataire</p>
                    <p className="text-sm text-gray-600 mt-1">Vous avez signalé un problème</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <p className="text-xs text-gray-600">05/10/2025</p>
                    <p className="font-bold text-gray-900">Validation du propriétaire</p>
                    <p className="text-sm text-gray-600 mt-1">Demande transmise à un prestataire</p>
                  </div>
                  {selectedRequest.status !== 'pending' && (
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="text-xs text-gray-600">06/10/2025</p>
                      <p className="font-bold text-gray-900">Intervention planifiée</p>
                      <p className="text-sm text-gray-600 mt-1">Rendez-vous fixé avec {selectedRequest.provider}</p>
                    </div>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="mt-8 space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all">
                    📅 Replanifier
                  </button>
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message au prestataire
                  </button>
                  {selectedRequest.status === 'in_progress' && (
                    <button className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all">
                      ✅ Confirmer la résolution
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Tableau des demandes
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Réf</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Propriété</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Prestataire</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{request.id}</td>
                      <td className="px-6 py-4 text-gray-700">{request.property}</td>
                      <td className="px-6 py-4 text-gray-700">{request.type}</td>
                      <td className="px-6 py-4 text-gray-700">{request.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-lg font-bold text-sm border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)} {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{request.provider || '—'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedRequestId(request.id)}
                          className="text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assistant IA Premium */}
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-6">
          <h3 className="text-lg font-bold text-purple-900 mb-3">🤖 Assistant IA Maintenance (Premium)</h3>
          <div className="bg-white rounded-lg p-4 mb-3 border border-purple-200">
            <p className="text-sm text-gray-700">
              Vous avez eu 3 demandes de plomberie en 6 mois. Cela pourrait indiquer un problème récurrent. Voulez-vous recommander un changement de prestataire ou une inspection complète du système ?
            </p>
          </div>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all">
            💬 Parler à l'assistant
          </button>
        </div>
      </div>

      {/* Modal de nouvelle demande */}
      <MaintenanceModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
      />
    </div>
  );
}