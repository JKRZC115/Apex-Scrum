import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_MATCHES, MOCK_CLUBS, MOCK_PLAYERS as INITIAL_PLAYERS } from '../../core/mocks/mockData';
import { MatchStatus, MatchModality, Player, UserRole, Match } from '../../types';
import { Navigate } from 'react-router-dom';
import { useMatchEngine } from '../../core/hooks/useMatchEngine';

export const CoachModule = () => {
  const { user } = useAuth();
  
  // Find matches involving this coach's club
  const coachClubId = user?.clubId || '';
  const myMatches = MOCK_MATCHES.filter(m => m.homeTeamId === coachClubId || m.awayTeamId === coachClubId);
  const activeMatch = myMatches.find(m => m.status === MatchStatus.WAITING_VALIDATION || m.status === MatchStatus.LIVE) || myMatches[0] || MOCK_MATCHES[1];

  const { match, setMatch, canEditRoster } = useMatchEngine(activeMatch);
  
  const [ticker, setTicker] = useState(0); // Ticking clocks every second
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS.filter(p => p.clubId === user?.clubId));
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', number: '', idCard: '' });
  const [errorMessage, setErrorMessage] = useState('');

  // Confirmation Modals State
  const [showConfirmAccept, setShowConfirmAccept] = useState(false);
  const [showRejectNotice, setShowRejectNotice] = useState(false);
  const [coachTypedPin, setCoachTypedPin] = useState('');
  const [coachPinError, setCoachPinError] = useState('');

  const isLocked = !canEditRoster(user?.clubId);

  // Poll state properties to tick countdown timers every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user || !user.isApproved || (!user.roles.includes(UserRole.COACH) && !user.roles.includes(UserRole.ADMIN))) {
    return <Navigate to="/login" />;
  }

  const formatCountdown = (m: Match) => {
    if (!m.finishTime) return "15:00";
    const finished = new Date(m.finishTime).getTime();
    const limit = finished + 15 * 60 * 1000;
    const now = Date.now();
    const diff = limit - now;
    if (diff <= 0) {
      return "00:00 (Expirado)";
    }
    const secs = Math.floor(diff / 1000);
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const isTimerExpired = (m: Match) => {
    if (!m.finishTime) return false;
    const limit = new Date(m.finishTime).getTime() + 15 * 60 * 1000;
    return Date.now() > limit;
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const maxPlayers = match.modality === 'XVS' ? 23 : 12;
    if (players.length >= maxPlayers) {
      setErrorMessage(`No puedes inscribir más de ${maxPlayers} jugadores para la modalidad de ${match.modality}. Planilla Completa.`);
      return;
    }

    const num = parseInt(newPlayer.number);
    if (players.some(p => p.number === num)) {
      setErrorMessage(`El número ${num} ya está asignado en tu equipo.`);
      return;
    }

    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      clubId: user.clubId!,
      firstName: newPlayer.firstName,
      lastName: newPlayer.lastName,
      number: num,
      idCard: newPlayer.idCard,
      isMedicalBlocked: false,
      isSuspended: false
    };

    const updatedPlayers = [...players, player];
    setPlayers(updatedPlayers);
    INITIAL_PLAYERS.push(player);

    // Sync to active match rosters so the referee can immediately see and use these players
    const isHome = coachClubId === match.homeTeamId;
    const rosterKey = isHome ? 'homeRosterIds' : 'awayRosterIds';
    const updatedRoster = [...(match[rosterKey] || []), player.id];

    // Update global MOCK_MATCHES
    const idx = MOCK_MATCHES.findIndex(m => m.id === match.id);
    if (idx !== -1) {
      MOCK_MATCHES[idx][rosterKey] = updatedRoster;
    }

    setMatch(prev => ({
      ...prev,
      [rosterKey]: updatedRoster
    }));

    setShowAddPlayer(false);
    setNewPlayer({ firstName: '', lastName: '', number: '', idCard: '' });
  };

  const handleDeletePlayer = (playerId: string) => {
    if (isLocked) return;
    setPlayers(prev => prev.filter(p => p.id !== playerId));

    // Remove from mock database too
    const dbIndex = INITIAL_PLAYERS.findIndex(p => p.id === playerId);
    if (dbIndex !== -1) {
      INITIAL_PLAYERS.splice(dbIndex, 1);
    }

    // Update active match rosters
    const isHome = coachClubId === match.homeTeamId;
    const rosterKey = isHome ? 'homeRosterIds' : 'awayRosterIds';
    const updatedRoster = (match[rosterKey] || []).filter(id => id !== playerId);

    const idx = MOCK_MATCHES.findIndex(m => m.id === match.id);
    if (idx !== -1) {
      MOCK_MATCHES[idx][rosterKey] = updatedRoster;
    }

    setMatch(prev => ({
      ...prev,
      [rosterKey]: updatedRoster
    }));
  };

  // Helper to determine home or away role for coach
  const isHomeCoach = coachClubId === activeMatch.homeTeamId;

  const handleAcceptScore = () => {
    setShowConfirmAccept(true);
  };

  const confirmAcceptAction = () => {
    setCoachPinError('');
    const userPin = (user as any)?.pin || '1234';
    if (coachTypedPin.trim() !== userPin) {
      setCoachPinError('PIN incorrecto. Por favor, verifica el PIN en tu perfil.');
      return;
    }

    const idx = MOCK_MATCHES.findIndex(m => m.id === activeMatch.id);
    if (idx !== -1) {
      if (isHomeCoach) {
        MOCK_MATCHES[idx].homeAcceptedScore = true;
      } else {
        MOCK_MATCHES[idx].awayAcceptedScore = true;
      }
      activeMatch.homeAcceptedScore = MOCK_MATCHES[idx].homeAcceptedScore;
      activeMatch.awayAcceptedScore = MOCK_MATCHES[idx].awayAcceptedScore;
    }
    setShowConfirmAccept(false);
    setCoachTypedPin('');
    alert("¡Éxito! Has aceptado oficialmente el marcador.");
  };

  const handleDeclineScore = () => {
    const idx = MOCK_MATCHES.findIndex(m => m.id === activeMatch.id);
    if (idx !== -1) {
      MOCK_MATCHES[idx].isDisputeActive = true;
      MOCK_MATCHES[idx].declinedByCoachId = coachClubId;
      activeMatch.isDisputeActive = true;
      activeMatch.declinedByCoachId = coachClubId;
    }
    setShowRejectNotice(true);
  };

  // Helper simulator
  const simulate15Minutes = () => {
    const idx = MOCK_MATCHES.findIndex(m => m.id === activeMatch.id);
    if (idx !== -1) {
      MOCK_MATCHES[idx].finishTime = new Date(Date.now() - 16 * 60 * 1000); // 16 mins ago
      activeMatch.finishTime = MOCK_MATCHES[idx].finishTime;
    }
    alert("Simulación: Se ha adelantado el cronómetro 15 minutos en el partido '" + activeMatch.id + "'.");
  };

  return (
    <div className="space-y-8 relative">
      {/* Modal Inscribir Jugador */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl">
             <div className="bg-blue-600 p-8 text-white">
                <h3 className="text-2xl font-black italic uppercase">Inscribir Jugador</h3>
             </div>
             <form onSubmit={handleAddPlayer} className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase">Nombre(s)</label>
                         <input required type="text" value={newPlayer.firstName} onChange={e => setNewPlayer({ ...newPlayer, firstName: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-5 py-4 text-xs font-bold text-slate-900" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase">Apellidos</label>
                         <input required type="text" value={newPlayer.lastName} onChange={e => setNewPlayer({ ...newPlayer, lastName: e.target.value })} className="w-full bg-slate-50 border rounded-2xl px-5 py-4 text-xs font-bold text-slate-900" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Camiseta #</label>
                      <input required type="number" value={newPlayer.number} onChange={e => setNewPlayer({ ...newPlayer, number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900" />
                   </div>
                </div>
                {errorMessage && <p className="text-red-500 text-[10px] font-black text-center">{errorMessage}</p>}
                <div className="flex gap-4">
                   <button type="button" onClick={() => setShowAddPlayer(false)} className="flex-1 font-black text-[10px] text-slate-400 uppercase">Cancelar</button>
                   <button type="submit" className="flex-1 bg-slate-900 text-white font-black py-4 rounded-xl text-[10px] uppercase">Guardar</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Acceptance confirmation modal */}
      {showConfirmAccept && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-green-600 p-8 text-white text-center">
              <h3 className="text-2xl font-black italic uppercase">Aceptar Marcador</h3>
              <p className="text-xs text-green-150 mt-1">¿Estás seguro de que la información del partido es correcta?</p>
            </div>
            <div className="p-8 space-y-6 text-center">
              <p className="text-sm font-semibold text-slate-600">
                Al aceptar, confirmas que el marcador de <span className="font-black text-slate-900">{activeMatch.homeScore} : {activeMatch.awayScore}</span> es fiel reflejo de lo acontecido. Esta acción no se podrá deshacer.
              </p>
              
              <div className="bg-slate-50 p-5 rounded-3xl space-y-2 text-left">
                <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest block pl-1">
                  Ingresa tu PIN de firma
                </label>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="••••"
                  value={coachTypedPin} 
                  onChange={e => setCoachTypedPin(e.target.value.replace(/\D/g, ''))} 
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-center text-xs font-black tracking-[0.5em] outline-none text-slate-900" 
                />
                {coachPinError && (
                  <p className="text-red-500 text-[10px] font-black text-center mt-1">{coachPinError}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowConfirmAccept(false);
                    setCoachTypedPin('');
                    setCoachPinError('');
                  }}
                  className="flex-1 py-4 font-black uppercase text-slate-400 text-xs"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmAcceptAction}
                  className="flex-1 bg-green-600 text-white font-black py-4 rounded-2xl text-xs uppercase"
                >
                  Concordar y Firmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discrepancy rejection alert modal */}
      {showRejectNotice && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-red-600 p-8 text-white text-center">
              <h3 className="text-2xl font-black italic uppercase">⚠️ Reclamo Registrado</h3>
              <p className="text-xs text-red-100 mt-1">Procedimiento de Resolucion de Inconformidades</p>
            </div>
            <div className="p-8 space-y-6 text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl">
                <p className="font-black text-sm uppercase italic">Por favor, acércate inmediatamente a la Mesa de Control para resolver tu reclamación.</p>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Has declinado el marcador. El Árbitro Central ha sido notificado sobre la disputa. Tienen un plazo improrrogable para conciliar cualquier discrepancy en los registros con la mesa antes de que expire la tolerancia.
              </p>
              <button 
                onClick={() => setShowRejectNotice(false)}
                className="w-full bg-slate-950 text-white py-4 rounded-xl text-xs font-black uppercase"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase">Hola, {user.name}</h1>
          <p className="text-slate-500 font-medium">Entrenador de: <span className="text-blue-600 font-black">{MOCK_CLUBS[coachClubId]?.name || 'Mi Equipo'}</span></p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={simulate15Minutes}
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black px-4 py-2.5 rounded-xl text-[9px] uppercase tracking-wider block"
          >
            ⏱️ Forzar timer de 15' (Admin-Sim)
          </button>
        </div>
      </header>

      {/* SECTION 1: ACTIVE MATCH CONCILIATION OR LIVE SCORING */}
      <section className="bg-white border rounded-[36px] p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-blue-600"></div>
        
        <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight italic text-slate-900">Seguimiento y Validación de Marcador</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">ID Partido: {activeMatch.id}</p>
          </div>
          
          <div className="flex gap-2">
            {activeMatch.status === MatchStatus.LIVE && (
              <span className="text-[9px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full animate-pulse uppercase">● EN VIVO</span>
            )}
            {activeMatch.status === MatchStatus.WAITING_VALIDATION && (
              <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">ESPERANDO APROBACIÓN DE DT's</span>
            )}
            {(activeMatch.status === MatchStatus.FINISHED || activeMatch.isSigned) && (
              <span className="text-[9px] font-black text-green-700 bg-green-50 px-3 py-1 rounded-full uppercase">CERRADO Y FIRMADO POST-JUEGO 🔒</span>
            )}
          </div>
        </div>

        {/* Live scores and team names */}
        <div className="bg-slate-50 rounded-3xl p-6 flex justify-between items-center text-center border">
          <div className="flex-1">
            <h4 className="font-black text-slate-900 uppercase text-xs md:text-sm">{MOCK_CLUBS[activeMatch.homeTeamId]?.name}</h4>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Local</span>
          </div>
          <div className="px-6 py-3 bg-white border rounded-2xl">
            <span className="text-4xl font-black tabular-nums text-slate-950">
              {activeMatch.homeScore} - {activeMatch.awayScore}
            </span>
            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Resultado en Vivo</p>
          </div>
          <div className="flex-1">
            <h4 className="font-black text-slate-900 uppercase text-xs md:text-sm">{MOCK_CLUBS[activeMatch.awayTeamId]?.name}</h4>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Visitante</span>
          </div>
        </div>

        {/* MATCH ACTIONS FOR CONCILIATION TIMER */}
        {activeMatch.status === MatchStatus.WAITING_VALIDATION && (
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 leading-none">RELOJ DE LIQUIDACIÓN DE DISPUTAS</p>
                <h4 className="text-base font-black text-slate-800 uppercase">Tiempo máximo reglamentario para apelación</h4>
              </div>
              <div className="bg-slate-900 text-blue-400 px-6 py-2.5 rounded-full font-mono text-sm font-black tabular-nums">
                Plazo: {formatCountdown(activeMatch)}
              </div>
            </div>

            {/* Verification of whether this coach voted */}
            <div className="border-t pt-6">
              {/* If signed by referee, everything is locked */}
              {activeMatch.isSigned ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-5 rounded-2xl text-center font-black uppercase text-xs">
                  Este partido ha sido rubricado y archivado por el Referí Central. No admite objeciones ni modificaciones futuras.
                </div>
              ) : isTimerExpired(activeMatch) ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-center font-black uppercase text-xs">
                  Tolerancia expirada. Tu límite de 15 minutos ha caducado. El control queda exclusivo del Referí Central.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* State displays for local vs visiting coach */}
                  {isHomeCoach ? (
                    <div>
                      {activeMatch.homeAcceptedScore ? (
                        <div className="bg-green-50 border border-green-150 text-green-700 p-5 rounded-2xl text-center font-black uppercase text-xs">
                          Has aceptado voluntariamente el acta de cierre ✅
                        </div>
                      ) : activeMatch.isDisputeActive && activeMatch.declinedByCoachId === coachClubId ? (
                        <div className="bg-red-50 border border-red-150 text-red-750 p-5 rounded-2xl text-center font-black uppercase text-xs">
                          Has rechazado el marcador. Acércate a la mesa de control inmediatamente ⚠️
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-center text-xs text-slate-500 font-bold uppercase">Como Director Técnico local ({MOCK_CLUBS[coachClubId]?.name}), ¿convalidas el cierre?</p>
                          <div className="flex justify-center gap-4">
                            <button 
                              onClick={handleDeclineScore}
                              className="bg-white border rounded-xl px-6 py-3.5 text-[10px] font-black text-red-650 hover:bg-red-50 transition-all uppercase tracking-wider"
                            >
                              ❌ Rechazar Marcador
                            </button>
                            <button 
                              onClick={handleAcceptScore}
                              className="bg-blue-600 text-white rounded-xl px-8 py-3.5 text-[10px] font-black hover:bg-blue-700 transition-all uppercase tracking-wider shadow-lg shadow-blue-105"
                            >
                              ✔️ Aceptar Marcador
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {activeMatch.awayAcceptedScore ? (
                        <div className="bg-green-50 border border-green-150 text-green-700 p-5 rounded-2xl text-center font-black uppercase text-xs">
                          Has aceptado voluntariamente el acta de cierre ✅
                        </div>
                      ) : activeMatch.isDisputeActive && activeMatch.declinedByCoachId === coachClubId ? (
                        <div className="bg-red-50 border border-red-150 text-red-750 p-5 rounded-2xl text-center font-black uppercase text-xs">
                          Has rechazado el marcador. Acércate a la mesa de control inmediatamente ⚠️
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-center text-xs text-slate-500 font-bold uppercase">Como Director Técnico visitante ({MOCK_CLUBS[coachClubId]?.name}), ¿convalidas el cierre?</p>
                          <div className="flex justify-center gap-4">
                            <button 
                              onClick={handleDeclineScore}
                              className="bg-white border rounded-xl px-6 py-3.5 text-[10px] font-black text-red-650 hover:bg-red-50 transition-all uppercase tracking-wider"
                            >
                              ❌ Rechazar Marcador
                            </button>
                            <button 
                              onClick={handleAcceptScore}
                              className="bg-blue-600 text-white rounded-xl px-8 py-3.5 text-[10px] font-black hover:bg-blue-700 transition-all uppercase tracking-wider shadow-lg shadow-blue-105"
                            >
                              ✔️ Aceptar Marcador
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ORIGINAL SQUAD SECTION IN COACH MODULE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm">
            {isLocked && (
              <div className="bg-amber-50 border border-amber-300 text-amber-800 p-6 rounded-3xl mb-8 flex flex-col gap-2 text-center items-center">
                <span className="text-xs font-black uppercase tracking-wider">🔒 Planilla Cerrada</span>
                <p className="text-[10px] font-extrabold uppercase leading-relaxed max-w-md">
                  Faltan menos de 15 minutos para el partido o ya comenzó. Para poder añadir o eliminar jugadores de la planilla, debes solicitar autorización formal al Árbitro Central para que desbloquee la edición remota.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Planilla de Club Oficial</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Registrados: {players.length} de {match.modality === 'XVS' ? 23 : 12} jugadores max ({match.modality})
                </p>
              </div>
              <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${isLocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {isLocked ? 'LOCKED (Requiere Autorización)' : 'Ficha Habilitada ✅'}
              </span>
            </div>

            <div className="space-y-4">
              {players.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                   <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">No hay jugadores inscritos en tu base de datos</p>
                </div>
              ) : (
                players.sort((a,b) => a.number - b.number).map((p, index) => (
                  <div key={p.id} className="group flex items-center justify-between p-6 rounded-[28px] border bg-white border-slate-100 hover:border-slate-350 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black bg-[#065e20] text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-slate-900 uppercase text-base tracking-tight">
                            {p.firstName} {p.lastName} <span className="text-blue-600 font-black ml-1">#{p.number}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <div className="px-5 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-100 text-slate-500">
                         {p.number <= (match.modality === 'XVS' ? 15 : 7) ? 'Titular' : 'Suplente'}
                       </div>
                       {!isLocked && (
                         <button
                           onClick={() => handleDeletePlayer(p.id)}
                           className="p-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase block"
                           title="Eliminar Jugador"
                         >
                           🗑️
                         </button>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {!isLocked && players.length < (match.modality === 'XVS' ? 23 : 12) && (
              <div className="mt-10 pt-10 border-t border-slate-50">
                 <button onClick={() => setShowAddPlayer(true)} className="w-full bg-slate-900 text-white font-black py-5 rounded-[32px] hover:bg-black transition-all shadow-xl uppercase tracking-widest text-xs">
                   + Añadir jugador al roster
                 </button>
              </div>
            )}
            
            {!isLocked && players.length >= (match.modality === 'XVS' ? 23 : 12) && (
              <p className="text-center text-[10px] font-black uppercase text-amber-600 mt-6 tracking-wider bg-amber-50 p-4 rounded-xl">
                ⚠️ Capacidad máxima alcanzada ({match.modality === 'XVS' ? '23' : '12'} jugadores). No se pueden inscribir más.
              </p>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-20"></div>
             <h4 className="text-sm font-black italic uppercase tracking-widest mb-8 border-b border-slate-800 pb-4 font-sans text-center">Ficha Digital del Entrenador</h4>
             <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-wide">
                Bienvenido al Tercer Tiempo Digital. Puedes monitorear los decesos, lesionados y marcas de cada encuentro oficial de tu club, además de validar y concordar el score con los oficiales de mesa.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
