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
import { validateProfile,profileValues,studentProgress,completeLearningModule,areAllTrackSubjectsCompleted,exportStudentData,clearStudentData,clampProgressPercent,QUIZ_SESSION_KEY } from '../src/utils/studentControls';
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
  assert.equal(published.length,6);
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
  const princess=published.find(s=>s.id==='princess-nissi-legazpi');
  assert.ok(princess);
  assert.equal(princess.track,'BA');
  assert.equal(princess.displayName,'Ms. Princess Nissi M. Legazpi');
  assert.equal(princess.profileImage,'/assets/aistudio/3b2d7111-6f82-49dd-adaf-1b17a1d08f71_e6d8bc04.jpg');
  assert.ok(princess.quote?.includes('Trust in the Lord with all thine heart'));
  assert.ok(princess.quote?.includes('Proverbs 3:5-6'));
  assert.ok(princess.experience?.includes('stepping stone ko para maging better'));
  assert.ok(princess.challenges?.includes('Naging sandigan ko ang Panginoon'));
  assert.ok(princess.advice?.includes('eagerness na makapagtapos ng pag-aaral'));
  const lancePria=published.find(s=>s.id==='lance-pria');
  assert.ok(lancePria);
  assert.equal(lancePria.track,'BA');
  assert.equal(lancePria.displayName,'Mr. Lance M. Pria');
  assert.equal(lancePria.currentRole,'IINTESS Secretary');
  assert.equal(lancePria.organization,'AY: 2026-2027');
  assert.equal(lancePria.positions?.length,5);
  assert.ok(lancePria.positions?.includes('IINTESS - Secretary (2026 - 2027)'));
  assert.ok(lancePria.positions?.includes('IINTESS - OIC 2nd Year rep (2026)'));
  assert.ok(lancePria.positions?.includes('CICS - SC - Procurement and Logistics Committee Member (2025 - 2026)'));
  assert.ok(lancePria.positions?.includes('OSO Student Assistant 2025 - 2026'));
  assert.ok(lancePria.positions?.includes('CICS Deans Office Student Assistant 2024 - 2025'));
  assert.equal(lancePria.profileImage,'/assets/aistudio/PRIA_LANCE_7ccd3e6b.png');
  assert.ok(lancePria.quote?.includes('Trust in BA!'));
  assert.ok(lancePria.experience?.includes('realm of insights'));
  assert.ok(!lancePria.experience?.includes('Using numbers, tracked inputs'));
  assert.ok(lancePria.challenges?.includes('solving legos'));
  assert.ok(lancePria.advice?.includes('gacha games'));
  assert.ok(!lancePria.advice?.includes('Trust in your abilities'));
  const crissele=published.find(s=>s.id==='crissele-deomampo');
  assert.ok(crissele);
  assert.equal(crissele.track,'SM');
  assert.equal(crissele.displayName,'Ms. Crissele H. Deomampo');
  assert.equal(crissele.currentRole,'IINTESS 3rd Year Representative');
  assert.equal(crissele.organization,'AY: 2026-2027');
  assert.deepEqual(crissele.positions,['3rd Year Representative IINTESS 2026 - 2027']);
  assert.equal(crissele.profileImage,'/assets/aistudio/060cbe6d-a3f6-4655-aebe-85a7625e7bef_796334ad.jpg');
  assert.ok(crissele.quote?.includes("Life isn't late"));
  assert.ok(crissele.experience?.includes('roller coaster ride'));
  assert.ok(crissele.advice?.includes('take time to bloom'));
  const eicer=published.find(s=>s.id==='eicer-magbanua');
  assert.ok(eicer);
  assert.equal(eicer.track,'BA');
  assert.equal(eicer.displayName,'Mr. Eicer Magbanua');
  assert.equal(eicer.currentRole,'IINTESS Finance Co-Head');
  assert.deepEqual(eicer.positions,[
    'Finance Co-Head, IINTESS (Current)',
    '4th Year Governor, JPCS (Current)',
    '3rd Year Representative, IINTESS (Former)',
  ]);
  assert.equal(eicer.profileImage,'/assets/aistudio/8677cc5f-cd39-4f84-b203-5344a138eb1d_d4731289.jpg');
  assert.equal(eicer.quote,"You're never too dumb about anything, you're just uninterested.");
  assert.ok(eicer.experience?.includes('database management'));
  assert.ok(eicer.challenges?.includes('complex datasets'));
  assert.ok(eicer.advice?.includes('appreciate the process'));
  assert.equal(filterStories(published,'BA','power bi').length,1);
  assert.equal(filterStories(published,'BA','proverbs').length,1);
  assert.equal(filterStories(published,'BA','lance pria').length,1);
  assert.equal(filterStories(published,'SM','crissele').length,1);
  assert.equal(filterStories(published,'BA','eicer magbanua').length,1);
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
  const princess=published.find(s=>s.id==='princess-nissi-legazpi')!;
  const princessSpotlightHtml=renderToStaticMarkup(<MemoryRouter><AlumniStoryCard story={princess} variant="spotlight"/></MemoryRouter>);
  assert.ok(princessSpotlightHtml.includes('Princess Nissi M. Legazpi'));
  assert.ok(princessSpotlightHtml.includes('Business Analytics'));
  assert.ok(princessSpotlightHtml.includes('Proverbs 3:5-6'));
  assert.ok(princessSpotlightHtml.includes('Auditor, IINTESS and CICS-SC 2026-2027'));
  assert.ok(princessSpotlightHtml.includes('3rd Year Governor, JPCS 2025-2026'));
  assert.ok(princessSpotlightHtml.includes('Auditor, CICS-SC and IINTESS 2025-2026'));
  assert.ok(princessSpotlightHtml.includes('2nd Year Representative, IINTESS 2024-2025'));
  assert.ok(princessSpotlightHtml.includes('/alumni/princess-nissi-legazpi'));
  assert.ok(princessSpotlightHtml.includes('/assets/aistudio/3b2d7111-6f82-49dd-adaf-1b17a1d08f71_e6d8bc04.jpg'));
  const lancePria=published.find(s=>s.id==='lance-pria')!;
  const lancePriaSpotlightHtml=renderToStaticMarkup(<MemoryRouter><AlumniStoryCard story={lancePria} variant="spotlight"/></MemoryRouter>);
  assert.ok(lancePriaSpotlightHtml.includes('Lance M. Pria'));
  assert.ok(lancePriaSpotlightHtml.includes('Business Analytics'));
  assert.ok(lancePriaSpotlightHtml.includes('Trust in BA!'));
  assert.ok(lancePriaSpotlightHtml.includes('IINTESS - Secretary (2026 - 2027)'));
  assert.ok(lancePriaSpotlightHtml.includes('IINTESS - OIC 2nd Year rep (2026)'));
  assert.ok(lancePriaSpotlightHtml.includes('CICS - SC - Procurement and Logistics Committee Member (2025 - 2026)'));
  assert.ok(lancePriaSpotlightHtml.includes('OSO Student Assistant 2025 - 2026'));
  assert.ok(lancePriaSpotlightHtml.includes('CICS Deans Office Student Assistant 2024 - 2025'));
  assert.ok(lancePriaSpotlightHtml.includes('/alumni/lance-pria'));
  assert.ok(lancePriaSpotlightHtml.includes('/assets/aistudio/PRIA_LANCE_7ccd3e6b.png'));
  const crissele=published.find(s=>s.id==='crissele-deomampo')!;
  const crisseleSpotlightHtml=renderToStaticMarkup(<MemoryRouter><AlumniStoryCard story={crissele} variant="spotlight"/></MemoryRouter>);
  assert.ok(crisseleSpotlightHtml.includes('Ms. Crissele H. Deomampo'));
  assert.ok(crisseleSpotlightHtml.includes('Service Management'));
  assert.ok(crisseleSpotlightHtml.includes("Life isn&#x27;t late"));
  assert.ok(crisseleSpotlightHtml.includes('3rd Year Representative IINTESS 2026 - 2027'));
  assert.ok(crisseleSpotlightHtml.includes('/alumni/crissele-deomampo'));
  assert.ok(crisseleSpotlightHtml.includes('/assets/aistudio/060cbe6d-a3f6-4655-aebe-85a7625e7bef_796334ad.jpg'));
  const eicer=published.find(s=>s.id==='eicer-magbanua')!;
  const eicerSpotlightHtml=renderToStaticMarkup(<MemoryRouter><AlumniStoryCard story={eicer} variant="spotlight"/></MemoryRouter>);
  assert.ok(eicerSpotlightHtml.includes('Mr. Eicer Magbanua'));
  assert.ok(eicerSpotlightHtml.includes('Business Analytics'));
  assert.ok(eicerSpotlightHtml.includes('Finance Co-Head, IINTESS (Current)'));
  assert.ok(eicerSpotlightHtml.includes('4th Year Governor, JPCS (Current)'));
  assert.ok(eicerSpotlightHtml.includes('3rd Year Representative, IINTESS (Former)'));
  assert.ok(eicerSpotlightHtml.includes("never too dumb about anything"));
  assert.ok(eicerSpotlightHtml.includes('/alumni/eicer-magbanua'));
  assert.ok(eicerSpotlightHtml.includes('/assets/aistudio/8677cc5f-cd39-4f84-b203-5344a138eb1d_d4731289.jpg'));
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
  const valid={...profileValues(fresh()),name:'Learner',avatarStyle:'sleepy-luni' as const};assert.deepEqual(validateProfile(valid),{});
  assert.ok(validateProfile({...valid,name:'   '}).name);assert.ok(validateProfile({...valid,biography:'x'.repeat(501)}).biography);
  assert.ok(validateProfile({...valid,avatarStyle:'invalid' as any}).avatarStyle);
});
test('additive migration preserves Stage 7 records, history, percentages, preferences and reflections',()=>{
  const state=fresh();state.name='Existing profile';state.trackProgress.NT=67;state.exploredTracks.NT=true;state.reflections.NT.interests='Keep this private reflection';state.preferences.luniEnabled=false;state.preferences.theme='dark';
  const earned=evaluateAchievements(state,{type:'track-explored',track:'NT'},'2026-11-03T09:00:00.000Z');
  const old=serializeStudent(earned) as any;delete old.profileSchemaVersion;delete old.moduleCompletions;delete old.section;delete old.biography;delete old.avatarStyle;delete old.explorationDates;
  const result=migrateStudentData(old,fresh());assert.equal(result.name,state.name);assert.equal(result.trackProgress.NT,67);assert.equal(result.reflections.NT.interests,state.reflections.NT.interests);assert.equal(result.preferences.luniEnabled,false);assert.equal(result.preferences.theme,'dark');assert.deepEqual(result.achievementRecords,earned.achievementRecords);assert.equal(result.avatarStyle,'wizard-cat');assert.equal(result.moduleCompletions.length,0);
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
test('module reading requires an available known module, is idempotent, and unlocks subject milestones only upon full subject completion',()=>{
  const initial=fresh();assert.deepEqual(completeLearningModule(initial,'BA','ba-mod-4'),initial);assert.deepEqual(completeLearningModule(initial,'NT','unknown'),initial);
  const result=completeLearningModule(initial,'NT','nt-mod-1');assert.equal(result.moduleCompletions.length,1);assert.equal(studentProgress(result).moduleCount,1);assert.equal(result.achievementRecords.length,0);assert.deepEqual(completeLearningModule(result,'NT','nt-mod-1'),result);
});
test('corrupt module, reflection, comparison and avatar fields normalize without awarding progress',()=>{
  const result=migrateStudentData({...serializeStudent(fresh()),moduleCompletions:[{track:'BA',moduleId:'ba-mod-4',completedAt:new Date(now).toISOString()}],reflections:{NT:{interests:null}},savedComparisons:[null,{id:'x',tracks:['NT','invalid','NT'],title:null}],avatarStyle:'missing'},fresh());
  assert.equal(result.moduleCompletions.length,0);assert.equal(result.reflections.NT.interests,'');assert.deepEqual(result.savedComparisons[0].tracks,['NT']);assert.equal(result.avatarStyle,'wizard-cat');assert.equal(result.achievementRecords.length,0);
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
test('track exploration and gemstone achievements unlock accurately per subject and per completed track',()=>{
  const timestamp='2026-11-14T12:00:00.000Z';
  // NT: Subject 1 (14 modules) -> NOT track-explored yet, unlocks Packet Pathfinder (id: 2)
  let ntState=fresh();
  const ntSubj1=TRACKS_DATA.NT.subjects![0].modules.filter(m=>m.status==='available');
  const ntSubj2=TRACKS_DATA.NT.subjects![1].modules.filter(m=>m.status==='available');
  for(const mod of ntSubj1) ntState=completeLearningModule(ntState,'NT',mod.id,timestamp);
  assert.equal(ntState.exploredTracks.NT,false);
  assert.deepEqual(ntState.unlockedGemstones,[2]);
  assert.equal(areAllTrackSubjectsCompleted('NT',ntState.moduleCompletions),false);
  // NT: Subject 1 + first module of Subject 2 -> still only Packet Pathfinder
  ntState=completeLearningModule(ntState,'NT',ntSubj2[0].id,timestamp);
  assert.equal(ntState.exploredTracks.NT,false);
  assert.deepEqual(ntState.unlockedGemstones,[2]);
  // NT: Final module of Subject 2 -> explored + Sapphire's Protocol (1), Packet Pathfinder (2), Signal Keeper (3)
  ntState=completeLearningModule(ntState,'NT',ntSubj2[1].id,timestamp);
  assert.equal(ntState.exploredTracks.NT,true);
  assert.equal(ntState.trackProgress.NT,100);
  assert.equal(ntState.explorationDates.NT,timestamp);
  assert.deepEqual(ntState.unlockedGemstones,[1,2,3]);

  // BA: Subject 1 (available modules) -> unlocks Amethyst's Foresight (id: 6), NOT explored
  let baState=fresh();
  const baSubj1=TRACKS_DATA.BA.subjects![0].modules.filter(m=>m.status==='available');
  const baSubj2=TRACKS_DATA.BA.subjects![1].modules.filter(m=>m.status==='available');
  for(const mod of baSubj1) baState=completeLearningModule(baState,'BA',mod.id,timestamp);
  assert.equal(baState.exploredTracks.BA,false);
  assert.deepEqual(baState.unlockedGemstones,[6]);
  // BA: Complete Subject 2 available modules -> unlocks Pattern Seeker (7) and Data Detective (8)
  for(const mod of baSubj2) baState=completeLearningModule(baState,'BA',mod.id,timestamp);
  assert.equal(baState.exploredTracks.BA,true);
  assert.equal(baState.trackProgress.BA,100);
  assert.deepEqual(baState.unlockedGemstones,[6,7,8]);

  // SM: Completing Subject 2 -> Customer Champion (12); completing Subject 1 -> Emerald's Precision (11) & Workflow Weaver (13)
  let smState=fresh();
  const smSubj1=TRACKS_DATA.SM.subjects![0].modules.filter(m=>m.status==='available');
  const smSubj2=TRACKS_DATA.SM.subjects![1].modules.filter(m=>m.status==='available');
  for(const mod of smSubj2) smState=completeLearningModule(smState,'SM',mod.id,timestamp);
  assert.equal(smState.exploredTracks.SM,false);
  assert.deepEqual(smState.unlockedGemstones,[12]);
  for(const mod of smSubj1) smState=completeLearningModule(smState,'SM',mod.id,timestamp);
  assert.equal(smState.exploredTracks.SM,true);
  assert.equal(smState.trackProgress.SM,100);
  assert.deepEqual(smState.unlockedGemstones,[11,12,13]);
});

test('clampProgressPercent keeps bar percentage exact for 0, small positive values (1-3%), and bounds 0..100',()=>{
  assert.equal(clampProgressPercent(0),0);
  assert.equal(clampProgressPercent(1),1);
  assert.equal(clampProgressPercent(2),2);
  assert.equal(clampProgressPercent(3),3);
  assert.equal(clampProgressPercent(42),42);
  assert.equal(clampProgressPercent(100),100);
  assert.equal(clampProgressPercent(-5),0);
  assert.equal(clampProgressPercent(125),100);
  assert.equal(clampProgressPercent(Number.NaN),0);
});

