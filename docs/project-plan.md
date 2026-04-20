# Task Manager CLI Project Plan

## Project overview
Task Manager CLI is a lightweight command-line application for Node.js 20+ that lets users create, view, update, and delete tasks directly from the terminal. The application focuses on a small, workshop-friendly scope: in-memory task storage during runtime, clear command-based interactions, and practical task management workflows including filtering by status or priority and sorting by priority or creation date.

## User stories
1. As a user, I want to create a task so I can track work I need to do.
Acceptance criteria:
1. A create command accepts a required title and optional description.
2. New tasks default to status todo and priority medium when not provided.
3. The system sets createdAt and updatedAt at creation time.
4. The command returns the created task with its generated id.

2. As a user, I want to list all tasks so I can see my current workload.
Acceptance criteria:
1. A list command returns all tasks currently in memory.
2. Each listed task shows id, title, status, priority, createdAt, and updatedAt.
3. If no tasks exist, the CLI prints a clear empty-state message.

3. As a user, I want to update a task so I can keep task details accurate over time.
Acceptance criteria:
1. An update command identifies a task by id.
2. The command supports updating title, description, status, and priority.
3. Status is limited to todo, in-progress, or done.
4. Priority is limited to low, medium, or high.
5. updatedAt changes whenever an update succeeds.
6. Updating a missing id returns a clear error.

4. As a user, I want to delete a task so I can remove irrelevant items.
Acceptance criteria:
1. A delete command removes a task by id.
2. Deleting a missing id returns a clear error.
3. Successful deletion returns a confirmation message.

5. As a user, I want to filter tasks by status or priority so I can focus on specific work.
Acceptance criteria:
1. The list command accepts optional filters for status and priority.
2. Filtering by status returns only tasks with the matching status.
3. Filtering by priority returns only tasks with the matching priority.
4. Combined filters apply with AND behavior.

6. As a user, I want to sort tasks by priority or creation date so I can review tasks in a useful order.
Acceptance criteria:
1. The list command accepts a sort field of priority or createdAt.
2. Sorting by priority uses high, medium, low order by default.
3. Sorting by createdAt supports ascending and descending order.
4. Invalid sort options return clear guidance.

## Data model
1. Entity: Task
- id: number
- title: string
- description: string
- status: "todo" | "in-progress" | "done"
- priority: "low" | "medium" | "high"
- createdAt: string (ISO 8601 timestamp)
- updatedAt: string (ISO 8601 timestamp)

2. Runtime store: TaskStore
- tasks: Task[]
- nextId: number

## File structure
Proposed source layout under src/:

```text
src/
  index.js                # CLI entry point and argument routing
  commands/
    create-task.js        # Create task command handler
    list-tasks.js         # List, filter, and sort command handler
    update-task.js        # Update task command handler
    delete-task.js        # Delete task command handler
  services/
    task-service.js       # Core CRUD, filtering, sorting logic
  models/
    task.js               # Task shape helpers and defaults
  store/
    in-memory-store.js    # In-memory task state and id generation
  utils/
    validators.js         # Validation for status, priority, and inputs
    formatter.js          # Console output formatting helpers
```

## Implementation phases
1. Milestone 1: Scaffold CLI and in-memory store
- Create the src/ layout and wire a minimal index.js command parser.
- Implement TaskStore with tasks array and nextId counter.
- Add common validation and error output utilities.

2. Milestone 2: Implement core CRUD commands
- Build create-task, list-tasks, update-task, and delete-task handlers.
- Add task defaults for status, priority, createdAt, and updatedAt.
- Verify id lookup, not-found handling, and update timestamp behavior.

3. Milestone 3: Add filtering and sorting
- Extend list-tasks to support status and priority filters.
- Add sort-by priority and createdAt options, including direction for createdAt.
- Ensure invalid filter/sort values produce clear messages.

4. Milestone 4: Polish CLI behavior for workshop use
- Improve help text and usage examples for each command.
- Standardize output formatting for readability.
- Run manual test scenarios covering all user stories.

5. Milestone 5: Verification and handoff
- Validate acceptance criteria against the implemented behavior.
- Document known constraints: in-memory only, resets on process exit.
- Capture next-step enhancements as optional follow-up work.

## Constraints and technical decisions
1. Runtime target: Node.js 20+.
2. Dependencies: no external packages.
3. Storage: in-memory only, no database and no file persistence.
4. Scope: workshop-sized implementation suitable for iterative exercises.

## Error handling and input validation conventions
1. Error handling conventions
- Use a consistent, non-zero process exit code for command failures.
- Print user-facing errors to stderr with a predictable prefix: Error: <message>.
- Return concise, actionable messages for invalid commands and missing required arguments.
- Distinguish expected errors (validation, not found) from unexpected errors (exceptions).
- For unexpected errors, print a generic message and optionally include details behind a debug flag.
- Do not partially mutate task state when an operation fails validation.

2. Input validation rules
- Command names must be one of: create, list, update, delete, help.
- id must be a positive integer for update and delete operations.
- title is required for create, must be trimmed, and must not be empty.
- description is optional; if provided, coerce to string and trim surrounding whitespace.
- status must be one of: todo, in-progress, done.
- priority must be one of: low, medium, high.
- sort field must be one of: priority, createdAt.
- sort direction for createdAt must be one of: asc, desc.
- filter values must use the same allowed sets as status and priority.
- Reject unknown flags or malformed key-value arguments with usage guidance.

3. Validation timing and behavior
- Validate all command inputs before reading or mutating in-memory state.
- Aggregate field-level validation issues when feasible and show them in one response.
- If an id is valid format but not found, return a not-found error rather than a validation error.
- On success, preserve stable output shape so scripts can parse CLI responses consistently.
