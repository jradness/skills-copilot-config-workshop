const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

/**
 * Wraps text with an ANSI escape sequence and resets afterward.
 * @param {string} codes - ANSI escape codes to apply.
 * @param {string} text - Text to wrap.
 * @returns {string}
 */
function ansi(codes, text) {
  return `${codes}${text}${RESET}`;
}

/**
 * Applies a consistent color to task status values.
 * @param {'todo' | 'in-progress' | 'done'} status
 * @returns {string}
 */
export function colorStatus(status) {
  if (status === 'done') {
    return ansi(GREEN, status);
  }

  if (status === 'in-progress') {
    return ansi(YELLOW, status);
  }

  return ansi(RED, status);
}

/**
 * Applies a consistent style to task priority values.
 * @param {'low' | 'medium' | 'high'} priority
 * @returns {string}
 */
export function colorPriority(priority) {
  if (priority === 'high') {
    return ansi(BOLD + RED, priority);
  }

  if (priority === 'medium') {
    return ansi(BOLD + YELLOW, priority);
  }

  return ansi(DIM, priority);
}