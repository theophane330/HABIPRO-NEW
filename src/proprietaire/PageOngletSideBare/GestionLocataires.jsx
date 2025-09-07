import React, { useState, useEffect } from 'react';
import { Search, Edit, Phone, Mail, FileText,Clock, Calendar, AlertCircle, CheckCircle, MapPin, CreditCard, X, Plus, Filter, Download, Eye, Bell, User, Building, TrendingUp } from 'lucide-react';

export default function Tenants({
    setIsTenantModalOpen,
    formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [propertyFilter, setPropertyFilter] = useState('all');
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);

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

    // Données d'exemple avec plus de réalisme
    const [tenants, setTenants] = useState([
        {
            id: 1,
            firstName: "Jean",
            lastName: "Kouassi",
            fullName: "Jean Kouassi",
            title: "Ingénieur Logiciel",
            location: "Cocody, Abidjan",
            phone: "+225 07 89 45 12 34",
            email: "jean.kouassi@email.ci",
            property: "Villa 5p Cocody",
            propertyId: 1,
            rent: 500000,
            contractStatus: "actif",
            paymentStatus: "a_jour",
            nextPayment: "2025-09-05",
            contractStart: "2024-01-01",
            contractEnd: "2025-12-31",
            lastPayment: "2025-08-01",
            avatar: "JK",
            paymentsCount: 8,
            totalPaid: 4000000,
            reliability: 95
        },
        {
            id: 2,
            firstName: "Mariam",
            lastName: "Diallo",
            fullName: "Mariam Diallo",
            title: "Directrice Pédagogique",
            location: "Yopougon, Abidjan",
            phone: "+225 01 25 36 48 59",
            email: "mariam.diallo@education.ci",
            property: "Studio Premium Yopougon",
            propertyId: 2,
            rent: 150000,
            contractStatus: "actif",
            paymentStatus: "impaye",
            nextPayment: "2025-08-10",
            contractStart: "2024-03-01",
            contractEnd: "2026-02-28",
            lastPayment: "2025-07-01",
            avatar: "MD",
            paymentsCount: 5,
            totalPaid: 750000,
            reliability: 78
        },
        {
            id: 3,
            firstName: "Paul",
            lastName: "Adjoua", 
            fullName: "Paul Adjoua",
            title: "Expert-Comptable",
            location: "Plateau, Abidjan",
            phone: "+225 05 36 78 45 62",
            email: "paul.adjoua@cabinet.ci",
            property: "Bureaux Plateau",
            propertyId: 3,
            rent: 400000,
            contractStatus: "en_attente",
            paymentStatus: "en_attente",
            nextPayment: "2025-09-01",
            contractStart: "2025-09-01",
            contractEnd: "2026-08-31",
            lastPayment: null,
            avatar: "PA",
            paymentsCount: 0,
            totalPaid: 0,
            reliability: 0
        },
        {
            id: 4,
            firstName: "Awa",
            lastName: "Traoré",
            fullName: "Awa Traoré",
            title: "Directrice Marketing",
            location: "Riviera Golf, Abidjan",
            phone: "+225 02 47 58 96 31",
            email: "awa.traore@agency.ci",
            property: "Villa Executive Riviera",
            propertyId: 4,
            rent: 850000,
            contractStatus: "actif",
            paymentStatus: "retard",
            nextPayment: "2025-08-20",
            contractStart: "2023-06-01",
            contractEnd: "2025-05-31",
            lastPayment: "2025-07-20",
            avatar: "AT",
            paymentsCount: 16,
            totalPaid: 13600000,
            reliability: 88
        }
    ]);

    // Liste des propriétés
    const properties = [
        { id: 1, name: "Villa 5p Cocody" },
        { id: 2, name: "Studio Premium Yopougon" },
        { id: 3, name: "Bureaux Plateau" },
        { id: 4, name: "Villa Executive Riviera" }
    ];

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

    const handleTenantAction = (action, tenant) => {
        switch (action) {
            case 'view':
                setSelectedTenant(tenant);
                setShowPopup(true);
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

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
        // Afficher le popup de bienvenue après 2 secondes
        setTimeout(() => setShowWelcomePopup(true), 2000);
    }, []);

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
                <div className="px-8 py-12">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                Gestion des Locataires
                            </h1>
                            <p className="text-slate-300 text-lg">Tableau de bord professionnel</p>
                        </div>
                        <button
                            onClick={() => setIsTenantModalOpen && setIsTenantModalOpen(true)}
                            className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-slate-100 hover:scale-105 hover:shadow-xl flex items-center gap-3 group"
                        >
                            <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                            Nouveau Locataire
                        </button>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <User size={24} className="text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm">Total Locataires</p>
                                    <p className="text-3xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/20 rounded-xl">
                                    <CheckCircle size={24} className="text-emerald-300" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm">Contrats Actifs</p>
                                    <p className="text-3xl font-bold">{stats.active}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/20 rounded-xl">
                                    <AlertCircle size={24} className="text-red-300" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm">Impayés/Retards</p>
                                    <p className="text-3xl font-bold text-red-300">{stats.overdue}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/20 rounded-xl">
                                    <TrendingUp size={24} className="text-amber-300" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm">Revenus Mensuels</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue).replace(' FCFA', '')}</p>
                                    <p className="text-xs text-slate-400">FCFA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="px-8 py-8">
                {/* Barre de recherche et filtres modernisée */}
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 mb-8">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="relative flex-1 min-w-80">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={22} />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, email ou téléphone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-lg"
                            />
                        </div>
                        
                        <div className="flex gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 font-medium"
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
                                className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 font-medium"
                            >
                                <option value="all">Toutes les propriétés</option>
                                {properties.map(property => (
                                    <option key={property.id} value={property.id.toString()}>
                                        {property.name}
                                    </option>
                                ))}
                            </select>

                            <button className="px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl hover:bg-slate-200 transition-colors">
                                <Download size={20} className="text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grille de cartes modernisée */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {filteredTenants.map((tenant, index) => {
                        const statusConfig = getStatusConfig(tenant.paymentStatus);
                        const isPaymentOverdue = isOverdue(tenant.nextPayment) && tenant.paymentStatus !== 'a_jour';
                        const avatarGradient = generateAvatar(tenant.fullName);

                        return (
                            <div 
                                key={tenant.id}
                                className={`
                                    bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden
                                    transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]
                                    ${isPaymentOverdue ? 'ring-2 ring-red-200 bg-red-50/30' : ''}
                                    group cursor-pointer
                                `}
                                style={{
                                    animationDelay: `${index * 100}ms`
                                }}
                                onClick={() => handleTenantAction('view', tenant)}
                            >
                                {/* Header avec statut */}
                                <div className="relative p-6 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="relative">
                                            <img
                                                src={getAvatarImage(tenant.id)}
                                                alt={tenant.fullName}
                                                className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    // Fallback vers avatar avec gradient si l'image ne charge pas
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div className={`
                                                hidden w-16 h-16 bg-gradient-to-br ${avatarGradient} 
                                                rounded-2xl items-center justify-center 
                                                text-white font-bold text-lg shadow-lg
                                                group-hover:scale-110 transition-transform duration-300
                                            `}>
                                                {tenant.avatar}
                                            </div>
                                        </div>
                                        <div className={`
                                            px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.className}
                                            flex items-center gap-1
                                        `}>
                                            <CheckCircle size={12} />
                                            {statusConfig.label}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                                            {tenant.fullName}
                                        </h3>
                                        <p className="text-slate-600 font-medium mb-2">{tenant.title}</p>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <MapPin size={14} />
                                            {tenant.location}
                                        </div>
                                    </div>
                                </div>

                                {/* Métriques */}
                                <div className="px-6 pb-4">
                                    <div className="grid grid-cols-3 gap-4 py-4 bg-slate-50 rounded-2xl">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-slate-900">
                                                {Math.round(tenant.rent / 1000)}K
                                            </div>
                                            <div className="text-xs text-slate-600 uppercase tracking-wide">Loyer</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-slate-900">{tenant.paymentsCount}</div>
                                            <div className="text-xs text-slate-600 uppercase tracking-wide">Paiements</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-emerald-600">{tenant.reliability}%</div>
                                            <div className="text-xs text-slate-600 uppercase tracking-wide">Fiabilité</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="px-6 pb-6">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTenantAction('view', tenant);
                                            }}
                                            className="flex-1 bg-slate-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 text-sm"
                                        >
                                            Voir détails
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTenantAction('edit', tenant);
                                            }}
                                            className="px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
                                        >
                                            <Edit size={16} className="text-slate-600 group-hover:text-slate-900" />
                                        </button>
                                        {(tenant.paymentStatus === 'impaye' || tenant.paymentStatus === 'retard') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTenantAction('reminder', tenant);
                                                }}
                                                className="px-4 py-3 bg-amber-100 border border-amber-200 rounded-xl hover:bg-amber-200 transition-colors group"
                                            >
                                                <Bell size={16} className="text-amber-600 group-hover:text-amber-700" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Alerte paiement en retard */}
                                {isPaymentOverdue && (
                                    <div className="mx-6 mb-6 p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle size={16} className="text-red-600" />
                                            <p className="text-sm text-red-700 font-medium">
                                                Paiement en retard depuis le {formatDate(tenant.nextPayment)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Message si aucun locataire */}
                {filteredTenants.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                            <User size={48} className="text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Aucun locataire trouvé</h3>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            {searchTerm || statusFilter !== 'all' || propertyFilter !== 'all'
                                ? 'Essayez de modifier vos critères de recherche ou filtres'
                                : 'Commencez par ajouter votre premier locataire à votre portefeuille'
                            }
                        </p>
                        <button
                            onClick={() => setIsTenantModalOpen && setIsTenantModalOpen(true)}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-3"
                        >
                            <Plus size={20} />
                            Ajouter un locataire
                        </button>
                    </div>
                )}
            </div>

            {/* Popup de détails modernisé - Plus large que long */}
            {showPopup && selectedTenant && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`
                        bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-y-auto
                        transform transition-all duration-500
                        ${showPopup ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                    `}>
                        {/* Header du popup */}
                        <div className="relative bg-gradient-to-br from-slate-50 to-white p-8 rounded-t-3xl">
                            <button
                                onClick={closePopup}
                                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-slate-500" />
                            </button>
                            
                            <div className="flex items-start gap-6">
                                <div className="relative">
                                    <img
                                        src={getAvatarImage(selectedTenant.id)}
                                        alt={selectedTenant.fullName}
                                        className="w-24 h-24 rounded-3xl object-cover shadow-xl"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className={`
                                        hidden w-24 h-24 bg-gradient-to-br ${generateAvatar(selectedTenant.fullName)} 
                                        rounded-3xl items-center justify-center text-white font-bold text-2xl shadow-xl
                                    `}>
                                        {selectedTenant.avatar}
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedTenant.fullName}</h2>
                                    <p className="text-slate-600 font-medium mb-1">{selectedTenant.title}</p>
                                    <div className="flex items-center gap-2 text-slate-500 mb-4">
                                        <MapPin size={16} />
                                        {selectedTenant.location}
                                    </div>
                                    
                                    <div className={`
                                        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold 
                                        ${getStatusConfig(selectedTenant.paymentStatus).className}
                                    `}>
                                        <CheckCircle size={14} />
                                        {getStatusConfig(selectedTenant.paymentStatus).label}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contenu du popup - Layout horizontal */}
                        <div className="p-8">
                            {/* Statistiques étendues en ligne */}
                            <div className="grid grid-cols-6 gap-6 mb-8">
                                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-slate-900 mb-1">
                                        {Math.round(selectedTenant.rent / 1000)}K
                                    </div>
                                    <div className="text-xs text-slate-600 uppercase tracking-wide">Loyer/mois</div>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-slate-900 mb-1">{selectedTenant.paymentsCount}</div>
                                    <div className="text-xs text-slate-600 uppercase tracking-wide">Paiements</div>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-emerald-600 mb-1">{selectedTenant.reliability}%</div>
                                    <div className="text-xs text-slate-600 uppercase tracking-wide">Fiabilité</div>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-slate-900 mb-1">
                                        {Math.floor((new Date() - new Date(selectedTenant.contractStart)) / (1000 * 60 * 60 * 24 * 30))}
                                    </div>
                                    <div className="text-xs text-slate-600 uppercase tracking-wide">Mois</div>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                    <div className="text-xl font-bold text-purple-600 mb-1">
                                        {formatCurrency(selectedTenant.totalPaid).replace(' FCFA', '').substring(0, 3)}K
                                    </div>
                                    <div className="text-xs text-slate-600 uppercase tracking-wide">Total payé</div>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                        {selectedTenant.contractStatus === 'actif' ? 'Actif' : 'Attente'}
                                    </div>
                                    <div className="text-xs text-slate-600 uppercase tracking-wide">Statut</div>
                                </div>
                            </div>

                            {/* Informations détaillées - Layout horizontal */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {/* Contact et Propriété */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Phone size={20} className="text-blue-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900 text-lg">Contact</span>
                                        </div>
                                        <p className="text-slate-700 font-medium mb-2">{selectedTenant.phone}</p>
                                        <p className="text-slate-600 text-sm mb-3">{selectedTenant.email}</p>
                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                                                Appeler
                                            </button>
                                            <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                                                Email
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Building size={20} className="text-green-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900 text-lg">Propriété</span>
                                        </div>
                                        <p className="text-slate-700 font-medium mb-2">{selectedTenant.property}</p>
                                        <p className="text-slate-600 text-sm mb-3">
                                            Du {formatDate(selectedTenant.contractStart)} au {formatDate(selectedTenant.contractEnd)}
                                        </p>
                                        <button className="w-full bg-green-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-600 transition-colors">
                                            Voir le contrat
                                        </button>
                                    </div>
                                </div>

                                {/* Paiements et Historique */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Calendar size={20} className="text-purple-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900 text-lg">Paiements</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-slate-600 text-sm">Prochain paiement</p>
                                                <p className="text-slate-900 font-semibold">{formatDate(selectedTenant.nextPayment)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600 text-sm">Dernier paiement</p>
                                                <p className="text-slate-900 font-semibold">{formatDate(selectedTenant.lastPayment)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                                                <span>Fiabilité de paiement</span>
                                                <span>{selectedTenant.reliability}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div 
                                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                                                    style={{
                                                        width: `${Math.min(100, (selectedTenant.reliability || 0))}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <CreditCard size={20} className="text-emerald-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900 text-lg">Finances</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-slate-600 text-sm">Loyer mensuel</p>
                                                <p className="text-xl font-bold text-slate-900">{formatCurrency(selectedTenant.rent)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600 text-sm">Total perçu</p>
                                                <p className="text-xl font-bold text-emerald-600">{formatCurrency(selectedTenant.totalPaid)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions et Notes */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl">
                                        <h3 className="font-semibold text-lg mb-4">Actions rapides</h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    handleTenantAction('edit', selectedTenant);
                                                    closePopup();
                                                }}
                                                className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
                                            >
                                                <Edit size={18} />
                                                Modifier les infos
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleTenantAction('contract', selectedTenant);
                                                    closePopup();
                                                }}
                                                className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
                                            >
                                                <FileText size={18} />
                                                Voir le contrat
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleTenantAction('history', selectedTenant);
                                                    closePopup();
                                                }}
                                                className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
                                            >
                                                <Clock size={18} />
                                                Historique
                                            </button>
                                            {(selectedTenant.paymentStatus === 'impaye' || selectedTenant.paymentStatus === 'retard') && (
                                                <button
                                                    onClick={() => {
                                                        handleTenantAction('reminder', selectedTenant);
                                                        closePopup();
                                                    }}
                                                    className="w-full bg-amber-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-amber-600 transition-all duration-300 flex items-center gap-3"
                                                >
                                                    <Bell size={18} />
                                                    Envoyer rappel
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <h3 className="font-semibold text-slate-900 text-lg mb-4">Notes & Remarques</h3>
                                        <textarea 
                                            className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                                            placeholder="Ajouter des notes concernant ce locataire..."
                                        ></textarea>
                                        <button className="mt-3 w-full bg-slate-200 text-slate-700 py-2 px-4 rounded-lg text-sm hover:bg-slate-300 transition-colors">
                                            Sauvegarder les notes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Alerte si paiement en retard */}
                            {(selectedTenant.paymentStatus === 'impaye' || selectedTenant.paymentStatus === 'retard') && (
                                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-red-200 rounded-lg">
                                            <AlertCircle size={20} className="text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-red-800 mb-2">Attention - Paiement en retard</h3>
                                            <p className="text-red-700 text-sm mb-4">
                                                Le paiement était dû le {formatDate(selectedTenant.nextPayment)}. 
                                                Pensez à envoyer un rappel ou à contacter le locataire.
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    handleTenantAction('reminder', selectedTenant);
                                                    closePopup();
                                                }}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
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
            {stats.overdue > 0 && (
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
            )}
        </div>
    );
}