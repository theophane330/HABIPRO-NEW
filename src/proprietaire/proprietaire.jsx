// "use client";
import React, { useState, useEffect } from 'react';
import PropertyFormModal from "./ActionsRapides/AjouterProriete";
import TenantFormModal from "./ActionsRapides/AjouterLocatire";
import ContractFormModal from "./ActionsRapides/CréerContrat";
import NouvelleAnnonceModal from "./ActionsRapides/PublierAnnonce";
import EvaluationIAModal from "./ActionsRapides/ÉvaluationIA";
import NouveauPrestataireModal from "./ActionsRapides/Prestataires";

import TableaudeBord from "./PageOngletSideBare/TableaudeBord";
import Properties from "./PageOngletSideBare/MesProprietes";
import Tenants from "./PageOngletSideBare/GestionLocataires";
import EvaluationIA from "./PageOngletSideBare/EvaluationIA";


export default function ProprietaireDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [revenueValue, setRevenueValue] = useState(2450000);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Pour le contenu de la page 
  const renderContent = () => {
    switch (activeNav) {
      // case 'dashboard': return <TableaudeBord />;
      case 'dashboard':
        return <TableaudeBord
          setIsModalOpen={setIsModalOpen}
          setIsTenantModalOpen={setIsTenantModalOpen}
          setIsContractModalOpen={setIsContractModalOpen}
          setIsAnnonceModalOpen={setIsAnnonceModalOpen}
          setIsÉvaluationIAModalOpen={setIsÉvaluationIAModalOpen}
          setIsPrestatairesModalOpen={setIsPrestatairesModalOpen}
          formatCurrency={formatCurrency}
          // Passer aussi les données si nécessaire
          properties={properties}
          tenants={tenants}
          notifications={notifications}
          quickActions={quickActions}
          handlePropertyClick={handlePropertyClick}
          handleTenantClick={handleTenantClick}
          handleNotificationClick={handleNotificationClick}
        />;
      case 'properties': return <Properties setIsModalOpen={setIsModalOpen} />;
      case 'tenants': return <Tenants setIsTenantModalOpen={setIsTenantModalOpen} />;
      case 'evaluation': return <EvaluationIA />;
      // case 'revenue': return <Revenue />;
      // case 'contracts': return <Contracts />;
      default: return <TableaudeBord />;
    }
  };

  // Pour les modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isAnnonceModalOpen, setIsAnnonceModalOpen] = useState(false);
  const [isÉvaluationIAModalOpen, setIsÉvaluationIAModalOpen] = useState(false);
  const [isPrestatairesModalOpen, setIsPrestatairesModalOpen] = useState(false);



  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeTenantModal = () => {
    setIsTenantModalOpen(false);
  };

  const closeContractModal = () => {
    setIsContractModalOpen(false);
  };

  const closeAnnonceModal = () => {
    setIsAnnonceModalOpen(false);
  };

  const closeÉvaluationIAModal = () => {
    setIsÉvaluationIAModalOpen(false);
  };

  const closePrestatairesModal = () => {
    setIsPrestatairesModalOpen(false);
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate revenue updates
  useEffect(() => {
    const revenueTimer = setInterval(() => {
      setRevenueValue(prev => prev + Math.floor(Math.random() * 1000));
    }, 30000);
    return () => clearInterval(revenueTimer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Tableau de bord', active: true },
    { id: 'properties', icon: '🏢', label: 'Mes Propriétés'},
    { id: 'tenants', icon: '👥', label: 'Gestion Locataires'},
    { id: 'revenue', icon: '💰', label: 'Revenus & Paiements' },
    { id: 'contracts', icon: '📄', label: 'Contrats & Documents' },
  ];

  const serviceItems = [
    { id: 'evaluation', icon: '📈', label: 'Évaluation IA', premium: true },
    { id: 'providers', icon: '🛠️', label: 'Prestataires' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'advertising', icon: '📢', label: 'Publier Annonce' },
    { id: 'marketing', icon: '🎯', label: 'Marketing IA', premium: true },
  ];

  const adminItems = [
    { id: 'legal', icon: '⚖️', label: 'Base Réglementaire' },
    { id: 'public', icon: '🏛️', label: 'Services Publics' },
    { id: 'settings', icon: '⚙️', label: 'Paramètres' },
    { id: 'support', icon: '❓', label: 'Support Expert' },
  ];

  const quickActions = [
    // { icon: '🏢', label: 'Ajouter Propriété', gradient: 'from-red-400 to-orange-400',onClick: () => setIsModalOpen(true) },
    {
      icon: '🏢',
      label: 'Ajouter Propriété',
      gradient: 'from-red-400 to-orange-400',
      onClick: () => setIsModalOpen(true)
    },
    // { icon: '👥', label: 'Nouveau Locataire', gradient: 'from-blue-400 to-blue-600' },
    {
      icon: '👥',
      label: 'Nouveau Locataire',
      gradient: 'from-blue-400 to-blue-600',
      onClick: () => setIsTenantModalOpen(true)
    },

    {
      icon: '📄',
      label: 'Créer Contrat',
      gradient: 'from-green-400 to-teal-400',
      onClick: () => setIsContractModalOpen(true)
    },
    {
      icon: '📈',
      label: 'Évaluation IA',
      gradient: 'from-purple-400 to-indigo-500',
      onClick: () => setIsÉvaluationIAModalOpen(true)
    },

    {
      icon: '📢',
      label: 'Publier Annonce',
      gradient: 'from-yellow-400 to-orange-500',
      onClick: () => setIsAnnonceModalOpen(true)
    },

    {
      icon: '🛠️',
      label: 'Prestataires',
      gradient: 'from-blue-500 to-indigo-600',
      onClick: () => setIsPrestatairesModalOpen(true)
    },
  ];

  const properties = [
    {
      id: 1,
      title: 'Appartement Cocody Riviera',
      type: '3 pièces',
      size: '85m²',
      rent: 280000,
      status: 'occupied',
      icon: '🏢'
    },
    {
      id: 2,
      title: 'Villa Angré 7ème Tranche',
      type: '5 pièces',
      size: '180m²',
      rent: 450000,
      status: 'occupied',
      icon: '🏠'
    },
    {
      id: 3,
      title: 'Studio Plateau Centre',
      type: '1 pièce',
      size: '35m²',
      rent: 120000,
      status: 'vacant',
      icon: '🏘️'
    },
  ];

  const tenants = [
    {
      id: 1,
      name: 'Kader Adeniran',
      initials: 'KA',
      property: 'Appartement Cocody Riviera',
      rent: 280000,
      status: 'active'
    },
    {
      id: 2,
      name: 'Marie Koné',
      initials: 'MK',
      property: 'Villa Angré',
      rent: 450000,
      status: 'active'
    },
    {
      id: 3,
      name: 'Jean Soro',
      initials: 'JS',
      property: 'Duplex Marcory',
      rent: 320000,
      status: 'pending'
    },
    {
      id: 4,
      name: 'Aminata Bamba',
      initials: 'AB',
      property: 'Appartement Yopougon',
      rent: 180000,
      status: 'active'
    },
  ];

  const notifications = [
    {
      id: 1,
      icon: '⚠️',
      title: 'Paiement en Retard',
      text: 'Jean Soro - Loyer janvier non payé',
      time: 'Il y a 2 jours',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      id: 2,
      icon: '🔧',
      title: 'Demande de Maintenance',
      text: 'Réparation plomberie - Villa Angré',
      time: 'Il y a 5 heures',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: 3,
      icon: '💰',
      title: 'Paiement Reçu',
      text: 'Kader Adeniran - Loyer février',
      time: 'Il y a 1 jour',
      gradient: 'from-green-400 to-teal-400'
    },
    {
      id: 4,
      icon: '📈',
      title: 'Évaluation IA Disponible',
      text: 'Nouveau rapport pour Studio Plateau',
      time: 'Il y a 3 jours',
      gradient: 'from-purple-400 to-indigo-500'
    },
  ];

  const handleNavClick = (itemId) => {
    setActiveNav(itemId);
  };

  const handlePremiumClick = (feature) => {
    if (feature === 'Évaluation IA') {
      // Rediriger vers le catalogue IA au lieu d'afficher une alerte
      setActiveNav('evaluation');
    } else {
      alert(`🚀 Fonctionnalité Premium: ${feature}\n\nAccès aux outils IA avancés pour l'analyse et l'optimisation de votre portefeuille immobilier.`);
    }
  };

  const handlePropertyClick = (property) => {
    alert(`Ouverture des détails de ${property.title}...`);
  };

  const handleTenantClick = (tenant) => {
    alert(`Ouverture du profil de ${tenant.name}...`);
  };

  const handleNotificationClick = (notification) => {
    alert(`Action pour: ${notification.title}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-orange-500">
      <div className="flex w-full h-screen bg-gray-50">
        {/* Sidebar - Avec fonctionnalité collapse */}
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-auto md:w-48 lg:w-52 xl:w-56'} bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col p-2 shadow-xl relative transition-all duration-300 ease-in-out`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-400 to-orange-500"></div>

          {/* Toggle Button - En haut du sidebar */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/20 to-transparent animate-pulse"></div>
              <span className="relative z-10 text-xs">
                {isSidebarCollapsed ? '→' : '←'}
              </span>
            </button>
            
            {/* Logo Section - Visible seulement si sidebar pas collapsed */}
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/20 to-transparent animate-pulse"></div>
                  H
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                    HABIPRO
                  </div>
                  <div className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
                    Propriétaire
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-y-auto scrollbar-hide flex-1">
            {/* Navigation - Adaptée au mode collapsed */}
            <div className="flex-1">
              {!isSidebarCollapsed && (
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2 pl-2 relative">
                  <div className="absolute left-0 top-1/2 w-1.5 h-0.5 bg-gradient-to-r from-red-400 to-orange-500 rounded-full"></div>
                  Gestion Immobilière
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
                    ? 'text-red-500 bg-gradient-to-r from-red-50 to-orange-50 font-semibold transform translate-x-1 shadow-md'
                    : 'text-gray-700 hover:text-red-500 hover:transform hover:translate-x-1 hover:shadow-sm'
                    }`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="w-3 h-3 flex items-center justify-center text-sm relative z-10">
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="font-medium relative z-10 ml-1.5 text-sm">{item.label}</span>
                      {item.badge && (
                        <div className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg relative z-10">
                          {item.badge}
                        </div>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && item.badge && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full relative z-10 min-w-[16px] h-4 flex items-center justify-center">
                      {item.badge}
                    </div>
                  )}
                </a>
              ))}

              {!isSidebarCollapsed && (
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 pl-3 mt-6 relative">
                  <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-gradient-to-r from-red-400 to-orange-500 rounded-full"></div>
                  Services & Outils
                </div>
              )}

              {serviceItems.map((item) => (
                <a
                  key={item.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.premium && item.id === 'evaluation') {
                      // Pour l'évaluation IA, rediriger directement vers le catalogue
                      handleNavClick('evaluation');
                    } else if (item.premium) {
                      handlePremiumClick(item.label);
                    } else {
                      handleNavClick(item.id);
                    }
                  }}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} text-sm p-2 rounded-lg mb-1 mr-2 transition-all duration-300 relative overflow-hidden group ${
                    activeNav === item.id
                      ? 'text-red-500 bg-gradient-to-r from-red-50 to-orange-50 font-semibold transform translate-x-1 shadow-md'
                      : 'text-gray-700 hover:text-red-500 hover:transform hover:translate-x-2 hover:shadow-sm'
                  }`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="w-4 h-4 flex items-center justify-center text-sm relative z-10">
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="font-medium relative z-10 ml-2">{item.label}</span>
                      {item.premium && (
                        <div className="ml-auto bg-gradient-to-r from-purple-400 to-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md relative z-10">
                          PRO
                        </div>
                      )}
                      {item.badge && !item.premium && (
                        <div className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg relative z-10">
                          {item.badge}
                        </div>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && item.badge && !item.premium && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full relative z-10 min-w-[16px] h-4 flex items-center justify-center">
                      {item.badge}
                    </div>
                  )}
                  {isSidebarCollapsed && item.premium && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-400 to-indigo-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full relative z-10 min-w-[18px] h-4 flex items-center justify-center">
                      PRO
                    </div>
                  )}
                </a>
              ))}

              {!isSidebarCollapsed && (
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 pl-3 mt-6 relative">
                  <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-gradient-to-r from-red-400 to-orange-500 rounded-full"></div>
                  Administration
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
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} text-sm p-2 rounded-lg mb-1 mr-2 text-gray-700 hover:text-red-500 hover:transform hover:translate-x-2 hover:shadow-sm transition-all duration-300 relative overflow-hidden group`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="w-4 h-4 flex items-center justify-center text-sm relative z-10">
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="font-medium relative z-10 ml-2">{item.label}</span>
                  )}
                </a>
              ))}
            </div>

            {/* Status Card - Visible seulement si sidebar pas collapsed */}
            {!isSidebarCollapsed && (
              <div className="bg-gradient-to-br from-red-400 to-orange-500 rounded-lg p-2.5 text-center text-white shadow-lg relative overflow-hidden mt-3">
                <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/15 to-transparent animate-pulse"></div>
                <div className="text-sm font-bold mb-1 relative z-10">Premium</div>
                <div className="text-xs opacity-90 mb-2 relative z-10">8 propriétés • 12 locataires</div>
                <button
                  onClick={() => alert('Interface de gestion avancée à implémenter')}
                  className="bg-white/25 backdrop-blur-sm border border-white/30 px-2 py-1 rounded-md text-white font-semibold text-sm transition-all duration-300 hover:bg-white/35 hover:-translate-y-1 hover:shadow-md relative z-10"
                >
                  Gestion avancée
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header - Tailles corrigées */}
          <div className="bg-white border-b border-gray-200 p-3 shadow-sm relative">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-500 opacity-10"></div>
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1">
                <div className="text-sm font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {activeNav === 'evaluation' ? 'Catalogue Intelligence Artificielle' : 'Tableau de Bord Propriétaire'}
                </div>
                <div className="text-red-500 font-semibold flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <div>Bienvenue • {currentTime.toLocaleTimeString('fr-FR')}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Box - Plus compact */}
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
                    className={`w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none transition-all duration-300 font-medium ${isSearchFocused ? 'border-red-400 shadow-lg bg-white transform scale-105' : 'bg-gray-50'
                      }`}
                    placeholder="Rechercher..."
                  />
                </div>

                {/* Quick Stats - Plus compacts */}
                <div className="flex gap-1 ">
                  <div className="flex flex-col items-center p-1.5 bg-white rounded-lg border border-gray-200 min-w-[50px] hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-bold text-gray-900">8</div>
                    <div className="text-[7px] text-gray-500 font-semibold uppercase tracking-wider">Propriétés</div>
                  </div>
                  <div className="flex flex-col items-center p-1.5 bg-white rounded-lg border border-gray-200 min-w-[60px] hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-bold text-gray-900">12</div>
                    <div className="text-[7px] text-gray-500 font-semibold uppercase tracking-wider">Locataires</div>
                  </div>
                  <div className="flex flex-col items-center p-1.5 bg-white rounded-lg border border-gray-200 min-w-[60px] hover:transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-bold text-gray-900">95%</div>
                    <div className="text-[7px] text-gray-500 font-semibold uppercase tracking-wider">Occupation</div>
                  </div>
                </div>

                {/* Action Buttons - Plus petits */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-red-500 hover:text-white hover:transform hover:-translate-y-1 hover:shadow-lg text-sm relative">
                    🔔
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                      7
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-red-500 hover:text-white hover:transform hover:-translate-y-1 hover:shadow-lg text-sm">
                    ⚙️
                  </div>
                </div>

                {/* Revenue Card - Plus compact */}
                <div className="bg-gradient-to-br from-green-400 to-teal-400 px-2 py-1 rounded-lg text-white font-bold shadow-lg flex flex-col items-center gap-0.5">
                  <div className="text-[8px] opacity-80 uppercase tracking-wider">Revenus Mensuels</div>
                  <div className="text-[10px]">{formatCurrency(revenueValue)}</div>
                </div>

               {/* User Info - Plus compact */}
                <div className="flex items-center gap-2 p-2 pr-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:transform hover:-translate-y-1 transition-all duration-300">
                  <div className="w-7 h-7 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    AB
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold text-gray-900 text-xs">Ahmed Bakayoko</div>
                    <div className="text-red-500 text-[9px] font-semibold">Propriétaire Premium</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto">
            {renderContent()}
          </div>

        </div>
      </div>
      <PropertyFormModal isOpen={isModalOpen} onClose={closeModal} />
      <TenantFormModal isOpen={isTenantModalOpen} onClose={closeTenantModal} />
      <ContractFormModal isOpen={isContractModalOpen} onClose={closeContractModal} />
      <NouvelleAnnonceModal isOpen={isAnnonceModalOpen} onClose={closeAnnonceModal} />
      <EvaluationIAModal isOpen={isÉvaluationIAModalOpen} onClose={closeÉvaluationIAModal} />
      <NouveauPrestataireModal isOpen={isPrestatairesModalOpen} onClose={closePrestatairesModal} />

    </div>
  );
}