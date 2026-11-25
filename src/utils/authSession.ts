export type AuthProvider = 'email' | 'google';

export interface AuthSession {
  email: string;
  displayName: string;
  provider: AuthProvider;
  signedInAt: string;
  keepSignedIn: boolean;
}

export interface LocalAccountRecord {
  email: string;
  passwordDigest: string;
  displayName: string;
  program: string;
  yearLevel: string;
  section: string;
  createdAt: string;
}

export const AUTH_SESSION_KEY = 'ctrl_path_auth_session_v1';
export const AUTH_ACCOUNTS_KEY = 'ctrl_path_auth_accounts_v1';
export const AUTH_GUEST_KEY = 'ctrl_path_guest_session_v1';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function validateSignInFields(email: string, password: string): string {
  if (!isValidEmail(email) || !password) {
    return 'Enter your email and password.';
  }
  return '';
}

export function validateSignUpFields(
  email: string,
  password: string,
): { emailErr: string; pwErr: string } {
  return {
    emailErr: isValidEmail(email) ? '' : 'Enter a valid email address.',
    pwErr: password.length >= 8 ? '' : 'Use at least 8 characters.',
  };
}

export function validateFullName(name: string): string {
  return name.trim().length >= 2 ? '' : 'Enter your full name.';
}

export function firstNameFrom(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first || 'Luminary';
}

export function fallbackNameFromEmail(email: string): string {
  const local = email.trim().split('@')[0] || '';
  const cleaned = local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .trim();
  return cleaned || 'Luminary';
}

function digestPassword(password: string): string {
  // Deterministic lightweight hash for per-browser demo account validation.
  let hash = 2166136261;
  for (let i = 0; i < password.length; i++) {
    hash ^= password.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `v1:${(hash >>> 0).toString(16)}`;
}

function safeReadAccounts(storage: Storage | undefined): Record<string, LocalAccountRecord> {
  if (!storage) return {};
  try {
    const raw = storage.getItem(AUTH_ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, LocalAccountRecord>) : {};
  } catch {
    return {};
  }
}

export function registerLocalAccount(
  storage: Storage | undefined,
  params: {
    email: string;
    password: string;
    displayName: string;
    program?: string;
    yearLevel?: string;
    section?: string;
    now?: string;
  },
): LocalAccountRecord {
  const normalizedEmail = params.email.trim().toLowerCase();
  const record: LocalAccountRecord = {
    email: normalizedEmail,
    passwordDigest: digestPassword(params.password),
    displayName: params.displayName.trim(),
    program: (params.program || '').trim(),
    yearLevel: (params.yearLevel || '').trim(),
    section: (params.section || '').trim(),
    createdAt: params.now || new Date().toISOString(),
  };
  if (storage) {
    try {
      const existing = safeReadAccounts(storage);
      existing[normalizedEmail] = record;
      storage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(existing));
    } catch {
      // Ignore storage quota errors during local account cache write
    }
  }
  return record;
}

export function authenticateLocalAccount(
  storage: Storage | undefined,
  email: string,
  password: string,
): { ok: true; account?: LocalAccountRecord } | { ok: false; error: string } {
  const validationError = validateSignInFields(email, password);
  if (validationError) return { ok: false, error: validationError };
  const normalizedEmail = email.trim().toLowerCase();
  const existing = safeReadAccounts(storage)[normalizedEmail];
  if (existing && existing.passwordDigest !== digestPassword(password)) {
    return { ok: false, error: 'Incorrect email or password.' };
  }
  return { ok: true, account: existing };
}

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.email === 'string' &&
      typeof parsed.displayName === 'string' &&
      (parsed.provider === 'email' || parsed.provider === 'google')
    ) {
      return parsed as AuthSession;
    }
  } catch {
    return null;
  }
  return null;
}

export function readAuthSession(
  local: Storage | undefined,
  session: Storage | undefined,
): AuthSession | null {
  try {
    const fromSession = session ? parseSession(session.getItem(AUTH_SESSION_KEY)) : null;
    if (fromSession) return fromSession;
    const fromLocal = local ? parseSession(local.getItem(AUTH_SESSION_KEY)) : null;
    return fromLocal;
  } catch {
    return null;
  }
}

export function saveAuthSession(
  value: AuthSession,
  local: Storage | undefined,
  session: Storage | undefined,
): void {
  try {
    const serialized = JSON.stringify(value);
    if (value.keepSignedIn) {
      local?.setItem(AUTH_SESSION_KEY, serialized);
      session?.removeItem(AUTH_SESSION_KEY);
    } else {
      session?.setItem(AUTH_SESSION_KEY, serialized);
      local?.removeItem(AUTH_SESSION_KEY);
    }
  } catch {
    // Ignore storage unavailability
  }
}

export function clearAuthSession(
  local: Storage | undefined,
  session: Storage | undefined,
): void {
  try {
    local?.removeItem(AUTH_SESSION_KEY);
    session?.removeItem(AUTH_SESSION_KEY);
  } catch {
    // Ignore storage unavailability
  }
}

export function readGuestSession(session: Storage | undefined): boolean {
  try {
    return session?.getItem(AUTH_GUEST_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveGuestSession(active: boolean, session: Storage | undefined): void {
  try {
    if (active) {
      session?.setItem(AUTH_GUEST_KEY, 'true');
    } else {
      session?.removeItem(AUTH_GUEST_KEY);
    }
  } catch {
    // Ignore storage unavailability
  }
}

export function hasPortalAccess(
  authSession: AuthSession | null,
  isGuest: boolean,
  search?: string,
): boolean {
  if (authSession || isGuest) return true;
  if (search) {
    try {
      const params = new URLSearchParams(search);
      if (params.get('autostart') === '1') return true;
    } catch {
      // Ignore malformed query string
    }
  }
  return false;
}

