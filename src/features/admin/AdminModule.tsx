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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl">
           <h3 className="text-xl font-black italic uppercase mb-6">Modificaciones de Emergencia</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => alert('Acta desbloqueada permanentemente.')}
                className="bg-slate-800 p-4 rounded-3xl border border-slate-700 text-left hover:border-blue-500 transition-all group active:scale-95"
              >
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Mesa</p>
                <p className="text-xs font-black group-hover:text-blue-400">Desbloquear Acta</p>
              </button>
              <button 
                onClick={() => alert('Modo edición de score habilitado.')}
                className="bg-slate-800 p-4 rounded-3xl border border-slate-700 text-left hover:border-blue-500 transition-all group active:scale-95"
              >
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Puntos</p>
                <p className="text-xs font-black group-hover:text-blue-400">Modificar Score</p>
              </button>
              <button 
                onClick={() => alert('Jugadores habilitados médicamente.')}
                className="bg-slate-800 p-4 rounded-3xl border border-slate-700 text-left hover:border-blue-500 transition-all group active:scale-95"
              >
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Médico</p>
                <p className="text-xs font-black group-hover:text-blue-400">Dar Alta Medica</p>
              </button>
              <button 
                onClick={() => confirm('¿Suspender partido definitivamente?') && alert('Partido suspendido.')}
                className="bg-slate-800 p-4 rounded-3xl border border-slate-700 text-left hover:border-red-500 transition-all group active:scale-95"
              >
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Match</p>
                <p className="text-xs font-black group-hover:text-red-400">Suspender Partido</p>
              </button>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
           <div className="w-16 h-16 bg-blue-100 rounded-[24px] flex items-center justify-center text-blue-600">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
             </svg>
           </div>
           <div>
             <h3 className="text-xl font-black italic uppercase">Nuevo Torneo</h3>
             <p className="text-slate-400 text-xs font-medium">Configura una nueva competencia desde cero.</p>
           </div>
            <Link 
              to="/admin/setup"
              className="bg-blue-600 text-white font-black px-10 py-4 rounded-2xl text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest active:scale-95"
            >
              Configurar Ahora
            </Link>
        </div>
      </div>
    </div>
  );
};
