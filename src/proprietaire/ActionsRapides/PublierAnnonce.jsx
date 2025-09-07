import React, { useState } from 'react';
import { X, Home, FileText, DollarSign, Camera, Settings, Upload, Eye } from 'lucide-react';

const NouvelleAnnonceModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('property');
    const [formData, setFormData] = useState({
        // Informations sur la propriété
        title: '',
        propertyType: '',
        surface: '',
        bedrooms: '',
        bathrooms: '',
        address: '',

        // Description et caractéristiques
        description: '',
        characteristics: {
            balcony: false,
            furnished: false,
            garden: false,
            parking: false,
            airCondition: false,
            internet: false,
            security: false,
            elevator: false
        },

        // Conditions financières
        price: '',
        securityDeposit: '',
        paymentMethod: '',
        availability: 'immediate',
        availabilityDate: '',

        // Photos et médias
        photos: [],
        video: null,

        // Services et options
        additionalServices: '',
        contactInfo: '',

        // Autres informations
        additionalNotes: ''
    });

    const [errors, setErrors] = useState({});
    const [dragOver, setDragOver] = useState(false);

    const propertyTypes = ['Appartement', 'Maison', 'Studio', 'Terrain', 'Bureau', 'Local commercial'];
    const securityDepositOptions = ['1 mois de loyer', '2 mois de loyer', '3 mois de loyer', 'Montant personnalisé'];
    const paymentMethods = ['Mobile Money', 'Virement bancaire', 'Espèces', 'Chèque', 'Orange Money', 'MTN Money'];

    const characteristicsList = [
        { key: 'balcony', label: 'Balcon', icon: '🏗️' },
        { key: 'furnished', label: 'Meublé', icon: '🛋️' },
        { key: 'garden', label: 'Jardin', icon: '🌿' },
        { key: 'parking', label: 'Parking', icon: '🚗' },
        { key: 'airCondition', label: 'Climatisation', icon: '❄️' },
        { key: 'internet', label: 'Internet', icon: '📶' },
        { key: 'security', label: 'Sécurité', icon: '🔒' },
        { key: 'elevator', label: 'Ascenseur', icon: '🛗' }
    ];

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

    const handleCharacteristicChange = (key) => {
        setFormData(prev => ({
            ...prev,
            characteristics: {
                ...prev.characteristics,
                [key]: !prev.characteristics[key]
            }
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'photos') {
            setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, ...Array.from(files)]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: files[0] || null
            }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...imageFiles]
        }));
    };

    const removePhoto = (index) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Champs obligatoires
        if (!formData.title.trim()) newErrors.title = 'Le titre est obligatoire';
        if (!formData.propertyType) newErrors.propertyType = 'Le type de bien est obligatoire';
        if (!formData.price.trim()) newErrors.price = 'Le prix est obligatoire';
        if (!formData.address.trim()) newErrors.address = 'L\'adresse est obligatoire';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            console.log('Données de l\'annonce:', formData);
            alert('Annonce publiée avec succès !');
            onClose();
            resetForm();
            // Ici vous pourriez envoyer les données à votre API
        } else {
            alert('Veuillez corriger les erreurs dans le formulaire.');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '', propertyType: '', surface: '', bedrooms: '', bathrooms: '', address: '',
            description: '', characteristics: {
                balcony: false, furnished: false, garden: false, parking: false,
                airCondition: false, internet: false, security: false, elevator: false
            },
            price: '', securityDeposit: '', paymentMethod: '', availability: 'immediate', availabilityDate: '',
            photos: [], video: null, additionalServices: '', contactInfo: '', additionalNotes: ''
        });
        setErrors({});
        setActiveTab('property');
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const tabs = [
        { id: 'property', label: 'Propriété', icon: Home },
        { id: 'description', label: 'Description', icon: FileText },
        { id: 'financial', label: 'Prix & Conditions', icon: DollarSign },
        { id: 'media', label: 'Photos & Médias', icon: Camera },
        { id: 'services', label: 'Services', icon: Settings },
        { id: 'preview', label: 'Aperçu', icon: Eye }
    ];

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* En-tête du modal */}
                <div className="bg-green-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Home size={24} />
                        <h2 className="text-xl font-bold">🧾 Publier une Nouvelle Annonce</h2>
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
                        {/* Onglet Propriété */}
                        {activeTab === 'property' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏠 Informations sur la propriété</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📌 Titre de l'annonce <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Appartement 3 chambres à Cocody"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            📌 Type de bien <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="propertyType"
                                            value={formData.propertyType}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.propertyType ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Sélectionner un type</option>
                                            {propertyTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            📏 Surface (m²)
                                        </label>
                                        <input
                                            type="number"
                                            name="surface"
                                            value={formData.surface}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 85"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            🛏 Nombre de chambres
                                        </label>
                                        <input
                                            type="number"
                                            name="bedrooms"
                                            value={formData.bedrooms}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 3"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            🛁 Nombre de salles de bain
                                        </label>
                                        <input
                                            type="number"
                                            name="bathrooms"
                                            value={formData.bathrooms}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 2"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📍 Adresse complète <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Cocody, Riviera Golf, Rue des Palmiers, près de l'école Sainte-Marie"
                                        rows="2"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.address ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                </div>
                            </div>
                        )}

                        {/* Onglet Description */}
                        {activeTab === 'description' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Description et caractéristiques</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📝 Description détaillée du bien
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Décrivez votre bien en détail : état, luminosité, équipements, environnement..."
                                        rows="5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Optionnel mais fortement conseillé pour attirer les locataires</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        ⚡ Caractéristiques du bien
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {characteristicsList.map(({ key, label, icon }) => (
                                            <label key={key} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.characteristics[key]}
                                                    onChange={() => handleCharacteristicChange(key)}
                                                    className="text-green-600 focus:ring-green-500"
                                                />
                                                <span className="text-sm">{icon} {label}</span>
                                            </label>
                                        ))}
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
                                        💵 Prix / Loyer <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 150000"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500">FCFA</span>
                                    </div>
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
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
                                            💳 Mode de paiement accepté
                                        </label>
                                        <select
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">Sélectionner</option>
                                            {paymentMethods.map(method => (
                                                <option key={method} value={method}>{method}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📆 Disponibilité
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="availability"
                                                value="immediate"
                                                checked={formData.availability === 'immediate'}
                                                onChange={handleInputChange}
                                                className="text-green-600 focus:ring-green-500"
                                            />
                                            <span className="ml-2">Immédiate</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="availability"
                                                value="date"
                                                checked={formData.availability === 'date'}
                                                onChange={handleInputChange}
                                                className="text-green-600 focus:ring-green-500"
                                            />
                                            <span className="ml-2">Date spécifique</span>
                                        </label>
                                    </div>
                                    {formData.availability === 'date' && (
                                        <div className="mt-2">
                                            <input
                                                type="date"
                                                name="availabilityDate"
                                                value={formData.availabilityDate}
                                                onChange={handleInputChange}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Onglet Photos et médias */}
                        {activeTab === 'media' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📸 Photos et médias</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📸 Photos du bien
                                    </label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('photos-input').click()}
                                    >
                                        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600 mb-2">Glissez-déposez vos photos ici ou cliquez pour sélectionner</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, JPEG jusqu'à 10MB par image</p>
                                        <input
                                            id="photos-input"
                                            type="file"
                                            name="photos"
                                            onChange={handleFileChange}
                                            multiple
                                            accept=".jpg,.jpeg,.png"
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Aperçu des photos */}
                                    {formData.photos.length > 0 && (
                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            {formData.photos.map((photo, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={URL.createObjectURL(photo)}
                                                        alt={`Photo ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        onClick={() => removePhoto(index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🎥 Vidéo du bien (optionnel)
                                    </label>
                                    <input
                                        type="file"
                                        name="video"
                                        onChange={handleFileChange}
                                        accept=".mp4,.avi,.mov"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Format MP4, AVI, MOV - Maximum 50MB</p>
                                </div>
                            </div>
                        )}

                        {/* Onglet Services */}
                        {activeTab === 'services' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Services et options supplémentaires</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🔧 Aménagement intérieur ou services annexes
                                    </label>
                                    <textarea
                                        name="additionalServices"
                                        value={formData.additionalServices}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Internet inclus, entretien du jardin, gardien, eau chaude, générateur..."
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📞 Contact du propriétaire ou agence
                                    </label>
                                    <textarea
                                        name="contactInfo"
                                        value={formData.contactInfo}
                                        onChange={handleInputChange}
                                        placeholder="Informations de contact (pré-rempli si déjà connecté)"
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📝 Notes complémentaires
                                    </label>
                                    <textarea
                                        name="additionalNotes"
                                        value={formData.additionalNotes}
                                        onChange={handleInputChange}
                                        placeholder="Conditions spéciales, restrictions, conseils pour les visiteurs..."
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Onglet Aperçu */}
                        {activeTab === 'preview' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">👁️ Aperçu de l'annonce</h3>

                                <div className="bg-gray-50 p-6 rounded-lg border">
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <h4 className="text-xl font-bold text-gray-800 mb-2">{formData.title || 'Titre de l\'annonce'}</h4>
                                        <p className="text-green-600 font-semibold text-lg mb-2">
                                            {formData.price ? `${parseInt(formData.price).toLocaleString()} FCFA` : 'Prix non défini'}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {formData.propertyType && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{formData.propertyType}</span>}
                                            {formData.surface && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">{formData.surface} m²</span>}
                                            {formData.bedrooms && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">{formData.bedrooms} chambres</span>}
                                            {formData.bathrooms && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">{formData.bathrooms} salles de bain</span>}
                                        </div>

                                        {formData.address && (
                                            <p className="text-gray-600 mb-4">📍 {formData.address}</p>
                                        )}

                                        {formData.description && (
                                            <div className="mb-4">
                                                <h5 className="font-medium text-gray-800 mb-2">Description</h5>
                                                <p className="text-gray-600 text-sm">{formData.description}</p>
                                            </div>
                                        )}

                                        {Object.values(formData.characteristics).some(Boolean) && (
                                            <div className="mb-4">
                                                <h5 className="font-medium text-gray-800 mb-2">Caractéristiques</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {characteristicsList.map(({ key, label, icon }) =>
                                                        formData.characteristics[key] && (
                                                            <span key={key} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                                                {icon} {label}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {formData.photos.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="font-medium text-gray-800 mb-2">Photos ({formData.photos.length})</h5>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {formData.photos.slice(0, 6).map((photo, index) => (
                                                        <img
                                                            key={index}
                                                            src={URL.createObjectURL(photo)}
                                                            alt={`Photo ${index + 1}`}
                                                            className="w-full h-20 object-cover rounded"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-sm text-gray-500">
                                            <p>📅 Disponibilité: {formData.availability === 'immediate' ? 'Immédiate' : `À partir du ${formData.availabilityDate}`}</p>
                                            {formData.paymentMethod && <p>💳 Mode de paiement: {formData.paymentMethod}</p>}
                                            {formData.securityDeposit && <p>💰 Dépôt de garantie: {formData.securityDeposit}</p>}
                                        </div>
                                    </div>
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
                            ✅ Publier l'annonce
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NouvelleAnnonceModal;