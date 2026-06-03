import { beforeEach, describe, expect, test } from 'bun:test';
import { api } from '../convex/_generated/api';
import { LIMITS } from '../convex/limits';
import { expectReject, setupConvex } from './convexSetup';

type Convex = ReturnType<typeof setupConvex>;

/** Insert a minimal valid member so mutations that require one can run. */
async function seedMember(
  t: Convex,
  slug: string,
  overrides: Partial<{ name: string; canLetIn: boolean; sortOrder: number }> = {},
) {
  await t.run(async (ctx) => {
    await ctx.db.insert('members', {
      slug,
      name: overrides.name ?? slug,
      nickname: 'nick',
      role: 'role',
      funFact: 'fact',
      canLetIn: overrides.canLetIn ?? false,
      avatar: 'AA',
      color: '#fff',
      sortOrder: overrides.sortOrder ?? 0,
    });
  });
}

describe('getPageData', () => {
  let t: Convex;
  beforeEach(() => {
    t = setupConvex();
  });

  test('returns empty collections when nothing is seeded', async () => {
    const data = await t.query(api.club.getPageData, {});
    expect(data.members).toEqual([]);
    expect(data.rsvps).toEqual({});
    expect(data.backlogItems).toEqual([]);
    expect(data.vacations).toEqual([]);
    expect(data.reports).toEqual([]);
    expect(data.galleryEvents).toEqual([]);
  });

  test('synthesizes an unknown RSVP for members without a row, inheriting canLetIn', async () => {
    await seedMember(t, 'oleg', { canLetIn: true });
    const data = await t.query(api.club.getPageData, {});

    expect(data.rsvps.oleg).toMatchObject({
      id: null,
      memberSlug: 'oleg',
      status: 'unknown',
      comment: '',
      canLetIn: true,
      updatedAt: 0,
    });
  });

  test('orders members by sortOrder ascending', async () => {
    await seedMember(t, 'second', { sortOrder: 2 });
    await seedMember(t, 'first', { sortOrder: 1 });
    const data = await t.query(api.club.getPageData, {});
    expect(data.members.map((m) => m.slug)).toEqual(['first', 'second']);
  });

  test('orders backlog newest-first by createdAt', async () => {
    await t.run(async (ctx) => {
      await ctx.db.insert('backlogItems', {
        title: 'old',
        author: 'A',
        anonymous: false,
        createdAt: 1,
      });
      await ctx.db.insert('backlogItems', {
        title: 'new',
        author: 'B',
        anonymous: false,
        createdAt: 2,
      });
    });
    const data = await t.query(api.club.getPageData, {});
    expect(data.backlogItems.map((i) => i.title)).toEqual(['new', 'old']);
  });
});

describe('updateRsvp', () => {
  let t: Convex;
  beforeEach(() => {
    t = setupConvex();
  });

  test('throws when the member does not exist', async () => {
    await expectReject(
      t.mutation(api.club.updateRsvp, {
        memberSlug: 'ghost',
        status: 'yes',
        canLetIn: false,
        comment: '',
      }),
      'Участник не найден',
    );
  });

  test('inserts a new RSVP row, then patches it on a second call (upsert)', async () => {
    await seedMember(t, 'oleg');

    await t.mutation(api.club.updateRsvp, {
      memberSlug: 'oleg',
      status: 'yes',
      canLetIn: true,
      comment: 'приду',
    });
    await t.mutation(api.club.updateRsvp, {
      memberSlug: 'oleg',
      status: 'no',
      canLetIn: false,
      comment: 'передумал',
    });

    const rows = await t.run((ctx) => ctx.db.query('rsvps').collect());
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: 'no', canLetIn: false, comment: 'передумал' });
  });

  test('trims the comment and rejects one over the limit', async () => {
    await seedMember(t, 'oleg');

    await t.mutation(api.club.updateRsvp, {
      memberSlug: 'oleg',
      status: 'maybe',
      canLetIn: false,
      comment: '  hmm  ',
    });
    const data = await t.query(api.club.getPageData, {});
    expect(data.rsvps.oleg.comment).toBe('hmm');

    await expectReject(
      t.mutation(api.club.updateRsvp, {
        memberSlug: 'oleg',
        status: 'maybe',
        canLetIn: false,
        comment: 'x'.repeat(LIMITS.rsvpComment + 1),
      }),
      'максимум',
    );
  });
});

describe('addBacklogItem', () => {
  let t: Convex;
  beforeEach(() => {
    t = setupConvex();
  });

  test('falls back to "Редакция" when no author is given', async () => {
    await t.mutation(api.club.addBacklogItem, { title: 'утечка', author: '   ', anonymous: false });
    const data = await t.query(api.club.getPageData, {});
    expect(data.backlogItems[0].author).toBe('Редакция');
  });

  test('keeps a provided author and the anonymous flag', async () => {
    await t.mutation(api.club.addBacklogItem, { title: 'утечка', author: 'Дими', anonymous: true });
    const data = await t.query(api.club.getPageData, {});
    expect(data.backlogItems[0]).toMatchObject({ author: 'Дими', anonymous: true });
  });

  test('rejects an empty title', async () => {
    await expectReject(
      t.mutation(api.club.addBacklogItem, { title: '   ', author: '', anonymous: false }),
      'Заголовок не может быть пустым',
    );
  });
});

describe('addVacation', () => {
  let t: Convex;
  beforeEach(() => {
    t = setupConvex();
  });

  test('throws when the member does not exist', async () => {
    await expectReject(
      t.mutation(api.club.addVacation, {
        memberSlug: 'ghost',
        from: '2026-05-01',
        to: '2026-05-10',
        reason: 'отпуск',
      }),
      'Участник для отсутствия не найден',
    );
  });

  test('rejects an end date earlier than the start date', async () => {
    await seedMember(t, 'oleg');
    await expectReject(
      t.mutation(api.club.addVacation, {
        memberSlug: 'oleg',
        from: '2026-05-10',
        to: '2026-05-01',
        reason: 'отпуск',
      }),
      'не может быть раньше',
    );
  });

  test('rejects a malformed date', async () => {
    await seedMember(t, 'oleg');
    await expectReject(
      t.mutation(api.club.addVacation, {
        memberSlug: 'oleg',
        from: '01.05.2026',
        to: '2026-05-10',
        reason: 'отпуск',
      }),
      'YYYY-MM-DD',
    );
  });

  test('inserts a valid vacation', async () => {
    await seedMember(t, 'oleg');
    await t.mutation(api.club.addVacation, {
      memberSlug: 'oleg',
      from: '2026-05-01',
      to: '2026-05-10',
      reason: 'отпуск',
    });
    const data = await t.query(api.club.getPageData, {});
    expect(data.vacations[0]).toMatchObject({
      memberSlug: 'oleg',
      from: '2026-05-01',
      to: '2026-05-10',
      reason: 'отпуск',
    });
  });
});

describe('addJoinApplication', () => {
  let t: Convex;
  beforeEach(() => {
    t = setupConvex();
  });

  test('rejects when a required field is empty', async () => {
    await expectReject(
      t.mutation(api.club.addJoinApplication, { name: '', invitedBy: 'Дими', reason: 'хочу' }),
      'Имя не может быть пустым',
    );
  });

  test('stores a complete application', async () => {
    await t.mutation(api.club.addJoinApplication, {
      name: 'Новенький',
      invitedBy: 'Дими',
      reason: 'хочу сплетничать',
    });
    const rows = await t.run((ctx) => ctx.db.query('joinApplications').collect());
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'Новенький', invitedBy: 'Дими' });
  });
});
