import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ALUMNI_STORIES, ANNOUNCEMENTS } from '../src/data/communityData';
import type { AlumniStory, Announcement } from '../src/types/community';
import { publishedStories,filterStories,publishedAnnouncements,filterAnnouncements,displayDate,safeExternalLink } from '../src/utils/communitySelectors';
import { AlumniStoryCard,AnnouncementCard } from '../src/components/community/CommunityCards';
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
const notice:Announcement={id:'test-notice',title:'Synthetic notice',description:'Fixture description',content:'Fixture content',category:'Academic',source:'Test fixture',publicationStatus:'published',verificationStatus:'verified',publishedAt:'2026-11-03T10:00:00Z',pinned:false};
const fresh=()=>structuredClone(INITIAL_STATE);
class MemoryStorage implements Storage {
  values=new Map<string,string>();get length(){return this.values.size;}getItem(k:string){return this.values.get(k)??null;}setItem(k:string,v:string){this.values.set(k,v);}removeItem(k:string){this.values.delete(k);}key(i:number){return [...this.values.keys()][i]??null;}clear(){this.values.clear();}
}
test('production collections are honestly empty',()=>{assert.equal(ALUMNI_STORIES.length,0);assert.equal(ANNOUNCEMENTS.length,0);assert.deepEqual(publishedStories([]),[]);assert.deepEqual(publishedAnnouncements([]),[]);});
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
test('announcement publication excludes unverified, future, expired and invalid-expiry records',()=>{
  const records=publishedAnnouncements([notice,{...notice,id:'expired',expiresAt:'2026-11-04T09:00:00Z'},{...notice,id:'invalid-expiry',expiresAt:'bad'},{...notice,id:'future',publishedAt:'2027-01-01T00:00:00Z'},{...notice,id:'draft',publicationStatus:'draft'},{...notice,id:'unverified',verificationStatus:'unverified'}],now);
  assert.deepEqual(records.map(r=>r.id),['test-notice']);
});
test('pinned first, newest next; invalid dates and category/query combinations remain safe',()=>{
  const records=publishedAnnouncements([notice,{...notice,id:'invalid',publishedAt:'not a date'},{...notice,id:'newest',publishedAt:'2026-11-04T09:00:00Z',category:'Events'},{...notice,id:'pinned',pinned:true,publishedAt:'2026-10-01T00:00:00Z'}],now);
  assert.deepEqual(records.map(r=>r.id),['pinned','newest','test-notice','invalid']);
  assert.equal(filterAnnouncements(records,'Events','SYNTHETIC').length,1);assert.equal(filterAnnouncements(records,'General','missing').length,0);
  assert.equal(displayDate('bad'),'Date unavailable');assert.equal(displayDate(undefined),'Date unavailable');
});
test('external links reject executable/credentialed/invalid destinations',()=>{
  assert.equal(safeExternalLink('javascript:alert(1)'),undefined);assert.equal(safeExternalLink('https://user:password@example.test'),undefined);assert.equal(safeExternalLink('not a URL'),undefined);
  assert.equal(safeExternalLink('https://example.test/approved'),'https://example.test/approved');
});
test('actual cards render only public metadata and real detail navigation',()=>{
  const record=publishedStories([story],now)[0];const html=renderToStaticMarkup(<MemoryRouter><AlumniStoryCard story={record}/><AnnouncementCard announcement={notice}/></MemoryRouter>);
  assert.ok(html.includes('/alumni/test-story'));assert.ok(html.includes('/announcements/test-notice'));assert.ok(html.includes('Test Contributor'));assert.ok(!html.includes('Unapproved employer'));
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
