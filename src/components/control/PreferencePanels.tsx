import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import type { StudentPreferences } from '../../types';
import { exportStudentData } from '../../utils/studentControls';
import { AchievementDialog } from '../achievements/AchievementDialog';
import { ControlCard } from './ControlShared';

export function PreferencePanels() {
  const { state, updatePreferences, resetAllData } = useStudent();
  const [prefMessage, setPrefMessage] = useState('');
  const [privacyMessage, setPrivacyMessage] = useState('');
  const [confirm, setConfirm] = useState(false);

  const change = (prefs: Partial<StudentPreferences>) => {
    const result = updatePreferences(prefs);
    setPrefMessage(result.message);
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

      <ControlCard
        title="Privacy & Local Data"
        description="Your progress is stored locally in this browser. Export a backup or delete your local data anytime."
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
            <span>Delete local data</span>
          </button>
        </div>

        <p role="status" className="control-feedback">
          {privacyMessage}
        </p>

        {confirm && (
          <AchievementDialog
            titleId="clear-data-title"
            closeLabel="Cancel deleting local data"
            onClose={() => setConfirm(false)}
            reducedMotion={state.preferences.reducedMotion}
          >
            <div className="control-confirm">
              <span className="vault-eyebrow">Privacy & Local Data</span>
              <h2 id="clear-data-title">Delete your local CTRL+PATH data?</h2>
              <p>
                This permanently removes your saved profile, quiz attempts, gemstones,
                comparisons, reflections, and preferences from this browser.
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
                    setPrivacyMessage(result.message);
                    setConfirm(false);
                  }}
                >
                  Delete local data
                </button>
              </div>
            </div>
          </AchievementDialog>
        )}
      </ControlCard>
    </>
  );
}
