import type { Member } from '../data/club';

interface RsvpEntry {
  status: 'yes' | 'no' | 'maybe' | 'unknown';
  comment: string;
  canLetIn: boolean;
}

interface BacklogItem {
  id: string;
  title: string;
  author: string;
  anonymous: boolean;
}

interface VacationItem {
  id: string;
  member: string;
  from: string;
  to: string;
  reason: string;
}

interface JoinApplication {
  id: string;
  name: string;
  invitedBy: string;
  reason: string;
  date: string;
}

const members: Member[] = JSON.parse(
  document.getElementById('members-data')!.textContent!
);
const initialBacklog: BacklogItem[] = JSON.parse(
  document.getElementById('backlog-data')!.textContent!
);

const storage = {
  rsvp: 'gossip-monday:rsvp',
  backlog: 'gossip-monday:backlog',
  vacations: 'gossip-monday:vacations',
  applications: 'gossip-monday:applications',
};

const statusCopy: Record<string, [string, string]> = {
  yes: ['Приду', 'status-yes'],
  no: ['Не приду', 'status-no'],
  maybe: ['Возможно', 'status-maybe'],
  unknown: ['Не отметился', 'status-unknown'],
};

// Track which element opened a modal so we can return focus
let lastModalTrigger: HTMLElement | null = null;

function getJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — silently ignore
  }
}

function memberById(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

function el(tag: string, attrs?: Record<string, string>, children?: (Node | string)[]): HTMLElement {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        node.className = value;
      } else {
        node.setAttribute(key, value);
      }
    }
  }
  if (children) {
    for (const child of children) {
      node.append(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }
  return node;
}

function text(content: string): Text {
  return document.createTextNode(content);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value + 'T00:00:00'));
}

function initRsvp(): Record<string, RsvpEntry> {
  const existing = getJson<Record<string, RsvpEntry> | null>(storage.rsvp, null);
  if (existing) return existing;
  const defaults: Record<string, RsvpEntry> = Object.fromEntries(
    members.map((m) => [
      m.id,
      { status: 'unknown' as const, comment: '', canLetIn: m.canLetIn },
    ])
  );
  setJson(storage.rsvp, defaults);
  return defaults;
}

function renderRsvp(): void {
  const data = initRsvp();
  const board = document.getElementById('rsvp-board')!;
  board.replaceChildren();

  for (const member of members) {
    const item = data[member.id] || { status: 'unknown', comment: '', canLetIn: member.canLetIn };
    const [label, cls] = statusCopy[item.status] || statusCopy.unknown;

    const avatar = el('div', { className: 'avatar', style: `background:${member.color}` }, [member.avatar]);

    const nameEl = el('strong', {}, [member.name]);
    const statusPill = el('span', { className: `status-pill ${cls}` }, [label]);
    const infoChildren: (Node | string)[] = [nameEl, document.createElement('br'), statusPill];

    if (item.canLetIn) {
      infoChildren.push(el('span', { className: 'status-pill status-yes' }, ['🔑 впускает']));
    }
    if (item.comment) {
      const commentEl = el('p', { style: 'margin:8px 0 0;color:#555' }, [`"${item.comment}"`]);
      infoChildren.push(commentEl);
    }
    const info = el('div', {}, infoChildren);

    const btn = el('button', { className: 'btn ghost', 'data-edit-rsvp': member.id }, ['Update']);
    const row = el('div', { className: 'rsvp-row' }, [avatar, info, btn]);
    board.append(row);
  }

  // Update access alert
  const activeDoorPeople = members.filter(
    (m) => data[m.id]?.canLetIn && data[m.id]?.status !== 'no'
  );
  const alertEl = document.getElementById('access-alert')!;
  alertEl.replaceChildren();

  if (activeDoorPeople.length) {
    alertEl.className = 'alert ok';
    const title = el('strong', {}, ['Office access: под контролем']);
    const body = text(`Дежурные шаманы входной двери: ${activeDoorPeople.map((m) => m.name).join(', ')}.`);
    alertEl.append(title, body);
  } else {
    alertEl.className = 'alert';
    const title = el('strong', {}, ['КРАСНЫЙ УРОВЕНЬ ДРАМЫ']);
    const body = text('Ни один авторизованный офисный шаман не подтвердил возможность открыть дверь. Встреча рискует стать уличным стендапом у входа.');
    alertEl.append(title, body);
  }
}

function renderBacklog(): void {
  const backlog = getJson<BacklogItem[]>(storage.backlog, initialBacklog);
  const list = document.getElementById('backlog-list')!;
  list.replaceChildren();

  backlog.forEach((item, index) => {
    const article = el('article', { className: 'backlog-item' });
    article.append(el('span', { className: 'badge' }, [`#${String(index + 1).padStart(2, '0')}`]));
    if (item.anonymous) {
      article.append(el('span', { className: 'badge status-maybe' }, ['anonymous mode']));
    }
    article.append(el('h3', {}, [item.title]));
    const authorName = item.anonymous ? 'Анонимный источник' : item.author || 'Редакция';
    const authorP = el('p', {}, ['Автор: ']);
    authorP.append(el('strong', {}, [authorName]));
    article.append(authorP);
    list.append(article);
  });
}

function renderVacations(): void {
  const vacations = getJson<VacationItem[]>(storage.vacations, [
    { id: 'v1', member: 'liza', from: '2026-05-11', to: '2026-05-13', reason: 'ментально отсутствую' },
    { id: 'v2', member: 'dimi', from: '2026-05-18', to: '2026-05-22', reason: 'отпуск' },
  ]);
  setJson(storage.vacations, vacations);
  const list = document.getElementById('vacation-list')!;
  list.replaceChildren();

  if (!vacations.length) {
    const article = el('article', { className: 'vacation-item' });
    article.append(el('strong', {}, ['Пока все в сюжете.']));
    article.append(el('p', {}, ['Подозрительно, но зафиксировано.']));
    list.append(article);
    return;
  }

  for (const item of vacations) {
    const member = memberById(item.member);
    const article = el('article', { className: 'vacation-item' });
    article.append(el('span', { className: 'badge' }, [item.reason]));
    article.append(el('h3', {}, [member ? member.name : 'Неизвестный участник']));
    const dateP = el('p', {}, []);
    dateP.append(el('strong', {}, [formatDate(item.from)]));
    dateP.append(text(' — '));
    dateP.append(el('strong', {}, [formatDate(item.to)]));
    article.append(dateP);
    list.append(article);
  }
}

function setupCountdown(): void {
  const root = document.querySelector<HTMLElement>('[data-countdown]');
  if (!root) return;
  const target = new Date(root.dataset.countdown!).getTime();

  // Check if it's the same calendar day
  const targetDate = new Date(root.dataset.countdown!);
  const isToday = (now: Date) =>
    now.getFullYear() === targetDate.getFullYear() &&
    now.getMonth() === targetDate.getMonth() &&
    now.getDate() === targetDate.getDate();

  const update = () => {
    const now = new Date();
    const distance = target - now.getTime();

    if (isToday(now)) {
      // Meeting is today — show special state
      root.replaceChildren();
      const todayEl = el('div', { className: 'countdown-today' }, ['🎉 Сегодня!']);
      root.append(todayEl);
      return;
    }

    if (distance < 0) {
      // Meeting already passed
      root.replaceChildren();
      const pastEl = el('div', { className: 'countdown-past' }, ['Уже было — ждём следующую встречу']);
      root.append(pastEl);
      return;
    }

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    root.querySelector('[data-days]')!.textContent = String(days);
    root.querySelector('[data-hours]')!.textContent = String(hours);
    root.querySelector('[data-minutes]')!.textContent = String(minutes);
    root.querySelector('[data-seconds]')!.textContent = String(seconds);
  };
  update();
  setInterval(update, 1000);
}

// --- Modal helpers ---

function openModal(id: string, trigger?: HTMLElement | null): void {
  const modal = document.getElementById(id) as HTMLDialogElement | null;
  if (!modal) return;
  lastModalTrigger = trigger ?? null;
  modal.showModal();
}

function closeModal(modal: HTMLDialogElement): void {
  modal.close();
  // Return focus to the element that opened the modal
  if (lastModalTrigger) {
    lastModalTrigger.focus();
    lastModalTrigger = null;
  }
}

// Close modals on backdrop click
document.querySelectorAll<HTMLDialogElement>('dialog.modal').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    // Click on the dialog element itself (the backdrop) but not on children
    if (event.target === dialog) {
      closeModal(dialog);
    }
  });
});

// Event delegation
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  const modalButton = target.closest<HTMLElement>('[data-open-modal]');
  if (modalButton) {
    openModal(modalButton.dataset.openModal!, modalButton);
  }

  const editButton = target.closest<HTMLElement>('[data-edit-rsvp]');
  if (editButton) {
    const data = initRsvp();
    const form = document.getElementById('rsvp-form') as HTMLFormElement;
    const memberId = editButton.dataset.editRsvp!;
    (form.elements.namedItem('member') as HTMLSelectElement).value = memberId;
    (form.elements.namedItem('status') as HTMLSelectElement).value = data[memberId]?.status || 'unknown';
    (form.elements.namedItem('canLetIn') as HTMLInputElement).checked = Boolean(data[memberId]?.canLetIn);
    (form.elements.namedItem('comment') as HTMLTextAreaElement).value = data[memberId]?.comment || '';
    openModal('rsvp-modal', editButton);
  }

  const photo = target.closest<HTMLElement>('[data-lightbox]');
  if (photo) {
    document.getElementById('lightbox-content')!.textContent = photo.dataset.lightbox!;
    document.getElementById('lightbox')!.classList.add('active');
  }

  if (target.id === 'lightbox' || target.id === 'lightbox-content') {
    document.getElementById('lightbox')!.classList.remove('active');
  }
});

// RSVP form
document.getElementById('rsvp-form')!.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = initRsvp();
  const memberId = (form.elements.namedItem('member') as HTMLSelectElement).value;
  data[memberId] = {
    status: (form.elements.namedItem('status') as HTMLSelectElement).value as RsvpEntry['status'],
    canLetIn: (form.elements.namedItem('canLetIn') as HTMLInputElement).checked,
    comment: (form.elements.namedItem('comment') as HTMLTextAreaElement).value.trim(),
  };
  setJson(storage.rsvp, data);
  renderRsvp();
  closeModal(document.getElementById('rsvp-modal') as HTMLDialogElement);
});

// Gossip form
document.getElementById('gossip-form')!.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const backlog = getJson<BacklogItem[]>(storage.backlog, initialBacklog);
  backlog.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: (form.elements.namedItem('title') as HTMLInputElement).value.trim(),
    author: (form.elements.namedItem('author') as HTMLInputElement).value.trim() || 'Редакция',
    anonymous: (form.elements.namedItem('anonymous') as HTMLInputElement).checked,
  });
  setJson(storage.backlog, backlog);
  renderBacklog();
  form.reset();
  closeModal(document.getElementById('gossip-modal') as HTMLDialogElement);
});

// Vacation form
document.getElementById('vacation-form')!.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const vacations = getJson<VacationItem[]>(storage.vacations, []);
  vacations.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    member: (form.elements.namedItem('member') as HTMLSelectElement).value,
    from: (form.elements.namedItem('from') as HTMLInputElement).value,
    to: (form.elements.namedItem('to') as HTMLInputElement).value,
    reason: (form.elements.namedItem('reason') as HTMLSelectElement).value,
  });
  setJson(storage.vacations, vacations);
  renderVacations();
  form.reset();
  closeModal(document.getElementById('vacation-modal') as HTMLDialogElement);
});

// Join form — save to localStorage and show inline confirmation
const joinForm = document.querySelector('#join-modal form') as HTMLFormElement;
const joinFormOriginalChildren = Array.from(joinForm.children).map((child) => child.cloneNode(true));

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const applications = getJson<JoinApplication[]>(storage.applications, []);
  applications.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: (joinForm.elements.namedItem('name') as HTMLInputElement).value.trim(),
    invitedBy: (joinForm.elements.namedItem('invitedBy') as HTMLInputElement).value.trim(),
    reason: (joinForm.elements.namedItem('reason') as HTMLTextAreaElement).value.trim(),
    date: new Date().toISOString(),
  });
  setJson(storage.applications, applications);

  // Replace form content with confirmation
  joinForm.replaceChildren();
  const heading = el('h2', { style: 'font-family:Playfair Display,Georgia,serif;font-size:34px;letter-spacing:-0.045em;margin:0 0 14px' }, ['✅ Заявка отправлена']);
  const msg = el('p', { style: 'line-height:1.55;color:#333' }, [
    'Ваша заявка зафиксирована в локальном архиве. В реальном MVP она улетит в Supabase, а пока — просто знайте, что мы знаем, что вы хотите.'
  ]);
  const closeBtn = el('button', { className: 'btn hot', type: 'button', style: 'margin-top:18px' }, ['Закрыть']);
  closeBtn.addEventListener('click', () => {
    closeModal(document.getElementById('join-modal') as HTMLDialogElement);
    // Restore form for next time
    joinForm.replaceChildren(...joinFormOriginalChildren.map((c) => c.cloneNode(true)));
  });
  joinForm.append(heading, msg, closeBtn);
});

// Init
setupCountdown();
renderRsvp();
renderBacklog();
renderVacations();
