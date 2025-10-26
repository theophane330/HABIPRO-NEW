"use client";
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function TableaudeBord({
    setIsModalOpen,
    setIsTenantModalOpen,
    setIsContractModalOpen,
    setIsAnnonceModalOpen,
    setIsÉvaluationIAModalOpen,
    setIsPrestatairesModalOpen,
    formatCurrency,
    properties,
    tenants,
    notifications,
    quickActions,
    handlePropertyClick,
    handleTenantClick,
    handleNotificationClick,


}) {

    const [isVisible, setIsVisible] = useState(false);

    // États pour les statistiques du dashboard
    const [dashboardStats, setDashboardStats] = useState({
        total_properties: 0,
        total_tenants: 0,
        occupation_rate: 0,
        monthly_revenue: 0
    });

    // Charger les statistiques depuis l'API
    const loadDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/dashboard/statistics/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📊 Statistiques tableau de bord:', data);
                setDashboardStats(data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    };

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
        loadDashboardStats();
    }, []);

    return (
        // {/* Content - Padding réduit */}
        // <div className="flex-1 flex p-4 gap-4 overflow-y-auto">
        <div className={`
  flex-1 flex p-4 gap-4 overflow-y-auto
  transform transition-all duration-700 ease-out
  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
`}>
            <div className="flex-1">
                {/* Dashboard Overview Cards - Plus compactes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-400"></div>
                        <div className="flex justify-between items-start mb-1">
                            <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center text-white text-sm">
                                💰
                            </div>
                            <div className="text-[8px] font-semibold px-1 py-0.5 bg-green-100 text-green-600 rounded-full flex items-center gap-1">
                                ↗ +12%
                            </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">
                            {formatCurrency ? formatCurrency(dashboardStats.monthly_revenue) : dashboardStats.monthly_revenue}
                        </div>
                        <div className="text-xs text-gray-500 font-semibold">Revenus Mensuels</div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-500"></div>
                        <div className="flex justify-between items-start mb-1">
                            <div className="w-7 h-7 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                                🏢
                            </div>
                            <div className="text-[8px] font-semibold px-1 py-0.5 bg-green-100 text-green-600 rounded-full flex items-center gap-1">
                                ↗ +1 nouveau
                            </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">{dashboardStats.total_properties}</div>
                        <div className="text-xs text-gray-500 font-semibold">Propriétés Gérées</div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <div className="flex justify-between items-start mb-1">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                                👥
                            </div>
                            <div className="text-[8px] font-semibold px-1 py-0.5 bg-green-100 text-green-600 rounded-full flex items-center gap-1">
                                ↗ {dashboardStats.occupation_rate}% occupation
                            </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">{dashboardStats.total_tenants}</div>
                        <div className="text-xs text-gray-500 font-semibold">Locataires Actifs</div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                        <div className="flex justify-between items-start mb-1">
                            <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                                🔧
                            </div>
                            <div className="text-[8px] font-semibold px-1 py-0.5 bg-red-100 text-red-600 rounded-full flex items-center gap-1">
                                ↙ 3 en cours
                            </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">5</div>
                        <div className="text-xs text-gray-500 font-semibold">Demandes Maintenance</div>
                    </div>
                </div>

                {/* Quick Actions - Plus compactes */}
                <div className="mb-4 mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <div className="text-lg font-bold text-gray-900">Actions Rapides</div>
                        <a href="#" className="text-red-500 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            Voir toutes →
                        </a>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                        {quickActions.map((action, index) => (
                            <div
                                // key={index}
                                // onClick={() => alert(`Action: ${action.label}`)}
                                key={index}
                                onClick={action.onClick || (() => alert(`Action: ${action.label}`))}
                                className="flex flex-col items-center gap-3 p-2 bg-white border-2 border-gray-100 rounded-xl cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl hover:border-red-400 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center text-white text-xl transition-transform duration-300 group-hover:scale-110`}>
                                    {action.icon}
                                </div>
                                <div className="text-xs font-bold text-gray-900 text-center">{action.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Properties Section - Plus compact */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="text-xl font-bold text-gray-900">Mes Propriétés</div>
                        <button
                            // onClick={() => setIsModalOpen(true)}
                            onClick={() => {

                                setIsModalOpen(true);

                            }
                            }
                            className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg text-sm"
                        >
                            + Ajouter Propriété
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                        {properties.map((property) => (
                            <div
                                key={property.id}
                                onClick={() => handlePropertyClick(property)}
                                className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-md border border-gray-200"
                            >
                                <div className="w-full h-28 bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white text-3xl">
                                    {property.icon}
                                </div>
                                <div className="p-4">
                                    <div className="text-base font-bold text-gray-900 mb-1">{property.title}</div>
                                    <div className="flex justify-between mb-3 text-xs text-gray-500">
                                        <span>{property.type}</span>
                                        <span>{property.size}</span>
                                    </div>
                                    <div className="text-base font-bold text-green-600 mb-2">
                                        {formatCurrency(property.rent)}/mois
                                    </div>
                                    <div className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${property.status === 'occupied'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {property.status === 'occupied' ? 'Occupé' : 'Vacant'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Plus compact */}
            <div className="w-72 flex flex-col gap-4">
                {/* Revenue Analysis - Plus compact */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold text-gray-900">Analyse des Revenus</div>
                        <div className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-red-500 hover:text-white text-sm">
                            📊
                        </div>
                    </div>

                    <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs mb-4 text-center">
                        📈 Graphique des revenus mensuels
                        <br />
                        <small>Intégration prochaine avec Chart.js</small>
                    </div>

                    <div className="flex justify-between">
                        <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">2.45M</div>
                            <div className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Ce mois</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">2.18M</div>
                            <div className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Mois dernier</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">+12%</div>
                            <div className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Croissance</div>
                        </div>
                    </div>
                </div>

                {/* Active Tenants - Plus compact */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold text-gray-900">Locataires Actifs</div>
                        <div className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-red-500 hover:text-white text-sm">
                            👥
                        </div>
                    </div>

                    <div className="space-y-0">
                        {tenants.map((tenant) => (
                            <div
                                key={tenant.id}
                                onClick={() => handleTenantClick(tenant)}
                                className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-b-0 cursor-pointer transition-all duration-300 hover:bg-blue-50 hover:-mx-4 hover:px-4 hover:rounded-lg"
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    {tenant.initials}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-gray-900 mb-0.5">{tenant.name}</div>
                                    <div className="text-xs text-gray-500 mb-1">{tenant.property}</div>
                                    <div className="text-xs font-semibold text-green-600">{formatCurrency(tenant.rent)}/mois</div>
                                </div>
                                <div className={`text-[9px] px-1.5 py-0.5 rounded-lg font-semibold uppercase ${tenant.status === 'active'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {tenant.status === 'active' ? 'Actif' : 'En retard'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications - Plus compact */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold text-gray-900">Notifications & Alertes</div>
                        <div className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-red-500 hover:text-white text-sm">
                            🔔
                        </div>
                    </div>

                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-50 hover:transform hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className={`w-8 h-8 bg-gradient-to-br ${notification.gradient} rounded-lg flex items-center justify-center text-white text-sm`}>
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