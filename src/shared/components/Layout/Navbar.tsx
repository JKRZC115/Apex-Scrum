/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

import { UserRole } from '../../../types';

export const Navbar = () => {
  const { user, logout, activeRole, setActiveRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwitchProfile = () => {
    setActiveRole(null);
    navigate('/login');
  };

  const hasApprovedMultiple = user && user.roles.filter(r => r !== UserRole.PUBLIC).length > 1;

  return (
    <nav className="bg-[#065e20] text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-[#06bb45] p-2 rounded-2xl group-hover:bg-white group-hover:scale-110 transition-all shadow-lg group-hover:shadow-green-400/20">
             <svg className="w-6 h-6 text-white group-hover:text-[#065e20]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C12 2 5 6 5 12C5 18 12 22 12 22C12 22 19 18 19 12C19 6 12 2 12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.5 4.5C8.5 4.5 10 7 10 12C10 17 8.5 19.5 8.5 19.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.5 4.5C15.5 4.5 14 7 14 12C14 17 15.5 19.5 15.5 19.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl italic uppercase tracking-tighter leading-none">Apex Scrum</span>
            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-green-300 opacity-60">Liga Risaraldense de Rugby</span>
          </div>
        </Link>
        
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest italic items-center">
          <Link to="/" className="hover:text-green-300 transition-colors">Cartelera</Link>
          {activeRole === UserRole.ADMIN && <Link to="/admin" className="hover:text-green-300 transition-colors">Admin</Link>}
          {activeRole === UserRole.REFEREE && <Link to="/referee" className="hover:text-green-300 transition-colors">Referí</Link>}
          {activeRole === UserRole.COACH && <Link to="/coach" className="hover:text-green-300 transition-colors">Entrenador</Link>}
          {activeRole === UserRole.MEDICAL && <Link to="/medical" className="hover:text-green-300 transition-colors">Médico</Link>}
          
          {hasApprovedMultiple && (
            <button 
              onClick={handleSwitchProfile}
              className="bg-[#043d14] px-3.5 py-1.5 rounded-lg border border-green-500 hover:bg-[#065e20] text-[9px] hover:text-green-300 transition-colors"
            >
              Cambiar Perfil
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-white italic uppercase tracking-tight">{user.name}</p>
                <div className="flex gap-1 justify-end mt-0.5 items-center">
                   {activeRole && (
                     <span className="text-[7px] bg-blue-900 border border-blue-600 px-1.5 py-0.5 rounded font-black text-blue-200 uppercase tracking-wider">
                       Sesión: {activeRole}
                     </span>
                   )}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-[#064215] px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-900/50 hover:text-red-200 transition-all border border-green-900"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-blue-600 px-6 py-2 rounded-full text-xs font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
