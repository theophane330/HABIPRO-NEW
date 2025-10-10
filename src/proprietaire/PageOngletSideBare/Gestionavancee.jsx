import React, { useState, useEffect } from 'react';
import { X, Zap, FileText, Calendar, Brain, BarChart3, TrendingUp, DollarSign, Download, Calculator, Landmark, Shield, Users, Database, FileSignature, CalendarDays, Wrench, AlertTriangle, Lock, Check, Save, Rocket, Bell, Mail, RefreshCw, PieChart } from 'lucide-react';

export default function GestionAvancee() {
  // Styles pour la mise en page
  const containerStyle = "h-screen flex flex-col overflow-hidden bg-gray-50";
  const headerStyle = "bg-white border-b border-gray-200 p-4 shadow-sm";
  const contentStyle = "flex-1 overflow-hidden flex flex-col min-h-0 p-4";
  const mainContentStyle = "flex-1 bg-white rounded-lg shadow-sm overflow-auto";

  // États
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    rappelsAuto: false,
    quittancesAuto: false,
    renouvellementBail: false,
    suggestionsIA: false,
    rapportsMensuels: false,
    previsionIA: false,
    tableauPerformance: false,
    suiviPaiements: false,
    exportComptable: false,
    calculImpots: false,
    integrationMobileMoney: false,
    historiqueActions: false,
    gestionRoles: false,
    sauvegardeAuto: false,
    contratsIA: false,
    calendrierPartage: false,
    gestionPrestataires: false,
    analysePredictive: false
  });

  const toggleOption = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSave = () => {
    alert('✅ Préférences enregistrées avec succès !');
  };

  const automatisations = [
    {
      id: 'rappelsAuto',
      icon: Bell,
      title: 'Rappels automatiques de loyer',
      description: 'Notifications par SMS / Email avant échéance',
      premium: false
    },
    {
      id: 'quittancesAuto',
      icon: FileText,
      title: 'Génération automatique des quittances',
      description: 'Création et envoi automatique après paiement',
      premium: false
    },
    {
      id: 'renouvellementBail',
      icon: RefreshCw,
      title: 'Renouvellement de bail programmé',
      description: 'Alerte 3 mois avant expiration',
      premium: false
    },
    {
      id: 'suggestionsIA',
      icon: Brain,
      title: 'Suggestions IA',
      description: 'Ajustement du loyer selon le marché',
      premium: true
    }
  ];

  const analyses = [
    {
      id: 'rapportsMensuels',
      icon: BarChart3,
      title: 'Rapports mensuels détaillés',
      description: 'Revenus, impayés, taux d\'occupation',
      premium: false
    },
    {
      id: 'previsionIA',
      icon: TrendingUp,
      title: 'Prévisions IA',
      description: 'Evolution estimée des loyers',
      premium: true
    },
    {
      id: 'tableauPerformance',
      icon: PieChart,
      title: 'Tableau de performance',
      description: 'Meilleurs locataires, propriétés rentables',
      premium: false
    }
  ];

  const finance = [
    {
      id: 'suiviPaiements',
      icon: DollarSign,
      title: 'Suivi automatique des paiements',
      description: 'Traçabilité complète des transactions',
      premium: false
    },
    {
      id: 'exportComptable',
      icon: Download,
      title: 'Export comptable',
      description: 'Formats Excel / PDF',
      premium: false
    },
    {
      id: 'calculImpots',
      icon: Calculator,
      title: 'Calcul des impôts et charges',
      description: 'Calculs automatiques conformes',
      premium: false
    },
    {
      id: 'integrationMobileMoney',
      icon: Landmark,
      title: 'Intégration Mobile Money / Banque',
      description: 'Paiements directs synchronisés',
      premium: true
    }
  ];

  const securite = [
    {
      id: 'historiqueActions',
      icon: Database,
      title: 'Historique des actions (logs)',
      description: 'Traçabilité complète des opérations',
      premium: false
    },
    {
      id: 'gestionRoles',
      icon: Users,
      title: 'Gestion des rôles et permissions',
      description: 'Contrôle d\'accès granulaire',
      premium: false
    },
    {
      id: 'sauvegardeAuto',
      icon: Shield,
      title: 'Sauvegarde automatique',
      description: 'Backup quotidien sécurisé',
      premium: false
    }
  ];

  const outilsPro = [
    {
      id: 'contratsIA',
      icon: FileSignature,
      title: 'Contrats intelligents IA',
      description: 'Génération + signature électronique',
      premium: true
    },
    {
      id: 'calendrierPartage',
      icon: CalendarDays,
      title: 'Calendrier partagé',
      description: 'Rendez-vous, visites, paiements',
      premium: true
    },
    {
      id: 'gestionPrestataires',
      icon: Wrench,
      title: 'Gestion des prestataires',
      description: 'Suivi des interventions et maintenances',
      premium: true
    },
    {
      id: 'analysePredictive',
      icon: AlertTriangle,
      title: 'Analyse prédictive des risques',
      description: 'Détection anticipée des problèmes',
      premium: true
    }
  ];

  const OptionCard = ({ option }) => {
    const Icon = option.icon;
    const isLocked = option.premium && !isPro;
    
    return (
      <div className={`p-4 rounded-lg border-2 transition-all ${
        isLocked 
          ? 'bg-gray-50 border-gray-200 opacity-60' 
          : selectedOptions[option.id]
          ? 'bg-green-50 border-green-500'
          : 'bg-white border-gray-200 hover:border-blue-500'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={isLocked ? 'text-gray-400' : 'text-blue-600'} size={24} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
                  {option.title}
                </h4>
                {option.premium && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full font-bold">
                    PRO+
                  </span>
                )}
              </div>
              <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                {option.description}
              </p>
            </div>
          </div>
          {isLocked ? (
            <Lock className="text-gray-400" size={20} />
          ) : (
            <button
              onClick={() => toggleOption(option.id)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                selectedOptions[option.id] 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                selectedOptions[option.id] ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🧭 Gestion Avancée</h1>
          <p className="text-gray-600 mb-6">Accédez aux outils professionnels de gestion immobilière</p>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            🚀 Ouvrir les outils avancés
          </button>

          <div className="mt-6 flex items-center justify-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPro}
                onChange={(e) => setIsPro(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm text-gray-700">Simuler compte PRO+</span>
            </label>
          </div>
        </div>
      </div>

      <div className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap size={28} />
              Outils de gestion avancée
            </h2>
            <p className="text-blue-100 text-sm mt-1">Configurez vos automatisations et outils PRO</p>
          </div>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="h-[calc(100vh-180px)] overflow-y-auto p-6 space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Zap className="text-orange-500" size={20} />
              1. Automatisations
            </h3>
            <div className="space-y-3">
              {automatisations.map(option => (
                <OptionCard key={option.id} option={option} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 className="text-purple-500" size={20} />
              2. Analyses & Reporting
            </h3>
            <div className="space-y-3">
              {analyses.map(option => (
                <OptionCard key={option.id} option={option} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="text-green-500" size={20} />
              3. Gestion financière
            </h3>
            <div className="space-y-3">
              {finance.map(option => (
                <OptionCard key={option.id} option={option} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Shield className="text-blue-500" size={20} />
              4. Sécurité & Accès
            </h3>
            <div className="space-y-3">
              {securite.map(option => (
                <OptionCard key={option.id} option={option} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Rocket className="text-amber-500" size={20} />
              5. Outils PRO+
            </h3>
            <div className="space-y-3">
              {outilsPro.map(option => (
                <OptionCard key={option.id} option={option} />
              ))}
            </div>
          </section>

          {!isPro && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-start gap-4">
                <Rocket size={32} className="flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Débloquez tout le potentiel !</h4>
                  <p className="text-amber-50 text-sm mb-4">
                    Passez à HABIPRO PRO+ et accédez à tous les outils avancés : IA, contrats intelligents, analyses prédictives...
                  </p>
                  <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    🚀 Passer à PRO+ maintenant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Save size={20} />
            💾 Enregistrer les préférences
          </button>
          {!isPro && (
            <button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all">
              <Rocket size={20} />
              🚀 Passer à PRO+
            </button>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsPanelOpen(false)}
        />
      )}
    </div>
  );
}