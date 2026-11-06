import { useCallback, useEffect, useState } from 'react';
import { useBlocker, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { BACKGROUNDS } from '../assets/manifest';
import { StudentProfile } from '../components/control/StudentProfile';
import { JourneyOverview, QuizHistoryPanel, AchievementSummary, SavedComparisons } from '../components/control/JourneyPanels';
import { ReflectionManager } from '../components/control/ReflectionManager';
import { PreferencePanels } from '../components/control/PreferencePanels';
import { PrivacyDataControls } from '../components/control/PrivacyDataControls';
import { DiscardDialog } from '../components/control/ControlShared';

const sections=[['profile','Profile'],['journey','Journey'],['assessments','Assessments'],['collection','Collection'],['comparisons','Comparisons'],['reflections','Reflections'],['settings','Settings'],['privacy','Privacy']] as const;
type Section=typeof sections[number][0];
export function ControlCenterPage() {
  const [params]=useSearchParams();
  const [section,setSection]=useState<Section>(()=>sections.some(([id])=>id===params.get('section'))?params.get('section') as Section:'profile');
  const [dirty,setDirty]=useState(false);
  const onDirty=useCallback((value:boolean)=>setDirty(value),[]);
  const [pending,setPending]=useState<Section|null>(null);
  const blocker=useBlocker(dirty);
  useEffect(()=>{if(!dirty)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
  const select=(next:Section)=>{if(next===section)return;if(dirty)setPending(next);else setSection(next);};
  return <div className="control-center">
    <PageHeader title="Your Control Center" subtitle="Manage your profile, reflect on your progress, and personalize your CTRL+PATH experience." backgroundImage={BACKGROUNDS.dashboardSkyKingdom} luniPose="point" luniTitle="Make this journey your own" luniQuote="Welcome to your Control Center, Luminary! This is where you can manage your journey and make CTRL+PATH your own."/>
    <div className="control-layout"><nav className="control-tabs" role="tablist" aria-label="Control Center sections" aria-orientation="vertical">{sections.map(([id,label],index)=><button key={id} role="tab" id={`control-tab-${id}`} aria-selected={section===id} aria-controls="control-panel" tabIndex={section===id?0:-1} onClick={()=>select(id)} onKeyDown={e=>{
      const keys=['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'];if(!keys.includes(e.key))return;e.preventDefault();
      const next=e.key==='Home'?0:e.key==='End'?sections.length-1:(index+(e.key==='ArrowDown'||e.key==='ArrowRight'?1:-1)+sections.length)%sections.length;
      document.getElementById(`control-tab-${sections[next][0]}`)?.focus();
    }}>{label}{dirty&&section===id&&<span aria-label="Unsaved changes"> ·</span>}</button>)}</nav>
      <div id="control-panel" role="tabpanel" aria-labelledby={`control-tab-${section}`} tabIndex={0} className="control-panels">
        {section==='profile'&&<StudentProfile onDirty={onDirty}/>}{section==='journey'&&<JourneyOverview/>}{section==='assessments'&&<QuizHistoryPanel/>}{section==='collection'&&<AchievementSummary/>}{section==='comparisons'&&<SavedComparisons/>}{section==='reflections'&&<ReflectionManager onDirty={onDirty}/>}{section==='settings'&&<PreferencePanels/>}{section==='privacy'&&<PrivacyDataControls/>}
      </div>
    </div>
    {(pending||blocker.state==='blocked')&&<DiscardDialog onKeep={()=>{setPending(null);if(blocker.state==='blocked')blocker.reset();}} onDiscard={()=>{setDirty(false);if(blocker.state==='blocked')blocker.proceed();if(pending){setSection(pending);setPending(null);}}}/>}
  </div>;
}
