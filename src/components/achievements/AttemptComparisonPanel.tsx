import { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { eligibleAttemptPair, isCompletedAttempt } from '../../utils/achievementRules';
import { Card } from '../shared/Card';

export function AttemptComparisonPanel() {
  const { state, completeAttemptComparison } = useStudent();
  const attempts = state.quizAttempts.filter(isCompletedAttempt);
  const [first, setFirst] = useState(attempts[1]?.id || '');
  const [second, setSecond] = useState(attempts[0]?.id || '');
  const [reviewed, setReviewed] = useState(false);
  if (attempts.length < 2) return null;
  const a = attempts.find(item => item.id === first);
  const b = attempts.find(item => item.id === second);
  const eligible = eligibleAttemptPair(state, [first, second]);
  const recorded = state.attemptComparisons.some(c => [first, second].every(id => c.attemptIds.includes(id)));
  return <div id="attempt-comparison"><Card className="space-y-4">
    <h2 className="font-extrabold text-lg text-slate-900">Compare your completed attempts</h2>
    <p className="text-sm text-slate-600">Reflect on what changed. These scores are learning signals; your pathway is still your choice.</p>
    <div className="grid sm:grid-cols-2 gap-4">{[first, second].map((value, index) => <label key={index} className="text-sm font-bold text-slate-700">
      {index === 0 ? 'Earlier result' : 'Result to compare'}
      <select className="block w-full mt-2 border border-slate-300 rounded-xl p-3 bg-white" value={value} onChange={e => { (index === 0 ? setFirst : setSecond)(e.target.value); setReviewed(false); }}>
        {attempts.map(attempt => <option key={attempt.id} value={attempt.id}>Attempt {attempt.attemptNumber} — {attempt.date}</option>)}
      </select></label>)}</div>
    {eligible && a && b ? <>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left"><caption className="sr-only">Scores from the two selected completed attempts</caption>
        <thead><tr><th className="p-2">Track</th><th className="p-2">Attempt {a.attemptNumber}</th><th className="p-2">Attempt {b.attemptNumber}</th><th className="p-2">Change</th></tr></thead>
        <tbody>{(['NT', 'BA', 'SM'] as const).map(track => { const key = `${track.toLowerCase()}Score` as 'ntScore' | 'baScore' | 'smScore'; const delta = b[key] - a[key]; return <tr key={track} className="border-t border-slate-100"><th className="p-2">{track}</th><td className="p-2">{a[key]}%</td><td className="p-2">{b[key]}%</td><td className="p-2">{delta > 0 ? '+' : ''}{delta} points</td></tr>; })}</tbody>
      </table></div>
      <label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" className="mt-1 w-4 h-4" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />I reviewed the differences between these completed attempts.</label>
      <button className="vault-primary-button disabled:opacity-50" disabled={!reviewed || recorded} onClick={() => completeAttemptComparison([first, second])}>{recorded ? 'Comparison completed' : 'Complete attempt comparison'}</button>
    </> : <p className="text-sm text-slate-600">Select two different completed attempts, including an eligible retake (attempt 2 or 3).</p>}
  </Card></div>;
}
