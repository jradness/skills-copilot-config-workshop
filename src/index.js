import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from './services/taskService.js';

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function printData(label, value) {
  console.log(`${label}:`, JSON.stringify(value, null, 2));
}

function main() {
  try {
    printSection('Create Tasks');
    const taskA = createTask({
      title: 'Write workshop summary',
      description: 'Capture key takeaways from the Copilot workshop.',
      priority: 'high',
    });

    const taskB = createTask({
      title: 'Prepare slide updates',
      description: 'Revise the examples for exercise 03.',
      status: 'in-progress',
      priority: 'medium',
    });

    printData('Created task A', taskA);
    printData('Created task B', taskB);

    printSection('List All Tasks');
    printData('All tasks', listTasks());

    printSection('Update Task');
    const updatedTask = updateTask(taskA.id, {
      status: 'done',
      description: 'Summary written and shared with the team.',
    });
    printData('Updated task A', updatedTask);

    printSection('Filter Tasks');
    printData('In-progress tasks', listTasks({ status: 'in-progress' }));

    printSection('Sort Tasks by Priority');
    printData('Sorted tasks', listTasks({ sortBy: 'priority' }));

    printSection('Delete Task');
    const deletedTask = deleteTask(taskB.id);
    printData('Deleted task', deletedTask);

    printSection('Final Task List');
    printData('Remaining tasks', listTasks({ sortBy: 'createdAt', direction: 'asc' }));
  } catch (error) {
    console.error('Task Manager failed:', error.message);
    process.exitCode = 1;
  }
}

main();
