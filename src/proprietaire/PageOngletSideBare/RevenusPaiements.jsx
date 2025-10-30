"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Eye, Check, X, Download, Search } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export default function OwnerRevenusPaiements() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [stats, setStats] = useState({
        total_received: 0,
        pending_amount: 0,
        completed_count: 0,
        pending_count: 0,
        failed_count: 0
    });

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
        loadPayments();
        loadStats();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const loadPayments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/payments/`, {
                headers: getAuthHeaders()
            });
            
            // ✅ Vérifier si la réponse est un tableau ou un objet avec 'results'
            const data = Array.isArray(response.data) ? response.data : response.data.results || [];
            console.log('Payments loaded:', data);
            setPayments(data);
        } catch (error) {
            console.error('Erreur lors du chargement des paiements:', error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/payments/statistics/`, {
                headers: getAuthHeaders()
            });
            console.log('Stats loaded:', response.data);
            setStats(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            setStats({
                total_received: 0,
                pending_amount: 0,
                completed_count: 0,
                pending_count: 0,
                failed_count: 0
            });
        }
    };

    const handleConfirmPayment = async (paymentId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir confirmer ce paiement ?')) {
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/${paymentId}/confirm/`,
                {},
                { headers: getAuthHeaders() }
            );

            if (response.status === 200) {
                alert('✅ Paiement confirmé avec succès ! Le locataire a été notifié.');
                loadPayments();
                loadStats();
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur lors de la confirmation du paiement.');
        }
    };

    const handleRejectPayment = async (paymentId) => {
        const reason = prompt('Raison du rejet :');
        if (!reason || reason.trim() === '') {
            alert('Veuillez fournir une raison pour le rejet.');
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/${paymentId}/reject/`,
                { reason },
                { headers: getAuthHeaders() }
            );

            if (response.status === 200) {
                alert('✅ Paiement rejeté. Le locataire a été notifié.');
                loadPayments();
                loadStats();
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur lors du rejet du paiement.');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const badges = {
            completed: { 
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
                text: 'Confirmé', 
                icon: CheckCircle 
            },
            pending: { 
                color: 'bg-amber-50 text-amber-700 border-amber-200', 
                text: 'En attente', 
                icon: Clock 
            },
            failed: { 
                color: 'bg-red-50 text-red-700 border-red-200', 
                text: 'Rejeté', 
                icon: AlertCircle 
            }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border ${badge.color}`}>
                <Icon className="w-4 h-4" />
                {badge.text}
            </span>
        );
    };

    const filteredPayments = payments.filter(payment => {
        const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
        const matchesSearch = 
            payment.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.property_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Revenus & Paiements</h1>
                        <p className="text-sm text-gray-600 mt-1">Gestion de vos revenus locatifs</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="completed">Confirmés</option>
                            <option value="pending">En attente</option>
                            <option value="failed">Rejetés</option>
                        </select>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={CheckCircle}
                        iconBgColor="bg-emerald-100"
                        iconColor="text-emerald-600"
                        label="Total reçu"
                        value={formatCurrency(stats.total_received)}
                    />
                    <StatCard
                        icon={Clock}
                        iconBgColor="bg-amber-100"
                        iconColor="text-amber-600"
                        label="En attente"
                        value={formatCurrency(stats.pending_amount)}
                        badge={stats.pending_count > 0 ? stats.pending_count : null}
                    />
                    <StatCard
                        icon={CheckCircle}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                        label="Confirmés"
                        value={stats.completed_count}
                    />
                    <StatCard
                        icon={AlertCircle}
                        iconBgColor="bg-purple-100"
                        iconColor="text-purple-600"
                        label="À valider"
                        value={stats.pending_count}
                        highlight={stats.pending_count > 0}
                    />
                </div>

                {/* Liste des paiements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Paiements reçus</h2>
                                <p className="text-sm text-gray-600 mt-1">{filteredPayments.length} paiement(s)</p>
                            </div>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Exporter
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="mt-4 text-gray-600">Chargement...</p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">Aucun paiement trouvé</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Locataire</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Propriété</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mois</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Méthode</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                        {payment.tenant_name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{payment.tenant_name}</div>
                                                        <div className="text-xs text-gray-500">{payment.tenant_phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 font-medium">{payment.property_title}</div>
                                                <div className="text-xs text-gray-500">{payment.property_address}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900">{payment.payment_month}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600 capitalize">{payment.payment_method?.replace('_', ' ')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(payment.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {payment.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleConfirmPayment(payment.id)}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Confirmer"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectPayment(payment.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Rejeter"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedPayment(payment);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                                                        title="Voir détails"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Paiements en attente - Alerte */}
                {stats.pending_count > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-900">
                                    {stats.pending_count} paiement{stats.pending_count > 1 ? 's' : ''} en attente de validation
                                </h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    Validez ou rejetez les paiements reçus pour tenir vos locataires informés
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedStatus('pending')}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                            >
                                Voir les paiements
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de détails */}
            {showDetailsModal && selectedPayment && (
                <PaymentDetailsModal
                    payment={selectedPayment}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedPayment(null);
                    }}
                    formatCurrency={formatCurrency}
                    getStatusBadge={getStatusBadge}
                    onConfirm={handleConfirmPayment}
                    onReject={handleRejectPayment}
                />
            )}
        </div>
    );
}

// Composant StatCard
function StatCard({ icon: Icon, iconBgColor, iconColor, label, value, badge, highlight }) {
    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow ${
            highlight ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-100'
        }`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center relative`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                    {badge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {badge}
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}

// Composant Modal de détails (version propriétaire)
function PaymentDetailsModal({ payment, onClose, formatCurrency, getStatusBadge, onConfirm, onReject }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">Détails du paiement</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Référence</p>
                            <p className="text-base font-mono font-semibold text-gray-900">{payment.transaction_reference}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Statut</p>
                            {getStatusBadge(payment.status)}
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Locataire</h4>
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {payment.tenant_name?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{payment.tenant_name}</p>
                                <p className="text-sm text-gray-600">{payment.tenant_phone}</p>
                                <p className="text-sm text-gray-600">{payment.tenant_email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Informations de paiement</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Montant</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Mois concerné</p>
                                <p className="text-base font-medium text-gray-900">{payment.payment_month}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Méthode de paiement</p>
                                <p className="text-base font-medium text-gray-900 capitalize">{payment.payment_method?.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date de paiement</p>
                                <p className="text-base font-medium text-gray-900">
                                    {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Propriété</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium text-gray-900">{payment.property_title}</p>
                            <p className="text-sm text-gray-600 mt-1">{payment.property_address}</p>
                        </div>
                    </div>

                    {payment.notes && (
                        <div className="border-t pt-6">
                            <h4 className="font-semibold text-gray-900 mb-2">Notes du locataire</h4>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{payment.notes}</p>
                        </div>
                    )}

                    {payment.status === 'pending' && (
                        <div className="border-t pt-6 flex gap-4">
                            <button
                                onClick={() => {
                                    onReject(payment.id);
                                    onClose();
                                }}
                                className="flex-1 px-6 py-3 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Rejeter
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm(payment.id);
                                    onClose();
                                }}
                                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                Confirmer
                            </button>
                        </div>
                    )}

                    {payment.status !== 'pending' && (
                        <div className="border-t pt-6">
                            <button
                                onClick={onClose}
                                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}