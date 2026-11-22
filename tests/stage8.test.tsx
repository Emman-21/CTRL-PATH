import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ALUMNI_STORIES } from '../src/data/communityData';
import type { AlumniStory } from '../src/types/community';
import { publishedStories,filterStories,displayDate,safeExternalLink } from '../src/utils/communitySelectors';
import { AlumniStoryCard } from '../src/components/community/CommunityCards';
import { StoryTopicIcon } from '../src/components/community/StoryTopicIcon';
import { INITIAL_STATE } from '../src/context/StudentContext';
import { migrateStudentData,serializeStudent,STUDENT_STORAGE_KEY } from '../src/utils/achievementStorage';
import { validateProfile,profileValues,studentProgress,completeLearningModule,areAllTrackSubjectsCompleted,exportStudentData,clearStudentData,QUIZ_SESSION_KEY } from '../src/utils/studentControls';
import { evaluateAchievements } from '../src/utils/achievementRules';
import { QUIZ_QUESTIONS } from '../src/data/quiz/quizQuestions';
import { TRACKS_DATA } from '../src/data/tracks';

// Synthetic test records only. These are not real alumni or university notices and
// are never imported by production content or presented as authentic evidence.
const now=Date.parse('2026-11-04T10:00:00Z');
const story:AlumniStory={id:'test-story',track:'NT',title:'Synthetic networking story',excerpt:'Fixture excerpt',experience:'Fixture experience',source:'Test fixture',approvedFields:['displayName'],displayName:'Test Contributor',organization:'Unapproved employer field',publicationConsent:true,publicationStatus:'published',verificationStatus:'verified',keywords:['routing'],featured:true};
const fresh=()=>structuredClone(INITIAL_STATE);
class MemoryStorage implements Storage {
  values=new Map<string,string>();get length(){return this.values.size;}getItem(k:string){return this.values.get(k)??null;}setItem(k:string,v:string){this.values.set(k,v);}removeItem(k:string){this.values.delete(k);}key(i:number){return [...this.values.keys()][i]??null;}clear(){this.values.clear();}
}
test('published alumni collection includes verified consented student submissions',()=>{
  assert.deepEqual(publishedStories([]),[]);
  const published=publishedStories(ALUMNI_STORIES);
  assert.equal(published.length,2);
  const lance=published.find(s=>s.id==='lance-edward-dela-rosa');
  assert.ok(lance);
  assert.equal(lance.track,'NT');
  assert.equal(lance.displayName,'Mr. Lance Edward V. Dela Rosa');
  assert.equal(lance.currentRole,'IINTESS 4th Year Representative');
  assert.equal(lance.organization,'AY: 2026-2027');
  assert.deepEqual(lance.positions,['4th Year Representative, IINTESS 2026-2027']);
  assert.equal(lance.profileImage,'/assets/aistudio/33b5e2c2-4b7a-46fe-abac-5b05af7fcf62_a05ea5b8.jpg');
  assert.ok(lance.quote?.includes("Don't give up when the ping fails."));
  const joeren=published.find(s=>s.id==='joeren-aguila');
  assert.ok(joeren);
  assert.equal(joeren.track,'BA');
  assert.equal(joeren.displayName,'Mr. Joeren G. Aguila');
  assert.equal(joeren.currentRole,'IINTESS Internal Vice President');
  assert.equal(joeren.organization,'AY: 2026-2027');
  assert.equal(joeren.positions?.length,4);
  assert.ok(joeren.positions?.includes('OIC Secretary, IINTESS - 2026'));
  assert.ok(joeren.positions?.includes('Assistant Secretary, IINTESS - 2025-2026'));
  assert.ok(joeren.positions?.includes('Internal Vice President, IINTESS 2026-2027'));
  assert.ok(joeren.positions?.includes('Committee Head on Environmental Protection Health and Sanitation, CICS-SC 2025-2027'));
  assert.equal(joeren.profileImage,'/assets/aistudio/26b9e082-f0ac-44ae-9e84-c041d76463c5_fb12221a.jpg');
  assert.ok(joeren.quote?.includes('Technology will never stop evolving, so never stop learning.'));
  assert.ok(joeren.experience?.includes('Power BI and SAP Analytics Cloud'));
  assert.ok(joeren.challenges?.includes('continuous learning curve'));
  assert.ok(joeren.advice?.includes('never limit your learning'));
  assert.equal(filterStories(published,'BA','power bi').length,1);
});
test('alumni requires verified publication and consent; optional personal fields are redacted',()=>{
  const records=publishedStories([story,{...story,id:'draft',publicationStatus:'draft'},{...story,id:'unverified',verificationStatus:'unverified'},{...story,id:'no-consent',publicationConsent:false},{...story,id:'future',publishedAt:'2027-01-01T00:00:00Z'}],now);
  assert.equal(records.length,1);assert.equal(records[0].displayName,'Test Contributor');assert.equal(records[0].organization,undefined);
  assert.equal(publishedStories([{...story,approvedFields:[]}],now)[0].displayName,undefined);
});
test('combined case-insensitive alumni filtering searches only permitted title/name/keywords',()=>{
  const records=publishedStories([story,{...story,id:'ba',track:'BA',title:'Synthetic analytics story',featured:false}],now);
  assert.equal(filterStories(records,'NT','ROUTING').length,1);assert.equal(filterStories(records,'SM','').length,0);
  assert.equal(filterStories(records,'All','contributor').length,2);assert.equal(filterStories(records,'All','Unapproved employer').length,0);
  assert.equal(filterStories(publishedStories([{...story,approvedFields:[]}],now),'All','Contributor').length,0);
});
test('external links and date formatting handle invalid values safely',()=>{
  assert.equal(displayDate('bad'),'Date unavailable');assert.equal(displayDate(undefined),'Date unavailable');
  assert.equal(safeExternalLink('javascript:alert(1)'),undefined);assert.equal(safeExternalLink('https://user:password@example.test'),undefined);assert.equal(safeExternalLink('not a URL'),undefined);
  assert.equal(safeExternalLink('https://example.test/approved'),'https://example.test/approved');
});
test('actual cards render only public metadata, quotes, and real detail navigation',()=>{
  const record=publishedStories([story],now)[0];const html=renderToStaticMarkup(<MemoryRouter><AlumniStoryCard story={record}/></MemoryRouter>);
  assert.ok(html.includes('/alumni/test-story'));assert.ok(html.includes('Test Contributor'));assert.ok(!html.includes('Unapproved employer'));
  const published=publishedStories(ALUMNI_STORIES);
  const lance=published.find(s=>s.id==='lance-edward-dela-rosa')!;
  const spotlightHtml=renderToStaticMarkup(<MemoryRouter><AlumniStoryCard story={lance} variant="spotlight"/></MemoryRouter>);
  assert.ok(spotlightHtml.includes('Mr. Lance Edward V. Dela Rosa'));
  assert.ok(spotlightHtml.includes('Networking Technology'));
  assert.ok(spotlightHtml.includes('<svg'));
  assert.ok(!spotlightHtml.includes('IINTESS 4th Year Representative'));
  assert.ok(!spotlightHtml.includes('AY: 2026-2027'));
  assert.ok(spotlightHtml.includes('Positions held'));
  assert.ok(spotlightHtml.includes('4th Year Representative, IINTESS 2026-2027'));
  assert.ok(spotlightHtml.includes("Request timed out"));
  assert.ok(spotlightHtml.includes('Open full story view'));
  assert.ok(!spotlightHtml.includes('Experience in Networking Technology'));
  assert.ok(!spotlightHtml.includes('Source:'));
  assert.ok(spotlightHtml.includes('/assets/aistudio/33b5e2c2-4b7a-46fe-abac-5b05af7fcf62_a05ea5b8.jpg'));
  const joeren=published.find(s=>s.id==='joeren-aguila')!;
  const joerenSpotlightHtml=renderToStaticMarkup(<MemoryRouter><AlumniStoryCard story={joeren} variant="spotlight"/></MemoryRouter>);
  assert.ok(joerenSpotlightHtml.includes('Mr. Joeren G. Aguila'));
  assert.ok(!joerenSpotlightHtml.includes('IINTESS Internal Vice President'));
  assert.ok(!joerenSpotlightHtml.includes('AY: 2026-2027'));
  assert.ok(joerenSpotlightHtml.includes('Internal Vice President, IINTESS 2026-2027'));
  assert.ok(joerenSpotlightHtml.includes('OIC Secretary, IINTESS - 2026'));
  assert.ok(joerenSpotlightHtml.includes('Assistant Secretary, IINTESS - 2025-2026'));
  assert.ok(joerenSpotlightHtml.includes('Committee Head on Environmental Protection Health and Sanitation, CICS-SC 2025-2027'));
  assert.ok(joerenSpotlightHtml.includes('Business Analytics'));
  assert.ok(joerenSpotlightHtml.includes('gem-category-BA'));
  assert.ok(joerenSpotlightHtml.includes('Technology will never stop evolving, so never stop learning.'));
  assert.ok(joerenSpotlightHtml.includes('/alumni/joeren-aguila'));
  assert.ok(joerenSpotlightHtml.includes('/assets/aistudio/26b9e082-f0ac-44ae-9e84-c041d76463c5_fb12221a.jpg'));
  const quoteOnly=publishedStories([{id:'quote-only',track:'BA',title:'Quote only',quote:'Data tells a story.',approvedFields:['displayName'],displayName:'Quote Contributor',publicationConsent:true,publicationStatus:'published',verificationStatus:'verified'}],now);
  assert.equal(quoteOnly.length,1);
  const quoteOnlyHtml=renderToStaticMarkup(<MemoryRouter><AlumniStoryCard story={quoteOnly[0]} variant="spotlight"/></MemoryRouter>);
  assert.ok(quoteOnlyHtml.includes('Data tells a story.'));
  assert.ok(!quoteOnlyHtml.includes('Open full story view'));
  for(const topic of ['experience','challenges','advice','skills','careerExperience','lessons'] as const){
    const iconHtml=renderToStaticMarkup(<StoryTopicIcon topic={topic}/>);
    assert.ok(iconHtml.includes('<svg')&&iconHtml.includes('community-topic-svg'));
  }
});
test('profile validates display name, lengths, avatar and optional fields',()=>{
  const valid={...profileValues(fresh()),name:'Learner',avatarStyle:'initials' as const};assert.deepEqual(validateProfile(valid),{});
  assert.ok(validateProfile({...valid,name:'   '}).name);assert.ok(validateProfile({...valid,biography:'x'.repeat(501)}).biography);
  assert.ok(validateProfile({...valid,avatarStyle:'invalid' as any}).avatarStyle);
});
test('additive migration preserves Stage 7 records, history, percentages, preferences and reflections',()=>{
  const state=fresh();state.name='Existing profile';state.trackProgress.NT=67;state.exploredTracks.NT=true;state.reflections.NT.interests='Keep this private reflection';state.preferences.luniEnabled=false;state.preferences.theme='dark';
  const earned=evaluateAchievements(state,{type:'track-explored',track:'NT'},'2026-11-03T09:00:00.000Z');
  const old=serializeStudent(earned) as any;delete old.profileSchemaVersion;delete old.moduleCompletions;delete old.section;delete old.biography;delete old.avatarStyle;delete old.explorationDates;
  const result=migrateStudentData(old,fresh());assert.equal(result.name,state.name);assert.equal(result.trackProgress.NT,67);assert.equal(result.reflections.NT.interests,state.reflections.NT.interests);assert.equal(result.preferences.luniEnabled,false);assert.equal(result.preferences.theme,'dark');assert.deepEqual(result.achievementRecords,earned.achievementRecords);assert.equal(result.avatarStyle,'neutral');assert.equal(result.moduleCompletions.length,0);
});
test('theme defaults to dark, upgrades legacy default light to dark, and preserves explicit light',()=>{
  assert.equal(fresh().preferences.theme,'dark');
  assert.equal(fresh().preferences.themeExplicit,false);
  const legacyLight=fresh();legacyLight.preferences.theme='light';delete legacyLight.preferences.themeExplicit;
  assert.equal(migrateStudentData(legacyLight,fresh()).preferences.theme,'dark');
  const invalidState=fresh();(invalidState.preferences as any).theme='unknown-theme';invalidState.preferences.themeExplicit=true;
  const migrated=migrateStudentData(invalidState,fresh());assert.equal(migrated.preferences.theme,'dark');
  const lightState=fresh();lightState.preferences.theme='light';lightState.preferences.themeExplicit=true;
  const preserved=migrateStudentData(lightState,fresh());
  assert.equal(preserved.preferences.theme,'light');
  assert.equal(preserved.preferences.themeExplicit,true);
});
test('module reading requires an available known module, is idempotent, and awards no activity gems',()=>{
  const initial=fresh();assert.deepEqual(completeLearningModule(initial,'BA','ba-mod-4'),initial);assert.deepEqual(completeLearningModule(initial,'NT','unknown'),initial);
  const result=completeLearningModule(initial,'NT','nt-mod-1');assert.equal(result.moduleCompletions.length,1);assert.equal(studentProgress(result).moduleCount,1);assert.equal(result.achievementRecords.length,0);assert.deepEqual(completeLearningModule(result,'NT','nt-mod-1'),result);
});
test('corrupt module, reflection, comparison and avatar fields normalize without awarding progress',()=>{
  const result=migrateStudentData({...serializeStudent(fresh()),moduleCompletions:[{track:'BA',moduleId:'ba-mod-4',completedAt:new Date(now).toISOString()}],reflections:{NT:{interests:null}},savedComparisons:[null,{id:'x',tracks:['NT','invalid','NT'],title:null}],avatarStyle:'missing'},fresh());
  assert.equal(result.moduleCompletions.length,0);assert.equal(result.reflections.NT.interests,'');assert.deepEqual(result.savedComparisons[0].tracks,['NT']);assert.equal(result.avatarStyle,'neutral');assert.equal(result.achievementRecords.length,0);
});
test('progress selectors use saved scores and records, exclude malformed attempts, and never unlock',()=>{
  const state=fresh();state.quizAttempts=[{id:'summary',date:'2026-11-03',attemptNumber:1,ntScore:70,baScore:90,smScore:50,totalAnswered:24,totalQuestions:24,durationMinutes:12}];
  const p=studentProgress(state);assert.equal(p.attempts.length,1);assert.equal(p.latest?.id,'summary');assert.equal(p.analysis?.highestTrack,'BA');assert.equal(p.analysis?.trackBreakdowns.BA.percentage,90);assert.equal(p.moduleCount,0);assert.equal(p.collection.unlocked,0);assert.equal(p.fullyAnswered,0);assert.deepEqual(state.achievementRecords,[]);
});
test('versioned export contains student and active quiz only, never unrelated keys or unknown root fields',()=>{
  const storage=new MemoryStorage();storage.setItem('other_app_token','secret');storage.setItem(`${STUDENT_STORAGE_KEY}_backup_123`,'old data');storage.setItem(QUIZ_SESSION_KEY,JSON.stringify({attemptId:'saved',attemptNumber:1,answers:{[QUIZ_QUESTIONS[0].id]:true,unknown:'secret'},credential:'secret'}));
  const state={...fresh(),unknownSecret:'secret'};const data=exportStudentData(state,storage,new Date(now).toISOString());const json=JSON.stringify(data);
  assert.equal(data.version,1);assert.equal(data.format,'ctrl-path-student-export');assert.equal(data.quizSession?.attemptId,'saved');assert.ok(!json.includes('secret'));assert.ok(!json.includes('backup'));assert.equal(storage.getItem('other_app_token'),'secret');
});
test('clear removes only intended student, quiz, backup and focus keys, retaining unrelated configuration',()=>{
  const local=new MemoryStorage();const session=new MemoryStorage();for(const key of [STUDENT_STORAGE_KEY,QUIZ_SESSION_KEY,`${STUDENT_STORAGE_KEY}_backup_123`,'other_app','ctrl_path_app_configuration'])local.setItem(key,'value');session.setItem('ctrl_quiz_focus_mode','true');session.setItem('other_session','value');
  const result=clearStudentData(local,session);assert.equal(result.ok,true);assert.deepEqual([...local.values.keys()],['other_app','ctrl_path_app_configuration']);assert.equal(session.getItem('other_session'),'value');assert.equal(session.getItem('ctrl_quiz_focus_mode'),null);
});
test('failed clear restores previous records; malformed active quiz export leaves storage untouched',()=>{
  const local=new MemoryStorage();local.setItem(STUDENT_STORAGE_KEY,'student');local.setItem(QUIZ_SESSION_KEY,'{broken');
  const remove=local.removeItem.bind(local);local.removeItem=(key:string)=>{if(key===QUIZ_SESSION_KEY)throw new Error('blocked');remove(key);};
  assert.equal(clearStudentData(local,new MemoryStorage()).ok,false);assert.equal(local.getItem(STUDENT_STORAGE_KEY),'student');assert.throws(()=>exportStudentData(fresh(),local),/could not be read/);assert.equal(local.getItem(QUIZ_SESSION_KEY),'{broken');
});
test('track exploration and gemstone achievements unlock only after completing both subjects in the track',()=>{
  const timestamp='2026-11-14T12:00:00.000Z';
  // NT: Subject 1 (14 modules) alone -> NOT explored, 0 achievements
  let ntState=fresh();
  const ntSubj1=TRACKS_DATA.NT.subjects![0].modules.filter(m=>m.status==='available');
  const ntSubj2=TRACKS_DATA.NT.subjects![1].modules.filter(m=>m.status==='available');
  for(const mod of ntSubj1) ntState=completeLearningModule(ntState,'NT',mod.id,timestamp);
  assert.equal(ntState.exploredTracks.NT,false);
  assert.equal(ntState.achievementRecords.length,0);
  assert.equal(areAllTrackSubjectsCompleted('NT',ntState.moduleCompletions),false);
  // NT: Subject 1 + first module of Subject 2 -> still NOT unlocked
  ntState=completeLearningModule(ntState,'NT',ntSubj2[0].id,timestamp);
  assert.equal(ntState.exploredTracks.NT,false);
  assert.equal(ntState.achievementRecords.length,0);
  // NT: Final module of Subject 2 -> explored + Peridot's Protocol (id: 1) unlocked
  ntState=completeLearningModule(ntState,'NT',ntSubj2[1].id,timestamp);
  assert.equal(ntState.exploredTracks.NT,true);
  assert.equal(ntState.trackProgress.NT,100);
  assert.equal(ntState.explorationDates.NT,timestamp);
  assert.deepEqual(ntState.unlockedGemstones,[1]);

  // BA: Subject 1 (3 available modules, ba-mod-4 is in_preparation) alone -> NOT unlocked
  let baState=fresh();
  const baSubj1=TRACKS_DATA.BA.subjects![0].modules.filter(m=>m.status==='available');
  const baSubj2=TRACKS_DATA.BA.subjects![1].modules.filter(m=>m.status==='available');
  for(const mod of baSubj1) baState=completeLearningModule(baState,'BA',mod.id,timestamp);
  assert.equal(baState.exploredTracks.BA,false);
  assert.equal(baState.achievementRecords.length,0);
  // BA: Complete Subject 2 available modules -> Garnet's Foresight (id: 6) unlocked
  for(const mod of baSubj2) baState=completeLearningModule(baState,'BA',mod.id,timestamp);
  assert.equal(baState.exploredTracks.BA,true);
  assert.equal(baState.trackProgress.BA,100);
  assert.deepEqual(baState.unlockedGemstones,[6]);

  // SM: Completing only Subject 2 -> NOT unlocked until Subject 1 is also done -> Pearl's Precision (id: 11)
  let smState=fresh();
  const smSubj1=TRACKS_DATA.SM.subjects![0].modules.filter(m=>m.status==='available');
  const smSubj2=TRACKS_DATA.SM.subjects![1].modules.filter(m=>m.status==='available');
  for(const mod of smSubj2) smState=completeLearningModule(smState,'SM',mod.id,timestamp);
  assert.equal(smState.exploredTracks.SM,false);
  assert.equal(smState.achievementRecords.length,0);
  for(const mod of smSubj1) smState=completeLearningModule(smState,'SM',mod.id,timestamp);
  assert.equal(smState.exploredTracks.SM,true);
  assert.equal(smState.trackProgress.SM,100);
  assert.deepEqual(smState.unlockedGemstones,[11]);
});
