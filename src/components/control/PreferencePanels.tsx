import { useState } from 'react';
import { Download, Eye, EyeOff, KeyRound, MessageSquarePlus, Send, Trash2 } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import type { StudentPreferences } from '../../types';
import { exportStudentData } from '../../utils/studentControls';
import { submitStudentFeedback, updateSupabasePassword } from '../../lib/supabase';
import { AchievementDialog } from '../achievements/AchievementDialog';
import { ControlCard } from './ControlShared';

type FeedbackCategory = 'suggestion' | 'bug' | 'content' | 'other';

export function PreferencePanels() {
  const { state, updatePreferences, resetAllData, authSession } = useStudent();
  const [prefMessage, setPrefMessage] = useState('');
  const [privacyMessage, setPrivacyMessage] = useState('');
  const [confirm, setConfirm] = useState(false);

  // Account password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  // Feedback & bug report state
  const [fbCategory, setFbCategory] = useState<FeedbackCategory>('suggestion');
  const [fbText, setFbText] = useState('');
  const [fbBusy, setFbBusy] = useState(false);
  const [fbMessage, setFbMessage] = useState('');
  const [fbError, setFbError] = useState('');

  const isSignedIn = Boolean(authSession);

  const change = (prefs: Partial<StudentPreferences>) => {
    const result = updatePreferences(prefs);
    setPrefMessage(result.message);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwBusy) return;
    setPwMessage('');
    setPwError('');

    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwBusy(true);
    try {
      await updateSupabasePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setPwMessage(
        'Your CTRL+PATH sign-in password has been updated. This does not change your Google password.',
      );
    } catch (error) {
      setPwError(
        error instanceof Error
          ? error.message
          : 'Could not update password. Please sign in again and try once more.',
      );
    } finally {
      setPwBusy(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fbBusy) return;
    setFbMessage('');
    setFbError('');

    if (fbText.trim().length < 5) {
      setFbError('Please enter at least 5 characters so we can review your feedback.');
      return;
    }

    setFbBusy(true);
    try {
      await submitStudentFeedback({
        category: fbCategory,
        message: fbText,
        pageRoute: window.location.pathname,
      });
      setFbText('');
      setFbCategory('suggestion');
      setFbMessage('Thank you! Your feedback has been sent to the CTRL+PATH team.');
    } catch (error) {
      setFbError(
        error instanceof Error
          ? error.message
          : 'Could not send feedback right now. Please try again later.',
      );
    } finally {
      setFbBusy(false);
    }
  };

  const exportData = () => {
    try {
      const data = exportStudentData(state, localStorage);
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `ctrl-path-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setPrivacyMessage('Your JSON export has been downloaded.');
    } catch (error) {
      setPrivacyMessage(
        error instanceof Error
          ? error.message
          : 'The export could not be prepared. Your data has not changed.',
      );
    }
  };

  return (
    <>
      <ControlCard
        title="Appearance & Assistant"
        description="Customize your theme and Luni companion visibility."
      >
        <label className="control-setting">
          <span>
            <strong>Theme</strong>
            <small>Switch between Light Mode and Celestial Dark Mode.</small>
          </span>
          <select
            aria-label="Theme"
            value={state.preferences.theme || 'dark'}
            onChange={(e) => change({ theme: e.target.value as 'light' | 'dark' })}
          >
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme (Moonlit Sky)</option>
          </select>
        </label>

        <label className="control-setting">
          <span>
            <strong>Show Luni assistant</strong>
            <small>Show or hide the floating Luni companion across the app.</small>
          </span>
          <input
            type="checkbox"
            checked={Boolean(state.preferences.luniEnabled)}
            onChange={(e) => change({ luniEnabled: e.target.checked })}
          />
        </label>
        {prefMessage && (
          <p role="status" className="control-feedback">
            {prefMessage}
          </p>
        )}
      </ControlCard>

      {isSignedIn && (
        <ControlCard
          title="CTRL+PATH Account Password"
          description="Set or reset the password used for email sign-in on CTRL+PATH. This only updates your app login and will not affect your Google account password."
        >
          <form onSubmit={handlePasswordSubmit} noValidate>
            <label className="control-setting">
              <span>
                <strong>New password</strong>
                <small>At least 8 characters.</small>
              </span>
              <div className="login-pw-wrap" style={{ minWidth: '240px' }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (pwError) setPwError('');
                    if (pwMessage) setPwMessage('');
                  }}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  aria-label={showNewPw ? 'Hide new password' : 'Show new password'}
                  onClick={() => setShowNewPw((prev) => !prev)}
                >
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="control-setting">
              <span>
                <strong>Confirm new password</strong>
                <small>Re-enter your new CTRL+PATH password.</small>
              </span>
              <div className="login-pw-wrap" style={{ minWidth: '240px' }}>
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (pwError) setPwError('');
                    if (pwMessage) setPwMessage('');
                  }}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  aria-label={showConfirmPw ? 'Hide confirmed password' : 'Show confirmed password'}
                  onClick={() => setShowConfirmPw((prev) => !prev)}
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="control-actions" style={{ marginTop: '0.75rem' }}>
              <button
                type="submit"
                className="vault-primary-button"
                disabled={pwBusy}
              >
                <KeyRound size={16} aria-hidden="true" />
                <span>{pwBusy ? 'Updating password…' : 'Update password'}</span>
              </button>
            </div>

            {pwError && (
              <p role="alert" className="control-feedback" style={{ color: 'var(--danger, #f87171)' }}>
                {pwError}
              </p>
            )}
            {pwMessage && (
              <p role="status" className="control-feedback">
                {pwMessage}
              </p>
            )}
          </form>
        </ControlCard>
      )}

      <ControlCard
        title="Send Feedback & Bug Reports"
        description="Spot a bug, have a track content suggestion, or want to share ideas for CICS students? Send it directly to the developers."
      >
        <form onSubmit={handleFeedbackSubmit} noValidate>
          <label className="control-setting">
            <span>
              <strong>Category</strong>
              <small>Choose what your feedback is about.</small>
            </span>
            <select
              aria-label="Feedback category"
              value={fbCategory}
              onChange={(e) => {
                setFbCategory(e.target.value as FeedbackCategory);
                if (fbError) setFbError('');
                if (fbMessage) setFbMessage('');
              }}
            >
              <option value="suggestion">Feature Suggestion</option>
              <option value="bug">Bug / Issue Report</option>
              <option value="content">Track / Quiz Content</option>
              <option value="other">Other</option>
            </select>
          </label>

          <div style={{ marginTop: '0.75rem' }}>
            <label
              htmlFor="ctrl-feedback-message"
              style={{ display: 'block', marginBottom: '0.4rem' }}
            >
              <strong>Message</strong>{' '}
              <small style={{ opacity: 0.75 }}>({fbText.trim().length}/2000)</small>
            </label>
            <textarea
              id="ctrl-feedback-message"
              rows={4}
              maxLength={2000}
              placeholder="Describe the bug you encountered or share your suggestion to improve CTRL+PATH…"
              value={fbText}
              onChange={(e) => {
                setFbText(e.target.value);
                if (fbError) setFbError('');
                if (fbMessage) setFbMessage('');
              }}
              style={{
                width: '100%',
                borderRadius: '12px',
                padding: '0.75rem 0.9rem',
                border: '1px solid rgba(148, 163, 184, 0.28)',
                resize: 'vertical',
              }}
            />
          </div>

          <div className="control-actions" style={{ marginTop: '0.75rem' }}>
            <button
              type="submit"
              className="vault-primary-button"
              disabled={fbBusy}
            >
              {fbBusy ? (
                <MessageSquarePlus size={16} aria-hidden="true" />
              ) : (
                <Send size={16} aria-hidden="true" />
              )}
              <span>{fbBusy ? 'Sending feedback…' : 'Submit feedback'}</span>
            </button>
          </div>

          {fbError && (
            <p role="alert" className="control-feedback" style={{ color: 'var(--danger, #f87171)' }}>
              {fbError}
            </p>
          )}
          {fbMessage && (
            <p role="status" className="control-feedback">
              {fbMessage}
            </p>
          )}
        </form>
      </ControlCard>

      <ControlCard
        title={isSignedIn ? 'Privacy & Account Data' : 'Privacy & Local Data'}
        description={
          isSignedIn
            ? 'Your progress is synced to your CTRL+PATH cloud account and cached locally. Export a backup or reset your saved data anytime.'
            : 'Your progress is stored locally in this browser. Export a backup or delete your local data anytime.'
        }
      >
        <div className="control-actions settings-privacy-actions">
          <button
            type="button"
            className="vault-primary-button settings-export-btn"
            onClick={exportData}
          >
            <Download size={16} aria-hidden="true" />
            <span>Export data</span>
          </button>
          <button
            type="button"
            className="control-danger-button"
            onClick={() => {
              setConfirm(true);
              setPrivacyMessage('');
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
            <span>{isSignedIn ? 'Reset account data' : 'Delete local data'}</span>
          </button>
        </div>

        <p role="status" className="control-feedback">
          {privacyMessage}
        </p>

        {confirm && (
          <AchievementDialog
            titleId="clear-data-title"
            closeLabel={isSignedIn ? 'Cancel resetting account data' : 'Cancel deleting local data'}
            onClose={() => setConfirm(false)}
            reducedMotion={state.preferences.reducedMotion}
          >
            <div className="control-confirm">
              <span className="vault-eyebrow">
                {isSignedIn ? 'Privacy & Account Data' : 'Privacy & Local Data'}
              </span>
              <h2 id="clear-data-title">
                {isSignedIn
                  ? 'Reset your CTRL+PATH account data?'
                  : 'Delete your local CTRL+PATH data?'}
              </h2>
              <p>
                {isSignedIn
                  ? 'This permanently resets your saved profile details, quiz attempts, gemstones, comparisons, and reflections in both your cloud account and this browser.'
                  : 'This permanently removes your saved profile, quiz attempts, gemstones, comparisons, reflections, and preferences from this browser.'}
              </p>
              <div className="control-actions">
                <button
                  type="button"
                  className="community-secondary-button"
                  onClick={() => setConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="control-danger-button"
                  onClick={() => {
                    const result = resetAllData();
                    setPrivacyMessage(
                      result?.message ||
                        (isSignedIn
                          ? 'Your account progress has been reset.'
                          : 'Your local data has been deleted.'),
                    );
                    setConfirm(false);
                  }}
                >
                  {isSignedIn ? 'Reset account data' : 'Delete local data'}
                </button>
              </div>
            </div>
          </AchievementDialog>
        )}
      </ControlCard>
    </>
  );
}