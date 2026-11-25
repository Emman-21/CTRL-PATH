import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import {
  COMPARE_TOPICS,
  DEFAULT_COMPARE_TOPIC,
  getNextCompareTopicIndex,
  isCompareTopicId,
} from '../src/data/compareTopics';
import { CompareMatrixBox } from '../src/components/compare/CompareMatrixBox';
import { QuizLevelCompletion } from '../src/components/quiz/QuizLevelCompletion';
import { StudentProvider } from '../src/context/StudentContext';
import { TRACKS_DATA } from '../src/data/tracks';

test('COMPARE_TOPICS maintains required order and pure keyboard/topic helpers work across boundaries', () => {
  assert.deepEqual(
    COMPARE_TOPICS.map((t) => t.label),
    [
      'Key Curriculum Subjects',
      'Technical Skills & Tools',
      'Real-World Hands-on Project',
      'Sample Career Pathways',
      'Work Environment & Dynamics',
      'Best Fit For Students Who...',
      'My Reflection',
    ],
  );
  assert.equal(DEFAULT_COMPARE_TOPIC, 'subjects');
  assert.equal(isCompareTopicId('project'), true);
  assert.equal(isCompareTopicId('reflection'), true);
  assert.equal(isCompareTopicId('unknown'), false);

  assert.equal(getNextCompareTopicIndex(0, 'ArrowDown', 7), 1);
  assert.equal(getNextCompareTopicIndex(6, 'ArrowRight', 7), 0);
  assert.equal(getNextCompareTopicIndex(0, 'ArrowUp', 7), 6);
  assert.equal(getNextCompareTopicIndex(2, 'ArrowLeft', 7), 1);
  assert.equal(getNextCompareTopicIndex(3, 'Home', 7), 0);
  assert.equal(getNextCompareTopicIndex(1, 'End', 7), 6);
  assert.equal(getNextCompareTopicIndex(1, 'Enter', 7), null);
});

test('CompareMatrixBox renders single bordered box, topic rail with aria-pressed, track header blocks, Explore buttons, and print expansion', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['NT', 'BA', 'SM']}
        selectedTopic="subjects"
        onSelectTopic={() => {}}
        getTrackScore={(code) => (code === 'BA' ? 88 : null)}
      />
    </MemoryRouter>,
  );

  // Single bordered box and sticky mobile / left desktop topic rail
  assert.ok(html.includes('data-testid="compare-matrix-box"'));
  assert.ok(html.includes('sticky top-16 z-20 md:static'));
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('aria-pressed="false"'));
  assert.ok(html.includes('md:grid-cols-3'));
  assert.ok(html.includes('uppercase tracking-wider'));

  // Reuses existing track headers, illustration, quiz alignment, Explore buttons, and real track data
  assert.ok(html.includes(TRACKS_DATA.NT.name));
  assert.ok(html.includes(TRACKS_DATA.BA.tagline));
  assert.ok(html.includes('88%'));
  assert.ok(html.includes('Not Taken'));
  assert.ok(html.includes(TRACKS_DATA.NT.keySubjects[0].replace(/&/g, '&amp;')));
  assert.ok(html.includes(TRACKS_DATA.BA.keySubjects[0].replace(/&/g, '&amp;')));
  assert.ok(html.includes('Explore NT Modules'));
  assert.ok(html.includes('Explore BA Modules'));
  assert.ok(html.includes('Explore SM Modules'));

  // Redundant per-column h4 headings are hidden on screen and restored on print
  assert.ok(html.includes('hidden print:flex text-xs font-extrabold uppercase tracking-wider'));
  assert.ok(html.includes('block animate-in fade-in duration-150'));
  assert.ok(html.includes('hidden print:block'));
  assert.ok(html.includes(TRACKS_DATA.BA.realWorldApplications[0].title));
});

test('CompareMatrixBox reflows to 2 equal columns, keeps Explore buttons across topics, and renders My Reflection topic', () => {
  const projectHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['BA', 'SM']}
        selectedTopic="project"
        onSelectTopic={() => {}}
        getTrackScore={() => 75}
      />
    </MemoryRouter>,
  );

  assert.ok(projectHtml.includes('md:grid-cols-2'));
  assert.ok(!projectHtml.includes('data-testid="compare-column-NT"'));
  assert.ok(projectHtml.includes('data-testid="compare-column-BA"'));
  assert.ok(projectHtml.includes('data-testid="compare-column-SM"'));
  assert.ok(projectHtml.includes(TRACKS_DATA.BA.realWorldApplications[0].title));
  assert.ok(projectHtml.includes(TRACKS_DATA.SM.realWorldApplications[0].title));
  assert.ok(projectHtml.includes('Explore BA Modules'));
  assert.ok(projectHtml.includes('Explore SM Modules'));

  const reflectionHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['NT', 'BA']}
        selectedTopic="reflection"
        onSelectTopic={() => {}}
        getTrackScore={() => 75}
        reflectionInputs={{
          NT: { interests: 'Routing', topicsToLearn: 'BGP', questions: 'Labs?' },
          BA: { interests: 'SQL', topicsToLearn: 'Python', questions: '' },
          SM: { interests: '', topicsToLearn: '', questions: '' },
        }}
        savedReflectionSuccess="NT"
      />
    </MemoryRouter>,
  );

  assert.ok(reflectionHtml.includes('My Reflection: NT'));
  assert.ok(reflectionHtml.includes('My Reflection: BA'));
  assert.ok(reflectionHtml.includes('Save NT Reflection'));
  assert.ok(reflectionHtml.includes('Explore NT Modules'));
  assert.ok(reflectionHtml.includes('Explore BA Modules'));
});

test('CompareMatrixBox preserves per-track top accent borders over divide-slate-* in dark and light mode', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['NT', 'BA', 'SM']}
        selectedTopic="subjects"
        onSelectTopic={() => {}}
        getTrackScore={() => null}
      />
    </MemoryRouter>,
  );

  assert.ok(html.includes('border-t-3! border-t-blue-500! dark:border-t-blue-400!'));
  assert.ok(html.includes('border-t-3! border-t-violet-500! dark:border-t-violet-400!'));
  assert.ok(html.includes('border-t-3! border-t-emerald-500! dark:border-t-emerald-400!'));
  const columnsStart = html.indexOf('data-testid="compare-track-columns"');
  const firstColStart = html.indexOf('data-testid="compare-column-NT"');
  const columnsClassChunk = html.slice(columnsStart, firstColStart);
  assert.ok(columnsClassChunk.includes('dark:divide-slate-800 '));
  assert.ok(!columnsClassChunk.includes('dark:divide-slate-800!'));

  assert.ok(html.includes('text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'));
  assert.ok(html.includes('text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300'));
  assert.ok(html.includes('text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300'));

  assert.ok(!html.includes(TRACKS_DATA.NT.introAchievement.gemstoneUrl));
  assert.ok(!html.includes(TRACKS_DATA.BA.introAchievement.gemstoneUrl));
  assert.ok(!html.includes(TRACKS_DATA.SM.introAchievement.gemstoneUrl));
});

test('CompareMatrixBox surfaces rich info across curriculum, skills, projects, careers, work style, and best-fit topics', () => {
  const subjectsHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['NT', 'BA', 'SM']}
        selectedTopic="subjects"
        onSelectTopic={() => {}}
        getTrackScore={() => null}
      />
    </MemoryRouter>,
  );
  assert.ok(subjectsHtml.includes('NTT 401: Computer Networking 3'));
  assert.ok(subjectsHtml.includes('BAT 401: Fundamentals of Business Analytics'));
  assert.ok(subjectsHtml.includes('SMT 401: Fundamentals of Business Process Outsourcing 101'));

  const skillsHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['NT', 'BA']}
        selectedTopic="skills"
        onSelectTopic={() => {}}
        getTrackScore={() => null}
      />
    </MemoryRouter>,
  );
  assert.ok(skillsHtml.includes('Network Modeling &amp; Device Configuration'));
  assert.ok(skillsHtml.includes('+2 more competency domains covered in Track Explorer'));

  const projectHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['NT', 'BA']}
        selectedTopic="project"
        onSelectTopic={() => {}}
        getTrackScore={() => null}
      />
    </MemoryRouter>,
  );
  assert.ok(projectHtml.includes('Additional Applied Scenarios'));
  assert.ok(projectHtml.includes(TRACKS_DATA.NT.realWorldApplications[1].title));

  const careersHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['NT', 'SM']}
        selectedTopic="careers"
        onSelectTopic={() => {}}
        getTrackScore={() => null}
      />
    </MemoryRouter>,
  );
  assert.ok(careersHtml.includes('Est. Salary:'));
  assert.ok(careersHtml.includes('+3 more career roles in Track Explorer'));

  const workStyleHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['BA', 'SM']}
        selectedTopic="workStyle"
        onSelectTopic={() => {}}
        getTrackScore={() => null}
      />
    </MemoryRouter>,
  );
  assert.ok(workStyleHtml.includes('Primary Focus'));
  assert.ok(workStyleHtml.includes(TRACKS_DATA.BA.focus));

  const bestFitHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareMatrixBox
        selectedTracks={['NT', 'BA', 'SM']}
        selectedTopic="bestFit"
        onSelectTopic={() => {}}
        getTrackScore={() => null}
      />
    </MemoryRouter>,
  );
  assert.ok(bestFitHtml.includes(TRACKS_DATA.NT.bestFitTraits[3]));
  assert.ok(bestFitHtml.includes(TRACKS_DATA.BA.bestFitTraits[3]));
  assert.ok(bestFitHtml.includes(TRACKS_DATA.SM.bestFitTraits[3]));
});

test('CompareMatrixBox and QuizLevelCompletion emit explicit celestial dark surfaces with no grey neutral backgrounds', () => {
  const topics: Array<'subjects' | 'skills' | 'project' | 'careers' | 'workStyle'> = [
    'subjects',
    'skills',
    'project',
    'careers',
    'workStyle',
  ];

  for (const topic of topics) {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CompareMatrixBox
          selectedTracks={['NT', 'BA', 'SM']}
          selectedTopic={topic}
          onSelectTopic={() => {}}
          getTrackScore={() => 80}
        />
      </MemoryRouter>,
    );
    assert.ok(
      html.includes('dark:bg-[#0b1222]/85'),
      `Topic "${topic}" should include dark:bg-[#0b1222]/85 inner card surface`,
    );
    assert.ok(
      !html.includes('bg-neutral-'),
      `Topic "${topic}" should not emit neutral grey backgrounds`,
    );
    if (topic === 'skills' || topic === 'subjects' || topic === 'careers') {
      assert.ok(
        html.includes('dark:bg-[#131d33]'),
        `Topic "${topic}" should include dark:bg-[#131d33] pills/badges`,
      );
    }
    if (topic === 'project') {
      assert.ok(html.includes('Additional Applied Scenarios'));
      const scenariosIdx = html.indexOf('Additional Applied Scenarios');
      const cardChunk = html.slice(Math.max(0, scenariosIdx - 220), scenariosIdx);
      assert.ok(cardChunk.includes('dark:bg-[#0b1222]/85'));
    }
  }

  const prevStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
  let levelHtml = '';
  try {
    levelHtml = renderToStaticMarkup(
      <MemoryRouter>
        <StudentProvider>
          <QuizLevelCompletion completedLevel={2} onContinue={() => {}} />
        </StudentProvider>
      </MemoryRouter>,
    );
  } finally {
    if (prevStorage === undefined) {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = prevStorage;
    }
  }
  assert.ok(!levelHtml.includes('bg-neutral-700'));
  assert.ok(levelHtml.includes('dark:bg-[#172554]'));
  assert.ok(levelHtml.includes('dark:bg-[#0b1222]/85'));
});

