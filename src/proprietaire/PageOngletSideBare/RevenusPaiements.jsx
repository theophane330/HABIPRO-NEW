"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Download, CheckCircle, Eye, MoreVertical } from 'lucide-react';

export default function RevenusPaiements() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('mois');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Données simulées pour les paiements
    const paiements = [
        {
            id: 1,
            tenant: 'Kader Adeniran',
            property: 'Appartement Cocody Riviera',
            amount: 280000,
            dueDate: '2024-02-01',
            paymentDate: '2024-01-28',
            status: 'paid',
            method: 'Virement bancaire',
            late: false
        },
        {
            id: 2,
            tenant: 'Marie Koné',
            property: 'Villa Angré',
            amount: 450000,
            dueDate: '2024-02-01',
            paymentDate: '2024-02-01',
            status: 'paid',
            method: 'Chèque',
            late: false
        },
        {
            id: 3,
            tenant: 'Jean Soro',
            property: 'Duplex Marcory',
            amount: 320000,
            dueDate: '2024-02-01',
            paymentDate: null,
            status: 'overdue',
            method: null,
            late: true,
            daysLate: 7
        },
        {
            id: 4,
            tenant: 'Aminata Bamba',
            property: 'Appartement Yopougon',
            amount: 180000,
            dueDate: '2024-02-01',
            paymentDate: null,
            status: 'pending',
            method: null,
            late: false
        },
        {
            id: 5,
            tenant: 'Ibrahim Ouattara',
            property: 'Studio Plateau Centre',
            amount: 120000,
            dueDate: '2024-01-01',
            paymentDate: '2024-01-15',
            status: 'paid',
            method: 'Espèces',
            late: true,
            daysLate: 14
        }
    ];

    // Calculs des statistiques
    const totalReceived = paiements.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = paiements.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = paiements.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
    const totalExpected = paiements.reduce((sum, p) => sum + p.amount, 0);

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid': return 'Payé';
            case 'pending': return 'En attente';
            case 'overdue': return 'En retard';
            default: return 'Inconnu';
        }
    };

    const filteredPaiements = paiements.filter(paiement => {
        if (selectedStatus !== 'all' && paiement.status !== selectedStatus) return false;
        return true;
    });

    return (
        // <div className={`min-h-screen bg-gray-50 p-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`
            min-h-screen bg-gradient-to-br p-6 from-slate-50 via-white to-slate-50
            transform transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Revenus & Paiements</h1>
                        <p className="mt-1 text-sm text-gray-600">Gestion de vos revenus locatifs et suivi des paiements</p>
                    </div>
                    <div className="flex gap-3 mt-4 sm:mt-0">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="mois">Ce mois</option>
                            <option value="trimestre">Ce trimestre</option>
                            <option value="annee">Cette année</option>
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="paid">Payé</option>
                            <option value="pending">En attente</option>
                            <option value="overdue">En retard</option>
                        </select>
                    </div>
                </div>

                {/* Cartes statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Revenus encaissés</p>
                                    <p className="text-base font-bold text-gray-900">{formatCurrency(totalReceived)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">En attente</p>
                                    <p className="text-base font-bold text-gray-900">{formatCurrency(totalPending)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">En retard</p>
                                    <p className="text-base font-bold text-gray-900">{formatCurrency(totalOverdue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total attendu</p>
                                    <p className="text-base font-bold text-gray-900">{formatCurrency(totalExpected)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Section principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Graphique placeholder */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-semibold text-gray-900">Évolution des revenus</h2>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium">
                                        Mensuel
                                    </button>
                                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                        Annuel
                                    </button>
                                </div>
                            </div>
                            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 11V3H8v6H2v12h20V11h-6zM10 5h4v14h-4V5zm-6 8h4v6H4v-6zm16 6h-4v-8h4v8z" />
                                    </svg>
                                    <p className="text-xs">Graphique des revenus</p>
                                </div>
                            </div>
                        </div>

                        {/* Table des paiements */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900">Paiements récents</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">{filteredPaiements.length} paiement(s)</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
                                            <Plus className="w-3.5 h-3.5" />
                                            Nouveau paiement
                                        </button>
                                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                                            <Download className="w-3.5 h-3.5" />
                                            Exporter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    {/* Entete tableau */}
                                    <thead className="bg-white border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Locataire</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Propriété</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Échéance</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredPaiements.map((paiement) => (
                                            <tr key={paiement.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                            {paiement.tenant.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="text-xs font-medium text-gray-900">{paiement.tenant}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-600">{paiement.property}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-semibold text-gray-900">{formatCurrency(paiement.amount)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-900">
                                                        {new Date(paiement.dueDate).toLocaleDateString('fr-FR')}
                                                    </div>
                                                    {paiement.late && paiement.daysLate && (
                                                        <div className="text-xs text-red-600 font-medium mt-0.5">
                                                            +{paiement.daysLate} jours
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md ${getStatusColor(paiement.status)}`}>
                                                        {getStatusText(paiement.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Voir détails">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Options">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions rapides */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Actions rapides</h3>
                            <div className="space-y-3">
                                <button className="w-full text-sm flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nouveau paiement
                                </button>
                                <button className="w-full text-sm flex items-center gap-3 p-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Envoyer rappel
                                </button>
                                <button className="w-full text-sm flex items-center gap-3 p-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Générer rapport
                                </button>
                            </div>
                        </div>

                        {/* Alertes */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Alertes</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-medium text-red-800">1 paiement en retard</span>
                                    </div>
                                    <p className="text-xs text-red-700">Jean Soro - 7 jours</p>
                                </div>
                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-medium text-amber-800">1 échéance proche</span>
                                    </div>
                                    <p className="text-xs text-amber-700">Aminata Bamba - 3 jours</p>
                                </div>
                            </div>
                        </div>

                        {/* Statistiques */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Statistiques</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Taux de collection</span>
                                        <span className="text-sm font-semibold text-emerald-600">92%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Retard moyen</span>
                                        <span className="text-sm font-semibold text-gray-900">2.3 jours</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Méthode préférée</span>
                                        <span className="text-sm font-semibold text-gray-900">Virement</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}