import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  Gem,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { GEMSTONE_ASSETS } from '../../assets/manifest';
import { TRACKS_DATA } from '../../data/tracks';
import type { TrackCode } from '../../types';
import { profileValues, validateProfile, PROFILE_LIMITS, studentProgress, type ProfileValues } from '../../utils/studentControls';
import { AVATAR_OPTIONS } from '../../utils/avatarOptions';
import { ControlCard, StudentAvatar, DiscardDialog } from './ControlShared';
import { AchievementCollectionBoard } from './AchievementCollectionPanel';
import { ProgressBar } from '../shared/ProgressBar';
import {
  NtTrackBadge,
  BaTrackBadge,
  SmTrackBadge,
} from '../shared/PixelArt';
import { getEffectiveStreak, loadStreakState } from '../../utils/streakManager';
import {
  ProfileStreakHeatmapBox,
  ProfileStreakSummary,
} from '../streak/ProfileStreakWidget';

export function StudentProfile({ onDirty }: { onDirty: (dirty: boolean) => void }) {
  const { state, updateProfile, authSession, signOutSession } = useStudent();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => profileValues(state));
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileValues, string>>>({});
  const [message, setMessage] = useState('');
  const [discard, setDiscard] = useState(false);
  const [showStreakBox, setShowStreakBox] = useState(false);
  const [streakSnapshot, setStreakSnapshot] = useState(() => ({
    ...getEffectiveStreak(),
    activeDates: loadStreakState().activeDates,
  }));
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(profileValues(state));

  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);

  useEffect(() => () => onDirty(false), [onDirty]);

  useEffect(() => {
    const syncStreak = () => {
      setStreakSnapshot({
        ...getEffectiveStreak(),
        activeDates: loadStreakState().activeDates,
      });
    };
    window.addEventListener('ctrl_streak_updated', syncStreak);
    window.addEventListener('ctrl_streak_celebrate', syncStreak);
    window.addEventListener('storage', syncStreak);
    return () => {
      window.removeEventListener('ctrl_streak_updated', syncStreak);
      window.removeEventListener('ctrl_streak_celebrate', syncStreak);
      window.removeEventListener('storage', syncStreak);
    };
  }, []);

  const cancel = () => {
    setEditing(false);
    setDiscard(false);
    setMessage('Edits canceled. Your saved profile is unchanged.');
  };

  const labels = {
    name: 'Display name',
    program: 'Program',
    yearLevel: 'Academic year level',
    section: 'Section',
    biography: 'Short biography',
  };

  const { collection } = studentProgress(state);

  const trackCodes: TrackCode[] = ['NT', 'BA', 'SM'];
  const formattedSection = state.section ? state.section.trim().replace(/^section\s+/i, '') : '';

  return (
    <ControlCard>
      {!editing ? (
        <div className="control-profile-sections">
          {/* Identity Banner */}
          <div className="control-profile-banner">
            <div className="control-profile-banner-top">
              <div className="control-profile">
                <StudentAvatar name={state.name} style={state.avatarStyle} />
                <div className="control-profile-meta">
                  <h3 className="control-profile-name">{state.name || 'Set up your profile'}</h3>
                  {(state.program || state.yearLevel || formattedSection) && (
                    <div className="control-profile-chips">
                      {state.program && (
                        <span className="control-profile-chip">
                          <GraduationCap size={14} aria-hidden="true" />
                          <span>{state.program}</span>
                        </span>
                      )}
                      {state.yearLevel && (
                        <span className="control-profile-chip">
                          <Calendar size={14} aria-hidden="true" />
                          <span>{state.yearLevel}</span>
                        </span>
                      )}
                      {formattedSection && (
                        <span className="control-profile-chip">
                          <Users size={14} aria-hidden="true" />
                          <span>{formattedSection}</span>
                        </span>
                      )}
                    </div>
                  )}
                  <div className="control-profile-auth-row">
                    <span className="control-profile-chip is-auth">
                      {authSession ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
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
                      ) : (
                        <ShieldCheck size={14} aria-hidden="true" />
                      )}
                      <span>{authSession ? `Signed in: ${authSession.email}` : 'Local profile'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <ProfileStreakSummary
                streakCount={streakSnapshot.streakCount}
                isExpanded={showStreakBox}
                onToggle={() => setShowStreakBox((prev) => !prev)}
              />
            </div>

            {state.biography && <p className="community-prose control-profile-bio">{state.biography}</p>}

            <div className="control-actions">
              <button
                className="vault-primary-button"
                onClick={() => {
                  setDraft(profileValues(state));
                  setErrors({});
                  setMessage('');
                  setEditing(true);
                }}
              >
                Edit profile
              </button>
              {authSession ? (
                <>
                  <Link to="/login" className="community-secondary-button">
                    Switch account
                  </Link>
                  <button
                    type="button"
                    className="community-secondary-button"
                    onClick={async () => {
                      await signOutSession();
                      navigate('/login');
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link to="/login" className="community-secondary-button">
                  Sign in
                </Link>
              )}
            </div>

            {showStreakBox && (
              <ProfileStreakHeatmapBox
                activeDates={streakSnapshot.activeDates}
                streakCount={streakSnapshot.streakCount}
                isActiveToday={streakSnapshot.isActiveToday}
              />
            )}
          </div>

          {/* Subsection 1: Achievement Collection */}
          <div className="control-profile-subsection">
            <div className="control-profile-subhead">
              <div className="control-profile-subhead-title">
                <span className="control-profile-subicon is-gem" aria-hidden="true">
                  <Gem size={17} />
                </span>
                <h3>Achievement Collection</h3>
              </div>
              <Link to="/achievements" className="community-text-link">
                <span>Open Achievement Vault ({collection.unlocked}/{GEMSTONE_ASSETS.length})</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <AchievementCollectionBoard />
          </div>

          {/* Subsection 2: Track Exploration Progress (Styled like Track Explorer UI) */}
          <div className="control-profile-subsection">
            <div className="control-profile-subhead">
              <div className="control-profile-subhead-title">
                <span className="control-profile-subicon is-track" aria-hidden="true">
                  <Compass size={17} />
                </span>
                <h3>Track Exploration Progress</h3>
              </div>
              <Link to="/tracks" className="community-text-link">
                <span>Open Track Explorer</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className="control-profile-tracks-grid">
              {trackCodes.map((code) => {
                const track = TRACKS_DATA[code];
                const isExplored = state.exploredTracks[code];
                const progress = state.trackProgress[code] || 0;
                const recordedCount = state.moduleCompletions.filter((m) => m.track === code).length;
                const totalModules = track.modules.length;
                const badge =
                  code === 'NT' ? (
                    <NtTrackBadge size={36} className="shrink-0 rounded-xl shadow-xs" />
                  ) : code === 'BA' ? (
                    <BaTrackBadge size={36} className="shrink-0 rounded-xl shadow-xs" />
                  ) : (
                    <SmTrackBadge size={36} className="shrink-0 rounded-xl shadow-xs" />
                  );

                return (
                  <article
                    key={code}
                    className={`control-profile-track-card is-${code.toLowerCase()}`}
                  >
                    <div className="control-profile-track-top">
                      <div className="control-profile-track-id">
                        {badge}
                        <div className="min-w-0">
                          <h4>{track.name}</h4>
                          <span>BSIT Specialization</span>
                        </div>
                      </div>
                      {isExplored ? (
                        <span className="control-profile-track-status is-explored">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          <span>Explored</span>
                        </span>
                      ) : (
                        <span className="control-profile-track-status">Unexplored</span>
                      )}
                    </div>

                    <div className="control-profile-track-meter">
                      <div className="control-profile-track-stats">
                        <span>
                          <BookOpen size={13} aria-hidden="true" />
                          <span>
                            {recordedCount}/{totalModules} Modules
                          </span>
                        </span>
                        <strong>{progress}% Progress</strong>
                      </div>
                      <ProgressBar
                        value={progress}
                        variant={code.toLowerCase() as 'nt' | 'ba' | 'sm'}
                        size="sm"
                      />
                    </div>

                    <Link
                      to={`/tracks?track=${code}`}
                      className={`control-profile-track-btn is-${code.toLowerCase()}`}
                    >
                      <span>Explore Track</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const invalid = validateProfile(draft);
            setErrors(invalid);
            if (Object.keys(invalid).length) {
              setMessage('Please correct the highlighted fields.');
              return;
            }
            const result = updateProfile(draft);
            setMessage(result.message);
            if (result.ok) setEditing(false);
          }}
        >
          <div className="control-form-grid">
            {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => (
              <label
                key={key}
                className={key === 'biography' ? 'control-wide' : ''}
                htmlFor={`profile-${key}`}
              >
                <span id={`profile-label-${key}`} className="control-field-label">
                  {labels[key]} {key !== 'name' && <small>(optional)</small>}
                </span>
                {key === 'biography' ? (
                  <textarea
                    id={`profile-${key}`}
                    aria-labelledby={`profile-label-${key}`}
                    rows={4}
                    maxLength={PROFILE_LIMITS[key]}
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `error-${key}` : undefined}
                  />
                ) : (
                  <input
                    id={`profile-${key}`}
                    aria-labelledby={`profile-label-${key}`}
                    value={draft[key]}
                    maxLength={PROFILE_LIMITS[key]}
                    required={key === 'name'}
                    autoComplete={key === 'name' ? 'nickname' : 'off'}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `error-${key}` : undefined}
                  />
                )}
                {errors[key] && (
                  <span id={`error-${key}`} className="control-field-error">
                    {errors[key]}
                  </span>
                )}
              </label>
            ))}
          </div>
          <fieldset className="control-avatar-options">
            <legend>Profile avatar</legend>
            <p>Choose a character avatar for your profile and top bar.</p>
            <div className="control-avatar-grid">
              {AVATAR_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`control-avatar-option${draft.avatarStyle === option.id ? ' is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="avatarStyle"
                    value={option.id}
                    checked={draft.avatarStyle === option.id}
                    onChange={() => setDraft({ ...draft, avatarStyle: option.id })}
                  />
                  <StudentAvatar name={draft.name} style={option.id} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="control-actions">
            <button type="submit" className="vault-primary-button">
              Save profile
            </button>
            <button
              type="button"
              className="community-secondary-button"
              onClick={() => (dirty ? setDiscard(true) : cancel())}
            >
              Cancel editing
            </button>
            {dirty && <span>Unsaved changes</span>}
          </div>
        </form>
      )}
      <p className="control-feedback" role="status">
        {message}
      </p>
      {discard && <DiscardDialog onKeep={() => setDiscard(false)} onDiscard={cancel} />}
    </ControlCard>
  );
}
