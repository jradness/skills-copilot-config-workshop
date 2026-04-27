import { randomUUID } from 'node:crypto';
import {
  validateCategory,
  normalizeDescription,
  validateIsoTimestamp,
  validatePriority,
  validateStatus,
  validateTaskId,
  validateTitle,
} from '../utils/validators.js';

/**
 * Represents a task with normalized and validated fields.
 */
export class Task {
  /**
   * Creates a task instance.
   * @param {{
   *   id?: string,
   *   title: string,
   *   description?: string,
  *   category?: string,
   *   status?: 'todo' | 'in-progress' | 'done',
   *   priority?: 'low' | 'medium' | 'high',
   *   createdAt?: string,
   *   updatedAt?: string
   * }} input
   */
  constructor(input) {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      throw new TypeError('Invalid task input: expected an object.');
    }

    const now = new Date().toISOString();
    const id = input.id ?? randomUUID();
    const createdAt = input.createdAt ?? now;
    const updatedAt = input.updatedAt ?? createdAt;

    this.id = validateTaskId(id);
    this.title = validateTitle(input.title);
    this.description = normalizeDescription(input.description);
    this.category = validateCategory(input.category ?? 'general');
    this.status = validateStatus(input.status ?? 'todo');
    this.priority = validatePriority(input.priority ?? 'medium');
    this.createdAt = validateIsoTimestamp(createdAt, 'createdAt');
    this.updatedAt = validateIsoTimestamp(updatedAt, 'updatedAt');

    if (new Date(this.updatedAt) < new Date(this.createdAt)) {
      throw new TypeError('Invalid timestamps: updatedAt cannot be earlier than createdAt.');
    }
  }

  /**
   * Applies a partial update and refreshes the `updatedAt` timestamp.
    * @param {{title?: string, description?: string, category?: string, status?: 'todo' | 'in-progress' | 'done', priority?: 'low' | 'medium' | 'high'}} patch
   * @returns {Task}
   */
  update(patch) {
    if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) {
      throw new TypeError('Invalid task patch: expected an object.');
    }

    if (Object.hasOwn(patch, 'title')) {
      this.title = validateTitle(patch.title);
    }

    if (Object.hasOwn(patch, 'description')) {
      this.description = normalizeDescription(patch.description);
    }

    if (Object.hasOwn(patch, 'category')) {
      this.category = validateCategory(patch.category);
    }

    if (Object.hasOwn(patch, 'status')) {
      this.status = validateStatus(patch.status);
    }

    if (Object.hasOwn(patch, 'priority')) {
      this.priority = validatePriority(patch.priority);
    }

    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Creates a copy of this task with a new ID.
   * @returns {Task}
   */
  clone() {
    return new Task({
      title: this.title,
      description: this.description,
      category: this.category,
      status: this.status,
      priority: this.priority,
    });
  }

  /**
   * Serializes the task to a plain object.
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
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
