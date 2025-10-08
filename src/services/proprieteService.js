//proprieteService.js
// Configuration de l'API
const API_BASE_URL = 'http://localhost:8000/api';
const API_URL = `${API_BASE_URL}/proprietes/`;

/**
 * Service pour gérer les propriétés immobilières
 */
const proprieteService = {
  /**
   * Récupérer toutes les propriétés
   */
  async obtenirToutesProprietes() {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Propriétés récupérées:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des propriétés:', error);
      throw error;
    }
  },

  /**
   * Rechercher des propriétés avec filtres
   * @param {string} searchTerm - Terme de recherche
   * @param {string} statusFilter - Filtre par statut
   */
  async rechercherProprietes(searchTerm = '', statusFilter = 'all') {
    try {
      let url = API_URL;
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter && statusFilter !== 'all') {
        params.append('statut', statusFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('🔍 Recherche avec URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Résultats de recherche:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error;
    }
  },

  /**
   * Obtenir une propriété par son ID
   * @param {number} id - ID de la propriété
   */
  async obtenirPropriete(id) {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Propriété récupérée:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la propriété:', error);
      throw error;
    }
  },

  /**
   * Créer une nouvelle propriété
   * @param {Object} proprieteData - Données de la propriété
   */
  async creerPropriete(proprieteData) {
    try {
      console.log('📤 Envoi des données:', proprieteData);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proprieteData)
      });

      // Lire la réponse
      const responseData = await response.json();
      console.log('📥 Réponse reçue:', responseData);

      if (!response.ok) {
        console.error('❌ Erreur serveur:', responseData);
        throw new Error(
          responseData.error || 
          responseData.message || 
          JSON.stringify(responseData.validation_errors) ||
          'Erreur lors de la création de la propriété'
        );
      }

      console.log('✅ Propriété créée avec succès:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      throw error;
    }
  },

  /**
   * Modifier une propriété existante
   * @param {number} id - ID de la propriété
   * @param {Object} proprieteData - Nouvelles données
   */
  async modifierPropriete(id, proprieteData) {
    try {
      console.log('📝 Modification de la propriété', id, ':', proprieteData);

      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proprieteData)
      });

      const responseData = await response.json();
      console.log('📥 Réponse modification:', responseData);

      if (!response.ok) {
        console.error('❌ Erreur modification:', responseData);
        throw new Error(
          responseData.error || 
          'Erreur lors de la modification de la propriété'
        );
      }

      console.log('✅ Propriété modifiée avec succès');
      return responseData;
    } catch (error) {
      console.error('❌ Erreur lors de la modification:', error);
      throw error;
    }
  },

  /**
   * Modifier partiellement une propriété
   * @param {number} id - ID de la propriété
   * @param {Object} proprieteData - Données à modifier
   */
  async modifierPartiellement(id, proprieteData) {
    try {
      console.log('📝 Modification partielle de la propriété', id);

      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proprieteData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || 
          'Erreur lors de la modification partielle'
        );
      }

      console.log('✅ Modification partielle réussie');
      return responseData;
    } catch (error) {
      console.error('❌ Erreur modification partielle:', error);
      throw error;
    }
  },

  /**
   * Supprimer une propriété
   * @param {number} id - ID de la propriété
   */
  async supprimerPropriete(id) {
    try {
      console.log('🗑️ Suppression de la propriété', id);

      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          'Erreur lors de la suppression de la propriété'
        );
      }

      console.log('✅ Propriété supprimée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      throw error;
    }
  },

  /**
   * Obtenir les statistiques des propriétés
   */
  async obtenirStatistiques() {
    try {
      const response = await fetch(`${API_URL}statistiques/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Statistiques récupérées:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      // Retourner des statistiques par défaut en cas d'erreur
      return {
        total_proprietes: 0,
        proprietes_louees: 0,
        proprietes_disponibles: 0,
        proprietes_en_vente: 0,
        revenus_mensuels: 0
      };
    }
  },

  /**
   * Exporter les données des propriétés
   */
  async exporterDonnees() {
    try {
      console.log('📊 Export des données...');

      const response = await fetch(`${API_URL}export/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Données exportées:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error);
      throw error;
    }
  },

  /**
   * Changer le statut d'une propriété
   * @param {number} id - ID de la propriété
   * @param {string} nouveauStatut - Nouveau statut (disponible, loué, en_vente)
   */
  async changerStatut(id, nouveauStatut) {
    try {
      console.log(`🔄 Changement de statut de la propriété ${id} vers ${nouveauStatut}`);

      const response = await fetch(`${API_URL}${id}/changer_statut/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: nouveauStatut })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.erreur || 
          'Erreur lors du changement de statut'
        );
      }

      console.log('✅ Statut changé avec succès');
      return responseData;
    } catch (error) {
      console.error('❌ Erreur changement de statut:', error);
      throw error;
    }
  },

  /**
   * Filtrer les propriétés par statut
   * @param {string} statut - Statut à filtrer (disponible, loué, en_vente, all)
   */
  async filtrerParStatut(statut) {
    try {
      const url = statut === 'all' 
        ? API_URL 
        : `${API_URL}?statut=${statut}`;

      console.log('🔍 Filtrage par statut:', statut);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Propriétés filtrées:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors du filtrage:', error);
      throw error;
    }
  }
};

export default proprieteService;