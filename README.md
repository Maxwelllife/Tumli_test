# Tumli_test

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

## Як запустити

Встановити залежності:

```bash
npm install
```

Запустити dev server:

```bash
npm run dev
```

Запустити unit tests:

```bash
npm test
```

Перевірити production build:

```bash
npm run build
```

## GitHub Pages

Проєкт готовий до деплою через GitHub Actions.

Налаштування репозиторію:

1. Запушити проєкт на GitHub.
2. Відкрити settings репозиторію.
3. Перейти в `Pages`.
4. У `Build and deployment` вибрати source `GitHub Actions`.
5. Запушити зміни в гілку `main`.

Workflow лежить у `.github/workflows/deploy.yml`.
Він встановлює залежності через `npm ci`, запускає unit tests, збирає Vite app і деплоїть папку `dist` на GitHub Pages.

Vite `base` налаштований автоматично:

- локально: `/`;
- у GitHub Actions: `/<repository-name>/`.

## Навчальні нотатки

Додаткові implementation notes є в `docs/IMPLEMENTATION_NOTES.md`.
Там пояснено, навіщо RTK Query використовується разом із localStorage, чому task status є derived state, і чому в застосунку один глобальний time ticker.

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

Так як реального backend немає, API можна замокати через fake API з localStorage.
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
