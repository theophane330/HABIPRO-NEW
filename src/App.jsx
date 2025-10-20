import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

// Importez vos pages propriétaire et locataire
import proprietaire from '/proprietaire';
import LocataireDashboard from './locataire/locataire';

function App() {
  // Vérifier si l'utilisateur est déjà connecté au chargement
  const isAuthenticated = () => {
    return localStorage.getItem('token') && localStorage.getItem('currentUser');
  };

  const getUserRole = () => {
    return localStorage.getItem('role');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Route de connexion/inscription */}
        <Route 
          path="/login" 
          element={
            isAuthenticated() ? (
              <Navigate to={getUserRole() === 'proprietaire' ? '/proprietaire' : '/locataire'} replace />
            ) : (
              <AuthPage />
            )
          } 
        />

        {/* Routes protégées pour les propriétaires */}
        <Route
          path="/proprietaire/*"
          element={
            <ProtectedRoute allowedRole="proprietaire">
              <proprietaire />
            </ProtectedRoute>
          }
        />

        {/* Routes protégées pour les locataires */}
        <Route
          path="/locataire/*"
          element={
            <ProtectedRoute allowedRole="locataire">
              <LocataireDashboard />
            </ProtectedRoute>
          }
        />

        {/* Route par défaut - redirige vers login ou dashboard selon l'auth */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate 
                to={getUserRole() === 'proprietaire' ? '/proprietaire' : '/locataire'} 
                replace 
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Route 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                <a
                  href="/"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retour à l'accueil
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;