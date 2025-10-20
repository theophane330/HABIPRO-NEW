import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

import TableauDeBord from './PageOngletSideBare/TableaudeBord';
import PaymentModal from './ActionsRapides/PaymentModal';
import MaintenanceModal from './ActionsRapides/MaintenanceModal';

// Import des pages (à créer)
import PaiementsLocataire from "./PageOngletSideBare/PaiementsLocataire";
import MaintenanceLocataire from "./PageOngletSideBare/MaintenanceLocataire";
import ContratDocumentsLocataire from "./PageOngletSideBare/ContratDocumentsLocataire";
// import MessagerieLocataire from "./PageOngletSideBare/MessagerieLocataire";
// import EvenementsLocataire from "./PageOngletSideBare/EvenementsLocataire";
// import InfosContratLocataire from "./PageOngletSideBare/InfosContratLocataire";
// import GuideLocataire from "./PageOngletSideBare/GuideLocataire";
// import SupportLocataire from "./PageOngletSideBare/SupportLocataire";
import ProfilLocataire from "./PageOngletSideBare/ProfilLocataire";
import Paramètres from "./PageOngletSideBare/Paramètres";
import CalendarApp from "./PageOngletSideBare/Calendrier";
import InfosContrat from "./PageOngletSideBare/Infos Contrat";

export default function LocataireDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // États pour l'utilisateur connecté et le menu
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // États pour les modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await authService.logout();
      // La redirection est gérée par authService.logout()
    }
  };

  // Obtenir les initiales de l'utilisateur
  const getInitials = () => {
    if (!currentUser) return 'KP';
    return `${currentUser.prenom?.[0] || ''}${currentUser.nom?.[0] || ''}`.toUpperCase();
  };

  // Obtenir le nom complet de l'utilisateur
  const getFullName = () => {
    if (!currentUser) return 'Konan Patrick';
    return `${currentUser.prenom} ${currentUser.nom}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Données du locataire pour le modal de paiement
  const tenantData = {
    property: 'Résidence Les Palmiers',
    address: 'Cocody - Abidjan',
    rentAmount: 350000
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <TableauDeBord 
          setIsPaymentModalOpen={setIsPaymentModalOpen}
          setIsMaintenanceModalOpen={setIsMaintenanceModalOpen}
          setIsMessageModalOpen={setIsMessageModalOpen}
          formatCurrency={formatCurrency}
          quickActions={quickActions}
        />;
      case 'payments':
        return <PaiementsLocataire formatCurrency={formatCurrency} />; 
      case 'maintenance':
        return <MaintenanceLocataire />;
      case 'documents':
        return <ContratDocumentsLocataire />; 
      case 'messages':
        return null; // <MessagerieLocataire setIsMessageModalOpen={setIsMessageModalOpen} />
      case 'events':
        return <CalendarApp />;
      case 'contract':
        return <InfosContrat />;
      case 'guide':
        return null; // <GuideLocataire />
      case 'support':
        return null; // <SupportLocataire />
      case 'profile':
        return <ProfilLocataire />;
      case 'settings':
        return <Paramètres />;
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Tableau de bord' },
    { id: 'payments', icon: '💰', label: 'Paiements' },
    { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
    { id: 'documents', icon: '📄', label: 'Contrat & Documents' }
  ];

  const serviceItems = [
    { id: 'events', icon: '📅', label: 'Événements' },
    { id: 'contract', icon: '⚖️', label: 'Infos Contrat' }
  ];

  const adminItems = [
    { id: 'settings', icon: '⚙️', label: 'Paramètres' }
  ];

  const quickActions = [
    {
      icon: '💳',
      label: 'Payer mon loyer',
      gradient: 'from-green-400 to-teal-400',
      onClick: () => setIsPaymentModalOpen(true)
    },
    {
      icon: '🔧',
      label: 'Signaler un problème',
      gradient: 'from-orange-400 to-red-400',
      onClick: () => setIsMaintenanceModalOpen(true)
    },
    {
      icon: '💬',
      label: 'Envoyer un message',
      gradient: 'from-blue-400 to-indigo-500',
      onClick: () => setIsMessageModalOpen(true)
    },
    {
      icon: '📄',
      label: 'Mes documents',
      gradient: 'from-purple-400 to-pink-400',
      onClick: () => setActiveNav('documents')
    },
    {
      icon: '📅',
      label: 'Calendrier',
      gradient: 'from-yellow-400 to-orange-400',
      onClick: () => handleNavClick('events')
    },
    {
      icon: '👤',
      label: 'Mon profil',
      gradient: 'from-cyan-400 to-blue-400',
      onClick: () => setActiveNav('profile')
    }
  ];

  const handleNavClick = (itemId) => {
    setActiveNav(itemId);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const closeMaintenanceModal = () => {
    setIsMaintenanceModalOpen(false);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-500">
      <div className="flex w-full h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-auto md:w-48 lg:w-52 xl:w-56'} bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col p-2 shadow-xl relative transition-all duration-300 ease-in-out`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500"></div>

          {/* Toggle Button */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/20 to-transparent animate-pulse"></div>
              <span className="relative z-10 text-xs">
                {isSidebarCollapsed ? '→' : '←'}
              </span>
            </button>

            {/* Logo Section */}
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/20 to-transparent animate-pulse"></div>
                  H
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    HABIPRO
                  </div>
                  <div className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
                    Locataire
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-y-auto scrollbar-hide flex-1">
            {/* Navigation */}
            <div className="flex-1">
              {!isSidebarCollapsed && (
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2 pl-2 relative">
                  <div className="absolute left-0 top-1/2 w-1.5 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                  Gestion Locative
                </div>
              )}

              {navItems.map((item) => (
                <a
                  key={item.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} p-2 rounded-lg mb-1 mr-1 transition-all duration-300 relative overflow-hidden group text-sm ${activeNav === item.id
                    ? 'text-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 font-semibold transform translate-x-1 shadow-md'
                    : 'text-gray-700 hover:text-blue-500 hover:transform hover:translate-x-1 hover:shadow-sm'
                    }`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="w-3 h-3 flex items-center justify-center text-sm relative z-10">
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="font-medium relative z-10 ml-1.5 text-sm">{item.label}</span>
                  )}
                </a>
              ))}

              {!isSidebarCollapsed && (
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 pl-3 mt-6 relative">
                  <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                  Services & Outils
                </div>
              )}

              {serviceItems.map((item) => (
                <a
                  key={item.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} text-sm p-2 rounded-lg mb-1 mr-2 transition-all duration-300 relative overflow-hidden group ${activeNav === item.id
                    ? 'text-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 font-semibold transform translate-x-1 shadow-md'
                    : 'text-gray-700 hover:text-blue-500 hover:transform hover:translate-x-2 hover:shadow-sm'
                    }`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="w-4 h-4 flex items-center justify-center text-sm relative z-10">
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="font-medium relative z-10 ml-2">{item.label}</span>
                  )}
                </a>
              ))}

              {!isSidebarCollapsed && (
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 pl-3 mt-6 relative">
                  <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                  Compte
                </div>
              )}

              {adminItems.map((item) => (
                <a
                  key={item.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} text-sm p-2 rounded-lg mb-1 mr-2 text-gray-700 hover:text-blue-500 hover:transform hover:translate-x-2 hover:shadow-sm transition-all duration-300 relative overflow-hidden group`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="w-4 h-4 flex items-center justify-center text-sm relative z-10">
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="font-medium relative z-10 ml-2">{item.label}</span>
                  )}
                </a>
              ))}
            </div>

            {/* Status Card */}
            {!isSidebarCollapsed && (
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg p-2.5 text-center text-white shadow-lg relative overflow-hidden mt-3">
                <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/15 to-transparent animate-pulse"></div>
                <div className="text-sm font-bold mb-1 relative z-10">Locataire</div>
                <div className="text-xs opacity-90 mb-2 relative z-10">En règle • Accès complet</div>
                <button
                  onClick={() => handleNavClick('profile')}
                  className="bg-white/25 backdrop-blur-sm border border-white/30 px-2 py-1 rounded-md text-white font-semibold text-sm transition-all duration-300 hover:bg-white/35 hover:-translate-y-1 hover:shadow-md relative z-10 w-full"
                >
                  Mon compte
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-3 shadow-sm relative">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-10"></div>
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1">
                <div className="text-sm font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {activeNav === 'dashboard' ? 'Mon Tableau de Bord' :
                    activeNav === 'payments' ? 'Paiements & Historique' :
                    activeNav === 'maintenance' ? 'Demandes de Maintenance' :
                    activeNav === 'documents' ? 'Contrat & Documents' :
                    activeNav === 'messages' ? 'Messagerie' :
                    activeNav === 'events' ? 'Calendrier des échéances' :
                    activeNav === 'contract' ? 'Informations du Contrat' :
                    activeNav === 'guide' ? 'Guide Locataire' :
                    activeNav === 'support' ? 'Support HABIPRO' :
                    activeNav === 'profile' ? 'Mon Profil' :
                    activeNav === 'settings' ? 'Paramètres du compte' :
                    'Tableau de Bord Locataire'}
                </div>
                <div className="text-blue-500 font-semibold flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <div>Bienvenue • {currentTime.toLocaleTimeString('fr-FR')}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Box */}
                <div className="relative w-50">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    🔍
                  </div>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={`w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none transition-all duration-300 font-medium ${isSearchFocused ? 'border-blue-400 shadow-lg bg-white transform scale-105' : 'bg-gray-50'
                      }`}
                    placeholder="Rechercher..."
                  />
                </div>

                {/* Quick Stats */}
                <div className="flex gap-1">
                  <div className="flex flex-col items-center p-1.5 bg-white rounded-lg border border-gray-200 min-w-[60px] hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-bold text-gray-900">350K</div>
                    <div className="text-[7px] text-gray-500 font-semibold uppercase tracking-wider">Loyer</div>
                  </div>
                  <div className="flex flex-col items-center p-1.5 bg-white rounded-lg border border-gray-200 min-w-[60px] hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-bold text-green-600">À jour</div>
                    <div className="text-[7px] text-gray-500 font-semibold uppercase tracking-wider">Paiement</div>
                  </div>
                  <div className="flex flex-col items-center p-1.5 bg-white rounded-lg border border-gray-200 min-w-[60px] hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-bold text-gray-900">6 mois</div>
                    <div className="text-[7px] text-gray-500 font-semibold uppercase tracking-wider">Contrat</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => handleNavClick('events')}
                    className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white hover:transform hover:-translate-y-1 hover:shadow-lg text-sm relative"
                  >
                    🔔
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                      {unreadNotifications}
                    </div>
                  </div>
                  <div
                    onClick={() => handleNavClick('settings')}
                    className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white hover:transform hover:-translate-y-1 hover:shadow-lg text-sm"
                  >
                    ⚙️
                  </div>
                </div>

                {/* Rent Info */}
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 px-2 py-1 rounded-lg text-white font-bold shadow-lg flex flex-col items-center gap-0.5">
                  <div className="text-[8px] opacity-80 uppercase tracking-wider">Loyer mensuel</div>
                  <div className="text-[10px]">350 000 XOF</div>
                </div>

                {/* User Info - Avec menu de déconnexion */}
                <div className="relative">
                  <div 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 pr-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {getInitials()}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold text-gray-900 text-xs">{getFullName()}</div>
                      <div className="text-blue-500 text-[9px] font-semibold capitalize">
                        {currentUser?.role || 'Locataire'}
                      </div>
                    </div>
                    <svg
                      className={`w-3 h-3 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Menu déroulant */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-20 border border-gray-200">
                        {/* Info utilisateur */}
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser?.prenom} {currentUser?.nom}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{currentUser?.email}</p>
                        </div>

                        {/* Téléphone */}
                        {currentUser?.telephone && (
                          <div className="px-4 py-2 text-sm text-gray-700">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {currentUser.telephone}
                            </div>
                          </div>
                        )}

                        <div className="border-t border-gray-200"></div>

                        {/* Options du menu */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleNavClick('profile');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Mon profil
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleNavClick('settings');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Paramètres
                        </button>

                        <div className="border-t border-gray-200"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Se déconnecter
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto flex-1">
            <div className="h-[calc(100vh-4rem)]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        tenantData={tenantData}
        formatCurrency={formatCurrency}
      />
      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={closeMaintenanceModal}
      />
      {/* <MessageFormModal isOpen={isMessageModalOpen} onClose={closeMessageModal} /> */}
    </div>
  );
}