# Tumli_test

## Task Manager Calendar

Simple React task manager represented as a day calendar with time slots.

The app should allow users to plan tasks during a selected day, create/edit/delete tasks, and show task state based on the current time.

## Core Requirements

- Show a selected day split into time slots.
- Display tasks as cards inside the day schedule.
- Allow creating a task with title, date, start time, and duration/end time.
- Allow editing existing tasks.
- Allow deleting tasks with a confirmation guard.
- Show task state:
  - `pending` - task has not started yet.
  - `active` - task is currently in progress.
  - `done` - task has already ended.
- React correctly to time changes:
  - `pending` tasks should update their "in N min" label every minute.
  - task state should automatically change when current time reaches task start/end.

## MVP Scope

This test task should stay focused and fit into a realistic 4-5 hour implementation window.

The MVP should include:

- Vite + React + TypeScript;
- lightweight FSD-inspired folder structure;
- Redux Toolkit + RTK Query setup;
- static hardcoded JSON seed;
- localStorage-backed fake API adapter;
- i18next with Ukrainian and English translations;
- day calendar view for one selected date;
- 24-hour schedule with 30-minute slots;
- task blocks rendered once and spanning their time interval;
- create/edit task modal;
- custom delete confirmation modal;
- no-overlap validation;
- no cross-day tasks;
- derived task status;
- one global current time ticker;
- mobile-first responsive layout;
- basic modal accessibility;
- a small set of unit tests for critical time/scheduling helpers.

Anything outside this list should be considered optional or post-release unless it is required to make the MVP work correctly.

## Post-Release Improvements

Possible improvements after the MVP:

- compact week strip for faster day switching;
- stronger modal focus trap and more complete accessibility polish;
- richer task metadata such as description, color, category, or priority;
- drag-and-drop task rescheduling;
- resizing tasks directly in the calendar;
- backend API integration instead of localStorage;
- optimistic updates and server error handling;
- UI/integration tests;
- empty-state and onboarding polish;
- better localization details such as pluralization rules for minutes;
- calendar density preferences;
- keyboard shortcuts.

## Main Architecture Decisions

### Project Stack

Use:

- Vite;
- React;
- TypeScript;
- Redux Toolkit;
- RTK Query;
- i18next.
- date-fns;
- react-hook-form;
- zod;
- Tailwind CSS;
- Vitest.

The UI should support two languages:

- Ukrainian;
- English.

The app can default to Ukrainian, with a language switcher in the interface.

### Project Structure

Use an FSD-inspired structure, but avoid full FSD ceremony for this small test task.

Recommended structure:

```txt
src/
  app/
    providers/
    store.ts
  pages/
    calendar-page/
  features/
    task-form/
    delete-task/
    language-switcher/
  entities/
    task/
      api/
      lib/
      model/
      ui/
  shared/
    i18n/
    lib/
    styles/
    ui/
```

The goal is clear responsibility boundaries without overengineering.

Guidelines:

- components should stay short and focused;
- business/time logic should live in pure helpers under `lib`;
- API/data access logic should live separately from UI;
- shared UI primitives should be reusable but not overabstracted;
- follow SOLID, KISS, YAGNI, and DRY pragmatically.

### Task Status Is Derived

Task status should not be stored in the task entity.

Stored task data should contain only facts:

```ts
type Task = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
};
```

Status is calculated from `startTime`, `endTime`, and current time:

```ts
if (now < taskStart) {
  return "pending";
}

if (now >= taskStart && now < taskEnd) {
  return "active";
}

return "done";
```

This avoids storing duplicated state and prevents synchronization bugs.

### One Global Time Ticker

The app should not create a `setInterval` inside every task card.

Instead, it should have a single global `currentTime` source that updates once per minute.
Task cards should receive or select this value and derive their display state from it.

Possible implementation options:

- React Context for a small app.
- Redux slice if keeping all app state in Redux.
- Zustand store if a lightweight external store is preferred.

Since the project should use RTK Query for task data, a pragmatic split is:

- RTK Query for task fetching and mutations.
- A small global ticker for `currentTime`.
- Derived helpers/selectors for task status and display labels.

The ticker should update on minute boundaries.
Instead of starting a plain `setInterval(..., 60000)` immediately, the implementation should first wait until the next minute starts and then tick every 60 seconds.
This keeps labels such as `in N min` aligned with real clock minutes.

### RTK Query For Task Data

The project uses RTK Query, so task operations should be exposed as API hooks:

```ts
useGetTasksQuery(date)
useCreateTaskMutation()
useUpdateTaskMutation()
useDeleteTaskMutation()
```

If there is no real backend, the API can be mocked with a localStorage-backed fake API.
This keeps the application structure close to a real production setup while remaining simple for the test task.

Initial task data should be loaded from a static hardcoded JSON seed file.
Seed data should not be generated dynamically on app start.
After the app starts, created/updated/deleted tasks can be persisted in localStorage.

Seed/localStorage lifecycle:

- if localStorage is empty, initialize tasks from the static JSON seed;
- after initialization, read and write tasks through localStorage;
- do not regenerate seed data on every app start;
- use a namespaced storage key, for example `task-calendar:v1`.

The version suffix is useful for future storage schema changes.
For example, if task fields change later, the app can move from `task-calendar:v1` to `task-calendar:v2` without trying to parse incompatible old data.

Redux store is still useful because RTK Query requires API middleware and reducer setup.
However, regular task state should not be duplicated in a separate Redux slice.
Task data should live in the RTK Query cache and persistence layer.

This creates a clear data access layer boundary.
The UI works with RTK Query hooks and does not know whether data comes from localStorage, a static file, or a real backend API.
If a backend appears later, the localStorage implementation can be replaced with a real API `baseQuery`/endpoints while keeping most components unchanged.

This is a practical use of Data Access Layer / Repository-style separation.
The localStorage implementation acts as an adapter that can later be replaced by an HTTP API adapter.

### Date And Time Helpers

Use `date-fns` for date parsing, comparison, formatting, and minute calculations.

Avoid ad hoc date string manipulation in UI components.
Date/time operations should live in pure helper functions, for example:

- parse task start/end into Date objects;
- compare selected date with today;
- calculate task status;
- format task intervals;
- calculate remaining minutes;
- validate 30-minute steps.

## Scheduling Rules

### No Overlapping Tasks

Tasks should not be allowed to overlap within the same day.

This matches a real calendar/planning model: a user should not be able to schedule two tasks or appointments at the same time.

Overlap validation should run on both create and edit.

Interval overlap rule:

```ts
function hasTimeConflict(task: Task, existingTasks: Task[]) {
  return existingTasks.some((existingTask) => {
    return (
      existingTask.id !== task.id &&
      existingTask.date === task.date &&
      task.startTime < existingTask.endTime &&
      task.endTime > existingTask.startTime
    );
  });
}
```

The exact implementation should compare normalized date/time values, not raw strings, unless the format is guaranteed to be zero-padded `HH:mm`.

### Variable Task Duration

Tasks can have any duration.

The UI should allow selecting:

- start time;
- end time or duration.

Internally, storing `startTime` and `endTime` is convenient for conflict checks and display.

For this test task, time selection should be limited to 30-minute steps.
This keeps the UI simpler and matches the calendar slot grid.

Tasks must stay within one calendar day.
Cross-day tasks such as `23:30-00:30` are not allowed.
Validation can show a friendly message, for example: "Not today. Rest and continue tomorrow with a fresh head."

### Form Validation

Use `react-hook-form` for form state and `zod` for validation rules.

Validation rules:

- title is required;
- date is required;
- start time is required;
- end time is required;
- start and end time must be aligned to 30-minute steps;
- end time must be after start time;
- task must stay within one day;
- task must not overlap another task on the same day.

Time/domain validation should be reusable and testable.
The form component should not contain large inline validation logic.

## UI/UX Plan

### Calendar Scope

Use a day calendar view as the main screen.

Recommended controls:

- selected date;
- previous day button;
- today button;
- next day button;
- create task button.

A compact week strip can be treated as a post-release feature.

### Time Slots

The day should include all 24 hours.

Slots can be based on a fixed step, for example 30 minutes.
For this implementation, use 30-minute slots.

Empty slots should be compact but still clickable.
Occupied slots/tasks should have enough height for a readable task card.

Important: a long task should not be duplicated in every slot it touches.
It should be rendered as one task card spanning its time interval.

Example:

- task `10:00-11:30` should appear as one 90-minute task block;
- it should not appear separately at `10:00`, `10:30`, and `11:00`.

Recommended rendering approach:

- use CSS grid for the day schedule;
- represent the day as 48 rows of 30 minutes;
- render each task once;
- calculate task `grid-row` from start time and duration;
- keep empty slots clickable.

### Create/Edit Flow

- Click on an empty slot: open task modal with selected date and start time prefilled.
- Click on a task card: open edit modal.
- Use a global create button: open modal with manually selectable date and time.

Modal fields:

- title;
- date;
- start time;
- end time or duration.

Validation:

- title is required;
- end time must be after start time;
- start and end time must be aligned to 30-minute steps;
- task must stay within the selected day;
- task must not overlap with another task on the same day.

### Delete Flow

Deleting should be possible:

- from the task card;
- from the edit modal.

Both delete actions should have a confirmation guard to prevent accidental deletion.

For a simple implementation, `window.confirm` is acceptable.
For this implementation, use a small custom confirmation modal.

### Modal Accessibility

Custom modals should include basic accessibility behavior:

- close on `Esc`;
- close on backdrop click where appropriate;
- focus the first meaningful field/action on open;
- restore focus after close where practical;
- use `role="dialog"` and `aria-modal="true"`;
- provide accessible labels for fields and icon buttons.

### Mobile-First UI

Use a mobile-first approach.

Mobile layout:

- one-column day agenda;
- compact sticky header/actions;
- full-width task cards;
- readable tap targets;
- full-width centered modal layout.

Desktop layout can add more horizontal space, but should keep the same core interaction model.

### Styling

Use Tailwind CSS.

Use Tailwind utilities directly for simple layout and one-off styles.
Use `@apply` in CSS files only for repeated semantic patterns, for example:

- buttons;
- inputs;
- modal surfaces;
- task cards;
- status badges.

Avoid turning `@apply` into a large custom CSS framework.
Keep JSX readable with small UI components and a `cn()` helper where useful.

## Display Rules

For each task:

- `pending`: show `in N min`;
- `active`: show `in progress`;
- `done`: show the task interval, for example `10:00-10:30`.

These values should be derived from the current time and task interval.

Status behavior by selected date:

- past date: all tasks are `done`;
- today: task status is calculated from the current time;
- future date: all tasks are `pending`.

## Testing Plan

Use Vitest for unit tests.

Prioritize tests for time and scheduling logic:

- `getTaskStatus`;
- `getTaskDisplayLabel`;
- `hasTimeConflict`;
- `isThirtyMinuteStep`;
- `validateTaskTimeRange`;
- selected date behavior for past/today/future dates.

UI tests are optional for this test task.
The highest-value tests are pure unit tests around calendar rules.

## Suggested Implementation Order

1. Set up React app structure.
2. Add Redux Toolkit and RTK Query.
3. Add i18next with Ukrainian and English translations.
4. Add Tailwind CSS and base shared styles.
5. Define task types and date/time helper functions with date-fns.
6. Add unit tests for critical time/scheduling helpers.
7. Add static JSON seed data.
8. Implement localStorage-backed fake task API via RTK Query.
9. Implement global current time ticker aligned to minute boundaries.
10. Build day calendar layout with 24 hours and 30-minute CSS grid slots.
11. Render task blocks by interval.
12. Add create/edit modal with react-hook-form and zod.
13. Add conflict validation.
14. Add custom guarded delete modal.
15. Add modal accessibility behavior.
16. Polish responsive mobile-first UI and edge cases.

---

# Українська версія

## Task Manager Calendar

Простий task manager на React у форматі денного календаря з часовими слотами.

Застосунок має дозволяти користувачу планувати задачі протягом обраного дня, створювати/редагувати/видаляти задачі та показувати стан задачі відповідно до поточного часу.

## Основні вимоги

- Показати обраний день, розбитий на часові слоти.
- Відображати задачі як картки всередині денного розкладу.
- Дозволити створення задачі з назвою, датою, часом початку та тривалістю/часом завершення.
- Дозволити редагування задач.
- Дозволити видалення задач із підтвердженням.
- Показувати стан задачі:
  - `pending` - задача ще не почалась.
  - `active` - задача зараз у процесі.
  - `done` - задача вже завершилась.
- Коректно реагувати на зміну часу:
  - для `pending` задач напис `через N хв` має оновлюватись щохвилинно;
  - стан задачі має автоматично змінюватись, коли поточний час досягає початку або завершення задачі.

## MVP Scope

Це тестове завдання має залишатися сфокусованим і вкладатися в реалістичні 4-5 годин реалізації.

MVP має включати:

- Vite + React + TypeScript;
- легку FSD-inspired структуру папок;
- Redux Toolkit + RTK Query setup;
- статичний hardcoded JSON seed;
- localStorage-backed fake API adapter;
- i18next з українською та англійською мовами;
- day calendar view для однієї обраної дати;
- 24-годинний розклад із 30-хвилинними слотами;
- task blocks, які рендеряться один раз і займають свій часовий інтервал;
- create/edit task modal;
- custom delete confirmation modal;
- no-overlap validation;
- заборону cross-day tasks;
- derived task status;
- один глобальний current time ticker;
- mobile-first responsive layout;
- базову accessibility для модалок;
- невеликий набір unit tests для критичних time/scheduling helpers.

Все поза цим списком вважається optional або post-release, якщо воно не потрібне для коректної роботи MVP.

## Post-Release Improvements

Можливі покращення після MVP:

- compact week strip для швидшого перемикання днів;
- сильніший modal focus trap і повніше accessibility polish;
- додаткові task metadata: description, color, category або priority;
- drag-and-drop rescheduling;
- resizing tasks прямо в календарі;
- backend API integration замість localStorage;
- optimistic updates і server error handling;
- UI/integration tests;
- empty-state і onboarding polish;
- кращі localization details, наприклад pluralization rules для хвилин;
- calendar density preferences;
- keyboard shortcuts.

## Основні архітектурні рішення

### Стек проєкту

Використовуємо:

- Vite;
- React;
- TypeScript;
- Redux Toolkit;
- RTK Query;
- i18next.
- date-fns;
- react-hook-form;
- zod;
- Tailwind CSS;
- Vitest.

Інтерфейс має підтримувати дві мови:

- українську;
- англійську.

За замовчуванням можна використовувати українську мову, а в інтерфейсі додати перемикач мови.

### Структура проєкту

Використовуємо FSD-inspired структуру, але без повної FSD-церемонії для такого невеликого тестового завдання.

Рекомендована структура:

```txt
src/
  app/
    providers/
    store.ts
  pages/
    calendar-page/
  features/
    task-form/
    delete-task/
    language-switcher/
  entities/
    task/
      api/
      lib/
      model/
      ui/
  shared/
    i18n/
    lib/
    styles/
    ui/
```

Ціль - мати зрозумілі межі відповідальності без overengineering.

Правила:

- компоненти мають бути короткими й сфокусованими;
- бізнес-логіка і логіка часу має жити в pure helpers у `lib`;
- API/data access логіка має бути окремо від UI;
- shared UI primitives мають бути перевикористовуваними, але без зайвих абстракцій;
- SOLID, KISS, YAGNI та DRY застосовуємо прагматично.

### Статус задачі є derived state

Статус задачі не потрібно зберігати всередині task entity.

У задачі зберігаються тільки факти:

```ts
type Task = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
};
```

Статус обчислюється з `startTime`, `endTime` і поточного часу:

```ts
if (now < taskStart) {
  return "pending";
}

if (now >= taskStart && now < taskEnd) {
  return "active";
}

return "done";
```

Це дозволяє не дублювати стан і уникнути багів із синхронізацією.

### Один глобальний time ticker

Не варто створювати `setInterval` у кожній картці задачі.

Натомість у застосунку має бути одне глобальне джерело `currentTime`, яке оновлюється раз на хвилину.
Картки задач мають отримувати або селектити це значення й на його основі обчислювати свій стан і текст.

Можливі варіанти реалізації:

- React Context для маленького застосунку.
- Redux slice, якщо весь app state тримається в Redux.
- Zustand store, якщо потрібен легкий зовнішній store.

Оскільки для task data варто використати RTK Query, прагматичний поділ такий:

- RTK Query для отримання задач і mutations.
- Невеликий глобальний ticker для `currentTime`.
- Derived helpers/selectors для статусу задачі та display labels.

Ticker має оновлюватися на межі хвилини.
Замість простого `setInterval(..., 60000)` одразу після mount, реалізація має спочатку дочекатися початку наступної хвилини, а вже потім оновлювати час кожні 60 секунд.
Так labels типу `через N хв` будуть синхронізовані з реальним годинником.

### RTK Query для task data

Оскільки на проєкті використовується RTK Query, операції із задачами варто винести в API hooks:

```ts
useGetTasksQuery(date)
useCreateTaskMutation()
useUpdateTaskMutation()
useDeleteTaskMutation()
```

Якщо реального backend немає, API можна замокати через fake API з localStorage.
Так структура застосунку буде схожа на production-підхід, але залишиться простою для тестового завдання.

Початкові задачі варто завантажувати зі статичного hardcoded JSON seed file.
Seed data не потрібно генерувати динамічно при запуску застосунку.
Після запуску застосунку створені/оновлені/видалені задачі можна зберігати в localStorage.

Seed/localStorage lifecycle:

- якщо localStorage порожній, ініціалізуємо задачі зі статичного JSON seed;
- після ініціалізації читаємо й пишемо задачі через localStorage;
- не перегенеровуємо seed data при кожному запуску;
- використовуємо namespaced storage key, наприклад `task-calendar:v1`.

Суфікс версії корисний для майбутніх змін storage schema.
Наприклад, якщо пізніше зміняться поля задачі, застосунок може перейти з `task-calendar:v1` на `task-calendar:v2` і не намагатися парсити несумісні старі дані.

Redux store все одно потрібен, бо RTK Query потребує API middleware і reducer setup.
Але звичайний task state не потрібно дублювати в окремому Redux slice.
Task data має жити в RTK Query cache і persistence layer.

Це створює чітку межу data access layer.
UI працює з RTK Query hooks і не знає, звідки саме приходять дані: з localStorage, статичного файлу чи реального backend API.
Якщо пізніше з'явиться backend, localStorage-реалізацію можна замінити на справжній API `baseQuery`/endpoints, а більшість компонентів залишиться без змін.

Це практичне використання Data Access Layer / Repository-style separation.
localStorage-реалізація працює як adapter, який пізніше можна замінити на HTTP API adapter.

### Date and time helpers

Для роботи з датами використовуємо `date-fns`.

Не пишемо ad hoc маніпуляції з date strings прямо в UI компонентах.
Операції з датою/часом мають жити в pure helper functions, наприклад:

- парсинг task start/end у Date objects;
- порівняння selected date із сьогоднішнім днем;
- обчислення task status;
- форматування інтервалів;
- обчислення remaining minutes;
- перевірка 30-хвилинного кроку.

## Правила планування

### Без перетину задач

Задачі не мають перетинатися в межах одного дня.

Це відповідає реальній моделі календаря: користувач не повинен мати можливість запланувати дві задачі або зустрічі на один і той самий час.

Валідація перетинів має виконуватись і при створенні, і при редагуванні.

Правило перетину інтервалів:

```ts
function hasTimeConflict(task: Task, existingTasks: Task[]) {
  return existingTasks.some((existingTask) => {
    return (
      existingTask.id !== task.id &&
      existingTask.date === task.date &&
      task.startTime < existingTask.endTime &&
      task.endTime > existingTask.startTime
    );
  });
}
```

У реальній реалізації краще порівнювати нормалізовані date/time values, а не сирі рядки, якщо формат `HH:mm` не гарантовано zero-padded.

### Довільна тривалість задачі

Задача може мати будь-яку тривалість.

UI має дозволяти обрати:

- час початку;
- час завершення або тривалість.

Всередині зручно зберігати `startTime` і `endTime`, бо це спрощує перевірку конфліктів і відображення.

Для цього тестового завдання вибір часу обмежуємо кроком 30 хвилин.
Це спрощує UI і відповідає календарній сітці.

Задача має залишатися в межах одного календарного дня.
Задачі через межу дня, наприклад `23:30-00:30`, не дозволяємо.
У валідації можна показати дружнє повідомлення, наприклад: "Та ні, іди відпочинь і завтра на свіжу голову продовжиш."

### Валідація форми

Використовуємо `react-hook-form` для form state і `zod` для validation rules.

Правила валідації:

- назва обов'язкова;
- дата обов'язкова;
- час початку обов'язковий;
- час завершення обов'язковий;
- час початку й завершення мають бути кратні 30 хвилинам;
- час завершення має бути пізніше за час початку;
- задача має залишатися в межах одного дня;
- задача не має перетинатися з іншою задачею того самого дня.

Time/domain validation має бути перевикористовуваною і тестованою.
Компонент форми не має містити великі inline validation blocks.

## UI/UX план

### Обсяг календаря

Основний екран - day calendar view.

Рекомендовані controls:

- обрана дата;
- кнопка попереднього дня;
- кнопка today;
- кнопка наступного дня;
- кнопка створення задачі.

Компактний week strip залишаємо як post-release feature.

### Часові слоти

День має включати всі 24 години.

Слоти можуть бути побудовані з фіксованим кроком, наприклад 30 хвилин.
Для цієї реалізації використовуємо 30-хвилинні слоти.

Порожні слоти мають бути компактними, але все ще клікабельними.
Зайняті слоти/задачі мають мати достатню висоту, щоб картка задачі була читабельною.

Важливо: довга задача не має дублюватися в кожному слоті, який вона займає.
Вона має рендеритись як одна картка, що займає свій часовий інтервал.

Приклад:

- задача `10:00-11:30` має відображатись як один 90-хвилинний блок;
- вона не має окремо дублюватись у `10:00`, `10:30` і `11:00`.

Рекомендований підхід до рендеру:

- використовувати CSS grid для денного розкладу;
- представляти день як 48 рядків по 30 хвилин;
- рендерити кожну задачу один раз;
- обчислювати task `grid-row` на основі start time і duration;
- залишити порожні слоти клікабельними.

### Create/Edit flow

- Клік по порожньому слоту: відкрити modal створення з уже підставленими датою та start time.
- Клік по task card: відкрити edit modal.
- Глобальна кнопка створення: відкрити modal з можливістю вручну обрати дату й час.

Поля modal:

- назва;
- дата;
- час початку;
- час завершення або тривалість.

Валідація:

- назва обов'язкова;
- час завершення має бути пізніше за час початку;
- час початку й завершення мають бути кратні 30 хвилинам;
- задача має залишатися в межах обраного дня;
- задача не має перетинатися з іншою задачею в межах того самого дня.

### Delete flow

Видалення має бути доступне:

- з task card;
- з edit modal.

Обидві дії видалення мають мати confirmation guard, щоб уникнути випадкового видалення.

Для цієї реалізації використовуємо власний невеликий custom confirmation modal.

### Accessibility модалок

Custom modals мають включати базову accessibility поведінку:

- закриття по `Esc`;
- закриття по backdrop click там, де це доречно;
- фокус на перше meaningful поле/дію при відкритті;
- повернення фокуса після закриття, якщо це практично;
- `role="dialog"` і `aria-modal="true"`;
- accessible labels для полів та icon buttons.

### Mobile-first UI

Використовуємо mobile-first підхід.

Mobile layout:

- one-column day agenda;
- компактний sticky header/actions;
- task cards на всю ширину;
- читабельні tap targets;
- full-width centered modal layout.

Desktop layout може додати більше горизонтального простору, але core interaction model залишається тим самим.

### Стилізація

Використовуємо Tailwind CSS.

Tailwind utilities використовуємо напряму для простого layout і одноразових стилів.
`@apply` у CSS файлах використовуємо тільки для повторюваних semantic patterns, наприклад:

- buttons;
- inputs;
- modal surfaces;
- task cards;
- status badges.

Не перетворюємо `@apply` на великий custom CSS framework.
JSX має залишатися читабельним через маленькі UI components і `cn()` helper там, де це корисно.

## Правила відображення

Для кожної задачі:

- `pending`: показувати `через N хв`;
- `active`: показувати `в процесі`;
- `done`: показувати інтервал задачі, наприклад `10:00-10:30`.

Ці значення мають обчислюватись із поточного часу та інтервалу задачі.

Поведінка статусів залежно від обраної дати:

- минулий день: усі задачі `done`;
- сьогодні: статус задачі обчислюється відносно поточного часу;
- майбутній день: усі задачі `pending`.

## План тестування

Використовуємо Vitest для unit tests.

Пріоритет - тести для логіки часу та планування:

- `getTaskStatus`;
- `getTaskDisplayLabel`;
- `hasTimeConflict`;
- `isThirtyMinuteStep`;
- `validateTaskTimeRange`;
- поведінка selected date для минулого/сьогоднішнього/майбутнього дня.

UI tests для цього тестового завдання опційні.
Найбільшу цінність дають pure unit tests навколо calendar rules.

## Рекомендований порядок реалізації

1. Налаштувати структуру React app.
2. Додати Redux Toolkit і RTK Query.
3. Додати i18next з українською та англійською мовами.
4. Додати Tailwind CSS і базові shared styles.
5. Описати task types і date/time helper functions з date-fns.
6. Додати unit tests для критичних time/scheduling helpers.
7. Додати статичний JSON seed data.
8. Реалізувати fake task API з localStorage через RTK Query.
9. Реалізувати глобальний current time ticker, синхронізований із межами хвилин.
10. Побудувати day calendar layout із 24 годинами та 30-хвилинними CSS grid slots.
11. Відрендерити task blocks відповідно до інтервалів.
12. Додати create/edit modal з react-hook-form і zod.
13. Додати conflict validation.
14. Додати власний guarded delete modal.
15. Додати accessibility поведінку для модалок.
16. Відполірувати responsive mobile-first UI та edge cases.
