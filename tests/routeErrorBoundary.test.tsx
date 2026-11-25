import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom';
import {
  ErrorRecoveryCard,
  isDynamicImportError,
  RouteErrorFallback,
} from '../src/components/shared/ErrorBoundary';

test('isDynamicImportError recognizes dynamic ESM fetch failures and ignores regular errors', () => {
  assert.equal(
    isDynamicImportError(
      new TypeError('Failed to fetch dynamically imported module: https://example.com/src/pages/AlumniStoriesPage.tsx'),
    ),
    true,
  );
  assert.equal(isDynamicImportError(new Error('Importing a module script failed.')), true);
  assert.equal(isDynamicImportError(new Error('ChunkLoadError: Loading chunk 4 failed.')), true);
  assert.equal(isDynamicImportError(new Error('Network timeout')), false);
  assert.equal(isDynamicImportError(null), false);
});

test('RouteErrorFallback and ErrorRecoveryCard render custom Luminary recovery UI instead of React Router default error boundary', async () => {
  const routes = [
    {
      path: '/alumni',
      loader() {
        throw new TypeError(
          'Failed to fetch dynamically imported module: https://example.com/src/pages/AlumniStoriesPage.tsx',
        );
      },
      element: <div>Alumni</div>,
      errorElement: <RouteErrorFallback />,
    },
  ];
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request('http://localhost/alumni'));
  assert.equal(context instanceof Response, false);
  if (context instanceof Response) return;

  const router = createStaticRouter(handler.dataRoutes, context);
  const html = renderToStaticMarkup(<StaticRouterProvider router={router} context={context} />);
  assert.match(html, /A fresh update is ready!/);
  assert.match(html, /Retry this page/);
  assert.match(html, /Return to Luminary Hub/);

  const genericHtml = renderToStaticMarkup(
    <ErrorRecoveryCard error={new Error('Unexpected state')} onReload={() => {}} onReset={() => {}} />,
  );
  assert.match(genericHtml, /A cosmic ripple occurred!/);
});

test('App router uses static page imports and wires RouteErrorFallback for all routes', () => {
  const appSource = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  assert.equal(appSource.includes('React.lazy'), false);
  assert.equal(/\blazy\s*\(/.test(appSource), false);
  assert.match(appSource, /import\s+\{\s*AlumniStoriesPage\s*\}\s+from\s+['"]\.\/pages\/AlumniStoriesPage['"]/);
  assert.match(appSource, /errorElement:\s*<RouteErrorFallback\s*\/>/);
});
