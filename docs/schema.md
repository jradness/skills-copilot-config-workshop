# Task Manager CLI Technical Design

## 1. Data models

### Task

| Property | Type | Required | Validation rules |
| --- | --- | --- | --- |
| id | number | yes | Must be an integer greater than 0; generated only by store sequence (`TaskStore.nextId`); unique across `TaskStore.tasks`; immutable after create. |
| title | string | yes | Input is trimmed before validation; must not be empty after trim; create fails if missing or blank; update with blank value is rejected. |
| description | string | no | Optional; if provided, coerce to string and trim surrounding whitespace; omitted value is stored as an empty string for stable output shape. |
| status | 'todo' \| 'in-progress' \| 'done' | yes | Enum only: `todo`, `in-progress`, `done`; defaults to `todo` on create when omitted; invalid values reject create/update. |
| priority | 'low' \| 'medium' \| 'high' | yes | Enum only: `low`, `medium`, `high`; defaults to `medium` on create when omitted; invalid values reject create/update. |
| createdAt | string (ISO 8601) | yes | Must be a valid ISO 8601 timestamp string (`!Number.isNaN(Date.parse(value))`); set once at creation; never modified by update operations. |
| updatedAt | string (ISO 8601) | yes | Must be a valid ISO 8601 timestamp string (`!Number.isNaN(Date.parse(value))`); initialized at create time; must be refreshed on every successful update; must be greater than or equal to `createdAt`. |

### TaskStore

| Property | Type | Required | Validation rules |
| --- | --- | --- | --- |
| tasks | Task[] | yes | In-memory array only; each entry must satisfy `Task` rules. |
| nextId | number | yes | Positive integer counter; increments by 1 after each successful create. |

### ListTasksOptions

| Property | Type | Required | Validation rules |
| --- | --- | --- | --- |
| status | 'todo' \| 'in-progress' \| 'done' | no | If provided, must be one of allowed status values. |
| priority | 'low' \| 'medium' \| 'high' | no | If provided, must be one of allowed priority values. |
| sortBy | 'priority' \| 'createdAt' | no | If provided, must be `priority` or `createdAt`. |
| direction | 'asc' \| 'desc' | no | Only applicable when `sortBy=createdAt`; defaults to `desc` if omitted. |

## 2. File structure

```text
src/
  index.js                # CLI entry point, command parsing, and command dispatch
  commands/
    create-task.js        # Handles create command argument parsing and service call
    list-tasks.js         # Handles list command with filters and sorting options
    update-task.js        # Handles update command and partial field updates by id
    delete-task.js        # Handles delete command and user-facing confirmation
  services/
    task-service.js       # Core task CRUD, filtering, sorting, and store mutation rules
  models/
    task.js               # Task factory/defaults and model-level normalization helpers
  store/
    in-memory-store.js    # Singleton in-memory state (tasks, nextId) and id generation
  utils/
    validators.js         # Input and domain validation helpers for commands and task fields
    formatter.js          # Output formatting helpers for task rows, lists, and errors
```

## 3. Module responsibilities

### src/index.js
- Exports: none (entry script).
- Responsibilities: parse argv, validate command name, route to command handlers, set process exit code on failures.
- Depends on: `commands/create-task.js`, `commands/list-tasks.js`, `commands/update-task.js`, `commands/delete-task.js`, `utils/formatter.js`.

### src/commands/create-task.js
- Exports: `createTaskCommand(args)`.
- Responsibilities: parse create arguments, validate required title, call service create, print created task.
- Depends on: `services/task-service.js`, `utils/validators.js`, `utils/formatter.js`.

### src/commands/list-tasks.js
- Exports: `listTasksCommand(args)`.
- Responsibilities: parse filter/sort flags, validate option values, call list service, render empty state or task list.
- Depends on: `services/task-service.js`, `utils/validators.js`, `utils/formatter.js`.

### src/commands/update-task.js
- Exports: `updateTaskCommand(args)`.
- Responsibilities: parse id and update fields, validate patch payload, call update service, print updated task.
- Depends on: `services/task-service.js`, `utils/validators.js`, `utils/formatter.js`.

### src/commands/delete-task.js
- Exports: `deleteTaskCommand(args)`.
- Responsibilities: parse id, validate id, call delete service, print confirmation message.
- Depends on: `services/task-service.js`, `utils/validators.js`, `utils/formatter.js`.

### src/services/task-service.js
- Exports: `createTask(input)`, `listTasks(options)`, `updateTask(id, patch)`, `deleteTask(id)`.
- Responsibilities: enforce domain rules, read/write in-memory store, keep mutation atomic, perform filtering/sorting.
- Depends on: `store/in-memory-store.js`, `models/task.js`, `utils/validators.js`.

### src/models/task.js
- Exports: `buildTask(input, nextId, nowIso)`, `applyTaskUpdate(task, patch, nowIso)`.
- Responsibilities: apply defaults, normalize model fields, produce valid Task objects.
- Depends on: `utils/validators.js`.

### src/store/in-memory-store.js
- Exports: `taskStore`, `getNextId()`.
- Responsibilities: hold runtime state (`tasks`, `nextId`) and provide deterministic id increment behavior.
- Depends on: none.

### src/utils/validators.js
- Exports: `validateCommandName`, `validateId`, `validateCreateInput`, `validateUpdateInput`, `validateListOptions`.
- Responsibilities: centralize all command and field validation logic; raise descriptive validation errors.
- Depends on: none.

### src/utils/formatter.js
- Exports: `formatTask`, `formatTaskList`, `formatError`, `formatDeleteConfirmation`, `formatEmptyState`.
- Responsibilities: produce stable CLI output shapes for success and failure responses.
- Depends on: none.

## 4. Error handling strategy

### Error types

1. `ValidationError`
- Purpose: malformed input, unknown commands/flags, unsupported enum values, empty title.
- Thrown in: `utils/validators.js`.
- Propagated through: command handlers in `src/commands/*.js` to `src/index.js`.

2. `NotFoundError`
- Purpose: valid id format but no matching task for update/delete.
- Thrown in: `services/task-service.js`.
- Propagated through: command handlers to `src/index.js`.

3. `CommandError`
- Purpose: invalid command usage or missing required arguments after parsing.
- Thrown in: command handlers (`src/commands/*.js`) when usage contract is violated.
- Propagated through: `src/index.js`.

4. `Error` (unexpected)
- Purpose: unexpected runtime failures.
- Thrown in: any module when an unanticipated exception occurs.
- Handled in: `src/index.js` top-level `try/catch` with generic user-facing message.

### Handling rules

- Command handlers and service operations use `try/catch` around operations that may fail.
- Expected errors are printed to stderr as `Error: <message>`.
- Unexpected errors are logged with `console.error` and mapped to a generic message.
- Any failure path exits with a non-zero process exit code.
- Validation completes before state mutation; invalid operations do not partially mutate `TaskStore`.
