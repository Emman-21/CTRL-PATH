import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { exportStudentData } from '../../utils/studentControls';
import { AchievementDialog } from '../achievements/AchievementDialog';
import { ControlCard } from './ControlShared';
export function PrivacyDataControls() {
  const {state,resetAllData}=useStudent();const [confirm,setConfirm]=useState(false);const [message,setMessage]=useState('');
  const exportData=()=>{
    try {
      const data=exportStudentData(state,localStorage);
      const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
      const link=document.createElement('a');link.href=url;link.download=`ctrl-path-data-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
      setMessage('Your versioned JSON export has been prepared for download. Keep it somewhere private.');
    } catch(error) {setMessage(error instanceof Error?error.message:'The export could not be prepared. Your data has not changed.');}
  };
  return <ControlCard title="Privacy and local data" description="Your information matters. Review what this frontend prototype stores and what you can control.">
    <div className="control-privacy-copy"><h3>What is stored here?</h3><p>Your profile, preferences, track exploration, recorded module readings, active quiz, submitted attempts, achievements, saved comparisons, and private reflections are stored in this browser. Recovery backups may be kept during safe data migration.</p><h3>What local storage means</h3><p>This is not encrypted cloud storage or a university-managed record. Data does not automatically sync to another browser or device and may be lost if browser storage is cleared. Anyone with access to this browser profile may be able to inspect it.</p><h3>Your export</h3><p>The JSON export includes your current readable student data and active quiz session, if available. It excludes unrelated application keys and migration backups. Importing an export is not available in this stage.</p></div>
    <div className="control-actions"><button className="vault-primary-button" onClick={exportData}><Download size={16}/>Export my data</button><button className="control-danger-button" onClick={()=>{setConfirm(true);setMessage('');}}><Trash2 size={16}/>Clear my local data</button></div>
    <p role="status" className="control-feedback">{message}</p>
    {confirm&&<AchievementDialog titleId="clear-data-title" closeLabel="Cancel clearing" onClose={()=>setConfirm(false)} reducedMotion={state.preferences.reducedMotion}><div className="control-confirm"><span className="vault-eyebrow">Privacy and data</span><h2 id="clear-data-title">Clear your CTRL+PATH data?</h2><p>This permanently removes this browser's CTRL+PATH profile, exploration, module readings, quiz progress and history, gemstones, comparisons, reflections, preferences, and migration backups.</p><p><strong>This action cannot be undone in the app.</strong> Export your data first if you want to keep a copy. Other applications' storage will stay untouched.</p><div className="control-actions"><button className="community-secondary-button" onClick={()=>setConfirm(false)}>Cancel</button><button className="control-danger-button" onClick={()=>{const result=resetAllData();setMessage(result.message);setConfirm(false);}}>Permanently clear CTRL+PATH data</button></div></div></AchievementDialog>}
  </ControlCard>;
}
