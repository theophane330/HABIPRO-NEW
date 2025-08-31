import React, { useState, useEffect } from 'react';

import { Search, Download, Plus, Eye, Edit, Trash2, Calendar, CreditCard, Smartphone, Banknote, FileText, Bell, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function Revenue({ 
  setIsPaymentModalOpen,
  formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('current_month');
  const [showCharts, setShowCharts] = useState(false);

  // Données d'exemple des paiements
  const [payments, setPayments] = useState([
    {
      id: 1,
      tenantName: "Jean Kouassi",
      property: "Villa 5p Cocody",
      amount: 500000,
      dueDate: "2025-08-01",
      paidDate: "2025-08-05",
      status: "paye",
      paymentMethod: "mobile_money",
      reference: "MM-2025-08-001",
      month: "2025-08"
    },
    {
      id: 2,
      tenantName: "Mariam Diallo",
      property: "Studio Yopougon",
      amount: 100000,
      dueDate: "2025-08-10",
      paidDate: null,
      status: "impaye",
      paymentMethod: null,
      reference: null,
      month: "2025-08"
    },
    {
      id: 3,
      tenantName: "Paul Adjoua",
      property: "Appartement Plateau",
      amount: 300000,
      dueDate: "2025-08-01",
      paidDate: null,
      status: "retard",
      paymentMethod: null,
      reference: null,
      month: "2025-08"
    },
    {
      id: 4,
      tenantName: "Awa Traoré",
      property: "Villa Riviera",
      amount: 750000,
      dueDate: "2025-07-20",
      paidDate: "2025-07-25",
      status: "paye",
      paymentMethod: "virement",
      reference: "VIR-2025-07-004",
      month: "2025-07"
    },
    {
      id: 5,
      tenantName: "Jean Kouassi",
      property: "Villa 5p Cocody",
      amount: 500000,
      dueDate: "2025-07-01",
      paidDate: "2025-07-01",
      status: "paye",
      paymentMethod: "especes",
      reference: "ESP-2025-07-005",
      month: "2025-07"
    },
    {
      id: 6,
      tenantName: "Mariam Diallo",
      property: "Studio Yopougon",
      amount: 100000,
      dueDate: "2025-07-10",
      paidDate: "2025-07-15",
      status: "paye",
      paymentMethod: "mobile_money",
      reference: "MM-2025-07-006",
      month: "2025-07"
    }
  ]);

  // Données pour les graphiques
  const monthlyRevenue = [
    { month: 'Mai', revenus: 1200000, objectif: 1500000 },
    { month: 'Juin', revenus: 1450000, objectif: 1500000 },
    { month: 'Juillet', revenus: 1350000, objectif: 1500000 },
    { month: 'Août', revenus: 500000, objectif: 1650000 }
  ];

  const paymentMethodStats = [
    { name: 'Mobile Money', value: 40, amount: 600000 },
    { name: 'Virement', value: 35, amount: 750000 },
    { name: 'Espèces', value: 25, amount: 500000 }
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  // Filtrer les paiements
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || payment.paymentMethod === paymentMethodFilter;
    
    // Filtre par date
    let matchesDate = true;
    if (dateFilter === 'current_month') {
      matchesDate = payment.month === '2025-08';
    } else if (dateFilter === 'last_month') {
      matchesDate = payment.month === '2025-07';
    }
    
    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDate;
  });

  // Calcul des KPIs
  const currentMonthPayments = payments.filter(p => p.month === '2025-08');
  const kpis = {
    totalPaid: currentMonthPayments.filter(p => p.status === 'paye').reduce((sum, p) => sum + p.amount, 0),
    totalUnpaid: currentMonthPayments.filter(p => p.status === 'impaye').reduce((sum, p) => sum + p.amount, 0),
    totalOverdue: currentMonthPayments.filter(p => p.status === 'retard').reduce((sum, p) => sum + p.amount, 0),
    nextMonthEstimate: 1650000
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paye':
        return { 
          label: '✅ Payé', 
          className: 'bg-green-100 text-green-600',
          icon: CheckCircle,
          color: 'text-green-600'
        };
      case 'impaye':
        return { 
          label: '❌ Impayé', 
          className: 'bg-red-100 text-red-600',
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      case 'retard':
        return { 
          label: '🟡 En retard', 
          className: 'bg-yellow-100 text-yellow-600',
          icon: Clock,
          color: 'text-yellow-600'
        };
      default:
        return { 
          label: 'Inconnu', 
          className: 'bg-gray-100 text-gray-600',
          icon: AlertTriangle,
          color: 'text-gray-600'
        };
    }
  };

  const getPaymentMethodConfig = (method) => {
    switch (method) {
      case 'mobile_money':
        return { label: 'Mobile Money', icon: Smartphone, className: 'text-orange-600' };
      case 'virement':
        return { label: 'Virement', icon: CreditCard, className: 'text-blue-600' };
      case 'especes':
        return { label: 'Espèces', icon: Banknote, className: 'text-green-600' };
      default:
        return { label: '-', icon: CreditCard, className: 'text-gray-400' };
    }
  };

  const handlePaymentAction = (action, payment) => {
    switch (action) {
      case 'view':
        alert(`Voir détails du paiement: ${payment.reference || payment.tenantName}`);
        break;
      case 'edit':
        alert(`Modifier paiement: ${payment.tenantName}`);
        break;
      case 'delete':
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ce paiement ?`)) {
          setPayments(payments.filter(p => p.id !== payment.id));
        }
        break;
      case 'receipt':
        alert(`Génération du reçu pour: ${payment.tenantName}`);
        break;
      case 'reminder':
        alert(`Rappel de paiement envoyé à: ${payment.tenantName}`);
        break;
      default:
        break;
    }
  };

  const exportData = () => {
    alert('Exportation des données en cours...');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateDaysLate = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    return Math.floor((now - due) / (1000 * 60 * 60 * 24));
  };

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);


    return (
        // <div className="flex-1 flex p-4 gap-4 overflow-y-auto">
        <div className={`
  flex-1 flex p-4 gap-4 overflow-y-auto
  transform transition-all duration-700 ease-out
  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
`}>
    <div className="flex-1">
        {/* En-tête avec titre et boutons */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenus & Paiements</h1>
            <p className="text-gray-600 text-sm mt-1">Suivez tous vos revenus et paiements</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
            >
              <TrendingUp size={18} />
              {showCharts ? 'Masquer' : 'Graphiques'}
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
            >
              <Download size={18} />
              Exporter
            </button>
            <button
              onClick={() => setIsPaymentModalOpen && setIsPaymentModalOpen(true)}
              className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
            >
              <Plus size={20} />
              Ajouter un paiement
            </button>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center text-white">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalPaid)}</div>
                <div className="text-sm text-gray-600">Payé ce mois</div>
                <div className="text-xs text-green-600 font-semibold">
                  ✅ {currentMonthPayments.filter(p => p.status === 'paye').length} paiement(s)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalUnpaid)}</div>
                <div className="text-sm text-gray-600">Impayés</div>
                <div className="text-xs text-red-600 font-semibold">
                  ❌ {currentMonthPayments.filter(p => p.status === 'impaye').length} en attente
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalOverdue)}</div>
                <div className="text-sm text-gray-600">En retard</div>
                <div className="text-xs text-yellow-600 font-semibold">
                  🟡 {currentMonthPayments.filter(p => p.status === 'retard').length} retard(s)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.nextMonthEstimate)}</div>
                <div className="text-sm text-gray-600">Estimé mois prochain</div>
                <div className="text-xs text-blue-600 font-semibold">
                  📈 Prévision septembre
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques (conditionnels) */}
        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Évolution des revenus</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line 
                    type="monotone" 
                    dataKey="revenus" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Revenus"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="objectif" 
                    stroke="#64748b" 
                    strokeDasharray="5 5"
                    name="Objectif"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Modes de paiement</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {paymentMethodStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher locataire, propriété..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="paye">Payé</option>
              <option value="impaye">Impayé</option>
              <option value="retard">En retard</option>
            </select>

            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
            >
              <option value="all">Tous les modes</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="virement">Virement</option>
              <option value="especes">Espèces</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
            >
              <option value="current_month">Mois actuel</option>
              <option value="last_month">Mois dernier</option>
              <option value="all">Tous les mois</option>
            </select>
          </div>
        </div>

        {/* Tableau des paiements */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Locataire</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Propriété</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Montant</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Date échéance</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Date paiement</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Statut</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Mode paiement</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const statusConfig = getStatusConfig(payment.status);
                  const paymentMethodConfig = getPaymentMethodConfig(payment.paymentMethod);
                  const daysLate = calculateDaysLate(payment.dueDate);
                  const isOverdue = payment.status === 'retard' || (payment.status === 'impaye' && daysLate > 0);
                  
                  return (
                    <tr key={payment.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">{payment.tenantName}</div>
                        {payment.reference && (
                          <div className="text-sm text-gray-500">Réf: {payment.reference}</div>
                        )}
                      </td>
                      
                      <td className="py-4 px-4 text-gray-600">{payment.property}</td>
                      
                      <td className="py-4 px-4">
                        <div className="font-semibold text-green-600">{formatCurrency(payment.amount)}</div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(payment.dueDate)}
                        </div>
                        {isOverdue && daysLate > 0 && (
                          <div className="text-xs text-red-600 font-medium">
                            {daysLate} jour(s) de retard
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-4 text-gray-600">{formatDate(payment.paidDate)}</td>
                      
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        {payment.paymentMethod && (
                          <div className={`flex items-center gap-2 ${paymentMethodConfig.className}`}>
                            <paymentMethodConfig.icon size={16} />
                            <span className="text-sm font-medium">{paymentMethodConfig.label}</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePaymentAction('view', payment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye size={16} />
                          </button>
                          
                          <button
                            onClick={() => handlePaymentAction('edit', payment)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button
                            onClick={() => handlePaymentAction('delete', payment)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          {payment.status === 'paye' && (
                            <button
                              onClick={() => handlePaymentAction('receipt', payment)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Générer reçu"
                            >
                              <FileText size={16} />
                            </button>
                          )}
                          
                          {(payment.status === 'impaye' || payment.status === 'retard') && (
                            <button
                              onClick={() => handlePaymentAction('reminder', payment)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Envoyer rappel"
                            >
                              <Bell size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun paiement trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || paymentMethodFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Commencez par enregistrer un paiement'
              }
            </p>
            <button
              onClick={() => setIsPaymentModalOpen && setIsPaymentModalOpen(true)}
              className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
            >
              Ajouter un paiement
            </button>
          </div>
        )}

        {/* Alertes importantes */}
        {kpis.totalUnpaid > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              <div>
                <h3 className="font-semibold text-red-900">
                  ⚠️ Attention: {formatCurrency(kpis.totalUnpaid)} d'impayés ce mois
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  Contactez les locataires concernés pour régulariser la situation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}