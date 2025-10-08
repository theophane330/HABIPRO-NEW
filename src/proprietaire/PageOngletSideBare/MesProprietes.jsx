import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Download, Plus, Edit, Trash2, Eye, MapPin, Home, Building } from 'lucide-react';

export default function Properties({ 
  setIsModalOpen,
  formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}) {    
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: "Villa 5 pièces moderne",
      address: "Cocody Angré, Zone 4",
      price: 500000,
      type: "Villa",
      status: "loué",
      tenant: "Jean Kouassi",
      bedrooms: 5,
      bathrooms: 3,
      size: "250m²",
      addedDate: "2024-01-15",
      image: "🏠"
    },
    {
      id: 2,
      title: "Studio moderne centre-ville",
      address: "Yopougon Sicogi",
      price: 100000,
      type: "Studio",
      status: "disponible",
      tenant: null,
      bedrooms: 1,
      bathrooms: 1,
      size: "45m²",
      addedDate: "2024-02-01",
      image: "🏢"
    },
    {
      id: 3,
      title: "Appartement 3 pièces",
      address: "Marcory Résidentiel",
      price: 250000,
      type: "Appartement",
      status: "en_vente",
      tenant: null,
      bedrooms: 3,
      bathrooms: 2,
      size: "120m²",
      addedDate: "2024-01-30",
      image: "🏘️"
    },
    {
      id: 4,
      title: "Duplex luxueux",
      address: "Riviera Golf, Cocody",
      price: 800000,
      type: "Duplex",
      status: "loué",
      tenant: "Marie Diallo",
      bedrooms: 4,
      bathrooms: 3,
      size: "300m²",
      addedDate: "2024-02-10",
      image: "🏛️"
    }
  ]);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'disponible':
        return { label: 'Disponible', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' };
      case 'loué':
        return { label: 'Loué', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
      case 'en_vente':
        return { label: 'En vente', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
      default:
        return { label: 'Inconnu', bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
    }
  };

  const handlePropertyAction = (action, property) => {
    switch (action) {
      case 'edit':
        alert(`Modifier: ${property.title}`);
        break;
      case 'delete':
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${property.title}" ?`)) {
          setProperties(properties.filter(p => p.id !== property.id));
        }
        break;
      case 'view':
        alert(`Voir détails: ${property.title}`);
        break;
      default:
        break;
    }
  };

  const exportData = () => {
    alert('Exportation des données en cours...');
  };

  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className={`
      flex-1 p-6 overflow-y-auto
      transform transition-all duration-700 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mes Propriétés</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre portefeuille immobilier en toute simplicité</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={18} />
          Ajouter Propriété
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par titre, quartier ou type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow duration-300"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="loué">Loué</option>
              <option value="en_vente">En vente</option>
            </select>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List size={18} />
              </button>
            </div>
            <button
              onClick={exportData}
              className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Home size={24} />}
          iconBg="from-green-400 to-teal-500"
          value={properties.length}
          label="Total propriétés"
        />
        <StatCard
          icon={<Building size={24} />}
          iconBg="from-red-400 to-orange-500"
          value={properties.filter(p => p.status === 'loué').length}
          label="Propriétés louées"
        />
        <StatCard
          icon="💰"
          iconBg="from-blue-400 to-indigo-500"
          value={formatCurrency(properties.filter(p => p.status === 'loué').reduce((sum, p) => sum + p.price, 0))}
          label="Revenus mensuels"
        />
      </div>

      {/* Liste des propriétés */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              formatCurrency={formatCurrency}
              getStatusConfig={getStatusConfig}
              handlePropertyAction={handlePropertyAction}
              isNew={new Date(property.addedDate) > new Date(Date.now() - 7*24*60*60*1000)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Propriété</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Adresse</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Prix</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Locataire</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProperties.map(property => (
                <PropertyRow
                  key={property.id}
                  property={property}
                  formatCurrency={formatCurrency}
                  getStatusConfig={getStatusConfig}
                  handlePropertyAction={handlePropertyAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredProperties.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune propriété trouvée</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Ajustez vos critères de recherche pour plus de résultats'
              : 'Ajoutez votre première propriété pour commencer'
            }
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-300"
          >
            Ajouter une propriété
          </button>
        </div>
      )}
    </div>
  );
}

// Sous-composant pour les cartes de stats
function StatCard({ icon, iconBg, value, label }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les cartes en vue grille
function PropertyCard({ property, formatCurrency, getStatusConfig, handlePropertyAction, isNew }) {
  const statusConfig = getStatusConfig(property.status);
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white text-6xl">
          {property.image}
        </div>
        {isNew && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
            Nouveau
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{property.title}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          {property.address}
        </div>
        <div className="text-xl font-bold text-green-600 mb-4">{formatCurrency(property.price)} / mois</div>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>{property.bedrooms} ch.</span>
          <span>{property.bathrooms} sdb</span>
          <span>{property.size}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${statusConfig.dot}`}></div>
            {statusConfig.label}
          </span>
          {property.tenant && (
            <span className="text-xs text-gray-500">👤 {property.tenant}</span>
          )}
        </div>
        <div className="flex justify-between gap-2">
          <button
            onClick={() => handlePropertyAction('view', property)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Eye size={14} />
            Détails
          </button>
          <button
            onClick={() => handlePropertyAction('edit', property)}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handlePropertyAction('delete', property)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les lignes en vue liste
function PropertyRow({ property, formatCurrency, getStatusConfig, handlePropertyAction }) {
  const statusConfig = getStatusConfig(property.status);
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
            {property.image}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{property.title}</div>
            <div className="text-sm text-gray-500">{property.type} • {property.size}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600">{property.address}</td>
      <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(property.price)}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${statusConfig.dot}`}></div>
          {statusConfig.label}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-600">{property.tenant || '-'}</td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => handlePropertyAction('view', property)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handlePropertyAction('edit', property)}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handlePropertyAction('delete', property)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}