/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { Match, MatchEvent, MatchEventType, MatchModality, MatchStatus } from '../../types';

/**
 * Hook personalizado para gestionar la lógica de un partido en tiempo real.
 * Proporciona el estado del marcador, tiempos y validaciones de rugby.
 */
export const useMatchEngine = (initialMatch: Match) => {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Lógica de cronómetro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && match.status === MatchStatus.LIVE) {
      interval = setInterval(() => {
        setMatch(prev => ({
          ...prev,
          currentMinute: prev.currentMinute + 1
        }));
      }, 60000); // 1 minuto real = 1 minuto de juego (para pruebas podemos acelerarlo)
    }
    return () => clearInterval(interval);
  }, [isRunning, match.status]);

  /**
   * Registra un evento de puntuación o tarjeta.
   */
  const addEvent = useCallback((type: MatchEventType, teamId: 'HOME' | 'AWAY', playerId?: string, playerOutId?: string) => {
    const pointsMap: Record<string, number> = {
      [MatchEventType.TRY]: 5,
      [MatchEventType.CONVERSION]: 2,
      [MatchEventType.PENALTY_KICK]: 3,
      [MatchEventType.DROP_GOAL]: 3,
      [MatchEventType.PENALTY_TRY]: 7,
      [MatchEventType.YELLOW_CARD]: 0,
      [MatchEventType.RED_CARD]: 0,
    };

    const points = pointsMap[type] || 0;
    const isHome = teamId === 'HOME';

    const newEvent: MatchEvent = {
      id: Math.random().toString(36).substr(2, 9),
      matchId: match.id,
      type,
      minute: match.currentMinute,
      teamId: isHome ? match.homeTeamId : match.awayTeamId,
      playerId,
      playerOutId,
      points
    };

    setEvents(prev => [...prev, newEvent]);

    // Actualizar marcador
    setMatch(prev => ({
      ...prev,
      homeScore: isHome ? prev.homeScore + points : prev.homeScore,
      awayScore: !isHome ? prev.awayScore + points : prev.awayScore
    }));
  }, [match]);

  /**
   * Calcula el tiempo de suspensión por tarjeta amarilla según la modalidad.
   */
  const getYellowCardDuration = useCallback(() => {
    return match.modality === MatchModality.XVS ? 10 : 2;
  }, [match.modality]);

  /**
   * Valida si el acta puede ser editada por el entrenador (15 min antes).
   */
  const canEditRoster = useCallback((teamId?: string) => {
    if (teamId === match.homeTeamId && match.isHomeRosterUnlocked) return true;
    if (teamId === match.awayTeamId && match.isAwayRosterUnlocked) return true;
    
    if (!match.date) return true;
    const now = new Date();
    const startTime = new Date(match.date);
    const diffInMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes > 15;
  }, [match.date, match.homeTeamId, match.awayTeamId, match.isHomeRosterUnlocked, match.isAwayRosterUnlocked]);

  /**
   * Permite al árbitro habilitar o deshabilitar la edición del acta.
   */
  const toggleRosterLock = useCallback((side: 'HOME' | 'AWAY') => {
    setMatch(prev => ({
      ...prev,
      [side === 'HOME' ? 'isHomeRosterUnlocked' : 'isAwayRosterUnlocked']: !prev[side === 'HOME' ? 'isHomeRosterUnlocked' : 'isAwayRosterUnlocked']
    }));
  }, []);

  /**
   * Obtiene las tarjetas amarillas activas y su tiempo restante.
   */
  const getActiveYellowCards = useCallback(() => {
    return events
      .filter(e => e.type === MatchEventType.YELLOW_CARD)
      .map(e => {
        const elapsed = match.currentMinute - e.minute;
        const remaining = Math.max(0, match.yellowCardDuration - elapsed);
        return { ...e, remaining };
      })
      .filter(e => e.remaining > 0);
  }, [events, match.currentMinute, match.yellowCardDuration]);

  /**
   * Elimina un evento y revierte su impacto en el marcador.
   */
  const removeEvent = useCallback((eventId: string) => {
    setEvents(prev => {
      const eventToRemove = prev.find(e => e.id === eventId);
      if (!eventToRemove) return prev;

      const isHome = eventToRemove.teamId === match.homeTeamId;
      setMatch(matchPrev => ({
        ...matchPrev,
        homeScore: isHome ? matchPrev.homeScore - eventToRemove.points : matchPrev.homeScore,
        awayScore: !isHome ? matchPrev.awayScore - eventToRemove.points : matchPrev.awayScore
      }));

      return prev.filter(e => e.id !== eventId);
    });
  }, [match]);

  return {
    match,
    events,
    isRunning,
    setIsRunning,
    addEvent,
    removeEvent,
    toggleRosterLock,
    getYellowCardDuration,
    getActiveYellowCards,
    canEditRoster
  };
};
