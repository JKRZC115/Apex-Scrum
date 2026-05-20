/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS, MOCK_MATCHES } from '../../core/mocks/mockData';
import { UserRole, Player } from '../../types';
import { Navigate, Link } from 'react-router-dom';
import { MOCK_PLAYERS as INITIAL_PLAYERS, MOCK_CLUBS } from '../../core/mocks/mockData';

export const AdminModule = () => {
  const { user } = useAuth();
  const [usersBoard, setUsersBoard] = useState<any[]>(Object.values(MOCK_USERS));
  const [players, setPlayers] = useState<any[]>(INITIAL_PLAYERS);

  if (!user || (!user.roles.includes(UserRole.ADMIN))) {
    return <Navigate to="/login" />;
  }

  const approveRoles = (userId: string) => {
    setUsersBoard(prev => prev.map(u => {
      if (u.id === userId && u.pendingRoles) {
        return {
          ...u,
          roles: Array.from(new Set([...u.roles, ...u.pendingRoles])),
          pendingRoles: null,
          isApproved: true
        };
      }
      return u;
    }));
  };

  const toggleRefereeManager = (userId: string) => {
    setUsersBoard(prev => prev.map(u => {
      if (u.id === userId) {
        const nextVal = !u.isRefereeManager;
        if (MOCK_USERS[u.email]) {
          MOCK_USERS[u.email].isRefereeManager = nextVal;
        }
        return {
          ...u,
          isRefereeManager: nextVal
        };
      }
      return u;
    }));
  };

  const handleSuspension = (playerId: string, matches: number) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, isSuspended: matches > 0, suspendedMatchesLeft: matches } : p
    ));
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Poder Absoluto Admin</h1>
        <p className="text-slate-500 font-medium mt-2">Control total de usuarios, torneos y resultados en disputa.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-200">
           <p className="text-[10px] font-black uppercase tracking-[.3em] opacity-60 mb-2">Total Usuarios</p>
           <p className="text-4xl font-black italic">{usersBoard.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.3em] mb-2">Partidos Activos</p>
           <p className="text-4xl font-black italic text-slate-900">{MOCK_MATCHES.length}</p>
        </div>
        <div className="bg-red-500 p-8 rounded-[40px] text-white shadow-xl shadow-red-200">
           <p className="text-[10px] font-black uppercase tracking-[.3em] opacity-60 mb-2">Disputas Pendientes</p>
           <p className="text-4xl font-black italic">0</p>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 uppercase italic flex items-center gap-2">
          <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
          Solicitudes de Rol Pendientes
        </h2>
        
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Usuario</th>
                <th className="px-8 py-4">Roles Solicitados</th>
                <th className="px-8 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usersBoard.filter(u => u.pendingRoles).map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-black text-slate-900 uppercase text-sm tracking-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      {u.pendingRoles.map((r: string) => (
                        <span key={r} className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 uppercase tracking-widest">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => approveRoles(u.id)}
                      className="bg-green-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                    >
                      Aprobar Solicitud
                    </button>
                  </td>
                </tr>
              ))}
              {usersBoard.filter(u => u.pendingRoles).length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-10 text-center text-slate-400 italic text-sm">
                    No hay solicitudes pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 uppercase italic flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
          Gestión de Personal Arbitral (Referee Manager)
        </h2>
        
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-4">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Define cuáles de tus árbitros aprobados actúan como "Referee Manager" para designar colegiados a los encuentros.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[9px] font-black tracking-widest text-slate-400">
                  <th className="pb-4">Nombre</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4 text-center">Referee Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usersBoard.filter(u => u.roles && u.roles.includes(UserRole.REFEREE)).map(u => (
                  <tr key={u.id} className="text-xs">
                    <td className="py-4 font-black text-slate-900 uppercase">{u.firstName} {u.lastName}</td>
                    <td className="py-4 text-slate-500 font-mono">{u.email}</td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => toggleRefereeManager(u.id)}
                        className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all ${u.isRefereeManager ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {u.isRefereeManager ? "✓ Manager Activo" : "Hacer Manager"}
                      </button>
                    </td>
                  </tr>
                ))}
                {usersBoard.filter(u => u.roles && u.roles.includes(UserRole.REFEREE)).length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 italic">No hay árbitros registrados en el sistema.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 uppercase italic flex items-center gap-2">
          <span className="w-2 h-6 bg-red-600 rounded-full"></span>
          Control de Disciplina (Sanciones)
        </h2>
        
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Jugador</th>
                <th className="px-8 py-4 text-center">Estado</th>
                <th className="px-8 py-4 text-right">Definir Sanción (Partidos)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {players.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-white italic">
                        {p.number}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase text-sm tracking-tight">{p.firstName} {p.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{MOCK_CLUBS[p.clubId]?.name || 'Club Desconocido'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {p.isSuspended ? (
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase tracking-widest">Sancionado</span>
                        <p className="text-[10px] font-bold text-red-400 mt-1 uppercase tracking-tighter">Resta: {p.suspendedMatchesLeft} fechas</p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">Habilitado</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex gap-2 justify-end">
                      {[0, 1, 2, 4, 8].map(m => (
                        <button 
                          key={m}
                          onClick={() => handleSuspension(p.id, m)}
                          className={`text-[10px] font-black px-3 py-2 rounded-lg transition-all ${p.suspendedMatchesLeft === m && p.isSuspended ? 'bg-red-600 text-white' : m === 0 && !p.isSuspended ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          {m === 0 ? 'ALTA' : m}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl">
           <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              Modificaciones de Emergencia y Control Supremo de Marcadores
           </h3>
           <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-6">
              Como administrador supremo, eres el único facultado para modificar o sobreescribir marcadores cerrados con firma digital.
           </p>
           
           <div className="space-y-4">
              {MOCK_MATCHES.map((match) => {
                 const homeClub = MOCK_CLUBS[match.homeTeamId];
                 const awayClub = MOCK_CLUBS[match.awayTeamId];
                 return (
                    <div key={match.id} className="bg-slate-850 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-750 transition-colors">
                       <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                             Cod: {match.id} • {match.isSigned ? "FIRMADO Y BLOQUEADO 📜🔒" : "ABIERTO / EN PROCESO"}
                          </span>
                          <h4 className="font-sans text-xs font-black uppercase text-slate-200 mt-1">
                             {homeClub?.name} vs {awayClub?.name}
                          </h4>
                       </div>

                       <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                             <input 
                                type="number"
                                defaultValue={match.homeScore}
                                id={`sup-home-${match.id}`}
                                className="w-16 bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-center text-sm font-black text-white outline-none focus:border-red-500"
                             />
                             <span className="text-slate-500 text-xs font-black">:</span>
                             <input 
                                type="number"
                                defaultValue={match.awayScore}
                                id={`sup-away-${match.id}`}
                                className="w-16 bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-center text-sm font-black text-white outline-none focus:border-red-500"
                             />
                          </div>

                          <button 
                             onClick={() => {
                                const homeVal = parseInt((document.getElementById(`sup-home-${match.id}`) as HTMLInputElement)?.value || '0');
                                const awayVal = parseInt((document.getElementById(`sup-away-${match.id}`) as HTMLInputElement)?.value || '0');
                                
                                const idx = MOCK_MATCHES.findIndex(m => m.id === match.id);
                                if (idx !== -1) {
                                   MOCK_MATCHES[idx].homeScore = homeVal;
                                   MOCK_MATCHES[idx].awayScore = awayVal;
                                   alert(`¡Éxito! Marcador Supremo Modificado: ${homeClub?.name} (${homeVal}) - ${awayClub?.name} (${awayVal})`);
                                }
                             }}
                             className="bg-red-650 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest px-5 py-3.5 rounded-xl transition-all"
                          >
                             Sobreescribir Score ⚡
                          </button>
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};
