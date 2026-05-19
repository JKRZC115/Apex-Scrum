/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_PLAYERS, MOCK_CLUBS } from '../../core/mocks/mockData';
import { Player, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const MedicalModule = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [report, setReport] = useState({
    injuryZone: '',
    injuryType: '',
    treatment: '',
    recommendations: '',
    isIncapacitated: false
  });
  const [success, setSuccess] = useState(false);

  if (!user || (!user.roles.includes(UserRole.MEDICAL) && !user.roles.includes(UserRole.ADMIN))) {
    return <Navigate to="/login" />;
  }

  const players = MOCK_PLAYERS.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.idCard.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSelectedPlayer(null);
      setReport({ injuryZone: '', injuryType: '', treatment: '', recommendations: '', isIncapacitated: false });
    }, 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Reporte Médico en Cancha</h1>
        <p className="text-slate-500 font-medium">Buscador de atletas y gestión de inhabilitaciones inmediatas.</p>
      </header>

      {!selectedPlayer ? (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Buscar jugador por nombre o ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {players.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedPlayer(p)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xs font-black text-white">
                    {p.firstName[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{p.firstName} {p.lastName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{MOCK_CLUBS[p.clubId]?.name || 'Club no definido'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-blue-600 uppercase italic">Seleccionar Athlete</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-red-600 p-8 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 font-black">
                {selectedPlayer.firstName[0]}
              </div>
              <div>
                <h3 className="font-black text-xl uppercase italic tracking-tighter">{selectedPlayer.firstName} {selectedPlayer.lastName}</h3>
                <p className="text-[10px] font-black uppercase tracking-[.2em] opacity-80">{MOCK_CLUBS[selectedPlayer.clubId]?.name || 'Club no definido'}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedPlayer(null)}
              className="bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-white/30 transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zona de la Lesión</label>
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold"
                  placeholder="Ej: Rodilla Derecha"
                  value={report.injuryZone}
                  onChange={e => setReport({...report, injuryZone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Lesión</label>
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold"
                  placeholder="Ej: Esguince, Fractura, etc."
                  value={report.injuryType}
                  onChange={e => setReport({...report, injuryType: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atención Brindada</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold h-24"
                placeholder="Detalle los primeros auxilios..."
                value={report.treatment}
                onChange={e => setReport({...report, treatment: e.target.value})}
              />
            </div>

            <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor font-black">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                   <p className="text-xs font-black text-red-900 uppercase">Inhabilitación Inmediata</p>
                   <p className="text-[10px] text-red-600 font-bold">Bloquea al jugador de la planilla actual y futura.</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="w-6 h-6 rounded-lg text-red-600 focus:ring-red-500 border-red-300"
                checked={report.isIncapacitated}
                onChange={e => setReport({...report, isIncapacitated: e.target.checked})}
              />
            </div>

            {success && (
              <p className="text-green-600 font-black text-center uppercase tracking-widest text-sm bg-green-50 py-4 rounded-2xl border border-green-100">
                Reporte enviado con éxito. Jugador {report.isIncapacitated ? 'Inhabilitado' : 'Registrado'}.
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] hover:bg-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-sm"
            >
              Finalizar Reporte Médico
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
