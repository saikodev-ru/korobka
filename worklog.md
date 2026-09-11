# Worklog — Коробка

---
Task ID: R1 (recovery)
Agent: main (Z.ai Code)
Task: Восстановить проект «Коробка» после пересоздания контейнера и залить на GitHub (saikodev-ru/korobka)

Work Log:
- Обнаружено: контейнер пересоздан, исходников нет (только .env/.gitignore); GitHub-репо пустой (без веток)
- Восстановлен каркас: package.json (Next 16, TS5, Tailwind 4, zustand, framer-motion, sonner, next-themes, radix), tsconfig, next.config, eslint flat-config (прямой импорт eslint-config-next), postcss, prisma schema
- globals.css: дизайн-система (лаванда #7c6cf0 / бирюза #14b8a6 / графит #131316-#1e1f24), утилиты .glass-pill / .glass-card / .bang (жирный italic) / no-scrollbar / red-dot ping / floaty / box-spin / pt-safe / pb-safe, sonner-сдвиг под мобильную шапку (top: safe-area+4.9rem при <768px)
- lib/: types.ts (Member, Schedule cycle/custom/free, AVATAR_EMOJIS, BANNERS, COLORS), schedule.ts (isWorkingOn, monthGrid Пн-первый, nextDayOff/nextWorkDay), share.ts (коды ГД1.<base64url>, валидация v:1), games.tsx (12 игр + фирменные 2-цветные SVG-иконки), store.ts (zustand persist key=graphik-druzey-v1 v4: me/friends/shareStale/tab), notify.ts (локальные пуши через SW showNotification), utils.ts
- hooks: use-pwa.ts (useSyncExternalStore-детект standalone/ios/mobile + useInstallPrompt c beforeinstallprompt), use-now.ts (live-часы через rAF против react-hooks/set-state-in-effect)
- ui/: button (cva, variant teal/pill), dialog, alert-dialog, switch, input, label, sonner (стеклянные тосты .glass-pill стиль)
- app/: logo.tsx (CSS 3D-куб с «?», фикс: perspective в px-строке + block + backface hidden), shake-button.tsx (тряска + toast при blocked; фикс порядка {...props} ДО onClick), theme-toggle.tsx, dirty-bar.tsx (PORTAL в document.body — фикс containing-block от transform родителя), time-picker.tsx (iPhone-колёса snap), avatar-crop.tsx (зум/драг, 128×128 pixelated), member-card.tsx (градиентная карточка), install-gate.tsx («Скачать коробку» → canPrompt / iOS-инструкция / «Блин…» + «Всё равно открыть»), sw-register.tsx
- screens: welcome-screen.tsx (сплэш-параллакс + 6 шагов: имя/маскот/цвет → игры → график → свой календарь → time-picker «во сколько дома» → превью; свайпы, sticky-шапка шага, draft передаётся в onDone), today-screen.tsx (мой статус + таймер до выходного, общие игры свободных, «кто дома», checkFreedNotifications), schedule-screen.tsx (пресеты + календарь + DirtyBar), share-screen.tsx (мой код ГД1, копирование, Web Share, импорт чужого, список друзей + tg-link + удаление), profile-screen.tsx (чужой профиль + «Написать», плитки-редактор Данные/Внешний вид/График, guard AlertDialog остаться/не сохранять/сохранить, сброс коробки)
- page.tsx: mounted-gate (useSyncExternalStore), InstallGate → Welcome → AppShell; мобильный хедер (з.11): playable-пилюля (аватары внахлёст с цветными border-2, max3+«+N», пусто=луна, live 30с) + share-пилюля (UserRoundPlus, red-dot при shareStale) + title-пилюля «КОРОБКА+лого» ml-auto (long-press 430мс + vibrate → профиль) + ThemeToggle; десктоп: Discord-сайдбар 84px (лого, 4 таба, layoutId-индикатор, тема, аватар); мобильный навбар glass-pill (Сегодня/График/Поделиться/Профиль, layoutId-пилюля активности, red dot); тост-подсказка «поделись кодом» раз в сессию
- public/: manifest.webmanifest, sw.js (офлайн-оболочка + notificationclick), иконки 192/512/apple-180/badge-72 через sharp (scripts/make-icons.cjs)
- Багфиксы по ходу: useSyncExternalStore getSnapshot cache (infinite loop), ShakeButton {...props} поверх onClick, welcome onDone(draft) не сохранял draft (setMe отсутствовал в page), viewFriend рендерился только на tab=profile, логотип inline→block 3D, next.config ключ eslint удалён
- Браузер-проверка (agent-browser, 390×844 и 1440×900): полный welcome e2e, today с двумя юзерами (общие игры/таймеры 18:00/19:00), импорт кода (валидный/битый), график 2/2→3/3 с DirtyBar у низа экрана и применением, long-press, guard, обе темы, десктоп-сайдбар. lint: 0, tsc: 0, dev.log чистый
- git: инициализация origin=https://github.com/saikodev-ru/korobka.git, .gitignore расширен (.next, dev.log, db, .env), коммит и push в main

Stage Summary:
- Проект «Коробка» полностью восстановлен в состоянии после запроса 11 и опубликован на GitHub
- Ключевые артефакты: src/app/page.tsx (хедер/сайдбар/навбар), src/components/screens/* (5 экранов), src/lib/* (типы/графики/коды/игры/стор), public/manifest+sw+icons
- Сохранённые конвенции: zustand persist v4 ключ graphik-druzey-v1; Member поля optional; .glass-pill для всех плавающих панелей; portal для fixed внутри motion-контейнеров
