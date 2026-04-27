import test from 'node:test';
import assert from 'node:assert/strict';
import { colorStatus, colorPriority } from '../src/utils/colors.js';

test('colorStatus wraps done in green ANSI codes', () => {
  const result = colorStatus('done');

  assert.ok(result.includes('done'));
  assert.ok(result.includes('\x1b[32m'));
  assert.ok(result.endsWith('\x1b[0m'));
});

test('colorStatus wraps in-progress in yellow ANSI codes', () => {
  const result = colorStatus('in-progress');

  assert.ok(result.includes('in-progress'));
  assert.ok(result.includes('\x1b[33m'));
  assert.ok(result.endsWith('\x1b[0m'));
});

test('colorStatus wraps todo in red ANSI codes', () => {
  const result = colorStatus('todo');

  assert.ok(result.includes('todo'));
  assert.ok(result.includes('\x1b[31m'));
  assert.ok(result.endsWith('\x1b[0m'));
});

test('colorStatus wraps unknown status in red ANSI codes', () => {
  const result = colorStatus('unknown');

  assert.ok(result.includes('unknown'));
  assert.ok(result.includes('\x1b[31m'));
  assert.ok(result.endsWith('\x1b[0m'));
});

test('colorPriority wraps high in bold red ANSI codes', () => {
  const result = colorPriority('high');

  assert.ok(result.includes('high'));
  assert.ok(result.includes('\x1b[1m'));
  assert.ok(result.includes('\x1b[31m'));
  assert.ok(result.endsWith('\x1b[0m'));
});

test('colorPriority wraps medium in bold yellow ANSI codes', () => {
  const result = colorPriority('medium');

  assert.ok(result.includes('medium'));
  assert.ok(result.includes('\x1b[1m'));
  assert.ok(result.includes('\x1b[33m'));
  assert.ok(result.endsWith('\x1b[0m'));
});

test('colorPriority wraps low in dim ANSI codes', () => {
  const result = colorPriority('low');

  assert.ok(result.includes('low'));
  assert.ok(result.includes('\x1b[2m'));
  assert.ok(result.endsWith('\x1b[0m'));
});

test('colorPriority wraps unknown priority in dim ANSI codes', () => {
  const result = colorPriority('unknown');

  assert.ok(result.includes('unknown'));
  assert.ok(result.includes('\x1b[2m'));
  assert.ok(result.endsWith('\x1b[0m'));
});
