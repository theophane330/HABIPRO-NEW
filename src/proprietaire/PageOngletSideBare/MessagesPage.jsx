import React, { useState } from 'react';
import { Plus, Search, Trash2, Send, Paperclip, Download, X, Filter, Users, MessageCircle, Check, CheckCheck, Clock, Sparkles, Mail, Phone, Home } from 'lucide-react';

const MessagerieIntelligente = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [showAiAssistant, setShowAiAssistant] = useState(false);

    const [conversations, setConversations] = useState([
        {
            id: 1,
            contact: 'Jean Kouadio',
            type: 'Locataire',
            subject: 'Paiement du loyer',
            lastMessage: 'Bonjour, le paiement est fait',
            date: '30/08/2025',
            time: '14:30',
            status: 'read',
            unreadCount: 0,
            avatar: 'JK',
            messages: [
                { id: 1, sender: 'Jean Kouadio', text: 'Bonjour, le paiement du mois d\'août est effectué.', time: '14:25', type: 'received', status: 'read' },
                { id: 2, sender: 'Vous', text: 'Merci, nous avons bien reçu le paiement ✅', time: '14:30', type: 'sent', status: 'read' }
            ]
        },
        {
            id: 2,
            contact: 'Mariam Diallo',
            type: 'Locataire',
            subject: 'Fuite salle de bain',
            lastMessage: 'Problème urgent à résoudre',
            date: '28/08/2025',
            time: '09:15',
            status: 'unread',
            unreadCount: 3,
            avatar: 'MD',
            messages: [
                { id: 1, sender: 'Mariam Diallo', text: 'Bonjour, j\'ai une fuite d\'eau dans la salle de bain depuis ce matin.', time: '09:10', type: 'received', status: 'read' },
                { id: 2, sender: 'Mariam Diallo', text: 'C\'est assez urgent, l\'eau coule beaucoup.', time: '09:12', type: 'received', status: 'read' },
                { id: 3, sender: 'Mariam Diallo', text: 'Problème urgent à résoudre', time: '09:15', type: 'received', status: 'unread' }
            ]
        },
        {
            id: 3,
            contact: 'ABC Electricité',
            type: 'Prestataire',
            subject: 'Intervention Cocody',
            lastMessage: 'Travaux terminés',
            date: '25/08/2025',
            time: '16:45',
            status: 'read',
            unreadCount: 0,
            avatar: 'AE',
            messages: [
                { id: 1, sender: 'ABC Electricité', text: 'Les travaux d\'électricité sont terminés à la Villa Cocody.', time: '16:40', type: 'received', status: 'read' },
                { id: 2, sender: 'Vous', text: 'Parfait, merci pour votre intervention rapide.', time: '16:42', type: 'sent', status: 'read' },
                { id: 3, sender: 'ABC Electricité', text: 'Travaux terminés', time: '16:45', type: 'received', status: 'read' }
            ]
        },
        {
            id: 4,
            contact: 'Habipro Support',
            type: 'Assistance',
            subject: 'Compte propriétaire',
            lastMessage: 'Votre demande a été prise en charge',
            date: '20/08/2025',
            time: '11:20',
            status: 'read',
            unreadCount: 0,
            avatar: 'HS',
            messages: [
                { id: 1, sender: 'Vous', text: 'J\'ai besoin d\'aide pour configurer mon compte.', time: '10:50', type: 'sent', status: 'read' },
                { id: 2, sender: 'Habipro Support', text: 'Votre demande a été prise en charge', time: '11:20', type: 'received', status: 'read' }
            ]
        },
        {
            id: 5,
            contact: 'Aminata Bamba',
            type: 'Locataire',
            subject: 'Renouvellement contrat',
            lastMessage: 'Je souhaite renouveler mon bail',
            date: '15/08/2025',
            time: '13:00',
            status: 'read',
            unreadCount: 0,
            avatar: 'AB',
            messages: [
                { id: 1, sender: 'Aminata Bamba', text: 'Je souhaite renouveler mon bail', time: '13:00', type: 'received', status: 'read' }
            ]
        }
    ]);

    const aiSuggestions = [
        '✅ Merci pour votre paiement, bien reçu !',
        '🔧 J\'envoie un technicien aujourd\'hui pour résoudre ce problème.',
        '📅 Nous pouvons planifier un rendez-vous cette semaine, quel jour vous convient ?',
        '📄 Le renouvellement de votre contrat est en cours, vous recevrez les documents sous peu.'
    ];

    const typeColors = {
        'Locataire': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '👤' },
        'Prestataire': { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🛠️' },
        'Assistance': { bg: 'bg-green-100', text: 'text-green-800', icon: '💬' }
    };

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            conv.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || conv.type === filterType;
        const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleSendMessage = () => {
        if (messageText.trim() && selectedConversation) {
            const newMessage = {
                id: Date.now(),
                sender: 'Vous',
                text: messageText,
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                type: 'sent',
                status: 'sent'
            };

            setConversations(conversations.map(conv => {
                if (conv.id === selectedConversation.id) {
                    return {
                        ...conv,
                        messages: [...conv.messages, newMessage],
                        lastMessage: messageText,
                        time: newMessage.time
                    };
                }
                return conv;
            }));

            setMessageText('');
            setSelectedConversation({
                ...selectedConversation,
                messages: [...selectedConversation.messages, newMessage]
            });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
            setConversations(prev => prev.filter(c => c.id !== id));
            if (selectedConversation?.id === id) {
                setSelectedConversation(null);
            }
        }
    };

    const handleSelectConversation = (conv) => {
        setSelectedConversation(conv);
        // Marquer comme lu
        setConversations(conversations.map(c => 
            c.id === conv.id ? { ...c, status: 'read', unreadCount: 0 } : c
        ));
    };

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    return (
        <div className="h-screen bg-gray-50 p-4 flex flex-col">
            {/* En-tête */}
            <div className="mb-2">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">💬 Messagerie</h1>
                        <p className="text-gray-600 mt-1">
                            Centralisez et suivez toutes vos conversations avec vos locataires, prestataires et partenaires
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105">
                            <Plus size={20} />
                            Nouveau message
                        </button>
                    </div>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Conversations</p>
                                <p className="text-2xl font-bold text-gray-800">{conversations.length}</p>
                            </div>
                            <MessageCircle className="text-blue-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Non lus</p>
                                <p className="text-2xl font-bold text-gray-800">{totalUnread}</p>
                            </div>
                            <Mail className="text-orange-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Locataires</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {conversations.filter(c => c.type === 'Locataire').length}
                                </p>
                            </div>
                            <Users className="text-purple-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Prestataires</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {conversations.filter(c => c.type === 'Prestataire').length}
                                </p>
                            </div>
                            <Home className="text-green-500" size={32} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Interface de messagerie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
                {/* Liste des conversations - Colonne gauche */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow-md flex flex-col min-h-0">
                    {/* Barre de recherche et filtres */}
                    <div className="p-4 border-b bg-gray-50">
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher un contact..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`w-full px-4 py-2 border rounded-md flex items-center justify-center gap-2 transition-colors ${
                                showFilters ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <Filter size={18} />
                            Filtres
                        </button>

                        {showFilters && (
                            <div className="mt-3 space-y-2">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">Tous les types</option>
                                    <option value="Locataire">Locataires</option>
                                    <option value="Prestataire">Prestataires</option>
                                    <option value="Assistance">Assistance</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="unread">Non lus</option>
                                    <option value="read">Lus</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Liste des conversations */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv)}
                                className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                                    selectedConversation?.id === conv.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                                } ${conv.status === 'unread' ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-12 h-12 rounded-full ${
                                        conv.status === 'unread' ? 'bg-blue-500' : 'bg-gray-400'
                                    } flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                        {conv.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-semibold text-gray-800 truncate ${
                                                conv.status === 'unread' ? 'text-blue-600' : ''
                                            }`}>
                                                {conv.contact}
                                            </h3>
                                            <span className="text-xs text-gray-500">{conv.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                typeColors[conv.type].bg
                                            } ${typeColors[conv.type].text}`}>
                                                {typeColors[conv.type].icon} {conv.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{conv.subject}</p>
                                        <p className={`text-sm text-gray-500 truncate mt-1 ${
                                            conv.status === 'unread' ? 'font-semibold text-blue-600' : ''
                                        }`}>
                                            {conv.lastMessage}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="inline-block mt-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                {conv.unreadCount} nouveau{conv.unreadCount > 1 ? 'x' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredConversations.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>Aucune conversation trouvée</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Zone de conversation - Colonnes droites */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col overflow-hidden min-h-0">
                    {selectedConversation ? (
                        <>
                            {/* En-tête de la conversation */}
                            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                        {selectedConversation.avatar}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{selectedConversation.contact}</h3>
                                        <p className="text-sm text-gray-600">{selectedConversation.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Télécharger la conversation">
                                        <Download size={20} className="text-gray-600" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Appeler">
                                        <Phone size={20} className="text-gray-600" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(selectedConversation.id)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors" 
                                        title="Supprimer"
                                    >
                                        <Trash2 size={20} className="text-red-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {selectedConversation.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] ${msg.type === 'sent' ? 'order-2' : 'order-1'}`}>
                                            <div className={`rounded-lg p-3 ${
                                                msg.type === 'sent'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-white text-gray-800 border border-gray-200'
                                            }`}>
                                                {msg.type === 'received' && (
                                                    <p className="text-xs font-semibold mb-1 text-gray-600">{msg.sender}</p>
                                                )}
                                                <p className="text-sm">{msg.text}</p>
                                                <div className={`flex items-center gap-2 mt-2 text-xs ${
                                                    msg.type === 'sent' ? 'text-white/80 justify-end' : 'text-gray-500'
                                                }`}>
                                                    <span>{msg.time}</span>
                                                    {msg.type === 'sent' && (
                                                        <>
                                                            {msg.status === 'read' ? (
                                                                <CheckCheck size={14} />
                                                            ) : msg.status === 'sent' ? (
                                                                <Check size={14} />
                                                            ) : (
                                                                <Clock size={14} />
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Assistant IA */}
                            {showAiAssistant && (
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="text-purple-600" size={20} />
                                        <span className="font-semibold text-gray-800">🤖 Réponses suggérées par l'IA</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {aiSuggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setMessageText(suggestion)}
                                                className="text-left p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all text-sm"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Zone de saisie */}
                            <div className="p-4 border-t bg-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        onClick={() => setShowAiAssistant(!showAiAssistant)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                            showAiAssistant
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        }`}
                                    >
                                        <Sparkles size={16} />
                                        Assistant IA
                                    </button>
                                </div>
                                <div className="flex items-end gap-2">
                                    <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Paperclip size={20} className="text-gray-600" />
                                    </button>
                                    <textarea
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Écrivez votre message..."
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                        rows="2"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <MessageCircle size={64} className="mx-auto mb-4" />
                                <p className="text-lg">Sélectionnez une conversation</p>
                                <p className="text-sm">pour commencer à échanger</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagerieIntelligente;