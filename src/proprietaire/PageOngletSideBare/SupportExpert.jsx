import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Phone, DollarSign, Home, Settings, Send, Search, FileText, Shield, Bell, Video, Calendar, User, Mail, Upload, X, Eye, Clock, CheckCircle, AlertCircle, Filter, Download, Book, Sparkles } from 'lucide-react';

export default function SupportExpert() {
  // Styles pour la mise en page
  const containerStyle = "h-screen flex flex-col overflow-hidden bg-gray-50";
  const headerStyle = "bg-white border-b border-gray-200 p-4 shadow-sm";
  const contentStyle = "flex-1 overflow-hidden flex flex-col min-h-0 p-4";
  const mainContentStyle = "flex-1 bg-white rounded-lg shadow-sm overflow-auto";

  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
    fileName: ''
  });

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const supportTypes = [
    {
      icon: Settings,
      title: 'Problème technique',
      description: 'Difficulté d\'accès ou bug sur la plateforme',
      action: '📩 Envoyer une demande',
      color: 'blue',
      category: 'technique'
    },
    {
      icon: DollarSign,
      title: 'Question sur les paiements',
      description: 'Retard, erreur ou remboursement',
      action: '📩 Contacter le support',
      color: 'green',
      category: 'paiement'
    },
    {
      icon: Home,
      title: 'Aide à la gestion immobilière',
      description: 'Besoin d\'assistance sur un contrat ou une estimation',
      action: '🗓️ Planifier un appel',
      color: 'purple',
      category: 'immobilier'
    },
    {
      icon: Settings,
      title: 'Paramètres ou intégrations',
      description: 'Configurations, API, sécurité du compte',
      action: '🧠 Consulter un expert',
      color: 'orange',
      category: 'configuration'
    }
  ];

  const knowledgeBase = [
    { icon: '🏠', title: 'Comment créer et gérer un contrat de location ?', views: 1234 },
    { icon: '💳', title: 'Comment enregistrer un paiement mobile ?', views: 892 },
    { icon: '🧾', title: 'Comment télécharger les documents du contrat ?', views: 756 },
    { icon: '🔐', title: 'Comment renforcer la sécurité de votre compte ?', views: 645 },
    { icon: '⚙️', title: 'Comment configurer vos préférences et notifications ?', views: 523 }
  ];

  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: 'Problème de connexion',
      category: 'Technique',
      status: 'open',
      date: '08/10/2025',
      priority: 'high',
      description: 'Impossible de me connecter depuis hier'
    },
    {
      id: 2,
      title: 'Remboursement paiement',
      category: 'Paiement',
      status: 'progress',
      date: '05/10/2025',
      priority: 'medium',
      description: 'Demande de remboursement pour double paiement'
    },
    {
      id: 3,
      title: 'Question sur contrat',
      category: 'Immobilier',
      status: 'resolved',
      date: '01/10/2025',
      priority: 'low',
      description: 'Clause de résiliation du contrat'
    }
  ]);

  const statusConfig = {
    open: { label: 'Ouvert', color: 'bg-green-100 text-green-800', icon: AlertCircle },
    progress: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    resolved: { label: 'Résolu', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
  };

  const priorityConfig = {
    high: { label: 'Haute', color: 'bg-red-100 text-red-800' },
    medium: { label: 'Moyenne', color: 'bg-orange-100 text-orange-800' },
    low: { label: 'Basse', color: 'bg-blue-100 text-blue-800' }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.category || !formData.message) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newTicket = {
      id: Date.now(),
      title: formData.message.substring(0, 50) + '...',
      category: formData.category.charAt(0).toUpperCase() + formData.category.slice(1),
      status: 'open',
      date: new Date().toLocaleDateString('fr-FR'),
      priority: 'medium',
      description: formData.message
    };

    setTickets(prev => [newTicket, ...prev]);
    setShowSuccessMessage(true);
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: '',
      message: '',
      fileName: ''
    });

    setTimeout(() => {
      setShowSuccessMessage(false);
      setActiveTab('history');
    }, 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, fileName: file.name });
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || ticket.category.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const progressTickets = tickets.filter(t => t.status === 'progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className={`
      min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6
      transform transition-all duration-700 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span>❓</span> Support & Assistance Expert
            </h1>
            <p className="text-gray-600 mt-1">Obtenez de l'aide rapidement grâce à notre centre d'assistance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tickets Ouverts</p>
                <p className="text-2xl font-bold text-gray-800">{openTickets}</p>
              </div>
              <AlertCircle className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En Cours</p>
                <p className="text-2xl font-bold text-gray-800">{progressTickets}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Résolus</p>
                <p className="text-2xl font-bold text-gray-800">{resolvedTickets}</p>
              </div>
              <CheckCircle className="text-gray-500" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Phone className="text-blue-600" size={24} />
            Centre d'Aide Rapide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportTypes.map((type, idx) => {
              const Icon = type.icon;
              return (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer group">
                  <Icon className="text-blue-600 mb-2" size={32} />
                  <h3 className="font-semibold text-gray-800 mb-1">{type.title}</h3>
                  <p className="text-xs text-gray-600 mb-3">{type.description}</p>
                  <button 
                    onClick={() => {
                      setActiveTab('new');
                      setFormData({...formData, category: type.category});
                    }}
                    className="w-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 text-xs py-2 rounded-md transition-colors"
                  >
                    {type.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('new')}
                className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'new' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                📩 Nouvelle Demande
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                📋 Historique des Tickets
              </button>
            </div>
          </div>

          {activeTab === 'new' ? (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="text-green-600" size={24} />
                Messagerie d'assistance directe
              </h2>

              {showSuccessMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="text-green-800 font-semibold">✅ Votre demande a bien été envoyée</p>
                    <p className="text-green-700 text-sm">Un expert vous répondra sous 24h.</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <User size={16} /> Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Mail size={16} /> Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Phone size={16} /> Téléphone (optionnel)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+225 XX XX XX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Settings size={16} /> Catégorie de problème *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      <option value="technique">Technique</option>
                      <option value="paiement">Paiement</option>
                      <option value="immobilier">Immobilier</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FileText size={16} /> Message / Description détaillée *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Décrivez votre problème en détail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Upload size={16} /> Joindre une capture d'écran ou un fichier (optionnel)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  {formData.fileName && (
                    <p className="text-sm text-green-600 mt-1">✓ Fichier sélectionné: {formData.fileName}</p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  🚀 Envoyer la demande au support
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un ticket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 border rounded-md flex items-center gap-2 transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  <Filter size={20} />
                  Filtres
                </button>
              </div>

              {showFilters && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="open">Ouvert</option>
                      <option value="progress">En cours</option>
                      <option value="resolved">Résolu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Toutes les catégories</option>
                      <option value="technique">Technique</option>
                      <option value="paiement">Paiement</option>
                      <option value="immobilier">Immobilier</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filteredTickets.map((ticket) => {
                  const StatusIcon = statusConfig[ticket.status].icon;
                  return (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{ticket.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[ticket.status].color} flex items-center gap-1`}>
                            <StatusIcon size={12} />
                            {statusConfig[ticket.status].label}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${priorityConfig[ticket.priority].color}`}>
                            {priorityConfig[ticket.priority].label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex gap-4">
                          <span>🏷️ {ticket.category}</span>
                          <span>📅 {ticket.date}</span>
                          <span>#{ticket.id}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <Eye size={16} />
                          Voir détails
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTickets.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Aucun ticket trouvé</p>
                  <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Book className="text-purple-600" size={24} />
            Base de Connaissances
          </h2>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="🔍 Recherchez une solution..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            {knowledgeBase.map((article, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{article.icon}</span>
                  <span className="text-gray-800">{article.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">👁️ {article.views} vues</span>
                  <span className="text-blue-600">→</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-purple-50 text-purple-600 py-3 rounded-lg hover:bg-purple-100 transition-colors font-semibold">
            💡 Voir toute la documentation
          </button>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles size={28} />
            Assistance Premium (PRO)
          </h2>
          <p className="mb-4 text-amber-50">Accédez à un support d'excellence réservé aux utilisateurs PRO</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg flex items-center gap-2">
              <Phone size={20} />
              <span className="text-sm">Assistance téléphonique prioritaire</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg flex items-center gap-2">
              <Shield size={20} />
              <span className="text-sm">Conseils juridiques personnalisés</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg flex items-center gap-2">
              <Sparkles size={20} />
              <span className="text-sm">Support IA : Analyse automatique</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg flex items-center gap-2">
              <Video size={20} />
              <span className="text-sm">Rendez-vous vidéo avec un expert</span>
            </div>
          </div>
          <button className="w-full bg-white text-orange-600 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold flex items-center justify-center gap-2">
            <Calendar size={20} />
            💬 Contacter un Expert HABIPRO PRO
          </button>
        </div>
      </div>
    </div>
  );
}