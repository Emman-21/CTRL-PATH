import { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import type { StudentPreferences } from '../../types';
import { ControlCard } from './ControlShared';
export function PreferencePanels() {
  const {state,updatePreferences}=useStudent();const [message,setMessage]=useState('');
  const change=(prefs:Partial<StudentPreferences>)=>{const result=updatePreferences(prefs);setMessage(result.message);};
  const toggle=(key:keyof StudentPreferences,label:string,description:string)=><label className="control-setting" key={key}><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={Boolean(state.preferences[key])} onChange={e=>change({[key]:e.target.checked})}/></label>;
  return <><ControlCard title="Appearance and accessibility" description="Make your learning space comfortable. Your preferences apply across CTRL+PATH.">
    <div className="control-setting"><span><strong>Theme</strong><small>The current portal uses the light theme.</small></span><span className="community-tag">Light</span></div>
    {toggle('reducedMotion','Reduced motion','Turn off interface animation. A system reduced-motion preference is also respected.')}
    {toggle('highContrast','Higher contrast','Use darker text and stronger borders throughout the portal.')}
    <label className="control-setting"><span><strong>Text size</strong><small>Increase interface and reading text.</small></span><select aria-label="Text size" value={state.preferences.textSize} onChange={e=>change({textSize:e.target.value as 'normal'|'large'})}><option value="normal">Normal</option><option value="large">Large</option></select></label>
  </ControlCard><ControlCard title="Luni preferences" description="Luni uses scripted guidance. These settings control the existing companion.">
    {toggle('luniEnabled','Show Luni assistant','Show or hide the floating companion across the app.')}
    {toggle('luniAutoTips','Automatic Luni guidance','Show a guidance bubble when you open a page. You can still ask Luni manually.')}
    {toggle('luniFloatingAnimation','Animate Luni','Allow gentle character animation when reduced motion is off.')}
  </ControlCard><ControlCard title="Notification preferences" description="Only existing in-app features are available. No email, SMS, or push delivery is connected.">
    {toggle('notifications','Achievement celebrations','Show a dismissible celebration when you earn a new gemstone. Your collection updates even when this is off.')}
    <p className="control-description">Announcements are available in the Luminary Bulletin. Automatic announcement reminders are not available yet.</p>
  </ControlCard><p role="status" className="control-feedback">{message}</p></>;
}
