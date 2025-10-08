import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import proprieteService from '../services/proprieteService';

export default function ModalPropriete({ 
  isOpen, 
  onClose, 
  proprieteAModifier = null,
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    type: 'Appartement',
    status: 'disponible',
    tenant: '',
    bedrooms: 1,
    bathrooms: 1,
    size: '',
    description: '',
    icon: '🏠'
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const imagesDisponibles = ['🏠', '🏢', '🏘️', '🏛️', '🏡', '🏰', '🏗️', '🏬'];
  
  const typesDisponibles = [
    'Villa', 
    'Studio', 
    'Appartement', 
    'Duplex', 
    'Maison', 
    'Bureau', 
    'Commerce'
  ];
  
  const statutsDisponibles = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'loue', label: 'Loué' },
    { value: 'en_vente', label: 'En vente' }
  ];

  useEffect(() => {
    if (proprieteAModifier) {
      setFormData({
        title: proprieteAModifier.title || '',
        address: proprieteAModifier.address || '',
        price: proprieteAModifier.price || '',
        type: proprieteAModifier.type || 'Appartement',
        status: proprieteAModifier.status || 'disponible',
        tenant: proprieteAModifier.tenant || '',
        bedrooms: proprieteAModifier.bedrooms || 1,
        bathrooms: proprieteAModifier.bathrooms || 1,
        size: proprieteAModifier.size || '',
        description: proprieteAModifier.description || '',
        icon: proprieteAModifier.icon || '🏠'
      });
      
      // Charger les aperçus des médias existants
      if (proprieteAModifier.image_url) {
        setImagePreview(proprieteAModifier.image_url);
      }
      if (proprieteAModifier.video_url) {
        setVideoPreview(proprieteAModifier.video_url);
      }
    } else {
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        address: '',
        price: '',
        type: 'Appartement',
        status: 'disponible',
        tenant: '',
        bedrooms: 1,
        bathrooms: 1,
        size: '',
        description: '',
        icon: '🏠'
      });
      setImageFile(null);
      setVideoFile(null);
      setImagePreview(null);
      setVideoPreview(null);
    }
    setError(null);
  }, [proprieteAModifier, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 10 MB');
        return;
      }
      
      // Vérifier le format
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validFormats.includes(file.type)) {
        setError('Format d\'image non supporté. Utilisez JPG, PNG, WEBP ou GIF');
        return;
      }
      
      setImageFile(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('La vidéo ne doit pas dépasser 100 MB');
        return;
      }
      
      // Vérifier le format
      const validFormats = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
      if (!validFormats.includes(file.type)) {
        setError('Format de vidéo non supporté. Utilisez MP4, AVI, MOV, WMV ou WEBM');
        return;
      }
      
      setVideoFile(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validation basique
      if (!formData.title || !formData.address || !formData.price || !formData.size) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Préparer les données
      const dataToSend = {
        title: formData.title.trim(),
        address: formData.address.trim(),
        price: parseFloat(formData.price),
        type: formData.type,
        status: formData.status,
        tenant: formData.tenant.trim() || null,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        size: formData.size.trim(),
        description: formData.description.trim() || '',
        icon: formData.icon
      };

      console.log('📤 Données à envoyer:', dataToSend);

      let result;
      if (proprieteAModifier) {
        // Modification
        result = await proprieteService.modifierPropriete(
          proprieteAModifier.id, 
          dataToSend,
          imageFile,
          videoFile
        );
        alert('Propriété modifiée avec succès');
      } else {
        // Création
        result = await proprieteService.creerPropriete(
          dataToSend,
          imageFile,
          videoFile
        );
        console.log('✅ Propriété créée:', result);
        alert('Propriété ajoutée avec succès');
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      const errorMessage = err.message || 'Une erreur est survenue';
      setError(errorMessage);
      console.error('❌ Erreur lors de la sauvegarde:', err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {proprieteAModifier ? 'Modifier la propriété' : 'Ajouter une propriété'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              <strong>Erreur:</strong> {error}
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Upload en cours... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre de la propriété <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Villa 5 pièces moderne"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Adresse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Ex: Cocody Angré, Zone 4"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type de propriété <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {typesDisponibles.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prix mensuel (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex: 500000"
                required
                min="0"
                step="1000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Superficie */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Superficie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="Ex: 250m²"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {statutsDisponibles.map(statut => (
                  <option key={statut.value} value={statut.value}>
                    {statut.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre de chambres */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de chambres
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                max="50"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Nombre de salles de bain */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de salles de bain
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                max="20"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Locataire */}
            {formData.status === 'loue' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du locataire <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleChange}
                  placeholder="Ex: Jean Kouassi"
                  required={formData.status === 'loue'}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Upload Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Image de la propriété
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-colors">
                  <ImageIcon size={48} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 mb-1">Cliquez pour uploader une image</span>
                  <span className="text-sm text-gray-400">JPG, PNG, WEBP ou GIF (max 10MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Upload Vidéo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vidéo de la propriété (optionnelle)
              </label>
              {videoPreview ? (
                <div className="relative">
                  <video 
                    src={videoPreview} 
                    controls
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-colors">
                  <VideoIcon size={48} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 mb-1">Cliquez pour uploader une vidéo</span>
                  <span className="text-sm text-gray-400">MP4, AVI, MOV, WMV ou WEBM (max 100MB)</span>
                  <input
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Icône */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Icône de la propriété
              </label>
              <div className="flex flex-wrap gap-3">
                {imagesDisponibles.map(img => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: img }))}
                    className={`text-4xl p-3 rounded-xl transition-all ${
                      formData.icon === img 
                        ? 'bg-red-100 ring-2 ring-red-500 scale-110' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {img}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (optionnelle)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre propriété..."
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:brightness-105 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  {proprieteAModifier ? 'Modifier' : 'Ajouter'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}