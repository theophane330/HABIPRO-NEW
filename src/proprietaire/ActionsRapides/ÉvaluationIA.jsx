import React, { useState } from 'react';
import { X, Home, Settings, DollarSign, Brain, FileDown, Loader } from 'lucide-react';

const EvaluationIAModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('selection');
    const [loading, setLoading] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [formData, setFormData] = useState({
        // Sélection de propriété
        selectedProperty: '',

        // Auto-rempli après sélection
        address: '',
        propertyType: '',
        surface: '',
        rooms: '',

        // Informations complémentaires
        condition: '',
        neighborhood: '',
        characteristics: {
            balcony: false,
            furnished: false,
            parking: false,
            garden: false,
            airCondition: false,
            internet: false,
            security: false,
            elevator: false
        },

        // Paramètres financiers
        leaseDuration: '',
        currentPrice: ''
    });

    const [errors, setErrors] = useState({});

    // Données simulées des propriétés du propriétaire
    const userProperties = [
        {
            id: 1,
            title: "Appartement Cocody",
            address: "Cocody, Riviera Golf, Rue des Palmiers",
            propertyType: "Appartement",
            surface: "85",
            rooms: "3"
        },
        {
            id: 2,
            title: "Maison Marcory",
            address: "Marcory, Zone 4, Résidentiel",
            propertyType: "Maison",
            surface: "150",
            rooms: "4"
        },
        {
            id: 3,
            title: "Studio Plateau",
            address: "Plateau, Centre-ville",
            propertyType: "Studio",
            surface: "35",
            rooms: "1"
        }
    ];

    const conditionOptions = ['Neuf', 'Bon état', 'À rénover'];
    const leaseDurationOptions = ['6 mois', '1 an', '2 ans', '3 ans', 'Plus de 3 ans'];

    const characteristicsList = [
        { key: 'balcony', label: 'Balcon', icon: '🏗️' },
        { key: 'furnished', label: 'Meublé', icon: '🛋️' },
        { key: 'parking', label: 'Parking', icon: '🚗' },
        { key: 'garden', label: 'Jardin', icon: '🌿' },
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

    const handlePropertySelection = (e) => {
        const propertyId = e.target.value;
        const selectedProp = userProperties.find(prop => prop.id === parseInt(propertyId));

        if (selectedProp) {
            setFormData(prev => ({
                ...prev,
                selectedProperty: propertyId,
                address: selectedProp.address,
                propertyType: selectedProp.propertyType,
                surface: selectedProp.surface,
                rooms: selectedProp.rooms
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                selectedProperty: '',
                address: '',
                propertyType: '',
                surface: '',
                rooms: ''
            }));
        }

        if (errors.selectedProperty && propertyId) {
            setErrors(prev => ({
                ...prev,
                selectedProperty: ''
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

    const validateForm = () => {
        const newErrors = {};

        // Champs obligatoires
        if (!formData.selectedProperty) newErrors.selectedProperty = 'Veuillez sélectionner une propriété';
        if (!formData.condition) newErrors.condition = 'L\'état du bien est obligatoire';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEvaluation = async () => {
        if (!validateForm()) {
            alert('Veuillez corriger les erreurs dans le formulaire.');
            return;
        }

        setLoading(true);
        setActiveTab('result');

        // Simulation d'appel API avec délai
        setTimeout(() => {
            // Calcul simulé basé sur les données
            const basePrice = formData.propertyType === 'Studio' ? 80000 :
                formData.propertyType === 'Appartement' ? 150000 : 200000;

            const surfaceMultiplier = parseInt(formData.surface) / 100;
            const conditionMultiplier = formData.condition === 'Neuf' ? 1.2 :
                formData.condition === 'Bon état' ? 1.0 : 0.8;

            const characteristicsBonus = Object.values(formData.characteristics)
                .filter(Boolean).length * 10000;

            const estimatedPrice = Math.round((basePrice * surfaceMultiplier * conditionMultiplier) + characteristicsBonus);

            setEvaluationResult({
                estimatedPrice,
                confidence: 87,
                marketAnalysis: {
                    averagePrice: Math.round(estimatedPrice * 0.95),
                    priceRange: {
                        min: Math.round(estimatedPrice * 0.85),
                        max: Math.round(estimatedPrice * 1.15)
                    }
                },
                factors: [
                    { factor: 'Localisation', impact: '+15%', description: 'Quartier recherché' },
                    { factor: 'Surface', impact: '+10%', description: 'Superficie optimale' },
                    { factor: 'État du bien', impact: formData.condition === 'Neuf' ? '+20%' : formData.condition === 'Bon état' ? '0%' : '-20%', description: formData.condition },
                    { factor: 'Équipements', impact: '+5%', description: `${Object.values(formData.characteristics).filter(Boolean).length} équipements` }
                ],
                recommendation: estimatedPrice > (parseInt(formData.currentPrice) || 0) ?
                    'Le prix estimé est supérieur au prix actuel. Vous pourriez augmenter le loyer.' :
                    'Le prix estimé est cohérent avec le marché actuel.'
            });

            setLoading(false);
        }, 2000);
    };

    const downloadReport = () => {
        alert('Fonctionnalité de téléchargement PDF à implémenter');
    };

    const resetForm = () => {
        setFormData({
            selectedProperty: '', address: '', propertyType: '', surface: '', rooms: '',
            condition: '', neighborhood: '', characteristics: {
                balcony: false, furnished: false, parking: false, garden: false,
                airCondition: false, internet: false, security: false, elevator: false
            },
            leaseDuration: '', currentPrice: ''
        });
        setErrors({});
        setActiveTab('selection');
        setEvaluationResult(null);
        setLoading(false);
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const tabs = [
        { id: 'selection', label: 'Sélection', icon: Home },
        { id: 'details', label: 'Détails', icon: Settings },
        { id: 'financial', label: 'Paramètres', icon: DollarSign },
        { id: 'result', label: 'Évaluation IA', icon: Brain }
    ];

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* En-tête du modal */}
                <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain size={24} />
                        <h2 className="text-xl font-bold">Évaluation IA du bien</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-blue-700 p-1 rounded"
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
                                    onClick={() => !loading && setActiveTab(tab.id)}
                                    disabled={loading && tab.id !== 'result'}
                                    className={`flex items-center gap-2 py-3 px-4 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 bg-white'
                                            : loading && tab.id !== 'result'
                                                ? 'border-transparent text-gray-300'
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
                        {/* Onglet Sélection de propriété */}
                        {activeTab === 'selection' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sélection de la propriété</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Propriété <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="selectedProperty"
                                        value={formData.selectedProperty}
                                        onChange={handlePropertySelection}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.selectedProperty ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Sélectionner une propriété</option>
                                        {userProperties.map(property => (
                                            <option key={property.id} value={property.id}>
                                                {property.title} - {property.propertyType}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.selectedProperty && <p className="text-red-500 text-sm mt-1">{errors.selectedProperty}</p>}
                                </div>

                                {formData.selectedProperty && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-800 mb-3">Informations automatiques</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de logement</label>
                                                <input
                                                    type="text"
                                                    value={formData.propertyType}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                                                <input
                                                    type="text"
                                                    value={formData.surface}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de pièces</label>
                                                <input
                                                    type="text"
                                                    value={formData.rooms}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Onglet Détails complémentaires */}
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations complémentaires</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            État du bien <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="condition"
                                            value={formData.condition}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.condition ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Sélectionner l'état</option>
                                            {conditionOptions.map(condition => (
                                                <option key={condition} value={condition}>{condition}</option>
                                            ))}
                                        </select>
                                        {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quartier / Localisation précise
                                        </label>
                                        <input
                                            type="text"
                                            name="neighborhood"
                                            value={formData.neighborhood}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Proche école, commerces..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Caractéristiques du bien
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {characteristicsList.map(({ key, label, icon }) => (
                                            <label key={key} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.characteristics[key]}
                                                    onChange={() => handleCharacteristicChange(key)}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm">{icon} {label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Onglet Paramètres financiers */}
                        {activeTab === 'financial' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Paramètres financiers</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Durée du bail souhaitée (optionnel)
                                        </label>
                                        <select
                                            name="leaseDuration"
                                            value={formData.leaseDuration}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Sélectionner la durée</option>
                                            {leaseDurationOptions.map(duration => (
                                                <option key={duration} value={duration}>{duration}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Prix actuel (pour comparaison)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="currentPrice"
                                                value={formData.currentPrice}
                                                onChange={handleInputChange}
                                                placeholder="Ex: 150000"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="absolute right-3 top-2 text-gray-500">FCFA</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Informations</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• L'évaluation se base sur les données du marché immobilier local</li>
                                        <li>• Les caractéristiques sélectionnées influencent le prix final</li>
                                        <li>• Une analyse comparative sera fournie avec votre évaluation</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Onglet Résultat de l'évaluation */}
                        {activeTab === 'result' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Évaluation IA</h3>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader className="animate-spin text-blue-600 mb-4" size={48} />
                                        <p className="text-gray-600">Analyse des données en cours...</p>
                                        <p className="text-sm text-gray-500 mt-2">Calcul de l'estimation basée sur le marché</p>
                                    </div>
                                ) : evaluationResult ? (
                                    <div className="space-y-6">
                                        {/* Prix estimé */}
                                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                            <h4 className="text-xl font-bold text-blue-800 mb-2">Prix estimé</h4>
                                            <p className="text-3xl font-bold text-blue-600">{evaluationResult.estimatedPrice.toLocaleString()} FCFA</p>
                                            <p className="text-sm text-blue-700 mt-2">Confiance: {evaluationResult.confidence}%</p>
                                        </div>

                                        {/* Analyse du marché */}
                                        <div className="bg-white p-4 border rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-3">Analyse du marché</h4>
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <p className="text-sm text-gray-600">Prix minimum</p>
                                                    <p className="font-semibold text-gray-800">{evaluationResult.marketAnalysis.priceRange.min.toLocaleString()} FCFA</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Prix moyen du marché</p>
                                                    <p className="font-semibold text-gray-800">{evaluationResult.marketAnalysis.averagePrice.toLocaleString()} FCFA</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Prix maximum</p>
                                                    <p className="font-semibold text-gray-800">{evaluationResult.marketAnalysis.priceRange.max.toLocaleString()} FCFA</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Facteurs d'influence */}
                                        <div className="bg-white p-4 border rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-3">Facteurs d'influence</h4>
                                            <div className="space-y-2">
                                                {evaluationResult.factors.map((factor, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                                        <div>
                                                            <span className="font-medium text-gray-800">{factor.factor}</span>
                                                            <span className="text-sm text-gray-600 ml-2">({factor.description})</span>
                                                        </div>
                                                        <span className={`font-semibold ${factor.impact.startsWith('+') ? 'text-green-600' : factor.impact.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                                                            {factor.impact}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recommandation */}
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                            <h4 className="font-semibold text-green-800 mb-2">Recommandation</h4>
                                            <p className="text-green-700">{evaluationResult.recommendation}</p>
                                        </div>

                                        {/* Bouton télécharger rapport */}
                                        <div className="text-center">
                                            <button
                                                onClick={downloadReport}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                                            >
                                                <FileDown size={16} />
                                                Télécharger le rapport PDF
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Veuillez remplir les informations requises et lancer l'évaluation</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="border-t bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        {activeTab !== 'result' && (
                            <button
                                type="button"
                                onClick={handleEvaluation}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                            >
                                Lancer l'évaluation
                            </button>
                        )}
                        {evaluationResult && (
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('selection');
                                    setEvaluationResult(null);
                                }}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                            >
                                Nouvelle évaluation
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationIAModal;