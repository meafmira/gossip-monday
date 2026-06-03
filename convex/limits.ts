/**
 * Single source of truth for content limits, shared between the Convex
 * mutations (server-side validation) and the Astro forms (client-side
 * `maxlength` hints). Keep these in sync by importing from here in both places
 * instead of hard-coding numbers.
 */
export const LIMITS = {
  backlogTitle: 160,
  backlogAuthor: 80,
  rsvpComment: 280,
  vacationReason: 80,
  joinName: 80,
  joinInvitedBy: 80,
  joinReason: 600,
} as const;

/**
 * Upper bounds on how many rows the public page query returns. The backlog and
 * vacation tables accept anonymous writes, so capping reads keeps the realtime
 * payload bounded even if those tables grow.
 */
export const LIST_LIMITS = {
  backlog: 100,
  vacations: 100,
} as const;
