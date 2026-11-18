import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFolderId, formatBytes, getFileCategory } from './driveUtils.ts';

test('extractFolderId handles various URL formats and raw IDs', () => {
  // Provided user link
  const userLink = 'https://drive.google.com/drive/folders/1xGXjfT67LBWI2fuw2OIJ6fhqYfcSfixO?usp=drive_link';
  assert.equal(extractFolderId(userLink), '1xGXjfT67LBWI2fuw2OIJ6fhqYfcSfixO');

  // Raw folder ID
  assert.equal(extractFolderId('1xGXjfT67LBWI2fuw2OIJ6fhqYfcSfixO'), '1xGXjfT67LBWI2fuw2OIJ6fhqYfcSfixO');

  // URL with /u/0/
  const u0Link = 'https://drive.google.com/drive/u/0/folders/abc123XYZ_456-789';
  assert.equal(extractFolderId(u0Link), 'abc123XYZ_456-789');

  // File link /d/
  const fileLink = 'https://drive.google.com/file/d/testFileId1234567890/view?usp=sharing';
  assert.equal(extractFolderId(fileLink), 'testFileId1234567890');

  // Empty string
  assert.equal(extractFolderId(''), '');
});

test('formatBytes formats numbers properly', () => {
  assert.equal(formatBytes(undefined), '—');
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(1048576), '1.0 MB');
  assert.equal(formatBytes('5242880'), '5.0 MB');
});

test('getFileCategory maps MIME types to categories accurately', () => {
  assert.equal(getFileCategory('application/vnd.google-apps.folder'), 'folder');
  assert.equal(getFileCategory('application/vnd.google-apps.document'), 'document');
  assert.equal(getFileCategory('application/vnd.google-apps.spreadsheet'), 'spreadsheet');
  assert.equal(getFileCategory('application/pdf'), 'pdf');
  assert.equal(getFileCategory('image/png'), 'image');
  assert.equal(getFileCategory('video/mp4'), 'video');
  assert.equal(getFileCategory('application/json'), 'code');
  assert.equal(getFileCategory('text/plain', 'script.py'), 'code');
});
