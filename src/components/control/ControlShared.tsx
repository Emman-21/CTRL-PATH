import { UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { AchievementDialog } from '../achievements/AchievementDialog';
import { useStudent } from '../../context/StudentContext';
export function ControlCard({title,description,children}:{title:string;description?:string;children:ReactNode}) {
  return <section className="control-card"><h2>{title}</h2>{description&&<p className="control-description">{description}</p>}{children}</section>;
}
export function StudentAvatar({name,style='neutral'}:{name:string;style?:'neutral'|'initials'}) {
  return <span className="student-avatar" aria-label={style==='neutral'?'Neutral profile avatar':'Initials avatar'}>{style==='initials'?name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toLocaleUpperCase()||<UserRound/>:<UserRound size={30}/>}</span>;
}
export function DiscardDialog({onKeep,onDiscard}:{onKeep:()=>void;onDiscard:()=>void}) {
  const {state}=useStudent();
  return <AchievementDialog titleId="discard-edits-title" onClose={onKeep} closeLabel="Close discard dialog" reducedMotion={state.preferences.reducedMotion}><div className="control-confirm"><h2 id="discard-edits-title">Discard unsaved changes?</h2><p>Your saved profile and progress will stay intact. Only the edits you have not saved will be lost.</p><div className="control-actions"><button className="community-secondary-button" onClick={onKeep}>Keep editing</button><button className="vault-primary-button" onClick={onDiscard}>Discard changes</button></div></div></AchievementDialog>;
}
