"use client";
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export default function ContratsDocuments({ setIsContractModalOpen }) {
    // États
    const [isVisible, setIsVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statistics, setStatistics] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('documents'); // 'documents' ou 'contracts'

    // Fonction pour charger les documents
    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');

            const url = selectedCategory !== 'all'
                ? `${API_BASE_URL}/documents/?category=${selectedCategory}`
                : `${API_BASE_URL}/documents/`;

            console.log('🔍 Fetching documents from:', url);

            const headers = {
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers
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

    // Fonction pour charger les contrats

    const fetchContracts = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/contracts/`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📋 Contracts loaded:', data);

            // Gérer différents formats de réponse
            if (Array.isArray(data)) {
                setContracts(data);
            } else if (data.results) {
                setContracts(data.results);
            } else {
                setContracts([]);
            }
        } catch (error) {
            console.error('❌ Error fetching contracts:', error);
            setContracts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fonction pour charger les statistiques
    const fetchStatistics = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/documents/statistics/`, {
                method: 'GET',
                headers: headers
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
        fetchContracts();
        fetchStatistics();
    }, [fetchDocuments, fetchContracts, fetchStatistics]);

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

            const token = localStorage.getItem('token');
            const headers = {};

            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/documents/upload-multiple/`, {
                method: 'POST',
                headers: headers,
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

    // Supprimer un document ou un contrat
    const deleteDocument = useCallback(async (id) => {
        // Vérifier si c'est un contrat (id commence par "contract_")
        const isContract = String(id).startsWith('contract_');
        const itemType = isContract ? 'contrat' : 'document';

        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ce ${itemType} ?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = {};

            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            let response;
            if (isContract) {
                // Extraire l'ID numérique du contrat
                const contractId = id.replace('contract_', '');
                response = await fetch(`${API_BASE_URL}/contracts/${contractId}/`, {
                    method: 'DELETE',
                    headers: headers
                });
            } else {
                response = await fetch(`${API_BASE_URL}/documents/${id}/`, {
                    method: 'DELETE',
                    headers: headers
                });
            }

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} supprimé avec succès!`);

            if (selectedDocument?.id === id) {
                if (selectedDocument.file_url && selectedDocument.file_url.startsWith('blob:')) {
                    URL.revokeObjectURL(selectedDocument.file_url);
                }
                setSelectedDocument(null);
                setIsPanelOpen(false);
            }

            // Recharger les documents et les contrats
            await fetchDocuments();
            await fetchContracts();
            await fetchStatistics();
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
    }, [selectedDocument, fetchDocuments, fetchContracts, fetchStatistics]);

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

    // Récupérer les documents liés à un contrat
    const fetchContractDocuments = useCallback(async (contractId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Accept: 'application/json' };
            if (token) headers['Authorization'] = `Token ${token}`;

            const resp = await fetch(`${API_BASE_URL}/contracts/${contractId}/documents/`, {
                method: 'GET',
                headers
            });
            if (!resp.ok) throw new Error('Erreur lors du chargement des documents du contrat');
            const docs = await resp.json();
            return Array.isArray(docs) ? docs : [];
        } catch (e) {
            console.error('Contract docs error:', e);
            return [];
        }
    }, []);

    // Prévisualiser un document ou un contrat
    const previewDocument = useCallback(async (documentOrContract) => {
        try {
            // Vérifier si c'est un contrat
            if (typeof documentOrContract === 'object' && documentOrContract.isContract) {
                const contract = documentOrContract.contractData || documentOrContract;
                const linkedDocs = await fetchContractDocuments(contract.id);

                // Trouver le PDF principal du contrat
                const mainPdf = linkedDocs.find(d => d.category === 'contract_pdf');

                // Charger le PDF principal via blob si disponible
                let file_url = null;
                if (mainPdf && mainPdf.url) {
                    try {
                        const token = localStorage.getItem('token');
                        const pdfResponse = await fetch(mainPdf.url, {
                            headers: token ? { 'Authorization': `Token ${token}` } : {}
                        });
                        if (pdfResponse.ok) {
                            const pdfBlob = await pdfResponse.blob();
                            file_url = URL.createObjectURL(pdfBlob);
                        }
                    } catch (e) {
                        console.warn('Could not load PDF as blob, using direct URL:', e);
                        file_url = mainPdf.url;
                    }
                }

                setSelectedDocument({
                    ...documentOrContract,
                    linkedDocs,
                    file_url: file_url
                });
                setIsPanelOpen(true);
                return;
            }

            // C'est un document normal - récupérer depuis l'API
            const id = typeof documentOrContract === 'object' ? documentOrContract.id : documentOrContract;

            // Fetch document metadata
            const token = localStorage.getItem('token');
            const metadataResponse = await fetch(`${API_BASE_URL}/documents/${id}/`, {
                headers: token ? { 'Authorization': `Token ${token}` } : {}
            });
            if (!metadataResponse.ok) {
                throw new Error('Erreur lors de la récupération des métadonnées');
            }
            const metadata = await metadataResponse.json();

            // Fetch PDF as blob
            const pdfResponse = await fetch(`${API_BASE_URL}/documents/${id}/preview/`, {
                headers: token ? { 'Authorization': `Token ${token}` } : {}
            });
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
    }, [fetchContractDocuments]);


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
            count: (statistics?.total || documents.length) + contracts.length
        },
        {
            id: 'contracts',
            label: 'Contrats de bail',
            count: (statistics?.by_category?.contracts || 0) + contracts.length
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

    // Combiner les documents et les contrats pour l'affichage
    const getCombinedDocuments = () => {
        let combined = [...documents];

        // Ajouter les contrats comme documents dans la catégorie 'contracts'
        if (selectedCategory === 'all' || selectedCategory === 'contracts') {
            const contractDocs = contracts.map(contract => ({
                id: `contract_${contract.id}`,
                title: `Contrat ${contract.contract_type} - ${contract.tenant_name}`,
                category: 'contracts',
                type: 'Contrat de bail',
                status: contract.status,
                date: contract.start_date,
                tenant: contract.tenant_name,
                property: contract.property_title,
                amount: contract.amount,
                file_url: contract.contract_pdf,
                pages: '-',
                size: '-',
                isContract: true,
                contractData: contract
            }));
            combined = [...combined, ...contractDocs];
        }

        return combined;
    };

    // Documents filtrés
    const filteredDocuments = selectedCategory === 'all'
        ? getCombinedDocuments()
        : getCombinedDocuments().filter(doc => doc.category === selectedCategory);

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
        // Passer l'objet complet pour que previewDocument puisse détecter si c'est un contrat
        previewDocument(document);
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
                            onClick={() => setIsContractModalOpen && setIsContractModalOpen(true)}
                            className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                            <span>📄</span>
                            Nouveau contrat
                        </button>
                    </div>

                    {/* Onglets Documents / Contrats */}
                    <div className="flex gap-2 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${activeTab === 'documents'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-600 hover:text-red-600'
                                }`}
                        >
                            📄 Documents ({documents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('contracts')}
                            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${activeTab === 'contracts'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-600 hover:text-red-600'
                                }`}
                        >
                            📋 Contrats ({contracts.length})
                        </button>
                    </div>
                </div>

                {/* Zone d'upload drag & drop - uniquement pour l'onglet Documents */}
                {activeTab === 'documents' && (
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
                )}

                {/* Filtres par catégorie - uniquement pour l'onglet Documents */}
                {activeTab === 'documents' && (
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
                )}

                {/* Liste des documents */}
                {activeTab === 'documents' && (
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
                                                    {document.isContract && document.amount && (
                                                        <div><strong>Montant:</strong> {document.amount} FCFA</div>
                                                    )}
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
                )}

                {/* Liste des contrats */}
                {activeTab === 'contracts' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                Mes Contrats ({contracts.length})
                            </h2>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Chargement des contrats...</p>
                            </div>
                        ) : contracts.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-gray-400 text-5xl mb-4">📋</div>
                                <p className="text-gray-600">Aucun contrat trouvé</p>
                                <p className="text-sm text-gray-500 mt-2">Créez votre premier contrat en cliquant sur "Nouveau contrat"</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {contracts.map((contract) => (
                                    <div
                                        key={contract.id}
                                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">📋</span>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            Contrat {contract.contract_type}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {contract.tenant_name} - {contract.property_title}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 ml-10">
                                                    <div>
                                                        <span className="font-medium">Montant:</span> {contract.amount} FCFA
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Date début:</span> {new Date(contract.start_date).toLocaleDateString('fr-FR')}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Statut:</span>
                                                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${contract.status === 'active' ? 'bg-green-100 text-green-700' :
                                                            contract.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                                                contract.status === 'terminated' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {contract.status === 'active' ? 'Actif' :
                                                                contract.status === 'draft' ? 'Brouillon' :
                                                                    contract.status === 'terminated' ? 'Résilié' : 'Expiré'}
                                                        </span>
                                                    </div>
                                                    {contract.end_date && (
                                                        <div>
                                                            <span className="font-medium">Date fin:</span> {new Date(contract.end_date).toLocaleDateString('fr-FR')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
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
                            {selectedDocument.isContract && selectedDocument.contractData ? (
                                // Affichage détaillé pour les contrats
                                <div className="space-y-4">
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-purple-900 mb-3">📋 Détails du contrat</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className="font-medium">{selectedDocument.contractData.contract_type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date de début:</span>
                                                <span className="font-medium">{new Date(selectedDocument.contractData.start_date).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            {selectedDocument.contractData.end_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Date de fin:</span>
                                                    <span className="font-medium">{new Date(selectedDocument.contractData.end_date).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Montant:</span>
                                                <span className="font-bold text-purple-700">{selectedDocument.contractData.amount} FCFA</span>
                                            </div>
                                            {selectedDocument.contractData.security_deposit && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Dépôt de garantie:</span>
                                                    <span className="font-medium">{selectedDocument.contractData.security_deposit}</span>
                                                </div>
                                            )}
                                            {selectedDocument.contractData.payment_method && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Mode de paiement:</span>
                                                    <span className="font-medium">{selectedDocument.contractData.payment_method}</span>
                                                </div>
                                            )}
                                            {selectedDocument.contractData.payment_frequency && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Fréquence:</span>
                                                    <span className="font-medium">{selectedDocument.contractData.payment_frequency}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    

                                    {selectedDocument.contractData.specific_rules && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">📌 Règles spécifiques</h4>
                                            <p className="text-sm text-gray-700 whitespace-pre-line">{selectedDocument.contractData.specific_rules}</p>
                                        </div>
                                    )}

                                    {selectedDocument.contractData.insurance && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">🛡️ Assurance</h4>
                                            <p className="text-sm text-gray-700 whitespace-pre-line">{selectedDocument.contractData.insurance}</p>
                                        </div>
                                    )}

                                    {selectedDocument.file_url && (
                                        <div className="bg-gray-100 rounded-lg overflow-hidden">
                                            <iframe
                                                src={selectedDocument.file_url}
                                                className="w-full h-[600px] border-0"
                                                title="PDF Viewer"
                                            />
                                        </div>
                                    )}

                                    {/* Section Documents liés — à mettre sous Détails du contrat */}
<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
  <h4 className="font-semibold text-gray-900 mb-3">Documents liés</h4>

  {!selectedDocument.linkedDocs || selectedDocument.linkedDocs.length === 0 ? (
    <p className="text-sm text-gray-600">Aucun document lié pour ce contrat.</p>
  ) : (
    <div className="space-y-2">
      {selectedDocument.linkedDocs.map((d, idx) => (
        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{d.title || 'Document'}</p>
            <p className="text-xs text-gray-500">{d.category} • {d.mime}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const response = await fetch(d.url, {
                    headers: token ? { 'Authorization': `Token ${token}` } : {}
                  });
                  if (response.ok) {
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    setSelectedDocument(prev => prev ? { ...prev, file_url: blobUrl } : prev);
                  }
                } catch (e) {
                  console.error('Preview error:', e);
                  setSelectedDocument(prev => prev ? { ...prev, file_url: d.url } : prev);
                }
              }}
            >
              Prévisualiser
            </button>
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ouvrir
            </a>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

                                </div>
                            ) : (
                                // Affichage standard pour les documents
                                <>
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
                                </>
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