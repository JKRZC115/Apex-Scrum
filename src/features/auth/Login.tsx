/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Navigate } from 'react-router-dom';

export const Login = () => {
  const { user, loginWithGoogle, loginWithEmail, requestRoles, activeRole, setActiveRole } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [clubId, setClubId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginWithEmail(email, password);
    if (!success) setError('Credenciales de prueba inválidas');
  };

  if (user) {
    const approvedRoles = user.roles.filter(r => r !== UserRole.PUBLIC);

    // Si no tiene roles aprobados (solo public) y no hay solicitud pendiente, mostrar registro
    if (approvedRoles.length === 0 && !user.pendingRoles) {
      // Continuará al formulario de registro abajo
    } else if (user.pendingRoles && approvedRoles.length === 0) {
      // Mostrará pantalla de espera de aprobación
    } else {
      // Tiene roles aprobados
      // Si ya seleccionó el activeRole o si es ADMIN (pasa directo si se quiere, o le damos opción de elegir si tiene más de 1):
      if (activeRole) {
        if (activeRole === UserRole.ADMIN) return <Navigate to="/admin" />;
        if (activeRole === UserRole.REFEREE) return <Navigate to="/referee" />;
        if (activeRole === UserRole.COACH) return <Navigate to="/coach" />;
        if (activeRole === UserRole.MEDICAL) return <Navigate to="/medical" />;
      }

      // Si sólo tiene 1 rol aprobado (excluyendo PUBLIC), se auto-asigna
      if (approvedRoles.length === 1 && !user.roles.includes(UserRole.ADMIN)) {
        setActiveRole(approvedRoles[0]);
      } else {
        // Múltiples roles aprobados, permitimos elegir sólo UNO para la sesión
        const rolesToChoose = user.roles.filter(r => r !== UserRole.PUBLIC);
        return (
          <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-150 w-full max-w-xl text-center space-y-8 animate-in fade-in zoom-in duration-300">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#06bb45] bg-green-50 border border-green-200 px-4 py-1.5 rounded-full uppercase tracking-widest inline-block">
                  Selección de Perfil de Sesión
                </span>
                <h2 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter leading-none">¿Con qué perfil deseas ingresar hoy?</h2>
                <p className="text-slate-400 text-xs font-bold leading-normal uppercase tracking-wider">
                  Hola, {user.name}. Tu cuenta tiene múltiples perfiles autorizados en Apex Scrum. Elige uno para iniciar sesión:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-left">
                {rolesToChoose.map((role) => {
                  let text = "";
                  let desc = "";
                  let themeClass = "";
                  
                  if (role === UserRole.ADMIN) {
                    text = "Administrador Supremo";
                    desc = "Ves todas las secciones, apruebas personal, configuras torneos y sobreescribes marcadores con autoría directa.";
                    themeClass = "border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-400 text-red-700";
                  } else if (role === UserRole.COACH) {
                    text = "Director Técnico / Entrenador";
                    desc = "Inscribe jugadores en las planillas de tu club y realiza el descargo o validación final de marcadores.";
                    themeClass = "border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 text-blue-700";
                  } else if (role === UserRole.REFEREE) {
                    text = "Referí / Oficial de Arbitraje";
                    desc = "Oficializa el control de mesa o firma el acta de juego digital como Árbitro Central.";
                    themeClass = "border-purple-100 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-400 text-purple-700";
                  } else if (role === UserRole.MEDICAL) {
                    text = "Médico u Odontólogo de Campo";
                    desc = "Genera reportes médicos obligatorios, bloquea jugadores con riesgo de contusión cardiovascular o muscular.";
                    themeClass = "border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400 text-emerald-700";
                  }

                  return (
                    <button
                      key={role}
                      onClick={() => setActiveRole(role)}
                      className={`p-6 rounded-3xl border-2 transition-all flex items-start gap-4 cursor-pointer text-left ${themeClass}`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-900 text-sm uppercase italic tracking-tight">{text}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
    }
  }

  // Si el usuario está logueado pero solo es PUBLIC, mostramos selección de rol
  if (user && user.roles.length === 1 && user.roles[0] === UserRole.PUBLIC && !user.pendingRoles) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 w-full max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Inscripción de Perfil</h2>
            <p className="text-slate-400 font-medium">Selecciona los roles que deseas desempeñar en la plataforma.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[UserRole.COACH, UserRole.REFEREE, UserRole.MEDICAL].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setSelectedRoles(prev => 
                    prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                  );
                }}
                className={`p-6 rounded-3xl border-2 transition-all text-left space-y-2 ${selectedRoles.includes(role) ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <p className="font-black text-slate-900 uppercase italic text-sm">{role}</p>
                <p className="text-[10px] text-slate-400 font-medium">Solicitar acceso como {role.toLowerCase()}</p>
              </button>
            ))}
          </div>

          {selectedRoles.includes(UserRole.COACH) && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Selecciona tu Club</label>
               <select 
                 className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-black text-sm outline-none focus:border-blue-600"
                 value={clubId}
                 onChange={e => setClubId(e.target.value)}
               >
                 <option value="">Seleccionar...</option>
                 <option value="c1">Leones Rugby Club</option>
                 <option value="c2">Águilas del Sur</option>
               </select>
            </div>
          )}

          <button
            onClick={() => requestRoles(selectedRoles, clubId)}
            disabled={selectedRoles.length === 0 || (selectedRoles.includes(UserRole.COACH) && !clubId)}
            className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] hover:bg-black transition-all shadow-xl disabled:opacity-50 uppercase tracking-[.3em] text-xs"
          >
            Enviar Solicitud al Administrador
          </button>
        </div>
      </div>
    );
  }

  if (user?.pendingRoles) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 w-full max-w-lg text-center space-y-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Solicitud Pendiente</h2>
          <p className="text-slate-500 font-medium">Tu solicitud para los roles <span className="font-black text-blue-600 uppercase">{user.pendingRoles.join(', ')}</span> está siendo revisada por un administrador.</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
          >
            Verificar Estado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-12 rounded-[56px] shadow-2xl shadow-blue-900/10 border border-slate-100 w-full max-w-md text-center space-y-10">
        <div className="space-y-4">
           <div className="w-20 h-20 bg-blue-600 rounded-[32px] mx-auto flex items-center justify-center shadow-xl shadow-blue-200">
             <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
           </div>
           <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Apex Scrum</h2>
           <p className="text-slate-400 font-medium">Gestión Profesional de Rugby Regional</p>
        </div>
        
        <form onSubmit={handleManualLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
              placeholder="admin@apex.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Contraseña</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-4 rounded-[24px] hover:bg-black transition-all shadow-xl uppercase tracking-widest text-xs"
          >
            Entrar con Credenciales
          </button>
        </form>

        <div className="relative">
           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
           <div className="relative flex justify-center text-[10px] uppercase tracking-[.4em] font-black"><span className="bg-white px-4 text-slate-300">Ó continuar con</span></div>
        </div>
        
        <button 
          onClick={loginWithGoogle}
          className="w-full bg-white border-2 border-slate-100 text-slate-900 font-black py-6 rounded-[32px] hover:border-blue-600 hover:text-blue-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-4 group uppercase tracking-widest text-[10px]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
          Al entrar aceptas los términos de juego limpio
        </p>
      </div>
    </div>
  );
};
