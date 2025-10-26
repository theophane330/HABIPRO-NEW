// PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PaymentModal({ isOpen, onClose, formatCurrency }) {
  const [selectedMonth, setSelectedMonth] = useState('Novembre 2025');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [autoPaymentEnabled, setAutoPaymentEnabled] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);

  // Charger tous les contrats actifs du locataire
  useEffect(() => {
    const loadContracts = async () => {
      if (isOpen) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://127.0.0.1:8000/api/contracts/', {
            headers: { 'Authorization': `Token ${token}` }
          });

          // Récupérer tous les contrats actifs
          // L'API retourne un format paginé: {count, next, previous, results}
          const contractsData = response.data.results || response.data;
          const activeContracts = contractsData.filter(c => c.status === 'active');
          console.log('[DEBUG] Réponse API complète:', response.data);
          console.log('[DEBUG] Contrats actifs récupérés:', activeContracts);

          if (activeContracts.length > 0) {
            const formattedContracts = activeContracts.map(contract => ({
              id: contract.id,
              tenantId: contract.tenant,
              propertyId: contract.property,
              locationId: contract.location,
              rentAmount: parseFloat(contract.amount),
              property: contract.property_title || 'Non spécifié',
              address: contract.property_address || 'Non spécifié',
              ownerName: contract.owner_name || 'Non spécifié',
              startDate: contract.start_date,
              endDate: contract.end_date
            }));

            setContracts(formattedContracts);

            // Sélectionner le premier contrat par défaut
            setSelectedContractId(formattedContracts[0].id.toString());
            setSelectedContract(formattedContracts[0]);
          }
        } catch (err) {
          console.error('Erreur lors du chargement des contrats:', err);
          setError('Impossible de charger vos contrats');
        }
      }
    };

    loadContracts();
  }, [isOpen]);

  // Mettre à jour le contrat sélectionné quand l'ID change
  useEffect(() => {
    if (selectedContractId && contracts.length > 0) {
      const contract = contracts.find(c => c.id.toString() === selectedContractId);
      setSelectedContract(contract);
      console.log('[DEBUG] Contrat sélectionné:', contract);
    }
  }, [selectedContractId, contracts]);

  const handlePaymentSubmit = async () => {
    if (!selectedPaymentMethod) {
      setError('Veuillez sélectionner un mode de paiement');
      return;
    }

    if (!selectedContract) {
      setError('Veuillez sélectionner un contrat');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Vérifier d'abord s'il existe déjà un paiement pour ce mois
      const paymentsResponse = await axios.get('http://127.0.0.1:8000/api/payments/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      const paymentsData = paymentsResponse.data.results || paymentsResponse.data;
      const existingPayment = paymentsData.find(
        p => p.payment_month === selectedMonth &&
             p.property === selectedContract.propertyId &&
             p.status === 'completed'
      );

      if (existingPayment) {
        setError(`Un paiement pour le mois de ${selectedMonth} a déjà été effectué pour cette propriété.`);
        setLoading(false);
        return;
      }

      // Préparer les données du paiement à partir du contrat sélectionné
      const paymentData = {
        tenant: selectedContract.tenantId,
        property: selectedContract.propertyId,
        location: selectedContract.locationId || null,
        amount: selectedContract.rentAmount,
        payment_month: selectedMonth,
        payment_method: selectedPaymentMethod,
        auto_payment_enabled: autoPaymentEnabled,
        status: 'completed'
      };

      console.log('Données du paiement envoyées:', paymentData);
      console.log('Contrat sélectionné pour le paiement:', selectedContract);

      const response = await axios.post(
        'http://127.0.0.1:8000/api/payments/',
        paymentData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Sauvegarder la référence de transaction
      setTransactionRef(response.data.transaction_reference);
      setPaymentSuccess(true);

      setTimeout(() => {
        onClose();
        setPaymentSuccess(false);
        setSelectedPaymentMethod('');
        setSelectedMonth('Novembre 2025');
        setAutoPaymentEnabled(false);
        setTransactionRef('');
      }, 3000);
    } catch (err) {
      console.error('Erreur lors du paiement:', err);

      // Gérer les erreurs de validation du backend
      if (err.response?.data?.payment_month) {
        setError(err.response.data.payment_month);
      } else {
        setError(
          err.response?.data?.detail ||
          'Une erreur est survenue lors du paiement. Veuillez réessayer.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Si les contrats ne sont pas encore chargés
  if (contracts.length === 0 && !error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos contrats...</p>
        </div>
      </div>
    );
  }

  // Si aucun contrat actif n'est trouvé
  if (contracts.length === 0 && error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun contrat actif</h3>
          <p className="text-gray-600 mb-4">Vous n'avez aucun contrat actif pour effectuer un paiement.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

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
              <p className="text-gray-600 mb-1">Votre paiement de <span className="font-bold text-lg">{selectedContract ? formatCurrency(selectedContract.rentAmount) : '0 XOF'}</span> a été confirmé</p>
              {transactionRef && (
                <p className="text-sm text-gray-500 mb-1">Référence: <span className="font-mono font-semibold">{transactionRef}</span></p>
              )}
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
                  {/* Sélection du contrat */}
                  {contracts.length > 1 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        📋 Sélectionnez le contrat à payer
                      </label>
                      <select
                        value={selectedContractId}
                        onChange={(e) => setSelectedContractId(e.target.value)}
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-sm bg-white"
                      >
                        {contracts.map((contract) => (
                          <option key={contract.id} value={contract.id}>
                            🏠 {contract.property} - {contract.address} ({formatCurrency(contract.rentAmount)}/mois) - Propriétaire: {contract.ownerName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Si un seul contrat, afficher les infos */}
                  {contracts.length === 1 && selectedContract && (
                    <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-xl border-2 border-blue-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                          🏠
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Contrat de location</p>
                          <p className="text-sm font-bold text-gray-900">{selectedContract.property}</p>
                          <p className="text-xs text-gray-600">{selectedContract.address}</p>
                          <p className="text-xs text-gray-600 mt-1">Propriétaire: {selectedContract.ownerName}</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                          {selectedContract ? formatCurrency(selectedContract.rentAmount) : '0 XOF'}
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

                  {/* Message d'erreur */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  )}
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
                      <span className="font-bold text-gray-900">
                        {selectedContract ? formatCurrency(selectedContract.rentAmount) : '0 XOF'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mois:</span>
                      <span className="font-bold text-gray-900">{selectedMonth}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                        {selectedContract ? formatCurrency(selectedContract.rentAmount) : '0 XOF'}
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
                {selectedContract && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Logement</p>
                    <p className="text-xs font-bold text-gray-900">{selectedContract.property}</p>
                    <p className="text-xs text-gray-600">{selectedContract.address}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-semibold">Propriétaire:</span> {selectedContract.ownerName}
                    </p>
                  </div>
                )}
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
                disabled={!selectedPaymentMethod || loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <span>🔐</span> Confirmer et payer
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}