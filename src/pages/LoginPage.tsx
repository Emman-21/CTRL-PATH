import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, Moon, Sun } from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { NtTrackBadge, BaTrackBadge, SmTrackBadge } from '../components/shared/PixelArt';
import {
  authenticateLocalAccount,
  fallbackNameFromEmail,
  firstNameFrom,
  isValidEmail,
  registerLocalAccount,
  validateFullName,
  validateSignUpFields,
} from '../utils/authSession';
import { signInWithGoogleAccount } from '../services/firebase';
import { scrollViewportToTop } from '../utils/scrollTop';

type LoginView = 'signin' | 'forgot' | 'sent' | 'signup' | 'name' | 'profile';

export function LoginPage() {
  const { state, updatePreferences, completeAuthLogin } = useStudent();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialView: LoginView = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [view, setView] = useState<LoginView>(initialView);

  useEffect(() => {
    scrollViewportToTop();
  }, [view]);

  // Sync <html> theme attributes when rendering outside AppShell
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
  const [liEmail, setLiEmail] = useState('');
  const [liPw, setLiPw] = useState('');
  const [showLiPw, setShowLiPw] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [liErr, setLiErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [resent, setResent] = useState(false);

  // Sign up & onboarding state
  const [suEmail, setSuEmail] = useState('');
  const [suPw, setSuPw] = useState('');
  const [showSuPw, setShowSuPw] = useState(false);
  const [suEmailErr, setSuEmailErr] = useState('');
  const [suPwErr, setSuPwErr] = useState('');
  const [suName, setSuName] = useState('');
  const [fullErr, setFullErr] = useState('');
  const [program, setProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [section, setSection] = useState('');

  const isOnboarding = view === 'name' || view === 'profile';
  const greetingFirstName = firstNameFrom(suName);

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
    setForgotEmail(liEmail);
    setForgotErr('');
    setResent(false);
    setView('forgot');
  };

  const goSignup = () => {
    setSuEmailErr('');
    setSuPwErr('');
    setView('signup');
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || googleBusy) return;
    const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
    const result = authenticateLocalAccount(storage, liEmail, liPw);
    if (!result.ok) {
      setLiErr(result.error);
      return;
    }
    setLiErr('');
    setBusy(true);
    window.setTimeout(() => {
      completeAuthLogin({
        email: liEmail,
        displayName: result.account?.displayName || fallbackNameFromEmail(liEmail),
        program: result.account?.program,
        yearLevel: result.account?.yearLevel,
        section: result.account?.section,
        provider: 'email',
        keepSignedIn,
        applyProfile: Boolean(result.account),
      });
      setBusy(false);
      navigate('/', { replace: true });
    }, 350);
  };

  const handleGoogleSignIn = async () => {
    if (busy || googleBusy) return;
    setLiErr('');
    setGoogleBusy(true);
    try {
      const user = await signInWithGoogleAccount();
      completeAuthLogin({
        email: user.email || 'student@g.batstate-u.edu.ph',
        displayName: user.displayName || fallbackNameFromEmail(user.email || 'Luminary'),
        provider: 'google',
        keepSignedIn,
      });
      navigate('/', { replace: true });
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setLiErr('Google sign-in was canceled.');
      } else if (code === 'auth/popup-blocked') {
        setLiErr('Popup was blocked by your browser. Allow popups or sign in with email and password.');
      } else {
        setLiErr('Google sign-in is unavailable right now. Please sign in with your email and password.');
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(forgotEmail)) {
      setForgotErr('Enter a valid email address.');
      return;
    }
    setForgotErr('');
    setResent(false);
    setView('sent');
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { emailErr, pwErr } = validateSignUpFields(suEmail, suPw);
    setSuEmailErr(emailErr);
    setSuPwErr(pwErr);
    if (emailErr || pwErr) return;
    setFullErr('');
    setView('name');
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateFullName(suName);
    setFullErr(err);
    if (err) return;
    setView('profile');
  };

  const finishOnboarding = (skipStudyDetails: boolean) => {
    const cleanProgram = skipStudyDetails ? '' : program;
    const cleanYear = skipStudyDetails ? '' : yearLevel;
    const cleanSection = skipStudyDetails ? '' : section;
    const storage = typeof window !== 'undefined' ? window.localStorage : undefined;

    registerLocalAccount(storage, {
      email: suEmail,
      password: suPw,
      displayName: suName.trim(),
      program: cleanProgram,
      yearLevel: cleanYear,
      section: cleanSection,
    });

    completeAuthLogin({
      email: suEmail,
      displayName: suName.trim(),
      program: cleanProgram,
      yearLevel: cleanYear,
      section: cleanSection,
      provider: 'email',
      keepSignedIn: true,
      applyProfile: true,
    });
    navigate('/', { replace: true });
  };

  return (
    <div
      className={`login-page${isLight ? ' light' : ''}${isOnboarding ? ' is-onb' : ''}`}
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

        <Link to="/" className="login-brandrow" aria-label="CTRL+PATH Home">
          <img src="/assets/login/ctrl-path-logo.png" alt="CTRL+PATH logo" />
          <div>
            <div className="login-brandtitle">
              CTRL <span>+</span> PATH
            </div>
            <div className="login-brandsub">Explore · Compare · Find Your Path</div>
          </div>
        </Link>

        <div className="login-hero">
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
          <Link to="/" className="login-mobbrand" aria-label="CTRL+PATH Home">
            <img src="/assets/login/ctrl-path-logo.png" alt="CTRL+PATH logo" />
            <div className="login-mobbrand-title">
              CTRL <span>+</span> PATH
            </div>
          </Link>

          <div className="login-card">
            <div className="login-cardav">
              <img src="/assets/login/luni-star.png" alt="Luni holding a star" />
            </div>

            {view === 'signin' && (
              <form noValidate onSubmit={handleSignInSubmit}>
                <div className="login-card-head">
                  <h2>Sign in</h2>
                  <p>to continue your journey.</p>
                </div>

                <div className="login-stack">
                  <div className="login-field">
                    <label htmlFor="login-email">Email address</label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="you@g.batstate-u.edu.ph"
                      autoComplete="email"
                      value={liEmail}
                      onChange={(e) => {
                        setLiEmail(e.target.value);
                        if (liErr) setLiErr('');
                      }}
                    />
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
                  <span>{googleBusy ? 'Connecting to Google…' : 'Continue with Google'}</span>
                </button>

                <p className="login-switch">
                  New here, Explorer?{' '}
                  <button type="button" className="login-inline-btn" onClick={goSignup}>
                    Create an account
                  </button>
                </p>
              </form>
            )}

            {view === 'forgot' && (
              <form noValidate onSubmit={handleForgotSubmit}>
                <div className="login-card-head">
                  <h2>Reset your password</h2>
                  <p>Enter your school email and we&apos;ll send you a reset link.</p>
                </div>

                <div className="login-stack">
                  <div className="login-field">
                    <label htmlFor="forgot-email">Email address</label>
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="you@g.batstate-u.edu.ph"
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotErr) setForgotErr('');
                      }}
                    />
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
                  <h2>Check your inbox</h2>
                  <p>We sent a reset link to your email. It can take a minute to arrive.</p>
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
                  <p>Save your progress and collect gemstones.</p>
                </div>

                <div className="login-stack login-stack--signup">
                  <div className="login-field">
                    <label htmlFor="signup-email">School email</label>
                    <input
                      id="signup-email"
                      type="email"
                      placeholder="you@g.batstate-u.edu.ph"
                      autoComplete="email"
                      value={suEmail}
                      onChange={(e) => {
                        setSuEmail(e.target.value);
                        if (suEmailErr) setSuEmailErr('');
                      }}
                    />
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

                  <button type="submit" className="login-primary-btn">
                    <span>Create account</span>
                    <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>

                <p className="login-switch login-switch--signup">
                  Already have an account?{' '}
                  <button type="button" className="login-inline-btn" onClick={goSignin}>
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {view === 'name' && (
              <form noValidate onSubmit={handleNameSubmit}>
                <div className="login-onb-segs">
                  <span className="seg on" />
                  <span className="seg" />
                </div>
                <div className="login-onb-step">Step 1 of 2</div>

                <div className="login-onbluni">
                  <div className="login-luni">
                    <img
                      src="/assets/login/luni-wink.png"
                      alt="Luni, the CTRL+PATH guide, winking"
                    />
                  </div>
                  <div className="login-onb-bubble">
                    Hi, I&apos;m Luni! Tell me your name so I know who I&apos;m guiding.
                  </div>
                </div>

                <h2 className="login-onb-title">What&apos;s your full name?</h2>

                <div className="login-field login-onb-field">
                  <label htmlFor="onboarding-fullname">Full name</label>
                  <input
                    id="onboarding-fullname"
                    type="text"
                    placeholder="Juan Dela Cruz"
                    autoComplete="name"
                    required
                    value={suName}
                    onChange={(e) => {
                      setSuName(e.target.value);
                      if (fullErr) setFullErr('');
                    }}
                  />
                  {fullErr && (
                    <div role="alert" className="login-err">
                      {fullErr}
                    </div>
                  )}
                </div>

                <button type="submit" className="login-primary-btn">
                  <span>Continue</span>
                  <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </form>
            )}

            {view === 'profile' && (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  finishOnboarding(false);
                }}
              >
                <div className="login-onb-segs">
                  <span className="seg on" />
                  <span className="seg on" />
                </div>
                <div className="login-onb-step">Step 2 of 2</div>

                <div className="login-onbluni">
                  <div className="login-luni">
                    <img
                      src="/assets/login/luni-wink.png"
                      alt="Luni, the CTRL+PATH guide, winking"
                    />
                  </div>
                  <div className="login-onb-bubble">
                    Nice to meet you, {greetingFirstName}! Almost there. You can skip this for now.
                  </div>
                </div>

                <h2 className="login-onb-title">Tell us about your studies</h2>

                <div className="login-onb-study">
                  <div className="login-field">
                    <label htmlFor="onboarding-prog">Program</label>
                    <select
                      id="onboarding-prog"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                    >
                      <option value="">Select your program</option>
                      <option value="BS Information Technology">BS Information Technology</option>
                      <option value="BS Computer Science">BS Computer Science</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="login-onb-row">
                    <div className="login-field">
                      <label htmlFor="onboarding-ay">Academic year</label>
                      <select
                        id="onboarding-ay"
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="1st year">1st year</option>
                        <option value="2nd year">2nd year</option>
                        <option value="3rd year">3rd year</option>
                        <option value="4th year">4th year</option>
                      </select>
                    </div>
                    <div className="login-field">
                      <label htmlFor="onboarding-sec">Section</label>
                      <input
                        id="onboarding-sec"
                        type="text"
                        placeholder="e.g. 3101"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="login-onb-actions">
                  <button
                    type="button"
                    className="login-skip-btn"
                    onClick={() => finishOnboarding(true)}
                  >
                    Skip
                  </button>
                  <button type="submit" className="login-primary-btn login-primary-btn--compact">
                    <span>Continue</span>
                    <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="login-note">
            Your progress, gemstones and comparisons are saved to your account.{' '}
            <Link to="/" className="login-guest-link">
              Continue as guest
            </Link>
          </p>

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
    </div>
  );
}
