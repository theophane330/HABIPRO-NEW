import React, { useState, useEffect } from 'react';

export default function ContratsDocumentsLocataire() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const documents = [
    {
      id: 1,
      title: "Contrat de Location - Résidence Les Palmiers",
      category: "contracts",
      type: "Contrat de bail",
      date: "2025-10-01",
      size: "2.4 MB",
      pages: 12,
      property: "Résidence Les Palmiers - Cocody",
      status: "active",
      expiryDate: "2026-10-01",
      description: "Contrat de bail d'une durée de 12 mois pour l'appartement 3 pièces situé à Cocody.",
      content: "Ce contrat de location est établi entre Ahmed Bakayoko (propriétaire) et Konan Patrick (locataire) pour l'appartement 3 pièces..."
    },
    {
      id: 2,
      title: "État des Lieux d'Entrée",
      category: "inventory",
      type: "État des lieux",
      date: "2025-10-01",
      size: "1.8 MB",
      pages: 8,
      property: "Résidence Les Palmiers - Cocody",
      status: "completed",
      description: "État des lieux détaillé réalisé à votre entrée avec photos et descriptions de chaque pièce.",
      content: "État des lieux d'entrée effectué le 01/10/2025 en présence du propriétaire et du locataire..."
    },
    {
      id: 3,
      title: "Quittance de Loyer - Octobre 2025",
      category: "receipts",
      type: "Quittance",
      date: "2025-10-05",
      size: "0.5 MB",
      pages: 1,
      property: "Résidence Les Palmiers - Cocody",
      status: "issued",
      description: "Quittance confirmant le paiement de votre loyer pour octobre 2025.",
      content: "Je soussigné Ahmed Bakayoko reconnais avoir reçu de Konan Patrick la somme de 250 000 FCFA pour le loyer du mois d'octobre 2025..."
    },
    {
      id: 4,
      title: "Quittance de Loyer - Septembre 2025",
      category: "receipts",
      type: "Quittance",
      date: "2025-09-05",
      size: "0.5 MB",
      pages: 1,
      property: "Résidence Les Palmiers - Cocody",
      status: "issued",
      description: "Quittance confirmant le paiement de votre loyer pour septembre 2025.",
      content: "Je soussigné Ahmed Bakayoko reconnais avoir reçu de Konan Patrick la somme de 250 000 FCFA pour le loyer du mois de septembre 2025..."
    },
    {
      id: 5,
      title: "Attestation de Résidence",
      category: "certificates",
      type: "Attestation",
      date: "2025-10-10",
      size: "0.3 MB",
      pages: 1,
      property: "Résidence Les Palmiers - Cocody",
      status: "valid",
      description: "Attestation de résidence générée automatiquement pour vos démarches administratives.",
      content: "Je soussigné Ahmed Bakayoko atteste que Konan Patrick réside à l'adresse : Résidence Les Palmiers, Cocody, Abidjan..."
    }
  ];

  const categories = [
    { id: 'all', label: 'Tous les documents', count: documents.length },
    { id: 'contracts', label: 'Contrats', count: documents.filter(d => d.category === 'contracts').length },
    { id: 'inventory', label: 'États des lieux', count: documents.filter(d => d.category === 'inventory').length },
    { id: 'receipts', label: 'Quittances', count: documents.filter(d => d.category === 'receipts').length },
    { id: 'certificates', label: 'Attestations', count: documents.filter(d => d.category === 'certificates').length }
  ];

  const filteredDocuments = selectedCategory === 'all' ? documents : documents.filter(doc => doc.category === selectedCategory);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'completed': return 'bg-blue-100 text-blue-600';
      case 'issued': return 'bg-purple-100 text-purple-600';
      case 'valid': return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Complété';
      case 'issued': return 'Émis';
      case 'valid': return 'Valide';
      default: return 'Inconnu';
    }
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setIsPanelOpen(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    alert("Document reçu. Vérification en cours...");
  };

  return (
    <div className={`flex-1 flex p-4 gap-4 overflow-hidden transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      
      {/* Panel principal gauche */}
      <div className={`transition-all duration-500 ease-in-out ${isPanelOpen ? 'w-1/2' : 'flex-1'}`}>
        
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">📄 Contrat & Documents</h1>
          <p className="text-gray-600 text-sm">Consultez et téléchargez tous vos documents locatifs</p>
        </div>

        {/* Zone d'upload drag & drop */}
        <div
          className={`mb-6 p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">📁</div>
            <div className="text-lg font-semibold text-gray-900 mb-2">Reçu des documents ?</div>
            <div className="text-sm text-gray-600 mb-4">Glissez-déposez les documents PDF ici pour les télécharger</div>
            <input type="file" multiple accept=".pdf" className="hidden" id="fileInput" />
            <label htmlFor="fileInput" className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
              Parcourir les fichiers
            </label>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                  selectedCategory === category.id ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {category.label}
                <span className="ml-2 text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Liste des documents */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Mes Documents ({filteredDocuments.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-16 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-sm">
                    📄
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                        {document.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                          {getStatusText(document.status)}
                        </span>
                        <button
                          onClick={() => handleDocumentClick(document)}
                          className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                        >
                          👁️
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                      <span>{document.type}</span>
                      <span>{document.pages} page(s)</span>
                      <span>{document.size}</span>
                      <span>{new Date(document.date).toLocaleDateString('fr-FR')}</span>
                    </div>

                    <div className="text-xs text-gray-600">
                      <div><strong>Propriété:</strong> {document.property}</div>
                    </div>

                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {document.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel de visualisation à droite */}
      <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-500 ease-in-out ${isPanelOpen ? 'w-1/2' : 'w-80'}`}>
        {!selectedDocument ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Aperçu du document</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl text-gray-300 mb-4">📄</div>
                <div className="text-gray-500">
                  Sélectionnez un document pour le visualiser
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {selectedDocument.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{selectedDocument.type}</span>
                    <span>{selectedDocument.pages} page(s)</span>
                    <span>{selectedDocument.size}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDocument(null);
                    setIsPanelOpen(false);
                  }}
                  className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1 text-xs mb-3">
                <div><strong>Propriété:</strong> {selectedDocument.property}</div>
                <div><strong>Date:</strong> {new Date(selectedDocument.date).toLocaleDateString('fr-FR')}</div>
                {selectedDocument.expiryDate && (
                  <div><strong>Expiration:</strong> {new Date(selectedDocument.expiryDate).toLocaleDateString('fr-FR')}</div>
                )}
              </div>

              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDocument.status)}`}>
                {getStatusText(selectedDocument.status)}
              </span>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Aperçu du contenu</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedDocument.content}
                </p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <div className="text-4xl text-gray-400 mb-3">📄</div>
                <div className="text-sm text-gray-600">
                  Aperçu PDF
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Page 1 sur {selectedDocument.pages}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors">
                  📥 Télécharger
                </button>
                <button className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg font-medium text-sm hover:bg-gray-600 transition-colors">
                  🖨️ Imprimer
                </button>
                <button className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-400 transition-colors">
                  ↗️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}