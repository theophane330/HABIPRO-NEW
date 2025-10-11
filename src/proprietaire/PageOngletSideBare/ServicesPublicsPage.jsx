import React, { useState, useEffect } from 'react';
import { FileText, Building2, Receipt, Home, Zap, Search, Download, Eye, Edit2, Trash2, Filter, X, Calendar, DollarSign, MapPin, TrendingUp, BarChart3, Share2, Copy, RefreshCw, AlertCircle, CheckCircle, Clock, Plus } from 'lucide-react';

export default function ServicesPublicsPage() {
  // Style constants for layout
  const containerStyle = "h-screen flex flex-col overflow-hidden bg-gray-50";
  const headerStyle = "bg-white border-b border-gray-200 p-4 shadow-sm";
  const contentStyle = "flex-1 overflow-hidden flex flex-col min-h-0 p-4";
  const mainContentStyle = "flex-1 bg-white rounded-lg shadow-sm overflow-auto";

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterYear, setFilterYear] = useState('2025');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDossiers, setSelectedDossiers] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [isVisible, setIsVisible] = useState(false);
  const [aiQuery, setAiQuery] = useState('');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const [dossiers, setDossiers] = useState([
    {
      id: 1,
      type: 'Permis de construire',
      reference: 'PC-2025-0145',
      status: 'pending',
      date: '12/09/2025',
      location: 'Cocody',
      description: 'Construction villa 5 pièces',
      icon: Building2
    },
    {
      id: 2,
      type: 'Attestation foncière',
      reference: 'AF-2025-021',
      status: 'completed',
      date: '30/08/2025',
      location: 'Plateau',
      description: 'Titre de propriété terrain 500m²',
      icon: FileText
    },
    {
      id: 3,
      type: 'Taxe foncière',
      reference: 'TX-2025-512',
      status: 'awaiting',
      date: '05/09/2025',
      location: 'Marcory',
      description: 'Paiement annuel 2025',
      icon: Receipt
    },
    {
      id: 4,
      type: 'Enregistrement de bail',
      reference: 'EB-2025-089',
      status: 'completed',
      date: '20/08/2025',
      location: 'Yopougon',
      description: 'Contrat location appartement',
      icon: Home
    },
    {
      id: 5,
      type: 'Raccordement électricité',
      reference: 'RE-2025-234',
      status: 'pending',
      date: '15/09/2025',
      location: 'Bingerville',
      description: 'Nouveau branchement CIE',
      icon: Zap
    }
  ]);

  const services = [
    {
      icon: '🪪',
      title: 'Attestation de propriété',
      description: 'Demande ou vérification d\'un titre foncier',
      action: 'Faire la demande',
      color: 'blue'
    },
    {
      icon: '🧱',
      title: 'Permis de construire',
      description: 'Suivi ou dépôt de dossier de construction',
      action: 'Déposer un dossier',
      color: 'green'
    },
    {
      icon: '🧾',
      title: 'Taxe foncière',
      description: 'Paiement ou vérification du statut fiscal d\'un bien',
      action: 'Accéder au service',
      color: 'purple'
    },
    {
      icon: '🧍‍♂️',
      title: 'Enregistrement de bail',
      description: 'Déclaration officielle du contrat de location',
      action: 'Soumettre un contrat',
      color: 'orange'
    },
    {
      icon: '⚡',
      title: 'Raccordements',
      description: 'Suivi et demande de nouveaux branchements',
      action: 'Faire une demande',
      color: 'yellow'
    }
  ];

  const officialLinks = [
    { icon: '🌐', name: 'Ministère de la Construction et de l\'Urbanisme (MCU)', color: 'blue' },
    { icon: '🏢', name: 'Direction Générale des Impôts (DGI)', sub: 'Paiement de la taxe foncière', color: 'green' },
    { icon: '💧', name: 'SODECI', sub: 'Raccordement à l\'eau', color: 'cyan' },
    { icon: '⚡', name: 'CIE', sub: 'Électricité', color: 'yellow' },
    { icon: '📡', name: 'Opérateurs Internet', sub: 'Orange, MTN, Moov', color: 'purple' }
  ];

  const statusConfig = {
    completed: { label: 'Validé', color: 'bg-green-100 text-green-800', icon: CheckCircle, iconColor: 'text-green-600' },
    pending: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: Clock, iconColor: 'text-yellow-600' },
    awaiting: { label: 'En attente', color: 'bg-red-100 text-red-800', icon: AlertCircle, iconColor: 'text-red-600' }
  };

  const filteredDossiers = dossiers.filter(dossier => {
    const matchesSearch = dossier.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || dossier.status === filterStatus;
    const matchesType = filterType === 'all' || dossier.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectDossier = (id) => {
    setSelectedDossiers(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDossiers.length === filteredDossiers.length) {
      setSelectedDossiers([]);
    } else {
      setSelectedDossiers(filteredDossiers.map(d => d.id));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      setDossiers(prev => prev.filter(d => d.id !== id));
    }
  };

  const totalDossiers = dossiers.length;
  const completedDossiers = dossiers.filter(d => d.status === 'completed').length;
  const pendingDossiers = dossiers.filter(d => d.status === 'pending').length;
  const awaitingDossiers = dossiers.filter(d => d.status === 'awaiting').length;

  return (
    <div className={`
      min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6
      transform transition-all duration-700 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span>🏛️</span> Services Publics & Administratifs
            </h1>
            <p className="text-gray-600 mt-1">Simplifiez vos démarches liées à l'immobilier</p>
          </div>
          <button className="bg-green-600 text-sm hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105">
            <Plus size={18} />
            Nouvelle demande
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Dossiers</p>
                <p className="text-2xl font-bold text-gray-800">{totalDossiers}</p>
              </div>
              <FileText className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Validés</p>
                <p className="text-2xl font-bold text-gray-800">{completedDossiers}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En cours</p>
                <p className="text-2xl font-bold text-gray-800">{pendingDossiers}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En attente</p>
                <p className="text-2xl font-bold text-gray-800">{awaitingDossiers}</p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        {/* Services disponibles - Grille de cartes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🧾</span> Démarches Administratives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {services.map((service, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-green-500 transition-all cursor-pointer group">
                <div className="text-3xl mb-2">{service.icon}</div>
                <h3 className="font-semibold text-sm text-gray-800 mb-1">{service.title}</h3>
                <p className="text-xs text-gray-600 mb-3">{service.description}</p>
                <button className="w-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 text-xs py-2 rounded-md transition-colors">
                  {service.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Barre d'actions */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un dossier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-md flex items-center gap-2 transition-colors ${showFilters ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                <Filter size={20} />
                Filtres
              </button>
            </div>

            <div className="flex gap-3">
              {selectedDossiers.length > 0 && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2">
                  <Trash2 size={20} />
                  Supprimer ({selectedDossiers.length})
                </button>
              )}

              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Download size={20} />
                Exporter
              </button>

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
                  <option value="completed">Validé</option>
                  <option value="pending">En cours</option>
                  <option value="awaiting">En attente</option>
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
                  <option value="Permis de construire">Permis de construire</option>
                  <option value="Attestation foncière">Attestation foncière</option>
                  <option value="Taxe foncière">Taxe foncière</option>
                  <option value="Enregistrement de bail">Enregistrement de bail</option>
                  <option value="Raccordement électricité">Raccordement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Affichage des dossiers */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDossiers.length === filteredDossiers.length && filteredDossiers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type de dossier</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Référence</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Localisation</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDossiers.map((dossier) => {
                  const StatusIcon = statusConfig[dossier.status].icon;
                  const DossierIcon = dossier.icon;
                  return (
                    <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedDossiers.includes(dossier.id)}
                          onChange={() => handleSelectDossier(dossier.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <DossierIcon className="text-gray-600" size={18} />
                          <span className="font-medium text-gray-800">{dossier.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-mono text-sm">{dossier.reference}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{dossier.description}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${statusConfig[dossier.status].color}`}>
                          <StatusIcon size={14} />
                          {statusConfig[dossier.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{dossier.date}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">📍 {dossier.location}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Voir">
                            <Eye size={16} />
                          </button>
                          {dossier.status === 'completed' && (
                            <button className="text-green-600 hover:bg-green-50 p-1 rounded" title="Télécharger">
                              <Download size={16} />
                            </button>
                          )}
                          {dossier.status === 'awaiting' && (
                            <button className="text-purple-600 hover:bg-purple-50 p-1 rounded" title="Régler">
                              <DollarSign size={16} />
                            </button>
                          )}
                          <button className="text-orange-600 hover:bg-orange-50 p-1 rounded" title="Partager">
                            <Share2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(dossier.id)}
                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDossiers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun dossier trouvé</p>
              <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres ou créez une nouvelle demande</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDossiers.map((dossier) => {
            const StatusIcon = statusConfig[dossier.status].icon;
            const DossierIcon = dossier.icon;
            return (
              <div key={dossier.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <div className={`h-32 ${dossier.status === 'completed' ? 'bg-gradient-to-br from-green-400 to-emerald-500' : dossier.status === 'pending' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-red-400 to-pink-500'} flex items-center justify-center`}>
                    <DossierIcon size={48} className="text-white opacity-50" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${statusConfig[dossier.status].color}`}>
                      <StatusIcon size={12} />
                      {statusConfig[dossier.status].label}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedDossiers.includes(dossier.id)}
                      onChange={() => handleSelectDossier(dossier.id)}
                      className="rounded"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{dossier.type}</h3>
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{dossier.reference}</div>
                    <div>{dossier.description}</div>
                    <div>📍 {dossier.location}</div>
                    <div>📅 {dossier.date}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-1 text-sm">
                      <Eye size={16} /> Voir
                    </button>
                    {dossier.status === 'completed' ? (
                      <button className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-1 text-sm">
                        <Download size={16} /> Télécharger
                      </button>
                    ) : dossier.status === 'awaiting' ? (
                      <button className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 flex items-center justify-center gap-1 text-sm">
                        <DollarSign size={16} /> Régler
                      </button>
                    ) : (
                      <button className="flex-1 bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 flex items-center justify-center gap-1 text-sm">
                        <RefreshCw size={16} /> Actualiser
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section Assistant IA */}
      <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📩</span> Assistance Administrative (IA)
        </h2>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🤖</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">Assistant IA</h3>
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Décris ta demande administrative..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              <button className="mt-3 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Obtenir de l'aide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liens officiels */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🌍</span> Liens & Intégrations Officielles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {officialLinks.map((link, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-3xl">{link.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{link.name}</h3>
                {link.sub && <p className="text-xs text-gray-600">{link.sub}</p>}
              </div>
            </div>
          ))}
        </div>
        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
          🔗 Accéder aux portails officiels
        </button>
      </div>
    </div>
  );
}