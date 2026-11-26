import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Moon, ShieldCheck, Sun, X } from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { NtTrackBadge, BaTrackBadge, SmTrackBadge } from '../components/shared/PixelArt';
import {
  fallbackNameFromEmail,
  isValidEmail,
} from '../utils/authSession';
import {
  signInWithSupabaseGoogle,
  signInWithSupabaseEmail,
  signUpWithSupabaseEmail,
  sendSupabasePasswordReset,
  verifyAdminAndFetchAnalytics,
} from '../lib/supabase';
import { ADMIN_PASS_SESSION_KEY } from './AdminAnalyticsPage';
import { scrollViewportToTop } from '../utils/scrollTop';

type LoginView = 'signin' | 'forgot' | 'sent' | 'signup';

const BSU_DOMAIN = '@g.batstate-u.edu.ph';

function sanitizeSrCode(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.endsWith(BSU_DOMAIN)) {
    return trimmed.slice(0, -BSU_DOMAIN.length);
  }
  return trimmed.replace(/@.*$/, '');
}

function buildBsuEmail(srCodeInput: string): string {
  const cleanCode = sanitizeSrCode(srCodeInput);
  return cleanCode ? `${cleanCode}${BSU_DOMAIN}` : '';
}

function isValidSrCode(srCodeInput: string): boolean {
  const cleanCode = sanitizeSrCode(srCodeInput);
  return /^[a-z0-9._-]{3,32}$/i.test(cleanCode);
}

export function LoginPage() {
  const {
    state,
    updatePreferences,
    completeAuthLogin,
    enterGuestSession,
    signOutSession,
    authSession,
    isGuest,
  } = useStudent();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = (location.state as { from?: string } | null)?.from;
  const redirectTarget = from && from.startsWith('/') && from !== '/login' ? from : '/';

  const initialView: LoginView = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [view, setView] = useState<LoginView>(initialView);

  const isSigningUpRef = useRef(false);

  useEffect(() => {
    if (authSession && !isSigningUpRef.current) {
      navigate(redirectTarget, { replace: true });
    }
  }, [authSession, navigate, redirectTarget]);

  useEffect(() => {
    scrollViewportToTop();
  }, [view]);

  const theme = state.preferences.theme || 'dark';
  const isLight = theme === 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.dataset.reducedMotion = String(state.preferences.reducedMotion);
    return () => {
      delete root.dataset.theme;
      root.classList.remove('dark');
      delete root.dataset.reducedMotion;
    };
  }, [theme, state.preferences.reducedMotion]);

  // Sign in state
  const [liSrCode, setLiSrCode] = useState('');
  const [liPw, setLiPw] = useState('');
  const [showLiPw, setShowLiPw] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [liErr, setLiErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  // Forgot password state
  const [forgotSrCode, setForgotSrCode] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [resent, setResent] = useState(false);

  // Sign up state
  const [suSrCode, setSuSrCode] = useState('');
  const [suPw, setSuPw] = useState('');
  const [showSuPw, setShowSuPw] = useState(false);
  const [suEmailErr, setSuEmailErr] = useState('');
  const [suPwErr, setSuPwErr] = useState('');

  // Admin Access Modal state
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminErr, setAdminErr] = useState('');

  useEffect(() => {
    const domainErr = sessionStorage.getItem('ctrl_gsuite_error');
    if (domainErr) {
      setLiErr(domainErr);
      sessionStorage.removeItem('ctrl_gsuite_error');
    }
  }, []);

  const toggleTheme = () => {
    updatePreferences({ theme: isLight ? 'dark' : 'light' });
  };

  const goSignin = () => {
    setView('signin');
    setLiErr('');
    setForgotErr('');
    setSuEmailErr('');
    setSuPwErr('');
  };

  const goForgot = () => {
    setForgotSrCode(liSrCode);
    setForgotErr('');
    setResent(false);
    setView('forgot');
  };

  const goSignup = () => {
    setSuEmailErr('');
    setSuPwErr('');
    setView('signup');
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || googleBusy) return;

    const fullEmail = buildBsuEmail(liSrCode);
    if (!isValidSrCode(liSrCode) || !isValidEmail(fullEmail) || !liPw) {
      setLiErr('Enter your BatStateU SR-Code (e.g. 24-12345) and password.');
      return;
    }

    setLiErr('');
    setBusy(true);
    try {
      const { user } = await signInWithSupabaseEmail(fullEmail, liPw);
      if (user) {
        completeAuthLogin({
          email: user.email || fullEmail,
          displayName: user.user_metadata?.full_name || fallbackNameFromEmail(fullEmail),
          provider: 'email',
          keepSignedIn,
          applyProfile: false,
        });
        navigate(redirectTarget, { replace: true });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      setLiErr(
        msg.includes('Invalid login credentials')
          ? 'Invalid SR-Code or password. If you signed in with Google before, click "Continue with BatStateU GSuite" or set a password in Settings.'
          : msg || 'Invalid SR-Code or password.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (busy || googleBusy) return;
    setLiErr('');
    setGoogleBusy(true);
    try {
      await signInWithSupabaseGoogle(`${window.location.origin}/login`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      setLiErr(msg || 'Google sign-in is unavailable right now. Please sign in with your SR-Code and password.');
      setGoogleBusy(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullEmail = buildBsuEmail(forgotSrCode);
    if (!isValidSrCode(forgotSrCode) || !isValidEmail(fullEmail)) {
      setForgotErr('Enter a valid BatStateU SR-Code (e.g. 24-12345).');
      return;
    }
    setForgotErr('');
    try {
      await sendSupabasePasswordReset(fullEmail);
      setResent(false);
      setView('sent');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to send reset link.';
      setForgotErr(msg);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullEmail = buildBsuEmail(suSrCode);

    let emailErr = '';
    let pwErr = '';
    if (!isValidSrCode(suSrCode) || !isValidEmail(fullEmail)) {
      emailErr = 'Enter a valid BatStateU SR-Code (e.g. 24-12345).';
    }
    if (!suPw || suPw.length < 8) {
      pwErr = 'Password must be at least 8 characters.';
    }

    setSuEmailErr(emailErr);
    setSuPwErr(pwErr);
    if (emailErr || pwErr) return;
    if (busy) return;

    setBusy(true);
    isSigningUpRef.current = true;
    try {
      await signUpWithSupabaseEmail({
        email: fullEmail,
        password: suPw,
        displayName: '',
      });

      await signOutSession();

      setLiSrCode(sanitizeSrCode(suSrCode));
      setLiPw('');
      setLiErr('');
      setSuEmailErr('');
      setSuPwErr('');
      setView('signin');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Could not create account.';
      setSuEmailErr(msg);
    } finally {
      isSigningUpRef.current = false;
      setBusy(false);
    }
  };

  const handleContinueAsGuest = () => {
    enterGuestSession();
    navigate(redirectTarget, { replace: true });
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminBusy) return;
    if (!adminPasscode.trim()) {
      setAdminErr('Enter the administrator passcode.');
      return;
    }

    setAdminBusy(true);
    setAdminErr('');
    try {
      await verifyAdminAndFetchAnalytics(adminPasscode);
      sessionStorage.setItem(ADMIN_PASS_SESSION_KEY, adminPasscode.trim());
      setAdminOpen(false);
      setAdminPasscode('');
      navigate('/admin/analytics');
    } catch (err) {
      setAdminErr(err instanceof Error ? err.message : 'Invalid administrator passcode.');
    } finally {
      setAdminBusy(false);
    }
  };

  const renderGsuiteInput = (
    id: string,
    value: string,
    onChangeVal: (cleanSr: string) => void,
  ) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.28)',
        background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.55)',
        overflow: 'hidden',
      }}
    >
      <input
        id={id}
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="24-12345"
        autoComplete="username"
        value={value}
        onChange={(e) => onChangeVal(sanitizeSrCode(e.target.value))}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          background: 'transparent',
          outline: 'none',
          boxShadow: 'none',
          paddingRight: '6px',
        }}
      />
      <span
        aria-hidden="true"
        style={{
          padding: '0 12px 0 6px',
          fontSize: '0.84rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          color: isLight ? '#475569' : '#94a3b8',
          borderLeft: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        {BSU_DOMAIN}
      </span>
    </div>
  );

  return (
    <div
      className={`login-page${isLight ? ' light' : ''}`}
      data-reduced-motion={state.preferences.reducedMotion}
    >
      <button
        className="login-tgl"
        type="button"
        onClick={toggleTheme}
        title={isLight ? 'Switch to Dark mode' : 'Switch to Light mode'}
        aria-label={isLight ? 'Switch to Dark mode' : 'Switch to Light mode'}
      >
        {isLight ? (
          <Moon size={18} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Sun size={18} strokeWidth={2} aria-hidden="true" />
        )}
      </button>

      <div className="login-bgimg" aria-hidden="true" />
      <div className="login-bgshade" aria-hidden="true" />

      {/* STORY SIDE */}
      <div className="login-story">
        <div className="login-stars" aria-hidden="true" />
        <div className="login-stars b" aria-hidden="true" />

        <Link
          to={authSession || isGuest ? '/' : '/login'}
          onClick={() => {
            if (!authSession && !isGuest) goSignin();
          }}
          className="login-brandrow"
          aria-label="CTRL+PATH Home"
        >
          <img src="/assets/login/ctrl-path-logo.png" alt="CTRL+PATH logo" />
          <div>
            <div className="login-brandtitle">
              CTRL <span>+</span> PATH
            </div>
            <div className="login-brandsub">Choose Your Own Path</div>
          </div>
        </Link>

        <div className="login-hero">
          <Link
            to={authSession || isGuest ? '/' : '/login'}
            onClick={() => {
              if (!authSession && !isGuest) goSignin();
            }}
            className="login-mobbrand"
            aria-label="CTRL+PATH Home"
          >
            <img src="/assets/login/ctrl-path-logo.png" alt="CTRL+PATH logo" />
            <div className="login-mobbrand-title">
              CTRL <span>+</span> PATH
            </div>
          </Link>

          <div className="login-eyebrow">✨ BSIT ACADEMIC PATHWAYS</div>
          <h1>
            Different Paths,
            <br />
            <span>Brighter Futures</span>
          </h1>
          <div className="login-chips">
            <div className="login-chip login-chip--nt">
              <NtTrackBadge size={42} className="rounded-[11px] shrink-0" />
              <div className="login-chip-text">
                Networking
                <br />
                Technology
              </div>
            </div>
            <div className="login-chip login-chip--ba">
              <BaTrackBadge size={42} className="rounded-[11px] shrink-0" />
              <div className="login-chip-text">
                Business
                <br />
                Analytics
              </div>
            </div>
            <div className="login-chip login-chip--sm">
              <SmTrackBadge size={42} className="rounded-[11px] shrink-0" />
              <div className="login-chip-text">
                Service
                <br />
                Management
              </div>
            </div>
          </div>
        </div>

        <div className="login-luniwrap">
          <div className="login-luni">
            <img src="/assets/login/luni-wink.png" alt="Luni, the CTRL+PATH guide, winking" />
          </div>
          <div className="login-lunibub">
            <div className="login-lunibub-title">Luni&apos;s Celestial Guide ✨</div>
            <div className="login-lunibub-copy">
              Welcome back, Luminary! Your journey is waiting.
            </div>
          </div>
        </div>

        <div className="login-foot">
          <img src="/assets/login/bsu-seal.png" alt="Batangas State University seal" />
          <img src="/assets/login/iintess-logo.png" alt="IINTESS logo" />
          <div className="login-foot-text">
            <strong>Batangas State University</strong>
            CICS Alangilan · IINTESS
          </div>
        </div>
      </div>

      {/* FORM SIDE */}
      <div className="login-formside">
        <div className="login-formcol">
          <div className="login-card">
            <div className="login-cardav">
              <img src="/assets/login/luni-star.png" alt="Luni holding a star" />
            </div>

            {view === 'signin' && (
              <form noValidate onSubmit={handleSignInSubmit}>
                <div className="login-card-head">
                  <h2>Sign in</h2>
                  <p>Enter your BatStateU SR-Code to continue.</p>
                </div>

                <div className="login-stack">
                  <div className="login-field">
                    <label htmlFor="login-email">SR-Code (GSuite Account)</label>
                    {renderGsuiteInput('login-email', liSrCode, (val) => {
                      setLiSrCode(val);
                      if (liErr) setLiErr('');
                    })}
                  </div>

                  <div className="login-field">
                    <div className="login-field-row">
                      <label htmlFor="login-password">Password</label>
                      <button type="button" className="login-linkbtn" onClick={goForgot}>
                        Forgot password?
                      </button>
                    </div>
                    <div className="login-pw-wrap">
                      <input
                        id="login-password"
                        type={showLiPw ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        value={liPw}
                        onChange={(e) => {
                          setLiPw(e.target.value);
                          if (liErr) setLiErr('');
                        }}
                      />
                      <button
                        type="button"
                        className="login-eye-btn"
                        aria-label={showLiPw ? 'Hide password' : 'Show password'}
                        aria-pressed={showLiPw}
                        onClick={() => setShowLiPw((prev) => !prev)}
                      >
                        {showLiPw ? (
                          <EyeOff size={20} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <Eye size={20} strokeWidth={2} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="login-check">
                    <input
                      type="checkbox"
                      checked={keepSignedIn}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                    />
                    <span>Keep me signed in</span>
                  </label>

                  {liErr && (
                    <div role="alert" className="login-err login-err--tight">
                      {liErr}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="login-primary-btn"
                    disabled={busy || googleBusy}
                  >
                    <span>{busy ? 'Signing in…' : 'Continue Your Journey'}</span>
                    <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>

                <div className="login-divider">
                  <div />
                  <span>or</span>
                  <div />
                </div>

                <button
                  type="button"
                  className="login-google-btn"
                  onClick={handleGoogleSignIn}
                  disabled={busy || googleBusy}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6-4.5H2.4v2.8A11 11 0 0 0 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.4a11 11 0 0 0 0 9.8z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 0 0 2.4 7.1L6 9.9c.8-2.6 3.2-4.5 6-4.5z"
                    />
                  </svg>
                  <span>{googleBusy ? 'Connecting to Google…' : 'Continue with BatStateU GSuite'}</span>
                </button>

                <p className="login-switch">
                  New here, Explorer?{' '}
                  <button type="button" className="login-inline-btn touch-target-44" onClick={goSignup}>
                    Create an account
                  </button>
                </p>
              </form>
            )}

            {view === 'forgot' && (
              <form noValidate onSubmit={handleForgotSubmit}>
                <div className="login-card-head">
                  <h2>Reset your password</h2>
                  <p>Enter your BatStateU SR-Code and we&apos;ll send a reset link to your GSuite email.</p>
                </div>

                <div className="login-stack">
                  <div className="login-field">
                    <label htmlFor="forgot-email">SR-Code (GSuite Account)</label>
                    {renderGsuiteInput('forgot-email', forgotSrCode, (val) => {
                      setForgotSrCode(val);
                      if (forgotErr) setForgotErr('');
                    })}
                    {forgotErr && (
                      <div role="alert" className="login-err">
                        {forgotErr}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="login-primary-btn">
                    <span>Send reset link</span>
                    <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                  </button>

                  <button type="button" className="login-ghost-btn" onClick={goSignin}>
                    <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
                    <span>Back to sign in</span>
                  </button>
                </div>
              </form>
            )}

            {view === 'sent' && (
              <div className="login-sent">
                <div className="login-sent-icon">
                  <Mail size={28} strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="login-card-head login-card-head--compact">
                  <h2>Check your GSuite inbox</h2>
                  <p>We sent a reset link to {buildBsuEmail(forgotSrCode)}. It can take a minute to arrive.</p>
                </div>

                <div className="login-sent-actions">
                  <button type="button" className="login-primary-btn" onClick={goSignin}>
                    <span>Back to sign in</span>
                    <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="login-ghost-btn"
                    onClick={() => setResent(true)}
                  >
                    Didn&apos;t get it? Send again
                  </button>
                  {resent && (
                    <div role="status" className="login-status-note">
                      Sent again. Check your spam folder too.
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === 'signup' && (
              <form noValidate onSubmit={handleSignUpSubmit}>
                <div className="login-card-head login-card-head--signup">
                  <h2>Create your account</h2>
                  <p>Enter your BatStateU SR-Code to register your GSuite account.</p>
                </div>

                <div className="login-stack login-stack--signup">
                  <div className="login-field">
                    <label htmlFor="signup-email">SR-Code (GSuite Account)</label>
                    {renderGsuiteInput('signup-email', suSrCode, (val) => {
                      setSuSrCode(val);
                      if (suEmailErr) setSuEmailErr('');
                    })}
                    {suEmailErr && (
                      <div role="alert" className="login-err">
                        {suEmailErr}
                      </div>
                    )}
                  </div>

                  <div className="login-field">
                    <label htmlFor="signup-password">Password</label>
                    <div className="login-pw-wrap">
                      <input
                        id="signup-password"
                        type={showSuPw ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        value={suPw}
                        onChange={(e) => {
                          setSuPw(e.target.value);
                          if (suPwErr) setSuPwErr('');
                        }}
                      />
                      <button
                        type="button"
                        className="login-eye-btn"
                        aria-label={showSuPw ? 'Hide password' : 'Show password'}
                        aria-pressed={showSuPw}
                        onClick={() => setShowSuPw((prev) => !prev)}
                      >
                        {showSuPw ? (
                          <EyeOff size={20} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <Eye size={20} strokeWidth={2} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {suPwErr && (
                      <div role="alert" className="login-err">
                        {suPwErr}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="login-primary-btn" disabled={busy || googleBusy}>
                    <span>{busy ? 'Creating account…' : 'Create account'}</span>
                    <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>

                <p className="login-switch login-switch--signup">
                  Already have an account?{' '}
                  <button type="button" className="login-inline-btn touch-target-44" onClick={goSignin}>
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>

          <p className="login-note">
            Your progress, gemstones and comparisons are saved to your account.{' '}
            <button type="button" className="login-guest-link touch-target-44" onClick={handleContinueAsGuest}>
              Continue as guest
            </button>
          </p>

          {/* Admin Access Button (Track Analytics Only) */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={() => {
                setAdminPasscode('');
                setAdminErr('');
                setAdminOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(148, 163, 184, 0.28)',
                background: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.55)',
                color: isLight ? '#334155' : '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Admin Access · Track Analytics</span>
            </button>
          </div>

          <div className="login-foot2">
            <img src="/assets/login/bsu-seal.png" alt="Batangas State University seal" />
            <img src="/assets/login/iintess-logo.png" alt="IINTESS logo" />
            <div className="login-foot-text">
              <strong>Batangas State University</strong>
              CICS Alangilan · IINTESS
            </div>
          </div>
        </div>
      </div>

      {/* Admin Passcode Modal */}
      {adminOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !adminBusy) setAdminOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(2, 6, 23, 0.72)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              borderRadius: '24px',
              padding: '1.5rem',
              background: isLight ? '#ffffff' : '#0f172a',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: isLight ? '#0f172a' : '#f8fafc',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} className="text-indigo-400" />
                <h3 id="admin-modal-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  Admin Track Analytics
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close admin modal"
                onClick={() => setAdminOpen(false)}
                disabled={adminBusy}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '1rem', lineHeight: 1.5 }}>
              Restricted to CICS faculty and system administrators. Enter the admin passcode to view
              aggregated BSIT track analytics.
            </p>

            <form onSubmit={handleAdminSubmit} noValidate>
              <div className="login-field" style={{ marginBottom: '0.85rem' }}>
                <label htmlFor="admin-passcode-input">Administrator Passcode</label>
                <div className="login-pw-wrap">
                  <input
                    id="admin-passcode-input"
                    type={showAdminPw ? 'text' : 'password'}
                    placeholder="Enter admin passcode"
                    autoFocus
                    value={adminPasscode}
                    onChange={(e) => {
                      setAdminPasscode(e.target.value);
                      if (adminErr) setAdminErr('');
                    }}
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    aria-label={showAdminPw ? 'Hide passcode' : 'Show passcode'}
                    onClick={() => setShowAdminPw((prev) => !prev)}
                  >
                    {showAdminPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {adminErr && (
                <div role="alert" className="login-err" style={{ marginBottom: '0.85rem' }}>
                  {adminErr}
                </div>
              )}

              <button
                type="submit"
                className="login-primary-btn"
                disabled={adminBusy}
                style={{ width: '100%' }}
              >
                <span>{adminBusy ? 'Verifying passcode…' : 'Open Track Analytics'}</span>
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}