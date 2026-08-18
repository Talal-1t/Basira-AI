import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext(null);

function requireAuth() {
  if (!auth) {
    const err = new Error(
      'Firebase is not configured. Add VITE_FIREBASE_* to frontend/.env to enable sign-in.'
    );
    err.code = 'auth/not-configured';
    throw err;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Nothing to subscribe to — treat this as "signed out" rather than
      // hanging on a loading state forever.
      setInitializing(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  async function register({ name, email, password }) {
    requireAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }
    return credential.user;
  }

  async function login({ email, password }) {
    requireAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }

  async function loginWithGoogle() {
    requireAuth();
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    return credential.user;
  }

  async function resetPassword(email) {
    requireAuth();
    await sendPasswordResetEmail(auth, email);
  }

  async function logout() {
    requireAuth();
    await signOut(auth);
  }

  const value = {
    user,
    initializing,
    isFirebaseConfigured,
    register,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
