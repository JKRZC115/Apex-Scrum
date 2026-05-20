import React, { useState } from 'react';
import { MOCK_MATCHES, MOCK_CLUBS, MOCK_STANDINGS } from '../../core/mocks/mockData';
import { MatchStatus, MatchModality } from '../../types';
import { Link } from 'react-router-dom';
import { StandingsTable } from '../../components/StandingsTable';

const PublicDashboard = () => {
  const [activeTimelineMatchId, setActiveTimelineMatchId] = useState<string | null>(null);

  const mockTimelineEvents = [
    { minute: 5, type: 'TRY', player: 'Carlos Pérez', team: 'HOME', desc: 'Try anotado tras un potente empuje del maul de Leones', points: 5, score: '5 - 0' },
    { minute: 14, type: 'TRY', player: 'Luis Rivas', team: 'AWAY', desc: 'Contragolpe letal por la banda izquierda de Águilas del Sur', points: 5, score: '5 - 5' },
    { minute: 28, type: 'TRY', player: 'Juan Gómez', team: 'HOME', desc: 'Quiebre de línea por el centro de la cancha', points: 5, score: '10 - 5' },
    { minute: 29, type: 'CONVERSION', player: 'Juan Gómez', team: 'HOME', desc: 'Conversión efectiva cerca del banderín', points: 2, score: '12 - 5' },
    { minute: 31, type: 'YELLOW_CARD', player: 'Luis Rivas', team: 'AWAY', desc: 'Tackle alto a destiempo (10 minutos de suspensión temporal)', points: 0, score: '12 - 5' }
  ];

  return (
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

                {/* Timeline section */}
                {activeTimelineMatchId === match.id && (
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse inline-block"></span>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest italic">Sucesos en Tiempo Real</h3>
                      </div>
                      <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase">32 min jugados</span>
                    </div>

                    <div className="relative pl-6 border-l border-slate-200 space-y-5 ml-4">
                      {mockTimelineEvents.map((ev, index) => {
                        let badgeStyle = "bg-orange-50 text-orange-600 border border-orange-100";
                        if (ev.type === 'CONVERSION') {
                          badgeStyle = "bg-cyan-50 text-cyan-600 border border-cyan-100";
                        } else if (ev.type === 'YELLOW_CARD') {
                          badgeStyle = "bg-yellow-50 text-yellow-600 border border-yellow-100";
                        } else if (ev.type === 'RED_CARD') {
                          badgeStyle = "bg-red-50 text-red-600 border border-red-100";
                        }

                        return (
                          <div key={index} className="relative">
                            <span className="absolute -left-[29px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white"></span>
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-[11px] font-black text-blue-600">{ev.minute}'</span>
                                <span className="text-xs font-black text-slate-900 uppercase">{ev.player}</span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${badgeStyle}`}>{ev.type}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-auto bg-slate-50 px-3 py-1 rounded-full border border-slate-100 tabular-nums">
                                  Marcador: {ev.score}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-[8px] font-black text-white">AS</div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Torneo Apertura • Mayores</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (isLive) {
                        setActiveTimelineMatchId(activeTimelineMatchId === match.id ? null : match.id);
                      }
                    }}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isLive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-default'}`}
                  >
                    {isLive ? (activeTimelineMatchId === match.id ? 'OCULTAR EN VIVO' : 'SEGUIR EN VIVO') : 'VER PRÓXIMO'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Máximos Anotadores */}
      <div className="space-y-6">
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

      {/* Máximos Pateadores */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-600 rounded-full"></span>
          Máximos Pateadores
        </h2>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="pb-4">Jugador</th>
                <th className="pb-4">Club</th>
                <th className="pb-4 text-center">Conv (+2)</th>
                <th className="pb-4 text-center">Penal (+3)</th>
                <th className="pb-4 text-center">Drop (+3)</th>
                <th className="pb-4 text-center">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Daniel Cardona', club: 'Leones RC', conv: 7, penal: 8, drop: 0, pts: 38 },
                { name: 'Mateo Restrepo', club: 'Águilas del Sur', conv: 3, penal: 7, drop: 2, pts: 33 },
                { name: 'Andrés Vargas', club: 'Albatros XV', conv: 6, penal: 4, drop: 0, pts: 24 }
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
                  <td className="py-5 text-center font-black text-slate-700 tabular-nums">{p.conv}</td>
                  <td className="py-5 text-center font-black text-slate-700 tabular-nums">{p.penal}</td>
                  <td className="py-5 text-center font-black text-slate-700 tabular-nums">{p.drop}</td>
                  <td className="py-5 text-center">
                    <span className="font-black text-blue-600 tabular-nums text-lg">{p.pts}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
};

export default PublicDashboard;
