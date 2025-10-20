import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Eye, Edit, Trash2, DollarSign, Wrench, FileText, MessageCircle, Bell, Clock, MapPin, X, Check, AlertCircle, Home, Zap } from 'lucide-react';

export default function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Novembre 2025
  const [view, setView] = useState('month'); // day, week, month
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [filters, setFilters] = useState({
    payment: true,
    maintenance: true,
    contract: true,
    meeting: true,
    admin: true
  });
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Événements exemples
  const events = [
    {
      id: 1,
      date: new Date(2025, 10, 5),
      type: 'payment',
      title: 'Paiement loyer – Studio Cocody',
      amount: '300 000 FCFA',
      status: 'pending',
      property: 'Studio Cocody',
      paymentMethod: 'Mobile Money',
      icon: DollarSign
    },
    {
      id: 2,
      date: new Date(2025, 10, 7),
      type: 'maintenance',
      title: 'Réparation plomberie',
      status: 'in-progress',
      property: 'Studio Cocody',
      description: 'Fuite d\'eau dans la salle de bain',
      icon: Wrench
    },
    {
      id: 3,
      date: new Date(2025, 10, 10),
      type: 'meeting',
      title: 'Visite de bien avec prestataire',
      status: 'confirmed',
      property: 'Villa Bingerville',
      time: '14:00',
      icon: MessageCircle
    },
    {
      id: 4,
      date: new Date(2025, 10, 15),
      type: 'contract',
      title: 'Renouvellement de contrat',
      status: 'upcoming',
      property: 'Villa Bingerville',
      description: 'Contrat expire le 15/11/2025',
      icon: FileText
    },
    {
      id: 5,
      date: new Date(2025, 10, 20),
      type: 'admin',
      title: 'Attestation à renouveler',
      status: 'upcoming',
      property: 'Studio Cocody',
      icon: Bell
    },
    {
      id: 6,
      date: new Date(2025, 10, 12),
      type: 'payment',
      title: 'Paiement charges',
      amount: '50 000 FCFA',
      status: 'pending',
      property: 'Studio Cocody',
      icon: DollarSign
    }
  ];

  const eventTypes = {
    payment: { color: 'bg-green-100 text-green-700 border-green-300', label: '💰 Paiement', darkColor: 'bg-green-500' },
    maintenance: { color: 'bg-orange-100 text-orange-700 border-orange-300', label: '🛠️ Maintenance', darkColor: 'bg-orange-500' },
    contract: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: '📑 Contrat', darkColor: 'bg-blue-500' },
    meeting: { color: 'bg-purple-100 text-purple-700 border-purple-300', label: '🗣️ Rendez-vous', darkColor: 'bg-purple-500' },
    admin: { color: 'bg-gray-100 text-gray-700 border-gray-300', label: '🧾 Administratif', darkColor: 'bg-gray-500' }
  };

  const statusLabels = {
    pending: { label: '🟡 En attente', color: 'text-yellow-600' },
    'in-progress': { label: '🛠️ En cours', color: 'text-orange-600' },
    confirmed: { label: '🟢 Confirmé', color: 'text-green-600' },
    upcoming: { label: '🔔 À venir', color: 'text-blue-600' }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = event.date;
      const matchesDate = eventDate.getDate() === date.getDate() &&
                         eventDate.getMonth() === date.getMonth() &&
                         eventDate.getFullYear() === date.getFullYear();
      const matchesFilter = filters[event.type];
      const matchesProperty = propertyFilter === 'all' || event.property === propertyFilter;
      return matchesDate && matchesFilter && matchesProperty;
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(e => e.date >= now && filters[e.type] && (propertyFilter === 'all' || e.property === propertyFilter))
      .sort((a, b) => a.date - b.date)
      .slice(0, 5);
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const properties = ['all', 'Studio Cocody', 'Villa Bingerville'];

  const EventModal = ({ event, onClose }) => {
    if (!event) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className={`p-6 ${eventTypes[event.type].darkColor} text-white rounded-t-xl`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <event.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90">{eventTypes[event.type].label}</p>
                  <h3 className="font-bold text-lg mt-1">{event.title}</h3>
                </div>
              </div>
              <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{event.date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {event.time && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{event.time}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{event.property}</span>
            </div>

            {event.amount && (
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-900">{event.amount}</span>
              </div>
            )}

            {event.paymentMethod && (
              <div className="flex items-center gap-3">
                <span className="text-gray-500">💳 Mode :</span>
                <span className="text-gray-700">{event.paymentMethod}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-gray-500">🔔 Statut :</span>
              <span className={statusLabels[event.status].color + ' font-medium'}>{statusLabels[event.status].label}</span>
            </div>

            {event.description && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            )}

            {event.type === 'payment' && event.status === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">🧠 Suggestion IA Premium</p>
                  <p className="text-xs text-blue-700 mt-1">Souhaitez-vous programmer un rappel automatique pour le mois prochain ?</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 pt-0 space-y-3">
            {event.type === 'payment' && event.status === 'pending' && (
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payer maintenant
              </button>
            )}
            
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendrier des échéances</h1>
              <p className="text-gray-600 text-sm">Gérez vos paiements, maintenances et rendez-vous</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendrier principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Contrôles */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowAddEvent(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.entries(eventTypes).map(([key, { label, color }]) => (
                    <button
                      key={key}
                      onClick={() => setFilters(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filters[key] 
                          ? color + ' border'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Filtre par propriété */}
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">🏠 Toutes les propriétés</option>
                  {properties.slice(1).map(prop => (
                    <option key={prop} value={prop}>{prop}</option>
                  ))}
                </select>
              </div>

              {/* Grille calendrier */}
              <div className="p-6">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(currentDate).map((date, index) => {
                    const dayEvents = date ? getEventsForDate(date) : [];
                    const isToday = date && date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-2 rounded-lg border transition-all ${
                          date 
                            ? isToday
                              ? 'bg-blue-50 border-blue-300 shadow-sm'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            : 'bg-transparent border-transparent'
                        }`}
                      >
                        {date && (
                          <>
                            <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map(event => (
                                <button
                                  key={event.id}
                                  onClick={() => setSelectedEvent(event)}
                                  className={`w-full text-left px-2 py-1 rounded text-xs font-medium ${eventTypes[event.type].color} border hover:shadow-sm transition-all`}
                                >
                                  {event.title.substring(0, 15)}...
                                </button>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500 px-2">+{dayEvents.length - 2}</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Légende */}
            <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Légende des événements</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(eventTypes).map(([key, { label, darkColor }]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${darkColor}`} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Prochains événements */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Prochains événements</h3>
              </div>

              <div className="space-y-3">
                {getUpcomingEvents().map(event => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full p-4 rounded-lg border ${eventTypes[event.type].color} hover:shadow-md transition-all text-left`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${eventTypes[event.type].darkColor} flex items-center justify-center flex-shrink-0`}>
                        <event.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className={`text-xs mt-1 ${statusLabels[event.status].color} font-medium`}>
                          {statusLabels[event.status].label}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Alerte IA */}
              <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-orange-900">🧠 Alerte IA Premium</p>
                    <p className="text-xs text-orange-700 mt-1">Votre paiement de loyer approche dans 3 jours. Rappel automatique activé.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      
      {/* Bouton flottant mobile */}
      <button className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all animate-pulse">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}