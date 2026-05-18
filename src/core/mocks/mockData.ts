/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole, Club, Match, MatchModality, MatchStatus, Player } from '../../types';

export const MOCK_USERS: Record<string, User & { password: string }> = {
  'admin@apex.com': {
    id: 'u1',
    email: 'admin@apex.com',
    name: 'Admin Supremo',
    role: UserRole.ADMIN,
    isApproved: true,
    password: 'admin123'
  },
  'referee@apex.com': {
    id: 'u2',
    email: 'referee@apex.com',
    name: 'Juan Referí',
    role: UserRole.REFEREE,
    isApproved: true,
    password: 'referee123'
  },
  'coach@club-a.com': {
    id: 'u3',
    email: 'coach@club-a.com',
    name: 'Entrenador A',
    role: UserRole.COACH,
    isApproved: true,
    clubId: 'c1',
    password: 'coach123'
  },
  'medical@apex.com': {
    id: 'u4',
    email: 'medical@apex.com',
    name: 'Dr. Rugby',
    role: UserRole.MEDICAL,
    isApproved: true,
    password: 'medical123'
  }
};

export const MOCK_CLUBS: Record<string, Club> = {
  'c1': { id: 'c1', name: 'Leones Rugby Club' },
  'c2': { id: 'c2', name: 'Águilas del Sur' },
  'c3': { id: 'c3', name: 'Tigres de la Montaña' },
  'c4': { id: 'c4', name: 'Albatros XV' }
};

export const MOCK_PLAYERS: Player[] = [
  { id: 'p1', clubId: 'c1', name: 'Carlos Pérez', number: 1, idCard: '12345', isMedicalBlocked: false, isSuspended: false },
  { id: 'p2', clubId: 'c1', name: 'Juan Gómez', number: 10, idCard: '54321', isMedicalBlocked: false, isSuspended: false },
  { id: 'p3', clubId: 'c2', name: 'Luis Rivas', number: 15, idCard: '67890', isMedicalBlocked: false, isSuspended: false }
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
    halfDuration: 40
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
    halfDuration: 7
  }
];
