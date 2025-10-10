import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Eye, Edit2, Trash2, Filter, X, Calendar, Home, DollarSign, MapPin, TrendingUp, BarChart3, Share2, Copy, RefreshCw } from 'lucide-react';

export default function PublierAnnoncePage({
    setIsAnnonceModalOpen,
    setIsAnnonceDetailModal,
    setSelectedAnnonceDetail
}) {
    // export default function PublierAnnoncePage({ setIsAnnonceModalOpen }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterLocation, setFilterLocation] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedAnnonces, setSelectedAnnonces] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'table' ou 'grid'
    const [isVisible, setIsVisible] = useState(false);

        useEffect(() => {
            setTimeout(() => setIsVisible(true), 100);
        }, []);

    const [annonces, setAnnonces] = useState([
        {
            id: 1,
            title: 'Villa Cocody 5p',
            property: 'Villa Cocody',
            type: 'Vente',
            price: '100 M FCFA',
            status: 'published',
            date: '30/08/2025',
            location: 'Cocody',
            views: 245,
            contacts: 12,
            photos: 8,
            bedrooms: 5,
            surface: '350 m²'
        },
        {
            id: 2,
            title: 'Studio Yopougon',
            property: 'Studio Yopougon',
            type: 'Location',
            price: '100k FCFA / mois',
            status: 'pending',
            date: '25/08/2025',
            location: 'Yopougon',
            views: 89,
            contacts: 5,
            photos: 4,
            bedrooms: 1,
            surface: '45 m²'
        },
        {
            id: 3,
            title: 'Appartement Plateau',
            property: 'Appartement Plateau',
            type: 'Vente',
            price: '60 M FCFA',
            status: 'draft',
            date: '20/08/2025',
            location: 'Plateau',
            views: 0,
            contacts: 0,
            photos: 2,
            bedrooms: 3,
            surface: '120 m²'
        },
        {
            id: 4,
            title: 'Terrain Bingerville',
            property: 'Terrain Bingerville',
            type: 'Vente',
            price: '25 M FCFA',
            status: 'published',
            date: '15/08/2025',
            location: 'Bingerville',
            views: 156,
            contacts: 8,
            photos: 5,
            bedrooms: 0,
            surface: '500 m²'
        },
        {
            id: 5,
            title: 'Duplex Marcory Zone 4',
            property: 'Duplex Marcory',
            type: 'Location',
            price: '250k FCFA / mois',
            status: 'published',
            date: '10/08/2025',
            location: 'Marcory',
            views: 312,
            contacts: 18,
            photos: 10,
            bedrooms: 4,
            surface: '200 m²'
        }
    ]);

    const statusConfig = {
        published: { label: 'Publiée', color: 'bg-green-100 text-green-800', icon: '✅' },
        pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
        draft: { label: 'Brouillon', color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const locations = ['Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Bingerville', 'Abobo', 'Adjamé'];

    const filteredAnnonces = annonces.filter(annonce => {
        const matchesSearch = annonce.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            annonce.property.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || annonce.status === filterStatus;
        const matchesType = filterType === 'all' || annonce.type === filterType;
        const matchesLocation = filterLocation === 'all' || annonce.location === filterLocation;

        return matchesSearch && matchesStatus && matchesType && matchesLocation;
    });

    const handleSelectAnnonce = (id) => {
        setSelectedAnnonces(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedAnnonces.length === filteredAnnonces.length) {
            setSelectedAnnonces([]);
        } else {
            setSelectedAnnonces(filteredAnnonces.map(a => a.id));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
            setAnnonces(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Supprimer ${selectedAnnonces.length} annonce(s) sélectionnée(s) ?`)) {
            setAnnonces(prev => prev.filter(a => !selectedAnnonces.includes(a.id)));
            setSelectedAnnonces([]);
        }
    };

    const handleDuplicate = (id) => {
        const annonce = annonces.find(a => a.id === id);
        const newAnnonce = {
            ...annonce,
            id: Date.now(),
            title: `${annonce.title} (Copie)`,
            status: 'draft',
            date: new Date().toLocaleDateString('fr-FR')
        };
        setAnnonces(prev => [...prev, newAnnonce]);
        alert('Annonce dupliquée avec succès !');
    };

    const totalViews = annonces.reduce((sum, a) => sum + a.views, 0);
    const totalContacts = annonces.reduce((sum, a) => sum + a.contacts, 0);
    const publishedCount = annonces.filter(a => a.status === 'published').length;

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
                        <h1 className="text-xl font-bold text-gray-800">📢 Publier une Annonce</h1>
                        <p className="text-gray-600 mt-1">Gérez toutes vos annonces immobilières</p>
                    </div>
                    <button

                        onClick={() => setIsAnnonceModalOpen && setIsAnnonceModalOpen(true)}
                        className="bg-green-600 text-sm hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105">

                        <Plus size={18} />
                        Nouvelle annonce
                    </button>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Annonces</p>
                                <p className="text-2xl font-bold text-gray-800">{annonces.length}</p>
                            </div>
                            <Home className="text-blue-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Publiées</p>
                                <p className="text-2xl font-bold text-gray-800">{publishedCount}</p>
                            </div>
                            <TrendingUp className="text-green-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Vues Totales</p>
                                <p className="text-2xl font-bold text-gray-800">{totalViews}</p>
                            </div>
                            <Eye className="text-purple-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Contacts Reçus</p>
                                <p className="text-2xl font-bold text-gray-800">{totalContacts}</p>
                            </div>
                            <BarChart3 className="text-orange-500" size={32} />
                        </div>
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
                                    placeholder="Rechercher une annonce..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Bouton Filtres */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2 border rounded-md flex items-center gap-2 transition-colors ${showFilters ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter size={20} />
                                Filtres
                            </button>
                        </div>

                        <div className="flex gap-3">
                            {/* Sélection multiple actions */}
                            {selectedAnnonces.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    Supprimer ({selectedAnnonces.length})
                                </button>
                            )}

                            {/* Export */}
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                                <Download size={20} />
                                Exporter
                            </button>

                            {/* Mode d'affichage */}
                            <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-2 ${viewMode === 'table' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
                                >
                                    📊
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
                                >
                                    🔲
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="published">Publiée</option>
                                    <option value="pending">En attente</option>
                                    <option value="draft">Brouillon</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">Tous les types</option>
                                    <option value="Vente">Vente</option>
                                    <option value="Location">Location</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                                <select
                                    value={filterLocation}
                                    onChange={(e) => setFilterLocation(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">Toutes les villes</option>
                                    {locations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Affichage des annonces */}
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
                                            checked={selectedAnnonces.length === filteredAnnonces.length && filteredAnnonces.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Titre</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Propriété</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prix</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stats</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAnnonces.map((annonce) => (
                                    <tr key={annonce.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedAnnonces.includes(annonce.id)}
                                                onChange={() => handleSelectAnnonce(annonce.id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">{annonce.title}</div>
                                            <div className="text-xs text-gray-500">📷 {annonce.photos} photos</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{annonce.property}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${annonce.type === 'Vente' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {annonce.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 font-medium">{annonce.price}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[annonce.status].color}`}>
                                                {statusConfig[annonce.status].icon} {statusConfig[annonce.status].label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">{annonce.date}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs text-gray-600">
                                                <div>👁️ {annonce.views} vues</div>
                                                <div>📞 {annonce.contacts} contacts</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAnnonceDetail(annonce);
                                                        setIsAnnonceDetailModal(true);
                                                    }}
                                                    className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Voir">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="text-green-600 hover:bg-green-50 p-1 rounded" title="Modifier">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="text-purple-600 hover:bg-purple-50 p-1 rounded" title="Dupliquer" onClick={() => handleDuplicate(annonce.id)}>
                                                    <Copy size={16} />
                                                </button>
                                                <button className="text-orange-600 hover:bg-orange-50 p-1 rounded" title="Partager">
                                                    <Share2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(annonce.id)}
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

                    {filteredAnnonces.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Aucune annonce trouvée</p>
                            <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres ou créez une nouvelle annonce</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Vue Grille */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAnnonces.map((annonce) => (
                        <div key={annonce.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="relative">
                                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                    <Home size={64} className="text-white opacity-50" />
                                </div>
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[annonce.status].color}`}>
                                        {statusConfig[annonce.status].icon} {statusConfig[annonce.status].label}
                                    </span>
                                </div>
                                <div className="absolute top-2 left-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedAnnonces.includes(annonce.id)}
                                        onChange={() => handleSelectAnnonce(annonce.id)}
                                        className="rounded"
                                    />
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{annonce.title}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${annonce.type === 'Vente' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {annonce.type}
                                    </span>
                                    <span className="text-green-600 font-semibold">{annonce.price}</span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1 mb-3">
                                    <div>📍 {annonce.location}</div>
                                    <div>📐 {annonce.surface} • 🛏️ {annonce.bedrooms} ch.</div>
                                    <div>📷 {annonce.photos} photos</div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                                    <span>👁️ {annonce.views} vues</span>
                                    <span>📞 {annonce.contacts} contacts</span>
                                    <span>📅 {annonce.date}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedAnnonceDetail(annonce);
                                            setIsAnnonceDetailModal(true);
                                        }}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-1">
                                        <Eye size={16} /> Voir
                                    </button>
                                    <button className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-1">
                                        <Edit2 size={16} /> Modifier
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

