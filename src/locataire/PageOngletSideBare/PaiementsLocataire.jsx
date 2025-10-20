import React, { useState, useEffect } from 'react';
import { Plus, Download, Eye, MoreVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PaymentModal from "../ActionsRapides/PaymentModal";


export default function PaiementsLocataire() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Novembre 2025');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [autoPaymentEnabled, setAutoPaymentEnabled] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Données de paiement
  const tenantData = {
    property: 'Résidence Les Palmiers',
    address: 'Cocody - Abidjan',
    rentAmount: 250000,
    nextPaymentDate: '05/11/2025',
    paymentStatus: 'À jour',
    totalDue: 0,
    daysUntilDue: 5
  };

  const paymentHistory = [
    { month: 'Octobre 2025', amount: 250000, date: '04/10/2025', method: 'Orange Money', status: 'paid' },
    { month: 'Septembre 2025', amount: 250000, date: '03/09/2025', method: 'Carte bancaire', status: 'paid' },
    { month: 'Août 2025', amount: 250000, date: '01/08/2025', method: 'Mobile Money', status: 'paid' },
    { month: 'Juillet 2025', amount: 250000, date: '02/07/2025', method: 'Virement', status: 'paid' },
    { month: 'Juin 2025', amount: 250000, date: '03/06/2025', method: 'Orange Money', status: 'paid' },
    { month: 'Mai 2025', amount: 250000, date: '05/05/2025', method: 'Carte bancaire', status: 'paid' }
  ];

  const chartData = [
    { month: 'Jan', amount: 250000 },
    { month: 'Fév', amount: 250000 },
    { month: 'Mar', amount: 250000 },
    { month: 'Avr', amount: 250000 },
    { month: 'Mai', amount: 250000 },
    { month: 'Jun', amount: 250000 },
    { month: 'Jul', amount: 250000 },
    { month: 'Aoû', amount: 250000 },
    { month: 'Sep', amount: 250000 },
    { month: 'Oct', amount: 250000 },
    { month: 'Nov', amount: 0 },
    { month: 'Déc', amount: 0 }
  ];

  const totalPaid = paymentHistory.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = paymentHistory.length;
  const collectionRate = ((totalPayments / 12) * 100).toFixed(0);

  const handlePaymentSubmit = () => {
    if (selectedPaymentMethod) {
      setPaymentSuccess(true);
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setPaymentSuccess(false);
        setSelectedPaymentMethod('');
      }, 2000);
    }
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200';
  };

  const getStatusText = (status) => {
    return status === 'paid' ? 'Payé' : 'Non payé';
  };

  const filteredPayments = paymentHistory.filter(payment => {
    if (selectedStatus !== 'all' && payment.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className={`min-h-screen bg-gray-50 p-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paiements & Historique</h1>
            <p className="mt-1 text-sm text-gray-600">Consultez vos paiements récents, effectuez vos règlements en ligne et téléchargez vos quittances.</p>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-green-400 to-teal-400 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>💳</span> Payer mon loyer maintenant
          </button>
        </div>

        {/* Résumé financier - Cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Logement</div>
            <div className="text-sm font-bold text-gray-900 mb-0.5">{tenantData.property}</div>
            <div className="text-xs text-gray-600">{tenantData.address}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Loyer mensuel</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(tenantData.rentAmount)}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Prochain paiement</div>
            <div className="text-lg font-bold text-gray-900">{tenantData.nextPaymentDate}</div>
            <div className="text-xs text-amber-600 mt-1">⏰ Dans {tenantData.daysUntilDue} jours</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Statut</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-lg font-bold text-green-600">À jour</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Solde dû</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(tenantData.totalDue)}</div>
            <div className="text-xs text-green-600 mt-1">📈 Zéro impayé</div>
          </div>
        </div>

        {/* Alertes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-xl">🟢</div>
              <div>
                <div className="font-bold text-green-700">Merci ! Votre dernier paiement a bien été reçu.</div>
                <div className="text-sm text-green-600">Octobre 2025 - 250 000 FCFA - Confirmé le 04/10/2025</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-xl">🔔</div>
              <div>
                <div className="font-bold text-blue-700">Votre prochain paiement est dans 5 jours.</div>
                <div className="text-sm text-blue-600">05 Novembre 2025 - 250 000 FCFA</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section principale */}
          <div className="lg:col-span-2 space-y-6">

            {/* Graphique */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-gray-900">Évolution des paiements</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium">
                    Mensuel
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                    Annuel
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tableau historique */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Paiements récents</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{filteredPayments.length} paiement(s)</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      Télécharger tous
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mois</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date de paiement</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reçu</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.month} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-xs font-medium text-gray-900">{payment.month}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-gray-900">{formatCurrency(payment.amount)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600">{payment.date}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600">{payment.method}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md ${getStatusColor(payment.status)}`}>
                            ✅ {getStatusText(payment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-500 font-semibold hover:text-blue-700 text-xs">📥 Télécharger</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Actions rapides */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full text-sm flex items-center gap-3 p-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Payer maintenant
                </button>
                <button className="w-full text-sm flex items-center gap-3 p-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger quittance
                </button>
                <button className="w-full text-sm flex items-center gap-3 p-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contacter support
                </button>
              </div>
            </div>

            {/* Paramètres paiement */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Paramètres de paiement</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Paiement automatique</div>
                    <div className="text-xs text-gray-600">Chaque mois</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Alertes email/SMS</div>
                    <div className="text-xs text-gray-600">Avant l'échéance</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Taux de régularité</span>
                    <span className="text-sm font-semibold text-emerald-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total payé</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Méthode préférée</span>
                    <span className="text-sm font-semibold text-gray-900">Orange Money</span>
                  </div>
                </div>
              </div>
            </div>

            {/* IA Assistant */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
              <h3 className="text-base font-bold text-purple-900 mb-4">✨ Assistant IA</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="text-sm font-semibold text-gray-900 mb-1">💡 Conseil</div>
                  <div className="text-xs text-gray-600">
                    Votre historique montre une régularité de 100%. Bravo pour votre ponctualité !
                  </div>
                </div>
                <button className="w-full p-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors text-sm">
                  💬 Parler à l'assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        tenantData={tenantData}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}