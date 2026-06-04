/**
 * Shared `convex-test` bootstrap for the Convex function tests.
 *
 * `convex-test` normally discovers Convex modules through Vite's
 * `import.meta.glob`, which the Bun test runner does not provide. We therefore
 * build the module map by hand. The map must include a path under `_generated`
 * (convex-test uses it to locate the modules root) plus every Convex function
 * module the tests exercise.
 */
import { expect } from 'bun:test';
import { convexTest } from 'convex-test';
import schema from '../convex/schema';

export const convexModules = {
  '../convex/club.ts': () => import('../convex/club'),
  '../convex/seed.ts': () => import('../convex/seed'),
  '../convex/_generated/api.js': () => import('../convex/_generated/api'),
  '../convex/_generated/server.js': () => import('../convex/_generated/server'),
} as Record<string, () => Promise<unknown>>;

export function setupConvex() {
  return convexTest(schema, convexModules);
}

/**
 * Assert that a promise rejects with an error message containing `substring`.
 *
 * Used instead of `await expect(p).rejects.toThrow(...)` because `bun-types`
 * types `toThrow` as `void`, which makes the required `await` look redundant to
 * `astro check`. This helper is a real async function, so awaiting it is honest.
 */
export async function expectReject(promise: Promise<unknown>, substring: string): Promise<void> {
  try {
    await promise;
  } catch (error) {
    expect(error instanceof Error ? error.message : String(error)).toContain(substring);
    return;
  }
  throw new Error(`Expected a rejection containing "${substring}", but the promise resolved.`);
}
