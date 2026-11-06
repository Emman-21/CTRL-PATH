import { useEffect, useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { profileValues, validateProfile, PROFILE_LIMITS, type ProfileValues } from '../../utils/studentControls';
import { ControlCard, StudentAvatar, DiscardDialog } from './ControlShared';

export function StudentProfile({onDirty}:{onDirty:(dirty:boolean)=>void}) {
  const {state,updateProfile}=useStudent();
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState(()=>profileValues(state));
  const [errors,setErrors]=useState<Partial<Record<keyof ProfileValues,string>>>({});
  const [message,setMessage]=useState('');
  const [discard,setDiscard]=useState(false);
  const dirty=editing&&JSON.stringify(draft)!==JSON.stringify(profileValues(state));
  useEffect(()=>{onDirty(dirty);},[dirty,onDirty]);
  useEffect(()=>()=>onDirty(false),[onDirty]);
  const cancel=()=>{setEditing(false);setDiscard(false);setMessage('Edits canceled. Your saved profile is unchanged.');};
  const labels={name:'Display name',program:'Program',yearLevel:'Academic year level',section:'Section',biography:'Short biography'};
  return <ControlCard title="Student profile" description="Personalize this browser's profile. These changes do not update a university record.">
    {!editing?<><div className="control-profile"><StudentAvatar name={state.name} style={state.avatarStyle}/><div><h3>{state.name||'Set up your profile'}</h3>{state.program&&<p>{state.program}</p>}{state.yearLevel&&<p>{state.yearLevel}</p>}{state.section&&<p>Section {state.section}</p>}<span className="community-tag">Local profile</span></div></div>{state.biography&&<p className="community-prose">{state.biography}</p>}<button className="vault-primary-button" onClick={()=>{setDraft(profileValues(state));setErrors({});setMessage('');setEditing(true);}}>Edit profile</button></>:<form noValidate onSubmit={e=>{
      e.preventDefault();const invalid=validateProfile(draft);setErrors(invalid);
      if(Object.keys(invalid).length){setMessage('Please correct the highlighted fields.');return;}
      const result=updateProfile(draft);setMessage(result.message);if(result.ok)setEditing(false);
    }}>
      <div className="control-form-grid">{(Object.keys(labels) as (keyof typeof labels)[]).map(key=><label key={key} className={key==='biography'?'control-wide':''} htmlFor={`profile-${key}`}><span id={`profile-label-${key}`} className="control-field-label">{labels[key]} {key!=='name'&&<small>(optional)</small>}</span>
        {key==='biography'?<textarea id={`profile-${key}`} aria-labelledby={`profile-label-${key}`} rows={4} maxLength={PROFILE_LIMITS[key]} value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined}/>:<input id={`profile-${key}`} aria-labelledby={`profile-label-${key}`} value={draft[key]} maxLength={PROFILE_LIMITS[key]} required={key==='name'} autoComplete={key==='name'?'nickname':'off'} onChange={e=>setDraft({...draft,[key]:e.target.value})} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined}/>}
        {errors[key]&&<span id={`error-${key}`} className="control-field-error">{errors[key]}</span>}
      </label>)}</div>
      <fieldset className="control-avatar-options"><legend>Profile avatar</legend><p>No character avatar assets are available yet. Choose a neutral placeholder style.</p><div>{(['neutral','initials'] as const).map(style=><label key={style}><input type="radio" name="avatarStyle" value={style} checked={draft.avatarStyle===style} onChange={()=>setDraft({...draft,avatarStyle:style})}/><StudentAvatar name={draft.name} style={style}/>{style==='neutral'?'Neutral profile':'Your initials'}</label>)}</div></fieldset>
      <div className="control-actions"><button type="submit" className="vault-primary-button">Save profile</button><button type="button" className="community-secondary-button" onClick={()=>dirty?setDiscard(true):cancel()}>Cancel editing</button>{dirty&&<span>Unsaved changes</span>}</div>
    </form>}
    <p className="control-feedback" role="status">{message}</p>
    {discard&&<DiscardDialog onKeep={()=>setDiscard(false)} onDiscard={cancel}/>}
  </ControlCard>;
}
