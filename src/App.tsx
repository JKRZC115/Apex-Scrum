/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './shared/components/Layout/Navbar';
import PublicDashboard from './features/public/PublicDashboard';
import MatchControl from './features/referee/MatchControl';
import { MedicalModule } from './features/medical/MedicalModule';
import { CoachModule } from './features/coach/CoachModule';
import { AdminModule } from './features/admin/AdminModule';
import { TournamentConfig } from './features/admin/TournamentConfig';
import { Login } from './features/auth/Login';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <Navbar />
          <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<PublicDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/referee" element={<MatchControl />} />
              <Route path="/coach" element={<CoachModule />} />
              <Route path="/medical" element={<MedicalModule />} />
              <Route path="/admin" element={<AdminModule />} />
              <Route path="/admin/setup" element={<TournamentConfig />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
