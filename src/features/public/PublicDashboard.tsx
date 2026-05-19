import React from 'react';
import { MOCK_MATCHES, MOCK_CLUBS, MOCK_STANDINGS } from '../../core/mocks/mockData';
import { MatchStatus, MatchModality } from '../../types';
import { Link } from 'react-router-dom';
import { StandingsTable } from '../../components/StandingsTable';

const PublicDashboard = () => (
  <div className="space-y-12">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Cartelera de Torneos</h1>
        <p className="text-slate-500 mt-2 font-medium">Resultados en vivo y estadísticas de Rugby XV's y 7's</p>
      </div>
      <div className="flex gap-2">
        <button className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-slate-50 transition-colors uppercase italic tracking-tighter">Rugby XV's</button>
        <button className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-slate-50 transition-colors uppercase italic tracking-tighter">Rugby 7's</button>
      </div>
    </header>

    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
          Tabla General
        </h2>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apertura 2024 • Primera División</span>
      </div>
      <StandingsTable standings={MOCK_STANDINGS} />
    </section>

    <section className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
        Partidos de Hoy
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_MATCHES.map((match) => {
          const homeClub = MOCK_CLUBS[match.homeTeamId];
          const awayClub = MOCK_CLUBS[match.awayTeamId];
          const isLive = match.status === MatchStatus.LIVE;

          return (
            <div key={match.id} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group active:scale-[0.99]">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${match.modality === MatchModality.XVS ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                        Rugby {match.modality === MatchModality.XVS ? "XV's" : "7's"}
                      </span>
                      <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">
                        Masculino • Primera
                      </span>
                      {isLive && (
                        <span className="flex items-center gap-1.5 text-red-600 text-[10px] font-black animate-pulse bg-red-50 px-3 py-1 rounded-full border border-red-100">
                          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                          EN VIVO • {match.currentMinute}'
                        </span>
                      )}
                    </div>
                   <span className="text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                     {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>

                <div className="grid grid-cols-3 items-center text-center gap-4">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-[28px] mx-auto flex items-center justify-center border-2 border-slate-100 shadow-inner group-hover:border-blue-100 transition-colors">
                      <span className="text-3xl font-black text-slate-300 group-hover:text-blue-300">{homeClub?.name?.[0] || '?'}</span>
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase leading-tight tracking-tight">{homeClub?.name || '???'}</p>
                  </div>

                  <div>
                    {match.status !== MatchStatus.SCHEDULED ? (
                      <div className="flex flex-col gap-1 items-center justify-center">
                        <p className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter">
                          {match.homeScore}<span className="text-slate-200 mx-2 text-3xl font-light">:</span>{match.awayScore}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.3em]">SCORE</p>
                      </div>
                    ) : (
                      <div className="bg-slate-100 py-3 px-6 rounded-3xl font-black text-slate-400 text-xs tracking-widest border border-slate-200">VS</div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-[28px] mx-auto flex items-center justify-center border-2 border-slate-100 shadow-inner group-hover:border-blue-100 transition-colors">
                      <span className="text-3xl font-black text-slate-300 group-hover:text-blue-300">{awayClub?.name?.[0] || '?'}</span>
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase leading-tight tracking-tight">{awayClub?.name || '???'}</p>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-[8px] font-black text-white">AS</div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Torneo Apertura • Mayores</p>
                  </div>
                  <Link 
                    to={isLive ? "/referee" : "/"} 
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isLive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700' : 'bg-slate-100 text-slate-400 pointer-events-none'}`}
                  >
                    {isLive ? 'SEGUIR EN VIVO' : 'VER PRÓXIMO'}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
          Máximos Anotadores
        </h2>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="pb-4">Jugador</th>
                <th className="pb-4">Club</th>
                <th className="pb-4 text-center">Trys</th>
                <th className="pb-4 text-center">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Carlos Pérez', club: 'Leones RC', trys: 8, pts: 40 },
                { name: 'Luis Rivas', club: 'Águilas del Sur', trys: 5, pts: 25 },
                { name: 'Juan Gómez', club: 'Leones RC', trys: 3, pts: 15 }
              ].map((p, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-slate-200">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-black text-slate-900 text-sm tracking-tight">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {p.club}
                    </span>
                  </td>
                  <td className="py-5 text-center font-black text-slate-900 tabular-nums">{p.trys}</td>
                  <td className="py-5 text-center">
                    <span className="font-black text-blue-600 tabular-nums text-lg">{p.pts}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-red-500 rounded-full"></span>
          Centro Médico
        </h2>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-black">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest">Alerta de Suspensión</span>
            </div>
            <h4 className="font-black text-slate-900 text-sm leading-tight">Protocolo de Conmoción Activado: 3 jugadores en observación.</h4>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-bold">FECHA: 18 MAYO</p>
              <button className="text-[10px] font-black text-blue-600 underline uppercase italic">Ver protocolo</button>
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200">
            <h4 className="font-black text-white text-sm italic mb-4 uppercase tracking-tight">Estatus Disciplinario</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 uppercase">Tarjetas Rojas</span>
                <span className="text-red-500 font-black">2 Activas</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 uppercase">Citaciones</span>
                <span className="text-orange-400 font-black">1 Pendiente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PublicDashboard;
