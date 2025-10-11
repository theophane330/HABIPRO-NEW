import React, { useState } from 'react';
import { Search, Download, Plus, Eye, Trash2, FileText, Scale, Calendar, Tag, Bell, BookOpen, Filter, CheckCircle, AlertCircle, Clock, Sparkles, BookMarked, Link as LinkIcon } from 'lucide-react';

export default function RegulatoryBase({ 
  setIsRegulatoryModalOpen,
  formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  // Données d'exemple des documents réglementaires
  const [documents, setDocuments] = useState([
    {
      id: 1,
      reference: "LOI N°2018-575",
      title: "Code de la Construction et de l'Habitation",
      domain: "urbanisme",
      type: "loi",
      publicationDate: "2018-06-13",
      updateDate: "2023-01-15",
      status: "en_vigueur",
      authority: "Assemblée Nationale de Côte d'Ivoire",
      summary: "Définit les règles applicables à la construction, la rénovation et l'habitation sur le territoire ivoirien. Comprend les normes de sécurité, d'accessibilité et d'urbanisme.",
      keywords: ["construction", "normes", "urbanisme", "sécurité"],
      fileName: "loi_2018_575_code_construction.pdf",
      fileSize: "3.2 MB",
      pages: 145,
      importance: "haute",
      relatedDocs: [2, 3]
    },
    {
      id: 2,
      reference: "DÉCRET N°2020-342",
      title: "Fixation du loyer à usage d'habitation",
      domain: "location",
      type: "decret",
      publicationDate: "2020-04-22",
      updateDate: "2024-03-10",
      status: "en_vigueur",
      authority: "Ministère de la Construction, du Logement et de l'Urbanisme",
      summary: "Établit les modalités de fixation des loyers pour les logements à usage d'habitation. Définit les critères de révision et les obligations du bailleur.",
      keywords: ["loyer", "location", "bail", "habitation"],
      fileName: "decret_2020_342_loyers.pdf",
      fileSize: "1.8 MB",
      pages: 28,
      importance: "haute",
      relatedDocs: [1, 5]
    },
    {
      id: 3,
      reference: "ARRÊTÉ N°2022-110",
      title: "Sécurité des immeubles collectifs",
      domain: "securite",
      type: "arrete",
      publicationDate: "2022-02-05",
      updateDate: null,
      status: "en_application",
      authority: "Ministère de l'Intérieur et de la Sécurité",
      summary: "Prescrit les mesures de sécurité obligatoires dans les immeubles collectifs : extincteurs, issues de secours, systèmes d'alarme, contrôles périodiques.",
      keywords: ["sécurité", "immeuble", "collectif", "prévention"],
      fileName: "arrete_2022_110_securite.pdf",
      fileSize: "0.9 MB",
      pages: 15,
      importance: "moyenne",
      relatedDocs: [1]
    },
    {
      id: 4,
      reference: "LOI N°2015-678",
      title: "Droit de la propriété foncière",
      domain: "foncier",
      type: "loi",
      publicationDate: "2015-09-01",
      updateDate: "2015-09-01",
      status: "abrogee",
      authority: "Assemblée Nationale de Côte d'Ivoire",
      summary: "Ancienne loi définissant les droits de propriété foncière. Remplacée par la loi N°2023-445 du 15 mars 2023.",
      keywords: ["foncier", "propriété", "titre", "terrain"],
      fileName: "loi_2015_678_foncier.pdf",
      fileSize: "2.5 MB",
      pages: 87,
      importance: "basse",
      relatedDocs: []
    },
    {
      id: 5,
      reference: "CIRCULAIRE N°2023-055",
      title: "TVA sur les locations meublées",
      domain: "fiscalite",
      type: "circulaire",
      publicationDate: "2023-07-18",
      updateDate: "2024-01-10",
      status: "en_vigueur",
      authority: "Direction Générale des Impôts",
      summary: "Précise le régime de TVA applicable aux locations meublées à usage professionnel et touristique. Détaille les obligations déclaratives des bailleurs.",
      keywords: ["TVA", "fiscalité", "location meublée", "impôts"],
      fileName: "circulaire_2023_055_tva.pdf",
      fileSize: "1.2 MB",
      pages: 22,
      importance: "haute",
      relatedDocs: [2]
    },
    {
      id: 6,
      reference: "DÉCRET N°2024-089",
      title: "Performance énergétique des bâtiments",
      domain: "environnement",
      type: "decret",
      publicationDate: "2024-03-12",
      updateDate: null,
      status: "en_application",
      authority: "Ministère de l'Environnement et du Développement Durable",
      summary: "Instaure l'obligation de diagnostic de performance énergétique (DPE) pour les bâtiments neufs et en rénovation. Fixe les normes énergétiques minimales.",
      keywords: ["énergie", "environnement", "DPE", "écologie"],
      fileName: "decret_2024_089_energie.pdf",
      fileSize: "1.5 MB",
      pages: 35,
      importance: "haute",
      relatedDocs: [1]
    }
  ]);

  // Filtrer les documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesDomain = domainFilter === 'all' || doc.domain === domainFilter;
    
    let matchesYear = true;
    if (yearFilter !== 'all') {
      const docYear = new Date(doc.publicationDate).getFullYear().toString();
      matchesYear = docYear === yearFilter;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDomain && matchesYear;
  });

  // Statistiques
  const stats = {
    total: documents.length,
    enVigueur: documents.filter(d => d.status === 'en_vigueur').length,
    enApplication: documents.filter(d => d.status === 'en_application').length,
    abrogees: documents.filter(d => d.status === 'abrogee').length,
    recentUpdates: documents.filter(d => {
      if (!d.updateDate) return false;
      const updateDate = new Date(d.updateDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return updateDate >= thirtyDaysAgo;
    }).length
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'en_vigueur':
        return { 
          label: '✅ En vigueur', 
          className: 'bg-green-100 text-green-600',
          icon: CheckCircle
        };
      case 'en_application':
        return { 
          label: '⚙️ En application', 
          className: 'bg-blue-100 text-blue-600',
          icon: Clock
        };
      case 'abrogee':
        return { 
          label: '❌ Abrogée', 
          className: 'bg-red-100 text-red-600',
          icon: AlertCircle
        };
      default:
        return { 
          label: 'Inconnu', 
          className: 'bg-gray-100 text-gray-600',
          icon: AlertCircle
        };
    }
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case 'loi':
        return { label: 'Loi', icon: Scale, className: 'text-purple-600' };
      case 'decret':
        return { label: 'Décret', icon: FileText, className: 'text-blue-600' };
      case 'arrete':
        return { label: 'Arrêté', icon: BookOpen, className: 'text-green-600' };
      case 'circulaire':
        return { label: 'Circulaire', icon: BookMarked, className: 'text-orange-600' };
      default:
        return { label: 'Document', icon: FileText, className: 'text-gray-600' };
    }
  };

  const getDomainConfig = (domain) => {
    const configs = {
      urbanisme: { label: 'Urbanisme', color: 'bg-purple-100 text-purple-600' },
      location: { label: 'Location', color: 'bg-blue-100 text-blue-600' },
      securite: { label: 'Sécurité', color: 'bg-red-100 text-red-600' },
      foncier: { label: 'Foncier', color: 'bg-green-100 text-green-600' },
      fiscalite: { label: 'Fiscalité', color: 'bg-yellow-100 text-yellow-600' },
      environnement: { label: 'Environnement', color: 'bg-teal-100 text-teal-600' }
    };
    return configs[domain] || { label: domain, color: 'bg-gray-100 text-gray-600' };
  };

  const getImportanceConfig = (importance) => {
    switch (importance) {
      case 'haute':
        return { label: '🔥 Haute', className: 'text-red-600' };
      case 'moyenne':
        return { label: '⚡ Moyenne', className: 'text-orange-600' };
      case 'basse':
        return { label: '📋 Basse', className: 'text-gray-600' };
      default:
        return { label: 'Standard', className: 'text-gray-600' };
    }
  };

  const handleDocumentAction = (action, doc) => {
    switch (action) {
      case 'view':
        setSelectedDocument(doc);
        break;
      case 'delete':
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${doc.reference}" ?`)) {
          setDocuments(documents.filter(d => d.id !== doc.id));
        }
        break;
      case 'download':
        alert(`Téléchargement: ${doc.fileName}`);
        break;
      case 'ai_analyze':
        setShowAIAnalysis(true);
        setSelectedDocument(doc);
        break;
      default:
        break;
    }
  };

  const toggleSelection = (docId) => {
    setSelectedItems(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const downloadSelected = () => {
    if (selectedItems.length === 0) {
      alert('Veuillez sélectionner au moins un document');
      return;
    }
    alert(`Téléchargement groupé de ${selectedItems.length} document(s)`);
  };

  const exportData = () => {
    alert('Exportation de la base réglementaire en cours...');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Générer une analyse IA fictive
  const generateAIAnalysis = (doc) => {
    return {
      summary: `Ce ${getTypeConfig(doc.type).label.toLowerCase()} régit ${doc.domain}. Il établit un cadre juridique précis pour ${doc.keywords.slice(0, 3).join(', ')}.`,
      keyPoints: [
        "Obligations légales des propriétaires et gestionnaires",
        "Sanctions en cas de non-respect des dispositions",
        "Procédures de mise en conformité et délais",
        "Droits et recours des parties concernées"
      ],
      impact: doc.importance === 'haute' ? 'Impact significatif sur la gestion quotidienne' : 'Impact modéré sur les pratiques',
      recommendations: [
        "Mettre à jour les contrats et documents internes",
        "Former les équipes aux nouvelles dispositions",
        "Auditer la conformité des biens gérés",
        "Prévoir un budget pour la mise en conformité si nécessaire"
      ]
    };
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <div className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto">
        {/* En-tête */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Scale className="text-indigo-600" size={28} />
                Base Réglementaire
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Centralisez toutes les lois, décrets et documents officiels liés à la gestion immobilière
              </p>
            </div>
            <div className="flex gap-3">
              {selectedItems.length > 0 && (
                <button
                  onClick={downloadSelected}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  Télécharger ({selectedItems.length})
                </button>
              )}
              <button
                onClick={exportData}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
              >
                <Download size={18} />
                Exporter
              </button>
              <button
                onClick={() => setIsRegulatoryModalOpen && setIsRegulatoryModalOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Ajouter un document
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-600">Total documents</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center text-white">
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.enVigueur}</div>
                <div className="text-xs text-gray-600">En vigueur</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.enApplication}</div>
                <div className="text-xs text-gray-600">En application</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.abrogees}</div>
                <div className="text-xs text-gray-600">Abrogées</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                <Bell size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.recentUpdates}</div>
                <div className="text-xs text-gray-600">MAJ récentes (30j)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher référence, titre, mot-clé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="loi">Loi</option>
              <option value="decret">Décret</option>
              <option value="arrete">Arrêté</option>
              <option value="circulaire">Circulaire</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_vigueur">En vigueur</option>
              <option value="en_application">En application</option>
              <option value="abrogee">Abrogée</option>
            </select>

            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="all">Tous les domaines</option>
              <option value="urbanisme">Urbanisme</option>
              <option value="location">Location</option>
              <option value="securite">Sécurité</option>
              <option value="foncier">Foncier</option>
              <option value="fiscalite">Fiscalité</option>
              <option value="environnement">Environnement</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="all">Toutes les années</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2020">2020</option>
              <option value="2018">2018</option>
              <option value="2015">2015</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredDocuments.map(d => d.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      checked={selectedItems.length === filteredDocuments.length && filteredDocuments.length > 0}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Référence</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Titre du document</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Domaine</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Date publication</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Statut</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => {
                  const statusConfig = getStatusConfig(doc.status);
                  const typeConfig = getTypeConfig(doc.type);
                  const domainConfig = getDomainConfig(doc.domain);
                  const importanceConfig = getImportanceConfig(doc.importance);
                  
                  return (
                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(doc.id)}
                          onChange={() => toggleSelection(doc.id)}
                          className="rounded"
                        />
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="font-semibold text-indigo-600">{doc.reference}</div>
                        <div className={`text-xs ${importanceConfig.className} font-medium`}>
                          {importanceConfig.label}
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 max-w-xs">{doc.title}</div>
                        <div className="text-sm text-gray-500 mt-1">{doc.pages} pages • {doc.fileSize}</div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${domainConfig.color}`}>
                          {domainConfig.label}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className={`flex items-center gap-2 ${typeConfig.className}`}>
                          <typeConfig.icon size={16} />
                          <span className="text-sm font-medium">{typeConfig.label}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{formatDate(doc.publicationDate)}</div>
                        {doc.updateDate && doc.updateDate !== doc.publicationDate && (
                          <div className="text-xs text-gray-500">MAJ: {formatDate(doc.updateDate)}</div>
                        )}
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDocumentAction('view', doc)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDocumentAction('ai_analyze', doc)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Analyse IA"
                          >
                            <Sparkles size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDocumentAction('download', doc)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Télécharger"
                          >
                            <Download size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDocumentAction('delete', doc)}
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

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun document trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Commencez par ajouter votre premier document réglementaire'
              }
            </p>
            <button
              onClick={() => setIsRegulatoryModalOpen && setIsRegulatoryModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
            >
              Ajouter un document
            </button>
          </div>
        )}

        {/* Alertes */}
        {stats.recentUpdates > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Bell className="text-yellow-600" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-900">
                  🔔 {stats.recentUpdates} mise(s) à jour récente(s)
                </h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Des documents ont été mis à jour au cours des 30 derniers jours. Consultez les modifications.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal de détails du document */}
        {selectedDocument && !showAIAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Scale className="text-indigo-600" size={24} />
                  {selectedDocument.reference}
                </h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* En-tête du document */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedDocument.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusConfig(selectedDocument.status).className}`}>
                      {getStatusConfig(selectedDocument.status).label}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getDomainConfig(selectedDocument.domain).color}`}>
                      {getDomainConfig(selectedDocument.domain).label}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getImportanceConfig(selectedDocument.importance).className} bg-gray-100`}>
                      {getImportanceConfig(selectedDocument.importance).label}
                    </span>
                  </div>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-indigo-600" />
                      Informations du document
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`${getTypeConfig(selectedDocument.type).className}`}>
                          {React.createElement(getTypeConfig(selectedDocument.type).icon, { size: 16 })}
                        </span>
                        <strong>Type:</strong> {getTypeConfig(selectedDocument.type).label}
                      </div>
                      <div><strong>Fichier:</strong> {selectedDocument.fileName}</div>
                      <div><strong>Taille:</strong> {selectedDocument.fileSize} ({selectedDocument.pages} pages)</div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <strong>Publication:</strong> {formatDate(selectedDocument.publicationDate)}
                      </div>
                      {selectedDocument.updateDate && selectedDocument.updateDate !== selectedDocument.publicationDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-yellow-600" />
                          <strong>Mise à jour:</strong> {formatDate(selectedDocument.updateDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Scale size={18} className="text-purple-600" />
                      Autorité & Juridiction
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Autorité émettrice:</strong></div>
                      <div className="text-gray-700 pl-2">{selectedDocument.authority}</div>
                      <div className="mt-3"><strong>Domaine d'application:</strong></div>
                      <div className="text-gray-700 pl-2">{getDomainConfig(selectedDocument.domain).label}</div>
                    </div>
                  </div>
                </div>

                {/* Résumé */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-600" />
                    Résumé du contenu
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedDocument.summary}
                  </p>
                </div>

                {/* Mots-clés */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Tag size={18} className="text-gray-600" />
                    Mots-clés
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Documents liés */}
                {selectedDocument.relatedDocs.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <LinkIcon size={18} className="text-gray-600" />
                      Documents liés
                    </h4>
                    <div className="space-y-2">
                      {selectedDocument.relatedDocs.map(relatedId => {
                        const relatedDoc = documents.find(d => d.id === relatedId);
                        if (!relatedDoc) return null;
                        return (
                          <div key={relatedId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div>
                              <div className="font-medium text-gray-900">{relatedDoc.reference}</div>
                              <div className="text-sm text-gray-600">{relatedDoc.title}</div>
                            </div>
                            <button
                              onClick={() => setSelectedDocument(relatedDoc)}
                              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                              Voir →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDocumentAction('download', selectedDocument)}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Télécharger PDF
                  </button>
                  <button
                    onClick={() => handleDocumentAction('ai_analyze', selectedDocument)}
                    className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    Analyse IA
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'analyse IA */}
        {selectedDocument && showAIAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="text-purple-600" size={24} />
                  Analyse IA - {selectedDocument.reference}
                </h3>
                <button
                  onClick={() => {
                    setShowAIAnalysis(false);
                    setSelectedDocument(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {(() => {
                  const analysis = generateAIAnalysis(selectedDocument);
                  return (
                    <>
                      {/* Résumé IA */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          🧠 Résumé automatique
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {analysis.summary}
                        </p>
                      </div>

                      {/* Points clés */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          📌 Points clés identifiés
                        </h4>
                        <ul className="space-y-2">
                          {analysis.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-blue-600 font-bold">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Impact */}
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          ⚡ Évaluation de l'impact
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {analysis.impact}
                        </p>
                      </div>

                      {/* Recommandations */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          ✅ Recommandations d'action
                        </h4>
                        <ul className="space-y-2">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-green-600 font-bold">✓</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Note */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 italic">
                          💡 Cette analyse est générée automatiquement par IA. Pour une interprétation juridique précise, consultez un expert juridique qualifié.
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => alert('Export de l\'analyse en PDF')}
                          className="flex-1 bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          Exporter l'analyse
                        </button>
                        <button
                          onClick={() => setShowAIAnalysis(false)}
                          className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                        >
                          Retour aux détails
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}