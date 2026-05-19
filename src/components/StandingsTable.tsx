import React from 'react';
import { Standing, Club } from '../types';
import { MOCK_CLUBS } from '../core/mocks/mockData';

interface Props {
  standings: Standing[];
}

export const StandingsTable = ({ standings }: Props) => {
  // Ordenar por puntos, luego por diferencia de puntos
  const sortedStandings = [...standings].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.pointsDiff - a.pointsDiff;
  });

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white italic uppercase text-[10px] tracking-[0.2em]">
              <th className="py-6 px-8">Pos</th>
              <th className="py-6 px-8">Club</th>
              <th className="py-6 px-4 text-center">PJ</th>
              <th className="py-6 px-4 text-center font-bold text-green-400">PG</th>
              <th className="py-6 px-4 text-center text-slate-400">PE</th>
              <th className="py-6 px-4 text-center text-red-400">PP</th>
              <th className="py-6 px-4 text-center">PA</th>
              <th className="py-6 px-4 text-center">PR</th>
              <th className="py-6 px-4 text-center font-black">DP</th>
              <th className="py-6 px-4 text-center text-yellow-400">TA</th>
              <th className="py-6 px-4 text-center text-red-500">TR</th>
              <th className="py-6 px-8 text-center bg-blue-600 text-white">Puntos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedStandings.map((s, index) => {
              const club = MOCK_CLUBS[s.clubId];
              return (
                <tr key={s.clubId} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-6 px-8 font-black italic text-slate-400 group-hover:text-blue-600">
                    {index + 1}
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs uppercase group-hover:bg-blue-50 transition-colors">
                        {club?.name?.substring(0, 2) || '??'}
                      </div>
                      <span className="font-black text-sm uppercase italic tracking-tight text-slate-900">
                        {club?.name || 'Club no encontrado'}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center font-medium text-slate-600 italic">{s.played}</td>
                  <td className="py-6 px-4 text-center font-black text-green-600">{s.won}</td>
                  <td className="py-6 px-4 text-center font-medium text-slate-400">{s.drawn}</td>
                  <td className="py-6 px-4 text-center font-medium text-red-500">{s.lost}</td>
                  <td className="py-6 px-4 text-center font-bold text-slate-700">{s.pointsFor}</td>
                  <td className="py-6 px-4 text-center font-bold text-slate-700">{s.pointsAgainst}</td>
                  <td className={`py-6 px-4 text-center font-black italic ${s.pointsDiff >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {s.pointsDiff > 0 ? `+${s.pointsDiff}` : s.pointsDiff}
                  </td>
                  <td className="py-6 px-4 text-center">
                    <div className="w-6 h-8 bg-yellow-400 rounded-sm mx-auto flex items-center justify-center text-[10px] font-black shadow-sm">
                      {s.yellowCards}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <div className="w-6 h-8 bg-red-600 rounded-sm mx-auto flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                      {s.redCards}
                    </div>
                  </td>
                  <td className="py-6 px-8 text-center bg-slate-50">
                    <span className="text-xl font-black italic text-blue-600 tabular-nums">
                      {s.totalPoints}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
