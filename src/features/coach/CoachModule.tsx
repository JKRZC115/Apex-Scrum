/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_MATCHES, MOCK_CLUBS, MOCK_PLAYERS as INITIAL_PLAYERS } from '../../core/mocks/mockData';
import { MatchStatus, MatchModality, Player } from '../../types';
import { Navigate } from 'react-router-dom';

import { useMatchEngine } from '../../core/hooks/useMatchEngine';

export const CoachModule = () => {
  const { user } = useAuth();
  const targetMatch = MOCK_MATCHES.find(m => m.homeTeamId === user?.clubId || m.awayTeamId === user?.clubId) || MOCK_MATCHES[1];
  const { match, canEditRoster } = useMatchEngine(targetMatch);
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS.filter(p => p.clubId === user?.clubId));
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', number: '', idCard: '' });

  const isLocked = !canEditRoster();

  useEffect(() => {
    const calculateTime = () => {
      const matchTime = new Date(match.date).getTime();
      const lockThreshold = matchTime - (15 * 60 * 1000);
      const now = new Date().getTime();
      const diff = lockThreshold - now;
      
      if (diff <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [match]);

  if (!user || user.role !== 'COACH') {
    return <Navigate to="/login" />;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      clubId: user.clubId!,
      name: newPlayer.name,
      number: parseInt(newPlayer.number),
      idCard: newPlayer.idCard,
      isMedicalBlocked: false,
      isSuspended: false
    };
    setPlayers([...players, player]);
    setShowAddPlayer(false);
    setNewPlayer({ name: '', number: '', idCard: '' });
  };

  return (
    <div className="space-y-8 relative">
      {/* Modal Añadir Jugador */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
             <div className="bg-blue-600 p-8 text-white">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Inscribir Jugador</h3>
                <p className="text-[10px] font-bold text-blue-200 mt-1 uppercase tracking-widest">Añadir nuevo miembro a la plantilla</p>
             </div>
             <form onSubmit={handleAddPlayer} className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                      <input 
                        required
                        type="text" 
                        value={newPlayer.name}
                        onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                        placeholder="Ej: Juan Pérez"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI / ID</label>
                        <input 
                          required
                          type="text" 
                          value={newPlayer.idCard}
                          onChange={e => setNewPlayer({ ...newPlayer, idCard: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                          placeholder="88888888"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camiseta #</label>
                        <input 
                          required
                          type="number" 
                          value={newPlayer.number}
                          onChange={e => setNewPlayer({ ...newPlayer, number: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                          placeholder="10"
                        />
                      </div>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button 
                    type="button"
                    onClick={() => setShowAddPlayer(false)}
                    className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400"
                   >
                     Cancelar
                   </button>
                   <button 
                    type="submit"
                    className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[10px]"
                   >
                     Guardar Registro
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Gestión de Plantilla</h1>
          <p className="text-slate-500 font-medium">Club: <span className="text-blue-600">{MOCK_CLUBS[user.clubId || ''].name}</span></p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={() => setShowAddPlayer(true)}
             disabled={isLocked}
             className="bg-white border-2 border-slate-200 px-8 py-4 rounded-[20px] font-black text-[10px] text-slate-900 uppercase tracking-[.2em] hover:border-blue-600 hover:text-blue-600 transition-all disabled:opacity-50"
           >
             + Añadir Jugador
           </button>

           <div className={`p-4 rounded-2xl border flex items-center gap-6 ${isLocked ? 'bg-red-50 border-red-100' : 'bg-slate-900 border-slate-800 text-white shadow-xl'}`}>
              <div>
                <p className={`text-[8px] font-black uppercase tracking-widest ${isLocked ? 'text-red-400' : 'text-slate-500'}`}>Cierre de Acta</p>
                <p className={`text-xl font-black tabular-nums ${isLocked ? 'text-red-700' : 'text-blue-400'}`}>
                  {isLocked ? 'BLOQUEADO' : formatTime(timeLeft)}
                </p>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Alineación del Encuentro</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registrados: {players.length} jugadores</p>
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full uppercase tracking-widest">
                {match.modality === MatchModality.XVS ? 'Rugby XV' : 'Rugby Sevens'}
              </span>
            </div>

            <div className="space-y-4">
              {players.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                   <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">No hay jugadores registrados aún</p>
                </div>
              ) : (
                players.sort((a,b) => a.number - b.number).map((p) => (
                  <div key={p.id} className={`group flex items-center justify-between p-6 rounded-[28px] border transition-all ${isLocked ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/5'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${p.isMedicalBlocked ? 'bg-red-100 text-red-600' : 'bg-slate-900 text-white group-hover:bg-blue-600'}`}>
                        {p.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-slate-900 uppercase text-base tracking-tight">{p.name}</p>
                          {p.isMedicalBlocked && <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Blocked</span>}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {p.idCard}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       {!isLocked && (
                         <button className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest">
                           Eliminar
                         </button>
                       )}
                       <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[.2em] ${p.number <= (match.modality === MatchModality.XVS ? 15 : 7) ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                         {p.number <= (match.modality === MatchModality.XVS ? 15 : 7) ? 'Titular' : 'Suplente'}
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!isLocked && players.length > 0 && (
              <div className="mt-10 pt-10 border-t border-slate-50">
                 <button className="w-full bg-blue-600 text-white font-black py-6 rounded-[32px] hover:bg-black transition-all shadow-2xl shadow-blue-900/20 uppercase tracking-[.3em] text-[10px]">
                   Publicar Acta Oficial
                 </button>
                 <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Una vez publicada, solo el Referí de Mesa podrá realizar cambios</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-20"></div>
             <h4 className="text-sm font-black italic uppercase tracking-widest mb-8 border-b border-slate-800 pb-4">Checklist de Mesa</h4>
             <ul className="space-y-6">
                {[
                  { label: 'Jugadores con Ficha Médica', ok: true },
                  { label: 'Seguros al día', ok: true },
                  { label: 'DNI validado', ok: players.length > 0 },
                  { label: 'Suspensiones activas', ok: players.every(p => !p.isSuspended) }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.ok ? 'bg-blue-500' : 'bg-slate-800'}`}>
                        {item.ok && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${item.ok ? 'text-slate-200' : 'text-slate-500'}`}>{item.label}</span>
                  </li>
                ))}
             </ul>
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Información Club</h4>
             <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-300 text-xl shadow-sm border border-slate-100">
                   {MOCK_CLUBS[user.clubId || ''].name[0]}
                </div>
                <div>
                   <p className="font-black text-slate-900 uppercase text-xs tracking-tight">{MOCK_CLUBS[user.clubId || ''].name}</p>
                   <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Afiliado Union</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
