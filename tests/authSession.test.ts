import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTH_GUEST_KEY,
  AUTH_SESSION_KEY,
  authenticateLocalAccount,
  clearAuthSession,
  fallbackNameFromEmail,
  firstNameFrom,
  hasPortalAccess,
  isValidEmail,
  readAuthSession,
  readGuestSession,
  registerLocalAccount,
  saveAuthSession,
  saveGuestSession,
  validateFullName,
  validateSignInFields,
  validateSignUpFields,
} from '../src/utils/authSession';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  clear() {
    this.store.clear();
  }
}

test('email and form field validation rules enforce clean error feedback', () => {
  assert.equal(isValidEmail('student@g.batstate-u.edu.ph'), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(validateSignInFields('bad', 'secret'), 'Enter your email and password.');
  assert.equal(validateSignInFields('student@g.batstate-u.edu.ph', ''), 'Enter your email and password.');
  assert.equal(validateSignInFields('student@g.batstate-u.edu.ph', 'secret123'), '');

  assert.deepEqual(validateSignUpFields('bad', '1234'), {
    emailErr: 'Enter a valid email address.',
    pwErr: 'Use at least 8 characters.',
  });
  assert.deepEqual(validateSignUpFields('student@g.batstate-u.edu.ph', '12345678'), {
    emailErr: '',
    pwErr: '',
  });

  assert.equal(validateFullName('J'), 'Enter your full name.');
  assert.equal(validateFullName('Juan Dela Cruz'), '');
  assert.equal(firstNameFrom('Juan Dela Cruz'), 'Juan');
  assert.equal(firstNameFrom('   '), 'Luminary');
  assert.equal(fallbackNameFromEmail('juan.dela-cruz@g.batstate-u.edu.ph'), 'Juan Dela Cruz');
});

test('local account registration verifies matching and wrong passwords', () => {
  const storage = new MemoryStorage();
  registerLocalAccount(storage, {
    email: 'Student@g.batstate-u.edu.ph',
    password: 'password123',
    displayName: 'Maria Clara',
    program: 'BS Information Technology',
    yearLevel: '2nd year',
    section: '2101',
    now: '2026-11-20T00:00:00.000Z',
  });

  const wrong = authenticateLocalAccount(storage, 'student@g.batstate-u.edu.ph', 'wrongpass');
  assert.equal(wrong.ok, false);
  if (!wrong.ok) {
    assert.equal(wrong.error, 'Incorrect email or password.');
  }

  const ok = authenticateLocalAccount(storage, 'student@g.batstate-u.edu.ph', 'password123');
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.account?.displayName, 'Maria Clara');
    assert.equal(ok.account?.program, 'BS Information Technology');
  }
});

test('session persistence respects keepSignedIn storage selection and clearing', () => {
  const local = new MemoryStorage();
  const session = new MemoryStorage();

  const persistent = {
    email: 'juan@g.batstate-u.edu.ph',
    displayName: 'Juan Dela Cruz',
    provider: 'email' as const,
    signedInAt: '2026-11-20T00:00:00.000Z',
    keepSignedIn: true,
  };
  saveAuthSession(persistent, local, session);
  assert.ok(local.getItem(AUTH_SESSION_KEY));
  assert.equal(session.getItem(AUTH_SESSION_KEY), null);
  assert.deepEqual(readAuthSession(local, session), persistent);

  const ephemeral = { ...persistent, keepSignedIn: false };
  saveAuthSession(ephemeral, local, session);
  assert.equal(local.getItem(AUTH_SESSION_KEY), null);
  assert.ok(session.getItem(AUTH_SESSION_KEY));
  assert.deepEqual(readAuthSession(local, session), ephemeral);

  clearAuthSession(local, session);
  assert.equal(readAuthSession(local, session), null);
});

test('guest session persistence and portal access gate default to login first', () => {
  const session = new MemoryStorage();
  assert.equal(readGuestSession(session), false);
  assert.equal(hasPortalAccess(null, false), false);
  assert.equal(hasPortalAccess(null, false, '?tab=overview'), false);
  assert.equal(hasPortalAccess(null, false, '?autostart=1'), true);

  saveGuestSession(true, session);
  assert.equal(session.getItem(AUTH_GUEST_KEY), 'true');
  assert.equal(readGuestSession(session), true);
  assert.equal(hasPortalAccess(null, true), true);

  saveGuestSession(false, session);
  assert.equal(session.getItem(AUTH_GUEST_KEY), null);
  assert.equal(readGuestSession(session), false);

  const authSession = {
    email: 'juan@g.batstate-u.edu.ph',
    displayName: 'Juan Dela Cruz',
    provider: 'email' as const,
    signedInAt: '2026-11-20T00:00:00.000Z',
    keepSignedIn: true,
  };
  assert.equal(hasPortalAccess(authSession, false), true);
});

