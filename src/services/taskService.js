import { Task } from '../models/task.js';
import { validateCategory, validateListOptions, validateTaskId } from '../utils/validators.js';

const taskStore = [];
const priorityRank = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Creates and stores a new task.
 * @param {{title: string, description?: string, category?: string, status?: 'todo' | 'in-progress' | 'done', priority?: 'low' | 'medium' | 'high'}} input
 * @returns {{
 *   id: string,
 *   title: string,
 *   description: string,
 *   category: string,
 *   status: 'todo' | 'in-progress' | 'done',
 *   priority: 'low' | 'medium' | 'high',
 *   createdAt: string,
 *   updatedAt: string
 * }}
 */
export function createTask(input) {
  try {
    const task = new Task(input);
    taskStore.push(task);
    return task.toJSON();
  } catch (error) {
    throw new Error(`Invalid input for createTask: ${error.message}`);
  }
}

/**
 * Lists tasks with optional filtering and sorting.
 * @param {{status?: 'todo' | 'in-progress' | 'done', priority?: 'low' | 'medium' | 'high', category?: string, sortBy?: 'priority' | 'createdAt', direction?: 'asc' | 'desc'}} [options]
 * @returns {Array<{
 *   id: string,
 *   title: string,
 *   description: string,
 *   category: string,
 *   status: 'todo' | 'in-progress' | 'done',
 *   priority: 'low' | 'medium' | 'high',
 *   createdAt: string,
 *   updatedAt: string
 * }>}
 */
export function listTasks(options = {}) {
  try {
    const normalizedOptions = validateListOptions(options);
    const direction = normalizedOptions.direction ?? 'desc';

    let results = taskStore.slice();

    if (normalizedOptions.status) {
      results = results.filter((task) => task.status === normalizedOptions.status);
    }

    if (normalizedOptions.priority) {
      results = results.filter((task) => task.priority === normalizedOptions.priority);
    }

    if (normalizedOptions.category) {
      results = results.filter((task) => task.category === normalizedOptions.category);
    }

    if (normalizedOptions.sortBy === 'priority') {
      results.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
    }

    if (normalizedOptions.sortBy === 'createdAt') {
      const multiplier = direction === 'asc' ? 1 : -1;
      results.sort(
        (a, b) =>
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier
      );
    }

    return results.map((task) => task.toJSON());
  } catch (error) {
    throw new Error(`Invalid input for listTasks: ${error.message}`);
  }
}

/**
 * Updates an existing task by id.
 * @param {string} id
 * @param {{title?: string, description?: string, category?: string, status?: 'todo' | 'in-progress' | 'done', priority?: 'low' | 'medium' | 'high'}} patch
 * @returns {{
 *   id: string,
 *   title: string,
 *   description: string,
 *   category: string,
 *   status: 'todo' | 'in-progress' | 'done',
 *   priority: 'low' | 'medium' | 'high',
 *   createdAt: string,
 *   updatedAt: string
 * }}
 */
export function updateTask(id, patch) {
  try {
    const normalizedId = validateTaskId(id);
    const task = taskStore.find((item) => item.id === normalizedId);

    if (!task) {
      throw new Error(`Task not found for id: ${normalizedId}`);
    }

    task.update(patch);
    return task.toJSON();
  } catch (error) {
    if (error.message.startsWith('Task not found')) {
      throw error;
    }
    throw new Error(`Invalid input for updateTask: ${error.message}`);
  }
}

/**
 * Deletes an existing task by id.
 * @param {string} id
 * @returns {{
 *   id: string,
 *   title: string,
 *   description: string,
 *   category: string,
 *   status: 'todo' | 'in-progress' | 'done',
 *   priority: 'low' | 'medium' | 'high',
 *   createdAt: string,
 *   updatedAt: string
 * }}
 */
export function deleteTask(id) {
  try {
    const normalizedId = validateTaskId(id);
    const index = taskStore.findIndex((task) => task.id === normalizedId);

    if (index === -1) {
      throw new Error(`Task not found for id: ${normalizedId}`);
    }

    const [removedTask] = taskStore.splice(index, 1);
    return removedTask.toJSON();
  } catch (error) {
    if (error.message.startsWith('Task not found')) {
      throw error;
    }
    throw new Error(`Invalid input for deleteTask: ${error.message}`);
  }
}

/**
 * Filters tasks using a category value.
 * @param {string} category
 * @returns {Array<{
 *   id: string,
 *   title: string,
 *   description: string,
 *   category: string,
 *   status: 'todo' | 'in-progress' | 'done',
 *   priority: 'low' | 'medium' | 'high',
 *   createdAt: string,
 *   updatedAt: string
 * }>}
 */
export function filterTasksByCategory(category) {
  try {
    const normalizedCategory = validateCategory(category);
    return taskStore
      .filter((task) => task.category === normalizedCategory)
      .map((task) => task.toJSON());
  } catch (error) {
    throw new Error(`Invalid input for filterTasksByCategory: ${error.message}`);
  }
}

/**
 * Lists all unique task categories.
 * @returns {string[]}
 */
export function listCategories() {
  return [...new Set(taskStore.map((task) => task.category))].sort();
}
