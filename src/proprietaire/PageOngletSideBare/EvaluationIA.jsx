import React, { useState, useEffect } from 'react';
import JuridiquePanel from '../IAFonctionnalites/juridique';

export default function EvaluationIA() {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showJuridicalPanel, setShowJuridicalPanel] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const aiFeatures = [
    {
      id: 1,
      title: 'ÉVALUATION AUTOMATIQUE',
      subtitle: 'Intelligence prédictive',
      description: 'Analyse précise de la valeur marchande basée sur des algorithmes avancés et données temps réel. Estimation instantanée avec comparaison automatique du marché local.',
      accuracy: '95',
      category: 'ANALYSE',
      features: ['Analyse du marché', 'Comparaison automatique', 'Tendances', 'Rapport détaillé'],
      color: 'from-emerald-400/10 via-emerald-500/5 to-teal-400/10',
      glowColor: 'shadow-emerald-500/20',
      accentColor: 'emerald',
      icon: '📊'
    },
    {
      id: 2,
      title: 'PRÉDICTION LOYERS',
      subtitle: 'Optimisation tarifaire',
      description: 'Maximisez vos revenus locatifs grâce à une analyse prédictive sophistiquée. Ajustement dynamique selon les tendances saisonnières.',
      accuracy: '92',
      category: 'PRÉDICTION',
      features: ['Analyse saisonnière', 'Prévision 12 mois', 'Optimisation', 'Alertes'],
      color: 'from-amber-400/10 via-amber-500/5 to-orange-400/10',
      glowColor: 'shadow-amber-500/20',
      accentColor: 'amber',
      icon: '💰'
    },
    {
      id: 3,
      title: 'DÉTECTION RISQUES',
      subtitle: 'Analyse comportementale',
      description: 'Protection avancée contre les impayés via intelligence artificielle. Score de solvabilité et analyse comportementale prédictive.',
      accuracy: '88',
      category: 'SÉCURITÉ',
      features: ['Score solvabilité', 'Historique', 'Analyse IA', 'Alertes'],
      color: 'from-rose-400/10 via-rose-500/5 to-pink-400/10',
      glowColor: 'shadow-rose-500/20',
      accentColor: 'rose',
      icon: '🛡️'
    },
    {
      id: 4,
      title: 'OPTIMISATION ÉNERGÉTIQUE',
      subtitle: 'Efficacité maximale',
      description: 'Recommandations intelligentes pour améliorer la performance énergétique. Audit virtuel et calcul automatique du ROI.',
      accuracy: '90',
      category: 'OPTIMISATION',
      features: ['Audit virtuel', 'ROI améliorations', 'Subventions', 'Plan action'],
      color: 'from-sky-400/10 via-sky-500/5 to-blue-400/10',
      glowColor: 'shadow-sky-500/20',
      accentColor: 'sky',
      icon: '⚡'
    },
    {
      id: 5,
      title: 'MAINTENANCE PRÉDICTIVE',
      subtitle: 'Anticipation intelligente',
      description: 'Anticipez les défaillances avant qu\'elles ne surviennent. Planification automatique et budget prévisionnel optimisé.',
      accuracy: '87',
      category: 'PRÉDICTION',
      features: ['Calendrier', 'Prédiction pannes', 'Budget', 'Prestataires'],
      color: 'from-violet-400/10 via-violet-500/5 to-purple-400/10',
      glowColor: 'shadow-violet-500/20',
      accentColor: 'violet',
      icon: '🔧'
    },
    {
      id: 6,
      title: 'ASSISTANT JURIDIQUE',
      subtitle: 'Conformité automatisée',
      description: 'Veille réglementaire et génération automatique de documents juridiques. Conseils personnalisés basés sur l\'IA.',
      accuracy: '93',
      category: 'JURIDIQUE',
      features: ['Veille législative', 'Contrats IA', 'Conseils', 'Alertes'],
      color: 'from-slate-400/10 via-slate-500/5 to-gray-400/10',
      glowColor: 'shadow-slate-500/20',
      accentColor: 'slate',
      icon: '⚖️'
    }
  ];

  const currentFeature = aiFeatures[selectedFeature];

  const handleActivateModule = () => {
    if (selectedFeature === 5) { // Assistant Juridique
      setShowJuridicalPanel(true);
    }
  };

  const handleCloseJuridiquePanel = () => {
    setShowJuridicalPanel(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
      
      {/* Background elements sophistiqués */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-violet-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/5 to-transparent rounded-full"></div>
      </div>

      {/* Grid pattern subtil */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
             backgroundSize: '40px 40px'
           }}>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Layout principal avec glassmorphisme */}
        <div className="grid grid-cols-12 gap-10">
          
          {/* Featured Item - Design premium */}
          <div className={`col-span-7 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative group">
              
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${currentFeature.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Carte principale glassmorphisme */}
              <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl p-16 border border-white/30 shadow-2xl transition-all duration-700 hover:shadow-3xl">
                
                {/* Header avec badges sophistiqués */}
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{currentFeature.icon}</div>
                    <div>
                      <span className="text-xs tracking-[0.3em] text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                        {currentFeature.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 tracking-wider">PRÉCISION</span>
                      <div className="relative">
                        <div className="text-4xl font-extralight text-slate-900">{currentFeature.accuracy}</div>
                        <span className="absolute -top-1 -right-4 text-sm text-slate-500">%</span>
                      </div>
                    </div>
                    {/* Mini progress ring */}
                    <div className="w-16 h-16 mt-2 relative">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(148 163 184)" strokeWidth="3" opacity="0.2"/>
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="rgb(15 23 42)" 
                          strokeWidth="3"
                          strokeDasharray={`${currentFeature.accuracy * 2.51} 251`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Visual element sophistiqué */}
                <div className="relative mb-16 flex items-center justify-center">
                  {/* Cercles concentriques animés */}
                  <div className="relative w-80 h-80">
                    {/* Outer glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentFeature.color} rounded-full blur-2xl opacity-40 animate-pulse`}></div>
                    
                    {/* Main circle */}
                    <div className={`absolute inset-8 bg-gradient-to-br ${currentFeature.color} rounded-full backdrop-blur-xl border border-white/30 shadow-2xl`}>
                      {/* Inner pattern */}
                      <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-8xl font-extralight text-white/30">
                            {String(selectedFeature + 1).padStart(2, '0')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Floating particles */}
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-white/40 rounded-full animate-bounce"
                            style={{
                              top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 30}%`,
                              left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 30}%`,
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '3s'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu avec typography sophistiquée */}
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-4xl font-extralight text-slate-900 mb-3 tracking-wide leading-tight">
                      {currentFeature.title}
                    </h2>
                    <p className="text-sm text-slate-500 tracking-[0.2em] uppercase font-medium bg-slate-50 px-4 py-2 rounded-full inline-block">
                      {currentFeature.subtitle}
                    </p>
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    <p className="text-slate-600 leading-relaxed font-light text-lg text-center">
                      {currentFeature.description}
                    </p>
                  </div>

                  {/* Features avec design cards */}
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {currentFeature.features.map((feature, idx) => (
                      <div key={idx} className="group bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:bg-white/70 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 bg-gradient-to-r from-${currentFeature.accentColor}-400 to-${currentFeature.accentColor}-600 rounded-full group-hover:scale-125 transition-transform duration-300`}></div>
                          <span className="text-sm text-slate-600 font-light">{feature}</span>
                        </div>
                      </div>
                    ))}
                  </div>

         {/* Bouton premium avec gradient et effets */}
                  <div className="text-center pt-4">
                    <button 
                      onClick={handleActivateModule}
                      className="group relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-12 py-5 rounded-2xl font-light tracking-[0.1em] transition-all duration-500 hover:shadow-2xl hover:shadow-slate-500/25 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10 text-sm">ACTIVER MODULE</span>
                      <div className="absolute top-1/2 right-4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste sophistiquée avec design cards */}
          <div className={`col-span-5 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="space-y-3">
              {aiFeatures.map((feature, index) => (
                <div
                  key={feature.id}
                  onClick={() => setSelectedFeature(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    relative group p-6 rounded-2xl cursor-pointer transition-all duration-500 border backdrop-blur-xl
                    ${selectedFeature === index 
                      ? `bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl ${feature.glowColor} scale-105 border-white/20` 
                      : 'bg-white/70 hover:bg-white/90 border-white/50 hover:shadow-xl hover:shadow-slate-200/50 hover:scale-102'
                    }
                  `}
                >
                  {/* Glow effect pour selected */}
                  {selectedFeature === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="text-lg">{feature.icon}</div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs tracking-[0.2em] font-medium ${
                            selectedFeature === index ? 'text-slate-400' : 'text-slate-400'
                          }`}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className={`w-6 h-[1px] bg-gradient-to-r ${
                            selectedFeature === index ? 'from-white/30 to-transparent' : 'from-slate-300 to-transparent'
                          }`}></div>
                        </div>
                      </div>
                      
                      {/* Status indicator */}
                      <div className={`w-2 h-2 rounded-full ${
                        selectedFeature === index ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                      }`}></div>
                    </div>

                    <div className="space-y-2">
                      <h3 className={`text-sm font-light tracking-wide ${
                        selectedFeature === index ? 'text-white' : 'text-slate-900'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-xs ${
                        selectedFeature === index ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {feature.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className={`text-xs ${
                        selectedFeature === index ? 'text-slate-400' : 'text-slate-400'
                      }`}>
                        {feature.category}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-light ${
                          selectedFeature === index ? 'text-white' : 'text-slate-600'
                        }`}>
                          {feature.accuracy}%
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression sophistiquée */}
                    <div className="mt-4 relative">
                      <div className="h-[2px] bg-gradient-to-r from-slate-200/50 to-slate-200/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${
                            selectedFeature === index 
                              ? 'bg-gradient-to-r from-white via-slate-200 to-white' 
                              : 'bg-gradient-to-r from-slate-400 to-slate-300'
                          }`}
                          style={{ 
                            width: hoveredIndex === index || selectedFeature === index 
                              ? `${feature.accuracy}%` 
                              : '0%',
                            transition: 'width 1s ease-out'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* Navigation sophistiquée */}
            <div className="flex justify-center gap-3 mt-10">
              {aiFeatures.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFeature(index)}
                  className={`relative transition-all duration-500 overflow-hidden ${
                    selectedFeature === index 
                      ? 'w-12 h-3 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-full shadow-lg' 
                      : 'w-3 h-3 bg-slate-300 rounded-full hover:bg-slate-400 hover:shadow-md'
                  }`}
                >
                  {selectedFeature === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-violet-500/30 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer stats premium */}
        <div className={`mt-20 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl">
            <div className="grid grid-cols-4 gap-8">
              {[
                { label: 'MODULES ACTIFS', value: aiFeatures.length, unit: '', color: 'text-slate-900' },
                { label: 'PRÉCISION MOYENNE', value: '91', unit: '%', color: 'text-emerald-600' },
                { label: 'DISPONIBILITÉ', value: '24', unit: '/7', color: 'text-blue-600' },
                { label: 'STATUT SYSTÈME', value: 'ACTIF', unit: '', color: 'text-emerald-600' }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <p className="text-xs text-slate-400 tracking-wider mb-2 font-medium">{stat.label}</p>
                  <div className="flex items-center justify-center gap-1">
                    <p className={`text-3xl font-extralight ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      {stat.value}
                    </p>
                    {stat.unit && <span className="text-lg text-slate-500">{stat.unit}</span>}
                  </div>
                  {index < 3 && <div className="w-8 h-[1px] bg-gradient-to-r from-slate-200 to-transparent mx-auto mt-4"></div>}
                  
                  {/* Status indicator pour STATUT */}
                  {stat.label === 'STATUT SYSTÈME' && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="text-xs text-slate-400">En ligne</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Intégration du composant JuridiquePanel */}
      <JuridiquePanel 
        showPanel={showJuridicalPanel} 
        onClose={handleCloseJuridiquePanel} 
      />
    </div>
      );
}