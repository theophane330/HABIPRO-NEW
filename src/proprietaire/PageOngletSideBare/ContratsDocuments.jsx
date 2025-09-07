"use client";
import React, { useState, useEffect } from 'react';

export default function ContratsDocuments() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    // Données simulées des documents
    const documents = [
        {
            id: 1,
            title: "Contrat de Location - Villa Angré",
            category: "contracts",
            type: "Contrat de bail",
            date: "2024-01-15",
            size: "2.4 MB",
            pages: 8,
            tenant: "Marie Koné",
            property: "Villa Angré 7ème Tranche",
            status: "active",
            preview: "/api/placeholder/300/400",
            description: "Contrat de bail commercial pour la villa située à Angré, d'une durée de 2 ans renouvelable.",
            content: "Ce contrat de location est établi entre le propriétaire Ahmed Bakayoko et la locataire Marie Koné pour la villa située au 7ème tranche d'Angré..."
        },
        {
            id: 2,
            title: "État des Lieux d'Entrée - Cocody Riviera",
            category: "inventory",
            type: "État des lieux",
            date: "2024-01-10",
            size: "1.8 MB",
            pages: 12,
            tenant: "Kader Adeniran",
            property: "Appartement Cocody Riviera",
            status: "completed",
            preview: "/api/placeholder/300/400",
            description: "État des lieux détaillé réalisé à l'entrée du locataire avec photos et descriptions.",
            content: "État des lieux d'entrée effectué le 10 janvier 2024 en présence du propriétaire et du locataire..."
        },
        {
            id: 3,
            title: "Quittance de Loyer - Janvier 2024",
            category: "receipts",
            type: "Quittance",
            date: "2024-01-31",
            size: "0.5 MB",
            pages: 2,
            tenant: "Jean Soro",
            property: "Duplex Marcory",
            status: "issued",
            preview: "/api/placeholder/300/400",
            description: "Quittance de loyer pour le mois de janvier 2024.",
            content: "Je soussigné Ahmed Bakayoko, propriétaire, reconnais avoir reçu de Monsieur Jean Soro la somme de 320 000 FCFA..."
        },
        {
            id: 4,
            title: "Assurance Habitation 2024",
            category: "insurance",
            type: "Police d'assurance",
            date: "2024-01-01",
            size: "3.2 MB",
            pages: 24,
            tenant: "Aminata Bamba",
            property: "Appartement Yopougon",
            status: "valid",
            preview: "/api/placeholder/300/400",
            description: "Police d'assurance multirisque habitation pour l'année 2024.",
            content: "Police d'assurance multirisque habitation n° AH-2024-001 souscrite auprès de..."
        },
        {
            id: 5,
            title: "Avenant au Contrat - Révision Loyer",
            category: "contracts",
            type: "Avenant",
            date: "2023-12-20",
            size: "1.1 MB",
            pages: 4,
            tenant: "Ibrahim Ouattara",
            property: "Studio Plateau Centre",
            status: "signed",
            preview: "/api/placeholder/300/400",
            description: "Avenant pour révision du loyer selon l'indice des prix à la consommation.",
            content: "Avenant n° 1 au contrat de location du studio situé au Plateau Centre..."
        }
    ];

    const categories = [
        { id: 'all', label: 'Tous les documents', count: documents.length },
        { id: 'contracts', label: 'Contrats de bail', count: documents.filter(d => d.category === 'contracts').length },
        { id: 'inventory', label: 'États des lieux', count: documents.filter(d => d.category === 'inventory').length },
        { id: 'receipts', label: 'Quittances', count: documents.filter(d => d.category === 'receipts').length },
        { id: 'insurance', label: 'Assurances', count: documents.filter(d => d.category === 'insurance').length },
    ];

    const filteredDocuments = selectedCategory === 'all' 
        ? documents 
        : documents.filter(doc => doc.category === selectedCategory);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-600';
            case 'completed': return 'bg-blue-100 text-blue-600';
            case 'issued': return 'bg-purple-100 text-purple-600';
            case 'valid': return 'bg-teal-100 text-teal-600';
            case 'signed': return 'bg-orange-100 text-orange-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Actif';
            case 'completed': return 'Terminé';
            case 'issued': return 'Émis';
            case 'valid': return 'Valide';
            case 'signed': return 'Signé';
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
        
        const files = [...e.dataTransfer.files];
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length > 0) {
            alert(`${pdfFiles.length} fichier(s) PDF détecté(s). Upload en cours...`);
        } else {
            alert("Veuillez déposer uniquement des fichiers PDF.");
        }
    };

    return (
        <div className={`
            flex-1 flex p-4 gap-4 overflow-hidden
            transform transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
            {/* Panel principal gauche */}
            <div className={`transition-all duration-500 ease-in-out ${isPanelOpen ? 'w-1/2' : 'flex-1'}`}>
                {/* En-tête */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Contrats & Documents</h1>
                            <p className="text-gray-600">Gestion complète de vos documents immobiliers</p>
                        </div>
                        <button className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                            <span>📄</span>
                            Nouveau document
                        </button>
                    </div>
                </div>

                {/* Zone d'upload drag & drop */}
                <div 
                    className={`mb-6 p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${
                        dragActive 
                            ? 'border-red-400 bg-red-50' 
                            : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        <div className="text-4xl mb-4">📁</div>
                        <div className="text-lg font-semibold text-gray-900 mb-2">
                            Glissez-déposez vos documents PDF ici
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                            ou cliquez pour sélectionner des fichiers
                        </div>
                        <input 
                            type="file" 
                            multiple 
                            accept=".pdf"
                            className="hidden" 
                            id="fileInput"
                        />
                        <label 
                            htmlFor="fileInput"
                            className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
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
                                    selectedCategory === category.id
                                        ? 'bg-red-500 text-white shadow-lg'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600'
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
                    
                    <div className="divide-y divide-gray-100">
                        {filteredDocuments.map((document) => (
                            <div 
                                key={document.id}
                                className="p-4 hover:bg-gray-50 transition-all duration-200"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Preview du document */}
                                    <div className="w-16 h-20 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-sm">
                                        📄
                                    </div>
                                    
                                    {/* Informations du document */}
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
                                                    title="Visualiser le document"
                                                >
                                                    👁️
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                                            <span>{document.type}</span>
                                            <span>{document.pages} pages</span>
                                            <span>{document.size}</span>
                                            <span>{new Date(document.date).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        
                                        <div className="text-xs text-gray-600">
                                            <div><strong>Locataire:</strong> {document.tenant}</div>
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
            <div className={`
                bg-white border border-gray-200 rounded-xl overflow-hidden
                transition-all duration-500 ease-in-out
                ${isPanelOpen ? 'w-1/2' : 'w-80'}
            `}>
                {/* Skeleton/Preview panel */}
                {!selectedDocument ? (
                    <div className="h-full flex flex-col">
                        {/* En-tête du skeleton */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900">Aperçu du document</h3>
                                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                            </div>
                        </div>
                        
                        {/* Corps du skeleton */}
                        <div className="flex-1 p-4">
                            <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl text-gray-300 mb-4">📄</div>
                                    <div className="text-gray-500">
                                        Sélectionnez un document pour le visualiser
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        {/* En-tête avec informations du document */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        {selectedDocument.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>{selectedDocument.type}</span>
                                        <span>{selectedDocument.pages} pages</span>
                                        <span>{selectedDocument.size}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedDocument(null);
                                        setIsPanelOpen(false);
                                    }}
                                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                                    title="Fermer"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="space-y-1 text-xs">
                                <div><strong>Locataire:</strong> {selectedDocument.tenant}</div>
                                <div><strong>Propriété:</strong> {selectedDocument.property}</div>
                                <div><strong>Date:</strong> {new Date(selectedDocument.date).toLocaleDateString('fr-FR')}</div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDocument.status)}`}>
                                    {getStatusText(selectedDocument.status)}
                                </span>
                            </div>
                        </div>
                        
                        {/* Contenu du document */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Aperçu du contenu</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {selectedDocument.content}
                                </p>
                            </div>
                            
                            {/* Simulation d'un viewer PDF */}
                            <div className="bg-gray-100 rounded-lg p-4 text-center">
                                <div className="text-4xl text-gray-400 mb-3">📄</div>
                                <div className="text-sm text-gray-600">
                                    Viewer PDF intégré
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    Page 1 sur {selectedDocument.pages}
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors duration-200">
                                    Télécharger
                                </button>
                                <button className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg font-medium text-sm hover:bg-gray-600 transition-colors duration-200">
                                    Imprimer
                                </button>
                                <button className="px-3 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors duration-200">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}