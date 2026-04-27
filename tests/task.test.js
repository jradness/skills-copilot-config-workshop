import test from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../src/models/task.js';

test('Task constructor applies defaults for status, priority, description, and category', () => {
  const task = new Task({ title: '  Plan release  ' });

  assert.equal(task.title, 'Plan release');
  assert.equal(task.description, '');
  assert.equal(task.category, 'general');
  assert.equal(task.status, 'todo');
  assert.equal(task.priority, 'medium');
});

test('Task constructor rejects non-object input', () => {
  assert.throws(
    () => new Task(null),
    /Invalid task input: expected an object\./
  );
});

test('Task constructor rejects updatedAt earlier than createdAt', () => {
  assert.throws(
    () =>
      new Task({
        title: 'Task',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2025-12-31T23:59:59.000Z',
      }),
    /updatedAt cannot be earlier than createdAt/
  );
});

test('Task update applies title, status, and category changes', () => {
  const task = new Task({ title: 'Initial', status: 'todo' });

  task.update({ title: 'Updated', status: 'done', category: 'work' });

  assert.equal(task.title, 'Updated');
  assert.equal(task.status, 'done');
  assert.equal(task.category, 'work');
});

test('Task update rejects invalid patch input', () => {
  const task = new Task({ title: 'Valid title' });

  assert.throws(
    () => task.update([]),
    /Invalid task patch: expected an object\./
  );
});

test('Task clone creates a new task with copied fields and different id', () => {
  const original = new Task({
    title: 'Original',
    description: 'Copied',
    status: 'in-progress',
    priority: 'high',
  });

  const clone = original.clone();

  assert.notEqual(clone.id, original.id);
  assert.equal(clone.title, original.title);
  assert.equal(clone.description, original.description);
  assert.equal(clone.category, original.category);
  assert.equal(clone.status, original.status);
  assert.equal(clone.priority, original.priority);
});

test('Task toJSON returns a plain object with task fields', () => {
  const task = new Task({ title: 'Serialize me' });

  const result = task.toJSON();

  assert.equal(typeof result, 'object');
  assert.equal(result.id, task.id);
  assert.equal(result.title, task.title);
  assert.equal(result.category, task.category);
  assert.equal(result.status, task.status);
});

test('Task constructor rejects array input boundary case', () => {
  assert.throws(
    () => new Task([]),
    /Invalid task input: expected an object\./
  );
});

test('Task constructor rejects title type mismatch when number is provided', () => {
  assert.throws(
    () => new Task({ title: 12345 }),
    /Invalid task title/
  );
});

test('Task constructor rejects status type mismatch when number is provided', () => {
  assert.throws(
    () => new Task({ title: 'Valid', status: 1 }),
    /Invalid task status/
  );
});

test('Task constructor supports very long strings for title and description', () => {
  const longTitle = 'A'.repeat(10_000);
  const longDescription = 'B'.repeat(20_000);
  const task = new Task({
    title: longTitle,
    description: longDescription,
  });

  assert.equal(task.title.length, 10_000);
  assert.equal(task.description.length, 20_000);
});

test('Task constructor coerces max integer description to a string', () => {
  const task = new Task({
    title: 'Numeric description',
    description: Number.MAX_SAFE_INTEGER,
  });

  assert.equal(task.description, String(Number.MAX_SAFE_INTEGER));
});

test('Task constructor sets timestamps when optional fields are missing', () => {
  const task = new Task({ title: 'Timestamp defaults' });

  assert.equal(Number.isNaN(Date.parse(task.createdAt)), false);
  assert.equal(Number.isNaN(Date.parse(task.updatedAt)), false);
  assert.equal(new Date(task.updatedAt) >= new Date(task.createdAt), true);
});

test('Duplicate task content still generates unique ids', () => {
  const first = new Task({
    title: 'Duplicate content',
    description: 'Same',
    status: 'todo',
    priority: 'low',
  });

  const second = new Task({
    title: 'Duplicate content',
    description: 'Same',
    status: 'todo',
    priority: 'low',
  });

  assert.notEqual(first.id, second.id);
});

test('Cloning while iterating over a snapshot avoids concurrent mutation issues', () => {
  const tasks = [
    new Task({ title: 'First' }),
    new Task({ title: 'Second' }),
  ];

  for (const task of [...tasks]) {
    tasks.push(task.clone());
  }

  assert.equal(tasks.length, 4);
  assert.equal(tasks[0].title, tasks[2].title);
  assert.equal(tasks[1].title, tasks[3].title);
  assert.notEqual(tasks[0].id, tasks[2].id);
  assert.notEqual(tasks[1].id, tasks[3].id);
});
