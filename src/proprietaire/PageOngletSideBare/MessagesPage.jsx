import React, { useState } from 'react';
import { Eye, Check, X, RotateCcw, Calendar, Trash2, MapPin, User, Building, CheckCircle2, XCircle, Search } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

// Fonction utilitaire pour formater les dates
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}


// ============ DETAIL MODAL ============
function VisitRequestDetailModal({ request, isOpen, onClose, onAccept, onReject, onProposeDate }) {
  const [confirmDate, setConfirmDate] = useState('');
  const [confirmTime, setConfirmTime] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [proposeDate, setProposeDate] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [showProposeForm, setShowProposeForm] = useState(false);

  if (!isOpen || !request) return null;

  const handleAccept = () => {
    if (confirmDate && confirmTime) {
      onAccept(request.id, { date: confirmDate, time: confirmTime, message: confirmMessage });
      setConfirmDate('');
      setConfirmTime('');
      setConfirmMessage('');
      setShowAcceptForm(false);
      onClose();
    }
  };

  const handleReject = () => {
    onReject(request.id, { reason: rejectReason });
    setRejectReason('');
    setShowRejectForm(false);
    onClose();
  };

  const handlePropose = () => {
    if (proposeDate) {
      onProposeDate(request.id, { proposedDate: proposeDate });
      setProposeDate('');
      setShowProposeForm(false);
      onClose();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡', label: 'En attente' };
      case 'accepted':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢', label: 'Acceptée' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴', label: 'Refusée' };
      case 'proposed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📅', label: 'Date proposée' };
      case 'completed':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⚪', label: 'Terminée' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⚪', label: 'Inconnu' };
    }
  };

  const statusBadge = getStatusBadge(request.status);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-light text-gray-900">Détails de la demande de visite</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Contenu scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
            {/* Statut */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                {statusBadge.icon} {statusBadge.label}
              </span>
            </div>

            {/* Informations sur le locataire */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} /> Informations sur le locataire
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nom complet</p>
                    <p className="font-semibold text-gray-900">{request.tenant_name || 'Non disponible'}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">✅ Vérifié</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">📞 Téléphone</p>
                    <p className="font-semibold text-gray-900">{request.tenant_phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">📧 Email</p>
                    <p className="font-semibold text-gray-900 break-all">{request.tenant_email || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations sur la propriété */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building size={20} /> Propriété demandée
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nom du bien</p>
                  <p className="font-semibold text-gray-900">{request.property_title || 'Appartement'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">📍 Adresse</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin size={16} /> {request.property_address || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Détails de la demande */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} /> Détails de la demande
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Date souhaitée</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(request.requested_date)}
                    {request.requested_date && ` à ${new Date(request.requested_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                </div>
                {request.proposed_date && (
                  <div>
                    <p className="text-sm text-blue-600">📅 Date proposée par vous</p>
                    <p className="font-semibold text-blue-900">{formatDate(request.proposed_date)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">📝 Message du locataire</p>
                  <p className="text-gray-700 italic">&quot;{request.message || 'Pas de message'}&quot;</p>
                </div>
                {request.owner_message && (
                  <div>
                    <p className="text-sm text-gray-600">💬 Votre message</p>
                    <p className="text-gray-700 italic">&quot;{request.owner_message}&quot;</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Date de la demande</p>
                  <p className="font-semibold text-gray-900">{formatDate(request.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Formulaires d'action */}
            {request.status === 'pending' && (
              <div className="space-y-4">
                {/* Accepter */}
                {!showAcceptForm && !showRejectForm && !showProposeForm && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Pré-remplir avec la date demandée par le locataire
                        if (request.requested_date) {
                          const requestedDate = new Date(request.requested_date);
                          const dateStr = requestedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
                          const timeStr = requestedDate.toTimeString().slice(0, 5); // Format HH:MM
                          setConfirmDate(dateStr);
                          setConfirmTime(timeStr);
                        }
                        setShowAcceptForm(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium">
                      <Check size={20} /> Accepter
                    </button>
                    <button
                      onClick={() => setShowProposeForm(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">
                      <RotateCcw size={20} /> Proposer une date
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium">
                      <X size={20} /> Refuser
                    </button>
                  </div>
                )}

                {/* Formulaire Acceptation */}
                {showAcceptForm && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-green-900">Planifier la visite</h4>
                    {request.requested_date && (
                      <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-2">
                        <p className="text-sm text-blue-800">
                          📅 <strong>Date demandée par le locataire :</strong> {formatDate(request.requested_date)}
                          {request.requested_date && ` à ${new Date(request.requested_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          ✅ Cette date est pré-remplie ci-dessous. Vous pouvez la modifier si nécessaire.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={confirmDate}
                        onChange={(e) => setConfirmDate(e.target.value)}
                        className="px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                      <input
                        type="time"
                        value={confirmTime}
                        onChange={(e) => setConfirmTime(e.target.value)}
                        className="px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <textarea
                      value={confirmMessage}
                      onChange={(e) => setConfirmMessage(e.target.value)}
                      placeholder="Message de confirmation (optionnel)..."
                      rows="3"
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAcceptForm(false)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm">
                        Annuler
                      </button>
                      <button
                        onClick={handleAccept}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium">
                        Confirmer la visite
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulaire Refus */}
                {showRejectForm && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-red-900">Raison du refus</h4>
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                      <option value="">Sélectionner une raison...</option>
                      <option value="already_reserved">Déjà réservé</option>
                      <option value="not_available">Bien non disponible</option>
                      <option value="maintenance">Maintenance en cours</option>
                      <option value="other">Autre raison</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRejectForm(false)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm">
                        Annuler
                      </button>
                      <button
                        onClick={handleReject}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium">
                        Confirmer le refus
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulaire Proposition */}
                {showProposeForm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-blue-900">Proposer une autre date</h4>
                    <input
                      type="date"
                      value={proposeDate}
                      onChange={(e) => setProposeDate(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowProposeForm(false)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm">
                        Annuler
                      </button>
                      <button
                        onClick={handlePropose}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium">
                        Envoyer la proposition
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {request.status === 'accepted' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={20} className="text-green-600" />
                  <p className="font-semibold text-green-900">Visite confirmée</p>
                </div>
                <p className="text-sm text-green-800">
                  La visite a été confirmée pour le <strong>
                    {formatDate(request.proposed_date || request.requested_date)}
                    {(request.proposed_date || request.requested_date) && ` à ${new Date(request.proposed_date || request.requested_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                  </strong>
                </p>
              </div>
            )}

            {request.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={20} className="text-red-600" />
                  <p className="font-semibold text-red-900">Demande refusée</p>
                </div>
                <p className="text-sm text-red-800">Cette demande a été refusée.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ============ MAIN COMPONENT ============
export default function VisitRequestsPage() {
  const [visitRequests, setVisitRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Fonction pour convertir les codes de raison en textes lisibles
  const getRejectReasonText = (reasonCode) => {
    const reasons = {
      'already_reserved': 'Déjà réservé',
      'not_available': 'Bien non disponible',
      'maintenance': 'Maintenance en cours',
      'other': 'Autre raison'
    };
    return reasons[reasonCode] || 'Demande refusée';
  };

  // Charger les demandes de visite depuis l'API
  React.useEffect(() => {
    loadVisitRequests();
  }, []);

  const loadVisitRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Aucun token trouvé');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/visit-requests/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVisitRequests(Array.isArray(data) ? data : data.results || []);
      } else {
        console.error('Erreur lors du chargement des demandes:', response.status);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Statistiques
  const stats = {
    pending: visitRequests.filter(r => r.status === 'pending').length,
    accepted: visitRequests.filter(r => r.status === 'accepted').length,
    rejected: visitRequests.filter(r => r.status === 'rejected').length,
    completed: visitRequests.filter(r => r.status === 'completed').length
  };

  // Filtrer et trier
  const getFilteredRequests = () => {
    let filtered = visitRequests.filter(r => {
      const matchesSearch =
        (r.tenant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.property_title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    // Tri
    switch (sortBy) {
      case 'date_asc':
        return filtered.sort((a, b) => new Date(a.requested_date) - new Date(b.requested_date));
      case 'date_desc':
        return filtered.sort((a, b) => new Date(b.requested_date) - new Date(a.requested_date));
      case 'name':
        return filtered.sort((a, b) => a.tenant_name.localeCompare(b.tenant_name));
      default:
        return filtered;
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleAccept = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/visit-requests/${id}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('✅ Visite acceptée et confirmée !');
        await loadVisitRequests(); // Recharger les demandes
      } else {
        const error = await response.json();
        alert('Erreur: ' + (error.error || 'Impossible d\'accepter la demande'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'acceptation de la visite');
    }
  };

  const handleReject = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/visit-requests/${id}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          owner_message: getRejectReasonText(data.reason)
        })
      });

      if (response.ok) {
        alert('❌ Demande refusée. Notification envoyée au locataire.');
        await loadVisitRequests(); // Recharger les demandes
      } else {
        const error = await response.json();
        alert('Erreur: ' + (error.error || 'Impossible de refuser la demande'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du refus de la visite');
    }
  };

  const handleProposeDate = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/visit-requests/${id}/propose-date/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposed_date: data.proposedDate,
          owner_message: 'Proposition d\'une nouvelle date'
        })
      });

      if (response.ok) {
        alert(`📅 Proposition de date ${formatDate(data.proposedDate)} envoyée au locataire.`);
        await loadVisitRequests(); // Recharger les demandes
      } else {
        const error = await response.json();
        alert('Erreur: ' + (error.error || 'Impossible de proposer une date'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la proposition de date');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/visit-requests/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        }
      });

      if (response.ok) {
        alert('✅ Demande supprimée avec succès');
        await loadVisitRequests();
      } else {
        const error = await response.json();
        alert('Erreur: ' + (error.error || 'Impossible de supprimer la demande'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredRequests = getFilteredRequests();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🟡 En attente' };
      case 'accepted':
        return { bg: 'bg-green-100', text: 'text-green-800', label: '🟢 Acceptée' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', label: '🔴 Refusée' };
      case 'proposed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: '📅 Date proposée' };
      case 'completed':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: '⚪ Terminée' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: '⚪' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">📅 Gestion des demandes de visite</h1>
          <p className="text-gray-600">Consultez les demandes envoyées par les locataires pour visiter vos propriétés et gérez-les facilement.</p>
        </div>
      </div>

      {/* Actions rapides et stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={loadVisitRequests}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium">
                🔄 Actualiser
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium">
                📊 Statistiques
              </button>
            </div>
          </div>

          {/* Dashboard stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-3xl font-light text-yellow-900 mb-1">{stats.pending}</div>
              <div className="text-sm text-yellow-800">🟡 En attente</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-3xl font-light text-green-900 mb-1">{stats.accepted}</div>
              <div className="text-sm text-green-800">🟢 Confirmées</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-3xl font-light text-red-900 mb-1">{stats.rejected}</div>
              <div className="text-sm text-red-800">🔴 Refusées</div>
            </div>
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <div className="text-3xl font-light text-gray-900 mb-1">{stats.completed}</div>
              <div className="text-sm text-gray-700">⚪ Terminées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Recherche */}
            <div className="flex-1 min-w-[250px] relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Chercher par nom de locataire ou propriété..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Filtres */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="all">Tous les statuts</option>
              <option value="pending">🟡 En attente</option>
              <option value="accepted">🟢 Acceptée</option>
              <option value="rejected">🔴 Refusée</option>
              <option value="proposed">📅 Date proposée</option>
              <option value="completed">⚪ Terminée</option>
            </select>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="date_desc">Date (récent)</option>
              <option value="date_asc">Date (ancien)</option>
              <option value="name">Nom (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-light text-gray-600 mb-2">Aucune demande trouvée</h3>
              <p className="text-gray-500">Ajustez vos critères de recherche.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Locataire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Bien concerné</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date souhaitée</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const statusBadge = getStatusBadge(request.status);
                    return (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{request.tenant_name || 'Locataire'}</div>
                          <div className="text-xs text-gray-500">{request.tenant_phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{request.property_title || 'Propriété'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={14} /> {request.property_address || 'Adresse non disponible'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{formatDate(request.requested_date)}</div>
                          <div className="text-xs text-gray-500">{new Date(request.requested_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs truncate">{request.message || 'Pas de message'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-all"
                              title="Voir détails">
                              <Eye size={18} />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowDetailModal(true);
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded transition-all"
                                  title="Accepter">
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowDetailModal(true);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-all"
                                  title="Refuser">
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            {request.status === 'accepted' && (
                              <button
                                onClick={() => {
                                  const date = request.proposed_date || request.requested_date;
                                  const formattedDate = formatDate(date);
                                  const formattedTime = new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                  alert(`📅 Visite prévue pour le ${formattedDate} à ${formattedTime}`);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-all"
                                title="Voir calendrier">
                                <Calendar size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(request.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                              title="Supprimer">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Résumé */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Affichage de {filteredRequests.length} demande(s) sur {visitRequests.length}
        </div>
      </div>

      {/* Modal détails */}
      <VisitRequestDetailModal
        request={selectedRequest}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onAccept={handleAccept}
        onReject={handleReject}
        onProposeDate={handleProposeDate}
      />
    </div>
  );
}