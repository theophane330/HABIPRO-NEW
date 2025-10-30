import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, X, FileText, Bot, Send, Folder, Upload, Download, Eye, Edit3, Share2, Loader, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function JuridicalAssistant({ showPanel, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOpenPanel, setShowOpenPanel] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Fonction utilitaire pour s'assurer que documents est toujours un tableau
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      // Si c'est un objet avec results (pagination Django REST)
      if (Array.isArray(data.results)) return data.results;
      // Si c'est un objet avec data
      if (Array.isArray(data.data)) return data.data;
    }
    return [];
  };

  // Configuration de l'API
  const API_BASE_URL = 'http://localhost:8000/api';
  const GEMINI_API_URL = 'http://localhost:8002';

  // Récupérer le token d'authentification
  const getAuthToken = () => {
    // Essayer plusieurs clés possibles
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('auth_token') ||
                  sessionStorage.getItem('authToken');
    
    if (!token) {
      console.warn('⚠️ Aucun token d\'authentification trouvé');
    }
    
    return token;
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = getAuthToken();
    if (!token && showPanel) {
      console.error('❌ Utilisateur non authentifié');
      setUploadError('Vous devez être connecté pour accéder à cette fonctionnalité');
    }
  }, [showPanel]);

  // Charger les documents au montage du composant
  useEffect(() => {
    if (showPanel) {
      const token = getAuthToken();
      if (token) {
        loadDocuments();
      } else {
        console.warn('⚠️ Chargement des documents annulé : pas de token');
      }
    }
  }, [showPanel]);

  // Charger l'historique du chat quand un document est sélectionné
  useEffect(() => {
    if (selectedDocument && showAIChat) {
      loadChatHistory();
    }
  }, [selectedDocument, showAIChat]);

  // Auto-scroll du chat
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Charger les documents depuis l'API
  const loadDocuments = async () => {
    const token = getAuthToken();
    
    if (!token) {
      console.error('❌ Impossible de charger les documents : token manquant');
      setUploadError('Veuillez vous connecter pour accéder aux documents');
      setDocuments([]); // S'assurer que c'est un tableau vide
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Chargement des documents...');
      
      const response = await fetch(`${API_BASE_URL}/juridical-documents/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Réponse:', response.status);

      if (response.ok) {
        const data = await response.json();
        const docsArray = ensureArray(data);
        console.log('✅ Documents chargés:', docsArray.length);
        setDocuments(docsArray);
        setUploadError('');
      } else if (response.status === 401) {
        console.error('❌ Token invalide ou expiré');
        setUploadError('Session expirée. Veuillez vous reconnecter.');
        setDocuments([]);
        localStorage.removeItem('authToken');
      } else {
        console.error('❌ Erreur serveur:', response.status);
        setDocuments([]);
      }
    } catch (error) {
      console.error('💥 Erreur lors du chargement des documents:', error);
      setUploadError('Erreur de connexion au serveur');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger l'historique du chat pour le document sélectionné
  const loadChatHistory = async () => {
    if (!selectedDocument) return;

    setIsLoadingMessages(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/juridical-documents/${selectedDocument.id}/chat_history/`,
        {
          headers: {
            'Authorization': `Token ${getAuthToken()}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.map(msg => ({
          id: msg.id,
          type: msg.message_type,
          content: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        })));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Upload de documents (plusieurs fichiers)
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const token = getAuthToken();
    if (!token) {
      setUploadError('Vous devez être connecté pour uploader des documents');
      console.error('❌ Token d\'authentification manquant');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    // Créer un FormData avec TOUS les fichiers
    const formData = new FormData();
    
    let hasInvalidFile = false;
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      console.log(`📄 Validation ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      
      // Vérifications côté client
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        errors.push(`${file.name}: Type non valide (PDF uniquement)`);
        hasInvalidFile = true;
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: Trop volumineux (max 10MB)`);
        hasInvalidFile = true;
        continue;
      }
      
      // ⚠️ IMPORTANT : Ajouter CHAQUE fichier avec la clé 'files' (au pluriel)
      formData.append('files', file);
    }
    
    // Si tous les fichiers sont invalides, arrêter
    if (hasInvalidFile && formData.getAll('files').length === 0) {
      setUploadError(errors.join('\n'));
      setIsUploading(false);
      return;
    }

    try {
      const endpoint = `${API_BASE_URL}/juridical-documents/upload-multiple/`;
      const fileCount = formData.getAll('files').length;
      
      console.log('🌐 Envoi vers:', endpoint);
      console.log('📤 Nombre de fichiers valides:', fileCount);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          // ⚠️ NE PAS METTRE 'Content-Type' pour multipart/form-data
          // Le navigateur le définira automatiquement avec le boundary
        },
        body: formData,
      });

      console.log('📥 Réponse statut:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Résultat:', result);
        
        // Ajouter les nouveaux documents à la liste
        const newDocs = result.data || [];
        setDocuments(prev => {
          const prevArray = ensureArray(prev);
          return [...newDocs, ...prevArray];
        });
        
        // Gérer les erreurs partielles
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map(e => `${e.file}: ${e.error}`);
          setUploadError(`⚠️ Certains fichiers n'ont pas pu être uploadés :\n${errorMessages.join('\n')}`);
          
          // Afficher quand même un message de succès pour les fichiers réussis
          if (result.total_uploaded > 0) {
            alert(`✅ ${result.total_uploaded} document(s) uploadé(s) avec succès !\n❌ ${result.total_errors} erreur(s)`);
          }
        } else {
          setUploadError('');
          alert(`✅ ${result.total_uploaded} document(s) uploadé(s) avec succès !`);
          setTimeout(() => setShowOpenPanel(false), 1000);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur serveur:', errorData);
        setUploadError(errorData.error || errorData.detail || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('💥 Erreur réseau:', error);
      setUploadError('Erreur de connexion au serveur. Vérifiez que l\'API Django est démarrée.');
    } finally {
      setIsUploading(false);
    }
  };

  // Envoyer un message à l'IA
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedDocument || isSendingMessage) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSendingMessage(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/juridical-documents/${selectedDocument.id}/ask_question/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: inputMessage,
            max_tokens: 1024,
            model_name: 'models/gemini-2.0-flash-exp'
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        const error = await response.json();
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: error.error || 'Une erreur est survenue lors du traitement de votre question.',
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Erreur de connexion au serveur. Veuillez réessayer.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Ouvrir le chat IA avec un document
  const openAIChat = (document) => {
    console.log('🤖 Ouverture du chat IA pour:', document.name);
    setSelectedDocument(document);
    setShowAIChat(true);
    setShowOpenPanel(false); // Fermer le panneau "Ouvrir"
    
    // Message de bienvenue initial
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `Bonjour ! 👋\n\nJe suis prêt à analyser le document **"${document.name}"**.\n\n${document.is_processed ? '✅ Ce document a été traité avec succès.' : '⏳ Ce document est en cours de traitement.'}\n\nPosez-moi vos questions sur son contenu et je vous répondrai en me basant sur les informations qu'il contient.\n\n**Exemples de questions :**\n• Résume ce document\n• Quels sont les points importants ?\n• Y a-t-il des clauses spécifiques ?\n• Quelles sont les obligations mentionnées ?`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([welcomeMessage]);
  };

  // Télécharger un document
  const downloadDocument = async (doc) => {
    try {
      const response = await fetch(doc.file, {
        headers: {
          'Authorization': `Token ${getAuthToken()}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  // Ouvrir le visualiseur PDF
  const viewDocument = (doc) => {
    window.open(doc.file, '_blank');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-emerald-600" />;
      case 'in-progress':
        return <Clock size={16} className="text-amber-600" />;
      case 'pending':
        return <Loader size={16} className="text-blue-600 animate-spin" />;
      default:
        return <AlertCircle size={16} className="text-stone-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'in-progress':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-stone-600 bg-stone-50 border-stone-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Traité';
      case 'in-progress':
        return 'En cours';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const getBookScale = (index) => {
    if (index === currentIndex) return 'scale-110';
    if (Math.abs(index - currentIndex) === 1) return 'scale-95';
    return 'scale-75';
  };

  const getBookOpacity = (index) => {
    if (index === currentIndex) return 'opacity-100';
    if (Math.abs(index - currentIndex) === 1) return 'opacity-70';
    return 'opacity-40';
  };

  const getBookZIndex = (index) => {
    if (index === currentIndex) return 'z-30';
    if (Math.abs(index - currentIndex) === 1) return 'z-20';
    return 'z-10';
  };

  return (
    <>
      {/* Overlay */}
      {(showPanel || showOpenPanel || showAIChat) && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-700"
          onClick={() => {
            onClose();
            setShowOpenPanel(false);
            setShowAIChat(false);
          }}
        />
      )}

      {/* Panneau principal */}
      <div className={`fixed inset-y-0 right-0 w-5/6 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 backdrop-blur-2xl shadow-2xl border-l border-stone-200/50 z-50 transform transition-transform duration-700 ease-out ${showPanel ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">⚖️</span>
              </div>
              <div>
                <h2 className="text-2xl font-light tracking-wide text-stone-800">ASSISTANT JURIDIQUE IA</h2>
                <p className="text-stone-600 text-sm tracking-wide">ANALYSE INTELLIGENTE DE DOCUMENTS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowOpenPanel(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 shadow-lg"
              >
                <FileText size={18} />
                <span className="font-medium">Ouvrir</span>
              </button>
              
              <button
                onClick={() => {
                  if (documents.length > 0 && documents[currentIndex]) {
                    openAIChat(documents[currentIndex]);
                  }
                }}
                disabled={documents.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative group"
              >
                <Bot size={18} />
                <span className="font-medium">Chat IA</span>
                {documents.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    {documents.length}
                  </span>
                )}
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un document..."
                  className="w-80 pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              
              <button 
                onClick={onClose}
                className="p-3 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors duration-300"
              >
                <X size={24} className="text-stone-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="h-full overflow-y-auto p-8">
          
          {/* Section introduction */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-stone-800 mb-4">Analysez vos documents juridiques</h1>
            <p className="text-stone-600 leading-relaxed max-w-2xl mb-6">
              Uploadez vos documents PDF et posez des questions à notre assistant IA. Obtenez des réponses précises basées sur le contenu de vos documents.
            </p>
          </div>

          {/* Citation */}
          <div className="bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10"></div>
            <div className="relative z-10">
              <p className="text-stone-200 leading-relaxed italic text-lg">
                "L'intelligence artificielle au service du droit : une analyse rapide, précise et accessible de tous vos documents juridiques."
              </p>
            </div>
          </div>

          {/* Carousel de documents */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader className="mx-auto mb-4 text-orange-500 animate-spin" size={48} />
              <p className="text-stone-600">Chargement des documents...</p>
            </div>
          ) : documents.length > 0 && (
            <div className="relative mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-stone-800">Vos documents</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-stone-200 hover:bg-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5 text-stone-600" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === documents.length - 1}
                    className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-stone-200 hover:bg-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5 text-stone-600" />
                  </button>
                </div>
              </div>

              <div className="relative h-96 overflow-hidden">
                <div 
                  className="flex items-center justify-center gap-8 transition-all duration-500 ease-out"
                  style={{
                    transform: `translateX(${(2 - currentIndex) * 200}px)`
                  }}
                >
                  {documents.map((doc, index) => (
                    <div
                      key={doc.id}
                      className={`relative transition-all duration-500 cursor-pointer ${getBookScale(index)} ${getBookOpacity(index)} ${getBookZIndex(index)}`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <div className="w-52 h-80 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
                        <div className="w-full h-full bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 relative group">
                          <div className="absolute inset-0 p-6 flex flex-col justify-between">
                            <div className="text-center">
                              <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-6 flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <span className="text-3xl">📄</span>
                              </div>
                              <h3 className="text-white font-bold text-lg leading-tight mb-3 line-clamp-3">
                                {doc.name}
                              </h3>
                              <p className="text-white/90 text-sm font-medium">{doc.file_type} • {doc.file_size}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-white/90 text-xs">
                                <span>{getStatusText(doc.status)}</span>
                                {getStatusIcon(doc.status)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <h4 className="font-semibold text-stone-800 text-sm mb-1 leading-tight line-clamp-2">
                          {doc.name}
                        </h4>
                        {index === currentIndex && (
                          <div className="mt-2">
                            <div className="w-8 h-1 bg-orange-500 rounded-full mx-auto"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center mt-8 gap-3">
                {documents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-orange-500 w-12' : 'bg-stone-300 w-2'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Message si aucun document */}
          {!getAuthToken() ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={48} className="text-red-500" />
              </div>
              <h3 className="text-xl font-medium text-red-700 mb-2">Authentification requise</h3>
              <p className="text-red-500 mb-6">Vous devez être connecté pour accéder aux documents juridiques</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
              >
                Se connecter
              </button>
            </div>
          ) : !isLoading && documents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={48} className="text-stone-400" />
              </div>
              <h3 className="text-xl font-medium text-stone-700 mb-2">Aucun document</h3>
              <p className="text-stone-500 mb-6">Commencez par uploader votre premier document PDF</p>
              <button
                onClick={() => setShowOpenPanel(true)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300"
              >
                Uploader un document
              </button>
            </div>
          )}

          {/* Actions rapides */}
          <div className="mb-8">
            <h3 className="text-lg font-light text-stone-800 mb-4 tracking-wide">ACTIONS RAPIDES</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <span className="text-xl">📄</span>, title: 'Nouveau document', desc: 'Uploader un PDF', color: 'bg-blue-50 text-blue-600 border-blue-200' },
                { icon: <span className="text-xl">🤖</span>, title: 'Assistant IA', desc: 'Poser une question', color: 'bg-purple-50 text-purple-600 border-purple-200' },
                { icon: <span className="text-xl">📊</span>, title: 'Mes analyses', desc: 'Historique des chats', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
              ].map((action, index) => (
                <button 
                  key={index} 
                  onClick={() => {
                    if (index === 0) setShowOpenPanel(true);
                    if (index === 1 && documents.length > 0) openAIChat(documents[currentIndex]);
                  }}
                  className={`p-4 rounded-xl border-2 ${action.color} hover:shadow-lg transition-all duration-300 text-left group`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 group-hover:scale-110 transition-transform duration-300">
                      {action.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <p className="text-xs opacity-70 mt-1">{action.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/30">
            <div className="grid grid-cols-4 gap-6 text-center">
              {[
                { label: 'Documents', value: Array.isArray(documents) ? documents.length : 0, color: 'text-blue-600' },
                { label: 'Traités', value: Array.isArray(documents) ? documents.filter(d => d.status === 'completed').length : 0, color: 'text-emerald-600' },
                { label: 'En cours', value: Array.isArray(documents) ? documents.filter(d => d.status === 'in-progress').length : 0, color: 'text-amber-600' },
                { label: 'En attente', value: Array.isArray(documents) ? documents.filter(d => d.status === 'pending').length : 0, color: 'text-purple-600' }
              ].map((stat, index) => (
                <div key={index}>
                  <div className={`text-3xl font-light ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-xs text-stone-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Panneau "Ouvrir" */}
      <div className={`fixed inset-y-0 left-0 w-1/2 bg-gradient-to-br from-white via-blue-50 to-white backdrop-blur-2xl shadow-2xl border-r border-blue-200/50 z-[70] transform transition-transform duration-700 ease-out ${showOpenPanel ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="bg-white/90 backdrop-blur-sm border-b border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Folder className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-light tracking-wide text-blue-800">GESTIONNAIRE DE DOCUMENTS</h2>
                <p className="text-blue-600 text-sm tracking-wide">UPLOAD ET GESTION DES FICHIERS</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowOpenPanel(false)}
              className="p-3 rounded-xl bg-blue-100 hover:bg-blue-200 transition-colors duration-300"
            >
              <X size={24} className="text-blue-600" />
            </button>
          </div>
        </div>

        <div className="h-full overflow-y-auto p-6">
          
          {/* Zone d'upload */}
          <div 
            className="mb-8 p-8 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/50 hover:bg-blue-50 transition-colors duration-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <div className="text-center">
              {isUploading ? (
                <>
                  <Loader className="mx-auto mb-4 text-blue-500 animate-spin" size={48} />
                  <h3 className="text-xl font-medium text-blue-800 mb-2">Upload en cours...</h3>
                  <p className="text-blue-600">Veuillez patienter</p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto mb-4 text-blue-500" size={48} />
                  <h3 className="text-xl font-medium text-blue-800 mb-2">Glissez vos documents PDF ici</h3>
                  <p className="text-blue-600 mb-4">ou cliquez pour sélectionner (max 10MB par fichier)</p>
                  <p className="text-blue-500 text-sm mb-4">✨ Upload multiple supporté - Sélectionnez plusieurs fichiers !</p>
                  {uploadError && (
                    <pre className="text-red-600 text-sm mb-2 text-left bg-red-50 p-3 rounded-lg whitespace-pre-wrap">{uploadError}</pre>
                  )}
                  <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300">
                    Parcourir les fichiers
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Liste des documents */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-blue-800 mb-4">Documents disponibles ({Array.isArray(documents) ? documents.length : 0})</h3>
            <div className="space-y-3">
              {Array.isArray(documents) && documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors truncate">
                        {doc.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-blue-500">
                        <span>{doc.file_type} • {doc.file_size}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)} flex items-center gap-1`}>
                          {getStatusIcon(doc.status)}
                          {getStatusText(doc.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
                    <button 
                      onClick={() => viewDocument(doc)}
                      className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Visualiser"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                    <button 
                      onClick={() => openAIChat(doc)}
                      className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                      title="Chat IA"
                    >
                      <Bot size={16} className="text-purple-600" />
                    </button>
                    <button 
                      onClick={() => downloadDocument(doc)}
                      className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Télécharger"
                    >
                      <Download size={16} className="text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filtres rapides */}
          <div>
            <h3 className="text-lg font-medium text-blue-800 mb-4">Filtres rapides</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { 
                  label: 'Tous les documents', 
                  count: Array.isArray(documents) ? documents.length : 0, 
                  icon: '📚' 
                },
                { 
                  label: 'Traités', 
                  count: Array.isArray(documents) ? documents.filter(d => d.status === 'completed').length : 0, 
                  icon: '✅' 
                },
                { 
                  label: 'En cours', 
                  count: Array.isArray(documents) ? documents.filter(d => d.status === 'in-progress').length : 0, 
                  icon: '⏳' 
                },
                { 
                  label: 'En attente', 
                  count: Array.isArray(documents) ? documents.filter(d => d.status === 'pending').length : 0, 
                  icon: '⏸️' 
                }
              ].map((filter, index) => (
                <button key={index} className="p-4 bg-white/80 rounded-xl border border-blue-200/50 hover:bg-white hover:shadow-lg transition-all duration-300 text-left group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                        {filter.icon}
                      </div>
                      <h4 className="font-medium text-blue-800">{filter.label}</h4>
                      <p className="text-blue-500 text-sm">{filter.count} document{filter.count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Panneau Chat IA - CORRIGÉ */}
      <div className={`fixed inset-y-0 left-0 w-1/2 bg-gradient-to-br from-white via-purple-50 to-white backdrop-blur-2xl shadow-2xl border-r border-purple-200/50 z-[70] transform transition-transform duration-700 ease-out ${showAIChat ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        
        {/* Header - flex-shrink-0 pour qu'il ne rétrécisse pas */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-light tracking-wide text-purple-800">ASSISTANT IA JURIDIQUE</h2>
                <p className="text-purple-600 text-sm tracking-wide">
                  {selectedDocument ? selectedDocument.name : 'ANALYSE DE DOCUMENTS'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-600">IA Active</span>
              </div>
              <button 
                onClick={() => setShowAIChat(false)}
                className="p-3 rounded-xl bg-purple-100 hover:bg-purple-200 transition-colors duration-300"
              >
                <X size={24} className="text-purple-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages - flex-1 pour prendre tout l'espace disponible */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="text-purple-500 animate-spin" size={48} />
            </div>
          ) : (
            <>
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3/4 rounded-2xl p-4 ${
                    message.type === 'user' 
                      ? 'bg-purple-500 text-white ml-12' 
                      : 'bg-white/80 text-purple-800 mr-12 border border-purple-200/50'
                  }`}>
                    {message.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot size={16} className="text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">Assistant IA</span>
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              {isSendingMessage && (
                <div className="flex justify-start">
                  <div className="bg-white/80 text-purple-800 rounded-2xl p-4 mr-12 border border-purple-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot size={16} className="text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">Assistant IA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader className="text-purple-600 animate-spin" size={16} />
                      <span className="text-purple-600">Analyse en cours...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Actions suggérées - flex-shrink-0 */}
        {selectedDocument && !isSendingMessage && (
          <div className="px-6 pb-4 flex-shrink-0">
            <div className="flex gap-2 flex-wrap">
              {[
                "Résume ce document",
                "Quels sont les points clés ?",
                "Y a-t-il des clauses importantes ?",
                "Quelles sont les obligations ?"
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(action)}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors duration-300"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Zone de saisie - flex-shrink-0 pour qu'elle reste visible */}
        <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-purple-200 flex-shrink-0">
          {selectedDocument ? (
            <>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Posez votre question sur le document..."
                  className="flex-1 px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isSendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSendingMessage}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
                >
                  {isSendingMessage ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  <span>Envoyer</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-4 text-xs text-purple-500">
                <span>💡 L'IA analyse le contenu de votre document pour répondre</span>
                <span>🔒 Conversations sécurisées</span>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-purple-600">Sélectionnez un document pour commencer à poser des questions</p>
            </div>
          )}
        </div>

      </div>

    </>
  );
}