import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Home, Loader, X, ChevronRight, ChevronLeft, Play, Grid, List, Calendar, Send, Filter, RotateCcw, Clock, MessageSquare } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

// Fonction utilitaire pour formater les prix
function formatCurrency(value) {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(value);
}

// ============ MEDIA GALLERY ============
function MediaGallery({ medias, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen || !medias || medias.length === 0) return null;

  const currentMedia = medias[currentIndex];
  const isVideo = currentMedia.media_type === 'video';

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-700 ease-in-out ${isAnimating ? 'opacity-50' : 'opacity-0'}`} 
        onClick={handleClose} 
      />
      
      <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl bg-white shadow-2xl z-50 rounded-t-2xl transform transition-all duration-700 ease-in-out ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="h-[85vh] flex flex-col">
          <div className="relative bg-white border-b border-gray-200 p-6">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-light text-gray-900 mb-1">Galerie de médias</h2>
            <p className="text-sm text-gray-500">{currentIndex + 1} sur {medias.length}</p>
          </div>

          <div className="flex-1 overflow-hidden p-8 bg-gray-50">
            <div className="h-full bg-black rounded-lg overflow-hidden relative">
              {isVideo ? (
                <video src={currentMedia.file_url} className="w-full h-full object-contain" controls autoPlay />
              ) : (
                <img src={currentMedia.file_url} alt="" className="w-full h-full object-contain" />
              )}

              {medias.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentIndex((currentIndex - 1 + medias.length) % medias.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((currentIndex + 1) % medias.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </div>

          {medias.length > 1 && (
            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {medias.map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === currentIndex ? 'border-gray-900 shadow-lg' : 'border-gray-300 opacity-70 hover:opacity-100 hover:border-gray-400'
                    }`}>
                    {media.media_type === 'video' ? (
                      <div className="relative w-full h-full bg-gray-800">
                        <video src={media.file_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <Play size={20} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <img src={media.file_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============ PROPERTY DETAILS MODAL ============
function PropertyDetailsModal({ property, isOpen, onClose, onApply, onFavorite, isFavorited, onVisitRequest, initialAction }) {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitFormData, setVisitFormData] = useState({
    date: '',
    time: '',
    message: ''
  });

  // Ouvrir automatiquement le formulaire de visite si initialAction === 'visit'
  React.useEffect(() => {
    if (isOpen && initialAction === 'visit') {
      setShowVisitForm(true);
    }
  }, [isOpen, initialAction]);

  if (!isOpen || !property) return null;

  const handleSubmitVisit = async () => {
    if (visitFormData.date) {
      setIsSubmitting(true);
      try {
        // Combiner date et heure pour créer un datetime
        const datetime = visitFormData.time
          ? `${visitFormData.date}T${visitFormData.time}:00`
          : `${visitFormData.date}T10:00:00`;

        await onVisitRequest(property.id, {
          date: datetime,
          message: visitFormData.message
        });
        setVisitFormData({ date: '', time: '', message: '' });
        setShowVisitForm(false);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      await onApply(property.id);
      setShowApplyForm(false);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Modal Principal - Détails de la propriété */}
      {!showVisitForm && !showApplyForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-light text-gray-900">{property.titre}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Image principale */}
            {property.primary_media && (
              <div className="relative h-96 bg-gray-100">
                <img
                  src={property.primary_media.url}
                  alt={property.titre}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onFavorite(property.id)}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm transition-all ${
                    isFavorited
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-600 hover:bg-white'
                  }`}>
                  <Heart size={24} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
              </div>
            )}

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Prix et localisation */}
              <div>
                <div className="text-3xl font-light text-gray-900 mb-2">{formatCurrency(property.prix)}/mois</div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-2" />
                  {property.adresse}
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-900">{property.chambres}</div>
                  <div className="text-sm text-gray-600">Chambres</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-900">{property.salles_de_bain}</div>
                  <div className="text-sm text-gray-600">Salles de bain</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-900">{property.superficie}</div>
                  <div className="text-sm text-gray-600">m²</div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Type et statut */}
              <div className="flex gap-4">
                <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">Type</div>
                  <div className="font-semibold text-blue-900">{property.type || 'Non spécifié'}</div>
                </div>
                <div className="flex-1 bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Statut</div>
                  <div className="font-semibold text-green-900">
                    {property.statut === 'disponible' ? 'Disponible' : property.statut}
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowVisitForm(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Calendar size={20} />
                  Demander une visite
                </button>
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Soumettre candidature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Demande de Visite */}
      {showVisitForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={28} className="text-white" />
                <h3 className="text-2xl font-bold text-white">Demander une visite</h3>
              </div>
              <button
                onClick={() => setShowVisitForm(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Date préférée
                </label>
                <input
                  type="date"
                  value={visitFormData.date}
                  onChange={(e) => setVisitFormData({ ...visitFormData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Heure */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock size={16} /> Heure (optionnel)
                </label>
                <input
                  type="time"
                  value={visitFormData.time}
                  onChange={(e) => setVisitFormData({ ...visitFormData, time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare size={16} /> Message (optionnel)
                </label>
                <textarea
                  placeholder="Ex: Je suis particulièrement intéressé par..."
                  value={visitFormData.message}
                  onChange={(e) => setVisitFormData({ ...visitFormData, message: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="border-t bg-gray-50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowVisitForm(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitVisit}
                disabled={isSubmitting || !visitFormData.date}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Candidature */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Send size={28} className="text-white" />
                <h3 className="text-2xl font-bold text-white">Soumettre candidature</h3>
              </div>
              <button
                onClick={() => setShowApplyForm(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✨ <strong>Vérifiez votre profil</strong> avant de soumettre votre candidature. Le propriétaire pourra consulter vos informations personnelles et vérifier votre fiabilité.
                </p>
              </div>

              {/* Détails candidat (exemple) */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom</span>
                  <span className="font-semibold">Jean Dupont</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold">jean@email.com</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Téléphone</span>
                  <span className="font-semibold">+225 XX XXX XXX</span>
                </div>
              </div>

              {/* Checkbox confirmation */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 w-5 h-5 accent-green-600 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Je confirme que mes informations sont exactes et à jour
                </span>
              </label>
            </div>

            {/* Boutons */}
            <div className="border-t bg-gray-50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowApplyForm(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Envoi...</span>
                ) : (
                  <>
                    <Send size={18} />
                    Soumettre
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============ PROPERTY CARD ============
function PropertyCard({ property, onViewDetails, onFavorite, isFavorited }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const primaryMedia = property.primary_media;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-400 transition-all group shadow-sm hover:shadow-md">
        {/* Image */}
        <div className="relative overflow-hidden h-48 bg-gray-100">
          {primaryMedia ? (
            <img 
              src={primaryMedia.url} 
              alt={property.titre} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
          )}
          
          {/* Badge statut */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              property.statut === 'disponible' 
                ? 'bg-green-500/80 text-white'
                : property.statut === 'en_attente'
                ? 'bg-yellow-500/80 text-white'
                : 'bg-red-500/80 text-white'
            }`}>
              <div className="w-2 h-2 rounded-full mr-1.5 bg-white"></div>
              {property.statut === 'disponible' ? 'Disponible' : property.statut === 'en_attente' ? 'En attente' : 'Réservé'}
            </span>
          </div>

          {/* Boutons favoris et galerie */}
          <button
            onClick={() => onFavorite(property.id)}
            className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}>
            <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>

          {property.medias && property.medias.length > 1 && (
            <button
              onClick={() => setGalleryOpen(true)}
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium hover:bg-white transition-all">
              📷 {property.medias.length}
            </button>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className="text-lg font-light text-gray-900 mb-1 line-clamp-1">{property.titre}</h3>
          <div className="flex items-center text-gray-500 text-xs mb-3">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.adresse}</span>
          </div>
          
          {/* Prix */}
          <div className="bg-gray-50 p-3 rounded mb-3">
            <div className="text-xl font-light text-gray-900">{formatCurrency(property.prix)}</div>
            <div className="text-xs text-gray-500">par mois</div>
          </div>
          
          {/* Specs */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-base font-light text-gray-900">{property.chambres}</div>
              <div className="text-xs text-gray-500">ch.</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-base font-light text-gray-900">{property.salles_de_bain}</div>
              <div className="text-xs text-gray-500">sdb</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-sm font-light text-gray-900">{property.superficie}</div>
              <div className="text-xs text-gray-500">m²</div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(property)}
              className="flex-1 px-3 py-2 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 transition-all font-medium">
              Voir détails
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(property, 'visit');
              }}
              className="flex-1 px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-all font-medium">
              📅 Visite
            </button>
          </div>
        </div>
      </div>

      <MediaGallery 
        medias={property.medias} 
        isOpen={galleryOpen} 
        onClose={() => setGalleryOpen(false)} 
      />
    </>
  );
}

// ============ MAIN COMPONENT ============
export default function TenantLocationsPage({ defaultTab = 'properties' }) {
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [applications, setApplications] = useState([]);
  const [visitRequests, setVisitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [openModalAction, setOpenModalAction] = useState(null); // 'visit' ou null
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState(defaultTab); // 'properties' ou 'visits'

  // Mettre à jour l'onglet actif si defaultTab change
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Filtres
  const [filters, setFilters] = useState({
    location: '',
    budgetMax: '',
    type: '',
    bedrooms: '',
    status: 'disponible'
  });

  const [locations] = useState(['Cocody', 'Yopougon', 'Plateau', 'Marcory', 'Treichville']);
  const [propertyTypes] = useState(['Appartement', 'Studio', 'Villa', 'Bureau', 'Magasin', 'Duplex']);

  // Récupérer les propriétés
  useEffect(() => {
    fetchProperties();
    loadFavorites();
    loadApplications();
    loadVisitRequests();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/properties/?statut=disponible`, {
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(Array.isArray(data) ? data : data.results || []);
      } else {
        console.error('Erreur lors du chargement des propriétés:', response.status);
        if (response.status === 403) {
          console.error('Authentification requise - vérifiez votre connexion');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('favorites');
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      setFavorites([]);
    }
  };

  const loadApplications = () => {
    try {
      const saved = localStorage.getItem('applications');
      setApplications(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
      setApplications([]);
    }
  };

  const loadVisitRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Aucun token trouvé');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/visit-requests/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVisitRequests(Array.isArray(data) ? data : data.results || []);
      } else {
        console.error('Erreur lors du chargement des visites:', response.status);
        setVisitRequests([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des visites:', error);
      setVisitRequests([]);
    }
  };

  // Appliquer les filtres
  const getFilteredProperties = () => {
    return properties.filter(property => {
      if (filters.location && !property.adresse?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.budgetMax && property.prix > parseInt(filters.budgetMax)) return false;
      if (filters.type && property.type !== filters.type) return false;
      if (filters.bedrooms && property.chambres !== parseInt(filters.bedrooms)) return false;
      return true;
    });
  };

  const handleFavorite = (propertyId) => {
    try {
      const newFavorites = favorites.includes(propertyId)
        ? favorites.filter(id => id !== propertyId)
        : [...favorites, propertyId];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error);
    }
  };

  const handleApply = (propertyId) => {
    try {
      const newApplications = [...applications, {
        propertyId,
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'En attente'
      }];
      setApplications(newApplications);
      localStorage.setItem('applications', JSON.stringify(newApplications));
      alert('Candidature soumise avec succès !');
    } catch (error) {
      console.error('Erreur lors de la soumission de la candidature:', error);
      alert('Erreur lors de la soumission de la candidature');
    }
  };

  const handleVisitRequest = async (propertyId, data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté pour demander une visite');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/visit-requests/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property: propertyId,
          requested_date: data.date,
          message: data.message || ''
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Demande de visite envoyée au propriétaire !');
        // Recharger les demandes de visite pour obtenir la dernière version
        await loadVisitRequests();
      } else {
        const error = await response.json();
        console.error('Erreur complète:', error);
        console.error('Status:', response.status);

        // Afficher le message d'erreur spécifique du backend
        const errorMessage = error.error || error.detail || 'Erreur lors de l\'envoi de la demande';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Erreur lors de la demande de visite:', error);
      alert('Erreur lors de l\'envoi de la demande');
    }
  };

  const handleViewDetails = (property, action = null) => {
    setSelectedProperty(property);
    setOpenModalAction(action);
  };

  const handleCloseModal = () => {
    setSelectedProperty(null);
    setOpenModalAction(null);
  };

  const handleAcceptProposedDate = async (visitId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/visit-requests/${visitId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'accepted'
        })
      });

      if (response.ok) {
        alert('✅ Vous avez accepté la nouvelle date proposée !');
        await loadVisitRequests();
      } else {
        const error = await response.json();
        alert('Erreur: ' + (error.error || 'Impossible d\'accepter la date'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'acceptation de la date');
    }
  };

  const handleRejectProposedDate = async (visitId) => {
    if (!window.confirm('Voulez-vous vraiment refuser cette proposition de date ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/visit-requests/${visitId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected'
        })
      });

      if (response.ok) {
        alert('❌ Vous avez refusé la proposition de date');
        await loadVisitRequests();
      } else {
        const error = await response.json();
        alert('Erreur: ' + (error.error || 'Impossible de refuser la date'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du refus de la date');
    }
  };

  const filteredProperties = getFilteredProperties();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-light text-gray-900 mb-2">🔍 Trouvez votre prochaine location</h1>
          <p className="text-gray-600">Découvrez les logements disponibles selon votre budget, vos préférences et votre zone géographique.</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'properties'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              🏠 Locations disponibles
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'visits'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              📅 Mes visites ({visitRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Barre d'action rapide */}
      {activeTab === 'properties' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-3">
                <button onClick={fetchProperties} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all text-sm">
                  🔄 Actualiser
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all text-sm">
                  ❤️ Favoris ({favorites.length})
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all text-sm">
                  📤 Candidatures ({applications.length})
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filtres (Sidebar) - uniquement pour l'onglet properties */}
          {activeTab === 'properties' && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter size={20} /> Filtres
                </h2>
                <button
                  onClick={() => setFilters({ location: '', budgetMax: '', type: '', bedrooms: '', status: 'disponible' })}
                  className="text-gray-500 hover:text-gray-700">
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Localisation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📍 Localisation</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">Toutes les zones</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💰 Budget max (FCFA)</label>
                  <input
                    type="number"
                    value={filters.budgetMax}
                    onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                    placeholder="ex: 500000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Type de bien */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🏠 Type de bien</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">Tous les types</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Chambres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🛏️ Nombre de pièces</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">Tous</option>
                    <option value="1">1 pièce</option>
                    <option value="2">2 pièces</option>
                    <option value="3">3 pièces</option>
                    <option value="4">4+ pièces</option>
                  </select>
                </div>

                {/* Boutons d'action */}
                <div className="pt-4 space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium">
                    Appliquer les filtres
                  </button>
                  <button
                    onClick={() => setFilters({ location: '', budgetMax: '', type: '', bedrooms: '', status: 'disponible' })}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm">
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Contenu principal */}
          <div className="flex-1">
          {activeTab === 'properties' ? (
            loading ? (
              <div className="flex items-center justify-center h-96">
                <Loader size={32} className="animate-spin text-gray-400" />
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-light text-gray-600 mb-2">Aucune propriété trouvée</h3>
                <p className="text-gray-500 mb-6">Ajustez vos critères de recherche pour voir plus de résultats.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-6">{filteredProperties.length} bien(s) trouvé(s)</p>
                
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onViewDetails={handleViewDetails}
                        onFavorite={handleFavorite}
                        isFavorited={favorites.includes(property.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProperties.map(property => (
                      <div key={property.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-400 transition-all group">
                        <div className="flex gap-4">
                          {property.primary_media && (
                            <img 
                              src={property.primary_media.url} 
                              alt={property.titre}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-light text-lg text-gray-900">{property.titre}</h3>
                                <div className="flex items-center text-gray-500 text-sm">
                                  <MapPin size={14} className="mr-1" />
                                  {property.adresse}
                                </div>
                              </div>
                              <button
                                onClick={() => handleFavorite(property.id)}
                                className={`p-2 rounded-full transition-all ${
                                  favorites.includes(property.id)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                <Heart size={18} fill={favorites.includes(property.id) ? 'currentColor' : 'none'} />
                              </button>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-xl font-light text-gray-900">{formatCurrency(property.prix)}/mois</div>
                              <div className="text-gray-500">{property.chambres} ch • {property.salles_de_bain} sdb • {property.superficie} m²</div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleViewDetails(property)}
                              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-all">
                              Détails
                            </button>
                            <button
                              onClick={() => handleViewDetails(property, 'visit')}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-all">
                              📅 Visite
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          ) : (
            // Affichage des visites
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-6">{visitRequests.length} demande(s) de visite</p>

              {visitRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-light text-gray-600 mb-2">Aucune demande de visite</h3>
                  <p className="text-gray-500 mb-6">Vous n'avez pas encore demandé de visite.</p>
                  <button
                    onClick={() => setActiveTab('properties')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all">
                    Découvrir les propriétés
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {visitRequests.map(visit => (
                    <div key={visit.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-400 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{visit.property_title || 'Propriété'}</h3>
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin size={14} className="mr-1" />
                            {visit.property_address || 'Adresse non disponible'}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          visit.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : visit.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : visit.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {visit.status === 'pending' && '🟡 En attente'}
                          {visit.status === 'accepted' && '✅ Acceptée'}
                          {visit.status === 'rejected' && '❌ Refusée'}
                          {visit.status === 'proposed' && '📅 Date proposée'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Date demandée</div>
                          <div className="font-medium text-gray-900">{new Date(visit.requested_date).toLocaleDateString('fr-FR')}</div>
                        </div>
                        {visit.proposed_date && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-xs text-blue-600 mb-1">Date proposée par le propriétaire</div>
                            <div className="font-medium text-blue-900">{new Date(visit.proposed_date).toLocaleDateString('fr-FR')}</div>
                          </div>
                        )}
                      </div>

                      {visit.message && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <div className="text-xs text-gray-500 mb-1">Votre message</div>
                          <div className="text-sm text-gray-700">{visit.message}</div>
                        </div>
                      )}

                      {visit.owner_message && (
                        <div className={`p-3 rounded-lg mb-4 ${
                          visit.status === 'rejected'
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <div className={`text-xs font-semibold mb-1 flex items-center gap-1 ${
                            visit.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {visit.status === 'rejected' ? '❌ Raison du refus' : '💬 Message du propriétaire'}
                          </div>
                          <div className={`text-sm ${
                            visit.status === 'rejected' ? 'text-red-900' : 'text-blue-900'
                          }`}>{visit.owner_message}</div>
                        </div>
                      )}

                      {visit.status === 'proposed' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleAcceptProposedDate(visit.id)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium">
                            ✓ Accepter la nouvelle date
                          </button>
                          <button
                            onClick={() => handleRejectProposedDate(visit.id)}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all text-sm font-medium">
                            ✗ Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Modal détails */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={handleCloseModal}
        onApply={handleApply}
        onFavorite={handleFavorite}
        isFavorited={selectedProperty && favorites.includes(selectedProperty.id)}
        onVisitRequest={handleVisitRequest}
        initialAction={openModalAction}
      />
    </div>
  );
}