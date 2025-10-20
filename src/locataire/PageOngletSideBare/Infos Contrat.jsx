import React, { useState } from 'react';
import { FileText, Calendar, Home, User, DollarSign, Clock, AlertCircle, CheckCircle, Download, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';

export default function InfosContrat() {
  const [activeTab, setActiveTab] = useState('general');

  // Données du contrat
  const contractData = {
    contractNumber: 'LOC-2025-001234',
    property: 'Résidence Les Palmiers - Apt 302',
    address: 'Cocody, Abidjan, Côte d\'Ivoire',
    startDate: '01/10/2025',
    endDate: '30/09/2026',
    duration: '12 mois',
    renewalDate: '01/08/2026',
    monthlyRent: 350000,
    charges: 25000,
    deposit: 700000,
    status: 'active',
    type: 'Habitation principale',
    surface: '75 m²',
    rooms: '3 pièces',
    furnished: 'Non meublé',

    // Propriétaire
    landlord: {
      name: 'Ahmed Bakayoko',
      phone: '+225 07 12 34 56 78',
      email: 'ahmed.bakayoko@email.com',
      address: 'Marcory, Abidjan'
    },

    // Locataire
    tenant: {
      name: 'Konan Patrick',
      phone: '+225 07 89 45 12 34',
      email: 'konan.patrick@email.com',
      profession: 'Ingénieur Informatique',
      employer: 'Tech Solutions CI'
    },

    // Conditions
    conditions: [
      'Le loyer est payable le 5 de chaque mois',
      'Les charges comprennent : eau, électricité commune, entretien',
      'Animaux non autorisés',
      'Sous-location interdite',
      'Travaux nécessitant l\'accord du propriétaire',
      'État des lieux obligatoire entrée/sortie'
    ],

    // Clauses particulières
    specialClauses: [
      'Option de renouvellement automatique si notification 3 mois avant échéance',
      'Révision du loyer selon indice de référence des loyers (IRL)',
      'Préavis de départ : 3 mois'
    ]
  };

  const tabs = [
    { id: 'general', label: 'Informations générales', icon: FileText },
    { id: 'parties', label: 'Parties au contrat', icon: User },
    { id: 'financial', label: 'Conditions financières', icon: DollarSign },
    { id: 'clauses', label: 'Clauses & Conditions', icon: AlertCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                Informations du Contrat
              </h1>
              <p className="text-gray-600 mt-2 ml-15">Détails complets de votre contrat de location</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Télécharger PDF
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contacter propriétaire
              </button>
            </div>
          </div>

          {/* Statut du contrat */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-gray-900">Statut :</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-300">
                    ✅ Actif
                  </span>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <span className="text-sm text-gray-600">Numéro de contrat : </span>
                  <span className="font-semibold text-gray-900">{contractData.contractNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Échéance : </span>
                <span className="font-semibold text-gray-900">{contractData.endDate}</span>
                <span className="text-yellow-600 font-medium ml-2">⏰ Dans 11 mois</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des tabs */}
        <div className="space-y-6">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations du bien */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Informations du bien
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Propriété :</span>
                    <span className="font-semibold text-gray-900">{contractData.property}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Adresse :</span>
                    <span className="font-semibold text-gray-900 text-right">{contractData.address}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Type :</span>
                    <span className="font-semibold text-gray-900">{contractData.type}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Surface :</span>
                    <span className="font-semibold text-gray-900">{contractData.surface}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Nombre de pièces :</span>
                    <span className="font-semibold text-gray-900">{contractData.rooms}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Meublé :</span>
                    <span className="font-semibold text-gray-900">{contractData.furnished}</span>
                  </div>
                </div>
              </div>

              {/* Durée du contrat */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Durée du contrat
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Date de début :</span>
                    <span className="font-semibold text-gray-900">{contractData.startDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Date de fin :</span>
                    <span className="font-semibold text-gray-900">{contractData.endDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Durée :</span>
                    <span className="font-semibold text-gray-900">{contractData.duration}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Date de renouvellement :</span>
                    <span className="font-semibold text-gray-900">{contractData.renewalDate}</span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Rappel de renouvellement</p>
                      <p className="text-xs text-blue-700 mt-1">Pensez à notifier votre décision 3 mois avant l&apos;échéance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parties' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Propriétaire */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Propriétaire
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                    <p className="font-semibold text-gray-900">{contractData.landlord.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-semibold text-gray-900">{contractData.landlord.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{contractData.landlord.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-semibold text-gray-900">{contractData.landlord.address}</p>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contacter le propriétaire
                  </button>
                </div>
              </div>

              {/* Locataire */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Locataire (Vous)
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                    <p className="font-semibold text-gray-900">{contractData.tenant.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-semibold text-gray-900">{contractData.tenant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{contractData.tenant.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Profession</p>
                    <p className="font-semibold text-gray-900">{contractData.tenant.profession}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Employeur</p>
                    <p className="font-semibold text-gray-900">{contractData.tenant.employer}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Conditions financières
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700 mb-2">Loyer mensuel</p>
                    <p className="text-3xl font-bold text-blue-900">{contractData.monthlyRent.toLocaleString()} FCFA</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700 mb-2">Charges mensuelles</p>
                    <p className="text-3xl font-bold text-green-900">{contractData.charges.toLocaleString()} FCFA</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <p className="text-sm text-purple-700 mb-2">Dépôt de garantie</p>
                    <p className="text-3xl font-bold text-purple-900">{contractData.deposit.toLocaleString()} FCFA</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Détails des paiements</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">💰 Loyer de base</span>
                      <span className="font-semibold text-gray-900">{contractData.monthlyRent.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">💡 Charges (eau, électricité commune)</span>
                      <span className="font-semibold text-gray-900">{contractData.charges.toLocaleString()} FCFA</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total mensuel</span>
                        <span className="font-bold text-lg text-blue-600">{(contractData.monthlyRent + contractData.charges).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clauses' && (
            <div className="space-y-6">
              {/* Conditions générales */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Conditions générales
                </h3>
                <ul className="space-y-3">
                  {contractData.conditions.map((condition, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clauses particulières */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Clauses particulières
                </h3>
                <ul className="space-y-3">
                  {contractData.specialClauses.map((clause, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="text-orange-600 mt-1">⚠️</span>
                      <span className="text-gray-700">{clause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actions disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
              <Download className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-semibold text-blue-900">Télécharger le contrat</p>
                <p className="text-xs text-blue-700">Format PDF</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
              <RefreshCw className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-semibold text-green-900">Demander renouvellement</p>
                <p className="text-xs text-green-700">Prolonger le bail</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200">
              <Mail className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <p className="font-semibold text-purple-900">Contacter le propriétaire</p>
                <p className="text-xs text-purple-700">Poser une question</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
