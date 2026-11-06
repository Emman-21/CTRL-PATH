import { useEffect, useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import type { TrackCode } from '../../types';
import { CATEGORY_NAMES } from '../../utils/achievementRules';
import { displayDate } from '../../utils/communitySelectors';
import { ControlCard, DiscardDialog } from './ControlShared';
const fields={interests:'What interests you?',topicsToLearn:'What would you like to learn?',questions:'What questions do you have?'};
export function ReflectionManager({onDirty}:{onDirty:(dirty:boolean)=>void}) {
  const {state,saveTrackReflection}=useStudent();
  const [track,setTrack]=useState<TrackCode>('NT');
  const getDraft=(t:TrackCode)=>({interests:state.reflections[t].interests,topicsToLearn:state.reflections[t].topicsToLearn,questions:state.reflections[t].questions});
  const [draft,setDraft]=useState(()=>getDraft('NT'));
  const [pending,setPending]=useState<TrackCode|'cancel'|null>(null);
  const [message,setMessage]=useState('');
  const dirty=JSON.stringify(draft)!==JSON.stringify(getDraft(track));
  useEffect(()=>{onDirty(dirty);},[dirty,onDirty]);useEffect(()=>()=>onDirty(false),[onDirty]);
  const changeTrack=(next:TrackCode)=>{setTrack(next);setDraft(getDraft(next));setMessage('');};
  return <ControlCard title="Personal reflections" description="These notes are private within this browser. They are not published or sent to an administrator.">
    <label className="control-select-label">Reflection track<select value={track} onChange={e=>dirty?setPending(e.target.value as TrackCode):changeTrack(e.target.value as TrackCode)}>{(['NT','BA','SM'] as const).map(t=><option key={t} value={t}>{CATEGORY_NAMES[t]}</option>)}</select></label>
    <p className="control-description">{state.reflections[track].savedAt?`Last saved: ${displayDate(state.reflections[track].savedAt)}`:'No saved reflection for this track yet. Start with a question or a small discovery.'}</p>
    <form onSubmit={e=>{e.preventDefault();const result=saveTrackReflection(track,draft);setMessage(result.message);}}>
      {Object.entries(fields).map(([key,label])=><label className="control-textarea-label" key={key}>{label}<textarea aria-label={label} rows={4} maxLength={5000} value={draft[key as keyof typeof draft]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}
      <div className="control-actions"><button className="vault-primary-button" type="submit" disabled={!dirty}>Save reflection</button><button className="community-secondary-button" type="button" disabled={!dirty} onClick={()=>setPending('cancel')}>Cancel changes</button>{dirty&&<span>Unsaved changes</span>}</div>
    </form><p role="status" className="control-feedback">{message}</p>
    <p className="control-description">Local-only notes may be lost if browser storage is cleared. Export your data to keep a copy.</p>
    {pending&&<DiscardDialog onKeep={()=>setPending(null)} onDiscard={()=>{if(pending==='cancel')setDraft(getDraft(track));else changeTrack(pending);setPending(null);}}/>}
  </ControlCard>;
}
