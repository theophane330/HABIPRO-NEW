import React, { useState, useEffect } from 'react';
import { Search, Edit, Phone, FileText, Clock, Calendar, AlertCircle, CheckCircle, MapPin, CreditCard, X, Plus, Download, Bell, User, Building, TrendingUp } from 'lucide-react';
import { LayoutGrid, List } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function Tenants({
    setIsTenantModalOpen,
    formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA',
    onRefreshNeeded
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [propertyFilter, setPropertyFilter] = useState('all');
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    const [loading, setLoading] = useState(true);

    // Images d'avatars africains réalistes
    const africanAvatars = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1494790108755-2616c395e1c7?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&h=150&fit=crop&crop=face"
    ];

    // Fonction pour obtenir une image d'avatar basée sur l'ID
    const getAvatarImage = (id) => {
        return africanAvatars[id % africanAvatars.length];
    };

    // Génération d'avatars avec des couleurs professionnelles (fallback)
    const generateAvatar = (name) => {
        const colors = [
            'from-slate-600 to-slate-800',
            'from-blue-600 to-indigo-700',
            'from-emerald-600 to-teal-700',
            'from-amber-600 to-orange-700',
            'from-purple-600 to-violet-700',
            'from-rose-600 to-pink-700'
        ];

        const hash = name.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        const colorIndex = Math.abs(hash) % colors.length;
        return colors[colorIndex];
    };

    // Charger les locataires depuis l'API
    const [tenants, setTenants] = useState([]);
    const [properties, setProperties] = useState([]);

    // Charger les locataires au montage
    useEffect(() => {
        loadTenants();
    }, []);

    // Exposer la fonction de rafraîchissement au parent
    useEffect(() => {
        if (onRefreshNeeded) {
            onRefreshNeeded(loadTenants);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onRefreshNeeded]);

    const loadTenants = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            console.log('🔄 Chargement des locataires...');
            console.log('🔑 Token:', token ? 'présent' : 'absent');

            const response = await fetch(`${API_BASE_URL}/locations/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Réponse API:', response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Données reçues:', data);
                console.log('📊 Type de données:', typeof data);
                console.log('📊 Est un tableau?', Array.isArray(data));
                console.log('📊 Clés de l\'objet:', Object.keys(data));

                // L'API Django REST retourne souvent { results: [...] } pour les listes paginées
                const locations = Array.isArray(data) ? data : (data.results || []);
                console.log('📊 Nombre de locations:', locations.length);

                // Transformer les données de l'API (locations) pour correspondre au format attendu
                const transformedData = locations.map(location => ({
                    id: location.id,
                    fullName: location.tenant_name,
                    firstName: location.tenant_name.split(' ')[0],
                    lastName: location.tenant_name.split(' ').slice(1).join(' '),
                    phone: location.tenant_phone,
                    email: location.tenant_email,
                    property: location.property_title || 'N/A',
                    propertyId: location.property,
                    rent: location.monthly_rent,
                    contractStatus: location.status,
                    paymentStatus: 'a_jour', // À améliorer avec vraies données
                    nextPayment: null,
                    contractStart: location.lease_start_date,
                    contractEnd: location.lease_end_date,
                    lastPayment: null,
                    avatar: location.tenant_name.split(' ').map(n => n[0]).join(''),
                    paymentsCount: 0,
                    totalPaid: 0,
                    reliability: 0,
                    tenantId: location.tenant,
                    title: location.property_title || 'N/A',
                    location: 'Dakar' // À améliorer avec vraies données
                }));

                console.log('🔄 Données transformées:', transformedData);
                setTenants(transformedData);
            } else {
                const errorText = await response.text();
                console.error('❌ Erreur HTTP:', response.status, errorText);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement:', error);
        } finally {
            setLoading(false);
            console.log('✅ Chargement terminé');
        }
    };

    // Filtrer les locataires
    const filteredTenants = tenants.filter(tenant => {
        const matchesSearch =
            tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.phone.includes(searchTerm) ||
            tenant.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || tenant.paymentStatus === statusFilter;
        const matchesProperty = propertyFilter === 'all' || tenant.propertyId.toString() === propertyFilter;

        return matchesSearch && matchesStatus && matchesProperty;
    });

    const getStatusConfig = (status) => {
        switch (status) {
            case 'a_jour':
                return {
                    label: 'À jour',
                    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                    color: '#059669',
                    icon: CheckCircle
                };
            case 'impaye':
                return {
                    label: 'Impayé',
                    className: 'bg-red-50 text-red-700 border border-red-200',
                    color: '#dc2626',
                    icon: AlertCircle
                };
            case 'retard':
                return {
                    label: 'En retard',
                    className: 'bg-amber-50 text-amber-700 border border-amber-200',
                    color: '#d97706',
                    icon: Clock
                };
            case 'en_attente':
                return {
                    label: 'En attente',
                    className: 'bg-blue-50 text-blue-700 border border-blue-200',
                    color: '#2563eb',
                    icon: Calendar
                };
            default:
                return {
                    label: 'Inconnu',
                    className: 'bg-gray-50 text-gray-700 border border-gray-200',
                    color: '#6b7280',
                    icon: AlertCircle
                };
        }
    };

    // Charger les détails complets d'un locataire avec ses paiements
    const loadTenantDetails = async (locationId) => {
        try {
            const token = localStorage.getItem('token');

            // Charger les détails de la location
            const locationResponse = await fetch(`${API_BASE_URL}/locations/${locationId}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!locationResponse.ok) {
                console.error('Erreur lors du chargement des détails de la location');
                return null;
            }

            const locationData = await locationResponse.json();
            console.log('📋 Détails de la location:', locationData);

            // Charger les paiements du locataire
            const paymentsResponse = await fetch(`${API_BASE_URL}/payments/?tenant=${locationData.tenant}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let paymentsData = [];
            if (paymentsResponse.ok) {
                const payments = await paymentsResponse.json();
                paymentsData = Array.isArray(payments) ? payments : (payments.results || []);
                console.log('💰 Paiements du locataire:', paymentsData);
            }

            // Calculer les statistiques de paiement
            const paidPayments = paymentsData.filter(p => p.status === 'paid' || p.status === 'À jour');
            const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
            const reliability = paymentsData.length > 0
                ? Math.round((paidPayments.length / paymentsData.length) * 100)
                : 100;

            // Trouver le dernier et le prochain paiement
            const sortedPayments = [...paymentsData].sort((a, b) =>
                new Date(b.payment_date) - new Date(a.payment_date)
            );
            const lastPayment = sortedPayments.find(p => p.status === 'paid' || p.status === 'À jour');
            const nextPayment = sortedPayments.find(p => p.status !== 'paid' && p.status !== 'À jour');

            // Construire l'objet détaillé
            return {
                id: locationData.id,
                fullName: locationData.tenant_name,
                firstName: locationData.tenant_name.split(' ')[0],
                lastName: locationData.tenant_name.split(' ').slice(1).join(' '),
                phone: locationData.tenant_phone,
                email: locationData.tenant_email,
                property: locationData.property_title || 'N/A',
                propertyId: locationData.property,
                propertyAddress: locationData.property_address || 'N/A',
                rent: locationData.monthly_rent,
                securityDeposit: locationData.security_deposit,
                paymentMethod: locationData.payment_method,
                contractStatus: locationData.status,
                paymentStatus: nextPayment ? (new Date(nextPayment.next_payment_date) < new Date() ? 'retard' : 'a_jour') : 'a_jour',
                nextPayment: nextPayment?.next_payment_date || null,
                contractStart: locationData.lease_start_date,
                contractEnd: locationData.lease_end_date,
                lastPayment: lastPayment?.payment_date || null,
                avatar: locationData.tenant_name.split(' ').map(n => n[0]).join(''),
                paymentsCount: paidPayments.length,
                totalPaid: totalPaid,
                reliability: reliability,
                tenantId: locationData.tenant,
                title: locationData.property_title || 'N/A',
                location: 'Dakar', // À améliorer avec vraies données
                signedContract: locationData.signed_contract,
                additionalNotes: locationData.additional_notes || ''
            };
        } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
            return null;
        }
    };

    const handleTenantAction = async (action, tenant) => {
        switch (action) {
            case 'view':
                // Charger les détails complets avant d'afficher le popup
                const detailedTenant = await loadTenantDetails(tenant.id);
                if (detailedTenant) {
                    setSelectedTenant(detailedTenant);
                    setShowPopup(true);
                } else {
                    // Si le chargement échoue, utiliser les données de base
                    setSelectedTenant(tenant);
                    setShowPopup(true);
                }
                break;
            case 'edit':
                console.log(`Modifier: ${tenant.firstName} ${tenant.lastName}`);
                break;
            case 'delete':
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${tenant.firstName} ${tenant.lastName}" ?`)) {
                    setTenants(tenants.filter(t => t.id !== tenant.id));
                }
                break;
            case 'reminder':
                console.log(`Rappel de paiement envoyé à ${tenant.firstName} ${tenant.lastName}`);
                break;
            case 'contract':
                console.log(`Ouverture du contrat de ${tenant.firstName} ${tenant.lastName}`);
                break;
            case 'history':
                console.log(`Historique des paiements de ${tenant.firstName} ${tenant.lastName}`);
                break;
            default:
                break;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isOverdue = (nextPayment) => {
        return new Date(nextPayment) < new Date();
    };

    // Statistiques
    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.contractStatus === 'actif').length,
        overdue: tenants.filter(t => t.paymentStatus === 'impaye' || t.paymentStatus === 'retard').length,
        totalRevenue: tenants.filter(t => t.contractStatus === 'actif').reduce((sum, t) => sum + t.rent, 0)
    };

    const [isVisible, setIsVisible] = useState(false);
    const [showOverdueToast, setShowOverdueToast] = useState(false);
    const [toastProgress, setToastProgress] = useState(100);

    // Initialisation de la visibilité et du popup de bienvenue
    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
        // Afficher le popup de bienvenue après 2 secondes
        setTimeout(() => setShowWelcomePopup(true), 2000);
    }, []);

    // Nouveau useEffect pour le toast - s'affiche UNE SEULE FOIS après fermeture du popup
    useEffect(() => {
        // Vérifier si le popup était ouvert et vient d'être fermé
        if (!showWelcomePopup && stats.overdue > 0 && !showOverdueToast && toastProgress === 100) {
            // Afficher le toast 1 seconde après la fermeture du popup
            const showTimer = setTimeout(() => setShowOverdueToast(true), 1000);
            return () => clearTimeout(showTimer);
        }
    }, [showWelcomePopup]);

    // useEffect séparé pour gérer la progression du toast
    useEffect(() => {
        if (showOverdueToast && toastProgress > 0) {
            // Durée totale de 10 secondes
            const duration = 10000;
            const interval = 100;
            const step = (interval / duration) * 100;

            const timer = setInterval(() => {
                setToastProgress((prev) => {
                    const newProgress = prev - step;
                    if (newProgress <= 0) {
                        clearInterval(timer);
                        setShowOverdueToast(false);
                        return 0; // Reste à 0 pour ne pas réapparaître
                    }
                    return newProgress;
                });
            }, interval);

            return () => clearInterval(timer);
        }
    }, [showOverdueToast]);


    const [viewMode, setViewMode] = useState('grid');

    const closePopup = () => {
        setShowPopup(false);
        setTimeout(() => setSelectedTenant(null), 300);
    };

    const closeWelcomePopup = () => {
        setShowWelcomePopup(false);
    };

    return (
        <div className={`
            min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50
            transform transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
            {/* Header avec gradient et stats */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="px-8 py-5">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                Gestion des Locataires
                            </h1>
                            <p className="text-slate-300 text-lg">Tableau de bord professionnel</p>
                        </div>
                        <button
                            onClick={() => setIsTenantModalOpen && setIsTenantModalOpen(true)}
                            className="bg-white text-slate-900 px-4 py-2 rounded-2xl font-semibold transition-all duration-300 hover:bg-slate-100 hover:scale-105 hover:shadow-xl flex items-center gap-3 group"
                        >
                            <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                            Nouveau Locataire
                        </button>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <User size={22} className="text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm">Total Locataires</p>
                                    <p className="text-xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <CheckCircle size={22} className="text-emerald-300" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm">Contrats Actifs</p>
                                    <p className="text-xl font-bold">{stats.active}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <AlertCircle size={22} className="text-red-300" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm">Impayés/Retards</p>
                                    <p className="text-xl font-bold text-red-300">{stats.overdue}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <TrendingUp size={22} className="text-amber-300" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm">Revenus Mensuels</p>
                                    <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue).replace(' FCFA', '')} FCFA</p>
                                    {/* <p className="text-xs text-slate-400"></p> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="px-4 py-4">
                {/* Indicateur de chargement */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-600 font-medium">Chargement des locataires...</p>
                        </div>
                    </div>
                )}

                {/* Barre de recherche et filtres modernisée */}
                {!loading && (
                    <>
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-3 mb-6">
                            <div className="flex flex-wrap gap-2 items-center">
                                <div className="relative flex-1 min-w-64">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Rechercher par nom, email ou téléphone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    {/* Boutons de vue */}
                                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'grid'
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <LayoutGrid size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'table'
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <List size={18} />
                                        </button>
                                    </div>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 text-sm"
                                    >
                                        <option value="all">Tous les statuts</option>
                                        <option value="a_jour">À jour</option>
                                        <option value="impaye">Impayé</option>
                                        <option value="retard">En retard</option>
                                        <option value="en_attente">En attente</option>
                                    </select>

                                    <select
                                        value={propertyFilter}
                                        onChange={(e) => setPropertyFilter(e.target.value)}
                                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 text-sm"
                                    >
                                        <option value="all">Toutes les propriétés</option>
                                        {properties.map(property => (
                                            <option key={property.id} value={property.id.toString()}>
                                                {property.name}
                                            </option>
                                        ))}
                                    </select>

                                    <button className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors">
                                        <Download size={18} className="text-slate-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grille de cartes modernisée */}
                        {/* Affichage conditionnel selon le mode */}
                        {viewMode === 'grid' ? (
                    /* Grille de cartes modernisée */
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
                        {filteredTenants.map((tenant, index) => {
                            const statusConfig = getStatusConfig(tenant.paymentStatus);
                            const isPaymentOverdue = isOverdue(tenant.nextPayment) && tenant.paymentStatus !== 'a_jour';
                            const avatarGradient = generateAvatar(tenant.fullName);

                            return (
                                <div
                                    key={tenant.id}
                                    className={`
                bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden
                transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
                ${isPaymentOverdue ? 'ring-2 ring-red-200 bg-red-50/30' : ''}
                group cursor-pointer
            `}
                                    style={{
                                        animationDelay: `${index * 100}ms`
                                    }}
                                    onClick={() => handleTenantAction('view', tenant)}
                                >
                                    {/* Tout le contenu de la carte reste identique */}
                                    <div className="relative p-4 pb-3">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="relative">
                                                <img
                                                    src={getAvatarImage(tenant.id)}
                                                    alt={tenant.fullName}
                                                    className="w-12 h-12 rounded-xl object-cover shadow-md group-hover:scale-110 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className={`
                            hidden w-12 h-12 bg-gradient-to-br ${avatarGradient} 
                            rounded-xl items-center justify-center 
                            text-white font-bold text-base shadow-md
                            group-hover:scale-110 transition-transform duration-300
                        `}>
                                                    {tenant.avatar}
                                                </div>
                                            </div>
                                            <div className={`
                        px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.className}
                        flex items-center gap-1
                    `}>
                                                <CheckCircle size={10} />
                                                {statusConfig.label}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-0.5 group-hover:text-slate-700 transition-colors">
                                                {tenant.fullName}
                                            </h3>
                                            <p className="text-slate-600 font-medium text-sm mb-1.5">{tenant.title}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <MapPin size={12} />
                                                {tenant.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 pb-3">
                                        <div className="grid grid-cols-3 gap-3 py-3 bg-slate-50 rounded-xl">
                                            <div className="text-center">
                                                <div className="text-base font-bold text-slate-900">
                                                    {Math.round(tenant.rent / 1000)}K
                                                </div>
                                                <div className="text-[10px] text-slate-600 uppercase tracking-wide">Loyer</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-base font-bold text-slate-900">{tenant.paymentsCount}</div>
                                                <div className="text-[10px] text-slate-600 uppercase tracking-wide">Paiements</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-base font-bold text-emerald-600">{tenant.reliability}%</div>
                                                <div className="text-[10px] text-slate-600 uppercase tracking-wide">Fiabilité</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 pb-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTenantAction('view', tenant);
                                                }}
                                                className="flex-1 bg-slate-900 text-white py-2 px-3 rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 text-xs"
                                            >
                                                Voir détails
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTenantAction('edit', tenant);
                                                }}
                                                className="px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
                                            >
                                                <Edit size={14} className="text-slate-600 group-hover:text-slate-900" />
                                            </button>
                                            {(tenant.paymentStatus === 'impaye' || tenant.paymentStatus === 'retard') && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTenantAction('reminder', tenant);
                                                    }}
                                                    className="px-3 py-2 bg-amber-100 border border-amber-200 rounded-xl hover:bg-amber-200 transition-colors group"
                                                >
                                                    <Bell size={14} className="text-amber-600 group-hover:text-amber-700" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isPaymentOverdue && (
                                        <div className="mx-4 mb-4 p-2.5 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle size={14} className="text-red-600" />
                                                <p className="text-xs text-red-700 font-medium">
                                                    Paiement en retard depuis le {formatDate(tenant.nextPayment)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Vue tableau */
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Locataire</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Propriété</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Contact</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Loyer</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Statut</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Prochain paiement</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredTenants.map((tenant) => {
                                        const statusConfig = getStatusConfig(tenant.paymentStatus);
                                        const avatarGradient = generateAvatar(tenant.fullName);
                                        return (
                                            <tr key={tenant.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleTenantAction('view', tenant)}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={getAvatarImage(tenant.id)}
                                                            alt={tenant.fullName}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                        <div className={`hidden w-10 h-10 bg-gradient-to-br ${avatarGradient} rounded-lg items-center justify-center text-white font-bold text-sm`}>
                                                            {tenant.avatar}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 text-sm">{tenant.fullName}</p>
                                                            <p className="text-slate-600 text-xs">{tenant.title}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700">{tenant.property}</td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-slate-700">{tenant.phone}</p>
                                                    <p className="text-xs text-slate-500">{tenant.email}</p>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(tenant.rent)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.className}`}>
                                                        <CheckCircle size={10} />
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700">{formatDate(tenant.nextPayment)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); handleTenantAction('edit', tenant); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                                            <Edit size={16} className="text-slate-600" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleTenantAction('view', tenant); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                                            <FileText size={16} className="text-slate-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Message si aucun locataire */}
                {filteredTenants.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Aucun locataire trouvé</h3>
                        <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
                            {searchTerm || statusFilter !== 'all' || propertyFilter !== 'all'
                                ? 'Essayez de modifier vos critères de recherche ou filtres'
                                : 'Commencez par ajouter votre premier locataire à votre portefeuille'
                            }
                        </p>
                        <button
                            onClick={() => setIsTenantModalOpen && setIsTenantModalOpen(true)}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 text-sm"
                        >
                            <Plus size={18} />
                            Ajouter un locataire
                        </button>
                    </div>
                )}
                    </>
                )}
            </div>

            {/* Popup de détails modernisé */}
            {showPopup && selectedTenant && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 "
                    style={{ zIndex: 9999 }}
                    onClick={closePopup}
                >
                    <div
                        className={`
                bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-6
                transform transition-all duration-500
                ${showPopup ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header du popup */}
                        <div className="relative bg-gradient-to-br from-slate-50 to-white p-4 rounded-t-2xl border-b border-slate-200">
                            <button
                                onClick={closePopup}
                                className="absolute top-3 right-3 p-1.5 hover:bg-slate-200 rounded-full transition-colors z-10"
                            >
                                <X size={18} className="text-slate-600" />
                            </button>

                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={getAvatarImage(selectedTenant.id)}
                                        alt={selectedTenant.fullName}
                                        className="w-12 h-12 rounded-xl object-cover shadow-md"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className={`
                            hidden w-12 h-12 bg-gradient-to-br ${generateAvatar(selectedTenant.fullName)} 
                            rounded-xl items-center justify-center text-white font-bold text-lg shadow-md
                        `}>
                                        {selectedTenant.avatar}
                                    </div>
                                </div>

                                {/* Infos principales */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-slate-900 truncate">{selectedTenant.fullName}</h2>
                                    <p className="text-slate-600 text-xs">{selectedTenant.title}</p>
                                </div>

                                {/* Localisation et statut */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                        <MapPin size={12} />
                                        <span className="hidden md:inline">{selectedTenant.location}</span>
                                    </div>

                                    <div className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 mr-8 rounded-full text-xs font-semibold whitespace-nowrap
                            ${getStatusConfig(selectedTenant.paymentStatus).className}
                        `}>
                                        <CheckCircle size={10} />
                                        {getStatusConfig(selectedTenant.paymentStatus).label}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contenu du popup */}
                        <div className="p-5">
                            {/* Statistiques étendues en ligne */}
                            <div className="grid grid-cols-6 gap-3 mb-6">
                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xl font-bold text-slate-900 mb-0.5">
                                        {Math.round(selectedTenant.rent / 1000)}K
                                    </div>
                                    <div className="text-[10px] text-slate-600 uppercase tracking-wide">Loyer/mois</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xl font-bold text-amber-600 mb-0.5">
                                        {selectedTenant.securityDeposit ? Math.round(selectedTenant.securityDeposit / 1000) : 0}K
                                    </div>
                                    <div className="text-[10px] text-slate-600 uppercase tracking-wide">Caution</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xl font-bold text-slate-900 mb-0.5">{selectedTenant.paymentsCount}</div>
                                    <div className="text-[10px] text-slate-600 uppercase tracking-wide">Paiements</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xl font-bold text-emerald-600 mb-0.5">{selectedTenant.reliability}%</div>
                                    <div className="text-[10px] text-slate-600 uppercase tracking-wide">Fiabilité</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xl font-bold text-slate-900 mb-0.5">
                                        {Math.floor((new Date() - new Date(selectedTenant.contractStart)) / (1000 * 60 * 60 * 24 * 30))}
                                    </div>
                                    <div className="text-[10px] text-slate-600 uppercase tracking-wide">Mois</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xl font-bold text-blue-600 mb-0.5">
                                        {selectedTenant.contractStatus === 'actif' ? 'Actif' : 'Attente'}
                                    </div>
                                    <div className="text-[10px] text-slate-600 uppercase tracking-wide">Statut</div>
                                </div>
                            </div>

                            {/* Informations détaillées - Layout horizontal */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                {/* Contact et Propriété */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                                <Phone size={16} className="text-blue-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900 text-sm">Contact</span>
                                        </div>
                                        <p className="text-slate-700 font-medium text-sm mb-1.5">{selectedTenant.phone}</p>
                                        <p className="text-slate-600 text-xs mb-2">{selectedTenant.email}</p>
                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-blue-500 text-white py-1.5 px-2 rounded-lg text-xs hover:bg-blue-600 transition-colors">
                                                Appeler
                                            </button>
                                            <button className="flex-1 bg-blue-100 text-blue-700 py-1.5 px-2 rounded-lg text-xs hover:bg-blue-200 transition-colors">
                                                Email
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-green-100 rounded-lg">
                                                <Building size={16} className="text-green-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900 text-sm">Propriété</span>
                                        </div>
                                        <p className="text-slate-700 font-medium text-sm mb-1.5">{selectedTenant.property}</p>
                                        <p className="text-slate-600 text-xs mb-2">
                                            Du {formatDate(selectedTenant.contractStart)} au {formatDate(selectedTenant.contractEnd)}
                                        </p>
                                        <button className="w-full bg-green-500 text-white py-1.5 px-2 rounded-lg text-xs hover:bg-green-600 transition-colors">
                                            Voir le contrat
                                        </button>
                                    </div>
                                </div>

                                {/* Paiements et Historique */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-purple-100 rounded-lg">
                                                <Calendar size={16} className="text-purple-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900 text-sm">Paiements</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-slate-600 text-xs">Prochain paiement</p>
                                                <p className="text-slate-900 font-semibold text-sm">{formatDate(selectedTenant.nextPayment)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600 text-xs">Dernier paiement</p>
                                                <p className="text-slate-900 font-semibold text-sm">{formatDate(selectedTenant.lastPayment)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                                                <span>Fiabilité de paiement</span>
                                                <span>{selectedTenant.reliability}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min(100, (selectedTenant.reliability || 0))}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-emerald-100 rounded-lg">
                                                <CreditCard size={16} className="text-emerald-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900 text-sm">Finances</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-slate-600 text-xs">Loyer mensuel</p>
                                                <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedTenant.rent)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600 text-xs">Total perçu</p>
                                                <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedTenant.totalPaid)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions et Notes */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl">
                                        <h3 className="font-semibold text-sm mb-3">Actions rapides</h3>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => {
                                                    handleTenantAction('edit', selectedTenant);
                                                    closePopup();
                                                }}
                                                className="w-full bg-white/10 backdrop-blur-sm text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                                            >
                                                <Edit size={14} />
                                                Modifier les infos
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleTenantAction('contract', selectedTenant);
                                                    closePopup();
                                                }}
                                                className="w-full bg-white/10 backdrop-blur-sm text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                                            >
                                                <FileText size={14} />
                                                Voir le contrat
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleTenantAction('history', selectedTenant);
                                                    closePopup();
                                                }}
                                                className="w-full bg-white/10 backdrop-blur-sm text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                                            >
                                                <Clock size={14} />
                                                Historique
                                            </button>
                                            {(selectedTenant.paymentStatus === 'impaye' || selectedTenant.paymentStatus === 'retard') && (
                                                <button
                                                    onClick={() => {
                                                        handleTenantAction('reminder', selectedTenant);
                                                        closePopup();
                                                    }}
                                                    className="w-full bg-amber-500 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-amber-600 transition-all duration-300 flex items-center gap-2"
                                                >
                                                    <Bell size={14} />
                                                    Envoyer rappel
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <h3 className="font-semibold text-slate-900 text-sm mb-3">Notes & Remarques</h3>
                                        <textarea
                                            className="w-full h-20 p-2 bg-white border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                                            placeholder="Ajouter des notes concernant ce locataire..."
                                        ></textarea>
                                        <button className="mt-2 w-full bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs hover:bg-slate-300 transition-colors">
                                            Sauvegarder les notes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Alerte si paiement en retard */}
                            {(selectedTenant.paymentStatus === 'impaye' || selectedTenant.paymentStatus === 'retard') && (
                                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-red-200 rounded-lg">
                                            <AlertCircle size={16} className="text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-red-800 text-sm mb-1.5">Attention - Paiement en retard</h3>
                                            <p className="text-red-700 text-xs mb-3">
                                                Le paiement était dû le {formatDate(selectedTenant.nextPayment)}.
                                                Pensez à envoyer un rappel ou à contacter le locataire.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    handleTenantAction('reminder', selectedTenant);
                                                    closePopup();
                                                }}
                                                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                                            >
                                                Envoyer un rappel maintenant
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Popup de bienvenue style Bonobos */}
            {showWelcomePopup && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`
                        bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden
                        transform transition-all duration-700
                        ${showWelcomePopup ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                    `}>
                        <div className="flex">
                            {/* Image de gauche */}
                            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center p-12">
                                <div className="text-center text-white">
                                    <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
                                        <Building size={48} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                        Gestion Immobilière Premium
                                    </h3>
                                    <p className="text-slate-300 text-lg leading-relaxed">
                                        Découvrez une expérience de gestion locative moderne et intuitive
                                    </p>

                                    {/* Éléments décoratifs */}
                                    <div className="flex justify-center gap-4 mt-8">
                                        <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                                        <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu de droite */}
                            <div className="w-full md:w-1/2 p-8 md:p-12">
                                <button
                                    onClick={closeWelcomePopup}
                                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-slate-500" />
                                </button>

                                <div className="max-w-md mx-auto">
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                        Bienvenue dans votre espace
                                    </h2>
                                    <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                                        Profitez de <span className="font-semibold text-slate-900">30 jours d'essai gratuit</span> de notre plateforme de gestion locative premium.
                                    </p>

                                    {/* Avantages */}
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle size={14} className="text-green-600" />
                                            </div>
                                            <span className="text-slate-700">Gestion automatisée des rappels</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle size={14} className="text-green-600" />
                                            </div>
                                            <span className="text-slate-700">Tableau de bord en temps réel</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle size={14} className="text-green-600" />
                                            </div>
                                            <span className="text-slate-700">Support client prioritaire</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                closeWelcomePopup();
                                                setIsTenantModalOpen && setIsTenantModalOpen(true);
                                            }}
                                            className="w-full bg-slate-900 text-white py-4 px-8 rounded-2xl font-semibold hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            Commencer maintenant
                                        </button>
                                        <button
                                            onClick={closeWelcomePopup}
                                            className="w-full border-2 border-slate-200 text-slate-700 py-4 px-8 rounded-2xl font-semibold hover:bg-slate-50 transition-colors"
                                        >
                                            Explorer d'abord
                                        </button>
                                    </div>

                                    <p className="text-xs text-slate-500 text-center mt-6">
                                        En continuant, vous acceptez nos{' '}
                                        <a href="#" className="text-slate-700 hover:underline">Conditions d'utilisation</a> et notre{' '}
                                        <a href="#" className="text-slate-700 hover:underline">Politique de confidentialité</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Alertes globales */}
            {/* {stats.overdue > 0 && (
                <div className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-2xl max-w-sm z-40 border border-red-400">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <AlertCircle size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">
                                {stats.overdue} impayé{stats.overdue > 1 ? 's' : ''}
                            </h3>
                            <p className="text-red-100 text-sm mb-3">
                                Vérifiez les paiements en retard et envoyez des rappels.
                            </p>
                            <button className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                                Voir les détails
                            </button>
                        </div>
                    </div>
                </div>
            )} */}


            {/* Toast d'alertes globales */}
            {stats.overdue > 0 && showOverdueToast && (
                <div className={`
        fixed top-6 left-1/2 -translate-x-1/2 z-50
        transform transition-all duration-500 ease-out
        ${showOverdueToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
    `}>
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl shadow-2xl max-w-sm border border-red-400 relative overflow-hidden">
                        {/* Barre de progression */}
                        <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{ width: `${toastProgress}%` }}
                            ></div>
                        </div>

                        {/* Bouton fermer */}
                        <button
                            onClick={() => {
                                setShowOverdueToast(false);
                                setToastProgress(0);
                            }}
                            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={16} className="text-white" />
                        </button>

                        <div className="flex items-center gap-3 pr-6">
                            <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
                                <AlertCircle size={16} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white text-sm mb-0.5">
                                    {stats.overdue} impayé{stats.overdue > 1 ? 's' : ''} en attente
                                </h3>
                                <p className="text-red-100 text-xs">
                                    Vérifiez les paiements en retard
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setStatusFilter('impaye');
                                    setShowOverdueToast(false);
                                    setToastProgress(0);
                                }}
                                className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors whitespace-nowrap"
                            >
                                Voir
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}