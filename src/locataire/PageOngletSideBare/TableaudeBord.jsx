"use client";
import React, { useState, useEffect } from 'react';
import PaymentModal from "../ActionsRapides/PaymentModal";

export default function TableauBordLocataire({
    setIsPaymentModalOpen,
    setIsMaintenanceModalOpen,
    setIsMessageModalOpen,
    formatCurrency,
    quickActions,
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    // Données du locataire
    const tenantData = {
        name: "Konan Patrick",
        property: "Résidence Les Palmiers",
        address: "Cocody, Abidjan",
        rentAmount: 350000,
        paymentStatus: "À jour",
        nextPaymentDate: "2025-11-05",
        totalDue: 0,
        contractEndDate: "2026-10-31",
        contractStatus: "Actif"
    };

    const recentPayments = [
        {
            id: 1,
            date: "2025-10-01",
            amount: 350000,
            status: "Payé",
            method: "Mobile Money"
        },
        {
            id: 2,
            date: "2025-09-01",
            amount: 350000,
            status: "Payé",
            method: "Virement"
        },
        {
            id: 3,
            date: "2025-08-01",
            amount: 350000,
            status: "Payé",
            method: "Carte bancaire"
        }
    ];

    const maintenanceRequests = [
        {
            id: 1,
            type: "Plomberie",
            description: "Fuite robinet cuisine",
            date: "2025-10-10",
            status: "Résolu",
            priority: "Normal"
        },
        {
            id: 2,
            type: "Électricité",
            description: "Prise murale défectueuse",
            date: "2025-10-12",
            status: "En cours",
            priority: "Normal"
        },
        {
            id: 3,
            type: "Sécurité",
            description: "Serrure porte entrée",
            date: "2025-10-14",
            status: "Ouvert",
            priority: "Urgente"
        }
    ];

    const recentMessages = [
        {
            id: 1,
            from: "Propriétaire",
            subject: "Visite de maintenance",
            date: "2025-10-12",
            unread: true,
            gradient: "from-red-400 to-orange-500",
            icon: "👤"
        },
        {
            id: 2,
            from: "Support HABIPRO",
            subject: "Confirmation de paiement",
            date: "2025-10-09",
            unread: false,
            gradient: "from-blue-400 to-indigo-500",
            icon: "❓"
        },
        {
            id: 3,
            from: "Prestataire",
            subject: "Rendez-vous plomberie",
            date: "2025-10-11",
            unread: false,
            gradient: "from-green-400 to-teal-400",
            icon: "🛠️"
        }
    ];

    const notifications = [
        {
            id: 1,
            title: "Paiement enregistré",
            text: "Votre loyer d'octobre a été confirmé",
            time: "Il y a 2 jours",
            gradient: "from-green-400 to-teal-400",
            icon: "✓"
        },
        {
            id: 2,
            title: "Demande en cours",
            text: "Votre demande de réparation sera traitée",
            time: "Il y a 1 jour",
            gradient: "from-yellow-400 to-orange-500",
            icon: "🔧"
        },
        {
            id: 3,
            title: "Message du propriétaire",
            text: "Vous avez reçu un nouveau message",
            time: "Aujourd'hui",
            gradient: "from-blue-400 to-blue-600",
            icon: "💬"
        }
    ];

    return (
        <div className={`
            flex-1 flex p-4 gap-4 overflow-y-auto
            transform transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
            <div className="flex-1">
                {/* Dashboard Overview Cards - Données du locataire */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                        <div className="flex justify-between items-start mb-1">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm">
                                💰
                            </div>
                            <div className="text-[8px] font-semibold px-1 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                                Mensuel
                            </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">{formatCurrency(tenantData.rentAmount)}</div>
                        <div className="text-xs text-gray-500 font-semibold">Loyer</div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-400"></div>
                        <div className="flex justify-between items-start mb-1">
                            <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center text-white text-sm">
                                ✓
                            </div>
                            <div className="text-[8px] font-semibold px-1 py-0.5 bg-green-100 text-green-600 rounded-full">
                                À jour
                            </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">0 XOF</div>
                        <div className="text-xs text-gray-500 font-semibold">Solde dû</div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-500"></div>
                        <div className="flex justify-between items-start mb-1">
                            <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                                📅
                            </div>
                            <div className="text-[8px] font-semibold px-1 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                                6 mois
                            </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">{tenantData.nextPaymentDate}</div>
                        <div className="text-xs text-gray-500 font-semibold">Prochain paiement</div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                        <div className="flex justify-between items-start mb-1">
                            <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm">
                                📄
                            </div>
                            <div className="text-[8px] font-semibold px-1 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                                {tenantData.contractStatus}
                            </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">jusqu'au 31/10</div>
                        <div className="text-xs text-gray-500 font-semibold">Contrat</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-4 mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <div className="text-lg font-bold text-gray-900">Actions Rapides</div>
                        <a href="#" className="text-blue-500 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                            Voir toutes →
                        </a>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                        {quickActions.slice(0, 6).map((action, index) => (
                            <div
                                key={index}
                                onClick={action.onClick || (() => {})}
                                className="flex flex-col items-center gap-3 p-2 bg-white border-2 border-gray-100 rounded-xl cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl hover:border-blue-400 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center text-white text-xl transition-transform duration-300 group-hover:scale-110`}>
                                    {action.icon}
                                </div>
                                <div className="text-xs font-bold text-gray-900 text-center">{action.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Property Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
                    <div className="p-4 border-b border-gray-200">
                        <div className="text-xl font-bold text-gray-900 mb-3">Mon Logement</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 font-semibold mb-1">Propriété</div>
                                <div className="text-lg font-bold text-gray-900">{tenantData.property}</div>
                                <div className="text-sm text-gray-600">{tenantData.address}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 font-semibold mb-1">Statut du contrat</div>
                                <div className="text-lg font-bold text-green-600">✓ {tenantData.contractStatus}</div>
                                <div className="text-sm text-gray-600">Jusqu'au {tenantData.contractEndDate}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 font-semibold mb-1">Statut paiement</div>
                                <div className="text-lg font-bold text-green-600">✓ {tenantData.paymentStatus}</div>
                                <div className="text-sm text-gray-600">Aucune dette</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="text-xl font-bold text-gray-900">Paiements Récents</div>
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="bg-gradient-to-r from-green-400 to-teal-400 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg text-sm"
                        >
                            + Payer Loyer
                        </button>
                    </div>

                    <div className="space-y-3 p-4">
                        {recentPayments.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-blue-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center text-white font-bold">
                                        ✓
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{payment.date}</div>
                                        <div className="text-xs text-gray-500">{payment.method}</div>
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-72 flex flex-col gap-4">
                {/* Maintenance Requests */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold text-gray-900">Demandes Maintenance</div>
                        <div
                            onClick={() => setIsMaintenanceModalOpen(true)}
                            className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-orange-500 hover:text-white text-sm"
                        >
                            🔧
                        </div>
                    </div>

                    <div className="space-y-3">
                        {maintenanceRequests.map((request) => (
                            <div
                                key={request.id}
                                className="p-3 bg-gray-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-orange-50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-sm text-gray-900">{request.type}</div>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-lg font-semibold uppercase ${
                                        request.status === 'Résolu' ? 'bg-green-100 text-green-600' :
                                        request.status === 'En cours' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-red-100 text-red-600'
                                    }`}>
                                        {request.status}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 mb-2">{request.description}</div>
                                <div className="text-[10px] text-gray-500">{request.date}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Messages */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold text-gray-900">Messages Récents</div>
                        <div
                            onClick={() => setIsMessageModalOpen(true)}
                            className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white text-sm"
                        >
                            💬
                        </div>
                    </div>

                    <div className="space-y-3">
                        {recentMessages.map((message) => (
                            <div
                                key={message.id}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-50"
                            >
                                <div className={`w-8 h-8 bg-gradient-to-br ${message.gradient} rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0`}>
                                    {message.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-sm font-bold text-gray-900">{message.from}</div>
                                        {message.unread && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600 truncate">{message.subject}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">{message.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications & Alerts */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold text-gray-900">Notifications</div>
                        <div className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-sm">
                            🔔
                        </div>
                    </div>

                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className={`w-8 h-8 bg-gradient-to-br ${notification.gradient} rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0`}>
                                    {notification.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-gray-900 mb-0.5">{notification.title}</div>
                                    <div className="text-xs text-gray-600 mb-1">{notification.text}</div>
                                    <div className="text-[10px] text-gray-500 font-semibold">{notification.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}