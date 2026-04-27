import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const serviceModuleUrl = pathToFileURL(
  path.resolve('src/services/taskService.js')
).href;

async function loadFreshService() {
  return import(`${serviceModuleUrl}?t=${Date.now()}-${Math.random()}`);
}

test('createTask returns a stored task with defaults', async () => {
  const service = await loadFreshService();

  const task = service.createTask({ title: 'Create this task' });

  assert.equal(task.title, 'Create this task');
  assert.equal(task.category, 'general');
  assert.equal(task.status, 'todo');
  assert.equal(task.priority, 'medium');
});

test('createTask stores a provided category', async () => {
  const service = await loadFreshService();

  const task = service.createTask({ title: 'Write docs', category: 'docs' });

  assert.equal(task.category, 'docs');
});

test('createTask throws for invalid input', async () => {
  const service = await loadFreshService();

  assert.throws(
    () => service.createTask({ title: '' }),
    /Invalid input for createTask/
  );
});

test('listTasks returns created tasks', async () => {
  const service = await loadFreshService();

  service.createTask({ title: 'A' });
  service.createTask({ title: 'B' });

  const tasks = service.listTasks();

  assert.equal(tasks.length, 2);
});

test('listTasks filters by status', async () => {
  const service = await loadFreshService();

  service.createTask({ title: 'Todo task', status: 'todo' });
  service.createTask({ title: 'Done task', status: 'done' });

  const tasks = service.listTasks({ status: 'done' });

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].status, 'done');
});

test('listTasks filters by category', async () => {
  const service = await loadFreshService();

  service.createTask({ title: 'Plan', category: 'planning' });
  service.createTask({ title: 'Code', category: 'development' });

  const tasks = service.listTasks({ category: 'planning' });

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].category, 'planning');
});

test('listTasks sorts by priority from high to low', async () => {
  const service = await loadFreshService();

  service.createTask({ title: 'Low', priority: 'low' });
  service.createTask({ title: 'High', priority: 'high' });
  service.createTask({ title: 'Medium', priority: 'medium' });

  const tasks = service.listTasks({ sortBy: 'priority' });

  assert.deepEqual(
    tasks.map((task) => task.priority),
    ['high', 'medium', 'low']
  );
});

test('listTasks throws for invalid options', async () => {
  const service = await loadFreshService();

  assert.throws(
    () => service.listTasks({ direction: 'up' }),
    /Invalid input for listTasks/
  );
});

test('updateTask changes mutable task fields', async () => {
  const service = await loadFreshService();

  const created = service.createTask({ title: 'Initial' });
  const updated = service.updateTask(created.id, {
    title: 'Updated',
    status: 'in-progress',
    priority: 'high',
  });

  assert.equal(updated.title, 'Updated');
  assert.equal(updated.status, 'in-progress');
  assert.equal(updated.priority, 'high');
});

test('updateTask throws when task is not found', async () => {
  const service = await loadFreshService();

  assert.throws(
    () => service.updateTask('missing-id', { title: 'Nope' }),
    /Task not found for id/
  );
});

test('updateTask throws for invalid patch data', async () => {
  const service = await loadFreshService();

  const created = service.createTask({ title: 'Initial' });

  assert.throws(
    () => service.updateTask(created.id, { priority: 'urgent' }),
    /Invalid input for updateTask/
  );
});

test('deleteTask removes and returns the deleted task', async () => {
  const service = await loadFreshService();

  const created = service.createTask({ title: 'Delete me' });
  const removed = service.deleteTask(created.id);
  const remaining = service.listTasks();

  assert.equal(removed.id, created.id);
  assert.equal(remaining.length, 0);
});

test('deleteTask throws when task id does not exist', async () => {
  const service = await loadFreshService();

  assert.throws(
    () => service.deleteTask('missing-id'),
    /Task not found for id/
  );
});

test('filterTasksByCategory returns matching tasks', async () => {
  const service = await loadFreshService();

  service.createTask({ title: 'Docs 1', category: 'docs' });
  service.createTask({ title: 'Ops 1', category: 'ops' });
  service.createTask({ title: 'Docs 2', category: 'docs' });

  const tasks = service.filterTasksByCategory('docs');

  assert.equal(tasks.length, 2);
  assert.equal(tasks.every((task) => task.category === 'docs'), true);
});

test('filterTasksByCategory throws for invalid category input', async () => {
  const service = await loadFreshService();

  assert.throws(
    () => service.filterTasksByCategory('   '),
    /Invalid input for filterTasksByCategory/
  );
});

test('listCategories returns sorted unique categories', async () => {
  const service = await loadFreshService();

  service.createTask({ title: 'A', category: 'ops' });
  service.createTask({ title: 'B', category: 'docs' });
  service.createTask({ title: 'C', category: 'ops' });

  const categories = service.listCategories();

  assert.deepEqual(categories, ['docs', 'ops']);
});
