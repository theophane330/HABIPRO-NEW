"use client";
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export default function ContratsDocuments() {
    // États
    const [isVisible, setIsVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statistics, setStatistics] = useState(null);
    const [error, setError] = useState(null);

    // Fonction pour charger les documents
    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const url = selectedCategory !== 'all' 
                ? `${API_BASE_URL}/documents/?category=${selectedCategory}`
                : `${API_BASE_URL}/documents/`;
            
            console.log('🔍 Fetching documents from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Documents loaded:', data);
            
            // Gérer différents formats de réponse
            if (Array.isArray(data)) {
                setDocuments(data);
            } else if (data.results) {
                setDocuments(data.results);
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error('❌ Error fetching documents:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    // Fonction pour charger les statistiques
    const fetchStatistics = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/documents/statistics/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Statistics loaded:', data);
            setStatistics(data);
        } catch (error) {
            console.error('❌ Error fetching statistics:', error);
        }
    }, []);

    // Effet d'initialisation
    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
        fetchDocuments();
        fetchStatistics();
    }, [fetchDocuments, fetchStatistics]);

    // Effet pour recharger quand la catégorie change
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Upload multiple de fichiers
    const uploadMultiple = useCallback(async (files, additionalData = {}) => {
        try {
            setUploading(true);
            setUploadProgress(0);
            const formData = new FormData();
            
            // Ajouter tous les fichiers
            files.forEach(file => {
                formData.append('files', file);
            });
            
            // Ajouter les métadonnées
            formData.append('category', additionalData.category || selectedCategory);
            if (additionalData.tenant) formData.append('tenant', additionalData.tenant);
            if (additionalData.property) formData.append('property', additionalData.property);
            if (additionalData.status) formData.append('status', additionalData.status);

            // Animation de progression
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch(`${API_BASE_URL}/documents/upload-multiple/`, {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'upload');
            }

            const result = await response.json();
            console.log('✅ Upload result:', result);
            
            alert(`${result.total_uploaded} fichier(s) uploadé(s) avec succès!`);
            
            // Recharger les documents et statistiques
            await fetchDocuments();
            await fetchStatistics();
            
            return result;
        } catch (error) {
            console.error('❌ Upload error:', error);
            alert(`Erreur lors de l'upload: ${error.message}`);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [selectedCategory, fetchDocuments, fetchStatistics]);

    // Supprimer un document
    const deleteDocument = useCallback(async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/documents/${id}/`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            alert('Document supprimé avec succès!');
            
            if (selectedDocument?.id === id) {
                if (selectedDocument.file_url && selectedDocument.file_url.startsWith('blob:')) {
                    URL.revokeObjectURL(selectedDocument.file_url);
                }
                setSelectedDocument(null);
                setIsPanelOpen(false);
            }
            
            await fetchDocuments();
            await fetchStatistics();
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
    }, [selectedDocument, fetchDocuments, fetchStatistics]);

    // Télécharger un document
    const downloadDocument = useCallback(async (id, title) => {
        try {
            const response = await fetch(`${API_BASE_URL}/documents/${id}/download/`);
            
            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('❌ Download error:', error);
            alert(`Erreur lors du téléchargement: ${error.message}`);
        }
    }, []);

    // Prévisualiser un document
    const previewDocument = useCallback(async (id) => {
        try {
            // Fetch document metadata
            const metadataResponse = await fetch(`${API_BASE_URL}/documents/${id}/`);
            if (!metadataResponse.ok) {
                throw new Error('Erreur lors de la récupération des métadonnées');
            }
            const metadata = await metadataResponse.json();

            // Fetch PDF as blob
            const pdfResponse = await fetch(`${API_BASE_URL}/documents/${id}/preview/`);
            if (!pdfResponse.ok) {
                throw new Error('Erreur lors du chargement du PDF');
            }
            const pdfBlob = await pdfResponse.blob();
            const localUrl = URL.createObjectURL(pdfBlob);

            // Set document with local URL
            setSelectedDocument({ ...metadata, file_url: localUrl });
            setIsPanelOpen(true);
        } catch (error) {
            console.error('❌ Preview error:', error);
            alert(`Erreur lors de la prévisualisation: ${error.message}`);
        }
    }, []);

    // Fermer le panel avec cleanup
    const closePanel = useCallback(() => {
        if (selectedDocument?.file_url && selectedDocument.file_url.startsWith('blob:')) {
            URL.revokeObjectURL(selectedDocument.file_url);
        }
        setSelectedDocument(null);
        setIsPanelOpen(false);
    }, [selectedDocument]);

    // Catégories
    const categories = [
        { 
            id: 'all', 
            label: 'Tous les documents', 
            count: statistics?.total || documents.length 
        },
        { 
            id: 'contracts', 
            label: 'Contrats de bail', 
            count: statistics?.by_category?.contracts || 0
        },
        { 
            id: 'inventory', 
            label: 'États des lieux', 
            count: statistics?.by_category?.inventory || 0
        },
        { 
            id: 'receipts', 
            label: 'Quittances', 
            count: statistics?.by_category?.receipts || 0
        },
        { 
            id: 'insurance', 
            label: 'Assurances', 
            count: statistics?.by_category?.insurance || 0
        },
    ];

    // Documents filtrés
    const filteredDocuments = selectedCategory === 'all' 
        ? documents 
        : documents.filter(doc => doc.category === selectedCategory);

    // Couleur du statut
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

    // Texte du statut
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

    // Gestion du clic sur un document
    const handleDocumentClick = useCallback((document) => {
        previewDocument(document.id);
    }, [previewDocument]);

    // Gestion du drag & drop
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = [...e.dataTransfer.files];
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length > 0) {
            uploadMultiple(pdfFiles, { 
                category: selectedCategory !== 'all' ? selectedCategory : 'contracts',
                tenant: 'Non spécifié',
                property: 'Non spécifiée',
                status: 'active'
            });
        } else {
            alert("Veuillez déposer uniquement des fichiers PDF.");
        }
    }, [selectedCategory, uploadMultiple]);

    const handleFileInput = useCallback((e) => {
        const files = [...e.target.files];
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length > 0) {
            uploadMultiple(pdfFiles, { 
                category: selectedCategory !== 'all' ? selectedCategory : 'contracts',
                tenant: 'Non spécifié',
                property: 'Non spécifiée',
                status: 'active'
            });
        }
        
        e.target.value = '';
    }, [selectedCategory, uploadMultiple]);

    return (
        <div className={`flex-1 flex p-4 gap-4 overflow-hidden transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Panel principal gauche */}
            <div className={`transition-all duration-500 ease-in-out ${isPanelOpen ? 'w-1/2' : 'flex-1'}`}>
                {/* En-tête */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Contrats & Documents</h1>
                            <p className="text-gray-600">Gestion complète de vos documents immobiliers</p>
                        </div>
                        <button 
                            onClick={() => document.getElementById('fileInput').click()}
                            className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                            disabled={uploading}
                        >
                            <span>📄</span>
                            {uploading ? 'Upload en cours...' : 'Nouveau document'}
                        </button>
                    </div>
                </div>

                {/* Zone d'upload drag & drop */}
                <div 
                    className={`mb-6 p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${dragActive ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50'}`}
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
                        
                        {uploading && (
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                    <div 
                                        className="bg-red-500 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600">{uploadProgress}% uploadé</p>
                            </div>
                        )}
                        
                        <input 
                            type="file" 
                            multiple 
                            accept=".pdf"
                            className="hidden" 
                            id="fileInput"
                            onChange={handleFileInput}
                            disabled={uploading}
                        />
                        <label 
                            htmlFor="fileInput"
                            className={`inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${selectedCategory === category.id ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600'}`}
                                disabled={loading}
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
                    
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des documents...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-600">
                            <div className="text-4xl mb-4">⚠️</div>
                            <p className="mb-2">Erreur: {error}</p>
                            <button 
                                onClick={fetchDocuments}
                                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <div className="text-4xl mb-4">📄</div>
                            <p>Aucun document disponible</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {filteredDocuments.map((document) => (
                                <div 
                                    key={document.id}
                                    className="p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                    onClick={() => handleDocumentClick(document)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-20 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-sm">
                                            📄
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                                                    {document.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                                                        {getStatusText(document.status)}
                                                    </span>
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
                                            
                                            {document.description && (
                                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                                    {document.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Panel de visualisation à droite */}
            <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-500 ease-in-out ${isPanelOpen ? 'w-1/2' : 'w-80'}`}>
                {!selectedDocument ? (
                    <div className="h-full flex flex-col">
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
                                    onClick={closePanel}
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
                        
                        <div className="flex-1 overflow-y-auto p-4">
                            {selectedDocument.content && (
                                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Aperçu du contenu</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {selectedDocument.content}
                                    </p>
                                </div>
                            )}
                            
                            {selectedDocument.file_url ? (
                                <div className="bg-gray-100 rounded-lg overflow-hidden">
                                    <iframe
                                        src={selectedDocument.file_url}
                                        className="w-full h-[600px] border-0"
                                        title="PDF Viewer"
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-lg p-4 text-center">
                                    <div className="text-4xl text-gray-400 mb-3">📄</div>
                                    <div className="text-sm text-gray-600">
                                        Fichier PDF disponible
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        Page 1 sur {selectedDocument.pages}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadDocument(selectedDocument.id, selectedDocument.title);
                                    }}
                                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors duration-200"
                                >
                                    Télécharger
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedDocument.file_url) {
                                            window.open(selectedDocument.file_url, '_blank');
                                        }
                                    }}
                                    className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg font-medium text-sm hover:bg-gray-600 transition-colors duration-200"
                                >
                                    Imprimer
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteDocument(selectedDocument.id);
                                    }}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors duration-200"
                                >
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