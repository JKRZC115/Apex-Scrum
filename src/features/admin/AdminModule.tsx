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
  const [showAllUsersList, setShowAllUsersList] = useState(false);
  const [userSearchText, setUserSearchText] = useState('');

  if (!user || (!user.roles.includes(UserRole.ADMIN))) {
    return <Navigate to="/login" />;
  }

  const approveRoles = (userId: string) => {
    setUsersBoard(prev => prev.map(u => {
      if (u.id === userId && u.pendingRoles) {
        const mergedRoles = Array.from(new Set([...u.roles, ...u.pendingRoles]));
        if (MOCK_USERS[u.email]) {
          MOCK_USERS[u.email].roles = mergedRoles;
          MOCK_USERS[u.email].pendingRoles = null;
          MOCK_USERS[u.email].isApproved = true;
        }
        return {
          ...u,
          roles: mergedRoles,
          pendingRoles: null,
          isApproved: true
        };
      }
      return u;
    }));
  };

  const denyRoles = (userId: string) => {
    setUsersBoard(prev => prev.map(u => {
      if (u.id === userId) {
        if (MOCK_USERS[u.email]) {
          MOCK_USERS[u.email].pendingRoles = null;
        }
        return {
          ...u,
          pendingRoles: null
        };
      }
      return u;
    }));
  };

  const toggleUserAccess = (email: string) => {
    if (user && email === user.email) {
      alert("No puedes revocar tu propio acceso como administrador activo.");
      return;
    }
    setUsersBoard(prev => prev.map(u => {
      if (u.email === email) {
        const nextApproved = !u.isApproved;
        if (MOCK_USERS[email]) {
          MOCK_USERS[email].isApproved = nextApproved;
        }
        alert(nextApproved ? `Acceso habilitado nuevamente para: ${email}` : `Acceso revocado para: ${email}`);
        return {
          ...u,
          isApproved: nextApproved
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
        <h1 className="text-5xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Hola, {user?.name}</h1>
        <p className="text-slate-500 font-medium mt-2">Control total de usuarios, torneos y resultados en disputa.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setShowAllUsersList(!showAllUsersList)}
          className={`p-8 rounded-[40px] text-white shadow-xl cursor-pointer transition-all active:scale-95 flex flex-col justify-between ${
            showAllUsersList ? 'bg-blue-800 ring-4 ring-blue-300' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
          }`}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.3em] opacity-80 mb-2">Total Usuarios</p>
            <p className="text-4xl font-black italic">{usersBoard.length}</p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider mt-4 text-blue-100 bg-blue-900/30 px-3 py-1.5 rounded-xl w-fit">
            {showAllUsersList ? '✕ Ocultar Listado' : '⚙️ Administrar Accesos'}
          </p>
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

      {showAllUsersList && (
        <section className="space-y-6 bg-slate-50 border border-slate-200 p-8 rounded-[40px] animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Listado Completo de Usuarios</h3>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-1">Busca, filtra y revoca el acceso de cualquier usuario registrado en la plataforma</p>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar por nombre o correo..." 
                value={userSearchText}
                onChange={e => setUserSearchText(e.target.value)}
                className="bg-white border rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:border-blue-600 transition-colors w-full sm:w-64"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Roles</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersBoard
                  .filter(u => 
                    u.name.toLowerCase().includes(userSearchText.toLowerCase()) || 
                    u.email.toLowerCase().includes(userSearchText.toLowerCase())
                  )
                  .map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-slate-900 uppercase">{u.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r: string) => (
                            <span key={r} className="text-[8px] font-black text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                          u.isApproved ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700 border border-red-150'
                        }`}>
                          {u.isApproved ? 'Activo' : 'Inactivo / Revocado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleUserAccess(u.email)}
                          disabled={u.email === user.email}
                          className={`px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider disabled:opacity-35 ${
                            u.isApproved 
                              ? 'bg-red-50 text-red-650 hover:bg-red-600 hover:text-white' 
                              : 'bg-green-50 text-green-650 hover:bg-green-600 hover:text-white border border-green-200'
                          }`}
                        >
                          {u.isApproved ? 'Revocar Acceso' : 'Permitir Acceso'}
                        </button>
                      </td>
                    </tr>
                  ))}
                {usersBoard.filter(u => 
                  u.name.toLowerCase().includes(userSearchText.toLowerCase()) || 
                  u.email.toLowerCase().includes(userSearchText.toLowerCase())
                ).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic font-medium">
                      No se encontraron usuarios coincidentes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => approveRoles(u.id)}
                        className="bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-all font-black text-xs flex items-center gap-1.5 uppercase shadow-sm"
                        title="Aprobar Solicitud"
                      >
                        ✔ Aprobar
                      </button>
                      <button 
                        onClick={() => denyRoles(u.id)}
                        className="bg-red-650 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition-all font-black text-xs flex items-center gap-1.5 uppercase shadow-sm"
                        title="Denegar Solicitud"
                      >
                        ✖ Denegar
                      </button>
                    </div>
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
