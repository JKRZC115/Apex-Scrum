import React, { useState } from 'react';
import { useMatchEngine } from '../../core/hooks/useMatchEngine';
import { MOCK_MATCHES, MOCK_CLUBS, MOCK_PLAYERS } from '../../core/mocks/mockData';
import { MatchEventType, MatchStatus, MatchEvent, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const MatchControl = () => {
  const { user } = useAuth();
  const liveMatch = MOCK_MATCHES.find(m => m.status === MatchStatus.LIVE) || MOCK_MATCHES[0];
  const { match, events, isRunning, setIsRunning, addEvent, removeEvent, toggleRosterLock, getActiveYellowCards } = useMatchEngine(liveMatch);

  const activeYellowCards = getActiveYellowCards();

  const [pendingEvent, setPendingEvent] = useState<{ type: MatchEventType, teamId: 'HOME' | 'AWAY' } | null>(null);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);
  const [subData, setSubData] = useState<{ teamId: 'HOME' | 'AWAY', in?: string, out?: string }>({ teamId: 'HOME' });

  const homeClub = MOCK_CLUBS[match.homeTeamId];
  const awayClub = MOCK_CLUBS[match.awayTeamId];

  if (!user || (!user.roles.includes(UserRole.REFEREE) && !user.roles.includes(UserRole.ADMIN))) {
    return <Navigate to="/login" />;
  }

  const handleActionClick = (type: MatchEventType, teamId: 'HOME' | 'AWAY') => {
    if (type === MatchEventType.PENALTY_TRY) {
      addEvent(type, teamId);
    } else {
      setPendingEvent({ type, teamId });
    }
  };

  const confirmEvent = (playerId: string) => {
    if (pendingEvent) {
      addEvent(pendingEvent.type, pendingEvent.teamId, playerId);
      setPendingEvent(null);
    }
  };

  const handleSubstitution = () => {
    if (subData.in && subData.out) {
      addEvent(MatchEventType.SUBSTITUTION, subData.teamId, subData.in, subData.out);
      setIsSubmittingSub(false);
      setSubData({ teamId: 'HOME' });
    }
  };

  const getTeamPlayers = (teamId: 'HOME' | 'AWAY') => {
    const clubId = teamId === 'HOME' ? match.homeTeamId : match.awayTeamId;
    return MOCK_PLAYERS.filter(p => p.clubId === clubId);
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Modal de Selección de Jugador */}
      {pendingEvent && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Seleccionar Jugador</h3>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                {pendingEvent.type.replace('_', ' ')} • {pendingEvent.teamId === 'HOME' ? (homeClub?.name || 'Local') : (awayClub?.name || 'Visitante')}
              </p>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-2">
              {getTeamPlayers(pendingEvent.teamId).map(p => (
                <button 
                  key={p.id}
                  onClick={() => confirmEvent(p.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-xs font-black text-white group-hover:bg-blue-600">
                      {p.number}
                    </span>
                    <span className="font-black text-slate-900 uppercase text-sm tracking-tight">{p.firstName} {p.lastName}</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPendingEvent(null)}
              className="w-full bg-slate-100 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Sustitución */}
      {isSubmittingSub && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-8 text-white">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Registrar Cambio</h3>
              <div className="mt-4 flex bg-blue-700/50 p-1 rounded-xl">
                 <button 
                  onClick={() => setSubData({ ...subData, teamId: 'HOME', in: undefined, out: undefined })}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subData.teamId === 'HOME' ? 'bg-white text-blue-600 shadow-lg' : 'text-blue-200'}`}
                 >
                   {homeClub?.name || 'Local'}
                 </button>
                 <button 
                  onClick={() => setSubData({ ...subData, teamId: 'AWAY', in: undefined, out: undefined })}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subData.teamId === 'AWAY' ? 'bg-white text-blue-600 shadow-lg' : 'text-blue-200'}`}
                 >
                   {awayClub?.name || 'Visitante'}
                 </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale (Player Out)</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none border-l-4 border-l-red-500"
                      value={subData.out || ''}
                      onChange={e => setSubData({ ...subData, out: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {getTeamPlayers(subData.teamId).map(p => <option key={p.id} value={p.id}>#{p.number} {p.firstName} {p.lastName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entra (Player In)</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none border-l-4 border-l-green-500"
                      value={subData.in || ''}
                      onChange={e => setSubData({ ...subData, in: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {getTeamPlayers(subData.teamId).map(p => <option key={p.id} value={p.id}>#{p.number} {p.firstName} {p.lastName}</option>)}
                    </select>
                  </div>
               </div>
               <button 
                onClick={handleSubstitution}
                disabled={!subData.in || !subData.out}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] hover:bg-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50 disabled:pointer-events-none"
               >
                 Confirmar Cambio
               </button>
               <button 
                onClick={() => setIsSubmittingSub(false)}
                className="w-full text-slate-400 font-bold uppercase tracking-widest text-[10px]"
               >
                 Cancelar
               </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase leading-none tracking-tighter">Control de Mesa</h1>
          <p className="text-slate-500 text-xs font-black mt-2 uppercase tracking-widest">Operador: <span className="text-blue-600">{user.name}</span> • <span className="text-slate-400">{match.id}</span></p>
         </div>
         <div className="flex gap-2">
            <div className="flex flex-col gap-2">
               <button 
                 onClick={() => toggleRosterLock('HOME')}
                 className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border-2 ${match.isHomeRosterUnlocked ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-600'}`}
               >
                 {match.isHomeRosterUnlocked ? `${homeClub?.name?.substring(0,6) || 'Local'} OK` : `Habilitar ${homeClub?.name?.substring(0,6) || 'Local'}`}
               </button>
               <button 
                 onClick={() => toggleRosterLock('AWAY')}
                 className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border-2 ${match.isAwayRosterUnlocked ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-600'}`}
               >
                 {match.isAwayRosterUnlocked ? `${awayClub?.name?.substring(0,6) || 'Visit'} OK` : `Habilitar ${awayClub?.name?.substring(0,6) || 'Visit'}`}
               </button>
            </div>
            <button 
              onClick={() => setIsSubmittingSub(true)}
              className="bg-white border-2 border-slate-200 px-4 rounded-xl font-black text-[9px] text-slate-600 uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              Cambios
            </button>
            <div className="bg-slate-900 p-4 rounded-[24px] flex items-center gap-8 shadow-2xl border border-slate-700 overflow-hidden">
                <div className="text-center px-2">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[.3em] leading-none mb-2">Reloj</p>
                  <p className="text-3xl font-black text-blue-400 tabular-nums leading-none">
                    {match.currentMinute}'
                  </p>
                </div>
                <div className="h-10 w-px bg-slate-800"></div>
                <button 
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-8 py-3 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg ${isRunning ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-900/20' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-900/20'}`}
                >
                  {isRunning ? 'DETENER' : 'REANUDAR'}
                </button>
            </div>
         </div>
      </header>

      {/* Marcador Principal */}
      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl p-10 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-8 relative z-10">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] mx-auto flex items-center justify-center border-4 border-white shadow-xl">
               <span className="text-4xl font-black text-slate-200">{homeClub?.name?.[0] || '?'}</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight max-w-[150px] mx-auto">{homeClub?.name || 'Local'}</h2>
          </div>

          <div className="text-center bg-slate-50 py-10 rounded-[40px] border border-slate-100 shadow-inner">
             <div className="inline-flex flex-col items-center">
                <span className="text-[100px] leading-none font-black text-slate-900 tabular-nums flex items-center gap-2 tracking-tighter">
                  {match.homeScore}<span className="text-slate-200 opacity-50 font-light">:</span>{match.awayScore}
                </span>
                <div className="mt-4 flex items-center gap-3">
                   <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                   <span className="bg-white text-slate-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[.4em] shadow-sm border border-slate-100">Score Final</span>
                   <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                </div>
             </div>
          </div>

          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] mx-auto flex items-center justify-center border-4 border-white shadow-xl">
               <span className="text-4xl font-black text-slate-200">{awayClub?.name?.[0] || '?'}</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight max-w-[150px] mx-auto">{awayClub?.name || 'Visitante'}</h2>
          </div>
        </div>
      </div>

      {/* Tarjetas Amarillas Activas (Timers) */}
      {activeYellowCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
          {activeYellowCards.map(yc => {
            const player = MOCK_PLAYERS.find(p => p.id === yc.playerId);
            const isHome = yc.teamId === match.homeTeamId;
            return (
              <div key={yc.id} className="bg-yellow-400 p-4 rounded-3xl shadow-lg flex items-center justify-between border-b-4 border-yellow-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black/10 rounded-xl flex items-center justify-center font-black text-xs">
                    #{player?.number}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase leading-none">{player?.firstName}</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 mt-1 truncate max-w-[80px]">
                      {isHome ? (homeClub?.name || 'Local') : (awayClub?.name || 'Visitante')}
                    </p>
                  </div>
                </div>
                <div className="text-center bg-black/20 px-3 py-1.5 rounded-2xl">
                   <p className="text-[8px] font-black uppercase opacity-60">Regresa</p>
                   <p className="text-xl font-black tabular-nums">{yc.remaining}'</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Panel de Control Táctico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
          <header className="flex justify-between items-center border-b border-slate-50 pb-6 uppercase">
            <h3 className="text-xs font-black text-slate-400 tracking-[.3em]">{homeClub.name}</h3>
            <span className="text-xl font-black text-blue-600 italic">Score: {match.homeScore}</span>
          </header>
          
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleActionClick(MatchEventType.TRY, 'HOME')} className="action-btn">TRY <span className="block text-[8px] text-blue-600 opacity-60 mt-1 uppercase tracking-widest">+5 PUNTOS</span></button>
            <button onClick={() => handleActionClick(MatchEventType.CONVERSION, 'HOME')} className="action-btn">CONV <span className="block text-[8px] text-blue-600 opacity-60 mt-1 uppercase tracking-widest">+2 PUNTOS</span></button>
            <button onClick={() => handleActionClick(MatchEventType.PENALTY_KICK, 'HOME')} className="action-btn">PENAL <span className="block text-[8px] text-blue-600 opacity-60 mt-1 uppercase tracking-widest">+3 PUNTOS</span></button>
            <button onClick={() => handleActionClick(MatchEventType.DROP_GOAL, 'HOME')} className="action-btn">DROP <span className="block text-[8px] text-blue-600 opacity-60 mt-1 uppercase tracking-widest">+3 PUNTOS</span></button>
            <button onClick={() => handleActionClick(MatchEventType.YELLOW_CARD, 'HOME')} className="action-btn bg-yellow-400/5 hover:border-yellow-400 hover:text-yellow-600 border-yellow-100 flex flex-col items-center justify-center gap-1">
              <div className="w-4 h-6 bg-yellow-400 rounded-sm"></div>
              AMARILLA
            </button>
            <button onClick={() => handleActionClick(MatchEventType.RED_CARD, 'HOME')} className="action-btn bg-red-400/5 hover:border-red-500 hover:text-red-700 border-red-100 flex flex-col items-center justify-center gap-1">
              <div className="w-4 h-6 bg-red-500 shadow-lg shadow-red-200"></div>
              ROJA
            </button>
          </div>
          <button onClick={() => handleActionClick(MatchEventType.PENALTY_TRY, 'HOME')} className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[.98] uppercase tracking-widest text-xs">Try Penal (+7)</button>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
          <header className="flex justify-between items-center border-b border-slate-50 pb-6 uppercase">
             <span className="text-xl font-black text-blue-600 italic">Score: {match.awayScore}</span>
            <h3 className="text-xs font-black text-slate-400 tracking-[.3em]">{awayClub.name}</h3>
          </header>
          
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleActionClick(MatchEventType.TRY, 'AWAY')} className="action-btn">TRY <span className="block text-[8px] text-blue-600 opacity-60 mt-1 uppercase tracking-widest">+5 PUNTOS</span></button>
            <button onClick={() => handleActionClick(MatchEventType.CONVERSION, 'AWAY')} className="action-btn">CONV <span className="block text-[8px] text-blue-600 opacity-60 mt-1 uppercase tracking-widest">+2 PUNTOS</span></button>
            <button onClick={() => handleActionClick(MatchEventType.PENALTY_KICK, 'AWAY')} className="action-btn">PENAL <span className="block text-[8px] text-blue-600 opacity-60 mt-1 uppercase tracking-widest">+3 PUNTOS</span></button>
            <button onClick={() => handleActionClick(MatchEventType.DROP_GOAL, 'AWAY')} className="action-btn">DROP <span className="block text-[8px] text-blue-600 opacity-60 mt-1 uppercase tracking-widest">+3 PUNTOS</span></button>
            <button onClick={() => handleActionClick(MatchEventType.YELLOW_CARD, 'AWAY')} className="action-btn bg-yellow-400/5 hover:border-yellow-400 hover:text-yellow-600 border-yellow-100 flex flex-col items-center justify-center gap-1">
              <div className="w-4 h-6 bg-yellow-400 rounded-sm"></div>
              AMARILLA
            </button>
            <button onClick={() => handleActionClick(MatchEventType.RED_CARD, 'AWAY')} className="action-btn bg-red-400/5 hover:border-red-500 hover:text-red-700 border-red-100 flex flex-col items-center justify-center gap-1">
              <div className="w-4 h-6 bg-red-500 shadow-lg shadow-red-200"></div>
              ROJA
            </button>
          </div>
          <button onClick={() => handleActionClick(MatchEventType.PENALTY_TRY, 'AWAY')} className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[.98] uppercase tracking-widest text-xs">Try Penal (+7)</button>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800 italic uppercase">Línea de Tiempo Detallada</h2>
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          {events.length === 0 ? (
            <div className="p-20 text-center text-slate-300 uppercase tracking-widest font-black text-xs">Sin eventos registrados</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {[...events].reverse().map(event => {
                const player = MOCK_PLAYERS.find(p => p.id === event.playerId);
                return (
                  <div key={event.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-8">
                      <div className="text-center w-12">
                        <span className="text-2xl font-black text-blue-600 tabular-nums">{event.minute}'</span>
                      </div>
                      <div className="w-px h-10 bg-slate-100"></div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{event.type.replace('_', ' ')}</p>
                           {event.points > 0 && <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+{event.points}</span>}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                          {MOCK_CLUBS[event.teamId]?.name || 'Equipo'} 
                          {event.type === MatchEventType.SUBSTITUTION ? (
                            <>
                              • OUT: {MOCK_PLAYERS.find(p => p.id === event.playerOutId)?.firstName} {MOCK_PLAYERS.find(p => p.id === event.playerOutId)?.lastName} 
                              / IN: {MOCK_PLAYERS.find(p => p.id === event.playerId)?.firstName} {MOCK_PLAYERS.find(p => p.id === event.playerId)?.lastName}
                            </>
                          ) : (
                            player ? ` • #${player.number} ${player.firstName} ${player.lastName}` : ''
                          )}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeEvent(event.id)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-slate-900 p-10 rounded-[48px] text-white flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h4 className="text-xl font-black italic uppercase tracking-tighter">Finalizar Encuentro</h4>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Se requiere firma digital del referee central</p>
         </div>
         <button className="bg-blue-600 px-12 py-5 rounded-3xl font-black uppercase italic tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/50 active:scale-95">Validar con PIN</button>
      </footer>
    </div>
  );
};

export default MatchControl;
