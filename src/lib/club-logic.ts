/**
 * Pure, DOM-free client logic extracted from `src/scripts/app.ts` so it can be
 * unit-tested directly (see `tests/club-logic.test.ts`). `app.ts` imports these
 * helpers instead of inlining the rules, so the tests guard the real code.
 */

/** A member's RSVP as far as the door rule cares about it. */
type DoorRsvp = { canLetIn?: boolean; status?: string } | null | undefined;

/**
 * Whether a member currently counts as able to open the office door.
 *
 * The live RSVP (if present) overrides the member's default `canLetIn`, and
 * anyone who has explicitly said "no" is excluded even if they hold a key.
 */
export function canOpenDoor(member: { canLetIn: boolean }, rsvp: DoorRsvp): boolean {
  const canLetIn = rsvp?.canLetIn ?? member.canLetIn;
  const status = rsvp?.status ?? 'unknown';
  return canLetIn && status !== 'no';
}

/** Format an ISO `YYYY-MM-DD` date as `DD.MM.YYYY`, echoing the input if invalid. */
export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export type CountdownState =
  | { kind: 'today' }
  | { kind: 'past' }
  | { kind: 'counting'; days: number; hours: number; minutes: number; seconds: number };

/**
 * Classify the countdown relative to `now`: the target's calendar day wins
 * ("today") even if some hours remain; a past target is "past"; otherwise the
 * remaining time is broken into days/hours/minutes/seconds.
 */
export function countdownState(target: Date, now: Date): CountdownState {
  const sameDay =
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate();

  if (sameDay) return { kind: 'today' };

  const distance = target.getTime() - now.getTime();
  if (distance < 0) return { kind: 'past' };

  return {
    kind: 'counting',
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000),
  };
}
