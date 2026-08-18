import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;

if (isFirebaseConfigured) {
  // Guard against re-initializing during Vite HMR.
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  // No .env keys yet — every other part of Basira (upload, dashboard, chat)
  // still works fully. Calling getAuth() with an empty/placeholder config
  // throws synchronously and used to crash the entire app at import time;
  // AuthContext now checks `auth` before using it and surfaces a clean
  // "not configured" message on the auth pages instead.
  console.warn(
    '[Basira] Firebase is not configured — set VITE_FIREBASE_* in frontend/.env to enable login/register.'
  );
}

export { auth };
export default app;
