import { describe, expect, test } from 'bun:test';
import { canOpenDoor, countdownState, formatDate } from '../src/lib/club-logic';

describe('canOpenDoor', () => {
  test('a keyholder with no RSVP can open the door', () => {
    expect(canOpenDoor({ canLetIn: true }, undefined)).toBe(true);
  });

  test('a non-keyholder with no RSVP cannot', () => {
    expect(canOpenDoor({ canLetIn: false }, undefined)).toBe(false);
  });

  test('a keyholder who said "no" is excluded', () => {
    expect(canOpenDoor({ canLetIn: true }, { canLetIn: true, status: 'no' })).toBe(false);
  });

  test('the RSVP canLetIn overrides the member default', () => {
    expect(canOpenDoor({ canLetIn: false }, { canLetIn: true, status: 'yes' })).toBe(true);
    expect(canOpenDoor({ canLetIn: true }, { canLetIn: false, status: 'yes' })).toBe(false);
  });

  test('a keyholder marked "maybe" still counts', () => {
    expect(canOpenDoor({ canLetIn: true }, { canLetIn: true, status: 'maybe' })).toBe(true);
  });
});

describe('formatDate', () => {
  test('formats a valid ISO date as DD.MM.YYYY', () => {
    expect(formatDate('2026-05-04')).toBe('04.05.2026');
  });

  test('echoes an invalid value unchanged', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('countdownState', () => {
  test('reports "today" when the target shares the calendar day, even with hours left', () => {
    const target = new Date('2026-05-04T20:00:00');
    const now = new Date('2026-05-04T08:00:00');
    expect(countdownState(target, now)).toEqual({ kind: 'today' });
  });

  test('reports "past" once the target is behind us on a different day', () => {
    const target = new Date('2026-05-04T12:00:00');
    const now = new Date('2026-05-05T12:00:00');
    expect(countdownState(target, now)).toEqual({ kind: 'past' });
  });

  test('breaks the remaining time into d/h/m/s', () => {
    const target = new Date('2026-05-04T12:00:00');
    const now = new Date('2026-05-03T10:59:30');
    expect(countdownState(target, now)).toEqual({
      kind: 'counting',
      days: 1,
      hours: 1,
      minutes: 0,
      seconds: 30,
    });
  });
});
