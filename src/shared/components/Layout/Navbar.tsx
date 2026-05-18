/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-md group-hover:bg-blue-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight">APEX SCRUM</span>
        </Link>
        
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-blue-400 transition-colors">Torneos</Link>
          {user?.role === 'ADMIN' && <Link to="/admin" className="hover:text-blue-400 transition-colors">Admin</Link>}
          {(user?.role === 'REFEREE' || user?.role === 'ADMIN') && <Link to="/referee" className="hover:text-blue-400 transition-colors">Referí</Link>}
          {(user?.role === 'COACH' || user?.role === 'ADMIN') && <Link to="/coach" className="hover:text-blue-400 transition-colors">Entrenador</Link>}
          {(user?.role === 'MEDICAL' || user?.role === 'ADMIN') && <Link to="/medical" className="hover:text-blue-400 transition-colors">Médico</Link>}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-1">{user.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-slate-800 px-4 py-2 rounded-full text-xs hover:bg-red-900/50 hover:text-red-200 transition-all font-medium border border-slate-700"
              >
                Cerrar Sesión
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
