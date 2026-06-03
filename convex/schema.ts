import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const rsvpStatus = v.union(
  v.literal('yes'),
  v.literal('no'),
  v.literal('maybe'),
  v.literal('unknown'),
);

export default defineSchema({
  members: defineTable({
    slug: v.string(),
    name: v.string(),
    nickname: v.string(),
    role: v.string(),
    funFact: v.string(),
    canLetIn: v.boolean(),
    avatar: v.string(),
    color: v.string(),
    sortOrder: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_sort_order', ['sortOrder']),

  rsvps: defineTable({
    memberSlug: v.string(),
    status: rsvpStatus,
    comment: v.string(),
    canLetIn: v.boolean(),
    updatedAt: v.number(),
  }).index('by_member_slug', ['memberSlug']),

  backlogItems: defineTable({
    seedId: v.optional(v.string()),
    title: v.string(),
    author: v.string(),
    anonymous: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_seed_id', ['seedId'])
    .index('by_created_at', ['createdAt']),

  vacations: defineTable({
    seedId: v.optional(v.string()),
    memberSlug: v.string(),
    from: v.string(),
    to: v.string(),
    reason: v.string(),
    createdAt: v.number(),
  })
    .index('by_seed_id', ['seedId'])
    .index('by_created_at', ['createdAt'])
    .index('by_member_slug', ['memberSlug']),

  joinApplications: defineTable({
    name: v.string(),
    invitedBy: v.string(),
    reason: v.string(),
    createdAt: v.number(),
  }).index('by_created_at', ['createdAt']),

  reports: defineTable({
    seedId: v.string(),
    title: v.string(),
    date: v.string(),
    summary: v.string(),
    outcomes: v.array(v.string()),
    sortOrder: v.number(),
  })
    .index('by_seed_id', ['seedId'])
    .index('by_sort_order', ['sortOrder']),

  galleryEvents: defineTable({
    seedId: v.string(),
    title: v.string(),
    date: v.string(),
    photos: v.array(v.string()),
    sortOrder: v.number(),
  })
    .index('by_seed_id', ['seedId'])
    .index('by_sort_order', ['sortOrder']),
});
