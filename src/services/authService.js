// authService.js - Service pour gérer l'authentification

const API_URL = 'http://localhost:8000/api';

/**
 * Service d'authentification
 */
const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone,
          password: userData.password,
          confirm_password: userData.confirmPassword,
          role: userData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sauvegarder les informations de session
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Erreur lors de l\'inscription' };
      }
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error: 'Erreur de connexion au serveur. Assurez-vous que le backend Django est lancé.' };
    }
  },

  /**
   * Connexion d'un utilisateur
   */
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sauvegarder les informations de session
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Email ou mot de passe incorrect' };
      }
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error: 'Erreur de connexion au serveur. Assurez-vous que le backend Django est lancé.' };
    }
  },

  /**
   * Déconnexion de l'utilisateur
   */
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch(`${API_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('role');
      
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
  },

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  /**
   * Obtenir le token actuel
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    return !!(token && user);
  },

  /**
   * Obtenir le rôle de l'utilisateur
   */
  getUserRole: () => {
    return localStorage.getItem('role');
  },

  /**
   * Mettre à jour le profil utilisateur
   */
  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour les informations locales
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Erreur lors de la mise à jour' };
      }
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  },

  /**
   * Changer le mot de passe
   */
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour le token
        localStorage.setItem('token', data.token);
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Erreur lors du changement de mot de passe' };
      }
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  },

  /**
   * Supprimer le compte
   */
  deleteAccount: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/delete-account/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        // Nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('role');
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.message || 'Erreur lors de la suppression' };
      }
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  },

  /**
   * Vérifier l'authentification auprès du serveur
   */
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { authenticated: false };
      }

      const response = await fetch(`${API_URL}/auth/check/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour les informations locales
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return { authenticated: true, user: data.user };
      } else {
        // Token invalide, nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('role');
        return { authenticated: false };
      }
    } catch (error) {
      console.error('Erreur:', error);
      return { authenticated: false };
    }
  },
};

export default authService;