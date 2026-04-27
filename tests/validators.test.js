import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isNonEmptyString,
  normalizeDescription,
  validateCategory,
  validateIsoTimestamp,
  validateListOptions,
  validatePriority,
  validateStatus,
  validateTaskId,
  validateTitle,
} from '../src/utils/validators.js';

test('isNonEmptyString returns true for trimmed non-empty strings', () => {
  assert.equal(isNonEmptyString('  hello  '), true);
});

test('isNonEmptyString returns false for blank strings', () => {
  assert.equal(isNonEmptyString('   '), false);
});

test('isNonEmptyString returns false for zero', () => {
  assert.equal(isNonEmptyString(0), false);
});

test('isNonEmptyString returns false for null', () => {
  assert.equal(isNonEmptyString(null), false);
});

test('isNonEmptyString returns false for undefined', () => {
  assert.equal(isNonEmptyString(undefined), false);
});

test('validateTitle trims surrounding whitespace', () => {
  assert.equal(validateTitle('  Build tests  '), 'Build tests');
});

test('validateTitle throws for empty values', () => {
  assert.throws(() => validateTitle(''), /Invalid task title/);
});

test('validateTitle throws for undefined', () => {
  assert.throws(() => validateTitle(undefined), /Invalid task title/);
});

test('validateTitle throws for null', () => {
  assert.throws(() => validateTitle(null), /Invalid task title/);
});

test('validateTitle throws for zero', () => {
  assert.throws(() => validateTitle(0), /Invalid task title/);
});

test('normalizeDescription returns empty string for undefined', () => {
  assert.equal(normalizeDescription(undefined), '');
});

test('normalizeDescription returns empty string for null', () => {
  assert.equal(normalizeDescription(null), '');
});

test('normalizeDescription coerces non-string values and trims', () => {
  assert.equal(normalizeDescription(42), '42');
});

test('normalizeDescription coerces negative numbers to strings', () => {
  assert.equal(normalizeDescription(-99), '-99');
});

test('validateStatus accepts allowed status values', () => {
  assert.equal(validateStatus('done'), 'done');
});

test('validateStatus throws for unsupported status values', () => {
  assert.throws(() => validateStatus('blocked'), /Invalid task status/);
});

test('validateStatus throws for numeric type mismatch', () => {
  assert.throws(() => validateStatus(0), /Invalid task status/);
});

test('validatePriority accepts allowed priority values', () => {
  assert.equal(validatePriority('medium'), 'medium');
});

test('validatePriority throws for unsupported priority values', () => {
  assert.throws(() => validatePriority('urgent'), /Invalid task priority/);
});

test('validatePriority throws for undefined', () => {
  assert.throws(() => validatePriority(undefined), /Invalid task priority/);
});

test('validateCategory trims and returns valid categories', () => {
  assert.equal(validateCategory('  work  '), 'work');
});

test('validateCategory throws for blank category values', () => {
  assert.throws(() => validateCategory('   '), /Invalid task category/);
});

test('validateCategory throws for non-string category values', () => {
  assert.throws(() => validateCategory(123), /Invalid task category/);
});

test('validateIsoTimestamp accepts valid ISO timestamp strings', () => {
  const value = '2026-04-27T12:00:00.000Z';
  assert.equal(validateIsoTimestamp(value, 'createdAt'), value);
});

test('validateIsoTimestamp throws for invalid timestamp strings', () => {
  assert.throws(() => validateIsoTimestamp('not-a-date', 'createdAt'), /Invalid createdAt/);
});

test('validateIsoTimestamp throws for undefined timestamps', () => {
  assert.throws(() => validateIsoTimestamp(undefined, 'createdAt'), /Invalid createdAt/);
});

test('validateTaskId trims and returns non-empty ids', () => {
  assert.equal(validateTaskId('  id-123  '), 'id-123');
});

test('validateTaskId throws for blank ids', () => {
  assert.throws(() => validateTaskId('   '), /Invalid task id/);
});

test('validateTaskId throws for null ids', () => {
  assert.throws(() => validateTaskId(null), /Invalid task id/);
});

test('validateTaskId throws for zero ids', () => {
  assert.throws(() => validateTaskId(0), /Invalid task id/);
});

test('validateListOptions normalizes valid option combinations', () => {
  const result = validateListOptions({
    status: 'todo',
    priority: 'low',
    category: 'planning',
    sortBy: 'createdAt',
    direction: 'asc',
  });

  assert.deepEqual(result, {
    status: 'todo',
    priority: 'low',
    category: 'planning',
    sortBy: 'createdAt',
    direction: 'asc',
  });
});

test('validateListOptions returns empty object for undefined input', () => {
  assert.deepEqual(validateListOptions(undefined), {});
});

test('validateListOptions ignores explicitly undefined optional fields', () => {
  assert.deepEqual(validateListOptions({ status: undefined }), {});
});

test('validateListOptions throws when options is not an object', () => {
  assert.throws(() => validateListOptions([]), /Invalid list options/);
});

test('validateListOptions throws for null options', () => {
  assert.throws(() => validateListOptions(null), /Invalid list options/);
});

test('validateListOptions throws for numeric options', () => {
  assert.throws(() => validateListOptions(0), /Invalid list options/);
});

test('validateListOptions throws for invalid sortBy values', () => {
  assert.throws(() => validateListOptions({ sortBy: 'updatedAt' }), /Invalid sortBy/);
});

test('validateListOptions throws for invalid direction values', () => {
  assert.throws(() => validateListOptions({ direction: 'up' }), /Invalid direction/);
});

test('validateListOptions throws for invalid status value type', () => {
  assert.throws(() => validateListOptions({ status: 1 }), /Invalid task status/);
});

test('validateListOptions throws for invalid priority value type', () => {
  assert.throws(() => validateListOptions({ priority: -1 }), /Invalid task priority/);
});

test('validateListOptions throws for invalid category value type', () => {
  assert.throws(() => validateListOptions({ category: null }), /Invalid task category/);
});
