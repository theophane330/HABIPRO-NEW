import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Prestataire = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [selectedPrestataire, setSelectedPrestataire] = useState(null);
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Configuration de l'URL de l'API
  const API_URL = 'http://localhost:8000/api'; // Ajustez selon votre configuration

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    fetchPrestataires();
  }, []);

  // Récupérer les prestataires depuis le backend
// Récupérer les prestataires depuis le backend
  const fetchPrestataires = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Récupérer le token d'authentification
      
      const response = await axios.get(`${API_URL}/prestataires/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      // Gérer différents formats de réponse API
      const data = response.data;
      if (Array.isArray(data)) {
        setPrestataires(data);
      } else if (data.results && Array.isArray(data.results)) {
        setPrestataires(data.results);
      } else if (data.data && Array.isArray(data.data)) {
        setPrestataires(data.data);
      } else {
        console.error('Format de données inattendu:', data);
        setPrestataires([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des prestataires:', err);
      setError('Impossible de charger les prestataires');
      setPrestataires([]); // Initialiser avec un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un prestataire
  const deletePrestataire = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce prestataire ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/prestataires/${id}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      // Retirer le prestataire de la liste
      setPrestataires(prestataires.filter(p => p.id !== id));
      setSelectedPrestataire(null);
      
      alert('Prestataire supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression du prestataire');
    }
  };

  // Mettre à jour la disponibilité
  const toggleDisponibilite = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `${API_URL}/prestataires/${id}/toggle-disponibilite/`,
        {},
        {
          headers: {
            'Authorization': `Token ${token}`
          }
        }
      );
      
      // Mettre à jour la liste
      setPrestataires(prestataires.map(p => 
        p.id === id ? response.data.data : p
      ));
      
      alert(response.data.message);
    } catch (err) {
      console.error('Erreur lors du changement de disponibilité:', err);
      alert('Erreur lors du changement de disponibilité');
    }
  };

  const categories = [
    { id: 'tous', label: 'Tous les services' },
    { id: 'Électricité', label: 'Électricité' },
    { id: 'Plomberie', label: 'Plomberie' },
    { id: 'Jardinage', label: 'Jardinage' },
    { id: 'Sécurité', label: 'Sécurité' },
    { id: 'Nettoyage', label: 'Nettoyage' },
  ];

  // Fonction pour filtrer les prestataires
  const prestatairesFiltres = prestataires.filter(prestataire => {
    const matchCategorie = selectedCategory === 'tous' || 
      (prestataire.specialites && prestataire.specialites.some(spec => 
        spec.toLowerCase().includes(selectedCategory.toLowerCase())
      ));
    
    const matchRecherche = 
      prestataire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prestataire.specialites && prestataire.specialites.some(spec => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      prestataire.zone.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchCategorie && matchRecherche;
  });

  const getStatusColor = (disponibilite) => {
    if (disponibilite === 'Disponible') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const StarRating = ({ rating, totalStars = 5 }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(totalStars)].map((_, index) => (
          <svg key={index} className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm font-medium text-gray-700 ml-1">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des prestataires...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPrestataires}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50
      transform transition-all duration-700 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-3">Réseau de prestataires</h1>
              <p className="text-gray-600 text-lg">Professionnels qualifiés pour vos propriétés immobilières</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter prestataire
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-6">
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map(categorie => (
                <button
                  key={categorie.id}
                  onClick={() => setSelectedCategory(categorie.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === categorie.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {categorie.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-light text-gray-900">{prestataires.length}</div>
                <div className="text-sm text-gray-500">Prestataires</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-emerald-600">
                  {prestataires.filter(p => p.disponibilite === 'Disponible').length}
                </div>
                <div className="text-sm text-gray-500">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-yellow-500">
                  {prestataires.length > 0 
                    ? (prestataires.reduce((acc, p) => acc + parseFloat(p.note), 0) / prestataires.length).toFixed(1)
                    : '0.0'}
                </div>
                <div className="text-sm text-gray-500">Note moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-blue-600">{categories.length - 1}</div>
                <div className="text-sm text-gray-500">Spécialités</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prestataires Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {prestatairesFiltres.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {prestatairesFiltres.map(prestataire => (
              <div key={prestataire.id} className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg overflow-hidden group">
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{prestataire.nom}</h3>
                      <p className="text-gray-500 text-sm mb-3">{prestataire.contact}</p>
                      <div className="flex items-center gap-3 mb-3">
                        <StarRating rating={parseFloat(prestataire.note)} />
                        <span className="text-sm text-gray-400">({prestataire.nb_avis})</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prestataire.disponibilite)}`}>
                      {prestataire.disponibilite}
                    </span>
                  </div>

                  {/* Specialities */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {prestataire.specialites && prestataire.specialites.slice(0, 3).map((specialite, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {specialite}
                      </span>
                    ))}
                    {prestataire.specialites && prestataire.specialites.length > 3 && (
                      <span className="text-xs text-gray-400">+{prestataire.specialites.length - 3}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{prestataire.zone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span>{prestataire.tarif_min?.toLocaleString()} - {prestataire.tarif_max?.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Services Preview */}
                {prestataire.services && prestataire.services.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Services</h4>
                      <div className="space-y-1">
                        {prestataire.services.slice(0, 2).map((service, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-600">{service.nom}</span>
                            <span className="font-medium text-gray-900">{service.prix}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-2">
                  <button
                    onClick={() => setSelectedPrestataire(prestataire)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Détails
                  </button>
                  <button
                    onClick={() => toggleDisponibilite(prestataire.id)}
                    className="flex-1 bg-gray-900 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    {prestataire.disponibilite === 'Disponible' ? 'Marquer occupé' : 'Marquer dispo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun prestataire trouvé</h3>
            <p className="text-gray-600 mb-6">Modifiez vos critères ou ajoutez un nouveau prestataire</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              Ajouter prestataire
            </button>
          </div>
        )}
      </div>

      {/* Modal détails */}
      {selectedPrestataire && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-light text-gray-900 mb-2">{selectedPrestataire.nom}</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">{selectedPrestataire.description}</p>
                  <div className="flex items-center gap-4">
                    <StarRating rating={parseFloat(selectedPrestataire.note)} />
                    <span className="text-gray-400">({selectedPrestataire.nb_avis} avis)</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedPrestataire.disponibilite)}`}>
                      {selectedPrestataire.disponibilite}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPrestataire(null)}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{selectedPrestataire.contact}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{selectedPrestataire.telephone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{selectedPrestataire.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{selectedPrestataire.zone}</span>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                {selectedPrestataire.certifications && selectedPrestataire.certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Certifications</h3>
                    <div className="space-y-2">
                      {selectedPrestataire.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-600">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="space-y-6">
                {selectedPrestataire.services && selectedPrestataire.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Services & Tarifs</h3>
                    <div className="space-y-3">
                      {selectedPrestataire.services.map((service, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{service.nom}</span>
                            <span className="font-semibold text-gray-900">{service.prix}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties */}
                {selectedPrestataire.specialites && selectedPrestataire.specialites.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Spécialités</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrestataire.specialites.map((specialite, index) => (
                        <span key={index} className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm">
                          {specialite}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => deletePrestataire(selectedPrestataire.id)}
                    className="flex-1 bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors duration-200"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => toggleDisponibilite(selectedPrestataire.id)}
                    className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Changer disponibilité
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            {selectedPrestataire.projets_recents && selectedPrestataire.projets_recents.length > 0 && (
              <div className="px-8 pb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Projets récents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPrestataire.projets_recents.map((projet, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{projet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Ajout Prestataire */}
      <AddPrestataireModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchPrestataires(); // Recharger la liste
        }}
        API_URL={API_URL}
      />
    </div>
  );
};

// ============================================
// COMPOSANT MODAL D'AJOUT DE PRESTATAIRE
// ============================================

const AddPrestataireModal = ({ isOpen, onClose, onSuccess, API_URL }) => {
  const [formData, setFormData] = useState({
    nom: '',
    contact: '',
    telephone: '',
    email: '',
    specialites: [],
    zone: '',
    note: 0,
    nb_avis: 0,
    tarif_min: '',
    tarif_max: '',
    disponibilite: 'Disponible',
    experience: '',
    certifications: [],
    description: '',
    services: [],
    projets_recents: []
  });

  const [currentSpecialite, setCurrentSpecialite] = useState('');
  const [currentCertification, setCurrentCertification] = useState('');
  const [currentService, setCurrentService] = useState({ nom: '', prix: '' });
  const [currentProjet, setCurrentProjet] = useState('');
  const [loading, setLoading] = useState(false);

  const specialitesDisponibles = [
    'Électricité', 'Climatisation', 'Éclairage', 'Plomberie', 'Maçonnerie',
    'Carrelage', 'Jardinage', 'Entretien espaces verts', 'Paysagisme',
    'Sécurité', 'Surveillance', 'Systèmes d\'alarme', 'Nettoyage',
    'Entretien ménager', 'Désinfection'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSpecialite = () => {
    if (currentSpecialite && !formData.specialites.includes(currentSpecialite)) {
      setFormData(prev => ({
        ...prev,
        specialites: [...prev.specialites, currentSpecialite]
      }));
      setCurrentSpecialite('');
    }
  };

  const removeSpecialite = (spec) => {
    setFormData(prev => ({
      ...prev,
      specialites: prev.specialites.filter(s => s !== spec)
    }));
  };

  const addCertification = () => {
    if (currentCertification) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, currentCertification]
      }));
      setCurrentCertification('');
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    if (currentService.nom && currentService.prix) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, { ...currentService }]
      }));
      setCurrentService({ nom: '', prix: '' });
    }
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const addProjet = () => {
    if (currentProjet) {
      setFormData(prev => ({
        ...prev,
        projets_recents: [...prev.projets_recents, currentProjet]
      }));
      setCurrentProjet('');
    }
  };

  const removeProjet = (index) => {
    setFormData(prev => ({
      ...prev,
      projets_recents: prev.projets_recents.filter((_, i) => i !== index)
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Convertir les valeurs en nombres
      const dataToSend = {
        ...formData,
        tarif_min: parseInt(formData.tarif_min) || 0,
        tarif_max: parseInt(formData.tarif_max) || 0,
        note: parseFloat(formData.note) || 0,
        nb_avis: parseInt(formData.nb_avis) || 0
      };

      console.log('📤 Envoi des données:', dataToSend);

      const response = await axios.post(
        `${API_URL}/prestataires/`,
        dataToSend,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Réponse du serveur:', response);

      // ✅ VÉRIFIER LE STATUT HTTP
      if (response.status === 201 || response.status === 200) {
        alert('✅ Prestataire ajouté avec succès !');
        
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          contact: '',
          telephone: '',
          email: '',
          specialites: [],
          zone: '',
          note: 0,
          nb_avis: 0,
          tarif_min: '',
          tarif_max: '',
          disponibilite: 'Disponible',
          experience: '',
          certifications: [],
          description: '',
          services: [],
          projets_recents: []
        });

        // Fermer le modal et recharger
        onSuccess();
      } else {
        // Cas peu probable mais on gère quand même
        console.warn('⚠️ Statut inattendu:', response.status);
        alert('⚠️ Le prestataire a peut-être été ajouté. Veuillez vérifier.');
        onSuccess(); // Recharger quand même
      }

    } catch (error) {
      console.error('❌ Erreur complète:', error);
      console.error('❌ Détails de la réponse:', error.response);
      
      // ✅ VÉRIFIER SI C'EST UNE VRAIE ERREUR
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        if (error.response.status >= 400) {
          const errorMessage = error.response.data?.message 
            || error.response.data?.error 
            || error.response.data?.details
            || JSON.stringify(error.response.data)
            || 'Erreur lors de l\'ajout du prestataire';
          
          alert(`❌ Erreur: ${errorMessage}`);
        } else {
          // Statut 200-299 mais capturé comme erreur (ne devrait pas arriver)
          alert('✅ Prestataire ajouté avec succès !');
          onSuccess();
        }
      } else if (error.request) {
        // La requête a été envoyée mais pas de réponse
        alert('❌ Erreur réseau: Impossible de contacter le serveur');
      } else {
        // Erreur lors de la configuration de la requête
        alert(`❌ Erreur: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light text-gray-900">Ajouter un prestataire</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations de base */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du contact *
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone d'intervention *
              </label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                required
                placeholder="Ex: Abidjan - Cocody, Marcory"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expérience *
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                placeholder="Ex: 5 ans"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Spécialités */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Spécialités</h3>
              <div className="flex gap-2 mb-3">
                <select
                  value={currentSpecialite}
                  onChange={(e) => setCurrentSpecialite(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">Sélectionner une spécialité</option>
                  {specialitesDisponibles.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addSpecialite}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialites.map((spec, index) => (
                  <span key={index} className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialite(spec)}
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tarification */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Tarification</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif minimum (FCFA) *
              </label>
              <input
                type="number"
                name="tarif_min"
                value={formData.tarif_min}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif maximum (FCFA) *
              </label>
              <input
                type="number"
                name="tarif_max"
                value={formData.tarif_max}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Services */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Services proposés</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Nom du service"
                  value={currentService.nom}
                  onChange={(e) => setCurrentService({ ...currentService, nom: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Prix (ex: 5000 FCFA)"
                    value={currentService.prix}
                    onChange={(e) => setCurrentService({ ...currentService, prix: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addService}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {formData.services.map((service, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-medium">{service.nom}</span>
                      <span className="text-gray-600 ml-3">{service.prix}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Certifications</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Nom de la certification"
                  value={currentCertification}
                  onChange={(e) => setCurrentCertification(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Projets récents */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Projets récents</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Description du projet"
                  value={currentProjet}
                  onChange={(e) => setCurrentProjet(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addProjet}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {formData.projets_recents.map((projet, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <span>{projet}</span>
                    <button
                      type="button"
                      onClick={() => removeProjet(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Disponibilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilité
              </label>
              <select
                name="disponibilite"
                value={formData.disponibilite}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="Disponible">Disponible</option>
                <option value="Occupé">Occupé</option>
              </select>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le prestataire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Prestataire;