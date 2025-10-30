"use client";
import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, Plus, Eye, X, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export default function TenantPaiements() {
    const [isVisible, setIsVisible] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total_paid: 0,
        pending_amount: 0,
        completed_count: 0,
        pending_count: 0
    });

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
        loadContracts();
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

    const loadContracts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/contracts/`, {
                headers: getAuthHeaders()
            });
            
            // ✅ Vérifier si la réponse est un tableau ou un objet avec 'results'
            const data = Array.isArray(response.data) ? response.data : response.data.results || [];
            console.log('Contracts loaded:', data);
            setContracts(data);
        } catch (error) {
            console.error('Erreur lors du chargement des contrats:', error);
            setContracts([]);
        }
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
                total_paid: 0,
                pending_amount: 0,
                completed_count: 0,
                pending_count: 0
            });
        }
    };

    const handlePayment = async (paymentData) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/payments/`, paymentData, {
                headers: getAuthHeaders()
            });

            if (response.status === 201) {
                alert('✅ Paiement effectué avec succès ! Le propriétaire recevra une notification.');
                setShowPaymentModal(false);
                loadPayments();
                loadStats();
            }
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response?.data) {
                const errors = error.response.data;
                let errorMessage = 'Erreur lors du paiement:\n';
                Object.keys(errors).forEach(key => {
                    errorMessage += `${key}: ${errors[key]}\n`;
                });
                alert(errorMessage);
            } else {
                alert('❌ Erreur lors du paiement. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
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

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes Paiements</h1>
                        <p className="text-sm text-gray-600 mt-1">Gérez vos paiements de loyer en toute simplicité</p>
                    </div>
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                        Effectuer un paiement
                    </button>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={CheckCircle}
                        iconBgColor="bg-emerald-100"
                        iconColor="text-emerald-600"
                        label="Total payé"
                        value={formatCurrency(stats.total_paid)}
                    />
                    <StatCard
                        icon={Clock}
                        iconBgColor="bg-amber-100"
                        iconColor="text-amber-600"
                        label="En attente"
                        value={formatCurrency(stats.pending_amount)}
                    />
                    <StatCard
                        icon={CreditCard}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                        label="Paiements confirmés"
                        value={stats.completed_count}
                    />
                    <StatCard
                        icon={AlertCircle}
                        iconBgColor="bg-purple-100"
                        iconColor="text-purple-600"
                        label="En attente validation"
                        value={stats.pending_count}
                    />
                </div>

                {/* Historique des paiements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Historique des paiements</h2>
                                <p className="text-sm text-gray-600 mt-1">{payments.length} paiement(s)</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="mt-4 text-gray-600">Chargement...</p>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-12 text-center">
                            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">Aucun paiement effectué pour le moment</p>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Effectuer votre premier paiement
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Référence</th>
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
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-gray-900 font-semibold">{payment.transaction_reference}</span>
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
                                                <button 
                                                    onClick={() => handleViewDetails(payment)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de paiement */}
            {showPaymentModal && (
                <PaymentModal
                    contracts={contracts}
                    onClose={() => setShowPaymentModal(false)}
                    onSubmit={handlePayment}
                    loading={loading}
                />
            )}

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
                />
            )}
        </div>
    );
}

// Composant StatCard
function StatCard({ icon: Icon, iconBgColor, iconColor, label, value }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}

// Composant Modal pour effectuer un paiement
function PaymentModal({ contracts, onClose, onSubmit, loading }) {
    const [formData, setFormData] = useState({
        contract: '',
        amount: '',
        payment_month: '',
        payment_method: '',
        notes: ''
    });

    const paymentMethods = [
        { value: 'orange_money', label: 'Orange Money', icon: '🟠' },
        { value: 'mtn_money', label: 'MTN Money', icon: '🟡' },
        { value: 'moov_money', label: 'Moov Money', icon: '🔵' },
        { value: 'wave', label: 'Wave', icon: '💙' },
        { value: 'carte_bancaire', label: 'Carte Bancaire', icon: '💳' },
        { value: 'virement', label: 'Virement Bancaire', icon: '🏦' },
        { value: 'especes', label: 'Espèces', icon: '💵' },
    ];

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const currentYear = new Date().getFullYear();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleContractChange = (contractId) => {
        setFormData({ ...formData, contract: contractId });
        const selectedContract = contracts.find(c => c.id === parseInt(contractId));
        if (selectedContract) {
            setFormData(prev => ({
                ...prev,
                contract: contractId,
                amount: selectedContract.amount
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Effectuer un paiement</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Sélection du contrat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <CreditCard className="w-4 h-4 inline mr-2" />
                            Contrat
                        </label>
                        <select
                            required
                            value={formData.contract}
                            onChange={(e) => handleContractChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Sélectionner un contrat</option>
                            {contracts.map(contract => (
                                <option key={contract.id} value={contract.id}>
                                    {contract.property_title} - {contract.amount} FCFA/mois
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Montant */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-2" />
                                Montant (FCFA)
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="280000"
                            />
                        </div>

                        {/* Mois concerné */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Mois concerné
                            </label>
                            <select
                                required
                                value={formData.payment_month}
                                onChange={(e) => setFormData({ ...formData, payment_month: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Sélectionner un mois</option>
                                {months.map(month => (
                                    <option key={month} value={`${month} ${currentYear}`}>
                                        {month} {currentYear}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Méthode de paiement */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Méthode de paiement
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {paymentMethods.map(method => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payment_method: method.value })}
                                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                                        formData.payment_method === method.value
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{method.icon}</span>
                                        <span className="text-sm font-medium">{method.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optionnel)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows="3"
                            placeholder="Ajouter des notes..."
                        />
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Confirmer le paiement
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Composant Modal de détails du paiement
function PaymentDetailsModal({ payment, onClose, formatCurrency, getStatusBadge }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
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
                                        year: 'numeric'
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
                            <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                            <p className="text-gray-700">{payment.notes}</p>
                        </div>
                    )}

                    <div className="border-t pt-6">
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}