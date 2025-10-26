import React, { useState, useEffect } from 'react';
import { X, FileText, User, Home, DollarSign, Shield, Upload } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ContractFormModal = ({ isOpen, onClose, onContractCreated }) => {
    const [activeTab, setActiveTab] = useState('selection');
    const [formData, setFormData] = useState({
        // Sélection
        selectedTenant: '',
        selectedProperty: '',
        selectedLocation: '',

        // Informations auto-remplies du locataire
        tenantName: '',
        tenantPhone: '',
        tenantEmail: '',
        tenantIdNumber: '',

        // Informations auto-remplies de la propriété
        propertyAddress: '',
        propertyType: '',
        propertySurface: '',
        propertyRooms: '',

        // Type et durée du contrat
        contractType: '',
        startDate: '',
        endDate: '',
        contractPurpose: '',

        // Conditions financières
        amount: '',
        securityDeposit: '',
        paymentMethod: '',
        paymentFrequency: '',

        // Clauses principales
        specificRules: '',
        insurance: '',

        // Documents
        contractPdf: null,
        tenantIdDocuments: [],      // gardé mais non utilisé pour l’upload direct
        propertyDocuments: [],

        // Autres informations
        additionalNotes: ''
    });

    const [errors, setErrors] = useState({});
    const [availableTenants, setAvailableTenants] = useState([]);
    const [availableProperties, setAvailableProperties] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Un seul fichier CNI (objet ou null)
    const [uploadedCNI, setUploadedCNI] = useState(null);

    // Toujours des tableaux pour éviter .length sur null
    const [autoLoadedDocs, setAutoLoadedDocs] = useState({
        tenantDocs: [],
        propertyDocs: []
    });

    // Charger les locataires depuis le backend
    useEffect(() => {
        if (isOpen) {
            loadTenants();
            loadProperties();
            loadLocations();
        }
    }, [isOpen]);

    const loadTenants = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/tenants/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setAvailableTenants(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Erreur lors du chargement des locataires:', error);
        }
    };

    const loadProperties = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/properties/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setAvailableProperties(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Erreur lors du chargement des propriétés:', error);
        }
    };

    const loadLocations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/locations/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setAvailableLocations(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Erreur lors du chargement des locations:', error);
        }
    };

    const contractTypes = ['Location', 'Vente'];
    const paymentMethods = ['Mobile Money', 'Virement bancaire', 'Espèces', 'Chèque', 'Orange Money', 'MTN Money'];
    const paymentFrequencies = ['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel'];
    const securityDepositOptions = ['1 mois de loyer', '2 mois de loyer', '3 mois de loyer', 'Montant personnalisé'];

    // Charger les documents du locataire
    const loadTenantDocuments = async (tenantId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            const docs = [];
            if (data.id_document) {
                docs.push({
                    name: "Document d'identité du locataire",
                    url: data.id_document,
                    type: 'tenant_id'
                });
            }
            if (data.signed_contract) {
                docs.push({
                    name: 'Contrat signé du locataire',
                    url: data.signed_contract,
                    type: 'tenant_contract'
                });
            }

            setAutoLoadedDocs(prev => ({ ...prev, tenantDocs: docs || [] }));
        } catch (error) {
            console.error('Erreur lors du chargement des documents du locataire:', error);
        }
    };

    // Charger les documents de la propriété
    const loadPropertyDocuments = async (propertyId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            const docs = [];
            // Ajouter les documents disponibles de la propriété
            if (data.documents && Array.isArray(data.documents)) {
                data.documents.forEach(doc => {
                    docs.push({
                        name: doc.title || 'Document de la propriété',
                        url: doc.file,
                        type: 'property_doc'
                    });
                });
            }

            setAutoLoadedDocs(prev => ({ ...prev, propertyDocs: docs || [] }));
        } catch (error) {
            console.error('Erreur lors du chargement des documents de la propriété:', error);
        }
    };

    // Auto-remplissage des informations du locataire et de sa propriété
    useEffect(() => {
        if (formData.selectedTenant) {
            const tenant = availableTenants.find(t => t.id === parseInt(formData.selectedTenant));
            if (tenant) {
                // Trouver la location active du locataire
                const tenantLocation = availableLocations.find(
                    loc => loc.tenant === tenant.id && loc.status === 'active'
                );

                // Auto-remplir les informations du locataire
                setFormData(prev => ({
                    ...prev,
                    tenantName: tenant.full_name,
                    tenantPhone: tenant.phone,
                    tenantEmail: tenant.email,
                    tenantIdNumber: tenant.id_number,
                    // Auto-remplir la propriété liée au locataire
                    selectedProperty: tenantLocation ? tenantLocation.property.toString() : '',
                    selectedLocation: tenantLocation ? tenantLocation.id : '',
                    // Auto-remplir les conditions financières depuis la location
                    amount: tenantLocation ? tenantLocation.monthly_rent : '',
                    securityDeposit: tenant.security_deposit || '',
                    paymentMethod: tenant.payment_method || '',
                    startDate: tenant.lease_start_date || '',
                    endDate: tenant.lease_end_date || ''
                }));

                // Charger les documents du locataire
                loadTenantDocuments(tenant.id);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                tenantName: '',
                tenantPhone: '',
                tenantEmail: '',
                tenantIdNumber: '',
                selectedProperty: '',
                selectedLocation: ''
            }));
            setAutoLoadedDocs(prev => ({ ...prev, tenantDocs: [] }));
        }
    }, [formData.selectedTenant, availableTenants, availableLocations]);

    // Auto-remplissage des informations de la propriété
    useEffect(() => {
        if (formData.selectedProperty) {
            const property = availableProperties.find(p => p.id === parseInt(formData.selectedProperty));
            if (property) {
                setFormData(prev => ({
                    ...prev,
                    propertyAddress: property.adresse,
                    propertyType: property.type,
                    propertySurface: property.superficie,
                    propertyRooms: property.nombre_pieces
                }));

                // Charger les documents de la propriété
                loadPropertyDocuments(property.id);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                propertyAddress: '',
                propertyType: '',
                propertySurface: '',
                propertyRooms: ''
            }));
            setAutoLoadedDocs(prev => ({ ...prev, propertyDocs: [] }));
        }
    }, [formData.selectedProperty, availableProperties]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Supprimer l'erreur si le champ est maintenant rempli
        if (errors[name] && value.trim() !== '') {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Gère un seul fichier pour 'tenantIdDocuments' et un seul PDF pour 'contractPdf'
    const handleFileChange = (e) => {
        const { name, files } = e.target;

        if (name === 'tenantIdDocuments') {
            const file = files && files[0] ? files[0] : null;
            if (file) {
                setUploadedCNI({
                    file,
                    name: file.name,
                    type: 'uploaded_cni'
                });
            } else {
                setUploadedCNI(null);
            }
            return;
        }

        if (name === 'contractPdf') {
            const file = files && files[0] ? files[0] : null;
            setFormData(prev => ({
                ...prev,
                contractPdf: file || null
            }));
            return;
        }
    };

    const removeCNI = () => {
        setUploadedCNI(null);
    };

    const validateForm = () => {
        const newErrors = {};

        // Champs obligatoires
        if (!formData.selectedTenant) newErrors.selectedTenant = 'Le locataire est obligatoire';
        if (!formData.selectedProperty) newErrors.selectedProperty = 'La propriété est obligatoire';
        if (!formData.contractType) newErrors.contractType = 'Le type de contrat est obligatoire';
        if (!formData.startDate) newErrors.startDate = 'La date de début est obligatoire';
        if (!formData.amount || formData.amount === '' || formData.amount <= 0) newErrors.amount = 'Le montant est obligatoire';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                // Préparer les données pour l'API
                const contractData = {
                    tenant: parseInt(formData.selectedTenant),
                    property: parseInt(formData.selectedProperty),
                    location: formData.selectedLocation || null,
                    contract_type: formData.contractType,
                    start_date: formData.startDate,
                    end_date: formData.endDate || null,
                    contract_purpose: formData.contractPurpose,
                    amount: parseFloat(formData.amount),
                    security_deposit: formData.securityDeposit,
                    payment_method: formData.paymentMethod,
                    payment_frequency: formData.paymentFrequency,
                    specific_rules: formData.specificRules,
                    insurance: formData.insurance,
                    additional_notes: formData.additionalNotes
                };

                const response = await fetch(`${API_BASE_URL}/contracts/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(contractData)
                });

                if (response.ok) {
                    const createdContract = await response.json();
                    console.log('Contrat créé:', createdContract);
                    alert('✅ Contrat créé avec succès !\n\nStatut: Actif\nLe contrat est maintenant actif et visible par le locataire.');

                    // Appeler le callback si fourni
                    if (onContractCreated) {
                        onContractCreated(createdContract);
                    }

                    onClose();
                    resetForm();
                } else {
                    const errorData = await response.json();
                    console.error('Erreur lors de la création:', errorData);
                    alert('❌ Erreur lors de la création du contrat. Vérifiez les données.');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('❌ Erreur de connexion au serveur.');
            } finally {
                setLoading(false);
            }
        } else {
            alert('⚠️ Veuillez corriger les erreurs dans le formulaire.');
        }
    };

    const resetForm = () => {
        setFormData({
            selectedTenant: '',
            selectedProperty: '',
            selectedLocation: '',
            tenantName: '',
            tenantPhone: '',
            tenantEmail: '',
            tenantIdNumber: '',
            propertyAddress: '',
            propertyType: '',
            propertySurface: '',
            propertyRooms: '',
            contractType: '',
            startDate: '',
            endDate: '',
            contractPurpose: '',
            amount: '',
            securityDeposit: '',
            paymentMethod: '',
            paymentFrequency: '',
            specificRules: '',
            insurance: '',
            contractPdf: null,
            tenantIdDocuments: [],   // laissé tel quel dans le shape initial
            propertyDocuments: [],
            additionalNotes: ''
        });
        setErrors({});
        setActiveTab('selection');
        setUploadedCNI(null);
        setAutoLoadedDocs({ tenantDocs: [], propertyDocs: [] });
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const tabs = [
        { id: 'selection', label: 'Sélection', icon: User },
        { id: 'contract', label: 'Type & Durée', icon: FileText },
        { id: 'financial', label: 'Conditions', icon: DollarSign },
        { id: 'clauses', label: 'Clauses', icon: Shield },
        { id: 'documents', label: 'Documents', icon: Upload }
    ];

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* En-tête du modal */}
                <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText size={24} />
                        <h2 className="text-xl font-bold">🧾 Formulaire de création de contrat</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-purple-700 p-1 rounded"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation par onglets */}
                <div className="border-b bg-gray-50">
                    <nav className="flex overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-3 px-4 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600 bg-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Contenu du formulaire */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="p-6">
                        {/* Onglet Sélection */}
                        {activeTab === 'selection' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">👤🏠 Sélection du locataire et de la propriété</h3>

                                {/* Sélection du locataire */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-3">👤 Locataire</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Locataire <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="selectedTenant"
                                            value={formData.selectedTenant}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.selectedTenant ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Sélectionner un locataire</option>
                                            {availableTenants.map(tenant => (
                                                <option key={tenant.id} value={tenant.id}>
                                                    {tenant.full_name} - {tenant.phone}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.selectedTenant && <p className="text-red-500 text-sm mt-1">{errors.selectedTenant}</p>}
                                    </div>

                                    {/* Informations auto-remplies du locataire */}
                                    {formData.tenantName && (
                                        <div className="mt-4 grid grid-cols-2 gap-4 bg-white p-3 rounded border">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Nom complet</label>
                                                <p className="text-sm text-gray-800">{formData.tenantName}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Téléphone</label>
                                                <p className="text-sm text-gray-800">{formData.tenantPhone}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Email</label>
                                                <p className="text-sm text-gray-800">{formData.tenantEmail || 'Non renseigné'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Pièce d'identité</label>
                                                <p className="text-sm text-gray-800">{formData.tenantIdNumber}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sélection de la propriété */}
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-green-800 mb-3">🏠 Propriété</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Propriété liée <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="selectedProperty"
                                            value={formData.selectedProperty}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.selectedProperty ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            disabled={formData.selectedTenant && formData.selectedLocation}
                                        >
                                            <option value="">Sélectionner une propriété</option>
                                            {availableProperties.map(property => (
                                                <option key={property.id} value={property.id}>
                                                    {property.titre}
                                                </option>
                                            ))}
                                        </select>
                                        {formData.selectedTenant && formData.selectedLocation && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                ℹ️ Propriété automatiquement sélectionnée selon le locataire
                                            </p>
                                        )}
                                        {errors.selectedProperty && <p className="text-red-500 text-sm mt-1">{errors.selectedProperty}</p>}
                                    </div>

                                    {/* Informations auto-remplies de la propriété */}
                                    {formData.propertyAddress && (
                                        <div className="mt-4 grid grid-cols-2 gap-4 bg-white p-3 rounded border">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-600">Adresse</label>
                                                <p className="text-sm text-gray-800">{formData.propertyAddress}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Type</label>
                                                <p className="text-sm text-gray-800">{formData.propertyType}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Surface</label>
                                                <p className="text-sm text-gray-800">{formData.propertySurface} m²</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Nombre de pièces</label>
                                                <p className="text-sm text-gray-800">{formData.propertyRooms}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Onglet Type et durée du contrat */}
                        {activeTab === 'contract' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 Type et durée du contrat</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📄 Type de contrat <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="contractType"
                                        value={formData.contractType}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.contractType ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Sélectionner un type</option>
                                        {contractTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.contractType && <p className="text-red-500 text-sm mt-1">{errors.contractType}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            📅 Date de début <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.startDate ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            📅 Date de fin (optionnel)
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Laisser vide si durée indéterminée</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📝 Objet du contrat / Usage du bien
                                    </label>
                                    <textarea
                                        name="contractPurpose"
                                        value={formData.contractPurpose}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Habitation principale, bureau, commerce..."
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Onglet Conditions financières */}
                        {activeTab === 'financial' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Conditions financières</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        💵 {formData.contractType === 'Location' ? 'Montant du loyer' : 'Prix de vente'} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 150000"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500">FCFA</span>
                                    </div>
                                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            💰 Dépôt de garantie
                                        </label>
                                        <select
                                            name="securityDeposit"
                                            value={formData.securityDeposit}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Sélectionner</option>
                                            {securityDepositOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            📆 Fréquence de paiement
                                        </label>
                                        <select
                                            name="paymentFrequency"
                                            value={formData.paymentFrequency}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Sélectionner</option>
                                            {paymentFrequencies.map(freq => (
                                                <option key={freq} value={freq}>{freq}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        💳 Mode de paiement
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Sélectionner un mode</option>
                                        {paymentMethods.map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Onglet Clauses principales */}
                        {activeTab === 'clauses' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🛡️ Clauses principales</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📌 Règles spécifiques
                                    </label>
                                    <textarea
                                        name="specificRules"
                                        value={formData.specificRules}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Interdiction d'animaux, sous-location non autorisée, entretien du jardin à la charge du locataire..."
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Animaux, sous-location, entretien, etc.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🛡️ Assurance (optionnel)
                                    </label>
                                    <textarea
                                        name="insurance"
                                        value={formData.insurance}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Assurance habitation obligatoire, responsabilité civile..."
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Onglet Documents */}
                        {activeTab === 'documents' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📂 Documents et notes</h3>

                                {/* Documents automatiquement chargés du locataire */}
                                {autoLoadedDocs.tenantDocs && autoLoadedDocs.tenantDocs.length > 0 && (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                            <span>👤</span> Documents du locataire
                                        </h4>
                                        <div className="space-y-2">
                                            {autoLoadedDocs.tenantDocs.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                                    <span className="text-sm text-gray-700">{doc.name}</span>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Voir
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Documents automatiquement chargés de la propriété */}
                                {autoLoadedDocs.propertyDocs && autoLoadedDocs.propertyDocs.length > 0 && (
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                            <span>🏠</span> Documents de la propriété
                                        </h4>
                                        <div className="space-y-2">
                                            {autoLoadedDocs.propertyDocs.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                                    <span className="text-sm text-gray-700">{doc.name}</span>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-800 text-sm"
                                                    >
                                                        Voir
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload CNI (un seul fichier) */}
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        🪪 Pièce d'identité (CNI/Passeport)
                                    </label>
                                    <input
                                        type="file"
                                        name="tenantIdDocuments"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        CNI ou Passeport (un seul fichier)
                                    </p>

                                    {/* Affichage unique de la CNI uploadée */}
                                    {uploadedCNI ? (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center justify-between bg-white p-2 rounded border">
                                                <span className="text-sm text-gray-700">{uploadedCNI.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={removeCNI}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-1">Aucun fichier CNI sélectionné</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📂 Contrat PDF (facultatif)
                                    </label>
                                    <input
                                        type="file"
                                        name="contractPdf"
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload ou génération automatique (format PDF uniquement)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📝 Notes complémentaires
                                    </label>
                                    <textarea
                                        name="additionalNotes"
                                        value={formData.additionalNotes}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Conditions spéciales, remarques, charges incluses/exclues, travaux à prévoir..."
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="border-t bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        >
                            ❌ Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Enregistrement...' : '✅ Enregistrer le contrat'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractFormModal;
