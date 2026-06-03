import {
  createGossipApi,
  type BacklogItem,
  type GalleryEvent,
  type Member,
  type PageData,
  type Report,
  type RsvpEntry,
  type VacationItem,
} from '../lib/api/gossip';
import { canOpenDoor, countdownState, formatDate } from '../lib/club-logic';

const gossipApi = createGossipApi();
let currentData: PageData | null = null;

const statusCopy: Record<string, [string, string]> = {
  yes: ['Приду', 'status-yes'],
  no: ['Не приду', 'status-no'],
  maybe: ['Возможно', 'status-maybe'],
  unknown: ['Не отметился', 'status-unknown'],
};

// Track which element opened a modal so we can return focus.
let lastModalTrigger: HTMLElement | null = null;

function memberBySlug(slug: string): Member | undefined {
  return currentData?.members.find((member) => member.slug === slug);
}

function el(
  tag: string,
  attrs?: Record<string, string>,
  children?: (Node | string)[],
): HTMLElement {
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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function fieldValue(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ||
    field instanceof HTMLSelectElement ||
    field instanceof HTMLTextAreaElement
    ? field.value
    : '';
}

function fieldChecked(form: HTMLFormElement, name: string): boolean {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement && field.checked;
}

function setField(form: HTMLFormElement, name: string, value: string): void {
  const field = form.elements.namedItem(name) as FormField | null;
  if (field) field.value = value;
}

function setChecked(form: HTMLFormElement, name: string, checked: boolean): void {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement) field.checked = checked;
}

function renderNotice(target: HTMLElement, title: string, body: string): void {
  target.replaceChildren(
    el('article', { className: 'section-card' }, [el('h3', {}, [title]), el('p', {}, [body])]),
  );
}

function renderMemberOptions(data: PageData): void {
  const selects = document.querySelectorAll<HTMLSelectElement>(
    '#rsvp-form select[name="member"], #vacation-form select[name="member"]',
  );

  selects.forEach((select) => {
    const selectedValue = select.value;
    select.replaceChildren();

    for (const member of data.members) {
      const option = document.createElement('option');
      option.value = member.slug;
      option.textContent = member.name;
      select.append(option);
    }

    if (data.members.some((member) => member.slug === selectedValue)) {
      select.value = selectedValue;
    }
  });
}

function renderRsvp(data: PageData): void {
  const board = document.getElementById('rsvp-board')!;
  board.replaceChildren();

  if (!data.members.length) {
    renderNotice(
      board,
      'Участники не найдены',
      'Convex подключён, но initial seed ещё не запущен.',
    );
  }

  for (const member of data.members) {
    const item: RsvpEntry = data.rsvps[member.slug] || {
      id: null,
      memberSlug: member.slug,
      status: 'unknown',
      comment: '',
      canLetIn: member.canLetIn,
      updatedAt: 0,
    };
    const [label, cls] = statusCopy[item.status] || statusCopy.unknown;

    const avatar = el('div', { className: 'avatar', style: `background:${member.color}` }, [
      member.avatar,
    ]);
    const nameEl = el('strong', {}, [member.name]);
    const statusPill = el('span', { className: `status-pill ${cls}` }, [label]);
    const infoChildren: (Node | string)[] = [nameEl, document.createElement('br'), statusPill];

    if (item.canLetIn) {
      infoChildren.push(el('span', { className: 'status-pill status-yes' }, ['🔑 впускает']));
    }
    if (item.comment) {
      infoChildren.push(el('p', { className: 'rsvp-comment' }, [`"${item.comment}"`]));
    }

    const btn = el('button', { className: 'btn ghost', 'data-edit-rsvp': member.slug }, ['Update']);
    board.append(el('div', { className: 'rsvp-row' }, [avatar, el('div', {}, infoChildren), btn]));
  }

  const activeDoorPeople = data.members.filter((member) =>
    canOpenDoor(member, data.rsvps[member.slug]),
  );
  const alertEl = document.getElementById('access-alert')!;
  alertEl.replaceChildren();

  if (activeDoorPeople.length) {
    alertEl.className = 'alert ok';
    alertEl.append(
      el('strong', {}, ['Office access: под контролем']),
      text(
        `Дежурные шаманы входной двери: ${activeDoorPeople.map((member) => member.name).join(', ')}.`,
      ),
    );
  } else {
    alertEl.className = 'alert';
    alertEl.append(
      el('strong', {}, ['КРАСНЫЙ УРОВЕНЬ ДРАМЫ']),
      text(
        'Ни один авторизованный офисный шаман не подтвердил возможность открыть дверь. Встреча рискует стать уличным стендапом у входа.',
      ),
    );
  }
}

function renderBacklog(backlog: BacklogItem[]): void {
  const list = document.getElementById('backlog-list')!;
  list.replaceChildren();

  if (!backlog.length) {
    renderNotice(
      list,
      'Backlog пуст',
      'Подозрительно тихо. Добавьте первую синхронизированную сплетню.',
    );
    return;
  }

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

function renderVacations(vacations: VacationItem[]): void {
  const list = document.getElementById('vacation-list')!;
  list.replaceChildren();

  if (!vacations.length) {
    const article = el('article', { className: 'vacation-item' });
    article.append(el('strong', {}, ['Пока все в сюжете.']));
    article.append(el('p', {}, ['Подозрительно, но зафиксировано в Convex.']));
    list.append(article);
    return;
  }

  for (const item of vacations) {
    const member = memberBySlug(item.memberSlug);
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

function renderMembers(members: Member[]): void {
  const grid = document.getElementById('member-grid');
  if (!grid) return;
  grid.replaceChildren();

  if (!members.length) {
    renderNotice(grid, 'Участники не загружены', 'Запустите seedInitialData в Convex.');
    return;
  }

  for (const member of members) {
    const article = el('article', { className: 'member-card' }, [
      el('div', { className: 'avatar', style: `background:${member.color}` }, [member.avatar]),
      el('h3', {}, [member.name]),
      el('span', { className: 'badge' }, [member.nickname]),
      el('p', { className: 'role' }, [member.role]),
      el('p', {}, [member.funFact]),
      el('span', { className: `badge ${member.canLetIn ? 'status-yes' : 'status-unknown'}` }, [
        member.canLetIn ? '🔑 может пустить в офис' : '🚪 guest mode',
      ]),
    ]);
    grid.append(article);
  }
}

function renderReports(reports: Report[]): void {
  const list = document.getElementById('report-list');
  if (!list) return;
  list.replaceChildren();

  if (!reports.length) {
    renderNotice(list, 'Reports ещё нет', 'Архив заседаний ждёт первого официального протокола.');
    return;
  }

  for (const report of reports) {
    const outcomes = el('ul');
    for (const outcome of report.outcomes) {
      outcomes.append(el('li', {}, [outcome]));
    }

    list.append(
      el('article', { className: 'report-item' }, [
        el('h3', {}, [report.title]),
        el('span', { className: 'badge' }, [report.date]),
        el('p', {}, [report.summary]),
        outcomes,
      ]),
    );
  }
}

function renderGallery(events: GalleryEvent[]): void {
  const grid = document.getElementById('gallery-events');
  if (!grid) return;
  grid.replaceChildren();

  if (!events.length) {
    renderNotice(
      grid,
      'Фото-доказательства отсутствуют',
      'Комитет временно работает без визуальных улик.',
    );
    return;
  }

  for (const event of events) {
    const photoGrid = el('div', { className: 'gallery-grid event-photos' });
    for (const photo of event.photos) {
      photoGrid.append(
        el(
          'button',
          { className: 'photo-tile', 'data-lightbox': photo, 'aria-label': `Открыть ${photo}` },
          [photo],
        ),
      );
    }

    grid.append(
      el('article', { className: 'section-card' }, [
        el('h3', {}, [event.title]),
        el('span', { className: 'badge' }, [event.date]),
        photoGrid,
      ]),
    );
  }
}

function renderPageData(data: PageData): void {
  currentData = data;
  renderMemberOptions(data);
  renderRsvp(data);
  renderBacklog(data.backlogItems);
  renderVacations(data.vacations);
  renderMembers(data.members);
  renderReports(data.reports);
  renderGallery(data.galleryEvents);
}

function renderUnavailable(error: Error): void {
  const message = error.message;
  const accessAlert = document.getElementById('access-alert');
  if (accessAlert) {
    accessAlert.className = 'alert';
    accessAlert.replaceChildren(el('strong', {}, ['Convex недоступен']), text(` ${message}`));
  }

  const targets = [
    ['rsvp-board', 'RSVP не загружен'],
    ['backlog-list', 'Backlog не загружен'],
    ['vacation-list', 'Отпуска не загружены'],
    ['member-grid', 'Участники не загружены'],
    ['report-list', 'Reports не загружены'],
    ['gallery-events', 'Gallery не загружена'],
  ] as const;

  for (const [id, title] of targets) {
    const target = document.getElementById(id);
    if (target) renderNotice(target, title, message);
  }
}

function setupCountdown(): void {
  const root = document.querySelector<HTMLElement>('[data-countdown]');
  if (!root) return;
  const target = new Date(root.dataset.countdown!);

  let timerId: number | undefined;

  const update = () => {
    const state = countdownState(target, new Date());

    if (state.kind === 'today') {
      root.replaceChildren(el('div', { className: 'countdown-today' }, ['🎉 Сегодня!']));
      return;
    }

    if (state.kind === 'past') {
      root.replaceChildren(
        el('div', { className: 'countdown-past' }, ['Уже было — ждём следующую встречу']),
      );
      // The meeting is over; nothing left to tick down.
      if (timerId !== undefined) window.clearInterval(timerId);
      return;
    }

    root.querySelector('[data-days]')!.textContent = String(state.days);
    root.querySelector('[data-hours]')!.textContent = String(state.hours);
    root.querySelector('[data-minutes]')!.textContent = String(state.minutes);
    root.querySelector('[data-seconds]')!.textContent = String(state.seconds);
  };
  update();
  timerId = window.setInterval(update, 1000);
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
  // Return focus to the element that opened the modal.
  if (lastModalTrigger) {
    lastModalTrigger.focus();
    lastModalTrigger = null;
  }
}

async function withFormLock(form: HTMLFormElement, action: () => Promise<void>): Promise<void> {
  const controls = Array.from(
    form.querySelectorAll<
      HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement
    >('button, input, select, textarea'),
  );

  controls.forEach((control) => {
    control.disabled = true;
  });

  try {
    await action();
  } catch (error) {
    alert(errorMessage(error));
  } finally {
    controls.forEach((control) => {
      control.disabled = false;
    });
  }
}

// Close modals on backdrop click.
document.querySelectorAll<HTMLDialogElement>('dialog.modal').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    // Click on the dialog element itself (the backdrop) but not on children.
    if (event.target === dialog) {
      closeModal(dialog);
    }
  });
});

// Event delegation.
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  const closeButton = target.closest<HTMLElement>('[data-close-modal]');
  if (closeButton) {
    const dialog = closeButton.closest<HTMLDialogElement>('dialog');
    if (dialog) closeModal(dialog);
    return;
  }

  const modalButton = target.closest<HTMLElement>('[data-open-modal]');
  if (modalButton) {
    openModal(modalButton.dataset.openModal!, modalButton);
    return;
  }

  const editButton = target.closest<HTMLElement>('[data-edit-rsvp]');
  if (editButton) {
    if (!currentData) {
      alert('Convex данные ещё загружаются. Подождите драматичную секунду.');
      return;
    }

    const form = document.getElementById('rsvp-form') as HTMLFormElement;
    const memberSlug = editButton.dataset.editRsvp!;
    const member = memberBySlug(memberSlug);
    const data = currentData.rsvps[memberSlug] || {
      status: 'unknown',
      canLetIn: member?.canLetIn ?? false,
      comment: '',
    };

    setField(form, 'member', memberSlug);
    setField(form, 'status', data.status);
    setChecked(form, 'canLetIn', Boolean(data.canLetIn));
    setField(form, 'comment', data.comment || '');
    openModal('rsvp-modal', editButton);
    return;
  }

  const photo = target.closest<HTMLElement>('[data-lightbox]');
  if (photo) {
    lightboxContent.textContent = photo.dataset.lightbox!;
    lightbox.showModal();
    lastLightboxTrigger = photo;
    return;
  }
});

// --- Lightbox (native <dialog>) ---

const lightbox = document.getElementById('lightbox') as HTMLDialogElement;
const lightboxContent = document.getElementById('lightbox-content')!;
let lastLightboxTrigger: HTMLElement | null = null;

// Any click inside the lightbox (the image button or the backdrop) closes it.
lightbox.addEventListener('click', () => lightbox.close());

// Return focus to the tile that opened the lightbox (covers the Escape key too).
lightbox.addEventListener('close', () => {
  if (lastLightboxTrigger) {
    lastLightboxTrigger.focus();
    lastLightboxTrigger = null;
  }
});

// RSVP form.
document.getElementById('rsvp-form')!.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;

  void withFormLock(form, async () => {
    await gossipApi.updateRsvp({
      memberSlug: fieldValue(form, 'member'),
      status: fieldValue(form, 'status') as RsvpEntry['status'],
      canLetIn: fieldChecked(form, 'canLetIn'),
      comment: fieldValue(form, 'comment'),
    });
    closeModal(document.getElementById('rsvp-modal') as HTMLDialogElement);
  });
});

// Gossip form.
document.getElementById('gossip-form')!.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;

  void withFormLock(form, async () => {
    await gossipApi.addBacklogItem({
      title: fieldValue(form, 'title'),
      author: fieldValue(form, 'author'),
      anonymous: fieldChecked(form, 'anonymous'),
    });
    form.reset();
    closeModal(document.getElementById('gossip-modal') as HTMLDialogElement);
  });
});

// Vacation form.
document.getElementById('vacation-form')!.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;

  void withFormLock(form, async () => {
    await gossipApi.addVacation({
      memberSlug: fieldValue(form, 'member'),
      from: fieldValue(form, 'from'),
      to: fieldValue(form, 'to'),
      reason: fieldValue(form, 'reason'),
    });
    form.reset();
    closeModal(document.getElementById('vacation-modal') as HTMLDialogElement);
  });
});

// Join form — save shared applications in Convex and show inline confirmation.
const joinForm = document.querySelector('#join-modal form') as HTMLFormElement;
const joinModal = document.getElementById('join-modal') as HTMLDialogElement;
const joinFormOriginalChildren = Array.from(joinForm.children).map((child) =>
  child.cloneNode(true),
);

function restoreJoinForm(): void {
  joinForm.replaceChildren(...joinFormOriginalChildren.map((child) => child.cloneNode(true)));
  joinForm.reset();
}

joinModal.addEventListener('close', () => {
  if (!joinForm.elements.namedItem('name')) {
    // The form was replaced with the success message — rebuild the fields.
    restoreJoinForm();
  } else {
    // Closed before submitting; clear any half-typed application.
    joinForm.reset();
  }
});

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();

  void withFormLock(joinForm, async () => {
    await gossipApi.addJoinApplication({
      name: fieldValue(joinForm, 'name'),
      invitedBy: fieldValue(joinForm, 'invitedBy'),
      reason: fieldValue(joinForm, 'reason'),
    });

    joinForm.replaceChildren();
    const heading = el('h2', { className: 'join-success-title' }, ['✅ Заявка отправлена']);
    const msg = el('p', { className: 'join-success-text' }, [
      'Ваша заявка зафиксирована в общем Convex-архиве. Комитет теперь не сможет притвориться, что ничего не видел.',
    ]);
    const closeBtn = el('button', { className: 'btn hot join-success-close', type: 'button' }, [
      'Закрыть',
    ]);
    closeBtn.addEventListener('click', () => {
      closeModal(joinModal);
    });
    joinForm.append(heading, msg, closeBtn);
  });
});

// Init.
setupCountdown();
gossipApi.subscribePageData(renderPageData, renderUnavailable);
window.addEventListener('beforeunload', () => {
  void gossipApi.close();
});
