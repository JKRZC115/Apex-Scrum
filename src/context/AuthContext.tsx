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
  updateUser: (updatedData: Partial<User & { password?: string, pin?: string }>) => Promise<void>;
  registerWithEmail: (userData: User & { password?: string, pin?: string }) => Promise<void>;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockUserStr = localStorage.getItem('apex_mock_user');
    const mockRoleStr = localStorage.getItem('apex_mock_role');
    if (mockUserStr) {
      setUser(JSON.parse(mockUserStr));
      if (mockRoleStr) {
        setActiveRole(mockRoleStr as UserRole);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const uData = userSnap.data() as User;
          setUser(uData);
          if (uData.roles.length === 1) {
            setActiveRole(uData.roles[0]);
          }
        } else {
          // Usuario nuevo, aún no tiene perfil en DB
          const uData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            roles: [UserRole.PUBLIC],
            isApproved: true,
          };
          setUser(uData);
          setActiveRole(UserRole.PUBLIC);
        }
      } else {
        setUser(null);
        setActiveRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      localStorage.removeItem('apex_mock_user');
      localStorage.removeItem('apex_mock_role');
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const found = MOCK_USERS[email];
    if (found && found.password === pass) {
      setUser(found as User);
      localStorage.setItem('apex_mock_user', JSON.stringify(found));
      if (found.roles && found.roles.length === 1) {
        setActiveRole(found.roles[0]);
        localStorage.setItem('apex_mock_role', found.roles[0]);
      } else {
        setActiveRole(null);
        localStorage.removeItem('apex_mock_role');
      }
      return true;
    }
    return false;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('apex_mock_user');
    localStorage.removeItem('apex_mock_role');
  };

  const handleSetActiveRole = (role: UserRole | null) => {
    setActiveRole(role);
    if (role) {
      localStorage.setItem('apex_mock_role', role);
    } else {
      localStorage.removeItem('apex_mock_role');
    }
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

  const updateUser = async (updatedData: Partial<User & { password?: string, pin?: string }>) => {
    if (!user) return;
    const emailKey = user.email;
    const oldDetails = MOCK_USERS[emailKey] || {};
    const mergedObj = {
      ...user,
      ...oldDetails,
      ...updatedData
    };
    // Update global list dynamically
    MOCK_USERS[emailKey] = mergedObj;
    // Update state and persistence
    setUser(mergedObj as User);
    localStorage.setItem('apex_mock_user', JSON.stringify(mergedObj));
  };

  const registerWithEmail = async (newUserData: User & { password?: string, pin?: string }) => {
    MOCK_USERS[newUserData.email] = newUserData;
    setUser(newUserData);
    localStorage.setItem('apex_mock_user', JSON.stringify(newUserData));
    if (newUserData.roles && newUserData.roles.length === 1) {
      setActiveRole(newUserData.roles[0]);
      localStorage.setItem('apex_mock_role', newUserData.roles[0]);
    } else {
      setActiveRole(null);
      localStorage.removeItem('apex_mock_role');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithGoogle, 
      loginWithEmail, 
      logout, 
      requestRoles, 
      updateUser, 
      registerWithEmail, 
      activeRole, 
      setActiveRole: handleSetActiveRole 
    }}>
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
