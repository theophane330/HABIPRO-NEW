import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, User, Home, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function SendContract() {
    const [loading, setLoading] = useState(false);
    const [acceptedVisits, setAcceptedVisits] = useState([]);
    const [properties, setProperties] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const [formData, setFormData] = useState({
        tenant_user: '',
        property: '',
        lease_start_date: '',
        lease_end_date: '',
        monthly_rent: '',
        security_deposit: ''
    });

    useEffect(() => {
        loadAcceptedVisits();
        loadProperties();
    }, []);

    const loadAcceptedVisits = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/visit-requests/?status=accepted`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAcceptedVisits(data.results || data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const loadProperties = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/properties/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProperties(data.results || data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowError(false);
        setShowSuccess(false);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/contract-templates/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Afficher le message de succès
                setShowSuccess(true);
                
                // Réinitialiser le formulaire
                setFormData({
                    tenant_user: '',
                    property: '',
                    lease_start_date: '',
                    lease_end_date: '',
                    monthly_rent: '',
                    security_deposit: ''
                });

                // Masquer le message après 5 secondes
                setTimeout(() => {
                    setShowSuccess(false);
                }, 5000);

                // Recharger les données
                loadAcceptedVisits();
                loadProperties();
            } else {
                const error = await response.json();
                setErrorMessage(error.error || 'Erreur lors de l\'envoi du contrat');
                setShowError(true);
                
                // Masquer le message d'erreur après 5 secondes
                setTimeout(() => {
                    setShowError(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Erreur:', error);
            setErrorMessage('Erreur lors de l\'envoi du contrat');
            setShowError(true);
            
            setTimeout(() => {
                setShowError(false);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            tenant_user: '',
            property: '',
            lease_start_date: '',
            lease_end_date: '',
            monthly_rent: '',
            security_deposit: ''
        });
        setShowSuccess(false);
        setShowError(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
            {/* Messages de succès et d'erreur */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slideInRight">
                    <CheckCircle size={24} />
                    <div>
                        <p className="font-semibold">Contrat envoyé avec succès !</p>
                        <p className="text-sm opacity-90">Le locataire a été notifié</p>
                    </div>
                </div>
            )}

            {showError && (
                <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slideInRight">
                    <AlertCircle size={24} />
                    <div>
                        <p className="font-semibold">Erreur</p>
                        <p className="text-sm opacity-90">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-lg">
                        <Send size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Envoyer un Contrat
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Créez et envoyez un contrat à un locataire</p>
                    </div>
                </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                            📄
                        </span>
                        Informations du Contrat
                    </h3>
                    
                    <div className="space-y-6">
                        {/* Sélection du locataire */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <User size={16} className="text-red-500" />
                                Locataire <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.tenant_user}
                                onChange={(e) => setFormData({ ...formData, tenant_user: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                required
                            >
                                <option value="">Sélectionner un locataire</option>
                                {acceptedVisits.map(visit => (
                                    <option key={visit.id} value={visit.tenant}>
                                        {visit.tenant_name} - {visit.property_title}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Seulement les locataires avec des visites acceptées
                            </p>
                        </div>

                        {/* Sélection de la propriété */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Home size={16} className="text-red-500" />
                                Propriété <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.property}
                                onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                required
                            >
                                <option value="">Sélectionner une propriété</option>
                                {properties.map(property => (
                                    <option key={property.id} value={property.id}>
                                        {property.titre} - {property.adresse}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar size={16} className="text-red-500" />
                                    Date de début <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.lease_start_date}
                                    onChange={(e) => setFormData({ ...formData, lease_start_date: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-500" />
                                    Date de fin
                                </label>
                                <input
                                    type="date"
                                    value={formData.lease_end_date}
                                    onChange={(e) => setFormData({ ...formData, lease_end_date: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                />
                            </div>
                        </div>

                        {/* Montants */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <DollarSign size={16} className="text-red-500" />
                                    Loyer mensuel (FCFA) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.monthly_rent}
                                    onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                    placeholder="Ex: 150000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <DollarSign size={16} className="text-red-500" />
                                    Caution <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.security_deposit}
                                    onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                    placeholder="Ex: 1 mois de loyer"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                    >
                        Réinitialiser
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-xl font-semibold hover:from-red-500 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Envoyer le Contrat
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style jsx>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slideInRight {
                    animation: slideInRight 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}