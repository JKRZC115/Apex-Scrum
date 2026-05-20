import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal = ({ isOpen, onClose }: ProfileSettingsModalProps) => {
  const { user, updateUser, activeRole } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState((user as any)?.password || '');
  const [pin, setPin] = useState((user as any)?.pin || '');
  
  const [showEmailNotice, setShowEmailNotice] = useState(false);
  const [emailNoticeMsg, setEmailNoticeMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !user) return null;

  const isCoachOrReferee = user.roles.includes(UserRole.COACH) || user.roles.includes(UserRole.REFEREE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setShowEmailNotice(false);

    if (isCoachOrReferee && pin && pin.trim().length !== 4) {
      setErrorMsg('El PIN debe tener exactamente 4 dígitos.');
      return;
    }

    const previousPin = (user as any)?.pin || '';
    const pinChanged = pin !== previousPin;

    await updateUser({
      name,
      email,
      password,
      pin
    });

    setSuccessMsg('Datos actualizados correctamente.');

    if (pinChanged && isCoachOrReferee) {
      setEmailNoticeMsg(`📧 PIN modificado. Se ha enviado un correo de confirmación de seguridad a: ${email}`);
      setShowEmailNotice(true);
    }

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="bg-[#065e20] p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Datos de Usuario</h3>
            <p className="text-xs text-green-200 uppercase mt-1 font-bold">Modifica tus datos personales y credenciales de acceso</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-black transition-all"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl text-xs font-black uppercase text-center animate-pulse">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-black uppercase text-center">
              {errorMsg}
            </div>
          )}

          {showEmailNotice && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-5 rounded-2xl text-xs font-bold uppercase leading-relaxed text-center">
              {emailNoticeMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nombre Completo</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-[#065e20] transition-colors text-slate-900" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Correo Electrónico</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-[#065e20] transition-colors text-slate-900" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Contraseña</label>
              <input 
                required 
                type="text" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-[#065e20] transition-colors text-slate-900" 
              />
            </div>

            {isCoachOrReferee && (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
                    PIN de Seguridad para Firmas (4 dígitos)
                  </label>
                  <span className="text-[9px] font-extrabold text-blue-500 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
                    DT / Referí
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 font-bold leading-normal uppercase">
                  Este código numérico se solicita para firmar actas de juego y aprobar marcadores.
                </p>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="1234"
                  value={pin} 
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))} 
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-center tracking-[0.5em] outline-none focus:border-[#065e20] transition-colors text-slate-900" 
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 font-black text-[10px] text-slate-400 hover:text-slate-600 uppercase tracking-wider py-4 text-center"
            >
              Cerrar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-[#065e20] hover:bg-[#043d14] text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-wider shadow-lg shadow-green-100"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
