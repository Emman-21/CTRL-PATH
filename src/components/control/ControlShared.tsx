import type { ReactNode } from 'react';
import type { AvatarStyle } from '../../types';
import { getAvatarOption } from '../../utils/avatarOptions';
import { AchievementDialog } from '../achievements/AchievementDialog';
import { useStudent } from '../../context/StudentContext';
export function ControlCard({title,description,children}:{title?:string;description?:string;children:ReactNode}) {
  return <section className="control-card">{title&&<h2>{title}</h2>}{description&&<p className="control-description">{description}</p>}{children}</section>;
}
export function StudentAvatar({name:_name,style}:{name?:string;style?:AvatarStyle|string}) {
  const avatar=getAvatarOption(style);
  return (
    <span className="student-avatar" role="img" aria-label={`${avatar.label} avatar`}>
      {avatar.isSprite ? (
        <span className={`student-avatar-sprite student-avatar-sprite--${avatar.id}`} aria-hidden="true" />
      ) : (
        <img src={avatar.src} alt="" className="student-avatar-img pixelated" />
      )}
    </span>
  );
}
export function DiscardDialog({onKeep,onDiscard}:{onKeep:()=>void;onDiscard:()=>void}) {
  const {state}=useStudent();
  return <AchievementDialog titleId="discard-edits-title" onClose={onKeep} closeLabel="Close discard dialog" reducedMotion={state.preferences.reducedMotion}><div className="control-confirm"><h2 id="discard-edits-title">Discard unsaved changes?</h2><p>Your saved profile and progress will stay intact. Only the edits you have not saved will be lost.</p><div className="control-actions"><button className="community-secondary-button" onClick={onKeep}>Keep editing</button><button className="vault-primary-button" onClick={onDiscard}>Discard changes</button></div></div></AchievementDialog>;
}
