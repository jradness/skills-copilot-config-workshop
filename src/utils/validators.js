const VALID_STATUSES = new Set(['todo', 'in-progress', 'done']);
const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);

/**
 * Returns true when the value is a non-empty string after trimming.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates and normalizes a task title.
 * @param {unknown} title
 * @returns {string}
 */
export function validateTitle(title) {
  if (!isNonEmptyString(title)) {
    throw new TypeError('Invalid task title: expected a non-empty string.');
  }

  return title.trim();
}

/**
 * Normalizes an optional description value.
 * @param {unknown} description
 * @returns {string}
 */
export function normalizeDescription(description) {
  if (description === undefined || description === null) {
    return '';
  }

  return String(description).trim();
}

/**
 * Validates task status.
 * @param {unknown} status
 * @returns {'todo' | 'in-progress' | 'done'}
 */
export function validateStatus(status) {
  if (typeof status !== 'string' || !VALID_STATUSES.has(status)) {
    throw new TypeError(
      'Invalid task status: expected one of todo, in-progress, done.'
    );
  }

  return status;
}

/**
 * Validates task priority.
 * @param {unknown} priority
 * @returns {'low' | 'medium' | 'high'}
 */
export function validatePriority(priority) {
  if (typeof priority !== 'string' || !VALID_PRIORITIES.has(priority)) {
    throw new TypeError('Invalid task priority: expected one of low, medium, high.');
  }

  return priority;
}

/**
 * Validates and normalizes task category.
 * @param {unknown} category
 * @returns {string}
 */
export function validateCategory(category) {
  if (!isNonEmptyString(category)) {
    throw new TypeError('Invalid task category: expected a non-empty string.');
  }

  return category.trim();
}

/**
 * Validates and normalizes an ISO timestamp.
 * @param {unknown} timestamp
 * @param {string} fieldName
 * @returns {string}
 */
export function validateIsoTimestamp(timestamp, fieldName) {
  if (typeof timestamp !== 'string' || Number.isNaN(Date.parse(timestamp))) {
    throw new TypeError(`Invalid ${fieldName}: expected an ISO 8601 timestamp string.`);
  }

  return timestamp;
}

/**
 * Validates a task id.
 * @param {unknown} id
 * @returns {string}
 */
export function validateTaskId(id) {
  if (!isNonEmptyString(id)) {
    throw new TypeError('Invalid task id: expected a non-empty string.');
  }

  return id.trim();
}

/**
 * Validates list options used by task queries.
 * @param {unknown} options
 * @returns {{status?: 'todo' | 'in-progress' | 'done', priority?: 'low' | 'medium' | 'high', category?: string, sortBy?: 'priority' | 'createdAt', direction?: 'asc' | 'desc'}}
 */
export function validateListOptions(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Invalid list options: expected an object.');
  }

  const normalized = {};

  if (Object.hasOwn(options, 'status') && options.status !== undefined) {
    normalized.status = validateStatus(options.status);
  }

  if (Object.hasOwn(options, 'priority') && options.priority !== undefined) {
    normalized.priority = validatePriority(options.priority);
  }

  if (Object.hasOwn(options, 'category') && options.category !== undefined) {
    normalized.category = validateCategory(options.category);
  }

  if (Object.hasOwn(options, 'sortBy') && options.sortBy !== undefined) {
    if (options.sortBy !== 'priority' && options.sortBy !== 'createdAt') {
      throw new TypeError('Invalid sortBy: expected priority or createdAt.');
    }
    normalized.sortBy = options.sortBy;
  }

  if (Object.hasOwn(options, 'direction') && options.direction !== undefined) {
    if (options.direction !== 'asc' && options.direction !== 'desc') {
      throw new TypeError('Invalid direction: expected asc or desc.');
    }
    normalized.direction = options.direction;
  }

  return normalized;
}
