const MESSAGE_KEYS = {
  'auth/invalid-email': 'invalidEmail',
  'auth/user-disabled': 'userDisabled',
  'auth/user-not-found': 'userNotFound',
  'auth/wrong-password': 'wrongPassword',
  'auth/invalid-credential': 'wrongPassword',
  'auth/email-already-in-use': 'emailInUse',
  'auth/weak-password': 'weakPassword',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/popup-closed-by-user': 'popupClosed',
  'auth/network-request-failed': 'networkError',
  'auth/not-configured': 'notConfigured',
  'auth/invalid-api-key': 'notConfigured',
  'auth/operation-not-allowed': 'operationNotAllowed',
  'auth/unauthorized-domain': 'unauthorizedDomain',
  'auth/missing-password': 'passwordRequired',
  'auth/configuration-not-found': 'operationNotAllowed',
};

/**
 * Turns a Firebase error into a translation key under auth.errors.*,
 * falling back to a generic message when the code isn't mapped.
 */
export function authErrorKey(error) {
  const code = error?.code || '';
  return MESSAGE_KEYS[code] || 'generic';
}

/**
 * Full translated message for a caught auth error. For unmapped codes, the
 * raw Firebase code is appended so it shows up in the UI instead of only
 * being visible in the browser console — this is what makes an unexpected
 * error self-diagnosing for someone who isn't reading DevTools.
 */
export function authErrorMessage(error, t) {
  const key = authErrorKey(error);
  const message = t(`auth.errors.${key}`);
  if (key === 'generic' && error?.code) {
    return `${message} (${error.code})`;
  }
  return message;
}
