import React, { useState, useEffect, useMemo } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PaymentModal from "../ActionsRapides/PaymentModal";
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function PaiementsLocataire() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentsList, setPaymentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format devise
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(amount || 0);
    } catch {
      return `${amount || 0} FCFA`;
    }
  };

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    loadPaymentStatus();
    loadPaymentsList();
  }, []);

const loadPaymentStatus = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const resp = await axios.get(`${API_BASE_URL}/payments/payment-status/`, {
      headers: { Authorization: `Token ${token}` }
    });
    setPaymentData(resp.data || null);
    
    // 🔥 LOGS DE DÉBOGAGE
    console.log('📊 API Response complète:', resp.data);
    console.log('📅 payment_history:', resp.data?.payment_history);
    
  } catch (e) {
    console.error('Erreur lors du chargement des paiements:', e);
  } finally {
    setLoading(false);
  }
};

  const loadPaymentsList = async () => {
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.get(`${API_BASE_URL}/payments/`, {
        headers: { Authorization: `Token ${token}` }
      });
      const rows = Array.isArray(resp.data?.results) ? resp.data.results
                  : (Array.isArray(resp.data) ? resp.data : []);
      setPaymentsList(rows);
      // console.log('payments list', rows);
    } catch (e) {
      console.error('Erreur liste paiements:', e);
    }
  };

  // Données agrégées pour cartes/alertes
  const paymentHistory = useMemo(() => {
    const list = paymentData?.payment_history || [];
    return list.map((p, idx) => ({
      id: p.id || idx,
      month: p.month,                 // "Novembre 2025"
      amount: Number(p.amount || 0),
      date: p.date || null,           // "04/10/2025" ou null
      method: p.method || '-',        // "Orange Money" etc.
      status: p.status === 'paid' ? 'paid' : 'unpaid',
      property: p.property || '',
      transaction_ref: p.transaction_ref || null
    }));
  }, [paymentData]);

  // Graphe robuste 12 mois
  const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const chartData = useMemo(() => {
  const hist = Array.isArray(paymentHistory) ? paymentHistory : [];
  
  console.log('🔍 paymentHistory dans chartData:', hist);
  
  if (hist.length === 0) {
    console.log('⚠️ Aucune donnée dans paymentHistory');
    return monthLabels.map(m => ({ month: m, amount: 0 }));
  }
  
  // Mapping robuste des mois français complets → abréviations
  const monthMapping = {
    'Janvier': 'Jan',
    'Février': 'Fév',
    'Mars': 'Mar',
    'Avril': 'Avr',
    'Mai': 'Mai',
    'Juin': 'Jun',
    'Juillet': 'Jul',
    'Août': 'Aoû',
    'Septembre': 'Sep',
    'Octobre': 'Oct',
    'Novembre': 'Nov',
    'Décembre': 'Déc'
  };
  
  const byMonth = {};
  
  hist.forEach(p => {
    const monthStr = p.month || '';
    console.log(`📌 Traitement de: "${monthStr}"`);
    
    // Extraire le nom du mois (ex: "Novembre 2025" → "Novembre")
    const monthName = monthStr.split(' ')[0];
    
    // Convertir en abréviation
    const label = monthMapping[monthName] || monthStr.slice(0, 3);
    
    console.log(`   → Mois extrait: "${monthName}" → Label final: "${label}"`);
    
    byMonth[label] = (byMonth[label] || 0) + (p.amount || 0);
  });
  
  console.log('💰 Données agrégées par mois:', byMonth);
  
  const result = monthLabels.map(m => ({ 
    month: m, 
    amount: byMonth[m] || 0 
  }));
  
  console.log('📈 chartData final envoyé au graphique:', result);
  
  return result;
}, [paymentHistory]);
  const totalPaid = useMemo(() => Number(paymentData?.total_paid || 0), [paymentData]);
  const totalDue = useMemo(() => Number(paymentData?.total_due || 0), [paymentData]);
  const collectionRate = useMemo(() => {
    const paid = Number(paymentData?.paid_count || 0);
    const total = Number((paymentData?.paid_count || 0) + (paymentData?.unpaid_count || 0));
    if (!total) return '0%';
    return `${Math.round((paid / total) * 100)}%`;
  }, [paymentData]);

  const tenantSummary = useMemo(() => {
    const c = paymentData?.contract_info || {};
    return {
      property: c.property || '—',
      address: c.address || '—',
      rentAmount: Number(c.rent_amount || 0),
      nextPaymentDate: paymentData?.next_payment_date || '—',
      paymentStatus: paymentData?.global_status || '—',
      totalDue: totalDue,
      daysUntilDue: paymentData?.days_until_due ?? '—'
    };
  }, [paymentData, totalDue]);

  // Liste réelle pour le tableau "Paiements récents"
  const filteredPayments = useMemo(() => {
    const rows = (paymentsList || []).map(p => ({
      id: p.id,
      month: p.payment_month, // ex: "Novembre 2025" (CharField)
      amount: Number(p.amount || 0),
      date: p.payment_date ? new Date(p.payment_date).toLocaleDateString('fr-FR') : '—',
      method: p.payment_method || '—',
      status: p.status === 'completed' ? 'paid' : 'unpaid',
    }));
    if (selectedStatus === 'all') return rows;
    return rows.filter(r => (selectedStatus === 'paid' ? r.status === 'paid' : r.status === 'unpaid'));
  }, [paymentsList, selectedStatus]);

  const handleDownloadReceipt = (paymentId) => {
    if (!paymentId) return;
    window.open(`${API_BASE_URL}/payments/${paymentId}/receipt/`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-sm text-gray-600">Chargement des paiements…</div>
      </div>
    );
  }

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

        {/* Résumé financier */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Logement</div>
            <div className="text-sm font-bold text-gray-900 mb-0.5">{tenantSummary.property}</div>
            <div className="text-xs text-gray-600">{tenantSummary.address}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Loyer mensuel</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(tenantSummary.rentAmount)}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Prochain paiement</div>
            <div className="text-lg font-bold text-gray-900">{tenantSummary.nextPaymentDate}</div>
            <div className="text-xs text-amber-600 mt-1">⏰ Dans {tenantSummary.daysUntilDue} jours</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Statut</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${paymentData?.status_color === 'green' ? 'bg-green-500' : paymentData?.status_color === 'orange' ? 'bg-orange-500' : 'bg-red-500'} animate-pulse`}></div>
              <div className={`text-lg font-bold ${paymentData?.status_color === 'green' ? 'text-green-600' : paymentData?.status_color === 'orange' ? 'text-orange-600' : 'text-red-600'}`}>
                {tenantSummary.paymentStatus}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold mb-1">Solde dû</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(tenantSummary.totalDue)}</div>
            <div className="text-xs text-green-600 mt-1">📈 Taux de régularité: {collectionRate}</div>
          </div>
        </div>

        {/* Alertes */}
        {paymentHistory.some(p => p.status === 'paid') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-xl">🟢</div>
                <div>
                  <div className="font-bold text-green-700">Merci ! Un paiement a bien été reçu récemment.</div>
                  <div className="text-sm text-green-600">
                    {(() => {
                      const last = paymentHistory.find(p => p.status === 'paid');
                      return last ? `${last.month} - ${formatCurrency(last.amount)} - Confirmé ${last.date || ''}` : '';
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-xl">🔔</div>
                <div>
                  <div className="font-bold text-blue-700">Votre prochain paiement approche.</div>
                  <div className="text-sm text-blue-600">{tenantSummary.nextPaymentDate} - {formatCurrency(tenantSummary.rentAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium" disabled>
                    Annuel
                  </button>
                </div>
              </div>

              {chartData.every(d => d.amount === 0) && (
                <div className="text-xs text-gray-500 mb-2">Aucune donnée de paiement à afficher.</div>
              )}

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
                    <button
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                      onClick={() => window.print()}
                    >
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
                      <tr key={`${payment.month}-${payment.id}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-xs font-medium text-gray-900">{payment.month}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-gray-900">{formatCurrency(payment.amount)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600">{payment.date || '—'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600">{payment.method}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {payment.status === 'paid' ? '✅ Payé' : '❌ Non payé'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className={`text-blue-500 font-semibold hover:text-blue-700 text-xs ${payment.status !== 'paid' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => payment.status === 'paid' && handleDownloadReceipt(payment.id)}
                            disabled={payment.status !== 'paid'}
                            title={payment.status !== 'paid' ? 'Reçu indisponible' : 'Télécharger la quittance'}
                          >
                            📥 Télécharger
                          </button>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2 2z" />
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
                    <span className="text-sm font-semibold text-emerald-600">{collectionRate}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: collectionRate }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total payé</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Méthode préférée</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {(() => {
                        const paid = paymentHistory.filter(p => p.status === 'paid');
                        if (paid.length === 0) return '—';
                        return paid[0].method || '—';
                      })()}
                    </span>
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
                    {totalDue === 0 ? 'Votre historique montre une régularité excellente. Bravo pour votre ponctualité !' : 'Il reste des paiements en attente. Pensez à régulariser pour éviter des pénalités.'}
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
        tenantData={{
          property: tenantSummary.property,
          address: tenantSummary.address,
          rentAmount: tenantSummary.rentAmount,
          nextPaymentDate: tenantSummary.nextPaymentDate,
          paymentStatus: tenantSummary.paymentStatus,
          totalDue: tenantSummary.totalDue,
          daysUntilDue: tenantSummary.daysUntilDue
        }}
        formatCurrency={formatCurrency}
        onPaymentCreated={() => {
          loadPaymentStatus();
          loadPaymentsList();
        }}
      />
    </div>
  );
}
