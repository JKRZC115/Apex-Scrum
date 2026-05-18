import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CLUBS, MOCK_MATCHES } from '../../core/mocks/mockData';
import { MatchModality, MatchStatus, Match } from '../../types';

export const TournamentConfig = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [configType, setConfigType] = useState<'NEW' | 'EXISTING'>('NEW');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mayores',
    gender: 'M' as 'M' | 'F',
    venue: '',
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    time: '',
    modality: MatchModality.XVS,
    halfDuration: 40
  });

  const handleSave = () => {
    // Aquí iría la lógica para guardar en BD/Mock
    console.log('Saving config:', formData);
    
    // Crear el objeto Match
    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      tournamentId: Math.random().toString(36).substr(2, 9),
      homeTeamId: formData.homeTeamId,
      awayTeamId: formData.awayTeamId,
      date: new Date(`${formData.date}T${formData.time}`),
      modality: formData.modality,
      status: MatchStatus.SCHEDULED,
      homeScore: 0,
      awayScore: 0,
      currentMinute: 0,
      homeRosterIds: [],
      awayRosterIds: [],
      venue: formData.venue,
      halfDuration: formData.halfDuration
    };

    MOCK_MATCHES.push(newMatch);
    alert('Configuración guardada exitosamente');
    navigate('/admin');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/admin')}
          className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Configuración de Torneo</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Panel de control de competencias</p>
        </div>
      </header>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <button 
            onClick={() => { setConfigType('NEW'); setStep(2); }}
            className="group bg-white p-10 rounded-[48px] border-2 border-slate-100 hover:border-blue-600 transition-all text-left space-y-4 shadow-xl shadow-slate-200/50"
           >
              <div className="w-16 h-16 bg-blue-50 rounded-[24px] flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <svg className="w-8 h-8 text-blue-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Nuevo Torneo</h3>
                <p className="text-sm font-medium text-slate-400 mt-2">Crea una competencia desde cero con nuevas sedes y categorías.</p>
              </div>
           </button>

           <button 
            onClick={() => { setConfigType('EXISTING'); setStep(2); }}
            className="group bg-slate-900 p-10 rounded-[48px] border-2 border-slate-900 hover:border-blue-600 transition-all text-left space-y-4 shadow-xl"
           >
              <div className="w-16 h-16 bg-slate-800 rounded-[24px] flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <svg className="w-8 h-8 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Torneo Existente</h3>
                <p className="text-sm font-medium text-slate-500 mt-2">Añade jornadas o modifica encuentros de un torneo en curso.</p>
              </div>
           </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl p-12 space-y-12 animate-in fade-in zoom-in duration-500">
           <div className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Detalles del Torneo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre de la Competencia</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Torneo Apertura Regional"
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-black text-sm outline-none focus:border-blue-600 transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede Principal / Campo</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Estadio Nacional de Rugby"
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-black text-sm outline-none focus:border-blue-600 transition-all"
                      value={formData.venue}
                      onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    />
                 </div>
              </div>
           </div>

           <div className="space-y-8 pt-12 border-t border-slate-50">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Encuentro Específico</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipo Local</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-black text-sm outline-none focus:border-blue-600 transition-all"
                      value={formData.homeTeamId}
                      onChange={e => setFormData({ ...formData, homeTeamId: e.target.value })}
                    >
                      <option value="">Seleccionar Club...</option>
                      {Object.values(MOCK_CLUBS).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipo Visitante</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-black text-sm outline-none focus:border-blue-600 transition-all"
                      value={formData.awayTeamId}
                      onChange={e => setFormData({ ...formData, awayTeamId: e.target.value })}
                    >
                      <option value="">Seleccionar Club...</option>
                      {Object.values(MOCK_CLUBS).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha del Partido</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-black text-sm outline-none focus:border-blue-600 transition-all"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora de Inicio</label>
                    <input 
                      type="time" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-black text-sm outline-none focus:border-blue-600 transition-all"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                    />
                 </div>
              </div>
           </div>

           <div className="space-y-8 pt-12 border-t border-slate-50">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Modalidad y Tiempos</h2>
              <div className="flex flex-wrap gap-8">
                 <div className="flex-1 min-w-[200px] space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variante de Juego</label>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setFormData({ ...formData, modality: MatchModality.XVS, halfDuration: 40 })}
                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.modality === MatchModality.XVS ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-900/20' : 'bg-white border-slate-100 text-slate-400'}`}
                       >
                         XV's
                       </button>
                       <button 
                        onClick={() => setFormData({ ...formData, modality: MatchModality.SEVENS, halfDuration: 7 })}
                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.modality === MatchModality.SEVENS ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-900/20' : 'bg-white border-slate-100 text-slate-400'}`}
                       >
                         Sevens
                       </button>
                    </div>
                 </div>
                 <div className="flex-1 min-w-[200px] space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duración por Tiempo (Min)</label>
                    <div className="flex items-center gap-4">
                       <input 
                        type="range" 
                        min="5" 
                        max="40" 
                        step="1"
                        value={formData.halfDuration}
                        onChange={e => setFormData({ ...formData, halfDuration: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                       />
                       <div className="w-16 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black italic">
                          {formData.halfDuration}'
                       </div>
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Ajustable para encuentros amistosos o categorías infantiles</p>
                 </div>
              </div>
           </div>

           <div className="pt-12">
              <button 
                onClick={handleSave}
                disabled={!formData.homeTeamId || !formData.awayTeamId || !formData.date || !formData.time}
                className="w-full bg-slate-900 text-white font-black py-8 rounded-[32px] hover:bg-black transition-all shadow-2xl active:scale-95 uppercase tracking-[.4em] text-xs disabled:opacity-50 disabled:pointer-events-none"
              >
                Confirmar y Publicar {configType === 'NEW' ? 'Torneo' : 'Encuentro'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
