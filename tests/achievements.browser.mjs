import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Uses an installed Playwright; overrides support shared development runtimes.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const key = 'ctrl_path_student_data_v1';
const errors = [];
const checks = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
const check = name => { checks.push(name); console.log(`PASS ${name}`); };
const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
const goto = async route => { await page.goto(`${base}${route}`); await page.locator('main').waitFor(); };
const dialog = () => page.locator('dialog[open]');
async function closeCelebration(name) {
  await dialog().getByRole('heading', { name, exact: true }).waitFor();
  await dialog().getByRole('button', { name: 'Continue exploring' }).click();
  await dialog().waitFor({ state: 'detached' });
}
await mkdir('.test-artifacts', { recursive: true });
try {
  await goto('/achievements');
  await page.locator('.gem-card').last().waitFor();
  assert.equal(await page.locator('.gem-card').count(), 20);
  assert.equal((await saved()).achievementRecords.length, 0);
  await page.reload();
  assert.equal((await saved()).achievementRecords.length, 0);
  check('New student and repeated vault visits award nothing');
  const decoded = await page.locator('.gem-art').evaluateAll(images => Promise.all(images.map(async img => { img.loading='eager'; await img.decode(); return img.naturalWidth > 0; })));
  assert.equal(decoded.length,20); assert.ok(decoded.every(Boolean));
  check('All 20 original gemstone images decode in the browser');
  // Silence optional auto-tips in this isolated test profile, keeping Luni enabled.
  await page.evaluate(key => { const s=JSON.parse(localStorage.getItem(key)); s.preferences.luniAutoTips=false; localStorage.setItem(key,JSON.stringify(s)); }, key);
  await page.reload();

  for (const width of [1440,768,360]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({ path: `.test-artifacts/vault-${width}.png`, fullPage: true });
    await page.screenshot({ path: `.test-artifacts/vault-viewport-${width}.png` });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}`);
    const first = page.locator('.gem-card').first();
    await first.focus(); await page.keyboard.press('Enter');
    await dialog().waitFor();
    assert.equal(await dialog().getByRole('heading').innerText(), "Peridot's Protocol");
    assert.ok(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)));
    for (let i=0;i<5;i++) await page.keyboard.press('Tab');
    assert.ok(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)), 'Modal traps focus');
    assert.ok(await dialog().evaluate(el => el.getBoundingClientRect().width <= innerWidth - 20));
    await page.screenshot({ path: `.test-artifacts/vault-detail-${width}.png` });
    await page.keyboard.press('Escape');
    await dialog().waitFor({ state: 'detached' });
    assert.ok(await first.evaluate(el => el === document.activeElement), 'Focus returns to card');
  }
  check('360/768/1440 layouts, semantic cards, focus trap, Escape and focus restoration');
  await page.setViewportSize({ width:1440, height:1000 });
  await page.getByRole('button',{ name:'Networking Technology', exact:true }).click();
  assert.equal(await page.locator('.gem-card').count(),5);
  await page.getByLabel('Status', { exact:true }).selectOption('Unlocked');
  await page.getByRole('heading',{name:'No gemstones match these filters yet.'}).waitFor();
  await page.getByRole('button',{name:'View all achievements',exact:true}).click();
  await page.getByLabel('Sort by').selectOption('Name');
  const names = await page.locator('.gem-card-title').allTextContents();
  assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b)));
  await page.getByLabel('Sort by').selectOption('Rarity');
  assert.equal(await page.locator('.gem-card-title').first().textContent(),'Your Own Universe');
  check('Category/status filters, empty reset, name and rarity sorting');

  for (const [index,name] of [[0,"Peridot's Protocol"],[1,"Garnet's Foresight"],[2,"Pearl's Precision"]]) {
    await goto('/tracks');
    await page.getByRole('button',{name:'Explore Track',exact:true}).nth(index).click();
    await page.getByRole('button',{name:'Mark as Explored (+1 Gemstone)',exact:true}).click();
    await dialog().getByRole('heading',{name,exact:true}).waitFor();
    if (index===0) {
      await page.screenshot({path:'.test-artifacts/celebration.png'});
      await page.reload();
      assert.equal(await dialog().count(),0);
    } else await closeCelebration(name);
    assert.equal((await saved()).achievementRecords.length,index+1);
  }
  check('All three exploration integrations award once; shown celebration does not replay on refresh');
  await goto('/achievements');
  await page.getByLabel('Status',{exact:true}).selectOption('In Progress');
  assert.equal(await page.locator('.gem-card').count(),5);
  await page.getByLabel('Status',{exact:true}).selectOption('Unlocked');
  assert.equal(await page.locator('.gem-card').count(),3);
  check('Derived epic and collector progress; unlocked filter uses persisted records');

  await goto('/compare');
  assert.equal((await saved()).achievementRecords.length,3);
  assert.ok(await page.getByRole('button',{name:'Save Comparison',exact:true}).isDisabled());
  // Review two tracks, not the default three.
  await page.getByRole('button',{name:'SM Service Management',exact:true}).click();
  await page.getByLabel('I reviewed the curriculum, skills, and career differences for these tracks.').check();
  await page.getByRole('button',{name:'Save Comparison',exact:true}).click();
  await closeCelebration('Fusion Theory');
  assert.equal((await saved()).achievementRecords.length,4);
  assert.equal((await saved()).savedComparisons[0].tracks.length,2);
  check('Opening Compare grants nothing; reviewed two-track save awards Fusion Theory');

  // Complete an isolated quiz fixture through the actual Resume → Review → Submit UI.
  async function submitAttempt(number) {
    await page.evaluate(async number => {
      const { QUIZ_QUESTIONS: questions } = await import('/src/data/quiz/quizQuestions.ts');
      const answers=Object.fromEntries(questions.map(q=>[q.id,q.type==='true_false'||q.type==='multiple_choice'?q.correctAnswer:q.type==='matching'?Object.fromEntries(q.pairs.map(p=>[p.term,p.definition])):q.type==='sequencing'?q.steps:q.isEnumeration&&q.enumerationFields?q.enumerationFields.map(f=>f.acceptedAnswers[0]):q.acceptedAnswers[0]]));
      const shuffledQuestionsByLevel=Object.fromEntries([1,2,3,4,5].map(level=>[level,questions.filter(q=>q.level===level).map(q=>q.id)]));
      localStorage.setItem('ctrl_path_quiz_session_v1',JSON.stringify({attemptId:`browser-attempt-${number}`,attemptNumber:number,startedAt:new Date().toISOString(),currentLevel:5,currentQuestionIndex:0,shuffledQuestionsByLevel,answers,isCompleted:false,levelPrepSeen:{1:true,2:true,3:true,4:true,5:true}}));
    }, number);
    await goto('/quiz');
    // Existing quiz automatically resumes prepared sessions on mount.
    const resume = page.getByRole('button',{name:'Resume Saved Attempt'});
    if (await resume.isVisible()) await resume.click();
    await page.getByRole('button',{name:'Review All',exact:true}).click();
    await page.getByRole('button',{name:'Confirm & Submit Final Attempt'}).click();
  }
  await submitAttempt(1);
  await closeCelebration('First Spark');
  assert.equal((await saved()).achievementRecords.length,5);
  await submitAttempt(2);
  assert.equal((await saved()).achievementRecords.length,5);
  await goto('/results');
  assert.equal((await saved()).achievementRecords.length,5);
  await page.getByLabel('I reviewed the differences between these completed attempts.').check();
  await page.getByRole('button',{name:'Complete attempt comparison',exact:true}).click();
  await closeCelebration('Beyond the Surface');
  assert.equal((await saved()).achievementRecords.length,6);
  assert.equal((await saved()).quizAttempts.length,2);
  check('Quiz submission → First Spark; eligible retake + explicit result comparison → Beyond the Surface');

  await goto('/');
  await page.getByText('View All (6/20 · 30%)',{exact:true}).waitFor();
  await goto('/achievements');
  await page.getByText('6 of 20 gems collected · 30%',{exact:true}).waitFor();
  await page.reload();
  assert.equal((await saved()).achievementRecords.length,6);
  assert.equal(await dialog().count(),0);
  assert.ok((await saved()).achievementRecords.every(r=>r.celebrationAcknowledged && r.unlockedAt && r.eventRef));
  check('Dashboard and Vault agree; records, dates, event references and acknowledgements survive reload');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.gem-card').first().click();
  assert.equal(await dialog().evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.vault-floating-gem').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  check('System reduced-motion disables dialog and decorative animation');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(key => { const state=JSON.parse(localStorage.getItem(key)); state.preferences.reducedMotion=true; localStorage.setItem(key,JSON.stringify(state)); }, key);
  await page.reload(); await page.locator('.gem-card').first().click();
  assert.equal(await dialog().evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.keyboard.press('Escape');
  check('Stored reduced-motion preference also disables portal dialog animation');
  const touchContext = await browser.newContext({viewport:{width:360,height:800},hasTouch:true,isMobile:true});
  const touchPage = await touchContext.newPage(); await touchPage.goto(base+'/achievements');
  await touchPage.locator('.gem-card').first().tap();
  await touchPage.locator('dialog[open]').getByRole('heading',{name:"Peridot's Protocol"}).waitFor();
  await touchPage.locator('dialog[open]').getByRole('button',{name:'Close achievement dialog'}).tap();
  assert.equal(await touchPage.locator('dialog[open]').count(),0);
  await touchContext.close();
  check('Mobile touch emulation opens and dismisses achievement details');
  for (const route of ['/tracks','/quiz','/results','/compare','/alumni','/control-center','/achievements']) {
    await goto(route);
    await page.locator('main h1').waitFor();
    assert.ok((await page.locator('main').innerText()).length>100);
  }
  assert.deepEqual(errors,[]);
  check('Existing routes render without browser errors or failed local requests');
  await writeFile('.test-artifacts/browser-results.json',JSON.stringify({checks,errors},null,2));
} catch (error) {
  await page.screenshot({path:'.test-artifacts/browser-failure.png',fullPage:true});
  console.error((await page.locator('body').innerText()).slice(-4000));
  throw error;
} finally { await browser.close(); }
