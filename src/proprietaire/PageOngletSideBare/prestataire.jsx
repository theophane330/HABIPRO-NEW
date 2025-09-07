import React, { useState } from 'react';

const Prestataire = ({ setIsPrestatairesModalOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [selectedPrestataire, setSelectedPrestataire] = useState(null);

  // Données des prestataires
  const prestataires = [
    {
      id: 1,
      nom: 'Koné Électricité SARL',
      contact: 'Jean-Baptiste Koné',
      telephone: '+225 07 12 34 56 78',
      email: 'contact@kone-electricite.ci',
      specialites: ['Électricité', 'Climatisation', 'Éclairage'],
      zone: 'Abidjan - Cocody, Marcory',
      note: 4.8,
      nbAvis: 127,
      tarif: '15 000 - 25 000',
      disponibilite: 'Disponible',
      experience: '8 ans',
      certifications: ['Certification électricien agréé', 'Formation climatisation'],
      description: 'Spécialisé dans les installations électriques et la climatisation pour immeubles résidentiels.',
      services: [
        { nom: 'Installation électrique', prix: '20 000 FCFA/point' },
        { nom: 'Réparation climatisation', prix: '15 000 FCFA' },
        { nom: 'Maintenance préventive', prix: '10 000 FCFA/visite' }
      ],
      projetsRecents: [
        'Rénovation électrique - Villa Angré (Février 2024)',
        'Installation climatisation - Appartement Riviera (Mars 2024)'
      ]
    },
    {
      id: 2,
      nom: 'BTP Abidjan Plus',
      contact: 'Marie Diabaté',
      telephone: '+225 05 87 65 43 21',
      email: 'marie@btpabidjan.ci',
      specialites: ['Plomberie', 'Maçonnerie', 'Carrelage'],
      zone: 'Grand Abidjan',
      note: 4.6,
      nbAvis: 89,
      tarif: '12 000 - 30 000',
      disponibilite: 'Occupé jusqu\'au 15/04',
      experience: '12 ans',
      certifications: ['Maître artisan BTP', 'Certification plomberie'],
      description: 'Expert en travaux de plomberie et rénovation pour propriétés résidentielles.',
      services: [
        { nom: 'Réparation fuite', prix: '8 000 FCFA' },
        { nom: 'Installation sanitaire', prix: '25 000 FCFA' },
        { nom: 'Pose carrelage', prix: '5 000 FCFA/m²' }
      ],
      projetsRecents: [
        'Rénovation salle de bain - Appartement Plateau (Janvier 2024)',
        'Réparation canalisation - Villa Yopougon (Mars 2024)'
      ]
    },
    {
      id: 3,
      nom: 'Jardins & Espaces Verts CI',
      contact: 'Amadou Traoré',
      telephone: '+225 01 23 45 67 89',
      email: 'espacesverts@gmail.com',
      specialites: ['Jardinage', 'Entretien espaces verts', 'Paysagisme'],
      zone: 'Abidjan et environs',
      note: 4.9,
      nbAvis: 156,
      tarif: '8 000 - 15 000',
      disponibilite: 'Disponible',
      experience: '6 ans',
      certifications: ['Formation paysagisme', 'Certification phytosanitaire'],
      description: 'Création et entretien d\'espaces verts pour résidences et copropriétés.',
      services: [
        { nom: 'Tonte gazon', prix: '5 000 FCFA/visite' },
        { nom: 'Taille arbustes', prix: '3 000 FCFA/arbuste' },
        { nom: 'Création jardin', prix: '50 000 FCFA/projet' }
      ],
      projetsRecents: [
        'Aménagement jardin - Villa Angré (Février 2024)',
        'Entretien espaces verts - Résidence Riviera (En cours)'
      ]
    },
    {
      id: 4,
      nom: 'Sécurité Plus Côte d\'Ivoire',
      contact: 'Ibrahim Ouattara',
      telephone: '+225 09 87 65 43 21',
      email: 'securite@securiteplus.ci',
      specialites: ['Sécurité', 'Surveillance', 'Systèmes d\'alarme'],
      zone: 'Abidjan',
      note: 4.7,
      nbAvis: 203,
      tarif: '25 000 - 50 000',
      disponibilite: 'Disponible',
      experience: '10 ans',
      certifications: ['Agrément sécurité privée', 'Formation agents de sécurité'],
      description: 'Services de sécurité et surveillance pour propriétés immobilières.',
      services: [
        { nom: 'Gardiennage 24h/24', prix: '180 000 FCFA/mois' },
        { nom: 'Installation alarme', prix: '75 000 FCFA' },
        { nom: 'Surveillance périodique', prix: '25 000 FCFA/semaine' }
      ],
      projetsRecents: [
        'Installation système sécurité - Immeuble Plateau (Mars 2024)',
        'Service gardiennage - Villa Cocody (En cours)'
      ]
    },
    {
      id: 5,
      nom: 'Nettoyage Pro Services',
      contact: 'Fatou Camara',
      telephone: '+225 03 45 67 89 01',
      email: 'nettoyage@proservices.ci',
      specialites: ['Nettoyage', 'Entretien ménager', 'Désinfection'],
      zone: 'Abidjan - Tous quartiers',
      note: 4.5,
      nbAvis: 94,
      tarif: '8 000 - 20 000',
      disponibilite: 'Disponible',
      experience: '5 ans',
      certifications: ['Formation produits d\'entretien', 'Certification hygiène'],
      description: 'Services de nettoyage professionnel pour logements et parties communes.',
      services: [
        { nom: 'Nettoyage appartement', prix: '15 000 FCFA' },
        { nom: 'Entretien parties communes', prix: '25 000 FCFA/mois' },
        { nom: 'Nettoyage après travaux', prix: '20 000 FCFA' }
      ],
      projetsRecents: [
        'Nettoyage post-rénovation - Studio Plateau (Mars 2024)',
        'Entretien mensuel - Résidence Marcory (En cours)'
      ]
    }
  ];

  const categories = [
    { id: 'tous', label: 'Tous les services' },
    { id: 'electricite', label: 'Électricité' },
    { id: 'plomberie', label: 'Plomberie' },
    { id: 'jardinage', label: 'Jardinage' },
    { id: 'securite', label: 'Sécurité' },
    { id: 'nettoyage', label: 'Nettoyage' },
  ];

  // Fonction pour filtrer les prestataires
  const prestatairesFiltres = prestataires.filter(prestataire => {
    const matchCategorie = selectedCategory === 'tous' || 
      prestataire.specialites.some(spec => 
        spec.toLowerCase().includes(selectedCategory) ||
        (selectedCategory === 'electricite' && spec.toLowerCase().includes('électricité')) ||
        (selectedCategory === 'securite' && spec.toLowerCase().includes('sécurité'))
      );
    
    const matchRecherche = prestataire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestataire.specialites.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

  const handleContact = (prestataire) => {
    alert(`Contact avec ${prestataire.nom}:\n📞 ${prestataire.telephone}\n📧 ${prestataire.email}`);
  };

  const handleDemande = (prestataire) => {
    alert(`Demande de devis envoyée à ${prestataire.nom}.\nVous recevrez une réponse sous 24h.`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-3">Réseau de prestataires</h1>
              <p className="text-gray-600 text-lg">Professionnels qualifiés pour vos propriétés immobilières</p>
            </div>
            <button
              onClick={() => setIsPrestatairesModalOpen(true)}
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
                <div className="text-2xl font-light text-yellow-500">4.7</div>
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
                        <StarRating rating={prestataire.note} />
                        <span className="text-sm text-gray-400">({prestataire.nbAvis})</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prestataire.disponibilite)}`}>
                      {prestataire.disponibilite}
                    </span>
                  </div>

                  {/* Specialities */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {prestataire.specialites.slice(0, 3).map((specialite, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {specialite}
                      </span>
                    ))}
                    {prestataire.specialites.length > 3 && (
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
                      <span>{prestataire.tarif} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Services Preview */}
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

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-2">
                  <button
                    onClick={() => setSelectedPrestataire(prestataire)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Détails
                  </button>
                  <button
                    onClick={() => handleDemande(prestataire)}
                    className="flex-1 bg-gray-900 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Devis
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
              onClick={() => setIsPrestatairesModalOpen(true)}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              Ajouter prestataire
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
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
                    <StarRating rating={selectedPrestataire.note} />
                    <span className="text-gray-400">({selectedPrestataire.nbAvis} avis)</span>
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
              </div>

              {/* Services */}
              <div className="space-y-6">
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

                {/* Specialties */}
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

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleContact(selectedPrestataire)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Contacter
                  </button>
                  <button
                    onClick={() => handleDemande(selectedPrestataire)}
                    className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Demander devis
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="px-8 pb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Projets récents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPrestataire.projetsRecents.map((projet, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{projet}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prestataire;