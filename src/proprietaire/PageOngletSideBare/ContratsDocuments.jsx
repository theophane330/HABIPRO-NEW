import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Eye, Edit, Trash2, FileText, Calendar, AlertTriangle, CheckCircle, Clock, File, Image, FileSpreadsheet } from 'lucide-react';

export default function Contracts({ 
  setIsContractModalOpen,
  formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [previewDocument, setPreviewDocument] = useState(null);

  // Données d'exemple des contrats et documents
  const [contracts, setContracts] = useState([
    {
      id: 1,
      tenantName: "Jean Kouassi",
      property: "Villa 5p Cocody",
      propertyId: 1,
      documentType: "contrat_bail",
      fileName: "contrat_bail_jean_kouassi_2025.pdf",
      startDate: "2025-08-01",
      endDate: "2026-07-31",
      status: "actif",
      fileType: "pdf",
      fileSize: "2.4 MB",
      uploadDate: "2025-07-15",
      rent: 500000,
      deposit: 1000000
    },
    {
      id: 2,
      tenantName: "Mariam Diallo",
      property: "Studio Yopougon",
      propertyId: 2,
      documentType: "contrat_bail",
      fileName: "contrat_bail_mariam_diallo_2023.pdf",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      status: "expire",
      fileType: "pdf",
      fileSize: "1.8 MB",
      uploadDate: "2022-12-15",
      rent: 100000,
      deposit: 200000
    },
    {
      id: 3,
      tenantName: "Paul Adjoua",
      property: "Appartement Plateau",
      propertyId: 3,
      documentType: "document_juridique",
      fileName: "attestation_domicile_paul.pdf",
      startDate: "2025-05-15",
      endDate: null,
      status: "en_attente",
      fileType: "pdf",
      fileSize: "0.9 MB",
      uploadDate: "2025-05-15",
      rent: null,
      deposit: null
    },
    {
      id: 4,
      tenantName: "Awa Traoré",
      property: "Villa Riviera",
      propertyId: 4,
      documentType: "contrat_bail",
      fileName: "contrat_bail_awa_traore_2025.pdf",
      startDate: "2025-06-01",
      endDate: "2026-05-31",
      status: "actif",
      fileType: "pdf",
      fileSize: "2.7 MB",
      uploadDate: "2025-05-20",
      rent: 750000,
      deposit: 1500000
    },
    {
      id: 5,
      tenantName: "Koffi Assouan",
      property: "Villa 5p Cocody",
      propertyId: 1,
      documentType: "justificatif",
      fileName: "facture_eau_electricite_2025.jpg",
      startDate: null,
      endDate: null,
      status: "actif",
      fileType: "image",
      fileSize: "1.2 MB",
      uploadDate: "2025-08-10",
      rent: null,
      deposit: null
    },
    {
      id: 6,
      tenantName: "Marie Bamba",
      property: "Studio Yopougon",
      propertyId: 2,
      documentType: "attestation",
      fileName: "attestation_assurance_2025.docx",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "expire_bientot",
      fileType: "doc",
      fileSize: "0.5 MB",
      uploadDate: "2024-12-28",
      rent: null,
      deposit: null
    }
  ]);

  // Liste des propriétés pour le filtre
  const properties = [
    { id: 1, name: "Villa 5p Cocody" },
    { id: 2, name: "Studio Yopougon" },
    { id: 3, name: "Appartement Plateau" },
    { id: 4, name: "Villa Riviera" }
  ];

  // Filtrer les contrats
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.documentType === typeFilter;
    const matchesProperty = propertyFilter === 'all' || contract.propertyId.toString() === propertyFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesProperty;
  });

  // Calcul des statistiques
  const stats = {
    totalActive: contracts.filter(c => c.status === 'actif').length,
    totalExpired: contracts.filter(c => c.status === 'expire').length,
    totalPending: contracts.filter(c => c.status === 'en_attente').length,
    expiringThisMonth: contracts.filter(c => {
      if (!c.endDate || c.status !== 'actif') return false;
      const endDate = new Date(c.endDate);
      const now = new Date();
      const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      return endDate <= monthFromNow && endDate >= now;
    }).length
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'actif':
        return { 
          label: '✅ Actif', 
          className: 'bg-green-100 text-green-600',
          icon: CheckCircle,
          color: 'text-green-600'
        };
      case 'expire':
        return { 
          label: '❌ Expiré', 
          className: 'bg-red-100 text-red-600',
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      case 'en_attente':
        return { 
          label: '🟡 En attente', 
          className: 'bg-yellow-100 text-yellow-600',
          icon: Clock,
          color: 'text-yellow-600'
        };
      case 'expire_bientot':
        return { 
          label: '🟠 Expire bientôt', 
          className: 'bg-orange-100 text-orange-600',
          icon: AlertTriangle,
          color: 'text-orange-600'
        };
      default:
        return { 
          label: 'Inconnu', 
          className: 'bg-gray-100 text-gray-600',
          icon: AlertTriangle,
          color: 'text-gray-600'
        };
    }
  };

  const getDocumentTypeConfig = (type) => {
    switch (type) {
      case 'contrat_bail':
        return { label: 'Contrat de bail', icon: FileText, className: 'text-blue-600' };
      case 'document_juridique':
        return { label: 'Document juridique', icon: File, className: 'text-purple-600' };
      case 'justificatif':
        return { label: 'Justificatif', icon: FileSpreadsheet, className: 'text-green-600' };
      case 'attestation':
        return { label: 'Attestation', icon: FileText, className: 'text-indigo-600' };
      default:
        return { label: 'Document', icon: File, className: 'text-gray-600' };
    }
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return { icon: FileText, className: 'text-red-600' };
      case 'image':
      case 'jpg':
      case 'png':
        return { icon: Image, className: 'text-green-600' };
      case 'doc':
      case 'docx':
        return { icon: FileSpreadsheet, className: 'text-blue-600' };
      default:
        return { icon: File, className: 'text-gray-600' };
    }
  };

  const handleContractAction = (action, contract) => {
    switch (action) {
      case 'view':
        alert(`Prévisualisation: ${contract.fileName}`);
        break;
      case 'edit':
        alert(`Modifier: ${contract.fileName}`);
        break;
      case 'delete':
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${contract.fileName}" ?`)) {
          setContracts(contracts.filter(c => c.id !== contract.id));
        }
        break;
      case 'download':
        alert(`Téléchargement: ${contract.fileName}`);
        break;
      case 'preview':
        setPreviewDocument(contract);
        break;
      default:
        break;
    }
  };

  const exportData = () => {
    alert('Exportation des contrats en cours...');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const isExpiringsoon = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return end <= monthFromNow && end >= now;
  };

  const getDaysUntilExpiry = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex-1 flex p-4 gap-4 overflow-y-auto">
      <div className="flex-1">
        {/* En-tête avec titre et boutons */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contrats & Documents</h1>
            <p className="text-gray-600 text-sm mt-1">Gérez tous vos contrats et documents juridiques</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportData}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
            >
              <Download size={18} />
              Exporter
            </button>
            <button
              onClick={() => setIsContractModalOpen && setIsContractModalOpen(true)}
              className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
            >
              <Plus size={20} />
              Ajouter un contrat
            </button>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center text-white">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalActive}</div>
                <div className="text-sm text-gray-600">Contrats actifs</div>
                <div className="text-xs text-green-600 font-semibold">
                  ✅ En cours
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalExpired}</div>
                <div className="text-sm text-gray-600">Contrats expirés</div>
                <div className="text-xs text-red-600 font-semibold">
                  ❌ À renouveler
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPending}</div>
                <div className="text-sm text-gray-600">En attente</div>
                <div className="text-xs text-yellow-600 font-semibold">
                  🟡 Signature
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white">
                <Calendar size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.expiringThisMonth}</div>
                <div className="text-sm text-gray-600">Expirent ce mois</div>
                <div className="text-xs text-orange-600 font-semibold">
                  🟠 Urgent
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom, fichier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="expire">Expiré</option>
              <option value="en_attente">En attente</option>
              <option value="expire_bientot">Expire bientôt</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="contrat_bail">Contrat de bail</option>
              <option value="document_juridique">Document juridique</option>
              <option value="justificatif">Justificatif</option>
              <option value="attestation">Attestation</option>
            </select>

            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
            >
              <option value="all">Toutes les propriétés</option>
              {properties.map(property => (
                <option key={property.id} value={property.id.toString()}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau des contrats */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Document</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Locataire/Propriétaire</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Propriété</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Période</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Statut</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => {
                  const statusConfig = getStatusConfig(contract.status);
                  const docTypeConfig = getDocumentTypeConfig(contract.documentType);
                  const fileTypeConfig = getFileTypeIcon(contract.fileType);
                  const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
                  const isExpiringSoon = isExpiringsoon(contract.endDate);
                  
                  return (
                    <tr key={contract.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isExpiringSoon ? 'bg-orange-50' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${fileTypeConfig.className}`}>
                            <fileTypeConfig.icon size={18} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{contract.fileName}</div>
                            <div className="text-xs text-gray-500">{contract.fileSize}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{contract.tenantName}</div>
                        {contract.rent && (
                          <div className="text-sm text-green-600 font-medium">
                            Loyer: {formatCurrency(contract.rent)}
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-4 text-gray-600">{contract.property}</td>
                      
                      <td className="py-4 px-4">
                        <div className={`flex items-center gap-2 ${docTypeConfig.className}`}>
                          <docTypeConfig.icon size={16} />
                          <span className="text-sm font-medium">{docTypeConfig.label}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {formatDate(contract.startDate)}
                          </div>
                          {contract.endDate && (
                            <div className={`text-sm ${isExpiringSoon || contract.status === 'expire' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              → {formatDate(contract.endDate)}
                              {daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30 && (
                                <div className="text-xs text-orange-600 font-semibold">
                                  Dans {daysUntilExpiry} jour(s)
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleContractAction('view', contract)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Prévisualiser"
                          >
                            <Eye size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleContractAction('download', contract)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Télécharger"
                          >
                            <Download size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleContractAction('edit', contract)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleContractAction('delete', contract)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun contrat trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || propertyFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Commencez par ajouter votre premier contrat'
              }
            </p>
            <button
              onClick={() => setIsContractModalOpen && setIsContractModalOpen(true)}
              className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
            >
              Ajouter un contrat
            </button>
          </div>
        )}

        {/* Alertes importantes */}
        {stats.expiringThisMonth > 0 && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-orange-600" size={24} />
              <div>
                <h3 className="font-semibold text-orange-900">
                  🟠 Attention: {stats.expiringThisMonth} contrat(s) expirent ce mois
                </h3>
                <p className="text-orange-700 text-sm mt-1">
                  Contactez les locataires pour renouveler les contrats arrivant à échéance.
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.totalExpired > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              <div>
                <h3 className="font-semibold text-red-900">
                  ❌ {stats.totalExpired} contrat(s) expirés
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  Des contrats ont expiré et nécessitent un renouvellement urgent.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal de prévisualisation */}
        {previewDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Prévisualisation: {previewDocument.fileName}
                </h3>
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 h-96 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText size={64} className="mx-auto mb-4" />
                  <p>Prévisualisation du document</p>
                  <p className="text-sm">{previewDocument.fileName}</p>
                  <button
                    onClick={() => handleContractAction('download', previewDocument)}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}