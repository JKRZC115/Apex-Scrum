/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { auth, db, signInWithGoogle } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { MOCK_USERS } from '../core/mocks/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestRoles: (roles: UserRole[], clubId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data() as User);
        } else {
          // Usuario nuevo, aún no tiene perfil en DB
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            roles: [UserRole.PUBLIC],
            isApproved: true,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const found = MOCK_USERS[email];
    if (found && found.password === pass) {
      const { password, ...userData } = found;
      setUser(userData as User);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const requestRoles = async (roles: UserRole[], clubId?: string) => {
    if (!auth.currentUser) return;
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const updatedUser: User = {
      id: auth.currentUser.uid,
      email: auth.currentUser.email || '',
      name: auth.currentUser.displayName || '',
      roles: user?.roles || [UserRole.PUBLIC],
      isApproved: false, // Requiere aprobación porque pide roles nuevos
      pendingRoles: roles,
      clubId,
    };

    await setDoc(userRef, updatedUser, { merge: true });
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, logout, requestRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
