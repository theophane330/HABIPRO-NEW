const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Fonction utilitaire pour les requêtes
const fetchAPI = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Accept': 'application/json',
  };

  // N'ajouter Content-Type que si ce n'est pas un FormData
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log('🔍 Fetching:', `${API_URL}${url}`);
    const response = await fetch(`${API_URL}${url}`, config);

    // Gérer l'expiration du token
    if (response.status === 401) {
      localStorage.removeItem('token');
      // Ne pas rediriger automatiquement, juste logger
      console.warn('⚠️ Token expiré ou manquant');
    }

    // Gérer les erreurs HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    // Pour les DELETE, pas de contenu à retourner
    if (response.status === 204 || options.method === 'DELETE') {
      return { success: true };
    }

    // Retourner les données JSON
    return await response.json();
  } catch (error) {
    console.error('❌ Erreur API:', error);
    throw error;
  }
};

const documentService = {
  // Récupérer tous les documents
  obtenirTousDocuments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/documents/${queryString ? `?${queryString}` : ''}`;
      const data = await fetchAPI(url);
      
      // Gérer différents formats de réponse
      if (Array.isArray(data)) {
        return data;
      } else if (data.results) {
        return data.results;
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      throw error;
    }
  },

  // Récupérer un document par ID
  obtenirDocument: async (id) => {
    try {
      return await fetchAPI(`/documents/${id}/`);
    } catch (error) {
      console.error('Erreur lors de la récupération du document:', error);
      throw error;
    }
  },

  // Créer un nouveau document
  creerDocument: async (documentData) => {
    try {
      const formData = new FormData();
      
      // Ajouter tous les champs
      Object.keys(documentData).forEach(key => {
        if (documentData[key] !== null && documentData[key] !== undefined) {
          formData.append(key, documentData[key]);
        }
      });

      return await fetchAPI('/documents/', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Erreur lors de la création du document:', error);
      throw error;
    }
  },

  // Upload multiple de documents
  uploadMultiple: async (files, metadata = {}) => {
    try {
      const formData = new FormData();
      
      // Ajouter tous les fichiers
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Ajouter les métadonnées
      if (metadata.category) formData.append('category', metadata.category);
      if (metadata.tenant) formData.append('tenant', metadata.tenant);
      if (metadata.property) formData.append('property', metadata.property);
      if (metadata.status) formData.append('status', metadata.status);

      return await fetchAPI('/documents/upload-multiple/', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload multiple:', error);
      throw error;
    }
  },

  // Modifier un document
  modifierDocument: async (id, documentData) => {
    try {
      return await fetchAPI(`/documents/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(documentData),
      });
    } catch (error) {
      console.error('Erreur lors de la modification du document:', error);
      throw error;
    }
  },

  // Supprimer un document
  supprimerDocument: async (id) => {
    try {
      return await fetchAPI(`/documents/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  },

  // Télécharger un document
  telechargerDocument: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/documents/${id}/download/`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      return await response.blob();
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      throw error;
    }
  },

  // Prévisualiser un document
  previsualiserDocument: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/documents/${id}/preview/`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la prévisualisation');
      }

      return await response.blob();
    } catch (error) {
      console.error('Erreur lors de la prévisualisation du document:', error);
      throw error;
    }
  },

  // Obtenir les statistiques
  obtenirStatistiques: async () => {
    try {
      return await fetchAPI('/documents/statistics/');
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Retourner des statistiques vides en cas d'erreur
      return {
        total: 0,
        by_category: {},
        by_status: {},
        recent: []
      };
    }
  },
};

export default documentService;