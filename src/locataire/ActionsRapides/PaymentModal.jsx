// PaymentModal.jsx
import React, { useState } from 'react';

export default function PaymentModal({ isOpen, onClose, tenantData, formatCurrency }) {
  const [selectedMonth, setSelectedMonth] = useState('Novembre 2025');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [autoPaymentEnabled, setAutoPaymentEnabled] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentSubmit = () => {
    if (selectedPaymentMethod) {
      setPaymentSuccess(true);
      setTimeout(() => {
        onClose();
        setPaymentSuccess(false);
        setSelectedPaymentMethod('');
        setSelectedMonth('Novembre 2025');
        setAutoPaymentEnabled(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        
        {/* Header Gradient */}
        <div className="h-2 bg-gradient-to-r from-green-400 via-teal-400 to-blue-500"></div>

        <div className="p-8">
          {paymentSuccess ? (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Paiement réussi !</h3>
              <p className="text-gray-600 mb-1">Votre paiement de <span className="font-bold text-lg">{formatCurrency(tenantData.rentAmount)}</span> a été confirmé</p>
              <p className="text-sm text-gray-500">Un reçu PDF a été envoyé par email</p>
            </div>
          ) : (
            <div className="flex justify-between items-start gap-8">
              {/* Left Side - Forms */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Effectuer un paiement</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Mois et Montant - Inline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Mois concerné</label>
                      <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-sm"
                      >
                        <option>Novembre 2025</option>
                        <option>Décembre 2025</option>
                        <option>Janvier 2026</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Montant</label>
                      <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-100 rounded-lg">
                        <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                          {formatCurrency(tenantData.rentAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Mode de paiement</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: 'orange', label: 'Orange', icon: '🟠' },
                        { id: 'mtn', label: 'MTN', icon: '🟡' },
                        { id: 'moov', label: 'Moov', icon: '🔵' },
                        { id: 'card', label: 'Carte', icon: '💳' },
                        { id: 'transfer', label: 'Virement', icon: '🏦' }
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-2 rounded-lg border-2 transition-all text-center ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg mb-0.5">{method.icon}</div>
                          <div className="text-xs font-semibold text-gray-900">{method.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Paiement Automatique */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="autoPay"
                      checked={autoPaymentEnabled}
                      onChange={(e) => setAutoPaymentEnabled(e.target.checked)}
                      className="w-4 h-4 cursor-pointer rounded accent-blue-600"
                    />
                    <label htmlFor="autoPay" className="text-xs font-semibold text-gray-900 cursor-pointer">
                      Paiement automatique chaque mois
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Side - Info & Security */}
              <div className="w-64 space-y-4">
                {/* Récapitulatif */}
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-4 rounded-xl border-2 border-blue-100">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Récapitulatif</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loyer:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(tenantData.rentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mois:</span>
                      <span className="font-bold text-gray-900">{selectedMonth}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                        {formatCurrency(tenantData.rentAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sécurité */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" transform="scale(-1 1) translate(-20 0)" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-green-700">Sécurisé</p>
                    <p className="text-xs text-green-600">Données chiffrées</p>
                  </div>
                </div>

                {/* Logement */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Logement</p>
                  <p className="text-xs font-bold text-gray-900">{tenantData.property}</p>
                  <p className="text-xs text-gray-600">{tenantData.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons Footer */}
          {!paymentSuccess && (
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={!selectedPaymentMethod}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <span>🔐</span> Confirmer et payer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}