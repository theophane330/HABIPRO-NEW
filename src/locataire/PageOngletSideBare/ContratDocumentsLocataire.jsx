import React, { useState, useEffect, useCallback } from 'react';
import { FileText, X, Eye, Download, Calendar, DollarSign, Home, User, Shield, FileCheck } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ContratsDocumentsLocataire = () => {
    const [contracts, setContracts] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('contracts');
    const [loading, setLoading] = useState(false);

    // Charger les contrats du locataire
    const fetchContracts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/contracts/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erreur lors du chargement des contrats');

            const data = await response.json();
            setContracts(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Erreur:', error);
            setContracts([]);
        }
    }, []);

    // Charger les documents du locataire
    const fetchDocuments = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/documents/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erreur lors du chargement des documents');

            const data = await response.json();
            setDocuments(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Erreur:', error);
            setDocuments([]);
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
            console.error('Erreur de prévisualisation:', error);
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

    // Télécharger un document
    const downloadDocument = useCallback(async (id, title) => {
        try {
            const response = await fetch(`${API_BASE_URL}/documents/${id}/download/`);
            if (!response.ok) throw new Error('Erreur lors du téléchargement');

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
            console.error('Erreur de téléchargement:', error);
            alert(`Erreur lors du téléchargement: ${error.message}`);
        }
    }, []);

    useEffect(() => {
        fetchContracts();
        fetchDocuments();
    }, [fetchContracts, fetchDocuments]);

    // Formater les contrats pour l'affichage
    const formatContractForDisplay = (contract) => ({
        id: `contract_${contract.id}`,
        title: `Contrat ${contract.contract_type} - ${contract.property_title || 'Propriété'}`,
        type: contract.contract_type,
        date: contract.start_date,
        status: contract.status,
        amount: contract.amount,
        property: contract.property_title,
        propertyAddress: contract.property_address,
        startDate: contract.start_date,
        endDate: contract.end_date,
        isContract: true,
        contractData: contract
    });

    const formattedContracts = contracts.map(formatContractForDisplay);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'active': { label: 'Actif', color: 'bg-green-100 text-green-600' },
            'draft': { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
            'terminated': { label: 'Résilié', color: 'bg-red-100 text-red-600' },
            'expired': { label: 'Expiré', color: 'bg-orange-100 text-orange-600' }
        };
        const config = statusConfig[status] || statusConfig.draft;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* En-tête */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Contrats & Documents</h1>
                    <p className="text-gray-600 mt-1">Consultez vos contrats et documents de location</p>
                </div>

                {/* Onglets */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('contracts')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'contracts'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <FileText className="inline-block mr-2" size={16} />
                            Contrats ({formattedContracts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'documents'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <FileCheck className="inline-block mr-2" size={16} />
                            Documents ({documents.length})
                        </button>
                    </nav>
                </div>

                {/* Contenu */}
                <div className="grid gap-4">
                    {activeTab === 'contracts' && formattedContracts.map((contract) => (
                        <div
                            key={contract.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => previewDocument(contract)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="text-purple-600" size={20} />
                                        <h3 className="font-semibold text-gray-800">{contract.title}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Home size={16} />
                                            <span>{contract.property}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>{contract.startDate} → {contract.endDate || 'Indéterminé'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} />
                                            <span>{parseInt(contract.amount).toLocaleString()} FCFA</span>
                                        </div>
                                        <div>{getStatusBadge(contract.status)}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        previewDocument(contract);
                                    }}
                                    className="ml-4 px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                    <Eye size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'documents' && documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileCheck className="text-blue-600" size={20} />
                                        <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">{doc.type} - {doc.upload_date}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => previewDocument(doc)}
                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => downloadDocument(doc.id, doc.title)}
                                        className="px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'contracts' && formattedContracts.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600">Aucun contrat disponible</p>
                        </div>
                    )}

                    {activeTab === 'documents' && documents.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <FileCheck className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600">Aucun document disponible</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Panel de prévisualisation */}
            {isPanelOpen && selectedDocument && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* En-tête */}
                        <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                {selectedDocument.isContract ? 'Détails du contrat' : 'Document'}
                            </h2>
                            <button
                                onClick={closePanel}
                                className="text-white hover:bg-purple-700 p-1 rounded"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {selectedDocument.isContract ? (
                                <div className="space-y-6">
                                    {/* Détails du contrat */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-4">Informations générales</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Type:</span>
                                                <span className="ml-2 font-medium">{selectedDocument.contractData.contract_type}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Statut:</span>
                                                <span className="ml-2">{getStatusBadge(selectedDocument.contractData.status)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Début:</span>
                                                <span className="ml-2 font-medium">{selectedDocument.contractData.start_date}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Fin:</span>
                                                <span className="ml-2 font-medium">{selectedDocument.contractData.end_date || 'Indéterminé'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Montant:</span>
                                                <span className="ml-2 font-medium">{parseInt(selectedDocument.contractData.amount).toLocaleString()} FCFA</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Propriété:</span>
                                                <span className="ml-2 font-medium">{selectedDocument.contractData.property_title}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents liés */}
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

                                    {/* Prévisualisation PDF */}
                                    {selectedDocument.file_url && (
                                        <div className="bg-gray-100 rounded-lg overflow-hidden">
                                            <iframe
                                                src={selectedDocument.file_url}
                                                className="w-full h-[600px] border-0"
                                                title="PDF Viewer"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Affichage standard pour les documents
                                <div>
                                    <h3 className="font-semibold text-lg mb-4">{selectedDocument.title}</h3>
                                    {selectedDocument.file_url && (
                                        <div className="bg-gray-100 rounded-lg overflow-hidden">
                                            <iframe
                                                src={selectedDocument.file_url}
                                                className="w-full h-[600px] border-0"
                                                title="PDF Viewer"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContratsDocumentsLocataire;
