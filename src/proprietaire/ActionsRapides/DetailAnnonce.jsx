import React, { useState } from 'react';
import { X, MapPin, Home, Maximize, Bed, Bath, Calendar, DollarSign, User, Phone, Mail, Share2, Heart, MessageCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const AnnonceDetailModal = ({ isOpen, onClose, annonce }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    if (!isOpen || !annonce) return null;

    const images = [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
    ];

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    const characteristics = [
        { icon: '🏗️', label: 'Balcon', active: true },
        { icon: '🛋️', label: 'Meublé', active: true },
        { icon: '🌿', label: 'Jardin', active: false },
        { icon: '🚗', label: 'Parking', active: true },
        { icon: '❄️', label: 'Clim', active: true },
        { icon: '📶', label: 'Internet', active: true }
    ];

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Galerie d'images compacte */}
                <div className="relative h-64 bg-gray-900">
                    <img
                        src={images[currentImageIndex]}
                        alt={`Photo ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                    />
                    
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                    index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={`p-2 rounded-full shadow-lg ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-800'}`}
                        >
                            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button className="bg-white/90 p-2 rounded-full shadow-lg">
                            <Share2 size={16} />
                        </button>
                        <button onClick={onClose} className="bg-white/90 p-2 rounded-full shadow-lg">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="absolute top-2 left-2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            ✅ Disponible
                        </span>
                    </div>
                </div>

                {/* Contenu scrollable */}
                <div className="overflow-y-auto max-h-[calc(90vh-16rem)] p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne principale */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* En-tête */}
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h1 className="text-2xl font-bold text-gray-900">{annonce.title}</h1>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        annonce.type === 'Vente' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                    }`}>
                                        {annonce.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                                    <MapPin size={16} />
                                    <span>{annonce.location}</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">{annonce.price}</div>
                            </div>

                            {/* Infos principales */}
                            <div className="grid grid-cols-4 gap-3">
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <Maximize size={20} className="mx-auto mb-1 text-blue-600" />
                                    <div className="text-lg font-bold text-gray-800">{annonce.surface}</div>
                                    <div className="text-xs text-gray-600">Surface</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <Bed size={20} className="mx-auto mb-1 text-purple-600" />
                                    <div className="text-lg font-bold text-gray-800">{annonce.bedrooms}</div>
                                    <div className="text-xs text-gray-600">Chambres</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <Bath size={20} className="mx-auto mb-1 text-cyan-600" />
                                    <div className="text-lg font-bold text-gray-800">2</div>
                                    <div className="text-xs text-gray-600">Salles bain</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <Home size={20} className="mx-auto mb-1 text-orange-600" />
                                    <div className="text-lg font-bold text-gray-800">{annonce.photos}</div>
                                    <div className="text-xs text-gray-600">Photos</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="border-t pt-4">
                                <h2 className="text-lg font-bold text-gray-800 mb-2">📝 Description</h2>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Magnifique {annonce.property} située dans un quartier calme et résidentiel de {annonce.location}. 
                                    Proche de toutes commodités : écoles, commerces, transports. Idéal pour une famille.
                                </p>
                            </div>

                            {/* Caractéristiques */}
                            <div className="border-t pt-4">
                                <h2 className="text-lg font-bold text-gray-800 mb-2">⚡ Caractéristiques</h2>
                                <div className="grid grid-cols-3 gap-2">
                                    {characteristics.map((char, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-2 p-2 rounded-lg border ${
                                                char.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-50'
                                            }`}
                                        >
                                            <span className="text-lg">{char.icon}</span>
                                            <span className="text-xs font-medium text-gray-700">{char.label}</span>
                                            {char.active && <Check size={14} className="ml-auto text-green-600" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="border-t pt-4">
                                <h2 className="text-lg font-bold text-gray-800 mb-2">📊 Statistiques</h2>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                                        <div className="text-2xl font-bold text-blue-600">{annonce.views}</div>
                                        <div className="text-xs text-gray-600">👁️ Vues</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                                        <div className="text-2xl font-bold text-green-600">{annonce.contacts}</div>
                                        <div className="text-xs text-gray-600">📞 Contacts</div>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-200">
                                        <div className="text-2xl font-bold text-purple-600">15</div>
                                        <div className="text-xs text-gray-600">❤️ Favoris</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Colonne contact */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-0 space-y-3">
                                {/* Contact */}
                                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
                                    <h3 className="text-base font-bold text-gray-800 mb-3">💬 Contact</h3>
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                                            <User size={16} className="text-gray-600" />
                                            <div>
                                                <div className="text-xs text-gray-500">Propriétaire</div>
                                                <div className="text-sm font-semibold text-gray-800">Jean Kouadio</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                                            <Phone size={16} className="text-gray-600" />
                                            <div>
                                                <div className="text-xs text-gray-500">Téléphone</div>
                                                <div className="text-sm font-semibold text-gray-800">+225 07 12 34 56 78</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                                            <Phone size={16} />
                                            Appeler
                                        </button>
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                                            <MessageCircle size={16} />
                                            WhatsApp
                                        </button>
                                        <button className="w-full bg-white hover:bg-gray-50 text-gray-800 py-2 rounded-lg text-sm font-semibold border border-gray-300 flex items-center justify-center gap-2">
                                            <Mail size={16} />
                                            Email
                                        </button>
                                    </div>
                                </div>

                                {/* Infos publication */}
                                <div className="bg-gray-50 rounded-lg p-3 border">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-2">📅 Publication</h4>
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Date:</span>
                                            <span className="font-semibold text-gray-800">{annonce.date}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Réf:</span>
                                            <span className="font-semibold text-gray-800">AN-{annonce.id}2025</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Statut:</span>
                                            <span className="font-semibold text-green-600">✅ Vérifiée</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Avertissement */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800">
                                        ⚠️ <strong>Attention:</strong> Vérifiez l'identité du propriétaire avant tout paiement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnonceDetailModal;