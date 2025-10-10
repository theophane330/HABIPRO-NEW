import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Eye, Trash2, Filter, TrendingUp, BarChart3, Target, Zap, Clock, MapPin, Users, MousePointer, Share2, Bell, Sparkles, Calendar, DollarSign, Activity, PieChart } from 'lucide-react';

const MarketingIAPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterBien, setFilterBien] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'table' ou 'analytics'

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);


    const [campaigns, setCampaigns] = useState([
        {
            id: 1,
            name: 'Campagne Villa Cocody',
            property: 'Villa Cocody',
            type: 'Facebook / Google Ads',
            reach: 12500,
            budget: 50000,
            spent: 45000,
            status: 'active',
            date: '01/09/2025',
            views: 12500,
            clicks: 850,
            conversions: 32,
            engagement: 6.8,
            duration: '30 jours'
        },
        {
            id: 2,
            name: 'Studio Yopougon Promo',
            property: 'Studio Yopougon',
            type: 'Instagram / WhatsApp',
            reach: 6200,
            budget: 20000,
            spent: 5000,
            status: 'pending',
            date: '28/08/2025',
            views: 0,
            clicks: 0,
            conversions: 0,
            engagement: 0,
            duration: '15 jours'
        },
        {
            id: 3,
            name: 'Immeuble Plateau Luxe',
            property: 'Immeuble Plateau',
            type: 'Campagne Premium',
            reach: 25000,
            budget: 120000,
            spent: 120000,
            status: 'completed',
            date: '10/08/2025',
            views: 28500,
            clicks: 1850,
            conversions: 78,
            engagement: 6.5,
            duration: '45 jours'
        },
        {
            id: 4,
            name: 'Duplex Marcory Exclusive',
            property: 'Duplex Marcory',
            type: 'Facebook / Instagram',
            reach: 8900,
            budget: 35000,
            spent: 32000,
            status: 'active',
            date: '05/09/2025',
            views: 9200,
            clicks: 620,
            conversions: 25,
            engagement: 6.7,
            duration: '20 jours'
        }
    ]);

    const statusConfig = {
        active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: '✅' },
        pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
        completed: { label: 'Terminée', color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const aiRecommendations = [
        {
            icon: '🕐',
            title: 'Meilleur horaire de publication',
            message: 'Publier entre 18h et 20h pour un engagement maximal (+42%)',
            priority: 'high'
        },
        {
            icon: '📍',
            title: 'Zone géographique',
            message: 'Augmenter le budget sur Cocody et Marcory (+25% de conversions)',
            priority: 'medium'
        },
        {
            icon: '💰',
            title: 'Optimisation budget',
            message: 'Réduire les dépenses sur Instagram (-15%) et augmenter sur Google Ads',
            priority: 'medium'
        },
        {
            icon: '🎯',
            title: 'Audience recommandée',
            message: 'Cibler les 30-45 ans avec revenus > 500k FCFA/mois',
            priority: 'high'
        }
    ];

    const channelPerformance = [
        { name: 'Facebook', views: 18500, clicks: 1200, conversions: 45, color: 'bg-blue-500' },
        { name: 'Instagram', views: 12300, clicks: 850, conversions: 28, color: 'bg-pink-500' },
        { name: 'Google Ads', views: 9800, clicks: 680, conversions: 38, color: 'bg-red-500' },
        { name: 'WhatsApp', views: 6700, clicks: 420, conversions: 12, color: 'bg-green-500' }
    ];

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.property.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
        const matchesBien = filterBien === 'all' || campaign.property === filterBien;

        return matchesSearch && matchesStatus && matchesBien;
    });

    const handleSelectCampaign = (id) => {
        setSelectedCampaigns(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedCampaigns.length === filteredCampaigns.length) {
            setSelectedCampaigns([]);
        } else {
            setSelectedCampaigns(filteredCampaigns.map(c => c.id));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
            setCampaigns(prev => prev.filter(c => c.id !== id));
        }
    };

    const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const avgEngagement = campaigns.length > 0
        ? (campaigns.reduce((sum, c) => sum + c.engagement, 0) / campaigns.length).toFixed(1)
        : 0;

    return (
        // <div className="min-h-screen bg-gray-50 p-6">
         <div className={`
            min-h-screen bg-gradient-to-br p-6 from-slate-50 via-white to-slate-50
            transform transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-800">🎯 Marketing IA PRO</h1>
                            <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                ✨ PREMIUM
                            </span>
                        </div>
                        <p className="text-gray-600">Optimisez la visibilité de vos biens grâce à l'intelligence artificielle</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105">
                            <Zap size={20} />
                            Nouvelle campagne IA
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105">
                            <BarChart3 size={20} />
                            Analyser performances
                        </button>
                    </div>
                </div>

                {/* Statistiques globales */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm">Campagnes</p>
                            <Target className="text-blue-500" size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{campaigns.length}</p>
                        <p className="text-xs text-green-600 mt-1">↗ +2 ce mois</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm">Vues Totales</p>
                            <Eye className="text-purple-500" size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{totalViews.toLocaleString()}</p>
                        <p className="text-xs text-green-600 mt-1">↗ +18% vs mois dernier</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm">Clics</p>
                            <MousePointer className="text-orange-500" size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{totalClicks.toLocaleString()}</p>
                        <p className="text-xs text-green-600 mt-1">↗ +22% vs mois dernier</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm">Conversions</p>
                            <TrendingUp className="text-green-500" size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{totalConversions}</p>
                        <p className="text-xs text-green-600 mt-1">↗ +15% vs mois dernier</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm">Engagement</p>
                            <Activity className="text-yellow-500" size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{avgEngagement}%</p>
                        <p className="text-xs text-green-600 mt-1">↗ +0.8% vs mois dernier</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm">Budget Dépensé</p>
                            <DollarSign className="text-red-500" size={24} />
                        </div>
                        <p className="text-xl font-bold text-gray-800">{(totalSpent / 1000).toFixed(0)}k</p>
                        <p className="text-xs text-gray-500 mt-1">sur {(totalBudget / 1000).toFixed(0)}k FCFA</p>
                    </div>
                </div>

                {/* Recommandations IA */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-purple-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">🧠 Recommandations IA en temps réel</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiRecommendations.map((rec, index) => (
                            <div key={index} className={`bg-white rounded-lg p-4 border-l-4 ${rec.priority === 'high' ? 'border-red-500' : 'border-yellow-500'
                                } hover:shadow-lg transition-shadow`}>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{rec.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 mb-1">{rec.title}</h3>
                                        <p className="text-sm text-gray-600">{rec.message}</p>
                                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${rec.priority === 'high'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {rec.priority === 'high' ? '🔥 Priorité haute' : '⚡ Priorité moyenne'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Barre d'actions */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex gap-3 flex-1">
                            {/* Recherche */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Rechercher une campagne..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Bouton Filtres */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2 border rounded-md flex items-center gap-2 transition-colors ${showFilters ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter size={20} />
                                Filtres
                            </button>
                        </div>

                        <div className="flex gap-3">
                            {/* Sélection multiple actions */}
                            {selectedCampaigns.length > 0 && (
                                <button
                                    onClick={() => { }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    Supprimer ({selectedCampaigns.length})
                                </button>
                            )}

                            {/* Export */}
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                                <Download size={20} />
                                Exporter rapport
                            </button>

                            {/* Mode d'affichage */}
                            <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-2 ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
                                >
                                    📊 Tableau
                                </button>
                                <button
                                    onClick={() => setViewMode('analytics')}
                                    className={`px-3 py-2 ${viewMode === 'analytics' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
                                >
                                    📈 Analytics
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Panneau de filtres */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="active">Active</option>
                                    <option value="pending">En attente</option>
                                    <option value="completed">Terminée</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bien immobilier</label>
                                <select
                                    value={filterBien}
                                    onChange={(e) => setFilterBien(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="all">Tous les biens</option>
                                    <option value="Villa Cocody">Villa Cocody</option>
                                    <option value="Studio Yopougon">Studio Yopougon</option>
                                    <option value="Immeuble Plateau">Immeuble Plateau</option>
                                    <option value="Duplex Marcory">Duplex Marcory</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="all">Tous les budgets</option>
                                    <option value="low">Moins de 50k FCFA</option>
                                    <option value="medium">50k - 100k FCFA</option>
                                    <option value="high">Plus de 100k FCFA</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenu principal */}
            {viewMode === 'table' ? (
                /* Vue Tableau */
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Campagne</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bien concerné</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Portée</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Budget</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Performance</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedCampaigns.includes(campaign.id)}
                                                onChange={() => handleSelectCampaign(campaign.id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">{campaign.name}</div>
                                            <div className="text-xs text-gray-500">📅 {campaign.date}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{campaign.property}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {campaign.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">{campaign.reach.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">vues estimées</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">{campaign.budget.toLocaleString()} F</div>
                                            <div className="text-xs text-gray-500">Dépensé: {campaign.spent.toLocaleString()} F</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs space-y-1">
                                                <div>👁️ {campaign.views.toLocaleString()} vues</div>
                                                <div>👆 {campaign.clicks} clics</div>
                                                <div>✅ {campaign.conversions} conversions</div>
                                                <div className="font-semibold text-purple-600">📊 {campaign.engagement}% engagement</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[campaign.status].color}`}>
                                                {statusConfig[campaign.status].icon} {statusConfig[campaign.status].label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Voir détails">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="text-purple-600 hover:bg-purple-50 p-1 rounded" title="Analytics">
                                                    <BarChart3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(campaign.id)}
                                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Vue Analytics */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance par canal */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <PieChart className="text-purple-600" size={20} />
                            Performance par Canal
                        </h3>
                        <div className="space-y-4">
                            {channelPerformance.map((channel, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700">{channel.name}</span>
                                        <span className="text-sm text-gray-600">{channel.views.toLocaleString()} vues</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`${channel.color} h-2 rounded-full`}
                                            style={{ width: `${(channel.views / 47300) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>👆 {channel.clicks} clics</span>
                                        <span>✅ {channel.conversions} conversions</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Évolution des performances */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="text-green-600" size={20} />
                            Évolution Mensuelle
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Taux de conversion</p>
                                    <p className="text-2xl font-bold text-green-600">2.8%</p>
                                </div>
                                <div className="text-green-600 text-3xl">📈</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Coût par clic</p>
                                    <p className="text-2xl font-bold text-blue-600">185 F</p>
                                </div>
                                <div className="text-blue-600 text-3xl">💰</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">ROI Moyen</p>
                                    <p className="text-2xl font-bold text-purple-600">340%</p>
                                </div>
                                <div className="text-purple-600 text-3xl">🎯</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Meilleure heure</p>
                                    <p className="text-2xl font-bold text-orange-600">18h-20h</p>
                                </div>
                                <div className="text-orange-600 text-3xl">🕐</div>
                            </div>
                        </div>
                    </div>

                    {/* Répartition géographique */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin className="text-red-600" size={20} />
                            Répartition Géographique
                        </h3>
                        <div className="space-y-3">
                            {[
                                { zone: 'Cocody', traffic: 45, conversions: 18, color: 'bg-red-500' },
                                { zone: 'Marcory', traffic: 28, conversions: 12, color: 'bg-orange-500' },
                                { zone: 'Plateau', traffic: 18, conversions: 8, color: 'bg-yellow-500' },
                                { zone: 'Yopougon', traffic: 9, conversions: 3, color: 'bg-green-500' }
                            ].map((zone, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-gray-700">📍 {zone.zone}</span>
                                        <span className="text-sm text-gray-600">{zone.traffic}% du trafic</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`${zone.color} h-2 rounded-full`}
                                            style={{ width: `${zone.traffic}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">✅ {zone.conversions} conversions</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Campagnes les plus performantes */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Sparkles className="text-yellow-600" size={20} />
                            Top Campagnes
                        </h3>
                        <div className="space-y-3">
                            {campaigns
                                .sort((a, b) => b.conversions - a.conversions)
                                .slice(0, 3)
                                .map((campaign, index) => (
                                    <div key={campaign.id} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800">{campaign.name}</h4>
                                                <div className="flex gap-4 text-xs text-gray-600 mt-1">
                                                    <span>👁️ {campaign.views.toLocaleString()}</span>
                                                    <span>👆 {campaign.clicks}</span>
                                                    <span className="text-green-600 font-semibold">✅ {campaign.conversions}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-purple-600">{campaign.engagement}%</div>
                                                <div className="text-xs text-gray-500">engagement</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Notifications et alertes */}
                    <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Bell className="text-orange-600" size={20} />
                            Notifications & Alertes IA
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <h4 className="font-semibold text-red-800">Campagne bientôt terminée</h4>
                                        <p className="text-sm text-red-700 mt-1">
                                            La campagne "Villa Cocody" se termine dans 3 jours. Pensez à renouveler pour maintenir la visibilité.
                                        </p>
                                        <button className="mt-2 text-sm text-red-800 font-semibold hover:underline">
                                            Renouveler maintenant →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">🎉</span>
                                    <div>
                                        <h4 className="font-semibold text-green-800">Performance exceptionnelle</h4>
                                        <p className="text-sm text-green-700 mt-1">
                                            La campagne "Duplex Marcory" a dépassé les objectifs de +45% ! Envisagez d'augmenter le budget.
                                        </p>
                                        <button className="mt-2 text-sm text-green-800 font-semibold hover:underline">
                                            Voir les détails →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">💡</span>
                                    <div>
                                        <h4 className="font-semibold text-blue-800">Suggestion d'optimisation</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            L'IA suggère de réduire les dépenses Instagram (-20%) et d'augmenter Google Ads pour "Studio Yopougon".
                                        </p>
                                        <button className="mt-2 text-sm text-blue-800 font-semibold hover:underline">
                                            Appliquer la suggestion →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">📊</span>
                                    <div>
                                        <h4 className="font-semibold text-yellow-800">Nouveau rapport disponible</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Le rapport analytique mensuel est prêt. Découvrez les insights détaillés de toutes vos campagnes.
                                        </p>
                                        <button className="mt-2 text-sm text-yellow-800 font-semibold hover:underline">
                                            Télécharger le rapport →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Générateur de contenu IA */}
                    <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg shadow-md p-6 lg:col-span-2 border-2 border-purple-300">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Sparkles className="text-purple-600" size={20} />
                            🤖 Générateur de Contenu IA
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Laissez l'IA créer des textes publicitaires optimisés pour vos campagnes. Titres accrocheurs, descriptions engageantes et hashtags pertinents en quelques secondes !
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                                <h4 className="font-semibold text-gray-800 mb-2">📝 Titre généré</h4>
                                <p className="text-sm text-gray-700 italic">
                                    "🏠 Villa d'exception à Cocody - Luxe et confort réunis pour votre famille !"
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                                <h4 className="font-semibold text-gray-800 mb-2">📄 Description optimisée</h4>
                                <p className="text-sm text-gray-700 italic">
                                    "Découvrez cette magnifique villa de 5 pièces dans le quartier prestigieux de Cocody..."
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                                <h4 className="font-semibold text-gray-800 mb-2">#️⃣ Hashtags suggérés</h4>
                                <p className="text-sm text-gray-700">
                                    #VillaCocody #ImmobilierAbidjan #LuxuryHome #CoteDivoire #Investissement
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all">
                                <Zap size={20} />
                                Générer nouveau contenu
                            </button>
                            <button className="px-6 bg-white hover:bg-gray-50 text-purple-600 py-3 rounded-lg font-semibold border-2 border-purple-300 transition-all">
                                Copier le contenu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {filteredCampaigns.length === 0 && viewMode === 'table' && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-gray-500 text-lg">Aucune campagne trouvée</p>
                    <p className="text-gray-400 text-sm mt-2">Créez votre première campagne marketing IA pour commencer</p>
                    <button className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold">
                        Créer une campagne
                    </button>
                </div>
            )}
        </div>
    );
};

export default MarketingIAPage;