import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Download, Plus, Edit, Trash2, Eye, MapPin, Home, Building, Loader, X, Upload, ChevronRight, ChevronLeft, Video, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

// Panneau latéral pour ajout/modification
function PropertySidePanel({ isOpen, onClose, onSuccess, propertyToEdit = null }) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    adresse: '',
    prix: '',
    type: 'Villa',
    statut: 'disponible',
    locataire: '',
    chambres: '',
    salles_de_bain: '',
    superficie: '',
    image: null,
    video: null
  });

  useEffect(() => {
    if (propertyToEdit) {
      setFormData({
        titre: propertyToEdit.titre || '',
        adresse: propertyToEdit.adresse || '',
        prix: propertyToEdit.prix || '',
        type: propertyToEdit.type || 'Villa',
        statut: propertyToEdit.statut || 'disponible',
        locataire: propertyToEdit.locataire || '',
        chambres: propertyToEdit.chambres || '',
        salles_de_bain: propertyToEdit.salles_de_bain || '',
        superficie: propertyToEdit.superficie || '',
        image: null,
        video: null
      });
      if (propertyToEdit.image) {
        const fullUrl = propertyToEdit.image.startsWith('http') 
          ? propertyToEdit.image 
          : `${API_BASE_URL.replace('/api', '')}${propertyToEdit.image}`;
        
        if (propertyToEdit.image.includes('.mp4') || propertyToEdit.image.includes('.webm')) {
          setVideoPreview(fullUrl);
        } else {
          setImagePreview(fullUrl);
        }
      }
    }
  }, [propertyToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, video: file }));
      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('titre', formData.titre);
      data.append('adresse', formData.adresse);
      data.append('prix', formData.prix);
      data.append('type', formData.type);
      data.append('statut', formData.statut);
      if (formData.locataire) data.append('locataire', formData.locataire);
      data.append('chambres', formData.chambres);
      data.append('salles_de_bain', formData.salles_de_bain);
      data.append('superficie', formData.superficie);
      
      if (formData.video && typeof formData.video !== 'string') {
        data.append('image', formData.video);
      } else if (formData.image && typeof formData.image !== 'string') {
        data.append('image', formData.image);
      }

      const url = propertyToEdit 
        ? `${API_BASE_URL}/properties/${propertyToEdit.id}/`
        : `${API_BASE_URL}/properties/`;
      
      const method = propertyToEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, { method, body: data });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      alert(propertyToEdit ? 'Propriété modifiée avec succès !' : 'Propriété ajoutée avec succès !');
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'enregistrement: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titre: '', adresse: '', prix: '', type: 'Villa', statut: 'disponible',
      locataire: '', chambres: '', salles_de_bain: '', superficie: '', image: null, video: null
    });
    setImagePreview(null);
    setVideoPreview(null);
    setCurrentStep(1);
    onClose();
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  const canProceed = () => {
    switch(currentStep) {
      case 1: return formData.titre && formData.adresse;
      case 2: return formData.prix && formData.superficie && formData.type;
      case 3: return formData.chambres && formData.salles_de_bain;
      default: return true;
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black transition-opacity duration-500 z-40 ${isOpen ? 'opacity-30' : 'opacity-0 pointer-events-none'}`} onClick={handleClose} />
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-4xl bg-white shadow-2xl transform transition-transform duration-500 ease-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="relative bg-white border-b border-gray-200 p-8">
            <button onClick={handleClose} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-light text-gray-900 mb-1">{propertyToEdit ? 'Modifier la propriété' : 'Nouvelle propriété'}</h2>
            <p className="text-sm text-gray-500">Étape {currentStep} sur 4</p>
            <div className="flex gap-2 mt-6">
              {[1,2,3,4].map(step => (
                <div key={step} className={`h-0.5 flex-1 transition-all ${step <= currentStep ? 'bg-gray-900' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn max-w-2xl">
                <div>
                  <h3 className="text-lg font-light text-gray-900 mb-6">Informations générales</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Titre de la propriété</label>
                      <input type="text" name="titre" value={formData.titre} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        placeholder="Ex: Villa moderne 5 pièces" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Adresse complète</label>
                      <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        placeholder="Ex: Cocody Angré, Zone 4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn max-w-2xl">
                <div>
                  <h3 className="text-lg font-light text-gray-900 mb-6">Détails financiers et type</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Prix mensuel (FCFA)</label>
                        <input type="number" name="prix" value={formData.prix} onChange={handleChange} required min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                          placeholder="500000" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Superficie</label>
                        <input type="text" name="superficie" value={formData.superficie} onChange={handleChange} required
                          className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                          placeholder="250m²" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Type de bien</label>
                        <select name="type" value={formData.type} onChange={handleChange} required
                          className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white transition-all">
                          <option value="Villa">Villa</option>
                          <option value="Studio">Studio</option>
                          <option value="Appartement">Appartement</option>
                          <option value="Duplex">Duplex</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Statut</label>
                        <select name="statut" value={formData.statut} onChange={handleChange} required
                          className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white transition-all">
                          <option value="disponible">Disponible</option>
                          <option value="loué">Loué</option>
                          <option value="en_vente">En vente</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn max-w-2xl">
                <div>
                  <h3 className="text-lg font-light text-gray-900 mb-6">Caractéristiques</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Nombre de chambres</label>
                        <input type="number" name="chambres" value={formData.chambres} onChange={handleChange} required min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                          placeholder="5" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Salles de bain</label>
                        <input type="number" name="salles_de_bain" value={formData.salles_de_bain} onChange={handleChange} required min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                          placeholder="3" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Nom du locataire (optionnel)</label>
                      <input type="text" name="locataire" value={formData.locataire} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        placeholder="Jean Kouassi" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn max-w-2xl">
                <div>
                  <h3 className="text-lg font-light text-gray-900 mb-6">Médias</h3>
                  
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">Photo principale</label>
                    <div className="border border-gray-300 rounded p-8 hover:border-gray-400 transition-all bg-gray-50">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Aperçu" className="w-full h-64 object-cover rounded" />
                          <button type="button" onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image: null })); }}
                            className="absolute top-2 right-2 bg-white text-gray-700 p-2 rounded hover:bg-gray-100 shadow">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block text-center">
                          <ImageIcon className="mx-auto mb-3 text-gray-400" size={40} />
                          <span className="text-gray-600 text-sm">Cliquez pour ajouter une photo</span>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 10MB</p>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">Vidéo de présentation (optionnel)</label>
                    <div className="border border-gray-300 rounded p-8 hover:border-gray-400 transition-all bg-gray-50">
                      {videoPreview ? (
                        <div className="relative">
                          <video src={videoPreview} className="w-full h-64 object-cover rounded" controls />
                          <button type="button" onClick={() => { setVideoPreview(null); setFormData(prev => ({ ...prev, video: null })); }}
                            className="absolute top-2 right-2 bg-white text-gray-700 p-2 rounded hover:bg-gray-100 shadow">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block text-center">
                          <Video className="mx-auto mb-3 text-gray-400" size={40} />
                          <span className="text-gray-600 text-sm">Cliquez pour ajouter une vidéo</span>
                          <p className="text-xs text-gray-400 mt-1">MP4, WEBM jusqu'à 50MB</p>
                          <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-8 bg-white">
            <div className="flex gap-3 max-w-2xl">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-all">
                  <ChevronLeft size={18} />
                  Précédent
                </button>
              )}
              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} disabled={!canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Suivant
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-all disabled:opacity-50">
                  {loading ? <><Loader className="animate-spin" size={18} />Enregistrement...</> : 'Enregistrer'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Modal Détails
function PropertyDetailsModal({ property, isOpen, onClose, formatCurrency }) {
  if (!isOpen || !property) return null;

  const imageUrl = property.image ? 
    (property.image.startsWith('http') ? property.image : `${API_BASE_URL.replace('/api', '')}${property.image}`) 
    : null;

  const isVideo = imageUrl && (imageUrl.includes('.mp4') || imageUrl.includes('.webm'));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {imageUrl ? (
            isVideo ? (
              <video src={imageUrl} className="w-full h-96 object-cover" controls />
            ) : (
              <img src={imageUrl} alt={property.titre} className="w-full h-96 object-cover" />
            )
          ) : (
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-300 text-8xl">
              🏠
            </div>
          )}
          <button onClick={onClose} className="absolute top-4 right-4 bg-white p-2.5 rounded shadow hover:bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-3xl font-light text-gray-900 mb-1">{property.titre}</h2>
          <div className="flex items-center text-gray-500 mb-8">
            <MapPin size={18} className="mr-2" />
            <span>{property.adresse}</span>
          </div>

          <div className="bg-gray-50 p-6 rounded mb-8">
            <div className="text-3xl font-light text-gray-900">{formatCurrency(property.prix)}</div>
            <div className="text-sm text-gray-500 mt-1">par mois</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className="text-2xl font-light text-gray-900">{property.chambres}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Chambres</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className="text-2xl font-light text-gray-900">{property.salles_de_bain}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Salles de bain</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className="text-2xl font-light text-gray-900">{property.superficie}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Superficie</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className="text-lg font-light text-gray-900">{property.type}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Type</div>
            </div>
          </div>

          {property.locataire && (
            <div className="bg-gray-50 p-6 rounded">
              <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Locataire actuel</h3>
              <p className="text-gray-900">{property.locataire}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant Principal
export default function Properties({ formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA' }) {    
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [statistics, setStatistics] = useState({ total: 0, louees: 0, revenus_mensuels: 0 });

  useEffect(() => {
    fetchProperties();
    fetchStatistics();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/properties/`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setProperties(Array.isArray(data) ? data : (data.results || []));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/statistiques/`);
      if (response.ok) setStatistics(await response.json());
    } catch (err) {
      console.error('Erreur statistiques:', err);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.adresse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'disponible': return { label: 'Disponible', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' };
      case 'loué': return { label: 'Loué', bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
      case 'en_vente': return { label: 'En vente', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
      default: return { label: 'Inconnu', bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
    }
  };

  const handlePropertyAction = async (action, property) => {
    switch (action) {
      case 'edit':
        setPropertyToEdit(property);
        setIsPanelOpen(true);
        break;
      case 'delete':
        if (window.confirm(`Supprimer "${property.titre}" ?`)) {
          try {
            const response = await fetch(`${API_BASE_URL}/properties/${property.id}/`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erreur suppression');
            await fetchProperties();
            await fetchStatistics();
            alert('Propriété supprimée');
          } catch (err) {
            alert('Erreur: ' + err.message);
          }
        }
        break;
      case 'view':
        setSelectedProperty(property);
        break;
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/export/`);
      if (!response.ok) throw new Error('Erreur exportation');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `properties_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-10 w-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 text-gray-300">⚠️</div>
          <h3 className="text-lg font-light text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button onClick={fetchProperties}
            className="bg-gray-900 text-white px-5 py-2.5 rounded hover:bg-gray-800 transition-all">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Propriétés</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez votre portefeuille immobilier</p>
        </div>
        <button onClick={() => { setPropertyToEdit(null); setIsPanelOpen(true); }}
          className="bg-gray-900 text-white px-5 py-2.5 rounded hover:bg-gray-800 transition-all flex items-center gap-2">
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      <div className="bg-gray-50 rounded p-4 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all bg-white" />
          </div>
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 bg-white transition-all text-sm">
              <option value="all">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="loué">Loué</option>
              <option value="en_vente">En vente</option>
            </select>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Grid size={18} />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <List size={18} />
              </button>
            </div>
            <button onClick={exportData}
              className="px-4 py-2.5 border border-gray-300 rounded hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-700 text-sm">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded flex items-center justify-center text-white">
              <Home size={24} />
            </div>
            <div>
              <div className="text-2xl font-light text-gray-900">{statistics.total}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total propriétés</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded flex items-center justify-center text-white">
              <Building size={24} />
            </div>
            <div>
              <div className="text-2xl font-light text-gray-900">{statistics.louees}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Propriétés louées</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded flex items-center justify-center text-white text-xl">
              💰
            </div>
            <div>
              <div className="text-xl font-light text-gray-900">{formatCurrency(statistics.revenus_mensuels)}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Revenus mensuels</div>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProperties.map(property => <PropertyCard key={property.id} property={property} formatCurrency={formatCurrency} getStatusConfig={getStatusConfig} handlePropertyAction={handlePropertyAction} />)}
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Propriété</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Locataire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(property => <PropertyRow key={property.id} property={property} formatCurrency={formatCurrency} getStatusConfig={getStatusConfig} handlePropertyAction={handlePropertyAction} />)}
            </tbody>
          </table>
        </div>
      )}

      {filteredProperties.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded border border-gray-200">
          <div className="text-6xl mb-6 text-gray-300">🏠</div>
          <h3 className="text-xl font-light text-gray-900 mb-2">Aucune propriété trouvée</h3>
          <p className="text-gray-500 mb-6 text-sm">
            {searchTerm || statusFilter !== 'all' ? 'Ajustez vos critères de recherche' : 'Commencez par ajouter une propriété'}
          </p>
          <button onClick={() => { setPropertyToEdit(null); setIsPanelOpen(true); }}
            className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-all">
            Ajouter une propriété
          </button>
        </div>
      )}

      <PropertySidePanel isOpen={isPanelOpen} onClose={() => { setIsPanelOpen(false); setPropertyToEdit(null); }} 
        onSuccess={() => { fetchProperties(); fetchStatistics(); }} propertyToEdit={propertyToEdit} />
      
      <PropertyDetailsModal property={selectedProperty} isOpen={!!selectedProperty} 
        onClose={() => setSelectedProperty(null)} formatCurrency={formatCurrency} />
    </div>
  );
}

function PropertyCard({ property, formatCurrency, getStatusConfig, handlePropertyAction }) {
  const statusConfig = getStatusConfig(property.statut);
  const imageUrl = property.image ? 
    (property.image.startsWith('http') ? property.image : `${API_BASE_URL.replace('/api', '')}${property.image}`) 
    : null;
  const isVideo = imageUrl && (imageUrl.includes('.mp4') || imageUrl.includes('.webm'));

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden hover:border-gray-400 transition-all group">
      <div className="relative overflow-hidden">
        {imageUrl ? (
          <div className="w-full h-48 bg-gray-100">
            {isVideo ? (
              <video src={imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted loop
                onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => e.target.pause()} />
            ) : (
              <img src={imageUrl} alt={property.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-300 text-5xl group-hover:scale-105 transition-transform duration-500">
            🏠
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text} backdrop-blur-sm`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dot}`}></div>
            {statusConfig.label}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-light text-gray-900 mb-1 line-clamp-1">{property.titre}</h3>
        <div className="flex items-center text-gray-500 text-xs mb-4">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{property.adresse}</span>
        </div>
        
        <div className="bg-gray-50 p-3 rounded mb-4">
          <div className="text-xl font-light text-gray-900">{formatCurrency(property.prix)}</div>
          <div className="text-xs text-gray-500">par mois</div>
        </div>
        
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

        {property.locataire && (
          <div className="bg-gray-50 px-3 py-2 rounded mb-4">
            <span className="text-xs text-gray-600">{property.locataire}</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <button onClick={() => handlePropertyAction('view', property)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 transition-all">
            <Eye size={14} />
            Voir
          </button>
          <button onClick={() => handlePropertyAction('edit', property)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-all border border-gray-300">
            <Edit size={14} />
          </button>
          <button onClick={() => handlePropertyAction('delete', property)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-all border border-gray-300">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ property, formatCurrency, getStatusConfig, handlePropertyAction }) {
  const statusConfig = getStatusConfig(property.statut);
  const imageUrl = property.image ? 
    (property.image.startsWith('http') ? property.image : `${API_BASE_URL.replace('/api', '')}${property.image}`) 
    : null;
  const isVideo = imageUrl && (imageUrl.includes('.mp4') || imageUrl.includes('.webm'));

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
              {isVideo ? (
                <video src={imageUrl} className="w-full h-full object-cover" muted />
              ) : (
                <img src={imageUrl} alt={property.titre} className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xl flex-shrink-0">
              🏠
            </div>
          )}
          <div>
            <div className="font-light text-gray-900">{property.titre}</div>
            <div className="text-xs text-gray-500">{property.type} • {property.superficie}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">{property.adresse}</td>
      <td className="px-6 py-4 font-light text-gray-900">{formatCurrency(property.prix)}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dot}`}></div>
          {statusConfig.label}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">{property.locataire || '-'}</td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button onClick={() => handlePropertyAction('view', property)}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-all">
            <Eye size={16} />
          </button>
          <button onClick={() => handlePropertyAction('edit', property)}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-all">
            <Edit size={16} />
          </button>
          <button onClick={() => handlePropertyAction('delete', property)}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}