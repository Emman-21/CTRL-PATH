import { Link } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { studentProgress } from '../../utils/studentControls';
import { CATEGORY_NAMES, isCompletedAttempt } from '../../utils/achievementRules';
import { analyzeQuizAttempt } from '../../utils/resultsAnalytics';
import { displayDate } from '../../utils/communitySelectors';
import { GEMSTONE_ASSETS } from '../../assets/manifest';
import { TRACKS_DATA } from '../../data/tracks';
import { ControlCard } from './ControlShared';
import { AchievementMeter, GemstoneImage } from '../achievements/AchievementCard';
import { loadQuizSession } from '../../utils/quizEngine';

export function JourneyOverview() {
  const {state}=useStudent();const p=studentProgress(state);const session=loadQuizSession();
  return <><ControlCard title="Your academic journey" description="Your discoveries and saved milestones, in one place.">
    <div className="control-metrics">{[[`${p.explored}/3`,'Tracks explored'],[p.moduleCount,'Learning modules read'],[p.attempts.length,'Valid submitted attempts'],[`${p.collection.unlocked}/20`,'Gemstones collected'],[state.savedComparisons.length,'Saved comparisons'],[p.fullyAnswered,'Fully answered attempts']].map(([value,label])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    <p className="control-description">Designated assessed learning activities are not available yet. Module reading is tracked separately and does not award their achievements.</p>
    <details className="control-criteria"><summary>How the Dashboard journey indicator is calculated ({p.journeyPercent}%)</summary><p>35% tracks explored (out of 3), 35% average saved exploration progress, 15% submitted assessments (up to 2), and 15% earned gems (up to 10). This is an exploration indicator, not academic completion or a track recommendation.</p></details>
    {session&&!session.isCompleted&&<p className="control-notice">A saved quiz is in progress at level {session.currentLevel}. <Link to="/quiz">Resume your assessment</Link></p>}
  </ControlCard><ControlCard title="Track exploration" description="Saved exploration percentages are retained. Individual module readings are counted only when a completion record exists."><div className="control-track-grid">{(['NT','BA','SM'] as const).map(track=>{
    const info=TRACKS_DATA[track];const gem=state.achievementRecords.find(r=>r.id===GEMSTONE_ASSETS.find(g=>g.id===info.introAchievement.id)!.achievementId);
    return <article key={track} className={`control-track gem-category-${track}`}><span className="community-tag">{track}</span><h3>{info.name}</h3><strong>{state.exploredTracks[track]?'Explored':'Not explored'}</strong>{state.exploredTracks[track]&&<p>Exploration date: {displayDate(state.explorationDates[track]||gem?.unlockedAt||undefined)}</p>}<p>{state.trackProgress[track]}% saved exploration progress</p><AchievementMeter current={state.trackProgress[track]} total={100} label={`${info.name} exploration`}/><p>{state.moduleCompletions.filter(m=>m.track===track).length} recorded module readings</p><p>{info.introAchievement.name}: {gem?'Unlocked':'Locked'}</p><Link className="community-text-link" to={`/tracks?track=${track}`}>Open {track} track</Link></article>;
  })}</div></ControlCard></>;
}

export function QuizHistoryPanel() {
  const {state}=useStudent();const p=studentProgress(state);
  return <><ControlCard title="Quiz history" description="Submitted attempts remain read-only. The existing maximum of three attempts still applies.">
    {state.quizAttempts.length===0?<div className="community-small-empty"><h3>No submitted assessments yet</h3><Link to="/quiz" className="vault-primary-button">Open CTRL Quiz</Link></div>:<div className="control-history">{state.quizAttempts.map(attempt=>{
      const valid=p.attempts.some(a=>a.id===attempt.id);const hasAnswers=!!attempt.answers&&Object.keys(attempt.answers).length>0;
      const analysis=valid&&hasAnswers?analyzeQuizAttempt(attempt):null;
      return <article key={attempt.id}><div><h3>Attempt {attempt.attemptNumber}</h3><p>{displayDate(attempt.submittedAt||attempt.date)}</p><span className="community-tag">{!valid?'Saved record needs review':isCompletedAttempt(attempt)?'Completed':hasAnswers?'Submitted with omissions':'Submitted · legacy summary'}</span></div>
        <div className="control-score-row">{(['NT','BA','SM'] as const).map(track=><span key={track} className={`gem-category-${track} community-tag`}>{track}: {valid?`${Math.round(attempt[`${track.toLowerCase()}Score` as 'ntScore'|'baScore'|'smScore'])}%`:'Unavailable'}</span>)}</div>
        <p>Total score: {analysis?`${analysis.evaluatedQuestions.filter(q=>q.isCorrect).length} / ${analysis.evaluatedQuestions.length} correct`:'Not available from this record'}</p><p>{attempt.totalAnswered} / {attempt.totalQuestions} questions answered</p>
        {valid&&<Link className="community-text-link" to={`/results?attempt=${encodeURIComponent(attempt.id)}`}>View results for attempt {attempt.attemptNumber}</Link>}
      </article>;
    })}</div>}
    <div className="control-actions">{p.fullyAnswered>=2&&<Link className="community-secondary-button" to="/results#attempt-comparison">Compare completed attempts</Link>}<Link className="community-text-link" to="/quiz">{state.quizAttempts.length>=3?'Review assessment availability':'Open assessment options'}</Link></div>
  </ControlCard><SmartResultsSummary/></>;
}
export function SmartResultsSummary() {
  const {state}=useStudent();const {latest,analysis}=studentProgress(state);
  return <ControlCard title="Latest assessment summary" description="Knowledge demonstrated in your latest valid submission. Your academic pathway remains your choice.">
    {latest&&analysis?<><div className="control-result-gems">{(['NT','BA','SM'] as const).map((track,i)=><div key={track} className={`gem-category-${track}`}><GemstoneImage gem={GEMSTONE_ASSETS[[4,9,14][i]]}/><h3>{CATEGORY_NAMES[track]}</h3><strong>{analysis.trackBreakdowns[track].percentage}%</strong></div>)}</div>
      <p>{analysis.isTie?`Highest demonstrated knowledge areas are tied: ${analysis.tiedTracks?.map(t=>CATEGORY_NAMES[t]).join(', ')}.`:`Highest demonstrated knowledge area: ${CATEGORY_NAMES[analysis.highestTrack]}.`}</p><Link className="vault-primary-button" to={`/results?attempt=${encodeURIComponent(latest.id)}`}>View full results</Link></>:<p className="community-small-empty">Complete an assessment to see your saved results here.</p>}
  </ControlCard>;
}
export function AchievementSummary() {
  const {state}=useStudent();const {collection:c}=studentProgress(state);
  return <ControlCard title="Achievement collection" description="Every gemstone celebrates progress. Opening the Control Center does not award achievements."><div className="control-summary-total"><strong>{c.unlocked} / 20</strong><span>{c.percent}% of your collection</span></div><AchievementMeter current={c.unlocked} total={20} label="Achievement collection"/><div className="control-metrics">{Object.entries(CATEGORY_NAMES).map(([key,name])=><div key={key}><strong>{c.categories[key]} / 5</strong><span>{name}</span></div>)}</div>
    {c.recent.length>0?<div className="control-recent-gems">{c.recent.slice(0,5).map(({gem})=><Link key={gem.id} to="/achievements"><GemstoneImage gem={gem}/><span>{gem.name}</span></Link>)}</div>:<p>Your collection is waiting for its first discovery.</p>}
    <Link className="vault-primary-button" to="/achievements">Open Achievement Vault</Link></ControlCard>;
}
export function SavedComparisons() {
  const {state,removeComparison}=useStudent();
  return <ControlCard title="Saved path comparisons" description="Revisit the selected tracks and your latest private reflections. Removing a comparison does not remove reflections or earned gems.">
    {state.savedComparisons.length?<div className="control-history">{state.savedComparisons.map(comp=><article key={comp.id}><h3>{comp.title}</h3><p>Saved {displayDate(comp.date)}</p><p>{comp.tracks.map(t=>CATEGORY_NAMES[t]).join(' · ')}</p>{comp.tracks.map(t=>state.reflections[t]?.interests?<p key={t} className="control-reflection-excerpt"><strong>{t} reflection:</strong> {state.reflections[t].interests.slice(0,180)}{state.reflections[t].interests.length>180?'…':''}</p>:null)}<div className="control-actions"><Link className="community-text-link" to={`/compare?saved=${encodeURIComponent(comp.id)}`}>Open comparison</Link><button className="community-secondary-button" onClick={()=>removeComparison(comp.id)} aria-label={`Remove comparison ${comp.title}`}>Remove saved comparison</button></div></article>)}</div>:<div className="community-small-empty"><h3>No saved comparisons yet</h3><Link to="/compare" className="vault-primary-button">Compare academic tracks</Link></div>}
  </ControlCard>;
}
