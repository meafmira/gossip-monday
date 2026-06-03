import { describe, expect, test } from 'bun:test';
import { assertIsoDate, trimOptional, trimRequired } from '../convex/validation';

describe('trimRequired', () => {
  test('trims surrounding whitespace', () => {
    expect(trimRequired('  привет  ', 'Имя', 80)).toBe('привет');
  });

  test('throws on empty or whitespace-only input', () => {
    expect(() => trimRequired('', 'Имя', 80)).toThrow('Имя не может быть пустым.');
    expect(() => trimRequired('   ', 'Имя', 80)).toThrow('Имя не может быть пустым.');
  });

  test('throws when the trimmed length exceeds the max', () => {
    expect(() => trimRequired('abcdef', 'Заголовок', 5)).toThrow(
      'Заголовок слишком длинный: максимум 5 символов.',
    );
  });

  test('accepts a value exactly at the max length', () => {
    expect(trimRequired('abcde', 'Заголовок', 5)).toBe('abcde');
  });
});

describe('trimOptional', () => {
  test('allows empty input', () => {
    expect(trimOptional('   ', 80)).toBe('');
  });

  test('trims and preserves content', () => {
    expect(trimOptional('  tea  ', 80)).toBe('tea');
  });

  test('throws when over the max length', () => {
    expect(() => trimOptional('abcdef', 5)).toThrow('Слишком длинный текст: максимум 5 символов.');
  });
});

describe('assertIsoDate', () => {
  test('accepts a valid YYYY-MM-DD date', () => {
    expect(() => assertIsoDate('2026-05-04', 'Дата')).not.toThrow();
  });

  test('rejects a wrong format', () => {
    expect(() => assertIsoDate('04.05.2026', 'Дата')).toThrow(
      'Дата должна быть датой в формате YYYY-MM-DD.',
    );
    expect(() => assertIsoDate('2026-5-4', 'Дата')).toThrow(
      'Дата должна быть датой в формате YYYY-MM-DD.',
    );
  });

  test('rejects an impossible calendar date', () => {
    expect(() => assertIsoDate('2026-13-40', 'Дата')).toThrow(
      'Дата выглядит как дата, но календарь с этим не согласен.',
    );
  });
});
