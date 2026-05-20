/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole, Club, Match, MatchModality, MatchStatus, Player } from '../../types';

export const MOCK_USERS: Record<string, any> = {
  'admin@apex.com': {
    id: 'u1',
    email: 'admin@apex.com',
    name: 'Admin Supremo',
    roles: [UserRole.ADMIN],
    isApproved: true,
    password: 'admin123',
    pin: '1234'
  },
  'referee@apex.com': {
    id: 'u2',
    email: 'referee@apex.com',
    name: 'Juan Referí',
    roles: [UserRole.REFEREE],
    isApproved: true,
    password: 'referee123',
    pin: '1234'
  },
  'manager@apex.com': {
    id: 'u5',
    email: 'manager@apex.com',
    name: 'Gerardo Designador',
    roles: [UserRole.REFEREE],
    isApproved: true,
    isRefereeManager: true,
    password: 'manager123',
    pin: '1234'
  },
  'coach@club-a.com': {
    id: 'u3',
    email: 'coach@club-a.com',
    name: 'Entrenador A',
    roles: [UserRole.COACH],
    isApproved: true,
    clubId: 'c1',
    password: 'coach123',
    pin: '1234'
  },
  'medical@apex.com': {
    id: 'u4',
    email: 'medical@apex.com',
    name: 'Dr. Rugby',
    roles: [UserRole.MEDICAL],
    isApproved: true,
    password: 'medical123',
    pin: '1234'
  }
};

export const MOCK_CLUBS: Record<string, Club> = {
  'c1': { id: 'c1', name: 'Leones Rugby Club' },
  'c2': { id: 'c2', name: 'Águilas del Sur' },
  'c3': { id: 'c3', name: 'Tigres de la Montaña' },
  'c4': { id: 'c4', name: 'Albatros XV' }
};

export const MOCK_PLAYERS: Player[] = [
  { id: 'p1', clubId: 'c1', firstName: 'Carlos', lastName: 'Pérez', number: 1, idCard: '12345', isMedicalBlocked: false, isSuspended: false },
  { id: 'p2', clubId: 'c1', firstName: 'Juan', lastName: 'Gómez', number: 10, idCard: '54321', isMedicalBlocked: false, isSuspended: false },
  { id: 'p4', clubId: 'c1', firstName: 'Mateo', lastName: 'Silva', number: 2, idCard: '11223', isMedicalBlocked: false, isSuspended: false },
  { id: 'p5', clubId: 'c1', firstName: 'Santiago', lastName: 'Ortega', number: 3, idCard: '11224', isMedicalBlocked: false, isSuspended: false },
  
  { id: 'p3', clubId: 'c2', firstName: 'Luis', lastName: 'Rivas', number: 15, idCard: '67890', isMedicalBlocked: false, isSuspended: false },
  { id: 'p7', clubId: 'c2', firstName: 'Javier', lastName: 'Morales', number: 6, idCard: '22331', isMedicalBlocked: false, isSuspended: false },
  { id: 'p8', clubId: 'c2', firstName: 'Esteban', lastName: 'Díaz', number: 7, idCard: '22332', isMedicalBlocked: false, isSuspended: false },
  { id: 'p9', clubId: 'c2', firstName: 'Bruno', lastName: 'Fernández', number: 9, idCard: '22333', isMedicalBlocked: false, isSuspended: false },

  { id: 'p11', clubId: 'c3', firstName: 'Alejandro', lastName: 'Torres', number: 1, idCard: '33441', isMedicalBlocked: false, isSuspended: false },
  { id: 'p12', clubId: 'c3', firstName: 'Rodrigo', lastName: 'López', number: 2, idCard: '33442', isMedicalBlocked: false, isSuspended: false },
  { id: 'p13', clubId: 'c3', firstName: 'Camilo', lastName: 'Vargas', number: 3, idCard: '33443', isMedicalBlocked: false, isSuspended: false },
  { id: 'p14', clubId: 'c3', firstName: 'Facundo', lastName: 'Soler', number: 4, idCard: '33444', isMedicalBlocked: false, isSuspended: false },

  { id: 'p16', clubId: 'c4', firstName: 'Gonzalo', lastName: 'Pires', number: 11, idCard: '44551', isMedicalBlocked: false, isSuspended: false },
  { id: 'p17', clubId: 'c4', firstName: 'Marcelo', lastName: 'Benítez', number: 12, idCard: '44552', isMedicalBlocked: false, isSuspended: false },
  { id: 'p18', clubId: 'c4', firstName: 'Joaquín', lastName: 'Martínez', number: 13, idCard: '44553', isMedicalBlocked: false, isSuspended: false },
  { id: 'p19', clubId: 'c4', firstName: 'Andrés', lastName: 'Herrera', number: 14, idCard: '44554', isMedicalBlocked: false, isSuspended: false }
];

const now = new Date();

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    tournamentId: 't1',
    homeTeamId: 'c1',
    awayTeamId: 'c2',
    date: new Date(now.getTime() - 1000 * 60 * 30), // Empezó hace 30 min
    modality: MatchModality.XVS,
    status: MatchStatus.LIVE,
    homeScore: 12,
    awayScore: 5,
    currentMinute: 32,
    homeRosterIds: ['p1', 'p2'],
    awayRosterIds: ['p3'],
    refereeTableId: 'u2',
    halfDuration: 40,
    yellowCardDuration: 10
  },
  {
    id: 'm2',
    tournamentId: 't2',
    homeTeamId: 'c3',
    awayTeamId: 'c4',
    date: new Date(now.getTime() + 1000 * 60 * 60), // En 1 hora
    modality: MatchModality.SEVENS,
    status: MatchStatus.SCHEDULED,
    homeScore: 0,
    awayScore: 0,
    currentMinute: 0,
    homeRosterIds: [],
    awayRosterIds: [],
    halfDuration: 7,
    yellowCardDuration: 2
  },
  {
    id: 'm3',
    tournamentId: 't1',
    homeTeamId: 'c1',
    awayTeamId: 'c2',
    date: new Date(now.getTime() - 1000 * 60 * 90), // Hace 90 mins
    modality: MatchModality.XVS,
    status: MatchStatus.WAITING_VALIDATION,
    homeScore: 24,
    awayScore: 19,
    currentMinute: 80,
    homeRosterIds: ['p1', 'p2'],
    awayRosterIds: ['p3'],
    halfDuration: 40,
    yellowCardDuration: 10,
    finishTime: new Date(now.getTime() - 1000 * 60 * 5) // Concluyó hace 5 minutos
  }
];

export const MOCK_STANDINGS: any[] = [
  {
    clubId: 'c1',
    played: 5,
    won: 4,
    drawn: 0,
    lost: 1,
    pointsFor: 124,
    pointsAgainst: 45,
    pointsDiff: 79,
    yellowCards: 2,
    redCards: 0,
    totalPoints: 17
  },
  {
    clubId: 'c2',
    played: 5,
    won: 3,
    drawn: 1,
    lost: 1,
    pointsFor: 89,
    pointsAgainst: 67,
    pointsDiff: 22,
    yellowCards: 4,
    redCards: 1,
    totalPoints: 14
  },
  {
    clubId: 'c3',
    played: 5,
    won: 2,
    drawn: 0,
    lost: 3,
    pointsFor: 56,
    pointsAgainst: 98,
    pointsDiff: -42,
    yellowCards: 1,
    redCards: 0,
    totalPoints: 8
  }
];

/**
 * Retorna los minutos y segundos reales calculados para un partido en curso,
 * incluso si el componente de mesa no está montado (calculando según wall-clock).
 */
export function getLiveMatchTime(match: Match): { currentMinute: number; currentSecond: number } {
  if (match.timerIsRunning && match.timerStartedAt) {
    const elapsedMs = Date.now() - match.timerStartedAt;
    const elapsedSecs = Math.floor(elapsedMs / 1000);
    const totalSecs = (match.currentSecond ?? 0) + elapsedSecs;
    const addedMins = Math.floor(totalSecs / 60);
    const finalSec = totalSecs % 60;
    const finalMin = (match.currentMinute ?? 0) + addedMins;
    return { currentMinute: finalMin, currentSecond: finalSec };
  }
  return { 
    currentMinute: match.currentMinute ?? 0, 
    currentSecond: match.currentSecond ?? 0 
  };
}

