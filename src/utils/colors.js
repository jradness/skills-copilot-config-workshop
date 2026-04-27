import chalk from 'chalk';

/**
 * Applies a consistent color to task status values.
 * @param {'todo' | 'in-progress' | 'done'} status
 * @returns {string}
 */
export function colorStatus(status) {
  if (status === 'done') {
    return chalk.green(status);
  }

  if (status === 'in-progress') {
    return chalk.yellow(status);
  }

  return chalk.red(status);
}

/**
 * Applies a consistent style to task priority values.
 * @param {'low' | 'medium' | 'high'} priority
 * @returns {string}
 */
export function colorPriority(priority) {
  if (priority === 'high') {
    return chalk.bold.red(priority);
  }

  if (priority === 'medium') {
    return chalk.bold.yellow(priority);
  }

  return chalk.dim(priority);
}