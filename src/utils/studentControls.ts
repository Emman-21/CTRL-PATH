import type { StudentState, QuizAttempt, TrackCode } from '../types';
import { serializeStudent, STUDENT_STORAGE_KEY } from './achievementStorage';
import { achievementStats, isCompletedAttempt } from './achievementRules';
import { analyzeQuizAttempt } from './resultsAnalytics';
import { QUIZ_QUESTIONS } from '../data/quiz/quizQuestions';
import { TRACKS_DATA } from '../data/tracks';

export type ProfileValues = Pick<StudentState,'name'|'program'|'yearLevel'|'section'|'biography'|'avatarStyle'>;
export type SaveResult = { ok: boolean; message: string };
export const PROFILE_LIMITS = { name:60, program:100, yearLevel:60, section:40, biography:500 };
export function profileValues(state:StudentState):ProfileValues {
  return {name:state.name,program:state.program,yearLevel:state.yearLevel,section:state.section,biography:state.biography,avatarStyle:state.avatarStyle};
}
export function validateProfile(values:ProfileValues) {
  const errors:Partial<Record<keyof ProfileValues,string>>={};
  for(const [key,max] of Object.entries(PROFILE_LIMITS)) {
    const field=key as keyof typeof PROFILE_LIMITS;
    if(typeof values[field]!=='string'||values[field].trim().length>max) errors[field]=`Use ${max} characters or fewer.`;
  }
  if(!values.name?.trim()) errors.name='Enter a display name.';
  if(!['neutral','initials'].includes(values.avatarStyle)) errors.avatarStyle='Choose an available avatar style.';
  return errors;
}
export function validSubmittedAttempt(a:QuizAttempt) {
  return !!a.id && Number.isInteger(a.attemptNumber) && a.attemptNumber>0 && a.totalQuestions>0 &&
    Number.isFinite(a.totalAnswered) && a.totalAnswered>=0 && a.totalAnswered<=a.totalQuestions &&
    [a.ntScore,a.baScore,a.smScore].every(n=>Number.isFinite(n)&&n>=0&&n<=100);
}
export function studentProgress(state:StudentState) {
  const attempts=state.quizAttempts.filter(validSubmittedAttempt);
  const latest=[...attempts].sort((a,b)=>b.attemptNumber-a.attemptNumber)[0];
  const explored=(['NT','BA','SM'] as const).filter(t=>state.exploredTracks[t]).length;
  const collection=achievementStats(state);
  const moduleCount=state.moduleCompletions.length;
  // Preserve the existing Dashboard formula and make its criteria visible.
  const journeyPercent=Math.min(100,Math.round(explored/3*35+(state.trackProgress.NT+state.trackProgress.BA+state.trackProgress.SM)/300*35+Math.min(1,attempts.length/2)*15+Math.min(1,collection.unlocked/10)*15));
  return {attempts,latest,explored,collection,moduleCount,journeyPercent,fullyAnswered:attempts.filter(isCompletedAttempt).length,analysis:latest?analyzeQuizAttempt(latest):null};
}
export function completeLearningModule(state:StudentState,track:TrackCode,moduleId:string,now=new Date().toISOString()):StudentState {
  const module=TRACKS_DATA[track]?.modules.find(m=>m.id===moduleId&&m.status==='available');
  if(!module||state.moduleCompletions.some(m=>m.moduleId===moduleId)) return state;
  return {...state,moduleCompletions:[...state.moduleCompletions,{track,moduleId,completedAt:now}],trackProgress:{...state.trackProgress,[track]:Math.min(100,state.trackProgress[track]+15)}};
}
export const QUIZ_SESSION_KEY='ctrl_path_quiz_session_v1';
export function isStudentStorageKey(key:string) {
  return key===STUDENT_STORAGE_KEY||key===QUIZ_SESSION_KEY||new RegExp(`^${STUDENT_STORAGE_KEY}_backup_[0-9]+$`).test(key);
}
export function exportStudentData(state:StudentState,storage:Storage,now=new Date().toISOString()) {
  // Explicit export allowlist: no unrelated storage, credentials, or unknown legacy fields.
  const keys=['achievementSchemaVersion','achievementRecords','attemptComparisons','profileSchemaVersion','name','university','program','yearLevel','section','biography','avatarStyle','exploredTracks','explorationDates','trackProgress','moduleCompletions','currentQuizProgress','quizAttempts','savedComparisons','comparisonSelection','reflections','preferences'] as const;
  const persisted=serializeStudent(state);
  const student=Object.fromEntries(keys.map(key=>[key,persisted[key]]));
  let quizSession:Record<string,unknown>|null=null;
  const raw=storage.getItem(QUIZ_SESSION_KEY);
  if(raw) {
    try {
      const parsed=JSON.parse(raw);
      if(parsed&&typeof parsed==='object'&&typeof parsed.attemptId==='string') {
        const fields=['attemptId','attemptNumber','startedAt','currentLevel','currentQuestionIndex','shuffledQuestionsByLevel','isCompleted','submittedAt','levelPrepSeen'];
        quizSession=Object.fromEntries(fields.map(key=>[key,parsed[key]]));
        quizSession.answers=Object.fromEntries(QUIZ_QUESTIONS.filter(q=>parsed.answers?.[q.id]!==undefined).map(q=>[q.id,parsed.answers[q.id]]));
      }
    } catch { throw new Error('The saved quiz session could not be read. Export was not completed; your data is unchanged.'); }
  }
  return {format:'ctrl-path-student-export',version:1,exportedAt:now,storage:'local-browser',student,quizSession};
}
export function clearStudentData(storage:Storage,session:Storage):SaveResult {
  const backup=new Map<string,string>();
  try {
    for(let i=0;i<storage.length;i++) {const key=storage.key(i); if(key&&isStudentStorageKey(key)) backup.set(key,storage.getItem(key)!);}
    for(const key of backup.keys()) storage.removeItem(key);
    session.removeItem('ctrl_quiz_focus_mode');
    return {ok:true,message:'Your local CTRL+PATH data has been cleared.'};
  } catch {
    let restored=true;
    for(const [key,value] of backup) {try {storage.setItem(key,value);} catch {restored=false;}}
    return {ok:false,message:restored?'Data could not be cleared. Existing records were restored.':'Clearing could not finish and some browser records may have been removed. The current session is still available; export it before closing.'};
  }
}
