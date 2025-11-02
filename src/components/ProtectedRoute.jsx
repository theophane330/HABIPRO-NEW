import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Composant pour protéger les routes selon l'authentification et le rôle
 * ✅ AVEC SUPPORT ADMIN
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    const role = localStorage.getItem('role');

    if (token && user && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }

    setIsChecking(false);
  };

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ NOUVELLE LOGIQUE: Gestion du rôle avec support admin
  if (allowedRole && userRole !== allowedRole) {
    // Rediriger vers l'interface appropriée selon le rôle de l'utilisateur
    switch(userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'proprietaire':
        return <Navigate to="/proprietaire" replace />;
      case 'locataire':
        return <Navigate to="/locataire" replace />;
      default:
        // Si rôle inconnu, déconnecter et rediriger vers login
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }
  }

  // Tout est bon, afficher le composant enfant
  return children;
};

export default ProtectedRoute;