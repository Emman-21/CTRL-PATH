import assert from 'node:assert/strict';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const base=process.env.TEST_BASE_URL||'http://localhost:3000';
const key='ctrl_path_student_data_v1';
const checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
const check=name=>{checks.push(name);console.log(`PASS ${name}`);};
const goto=async path=>{await page.goto(base+path);await page.locator('main h1').waitFor();};
const saved=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
const tab=name=>page.getByRole('tab',{name,exact:true});
const dialog=()=>page.locator('dialog[open]');
await mkdir('.test-artifacts',{recursive:true});
try {
  await goto('/alumni');
  await page.getByRole('heading',{name:'Alumni stories are coming soon'}).waitFor();
  await page.getByLabel('Alumni track',{exact:true}).selectOption('NT');
  await page.getByLabel('Search alumni stories').fill('missing');
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();
  assert.equal(await page.getByLabel('Alumni track',{exact:true}).inputValue(),'All');
  assert.equal(await page.getByLabel('Search alumni stories').inputValue(),'');
  await goto('/alumni/unknown');await page.getByRole('heading',{name:'Story unavailable'}).waitFor();
  await page.getByRole('link',{name:'Back to Alumni Stories'}).click();
  await goto('/announcements');await page.getByRole('heading',{name:'No published announcements yet'}).waitFor();
  await page.getByLabel('Announcement category').selectOption('Events');await page.getByLabel('Search announcements').fill('missing');
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();
  assert.equal(await page.getByLabel('Announcement category').inputValue(),'All');
  await goto('/announcements/unknown');await page.getByRole('heading',{name:'Announcement unavailable'}).waitFor();
  await goto('/');await page.getByRole('heading',{name:'Recent Announcements'}).waitFor();
  await page.getByRole('link',{name:'View all announcements'}).click();await page.getByRole('heading',{name:'The Luminary Bulletin'}).waitFor();
  check('Honest empty collections, combined filters/reset, invalid IDs, Dashboard shared bulletin and navigation');

  await goto('/control-center');await page.getByRole('button',{name:'Edit profile',exact:true}).click();
  await page.getByLabel('Display name',{exact:true}).fill('');await page.getByRole('button',{name:'Save profile'}).click();
  await page.getByText('Enter a display name.',{exact:true}).waitFor();
  const longName='Learner With A Long Display Name For Responsive Checks';
  await page.getByLabel('Display name',{exact:true}).fill(longName);await page.getByLabel('Program (optional)',{exact:true}).fill('BS Information Technology');
  await page.getByLabel('Section (optional)',{exact:true}).fill('First year section');
  await page.getByLabel('Short biography (optional)',{exact:true}).fill('Private interests saved in this browser.');
  await page.getByRole('radio',{name:'Your initials'}).check();await page.getByRole('button',{name:'Save profile'}).click();
  await page.getByRole('button',{name:'Edit profile',exact:true}).waitFor();await page.reload();
  assert.equal((await saved()).name,longName);assert.equal((await saved()).avatarStyle,'initials');
  assert.equal((await saved()).achievementRecords.length,0);
  check('Required profile validation, optional fields, avatar, save/reload and no accidental achievement awards');

  await page.getByRole('button',{name:'Edit profile',exact:true}).click();await page.getByLabel('Display name',{exact:true}).fill('Unsaved draft');
  await tab('Settings').click();await dialog().waitFor();await dialog().getByRole('button',{name:'Keep editing',exact:true}).click();
  assert.equal(await page.getByLabel('Display name',{exact:true}).inputValue(),'Unsaved draft');
  await page.locator('a[href="/"]').first().click();await dialog().waitFor();await page.keyboard.press('Escape');await dialog().waitFor({state:'detached'});
  assert.ok(page.url().includes('/control-center'));
  await page.getByRole('button',{name:'Cancel editing'}).click();await dialog().getByRole('button',{name:'Discard changes',exact:true}).click();
  assert.equal((await saved()).name,longName);
  await tab('Profile').focus();await page.keyboard.press('ArrowDown');assert.equal(await tab('Journey').evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Enter');
  await page.getByRole('heading',{name:'Your academic journey'}).waitFor();
  check('Unsaved profile protection for section changes, router navigation, cancel, Escape and keyboard tabs');

  await tab('Profile').click();await page.getByRole('button',{name:'Edit profile',exact:true}).click();
  await page.getByLabel('Display name',{exact:true}).fill('Failed write draft');
  await page.evaluate(key=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key)throw new Error('Test quota');return window.originalSet.call(this,k,v);};},key);
  await page.getByRole('button',{name:'Save profile'}).click();await page.getByText(/Could not save in this browser/).waitFor();
  assert.equal((await saved()).name,longName);await page.evaluate(()=>{Storage.prototype.setItem=window.originalSet;});
  await page.getByRole('button',{name:'Cancel editing'}).click();await dialog().getByRole('button',{name:'Discard changes',exact:true}).click();
  check('Failed profile persistence reports error and retains saved data and editable draft');

  // Synthetic, isolated browser fixture; never included in production data.
  await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.exploredTracks.NT=true;s.trackProgress.NT=65;s.moduleCompletions=[{track:'NT',moduleId:'nt-mod-1',completedAt:'2026-01-01T10:00:00.000Z'}];s.achievementRecords=[{id:'nt-peridots-protocol',unlockedAt:'2026-01-01T10:00:00.000Z',eventRef:'fixture',celebrationAcknowledged:true}];s.savedComparisons=[{id:'fixture-comparison',tracks:['NT','BA'],title:'Saved comparison fixture',date:'2026-01-01'}];s.reflections.BA.interests='Preserve other track';s.quizAttempts=[{id:'legacy-attempt',attemptNumber:1,date:'2026-01-01',ntScore:60,baScore:85,smScore:40,totalAnswered:24,totalQuestions:24,durationMinutes:12}];s.preferences.luniAutoTips=false;localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('unrelated_app','keep');localStorage.setItem('ctrl_path_app_configuration','keep');},key);
  await goto('/control-center?section=journey');await page.getByText('1 recorded module readings',{exact:true}).waitFor();
  assert.ok((await page.locator('.control-metrics').innerText()).includes('1/3'));
  await tab('Assessments').click();await page.getByText('BA: 85%',{exact:true}).waitFor();await page.getByText('Total score: Not available from this record',{exact:true}).waitFor();
  await page.getByRole('link',{name:'View results for attempt 1'}).click();assert.ok(page.url().includes('attempt=legacy-attempt'));
  await goto('/control-center?section=comparisons');await page.getByRole('link',{name:'Open comparison',exact:true}).click();assert.ok(page.url().includes('saved=fixture-comparison'));
  await goto('/control-center?section=reflections');await page.getByLabel('What interests you?',{exact:true}).fill('My private NT reflection');await page.getByRole('button',{name:'Save reflection'}).click();
  assert.equal((await saved()).reflections.NT.interests,'My private NT reflection');assert.equal((await saved()).reflections.BA.interests,'Preserve other track');
  await page.getByLabel('What interests you?',{exact:true}).fill('Unsaved reflection');await page.getByLabel('Reflection track').selectOption('BA');
  await dialog().getByRole('button',{name:'Keep editing',exact:true}).click();assert.equal(await page.getByLabel('Reflection track').inputValue(),'NT');
  await page.getByRole('button',{name:'Cancel changes'}).click();await dialog().getByRole('button',{name:'Discard changes',exact:true}).click();
  await page.reload();assert.equal(await page.getByLabel('What interests you?',{exact:true}).inputValue(),'My private NT reflection');
  assert.equal((await saved()).achievementRecords.length,1);
  check('Actual saved progress/history, honest legacy totals, deep results/comparison links, private reflections and no awards on view');

  await tab('Settings').click();
  await page.getByRole('checkbox',{name:/Reduced motion/}).check();await page.getByRole('checkbox',{name:/Higher contrast/}).check();await page.getByLabel('Text size',{exact:true}).selectOption('large');
  await page.getByRole('checkbox',{name:/Show Luni assistant/}).uncheck();await page.getByRole('checkbox',{name:/Achievement celebrations/}).uncheck();
  await page.reload();await tab('Settings').click();
  assert.equal(await page.locator('html').getAttribute('data-reduced-motion'),'true');assert.equal(await page.locator('html').getAttribute('data-high-contrast'),'true');assert.equal(await page.locator('html').getAttribute('data-text-size'),'large');
  assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).fontSize),'20px');
  assert.equal((await saved()).preferences.luniEnabled,false);
  await goto('/tracks?track=BA');await page.getByRole('button',{name:'Mark as Explored (+1 Gemstone)',exact:true}).click();
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).achievementRecords.length===2,key);
  assert.equal(await dialog().count(),0);assert.ok((await saved()).achievementRecords.every(r=>r.celebrationAcknowledged));
  check('Appearance/accessibility and Luni preferences persist; disabled celebrations retain earned gems without popups');

  for(const width of [1440,768,360]){
    await page.setViewportSize({width,height:1000});
    for(const [route,name] of [['/alumni','alumni'],['/announcements','announcements'],['/control-center','control']]){
      await goto(route);await page.screenshot({path:`.test-artifacts/stage8-${name}-${width}.png`,fullPage:true});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} no overflow at ${width}`);
    }
    for(const section of ['Journey','Assessments','Collection','Comparisons','Reflections','Settings','Privacy']){await tab(section).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${section} no overflow at ${width}`);}
    await page.getByRole('button',{name:'Clear my local data',exact:true}).click();await dialog().waitFor();
    assert.ok(await dialog().evaluate(el=>el.getBoundingClientRect().width<=innerWidth-20));
    for(let i=0;i<6;i++)await page.keyboard.press('Tab');assert.ok(await dialog().evaluate(el=>el.contains(document.activeElement)));
    await page.keyboard.press('Escape');await dialog().waitFor({state:'detached'});
    assert.ok(await page.getByRole('button',{name:'Clear my local data',exact:true}).evaluate(el=>el===document.activeElement));
  }
  check('All three pages and all Control Center panels fit 360/768/1440, large text, long profile; clear dialog traps/restores focus');

  await page.setViewportSize({width:1440,height:1000});await goto('/control-center?section=privacy');
  await page.evaluate(key=>{localStorage.setItem(`${key}_backup_123`,'backup');sessionStorage.setItem('ctrl_quiz_focus_mode','true');sessionStorage.setItem('unrelated_session','keep');},key);
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export my data'}).click();const download=await downloadPromise;await download.saveAs('.test-artifacts/stage8-export.json');
  const exported=JSON.parse(await readFile('.test-artifacts/stage8-export.json','utf8'));assert.equal(exported.version,1);assert.equal(exported.student.name,longName);assert.equal(exported.student.reflections.NT.interests,'My private NT reflection');assert.ok(!JSON.stringify(exported).includes('unrelated_app'));
  await page.getByRole('button',{name:'Clear my local data',exact:true}).click();await dialog().getByRole('button',{name:'Cancel',exact:true}).click();assert.equal((await saved()).name,longName);
  await page.getByRole('button',{name:'Clear my local data',exact:true}).click();await dialog().getByRole('button',{name:'Permanently clear CTRL+PATH data',exact:true}).click();
  await page.getByText('Your local CTRL+PATH data has been cleared.',{exact:true}).waitFor();
  const cleared=await saved();assert.equal(cleared.quizAttempts.length,0);assert.equal(cleared.achievementRecords.length,0);assert.equal(cleared.reflections.NT.interests,'');assert.equal(cleared.name,'Your Display Name');
  assert.deepEqual(await page.evaluate(key=>[localStorage.getItem('unrelated_app'),localStorage.getItem('ctrl_path_app_configuration'),localStorage.getItem(`${key}_backup_123`),sessionStorage.getItem('ctrl_quiz_focus_mode'),sessionStorage.getItem('unrelated_session')],key),['keep','keep',null,null,'keep']);
  check('Real JSON download, cancel preservation, explicitly confirmed scoped clear and unrelated storage retained');
  // Replace only this isolated browser's development data module with synthetic
  // fixtures. No production record or persisted student profile is modified.
  const contentContext=await browser.newContext();const contentPage=await contentContext.newPage();
  contentPage.on('pageerror',e=>errors.push(e.message));
  const story={id:'synthetic-story',track:'NT',title:'Synthetic approved story',excerpt:'Browser test excerpt',experience:'Browser test experience',source:'Automated test fixture',approvedFields:['displayName'],displayName:'Test contributor',organization:'Hidden private organization',publicationConsent:true,publicationStatus:'published',verificationStatus:'verified',keywords:['routing'],featured:true};
  const notice={id:'synthetic-notice',title:'Synthetic approved notice',description:'Browser test notice',content:'Browser test announcement body',category:'Academic',source:'Automated test fixture',publicationStatus:'published',verificationStatus:'verified',publishedAt:'2020-01-02T00:00:00Z',pinned:false,externalLink:'https://example.test/source'};
  await contentPage.route('**/src/data/communityData.ts*',route=>route.fulfill({contentType:'application/javascript',body:`export const ALUMNI_STORIES=${JSON.stringify([story,{...story,id:'related-story',title:'Related synthetic story',featured:false},{...story,id:'draft-story',title:'Hidden draft',publicationStatus:'draft'}])};export const ANNOUNCEMENTS=${JSON.stringify([notice,{...notice,id:'pinned-notice',title:'Pinned synthetic notice',category:'Events',pinned:true,publishedAt:'2020-01-01T00:00:00Z'},{...notice,id:'expired-notice',title:'Hidden expired notice',expiresAt:'2020-01-03T00:00:00Z'}])};let first=true;export const communityRepository={stories:async()=>{if(first){first=false;throw new Error('Test failure');}return ALUMNI_STORIES;},announcements:async()=>ANNOUNCEMENTS};`}));
  await contentPage.goto(base+'/alumni');await contentPage.getByRole('heading',{name:'Stories are temporarily unavailable'}).waitFor();await contentPage.getByRole('button',{name:'Try again'}).click();
  await contentPage.getByRole('heading',{name:'Synthetic approved story',exact:true}).waitFor();assert.equal(await contentPage.getByText('Hidden draft',{exact:true}).count(),0);
  await contentPage.getByLabel('Alumni track',{exact:true}).selectOption('BA');await contentPage.getByRole('heading',{name:'No stories match your search'}).waitFor();
  await contentPage.getByRole('button',{name:'Show all stories'}).click();await contentPage.getByLabel('Search alumni stories').fill('ROUTING');
  assert.equal(await contentPage.locator('.community-card').count(),2);await contentPage.getByRole('heading',{name:'Synthetic approved story',exact:true}).getByRole('link').click();
  await contentPage.getByRole('heading',{name:'Journey overview'}).waitFor();await contentPage.getByText('Browser test experience',{exact:true}).waitFor();assert.equal(await contentPage.getByText('Hidden private organization',{exact:true}).count(),0);
  await contentPage.getByRole('heading',{name:'More journeys from this track'}).waitFor();
  await contentPage.getByRole('link',{name:'Open announcements',exact:true}).click();await contentPage.getByRole('heading',{name:'The Luminary Bulletin'}).waitFor();
  assert.deepEqual(await contentPage.locator('.community-card h3').allTextContents(),['Pinned synthetic notice','Synthetic approved notice']);
  await contentPage.getByLabel('Announcement category').selectOption('Academic');await contentPage.getByLabel('Search announcements').fill('APPROVED');assert.equal(await contentPage.locator('.community-card').count(),1);
  await contentPage.getByRole('heading',{name:'Synthetic approved notice',exact:true}).getByRole('link').click();await contentPage.getByText('Browser test announcement body',{exact:true}).waitFor();
  const source=contentPage.getByRole('link',{name:/Visit source/});assert.equal(await source.getAttribute('href'),'https://example.test/source');assert.equal(await source.getAttribute('rel'),'noopener noreferrer');
  await contentPage.locator('a[href="/"]').first().click();await contentPage.getByRole('heading',{name:'Recent Announcements'}).waitFor();assert.deepEqual(await contentPage.locator('.community-preview-grid h3').allTextContents(),['Pinned synthetic notice','Synthetic approved notice']);
  await contentContext.close();check('Isolated synthetic publication fixtures: load-error retry, approval/redaction, populated filters/details, related stories, expiry/pinning and identical Dashboard preview');
  assert.deepEqual(errors,[]);check('No uncaught browser errors');
  await writeFile('.test-artifacts/stage8-browser-results.json',JSON.stringify({checks,errors},null,2));
} catch(error){await page.screenshot({path:'.test-artifacts/stage8-failure.png',fullPage:true});console.error(error);process.exitCode=1;}
finally{await browser.close();}
