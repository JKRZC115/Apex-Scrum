/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Roles de usuario dentro del sistema Apex Scrum.
 */
export enum UserRole {
  ADMIN = 'ADMIN',       // Administrador supremo
  COACH = 'COACH',       // Entrenador de club
  REFEREE = 'REFEREE',   // Árbitro (Mesa o Central)
  MEDICAL = 'MEDICAL',   // Cuerpo médico / Fisio
  PUBLIC = 'PUBLIC'      // Acceso abierto
}

/**
 * Modalidades de Rugby soportadas.
 */
export enum MatchModality {
  XVS = 'XVS',
  SEVENS = 'SEVENS'
}

/**
 * Estados posibles de un partido.
 */
export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',             // Programado
  LIVE = 'LIVE',                       // En vivo
  WAITING_VALIDATION = 'WAITING_VALIDATION', // Esperando firma del Referee Central
  DISPUTED = 'DISPUTED',               // Marcador en disputa por entrenador
  FINISHED = 'FINISHED'                // Finalizado definitivamente
}

/**
 * Tipos de eventos que ocurren en un partido.
 */
export enum MatchEventType {
  TRY = 'TRY',
  CONVERSION = 'CONVERSION',
  PENALTY_KICK = 'PENALTY_KICK',
  DROP_GOAL = 'DROP_GOAL',
  PENALTY_TRY = 'PENALTY_TRY',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  SUBSTITUTION = 'SUBSTITUTION'
}

/**
 * Interfaz de Usuario
 */
export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];   // Ahora soporta múltiples roles
  isApproved: boolean; // Controlado por el Admin
  clubId?: string;     // Obligatorio para COACH y MEDICAL
  pendingRoles?: UserRole[]; // Roles solicitados pendientes de aprobación
  isRefereeManager?: boolean; // Habilitado por el admin para designaciones
  password?: string;          // Contraseña del usuario
  pin?: string;               // PIN de 4 dígitos para firmas de actas (referee y coach)
}

/**
 * Interfaz de Club
 */
export interface Club {
  id: string;
  name: string;
  logoUrl?: string;
}

/**
 * Interfaz de Jugador
 */
export interface Player {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  number: number;
  idCard: string;
  photoUrl?: string;
  isMedicalBlocked: boolean;
  isSuspended: boolean;
  suspensionEnd?: Date; // Para tarjetas amarillas o sanciones temporales
  suspendedMatchesLeft?: number; // Contador de partidos de sanción (para Rojas)
}

/**
 * Tabla de posiciones / Estadísticas
 */
export interface Standing {
  clubId: string;
  played: number;    // PJ
  won: number;       // PG
  drawn: number;     // PE
  lost: number;      // PP
  pointsFor: number; // PA
  pointsAgainst: number; // PR
  pointsDiff: number;    // DP
  yellowCards: number;   // TA
  redCards: number;      // TR
  totalPoints: number;   // Puntos en la tabla
}

/**
 * Interfaz de Torneo
 */
export interface Tournament {
  id: string;
  name: string;
  category: string; // M18, Mayores, etc.
  gender: 'M' | 'F';
  venue?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'FINISHED';
}

/**
 * Interfaz de Partido
 */
export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  date: Date;
  modality: MatchModality;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  currentMinute: number;
  startTime?: Date;
  rosterLockedAt?: Date; // 15 minutos antes la hora programada
  homeRosterIds: string[]; // IDs de jugadores titulares y suplentes
  awayRosterIds: string[];
  refereeCenterId?: string; // Árbitro central asignado
  refereeTableId?: string;  // Árbitro de mesa (operador)
  refereeA1Id?: string;     // Árbitro asistente 1
  refereeA2Id?: string;     // Árbitro asistente 2
  currentSecond?: number;   // Cronómetro - segundos (0-59)
  currentHalf?: number;     // 1er Tiempo (1), 2do Tiempo (2), Tiempo Extra (3)
  currentPeriod?: "No Iniciado" | "1er Tiempo" | "Entretiempo" | "2do Tiempo" | "Tiempo Extra" | "Finalizado";
  isHomeRosterUnlocked?: boolean; // Permite al entrenador local editar después del límite
  isAwayRosterUnlocked?: boolean; // Permite al entrenador visitante editar después del límite
  venue?: string;
  halfDuration: number; // Duración de cada tiempo en minutos (ej: 40 para XV's estándar)
  yellowCardDuration: number; // Duración de la tarjeta amarilla en minutos (ej: 10 o 2)
  homeAcceptedScore?: boolean; // Aceptación del coach local
  awayAcceptedScore?: boolean; // Aceptación del coach de la visita
  declinedByCoachId?: string;  // Coach que rechazó (si aplica)
  isDisputeActive?: boolean;   // Si se activó la disputa
  finishTime?: Date;           // Hora de finalización del partido por la mesa (para calcular los 15 minutos)
  isSigned?: boolean;          // Firma definitiva por el árbitro central
  timerIsRunning?: boolean;    // Indica si el cronómetro está corriendo en tiempo real
  timerStartedAt?: number;     // Timestamp en milisegundos cuando inició el cronómetro
}

/**
 * Interfaz de Evento de Partido
 */
export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  teamId: string;
  playerId?: string;    // Jugador que anota o entra
  playerOutId?: string; // Jugador que sale (solo para SUBSTITUTION)
  points: number;       // 5, 2, 3, 3, 7 respectivamente
  yellowCardEventId?: string; // Soportar ligar tarjeta roja con la segunda amarilla
}

/**
 * Interfaz de Reporte Médico
 */
export interface MedicalReport {
  id: string;
  playerId: string;
  doctorUid: string;
  injuryZone: string;
  injuryType: string;
  treatment: string;
  recommendations: string;
  date: Date;
  isIncapacitated: boolean; // Si bloquea al jugador
}

/**
 * Interfaz de Encuesta de Disputa (Tercer Tiempo Digital)
 */
export interface DisputeSurvey {
  id: string;
  matchId: string;
  coachUid: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED';
}
