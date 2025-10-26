import React, { useState, useEffect } from 'react';
import { X, User, Home, DollarSign, FileText } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

const TenantFormModal = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState({
        // Informations personnelles
        userId: '',
        fullName: '',
        phone: '',
        email: '',
        idNumber: '',

        // Informations du logement
        linkedProperty: '',
        leaseStartDate: '',
        leaseEndDate: '',

        // Conditions financières
        monthlyRent: '',
        securityDeposit: '',
        paymentMethod: '',

        // Documents
        signedContract: null,
        idDocument: null,

        // Autres informations
        additionalNotes: '',

        // Pour le backend
        visitRequestId: ''
    });

    const [errors, setErrors] = useState({});
    const [selectedTenantFromVisit, setSelectedTenantFromVisit] = useState('');

    // Données chargées depuis l'API
    const [tenantsFromAcceptedVisits, setTenantsFromAcceptedVisits] = useState([]);
    const [availableProperties, setAvailableProperties] = useState([]);
    const [loading, setLoading] = useState(false);

    // Charger les locataires avec visites acceptées
    useEffect(() => {
        if (isOpen) {
            loadTenantsFromAcceptedVisits();
            loadProperties();
        }
    }, [isOpen]);

    const loadTenantsFromAcceptedVisits = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/tenants/from-accepted-visits/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTenantsFromAcceptedVisits(data);
            }
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

            if (response.ok) {
                const data = await response.json();
                setAvailableProperties(Array.isArray(data) ? data : (data.results || []));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des propriétés:', error);
        }
    };

    // Pré-remplir le formulaire quand un locataire est sélectionné
    const handleTenantSelection = (e) => {
        const tenantId = e.target.value;
        setSelectedTenantFromVisit(tenantId);

        if (tenantId) {
            const selectedTenant = tenantsFromAcceptedVisits.find(t => t.id.toString() === tenantId);
            if (selectedTenant) {
                setFormData(prev => ({
                    ...prev,
                    userId: selectedTenant.id,
                    fullName: selectedTenant.full_name || '',
                    email: selectedTenant.email || '',
                    phone: selectedTenant.phone || '',
                    linkedProperty: selectedTenant.property_id || '',
                    visitRequestId: selectedTenant.visit_request_id || ''
                }));
            }
        } else {
            // Réinitialiser si aucune sélection
            resetForm();
        }
    };

    const paymentMethods = [
        'Mobile Money',
        'Virement bancaire',
        'Espèces',
        'Chèque',
        'Orange Money',
        'MTN Money'
    ];

    const securityDepositOptions = [
        '1 mois de loyer',
        '2 mois de loyer',
        'Montant personnalisé'
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Si c'est la sélection de propriété, pré-remplir le loyer
        if (name === 'linkedProperty' && value) {
            const selectedProperty = availableProperties.find(p => p.id.toString() === value);
            if (selectedProperty && selectedProperty.prix) {
                setFormData(prev => ({
                    ...prev,
                    linkedProperty: value,
                    monthlyRent: selectedProperty.prix
                }));
                console.log('💰 Loyer pré-rempli:', selectedProperty.prix, 'FCFA');
            }
        }

        // Supprimer l'erreur si le champ est maintenant rempli
        if (errors[name] && value.trim() !== '') {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files[0] || null
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Champs obligatoires
        if (!formData.fullName.trim()) newErrors.fullName = 'Le nom complet est obligatoire';
        if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est obligatoire';
        if (!formData.linkedProperty) newErrors.linkedProperty = 'La propriété liée est obligatoire';
        if (!formData.monthlyRent || formData.monthlyRent === '' || formData.monthlyRent <= 0) newErrors.monthlyRent = 'Le montant du loyer est obligatoire';
        if (!formData.leaseStartDate) newErrors.leaseStartDate = 'La date de début de bail est obligatoire';

        // Validation du format téléphone (basique)
        const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Format de téléphone invalide';
        }

        // Validation email (si rempli)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                // Utiliser FormData pour envoyer les fichiers
                const formDataToSend = new FormData();

                formDataToSend.append('user', formData.userId || '');
                formDataToSend.append('full_name', formData.fullName);
                formDataToSend.append('phone', formData.phone);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('id_number', formData.idNumber);
                formDataToSend.append('linked_property', formData.linkedProperty);
                formDataToSend.append('lease_start_date', formData.leaseStartDate);
                if (formData.leaseEndDate) {
                    formDataToSend.append('lease_end_date', formData.leaseEndDate);
                }
                formDataToSend.append('monthly_rent', parseInt(formData.monthlyRent));
                formDataToSend.append('security_deposit', formData.securityDeposit);
                formDataToSend.append('payment_method', formData.paymentMethod);
                formDataToSend.append('status', 'active');
                formDataToSend.append('additional_notes', formData.additionalNotes);

                // Ajouter les fichiers s'ils existent
                if (formData.signedContract) {
                    formDataToSend.append('signed_contract', formData.signedContract);
                }
                if (formData.idDocument) {
                    formDataToSend.append('id_document', formData.idDocument);
                }

                // Si créé depuis une visite acceptée
                if (formData.visitRequestId) {
                    formDataToSend.append('visit_request_id', formData.visitRequestId);
                }

                const response = await fetch(`${API_BASE_URL}/tenants/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`
                        // Ne pas définir Content-Type, le navigateur le fera automatiquement avec la boundary
                    },
                    body: formDataToSend
                });

                if (response.ok) {
                    alert('✅ Locataire enregistré avec succès !');
                    // Appeler le callback de succès pour rafraîchir la liste
                    if (onSuccess) {
                        onSuccess();
                    }
                    onClose();
                    resetForm();
                } else {
                    const errorData = await response.json();
                    console.error('Erreur:', errorData);

                    // Afficher un message d'erreur plus clair
                    if (errorData.error) {
                        alert('❌ ' + errorData.error);
                    } else {
                        alert('❌ Erreur lors de l\'enregistrement: ' + JSON.stringify(errorData));
                    }
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('❌ Erreur lors de l\'enregistrement du locataire');
            } finally {
                setLoading(false);
            }
        } else {
            alert('Veuillez corriger les erreurs dans le formulaire.');
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '', phone: '', email: '', idNumber: '',
            linkedProperty: '', leaseStartDate: '', leaseEndDate: '',
            monthlyRent: '', securityDeposit: '', paymentMethod: '',
            signedContract: null, idDocument: null, additionalNotes: ''
        });
        setErrors({});
        setActiveTab('personal');
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const tabs = [
        { id: 'personal', label: 'Infos personnelles', icon: User },
        { id: 'property', label: 'Logement', icon: Home },
        { id: 'financial', label: 'Conditions', icon: DollarSign },
        { id: 'documents', label: 'Documents', icon: FileText }
    ];

    if (!isOpen) return null;

    return (
        // <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={handleClose}>
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* En-tête du modal */}
                <div className="bg-green-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User size={24} />
                        <h2 className="text-xl font-bold">🧾 Formulaire d'ajout de locataire</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-green-700 p-1 rounded"
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
                                            ? 'border-green-500 text-green-600 bg-white'
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
                        {/* Onglet Informations personnelles */}
                        {activeTab === 'personal' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">👤 Informations personnelles</h3>

                                {/* Select pour choisir depuis les visites acceptées */}
                                {tenantsFromAcceptedVisits.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <label className="block text-sm font-semibold text-blue-900 mb-2">
                                            🎯 Sélectionner un locataire avec visite acceptée
                                        </label>
                                        <select
                                            value={selectedTenantFromVisit}
                                            onChange={handleTenantSelection}
                                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="">-- Nouveau locataire ou sélectionner --</option>
                                            {tenantsFromAcceptedVisits.map(tenant => (
                                                <option key={tenant.id} value={tenant.id}>
                                                    {tenant.full_name} - {tenant.property_title}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-blue-700 mt-1">
                                            💡 Sélectionnez un locataire pour pré-remplir automatiquement le formulaire
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom complet <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Kouassi Jean-Baptiste"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            📞 Téléphone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 07 89 56 12 34"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                        <p className="text-xs text-gray-500 mt-1">WhatsApp inclus si disponible</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            📧 Email (optionnel)
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Ex: jean.kouassi@gmail.com"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🪪 Numéro de pièce d'identité
                                    </label>
                                    <input
                                        type="text"
                                        name="idNumber"
                                        value={formData.idNumber}
                                        onChange={handleInputChange}
                                        placeholder="Ex: CNI123456789 ou Passeport AB1234567"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">CNI ou Passeport</p>
                                </div>
                            </div>
                        )}

                        {/* Onglet Informations du logement */}
                        {activeTab === 'property' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏠 Informations du logement</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Propriété liée <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="linkedProperty"
                                        value={formData.linkedProperty}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.linkedProperty ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Sélectionner une propriété</option>
                                        {availableProperties.map(property => (
                                            <option key={property.id} value={property.id}>
                                                {property.titre} - {property.adresse}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.linkedProperty && <p className="text-red-500 text-sm mt-1">{errors.linkedProperty}</p>}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedTenantFromVisit ? '✅ Pré-rempli automatiquement' : 'Liste de vos propriétés'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            📅 Date de début de bail <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="leaseStartDate"
                                            value={formData.leaseStartDate}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.leaseStartDate ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.leaseStartDate && <p className="text-red-500 text-sm mt-1">{errors.leaseStartDate}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            📅 Date de fin de bail (optionnel)
                                        </label>
                                        <input
                                            type="date"
                                            name="leaseEndDate"
                                            value={formData.leaseEndDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Laisser vide si durée indéterminée</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Onglet Conditions financières */}
                        {activeTab === 'financial' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Conditions financières</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        💵 Montant du loyer mensuel <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="monthlyRent"
                                            value={formData.monthlyRent}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 150000"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.monthlyRent ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500">FCFA</span>
                                    </div>
                                    {errors.monthlyRent && <p className="text-red-500 text-sm mt-1">{errors.monthlyRent}</p>}
                                    {formData.linkedProperty && formData.monthlyRent && (
                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                            ✅ Montant pré-rempli automatiquement depuis la propriété sélectionnée
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        💰 Dépôt de garantie
                                    </label>
                                    <select
                                        name="securityDeposit"
                                        value={formData.securityDeposit}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Sélectionner</option>
                                        {securityDepositOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        💳 Mode de paiement
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Sélectionner un mode</option>
                                        {paymentMethods.map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Onglet Documents */}
                        {activeTab === 'documents' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📂 Documents et notes</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📂 Contrat signé (facultatif)
                                    </label>
                                    <input
                                        type="file"
                                        name="signedContract"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Formats acceptés: PDF, JPG, PNG
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🧾 Justificatif d'identité (facultatif)
                                    </label>
                                    <input
                                        type="file"
                                        name="idDocument"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        CNI, Passeport ou autre pièce d'identité
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
                                        placeholder="Ex: Préférences, conditions spéciales, rappel sur les charges, etc."
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                        >
                            ✅ Enregistrer le locataire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantFormModal;