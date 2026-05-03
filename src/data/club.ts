export type Member = {
  id: string;
  name: string;
  nickname: string;
  role: string;
  funFact: string;
  canLetIn: boolean;
  avatar: string;
  color: string;
};

export const members: Member[] = [
  {
    id: 'oleg',
    name: 'Олег Нечипоренко',
    nickname: 'Infrastructure Gossip Officer',
    role: 'Chief Gossip Infrastructure Officer',
    funFact: 'Может превратить бытовую историю в архитектурную диаграмму с рисками и зависимостями.',
    canLetIn: true,
    avatar: 'ОН',
    color: '#111827',
  },
  {
    id: 'liza',
    name: 'Лиза Панарина',
    nickname: 'Звёздный свидетель',
    role: 'Старший аналитик эмоциональных микросигналов',
    funFact: 'Считывает “ну потом расскажу” быстрее, чем Slack успевает показать typing…',
    canLetIn: false,
    avatar: 'ЛП',
    color: '#ef4444',
  },
  {
    id: 'yulia',
    name: 'Юлия Бокова',
    nickname: 'Coincidence Hunter',
    role: 'Head of Suspicious Coincidences',
    funFact: 'Если две случайности выглядят слишком случайно — Юлия уже открыла investigation thread.',
    canLetIn: false,
    avatar: 'ЮБ',
    color: '#f97316',
  },
  {
    id: 'vlad',
    name: 'Влад Лаухин',
    nickname: 'Министр деталей',
    role: 'Директор по внезапным подробностям',
    funFact: 'Появляется с уточнением ровно в момент, когда история уже казалась завершённой.',
    canLetIn: true,
    avatar: 'ВЛ',
    color: '#7c3aed',
  },
  {
    id: 'dimi',
    name: 'Дими',
    nickname: 'Tea Architect',
    role: 'Архитектор чайных инсайтов',
    funFact: 'Проектирует gossip-повестку с запасом на непредвиденную драму.',
    canLetIn: false,
    avatar: 'Д',
    color: '#0ea5e9',
  },
  {
    id: 'anastasiia',
    name: 'Анастасия Кулакова',
    nickname: 'Owner of chaos',
    role: 'Chairwoman of Drama Governance',
    funFact: 'Держит хаос в рамках, но только чтобы он выглядел ещё эффектнее.',
    canLetIn: false,
    avatar: 'АК',
    color: '#a855f7',
  },
  {
    id: 'maria',
    name: 'Мария Замжитская',
    nickname: 'The Eye',
    role: 'Независимый аудитор чужих решений',
    funFact: 'Видит несостыковки в историях до того, как рассказчик дошёл до главного.',
    canLetIn: true,
    avatar: 'МЗ',
    color: '#06b6d4',
  },
  {
    id: 'nadin',
    name: 'Надин',
    nickname: 'Silent Observer',
    role: 'Специалист по тихому наблюдению',
    funFact: 'Может ничего не сказать, но после одного взгляда вся комната понимает контекст.',
    canLetIn: false,
    avatar: 'Н',
    color: '#14b8a6',
  },
];

export const initialBacklog = [
  {
    id: 'g1',
    title: 'Кто что недосказал в прошлый понедельник',
    author: 'Анонимный комитет',
    anonymous: true,
  },
  {
    id: 'g2',
    title: 'Та самая история, которую нельзя обсуждать в чате',
    author: 'Редакция',
    anonymous: false,
  },
  {
    id: 'g3',
    title: 'Почему один человек опять сказал “я расскажу потом”',
    author: 'Неравнодушный свидетель',
    anonymous: true,
  },
  {
    id: 'g4',
    title: 'Кофе, офис и подозрительно хорошее настроение',
    author: 'Мария',
    anonymous: false,
  },
  {
    id: 'g5',
    title: 'Новая серия сериала “личная жизнь коллег”',
    author: 'Сплетенный продюсер',
    anonymous: true,
  },
];

export const reports = [
  {
    id: 'r1',
    title: 'Report #001: Протокол неполного знания',
    date: '27.04.2026',
    summary:
      'Обсудили три темы, две из которых никто не понял, а одну решили перенести, потому что нужен был человек, который отсутствовал.',
    outcomes: ['Официально признали, что “потом расскажу” — это не статус, а угроза.', 'Назначили следующий gossip backlog на ланч.', 'Зафиксировали: без свидетеля история считается trailer-ом.'],
  },
];

export const galleryEvents = [
  {
    id: 'e1',
    title: 'Monday Gossip #001',
    date: '27.04.2026',
    photos: ['Breaking Tea', 'Lunch Evidence', 'Office Whisper'],
  },
  {
    id: 'e2',
    title: 'Emergency Gossip Session',
    date: 'архив скоро откроется',
    photos: ['Classified', 'No Photos Please'],
  },
];
