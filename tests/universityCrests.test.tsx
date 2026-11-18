import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { UNIVERSITY_LOGOS } from '../src/assets/manifest';
import { UniversityCrests } from '../src/components/shared/UniversityCrests';
import { Sidebar } from '../src/components/layout/Sidebar';
import { DashboardPage } from '../src/pages/DashboardPage';
import { StudentProvider } from '../src/context/StudentContext';
import { CommunityProvider } from '../src/context/CommunityContext';

test('UniversityCrests, Sidebar, and DashboardPage render the IINTESS seal and updated CICS IINTESS labels', () => {
  assert.equal(
    UNIVERSITY_LOGOS.cicsAlangilan.url,
    '/assets/aistudio/423862284_122100317924200684_1941444354870706094_n_4155d14a.jpg',
  );

  const crestsHtml = renderToStaticMarkup(<UniversityCrests size="md" />);
  assert.ok(
    crestsHtml.includes(
      '/assets/aistudio/423862284_122100317924200684_1941444354870706094_n_4155d14a.jpg',
    ),
  );
  assert.ok(crestsHtml.includes('CICS Alangilan ~ IINTESS'));

  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  (globalThis as { localStorage?: Storage }).localStorage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };

  try {
    const sidebarHtml = renderToStaticMarkup(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );
    assert.ok(sidebarHtml.includes('CICS Alangilan ~ IINTESS'));
    assert.ok(
      sidebarHtml.includes(
        '/assets/aistudio/423862284_122100317924200684_1941444354870706094_n_4155d14a.jpg',
      ),
    );

    const dashboardHtml = renderToStaticMarkup(
      <MemoryRouter>
        <StudentProvider>
          <CommunityProvider>
            <DashboardPage />
          </CommunityProvider>
        </StudentProvider>
      </MemoryRouter>,
    );
    assert.ok(dashboardHtml.includes('CICS IINTESS BSIT Hub'));
    assert.ok(
      dashboardHtml.includes(
        '/assets/aistudio/423862284_122100317924200684_1941444354870706094_n_4155d14a.jpg',
      ),
    );
  } finally {
    if (previousStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
});
