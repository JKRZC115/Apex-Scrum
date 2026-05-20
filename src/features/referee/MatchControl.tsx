import React, { useState, useEffect } from 'react';
import { useMatchEngine } from '../../core/hooks/useMatchEngine';
import { MOCK_MATCHES, MOCK_CLUBS, MOCK_PLAYERS, MOCK_USERS } from '../../core/mocks/mockData';
import { MatchEventType, MatchStatus, MatchEvent, UserRole, Match, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const MatchControl = () => {
  const { user } = useAuth();
  
  // States of the referee module
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'MESA' | 'CENTRAL' | null>(null);
  const [ticker, setTicker] = useState(0); // Ticks countdown timers every second
  const [activeTab, setActiveTab] = useState<'PARTIDOS' | 'DESIGNACIONES' | 'MANAGER'>('PARTIDOS');

  const refereesList = (Object.values(MOCK_USERS) as User[]).filter(u => u.roles && u.roles.includes(UserRole.REFEREE));

  // Load the selected match object reference directly from the mock database
  const selectedMatch = MOCK_MATCHES.find(m => m.id === selectedMatchId) || null;

  // React hook to run local timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user || !user.isApproved || (!user.roles.includes(UserRole.REFEREE) && !user.roles.includes(UserRole.ADMIN))) {
    return <Navigate to="/login" />;
  }

  // Force-update the mock matches object globally when changes occur
  const triggerGlobalSync = (mId: string, updatedFields: Partial<Match>) => {
    const idx = MOCK_MATCHES.findIndex(m => m.id === mId);
    if (idx !== -1) {
      MOCK_MATCHES[idx] = { ...MOCK_MATCHES[idx], ...updatedFields };
    }
  };

  // Render match selector list
  if (!selectedMatchId || !selectedMatch) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 italic uppercase leading-none tracking-tighter">Hola, {user.name}</h1>
            <p className="text-slate-500 text-xs font-black mt-2 uppercase tracking-widest">
              Gestiona tiempos, marcas oficiales, actas de juego y designaciones del torneo
            </p>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-600 px-3 py-1 bg-white rounded-lg shadow-sm">
              Perfil: {user.isRefereeManager ? "Referee Manager 💎" : "Árbitro Colegiado 🏅"}
            </span>
          </div>
        </header>

        {/* Tab buttons */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('PARTIDOS')}
            className={`py-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${activeTab === 'PARTIDOS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Control de Partidos ⏱️
          </button>
          
          <button 
            onClick={() => setActiveTab('DESIGNACIONES')}
            className={`py-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${activeTab === 'DESIGNACIONES' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Mis Designaciones 📋
          </button>

          {(user.isRefereeManager || user.roles.includes(UserRole.ADMIN)) && (
            <button 
              onClick={() => setActiveTab('MANAGER')}
              className={`py-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${activeTab === 'MANAGER' ? 'border-violet-650 text-violet-650' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Gestión de Designaciones (Manager) 💎
            </button>
          )}
        </div>

        {/* --- TAB 1: AVAILABLE MATCH CONTROL PANEL --- */}
        {activeTab === 'PARTIDOS' && (
          <div className="grid grid-cols-1 gap-6">
            {MOCK_MATCHES.map((match) => {
              const homeClub = MOCK_CLUBS[match.homeTeamId];
              const awayClub = MOCK_CLUBS[match.awayTeamId];
              
              // Get proper validation timer details
              let statusBadge = (
                <span className="text-[10px] font-black text-slate-500 bg-slate-150 border border-slate-200 px-3 py-1 rounded-full uppercase">
                  Programado
                </span>
              );
              if (match.status === MatchStatus.LIVE) {
                statusBadge = (
                  <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full animate-pulse uppercase">
                    En Vivo • {match.currentPeriod || "1er Tiempo"} {String(match.currentMinute ?? 0).padStart(2, '0')}:{String(match.currentSecond ?? 0).padStart(2, '0')}
                  </span>
                );
              } else if (match.status === MatchStatus.WAITING_VALIDATION) {
                const timer = getValidationTimerStatus(match);
                statusBadge = (
                  <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full uppercase">
                    Pendiente Firma ({timer.text})
                  </span>
                );
              } else if (match.isDisputeActive) {
                statusBadge = (
                  <span className="text-[10px] font-black text-red-600 bg-red-100 border border-red-200 px-3 py-1 rounded-full uppercase">
                    Rechazado - En Disputa
                  </span>
                );
              } else if (match.status === MatchStatus.FINISHED || match.isSigned) {
                statusBadge = (
                  <span className="text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full uppercase">
                    Finalizado (Cerrado)
                  </span>
                );
              }

              return (
                <div 
                  key={match.id}
                  onClick={() => setSelectedMatchId(match.id)}
                  className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {statusBadge}
                      <span className="text-[9px] font-black text-slate-400 bg-slate-50 border px-2.5 py-0.5 rounded-full uppercase">
                        Cod: {match.id} • {match.modality}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-lg font-black text-slate-900 tracking-tight uppercase">
                        {homeClub?.name}
                      </span>
                      <span className="text-xs font-black text-white bg-slate-900 px-2.5 py-1 rounded-lg">
                        {match.homeScore} : {match.awayScore}
                      </span>
                      <span className="text-lg font-black text-slate-900 tracking-tight uppercase">
                        {awayClub?.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Fecha programada: {new Date(match.date).toLocaleDateString()}
                    </p>
                  </div>

                  <button className="flex items-center gap-2 bg-slate-100 text-slate-800 hover:bg-blue-600 hover:text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all group-hover:scale-95">
                    Ingresar
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* --- TAB 2: PERSONAL DESIGNATIONS LIST --- */}
        {activeTab === 'DESIGNACIONES' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl">
              <h4 className="text-xs font-black uppercase text-slate-800">Tus Designaciones Arbitrales</h4>
              <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase leading-normal">
                En esta sección puedes ver los partidos en los que has sido designado. Los encuentros bajo tu colegiatura se resaltan con un color naranja llamativo y un rótulo con tu función.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {MOCK_MATCHES.map((match) => {
                const homeClub = MOCK_CLUBS[match.homeTeamId];
                const awayClub = MOCK_CLUBS[match.awayTeamId];

                // Check assigned roles matching logged in user variables
                const isCentral = match.refereeCenterId === user.id || match.refereeCenterId === user.email || match.refereeCenterId === "Juan Referí" || (user.firstName === "Juan" && match.refereeCenterId === "Juan Referí");
                const isA1 = match.refereeA1Id === user.id || match.refereeA1Id === user.email || (user.firstName === "Juan" && match.refereeA1Id === "Juan Referí");
                const isA2 = match.refereeA2Id === user.id || match.refereeA2Id === user.email || (user.firstName === "Juan" && match.refereeA2Id === "Juan Referí");
                const isDesignated = isCentral || isA1 || isA2;

                const assignedRolesText: string[] = [];
                if (isCentral) assignedRolesText.push("REFERÍ CENTRAL ⭐");
                if (isA1) assignedRolesText.push("LÍNEA ASISTENTE A1 🏁");
                if (isA2) assignedRolesText.push("LÍNEA ASISTENTE A2 🏁");

                let statusBadge = (
                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full uppercase">
                    Programado
                  </span>
                );
                if (match.status === MatchStatus.LIVE) {
                  statusBadge = (
                    <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full animate-pulse uppercase">
                      En Vivo • {match.currentPeriod}
                    </span>
                  );
                }

                return (
                  <div 
                    key={match.id}
                    className={`rounded-[32px] p-8 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-2 ${isDesignated 
                      ? 'bg-gradient-to-br from-amber-50 to-orange-100 border-orange-500 shadow-xl ring-4 ring-orange-100 hover:border-orange-600' 
                      : 'bg-white border-slate-150 opacity-60 hover:opacity-100'}`}
                  >
                    <div className="space-y-3">
                      {isDesignated ? (
                        <div className="inline-block bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md animate-bounce">
                          🔥 ¡ESTÁS DESIGNADO! ({assignedRolesText.join(", ")})
                        </div>
                      ) : (
                        <div className="inline-block bg-slate-100 text-slate-400 font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                          No Designado
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        {statusBadge}
                        <span className="text-[9px] font-black text-slate-400 bg-slate-50 border px-2.5 py-0.5 rounded-full uppercase">
                          Cod: {match.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-lg font-black text-slate-900 tracking-tight uppercase">
                          {homeClub?.name}
                        </span>
                        <span className="text-xs font-black text-white bg-slate-900 px-2.5 py-1 rounded-lg">
                          {match.homeScore} : {match.awayScore}
                        </span>
                        <span className="text-lg font-black text-slate-900 tracking-tight uppercase">
                          {awayClub?.name}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 font-bold space-y-1 uppercase tracking-wider">
                        <p>Fecha programada: {new Date(match.date).toLocaleDateString()}</p>
                        <p className="text-slate-400">
                          Personal: Central: {(Object.values(MOCK_USERS) as User[]).find(u => u.id === match.refereeCenterId || u.email === match.refereeCenterId || u.name === match.refereeCenterId)?.name || 'Por designar'} | 
                          A1: {(Object.values(MOCK_USERS) as User[]).find(u => u.id === match.refereeA1Id || u.email === match.refereeA1Id || u.name === match.refereeA1Id)?.name || 'Por designar'} | 
                          A2: {(Object.values(MOCK_USERS) as User[]).find(u => u.id === match.refereeA2Id || u.email === match.refereeA2Id || u.name === match.refereeA2Id)?.name || 'Por designar'}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedMatchId(match.id)}
                      className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all ${isDesignated 
                        ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg' 
                        : 'bg-slate-100 text-slate-800'}`}
                    >
                      Oficializar
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 3: MANAGER ASSIGNMENT WORKSPACE --- */}
        {activeTab === 'MANAGER' && (
          <div className="space-y-6">
            <div className="bg-purple-900 text-white p-8 rounded-[40px] shadow-lg">
              <span className="text-[10px] font-black text-purple-200 bg-purple-800 px-4 py-1.5 rounded-full border border-purple-700 uppercase tracking-widest inline-block mb-3">
                Gestión Suprema
              </span>
              <h3 className="text-2xl font-black italic uppercase">Asignaciones en tiempo real</h3>
              <p className="text-xs text-purple-200 mt-2 font-medium max-w-[550px] leading-relaxed">
                Asigna a cualquiera de los colegiados de la federación a los partidos programados utilizando los selectores inmediatos de Central, A1 y A2.
              </p>
            </div>

            <div className="space-y-4">
              {MOCK_MATCHES.map((match) => {
                const homeClub = MOCK_CLUBS[match.homeTeamId];
                const awayClub = MOCK_CLUBS[match.awayTeamId];

                return (
                  <div key={match.id} className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border px-2.5 py-0.5 rounded-full">
                        Cod: {match.id} • {match.status}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 uppercase">
                        {homeClub?.name} vs {awayClub?.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        programado: {new Date(match.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full xl:w-auto">
                      {/* Central Referee Selector */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl relative space-y-1">
                        <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">ÁRBITRO CENTRAL</label>
                        <select
                          className="w-full bg-white border border-slate-200 text-xs font-black uppercase text-slate-850 rounded-lg p-2.5 outline-none focus:border-purple-600"
                          value={match.refereeCenterId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const idx = MOCK_MATCHES.findIndex(m => m.id === match.id);
                            if (idx !== -1) {
                              MOCK_MATCHES[idx].refereeCenterId = val;
                              setTicker(t => t + 1); // refresh UI
                            }
                          }}
                        >
                          <option value="">-- Sin Designar --</option>
                          {refereesList.map(ref => (
                            <option key={ref.id} value={ref.id}>{ref.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Referee A1 Selector */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl relative space-y-1">
                        <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">ASISTENTE A1</label>
                        <select
                          className="w-full bg-white border border-slate-200 text-xs font-black uppercase text-slate-850 rounded-lg p-2.5 outline-none focus:border-purple-600"
                          value={match.refereeA1Id || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const idx = MOCK_MATCHES.findIndex(m => m.id === match.id);
                            if (idx !== -1) {
                              MOCK_MATCHES[idx].refereeA1Id = val;
                              setTicker(t => t + 1); // refresh UI
                            }
                          }}
                        >
                          <option value="">-- Sin Designar --</option>
                          {refereesList.map(ref => (
                            <option key={ref.id} value={ref.id}>{ref.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Referee A2 Selector */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl relative space-y-1">
                        <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">ASISTENTE A2</label>
                        <select
                          className="w-full bg-white border border-slate-200 text-xs font-black uppercase text-slate-850 rounded-lg p-2.5 outline-none focus:border-purple-600"
                          value={match.refereeA2Id || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const idx = MOCK_MATCHES.findIndex(m => m.id === match.id);
                            if (idx !== -1) {
                              MOCK_MATCHES[idx].refereeA2Id = val;
                              setTicker(t => t + 1); // refresh UI
                            }
                          }}
                        >
                          <option value="">-- Sin Designar --</option>
                          {refereesList.map(ref => (
                            <option key={ref.id} value={ref.id}>{ref.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Once a match is selected but role is not chosen yet, show full screen role selection
  if (!selectedRole) {
    const homeClub = MOCK_CLUBS[selectedMatch.homeTeamId];
    const awayClub = MOCK_CLUBS[selectedMatch.awayTeamId];

    return (
      <div className="max-w-xl mx-auto space-y-8 py-10">
        <button 
          onClick={() => setSelectedMatchId(null)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a la Lista
        </button>

        <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-3.5 py-1 rounded-full uppercase tracking-widest inline-block">
              Oficializar Partido
            </span>
            <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter uppercase leading-tight">
              {homeClub?.name} vs {awayClub?.name}
            </h2>
            <p className="text-slate-400 text-xs font-medium max-w-[320px] mx-auto">
              Selecciona bajo qué nivel de acreditación vas a reportar para este encuentro.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 text-left">
            {/* Card Mesa selector */}
            <button
              onClick={() => setSelectedRole('MESA')}
              className="p-6 rounded-3xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/40 text-left transition-all group flex items-start gap-5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Mesa de Control (Mundialista)</h4>
                <p className="text-[10px] font-medium text-slate-500 leading-tight">
                  Registra tacleadas, puntos, tarjetas temporales (amarillas), expulsiones (rojas), cambios de jugadores y cronometra el partido.
                </p>
              </div>
            </button>

            {/* Card Central selector */}
            <button
              onClick={() => setSelectedRole('CENTRAL')}
              className="p-6 rounded-3xl border-2 border-slate-100 hover:border-purple-600 hover:bg-purple-50/40 text-left transition-all group flex items-start gap-5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Árbitro Central (Firma de Acta)</h4>
                <p className="text-[10px] font-medium text-slate-500 leading-tight">
                  Entra una vez finalizado por la mesa de control. Válida el marcador oficial y firma digitalmente una vez los entrenadores aprueben.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER INNER VIEWS (MESA OR CENTRAL) ---

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Navigation and breadcrumbs header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200">
        <button 
          onClick={() => { setSelectedRole(null); }}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Cambiar rol/partido
        </button>

        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-905 text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
          Modo: {selectedRole}
        </span>
      </div>

      {selectedRole === 'MESA' ? (
        <MesaWorkspace 
          initialMatch={selectedMatch} 
          triggerGlobalSync={triggerGlobalSync} 
        />
      ) : (
        <CentralWorkspace 
          initialMatch={selectedMatch} 
          triggerGlobalSync={triggerGlobalSync}
        />
      )}
    </div>
  );
};

// Helper to determine validate timer details
const getValidationTimerStatus = (m: Match) => {
  if (!m.finishTime) {
    return { expired: false, minutesLeft: 15, secondsLeft: 0, text: "15:00" };
  }
  const finished = new Date(m.finishTime).getTime();
  const limit = finished + 15 * 60 * 1000;
  const now = Date.now();
  const diff = limit - now;
  if (diff <= 0) {
    return { expired: true, minutesLeft: 0, secondsLeft: 0, text: "00:00 - Expirado" };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return {
    expired: false,
    minutesLeft: min,
    secondsLeft: sec,
    text: `${min}:${sec < 10 ? '0' : ''}${sec}`
  };
};

// ==========================================
// 1. MESA WORKSPACE IMPLEMENTATION
// ==========================================
interface MesaProps {
  initialMatch: Match;
  triggerGlobalSync: (mId: string, updatedFields: Partial<Match>) => void;
}

const MesaWorkspace = ({ initialMatch, triggerGlobalSync }: MesaProps) => {
  const { user } = useAuth();
  const { match, setMatch, events, isRunning, setIsRunning, addEvent, removeEvent, toggleRosterLock, getActiveYellowCards } = useMatchEngine(initialMatch);

  const activeYellowCards = getActiveYellowCards();
  const [pendingEvent, setPendingEvent] = useState<{ type: MatchEventType, teamId: 'HOME' | 'AWAY' } | null>(null);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);
  const [subData, setSubData] = useState<{ teamId: 'HOME' | 'AWAY', in?: string, out?: string }>({ teamId: 'HOME' });
  const [modalPrompt, setModalPrompt] = useState<{
    title: string;
    message: string;
    type: 'ALERT' | 'CONFIRM' | 'CHOICE_REFTIME';
    onConfirm?: () => void;
    onCancel?: () => void;
    onChoice?: (val: boolean) => void;
  } | null>(null);

  const homeClub = MOCK_CLUBS[match.homeTeamId];
  const awayClub = MOCK_CLUBS[match.awayTeamId];

  const checkIfPlayerIsExpelled = (playerId: string) => {
    return events.some(e => e.playerId === playerId && e.type === MatchEventType.RED_CARD);
  };

  // Sync state changes with the global array
  useEffect(() => {
    triggerGlobalSync(match.id, {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status,
      currentMinute: match.currentMinute,
      currentSecond: match.currentSecond,
      currentHalf: match.currentHalf,
      currentPeriod: match.currentPeriod,
      isHomeRosterUnlocked: match.isHomeRosterUnlocked,
      isAwayRosterUnlocked: match.isAwayRosterUnlocked
    });
  }, [match, triggerGlobalSync]);

  // Roster registration validations
  const validateRostersForStart = (m: Match) => {
    const homePlayers = MOCK_PLAYERS.filter(p => m.homeRosterIds.includes(p.id));
    const awayPlayers = MOCK_PLAYERS.filter(p => m.awayRosterIds.includes(p.id));

    if (homePlayers.length === 0) {
      return { valid: false, reason: `No se puede iniciar el partido. El entrenador local (${MOCK_CLUBS[m.homeTeamId]?.name || 'Local'}) no ha inscrito ningún jugador en la planilla.` };
    }
    if (awayPlayers.length === 0) {
      return { valid: false, reason: `No se puede iniciar el partido. El entrenador visitante (${MOCK_CLUBS[m.awayTeamId]?.name || 'Visitante'}) no ha inscrito ningún jugador en la planilla.` };
    }

    const missingHomeNumbers = homePlayers.some(p => p.number === undefined || p.number === null || p.number <= 0);
    const missingAwayNumbers = awayPlayers.some(p => p.number === undefined || p.number === null || p.number <= 0);

    if (missingHomeNumbers) {
      return { valid: false, reason: `No se puede iniciar el partido. El entrenador local (${MOCK_CLUBS[m.homeTeamId]?.name || 'Local'}) tiene jugadores registrados sin camiseta/número asignado.` };
    }
    if (missingAwayNumbers) {
      return { valid: false, reason: `No se puede iniciar el partido. El entrenador visitante (${MOCK_CLUBS[m.awayTeamId]?.name || 'Visitante'}) tiene jugadores registrados sin camiseta/número asignado.` };
    }

    return { valid: true };
  };

  // Click timing handlers
  const handleStartMatchClick = () => {
    let updatedRosterHome = [...match.homeRosterIds];
    let updatedRosterAway = [...match.awayRosterIds];
    
    // Auto-populate roster if empty for easier testing
    if (updatedRosterHome.length === 0) {
      const dbPlayers = MOCK_PLAYERS.filter(p => p.clubId === match.homeTeamId);
      updatedRosterHome = dbPlayers.map(p => p.id);
    }
    if (updatedRosterAway.length === 0) {
      const dbPlayers = MOCK_PLAYERS.filter(p => p.clubId === match.awayTeamId);
      updatedRosterAway = dbPlayers.map(p => p.id);
    }

    const tempMatch = {
      ...match,
      homeRosterIds: updatedRosterHome,
      awayRosterIds: updatedRosterAway
    };

    const validation = validateRostersForStart(tempMatch);
    if (!validation.valid) {
      setModalPrompt({
        title: "Requisitos de Planilla",
        message: validation.reason,
        type: 'ALERT'
      });
      return;
    }
    
    setIsRunning(true);
    setMatch(prev => ({
      ...prev,
      homeRosterIds: updatedRosterHome,
      awayRosterIds: updatedRosterAway,
      status: MatchStatus.LIVE,
      currentHalf: 1,
      currentPeriod: "1er Tiempo",
      currentMinute: 0,
      currentSecond: 0
    }));
    setModalPrompt({
      title: "Partido en Marcha 🚀",
      message: "¡Partido iniciado correctamente! Se han cargado las planillas oficiales y se está disputando el 1er Tiempo.",
      type: 'ALERT'
    });
  };

  const handleTogglePauseClick = () => {
    setIsRunning(!isRunning);
  };

  const handleStartSecondHalfClick = () => {
    setIsRunning(true);
    setMatch(prev => ({
      ...prev,
      status: MatchStatus.LIVE,
      currentHalf: 2,
      currentPeriod: "2do Tiempo",
      currentMinute: 0,
      currentSecond: 0
    }));
    setModalPrompt({
      title: "¡Segundo Tiempo! ▶️",
      message: "¡Ha iniciado la segunda etapa del encuentro deportivo regulado!",
      type: 'ALERT'
    });
  };

  const handleDetencionClick = () => {
    let period = match.currentPeriod;
    if (!period || period === "No Iniciado") {
      period = match.currentHalf === 2 ? "2do Tiempo" : "1er Tiempo";
    }

    if (period === "1er Tiempo") {
      setModalPrompt({
        title: "¿Terminar Primer Tiempo?",
        message: "¿Estás seguro de que deseas detener la marcha del 1er tiempo para enviar el encuentro a entretiempo?",
        type: 'CONFIRM',
        onConfirm: () => {
          setIsRunning(false);
          setMatch(prev => ({
            ...prev,
            currentHalf: 2,
            currentPeriod: "Entretiempo",
            currentMinute: 0,
            currentSecond: 0
          }));
        }
      });
    } else if (period === "2do Tiempo") {
      setModalPrompt({
        title: "¿Concluir Tiempo Regular?",
        message: "¿Estás seguro de que deseas terminar el segundo tiempo reglamentario del partido?",
        type: 'CONFIRM',
        onConfirm: () => {
          setIsRunning(false);
          // Launch the prompt option for overtime or finalizing notes
          setModalPrompt({
            title: "¿Iniciar Tiempo Extra?",
            message: "Puede optar por iniciar un período extra de desempate, o concluir el partido para que pase a firma de los directores técnicos.",
            type: 'CHOICE_REFTIME',
            onChoice: (wantsExtra) => {
              if (wantsExtra) {
                setIsRunning(true);
                setMatch(prev => ({
                  ...prev,
                  status: MatchStatus.LIVE,
                  currentHalf: 3,
                  currentPeriod: "Tiempo Extra",
                  currentMinute: 0,
                  currentSecond: 0
                }));
                // Mini secondary confirmation
                setModalPrompt({
                  title: "Periodo Extra Iniciado",
                  message: "Se ha configurado y reanudado la prórroga oficial del partido.",
                  type: 'ALERT'
                });
              } else {
                setMatch(prev => ({
                  ...prev,
                  status: MatchStatus.WAITING_VALIDATION,
                  currentPeriod: "Finalizado",
                  finishTime: new Date()
                }));
                setModalPrompt({
                  title: "Acta Iniciada",
                  message: "Encuentro enviado con éxito para firmas de validación técnica de entrenadores.",
                  type: 'ALERT'
                });
              }
            }
          });
        }
      });
    } else if (period === "Tiempo Extra") {
      setModalPrompt({
        title: "¿Detener Prórroga?",
        message: "¿Estás seguro de terminar el Tiempo Extra de prórroga y finalizar el partido definitivamente?",
        type: 'CONFIRM',
        onConfirm: () => {
          setIsRunning(false);
          setMatch(prev => ({
            ...prev,
            status: MatchStatus.WAITING_VALIDATION,
            currentPeriod: "Finalizado",
            finishTime: new Date()
          }));
          setModalPrompt({
            title: "Prórroga Cerrada",
            message: "El partido extra ha finalizado de forma definitiva. Planillas enviadas a actas oficiales.",
            type: 'ALERT'
          });
        }
      });
    }
  };

  const handleActionClick = (type: MatchEventType, teamId: 'HOME' | 'AWAY') => {
    if (match.status === MatchStatus.FINISHED || match.isSigned) {
      setModalPrompt({
        title: "Marcador Bloqueado",
        message: "Este partido está concluido y validado digitalmente por el árbitro central. El marcador se encuentra congelado.",
        type: 'ALERT'
      });
      return;
    }
    if (type === MatchEventType.PENALTY_TRY) {
      addEvent(type, teamId);
    } else {
      setPendingEvent({ type, teamId });
    }
  };

  const allowedSubstitutions = match.modality === 'XVS' ? 8 : 5;

  const getSubstitutionsCount = (teamId: 'HOME' | 'AWAY') => {
    const clubId = teamId === 'HOME' ? match.homeTeamId : match.awayTeamId;
    return events.filter(e => e.type === MatchEventType.SUBSTITUTION && e.teamId === clubId).length;
  };

  const getRemainingSubs = (teamId: 'HOME' | 'AWAY') => {
    const currentSubs = getSubstitutionsCount(teamId);
    return Math.max(0, allowedSubstitutions - currentSubs);
  };

  const confirmEvent = (playerId: string) => {
    if (pendingEvent) {
      if (pendingEvent.type === MatchEventType.YELLOW_CARD) {
        const previousYellows = events.filter(e => e.type === MatchEventType.YELLOW_CARD && e.playerId === playerId);
        if (previousYellows.length >= 1) {
          setModalPrompt({
            title: "Segunda Amarilla 🟨 ➔ 🟥",
            message: "Este jugador ya tiene una tarjeta amarilla. Al registrar la segunda, se convertirá automáticamente en Tarjeta Roja (Expulsión reglamentaria). ¿Confirmar expulsión?",
            type: 'CONFIRM',
            onConfirm: () => {
              const yCardId = addEvent(MatchEventType.YELLOW_CARD, pendingEvent.teamId, playerId);
              addEvent(MatchEventType.RED_CARD, pendingEvent.teamId, playerId, undefined, yCardId);
              setPendingEvent(null);
            },
            onCancel: () => {
              setPendingEvent(null);
            }
          });
          return;
        }
      }

      addEvent(pendingEvent.type, pendingEvent.teamId, playerId);
      setPendingEvent(null);
    }
  };

  const handleSubstitution = () => {
    if (subData.in && subData.out) {
      const remaining = getRemainingSubs(subData.teamId);
      if (remaining <= 0) {
        setModalPrompt({
          title: "Sustituciones Agotadas 🚫",
          message: `El equipo ya ha alcanzado el límite de ${allowedSubstitutions} cambios permitidos para la modalidad de ${match.modality === 'XVS' ? "XV's" : "7's"}.`,
          type: 'ALERT'
        });
        return;
      }

      addEvent(MatchEventType.SUBSTITUTION, subData.teamId, subData.in, subData.out);
      setIsSubmittingSub(false);
      setSubData({ teamId: 'HOME' });
    }
  };

  const handleRemoveEventClick = (ev: MatchEvent) => {
    if (ev.type === MatchEventType.YELLOW_CARD || ev.type === MatchEventType.RED_CARD) {
      setModalPrompt({
        title: "¿Eliminar Tarjeta?",
        message: `¿Estás seguro de que deseas eliminar este registro de tarjeta (${ev.type === MatchEventType.YELLOW_CARD ? 'Amarilla 🟨' : 'Roja 🟥'})? Esto no afectará la puntuación del partido. Si eliminas una segunda amarilla, la tarjeta roja asociada también se quitará.`,
        type: 'CONFIRM',
        onConfirm: () => {
          removeEvent(ev.id);
        }
      });
    } else {
      removeEvent(ev.id);
    }
  };

  const getTeamPlayers = (teamId: 'HOME' | 'AWAY') => {
    const clubId = teamId === 'HOME' ? match.homeTeamId : match.awayTeamId;
    return MOCK_PLAYERS.filter(p => p.clubId === clubId);
  };

  const handleCloseMatchByMesa = () => {
    setModalPrompt({
      title: "¿Finalizar Encuentro en Mesa?",
      message: "¿Estás seguro de que deseas FINALIZAR EL ENCUENTRO desde la mesa de control? El partido pasará a fase de actas y firmas de validación.",
      type: 'CONFIRM',
      onConfirm: () => {
        setIsRunning(false);
        setMatch(prev => ({
          ...prev,
          status: MatchStatus.WAITING_VALIDATION,
          currentPeriod: "Finalizado",
          finishTime: new Date()
        }));
        setModalPrompt({
          title: "Mesa Cerrada ✅",
          message: "Encuentro regulador concluido exitosamente en mesa. Las firmas y actas técnicas correspondientes están ya activas.",
          type: 'ALERT'
        });
      }
    });
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Selection player modal */}
      {pendingEvent && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-2xl font-black italic uppercase">Seleccionar Jugador</h3>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase">
                {pendingEvent.type.replace('_', ' ')} • {pendingEvent.teamId === 'HOME' ? homeClub?.name : awayClub?.name}
              </p>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-2">
              {getTeamPlayers(pendingEvent.teamId).map(p => {
                const isExpelled = checkIfPlayerIsExpelled(p.id);
                return (
                  <button 
                    key={p.id}
                    onClick={() => {
                      if (!isExpelled) {
                        confirmEvent(p.id);
                      }
                    }}
                    disabled={isExpelled}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left group transition-all ${
                      isExpelled 
                        ? 'bg-red-50 border-red-200 opacity-60 cursor-not-allowed text-red-700' 
                        : 'border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50 text-slate-900'
                    }`}
                  >
                    <span className="font-black uppercase">{p.number} - {p.firstName} {p.lastName}</span>
                    {isExpelled && (
                      <span className="text-[10px] font-black uppercase text-red-650 bg-red-100 border border-red-200 px-2 py-1 rounded-lg">
                        🟥 EXPULSADO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setPendingEvent(null)} className="w-full bg-slate-100 py-6 font-black uppercase text-slate-400">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Substitution modal */}
      {isSubmittingSub && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-8 text-white">
              <h3 className="text-2xl font-black italic uppercase">Registrar Cambio</h3>
              <div className="mt-4 flex bg-blue-700/50 p-1 rounded-xl">
                 <button 
                  onClick={() => setSubData({ ...subData, teamId: 'HOME', in: undefined, out: undefined })}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${subData.teamId === 'HOME' ? 'bg-white text-blue-600 shadow-lg' : 'text-blue-200'}`}
                 >
                   {homeClub?.name}
                 </button>
                 <button 
                  onClick={() => setSubData({ ...subData, teamId: 'AWAY', in: undefined, out: undefined })}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${subData.teamId === 'AWAY' ? 'bg-white text-blue-600 shadow-lg' : 'text-blue-200'}`}
                 >
                   {awayClub?.name}
                 </button>
              </div>
              <p className="text-center text-[11px] font-black uppercase tracking-wider text-blue-105 mt-4">
                Sustituciones restantes: {getRemainingSubs(subData.teamId)} / {allowedSubstitutions}
              </p>
            </div>
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Sale (OUT)</label>
                    <select 
                      className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                      value={subData.out || ''}
                      onChange={e => setSubData({ ...subData, out: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {getTeamPlayers(subData.teamId)
                        .filter(p => !checkIfPlayerIsExpelled(p.id))
                        .map(p => <option key={p.id} value={p.id}>#{p.number} {p.firstName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Entra (IN)</label>
                    <select 
                      className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                      value={subData.in || ''}
                      onChange={e => setSubData({ ...subData, in: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {getTeamPlayers(subData.teamId)
                        .filter(p => !checkIfPlayerIsExpelled(p.id))
                        .map(p => <option key={p.id} value={p.id}>#{p.number} {p.firstName}</option>)}
                    </select>
                  </div>
               </div>
               <button 
                onClick={handleSubstitution}
                disabled={!subData.in || !subData.out}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px]"
               >
                 Confirmar Cambio
               </button>
               <button onClick={() => setIsSubmittingSub(false)} className="w-full text-slate-400 font-bold uppercase text-[10px]">
                 Cancelar
               </button>
            </div>
          </div>
        </div>
      )}
            {/* Main control panel */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-50 border border-slate-200 p-8 rounded-[40px]">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Control de Mesa</h1>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest leading-none mt-2">
            Marcador: <span className="text-blue-600">{homeClub?.name} vs {awayClub?.name}</span>
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {/* Active playing period status */}
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-600 text-white rounded-lg">
              Periodo: {match.currentPeriod || "No Iniciado"}
            </span>
            {match.status === MatchStatus.LIVE && (
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-green-500 text-white rounded-lg animate-pulse">
                ⏱️ Corriendo
              </span>
            )}
            {!isRunning && match.status === MatchStatus.LIVE && (
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-amber-500 text-white rounded-lg font-bold">
                ⏸️ Pausado
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-end md:items-center">
          {/* Rosters state control buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={() => toggleRosterLock('HOME')}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${match.isHomeRosterUnlocked 
                ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' 
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}
            >
              Planilla Local: {match.isHomeRosterUnlocked ? "Abierta 🔓" : "Bloqueada 🔒"}
            </button>

            <button
              onClick={() => toggleRosterLock('AWAY')}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${match.isAwayRosterUnlocked 
                ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' 
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}
            >
              Planilla Visita: {match.isAwayRosterUnlocked ? "Abierta 🔓" : "Bloqueada 🔒"}
            </button>

            <button 
              onClick={() => setIsSubmittingSub(true)}
              className="bg-white border-2 border-slate-200 px-4 py-3 rounded-2xl font-black text-[10px] text-slate-800 uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              Registrar Cambio 🔄
            </button>
          </div>

          {/* Timing control desk */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl flex items-center gap-6 shadow-xl border border-slate-800 w-full sm:w-auto justify-between">
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase leading-none mb-1.5 tracking-wider">Cronómetro</p>
              <p className={`text-3xl font-black tabular-nums leading-none tracking-tight ${match.currentMinute >= 40 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                {String(match.currentMinute ?? 0).padStart(2, '0')}:{String(match.currentSecond ?? 0).padStart(2, '0')}'
              </p>
            </div>

            <div className="flex gap-2">
              {match.status === MatchStatus.SCHEDULED && (
                <button 
                  onClick={handleStartMatchClick}
                  className="px-5 py-2.5 bg-green-600 text-white font-black text-[10px] uppercase rounded-xl hover:bg-green-700 transition"
                >
                  Iniciar Partido 🚀
                </button>
              )}

              {match.status === MatchStatus.LIVE && (
                <>
                  <button 
                    onClick={handleTogglePauseClick}
                    className={`px-4 py-2.5 font-black text-[10px] uppercase rounded-xl transition ${isRunning ? 'bg-amber-600 hover:bg-amber-700 text-white font-black' : 'bg-green-600 hover:bg-green-700 text-white font-black'}`}
                  >
                    {isRunning ? 'Pausar ⏸️' : 'Reanudar ▶️'}
                  </button>
                  <button 
                    onClick={handleDetencionClick}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase rounded-xl transition"
                  >
                    Detener ⏹️
                  </button>
                </>
              )}

              {match.currentPeriod === "Entretiempo" && (
                <button 
                  onClick={handleStartSecondHalfClick}
                  className="px-5 py-2.5 bg-purple-600 text-white font-black text-[10px] uppercase rounded-xl hover:bg-purple-700 transition"
                >
                  Iniciar 2do Tiempo 🚀
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Scoreboard display */}
      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl p-10 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-8">
          <div className="text-center space-y-3">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{homeClub?.name}</h2>
          </div>
          <div className="text-center bg-slate-50 py-10 rounded-[40px] border border-slate-100">
             <span className="text-[100px] leading-none font-black text-slate-900 tabular-nums">
               {match.homeScore} : {match.awayScore}
             </span>
             {match.status === MatchStatus.WAITING_VALIDATION && (
               <p className="text-[10px] font-black text-orange-600 mt-2">ESPERANDO APORTACIONES DE ENTRENADORES</p>
             )}
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{awayClub?.name}</h2>
          </div>
        </div>
      </div>

      {activeYellowCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeYellowCards.map(yc => {
            const player = MOCK_PLAYERS.find(p => p.id === yc.playerId);
            return (
              <div key={yc.id} className="bg-yellow-400 p-4 rounded-3xl shadow-lg flex items-center justify-between">
                <span className="font-black text-xs">#{player?.number} {player?.firstName}</span>
                <span className="bg-black/20 px-3 py-1.5 rounded-2xl font-black text-sm">{yc.remaining}'</span>
              </div>
            );
          })}
        </div>
      )}

      {/* tactical actions section */}
      {match.status !== MatchStatus.WAITING_VALIDATION && match.status !== MatchStatus.FINISHED && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* HOME team controls */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <header className="flex justify-between items-center border-b pb-6 uppercase flex-wrap gap-2">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-400 tracking-widest">{homeClub?.name}</h3>
                <span className="block text-[9px] font-extrabold text-blue-500">Sustituciones rest: {getRemainingSubs('HOME')} / {allowedSubstitutions}</span>
              </div>
              <span className="text-xl font-black text-blue-600">Score: {match.homeScore}</span>
            </header>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleActionClick(MatchEventType.TRY, 'HOME')} className="action-btn">TRY <span className="block text-[8px] opacity-60">+5 Pts</span></button>
              <button onClick={() => handleActionClick(MatchEventType.CONVERSION, 'HOME')} className="action-btn">CONV <span className="block text-[8px] opacity-60">+2 Pts</span></button>
              <button onClick={() => handleActionClick(MatchEventType.PENALTY_KICK, 'HOME')} className="action-btn">PENAL <span className="block text-[8px] opacity-60">+3 Pts</span></button>
              <button onClick={() => handleActionClick(MatchEventType.DROP_GOAL, 'HOME')} className="action-btn">DROP <span className="block text-[8px] opacity-60">+3 Pts</span></button>
              <button onClick={() => handleActionClick(MatchEventType.YELLOW_CARD, 'HOME')} className="action-btn border-yellow-250 hover:bg-yellow-50 text-yellow-600">AMARILLA</button>
              <button onClick={() => handleActionClick(MatchEventType.RED_CARD, 'HOME')} className="action-btn border-red-250 hover:bg-red-50 text-red-600">ROJA</button>
            </div>
            <button onClick={() => handleActionClick(MatchEventType.PENALTY_TRY, 'HOME')} className="w-full bg-slate-900 text-white font-black py-4 rounded-[24px]">Try Penal (+7)</button>

            {/* Event list for deletion */}
            <div className="border-t pt-6 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Eliminar Registros de {homeClub?.name}</h4>
              {events.filter(e => e.teamId === match.homeTeamId).length === 0 ? (
                <div className="text-center bg-slate-50 border border-dashed border-slate-200 p-4 rounded-2xl text-[10px] text-slate-400 font-bold uppercase">
                  Sin registros previos
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {events.filter(e => e.teamId === match.homeTeamId).map(ev => {
                    const player = MOCK_PLAYERS.find(p => p.id === ev.playerId);
                    const playerOut = ev.playerOutId ? MOCK_PLAYERS.find(p => p.id === ev.playerOutId) : null;
                    return (
                      <div key={ev.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-extrabold text-slate-800 uppercase text-[10px] leading-none">
                            {ev.type === MatchEventType.TRY && "🏉 TRY"}
                            {ev.type === MatchEventType.CONVERSION && "🎯 CONVERSIÓN"}
                            {ev.type === MatchEventType.PENALTY_KICK && "👟 PENAL"}
                            {ev.type === MatchEventType.DROP_GOAL && "🏉 DROP GOAL"}
                            {ev.type === MatchEventType.PENALTY_TRY && "⭐ TRY PENAL"}
                            {ev.type === MatchEventType.YELLOW_CARD && "🟨 AMARILLA"}
                            {ev.type === MatchEventType.RED_CARD && "🟥 ROJA"}
                            {ev.type === MatchEventType.SUBSTITUTION && "🔄 CAMBIO"}
                            <span className="text-slate-400 font-black ml-1">({ev.minute}')</span>
                          </p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase truncate">
                            {ev.type === MatchEventType.SUBSTITUTION 
                              ? `Entra: #${player?.number || ''} ${player?.firstName || ''} | Sale: #${playerOut?.number || ''} ${playerOut?.firstName || ''}`
                              : player ? `#${player.number} ${player.firstName} ${player.lastName}` : 'General'
                            }
                          </p>
                        </div>
                        <button 
                          onClick={() => handleRemoveEventClick(ev)}
                          className="px-2.5 py-1.5 bg-red-650 text-red-600 hover:text-white hover:bg-red-600 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 border border-red-250 active:scale-95 cursor-pointer shadow-sm"
                        >
                          Eliminar 🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* AWAY team controls */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <header className="flex justify-between items-center border-b pb-6 uppercase flex-wrap gap-2">
              <span className="text-xl font-black text-blue-600">Score: {match.awayScore}</span>
              <div className="space-y-1 text-right">
                <h3 className="text-xs font-black text-slate-400 tracking-widest">{awayClub?.name}</h3>
                <span className="block text-[9px] font-extrabold text-blue-500">Sustituciones rest: {getRemainingSubs('AWAY')} / {allowedSubstitutions}</span>
              </div>
            </header>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleActionClick(MatchEventType.TRY, 'AWAY')} className="action-btn">TRY <span className="block text-[8px] opacity-60">+5 Pts</span></button>
              <button onClick={() => handleActionClick(MatchEventType.CONVERSION, 'AWAY')} className="action-btn">CONV <span className="block text-[8px] opacity-60">+2 Pts</span></button>
              <button onClick={() => handleActionClick(MatchEventType.PENALTY_KICK, 'AWAY')} className="action-btn">PENAL <span className="block text-[8px] opacity-60">+3 Pts</span></button>
              <button onClick={() => handleActionClick(MatchEventType.DROP_GOAL, 'AWAY')} className="action-btn">DROP <span className="block text-[8px] opacity-60">+3 Pts</span></button>
              <button onClick={() => handleActionClick(MatchEventType.YELLOW_CARD, 'AWAY')} className="action-btn border-yellow-250 hover:bg-yellow-50 text-yellow-600">AMARILLA</button>
              <button onClick={() => handleActionClick(MatchEventType.RED_CARD, 'AWAY')} className="action-btn border-red-250 hover:bg-red-50 text-red-600">ROJA</button>
            </div>
            <button onClick={() => handleActionClick(MatchEventType.PENALTY_TRY, 'AWAY')} className="w-full bg-slate-900 text-white font-black py-4 rounded-[24px]">Try Penal (+7)</button>

            {/* Event list for deletion */}
            <div className="border-t pt-6 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Eliminar Registros de {awayClub?.name}</h4>
              {events.filter(e => e.teamId === match.awayTeamId).length === 0 ? (
                <div className="text-center bg-slate-50 border border-dashed border-slate-200 p-4 rounded-2xl text-[10px] text-slate-400 font-bold uppercase">
                  Sin registros previos
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {events.filter(e => e.teamId === match.awayTeamId).map(ev => {
                    const player = MOCK_PLAYERS.find(p => p.id === ev.playerId);
                    const playerOut = ev.playerOutId ? MOCK_PLAYERS.find(p => p.id === ev.playerOutId) : null;
                    return (
                      <div key={ev.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-extrabold text-slate-800 uppercase text-[10px] leading-none">
                            {ev.type === MatchEventType.TRY && "🏉 TRY"}
                            {ev.type === MatchEventType.CONVERSION && "🎯 CONVERSIÓN"}
                            {ev.type === MatchEventType.PENALTY_KICK && "👟 PENAL"}
                            {ev.type === MatchEventType.DROP_GOAL && "🏉 DROP GOAL"}
                            {ev.type === MatchEventType.PENALTY_TRY && "⭐ TRY PENAL"}
                            {ev.type === MatchEventType.YELLOW_CARD && "🟨 AMARILLA"}
                            {ev.type === MatchEventType.RED_CARD && "🟥 ROJA"}
                            {ev.type === MatchEventType.SUBSTITUTION && "🔄 CAMBIO"}
                            <span className="text-slate-400 font-black ml-1">({ev.minute}')</span>
                          </p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase truncate">
                            {ev.type === MatchEventType.SUBSTITUTION 
                              ? `Entra: #${player?.number || ''} ${player?.firstName || ''} | Sale: #${playerOut?.number || ''} ${playerOut?.firstName || ''}`
                              : player ? `#${player.number} ${player.firstName} ${player.lastName}` : 'General'
                            }
                          </p>
                        </div>
                        <button 
                          onClick={() => handleRemoveEventClick(ev)}
                          className="px-2.5 py-1.5 bg-red-650 text-red-600 hover:text-white hover:bg-red-600 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 border border-red-250 active:scale-95 cursor-pointer shadow-sm"
                        >
                          Eliminar 🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Button to Finish match by control table */}
      {match.status !== MatchStatus.WAITING_VALIDATION && match.status !== MatchStatus.FINISHED && (
        <div className="bg-slate-950 p-8 rounded-[40px] border border-slate-800 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="text-xl font-black uppercase">Finalizar Partido en Mesa</h4>
            <p className="text-slate-500 text-xs mt-1">Concluye el tiempo regular y activa la negociación o conciliación de 15 minutos para los Directores Técnicos.</p>
          </div>
          <button 
            onClick={handleCloseMatchByMesa}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-5 rounded-[24px] uppercase tracking-wider text-xs active:scale-[.98]"
          >
            Finalizar Partido
          </button>
        </div>
      )}

      {/* Modal Prompt para alertas, confirmaciones, y elecciones de tiempo de juego */}
      {modalPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-250">
            <div className="bg-slate-900 p-8 text-white relative">
              <h3 className="text-2xl font-black italic uppercase tracking-tight">{modalPrompt.title}</h3>
              <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Aviso Oficial de Mesa</p>
            </div>
            
            <div className="p-8 space-y-6">
              <p className="text-sm font-semibold text-slate-600 leading-relaxed uppercase tracking-wide">
                {modalPrompt.message}
              </p>
              
              <div className="flex flex-col gap-3 pt-2">
                {modalPrompt.type === 'ALERT' && (
                  <button
                    onClick={() => {
                      if (modalPrompt.onConfirm) modalPrompt.onConfirm();
                      setModalPrompt(null);
                    }}
                    className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-[20px] uppercase tracking-widest text-xs transition"
                  >
                    Entendido
                  </button>
                )}
                
                {modalPrompt.type === 'CONFIRM' && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setModalPrompt(null);
                        if (modalPrompt.onCancel) modalPrompt.onCancel();
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-extrabold py-4 rounded-[20px] uppercase tracking-wider text-xs transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (modalPrompt.onConfirm) modalPrompt.onConfirm();
                        setModalPrompt(null);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-[20px] uppercase tracking-wider text-xs transition shadow-md shadow-blue-200"
                    >
                      Seguir 🚀
                    </button>
                  </div>
                )}
                
                {modalPrompt.type === 'CHOICE_REFTIME' && (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        if (modalPrompt.onChoice) modalPrompt.onChoice(true);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-[20px] uppercase tracking-wide text-xs transition shadow-md shadow-purple-100"
                    >
                      Iniciar Tiempo Extra (+10' x Lado) ⏱️
                    </button>
                    <button
                      onClick={() => {
                        if (modalPrompt.onChoice) modalPrompt.onChoice(false);
                      }}
                      className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-[20px] uppercase tracking-wider text-xs transition"
                    >
                      Finalizar Partido Definitivo 🏁
                    </button>
                    <button
                      onClick={() => {
                        setModalPrompt(null);
                      }}
                      className="w-full text-slate-400 font-bold uppercase py-2 text-[10px] tracking-wider transition"
                    >
                      Volver Tras la Pausa
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. CENTRAL REFEREE WORKSPACE IMPLEMENTATION
// ==========================================
interface CentralProps {
  initialMatch: Match;
  triggerGlobalSync: (mId: string, updatedFields: Partial<Match>) => void;
}

const CentralWorkspace = ({ initialMatch, triggerGlobalSync }: CentralProps) => {
  const { user } = useAuth();
  const [matchState, setMatchState] = useState<Match>(initialMatch);
  const [typedPin, setTypedPin] = useState('');
  const [pinModal, setPinModal] = useState(false);
  const [alertPrompt, setAlertPrompt] = useState<{ title: string, message: string } | null>(null);

  // Poll state properties to update ticking countdown
  useEffect(() => {
    const freshMatch = MOCK_MATCHES.find(m => m.id === initialMatch.id);
    if (freshMatch) {
      setMatchState({ ...freshMatch });
    }
  }, [initialMatch.id]);

  const homeClub = MOCK_CLUBS[matchState.homeTeamId];
  const awayClub = MOCK_CLUBS[matchState.awayTeamId];

  const validationTimer = getValidationTimerStatus(matchState);

  // Check if signature can be unlocked
  const bothCoachesAccepted = matchState.homeAcceptedScore && matchState.awayAcceptedScore;
  const signatureIsEnabled = bothCoachesAccepted || validationTimer.expired;

  const handleSimulate15Minutes = () => {
    const elapsedDate = new Date(Date.now() - 16 * 60 * 1000); // 16 minutes ago
    const idx = MOCK_MATCHES.findIndex(m => m.id === matchState.id);
    if (idx !== -1) {
      MOCK_MATCHES[idx] = {
        ...MOCK_MATCHES[idx],
        finishTime: elapsedDate,
        status: MatchStatus.WAITING_VALIDATION
      };
      setMatchState({ ...MOCK_MATCHES[idx] });
    }
    setAlertPrompt({
      title: "Tiempo Simulado ⏱️",
      message: "Se han retrasado las marcas temporales. El tiempo de 15 minutos de los entrenadores ha expirado ficticiamente. La firma forzada del central ha sido habilitada."
    });
  };

  const handleApplySignature = () => {
    setPinModal(true);
  };

  const confirmSignaturePin = () => {
    const userPin = (user as any)?.pin || '1234';
    if (typedPin.trim() === userPin) {
      const idx = MOCK_MATCHES.findIndex(m => m.id === matchState.id);
      if (idx !== -1) {
        MOCK_MATCHES[idx] = {
          ...MOCK_MATCHES[idx],
          status: MatchStatus.FINISHED,
          isSigned: true
        };
        setMatchState({ ...MOCK_MATCHES[idx] });
      }
      setPinModal(false);
      setTypedPin('');
      setAlertPrompt({
        title: "Cierre Oficial Completado ✅",
        message: "El partido ha sido firmado digitalmente y salvado permanentemente. Las puntuaciones están congeladas con validez legal de torneo."
      });
    } else {
      setAlertPrompt({
        title: "PIN Inválido 🚫",
        message: "El PIN ingresado es incorrecto. Por favor, verifica el PIN en tu perfil de usuario."
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Simulation badge helper */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-xs font-black uppercase text-slate-800">Centro de Simulación de Tiempo</h4>
          <p className="text-[10px] font-semibold text-slate-400 mt-1 max-w-[380px]">
            Para facilitar las pruebas del flujo de 15 minutos, puedes adelantar artificialmente el tiempo presionando este botón.
          </p>
        </div>
        <button 
          onClick={handleSimulate15Minutes}
          className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black px-5 py-3 rounded-xl text-[9px] uppercase tracking-wider transition-all"
        >
          ⏱️ Simular paso de 15'
        </button>
      </div>

      {/* Main audit card */}
      <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400">Acta Arbitral</span>
            <h3 className="text-xl font-black uppercase tracking-tight italic">Auditoría del Encuentro</h3>
          </div>
          <span className="text-xl font-black text-slate-900 tabular-nums">
            {matchState.homeScore} - {matchState.awayScore}
          </span>
        </div>

        {/* Status of acceptance from Coaches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home team */}
          <div className="p-6 rounded-2xl border bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400">Club Local</span>
              <span className="text-xs font-black uppercase">{homeClub?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {matchState.homeAcceptedScore ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                ) : matchState.isDisputeActive && matchState.declinedByCoachId === matchState.homeTeamId ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                )}
              </div>
              <p className="text-xs font-black uppercase">
                {matchState.homeAcceptedScore ? (
                  <span className="text-green-600">Marcador Aceptado ✅</span>
                ) : matchState.isDisputeActive && matchState.declinedByCoachId === matchState.homeTeamId ? (
                  <span className="text-red-600">Rechazado (En Disputa/Inconforme) ❌</span>
                ) : (
                  <span className="text-amber-500">Aprobación Pendiente ⌛</span>
                )}
              </p>
            </div>
          </div>

          {/* Away team */}
          <div className="p-6 rounded-2xl border bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400">Club Visitante</span>
              <span className="text-xs font-black uppercase">{awayClub?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {matchState.awayAcceptedScore ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                ) : matchState.isDisputeActive && matchState.declinedByCoachId === matchState.awayTeamId ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                )}
              </div>
              <p className="text-xs font-black uppercase">
                {matchState.awayAcceptedScore ? (
                  <span className="text-green-600">Marcador Aceptado ✅</span>
                ) : matchState.isDisputeActive && matchState.declinedByCoachId === matchState.awayTeamId ? (
                  <span className="text-red-600">Rechazado (En Disputa/Inconforme) ❌</span>
                ) : (
                  <span className="text-amber-500">Aprobación Pendiente ⌛</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Validation Countdown Timer */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
          <div className="space-y-1">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOLERANCIA DE CONCILIACIÓN</p>
             <h4 className="text-lg font-black uppercase tracking-tight">Tiempo restante de firmas</h4>
          </div>
          <div className="text-right">
             <span className="text-2xl font-black text-blue-400 tabular-nums">{validationTimer.text}</span>
             {validationTimer.expired && (
               <p className="text-[8px] font-black text-green-400 uppercase mt-0.5">Firma forzada habilitada</p>
             )}
          </div>
        </div>
      </div>

      {/* Actual closure signature footer */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h4 className="text-xl font-black uppercase leading-none">Firma Central Definitiva</h4>
          <p className="text-slate-400 text-xs mt-1.5 max-w-[450px]">
             {signatureIsEnabled 
               ? "Suficientes firmas colectadas o ventana de 15 min expirada. Listo para congelar marcador permanente."
               : "Fórmula de firma bloqueada. Se requiere la aceptación voluntaria de ambos directores técnicos o que expire el cronómetro de 15 minutos."
             }
          </p>
        </div>

        {matchState.isSigned || matchState.status === MatchStatus.FINISHED ? (
          <div className="bg-green-150 border border-green-200 text-green-700 px-8 py-4 rounded-full flex items-center gap-2 font-black text-xs uppercase uppercase-widest">
            Marcador Congelado ✅
          </div>
        ) : (
          <button
            onClick={handleApplySignature}
            disabled={!signatureIsEnabled}
            className={`font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl transition-all shadow-xl ${signatureIsEnabled ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
          >
            Firmar Acta de Juego
          </button>
        )}
      </div>

      {pinModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-purple-700 p-8 text-white text-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Firma Árbitro Central</h3>
              <p className="text-[10px] text-purple-200 mt-1 uppercase">Ingresa tu PIN personal para archivar el marcador</p>
            </div>
            <div className="p-8 space-y-6">
              <input 
                type="password" 
                maxLength={4}
                value={typedPin}
                onChange={e => setTypedPin(e.target.value)}
                className="w-full text-center tracking-[1em] text-2xl font-black bg-slate-50 border rounded-2xl p-5 text-slate-900"
                placeholder="••••"
              />
              <button 
                onClick={confirmSignaturePin}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest"
              >
                Cerrar Partido Exitosamente
              </button>
              <button 
                onClick={() => setPinModal(false)}
                className="w-full text-slate-400 font-bold uppercase text-[10px]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Overlay Modal */}
      {alertPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-8 text-white text-center">
              <h3 className="text-xl font-black uppercase tracking-tight">{alertPrompt.title}</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Aviso de Firma Central</p>
            </div>
            <div className="p-8 space-y-6 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
                {alertPrompt.message}
              </p>
              <button 
                onClick={() => setAlertPrompt(null)}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchControl;
