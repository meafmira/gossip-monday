import { mutation } from "./_generated/server";
import {
  initialBacklog,
  initialGalleryEvents,
  initialMembers,
  initialReports,
  initialVacations,
} from "./seedData";

export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    const stats = {
      membersInserted: 0,
      membersUpdated: 0,
      rsvpsInserted: 0,
      backlogInserted: 0,
      backlogUpdated: 0,
      vacationsInserted: 0,
      vacationsUpdated: 0,
      reportsInserted: 0,
      reportsUpdated: 0,
      galleryInserted: 0,
      galleryUpdated: 0,
    };

    for (const member of initialMembers) {
      const existing = await ctx.db
        .query("members")
        .withIndex("by_slug", (q) => q.eq("slug", member.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, member);
        stats.membersUpdated += 1;
      } else {
        await ctx.db.insert("members", member);
        stats.membersInserted += 1;
      }

      const existingRsvp = await ctx.db
        .query("rsvps")
        .withIndex("by_member_slug", (q) => q.eq("memberSlug", member.slug))
        .unique();

      if (!existingRsvp) {
        await ctx.db.insert("rsvps", {
          memberSlug: member.slug,
          status: "unknown",
          comment: "",
          canLetIn: member.canLetIn,
          updatedAt: 0,
        });
        stats.rsvpsInserted += 1;
      }
    }

    for (const item of initialBacklog) {
      const existing = await ctx.db
        .query("backlogItems")
        .withIndex("by_seed_id", (q) => q.eq("seedId", item.seedId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, item);
        stats.backlogUpdated += 1;
      } else {
        await ctx.db.insert("backlogItems", item);
        stats.backlogInserted += 1;
      }
    }

    for (const item of initialVacations) {
      const existing = await ctx.db
        .query("vacations")
        .withIndex("by_seed_id", (q) => q.eq("seedId", item.seedId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, item);
        stats.vacationsUpdated += 1;
      } else {
        await ctx.db.insert("vacations", item);
        stats.vacationsInserted += 1;
      }
    }

    for (const report of initialReports) {
      const existing = await ctx.db
        .query("reports")
        .withIndex("by_seed_id", (q) => q.eq("seedId", report.seedId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, report);
        stats.reportsUpdated += 1;
      } else {
        await ctx.db.insert("reports", report);
        stats.reportsInserted += 1;
      }
    }

    for (const event of initialGalleryEvents) {
      const existing = await ctx.db
        .query("galleryEvents")
        .withIndex("by_seed_id", (q) => q.eq("seedId", event.seedId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, event);
        stats.galleryUpdated += 1;
      } else {
        await ctx.db.insert("galleryEvents", event);
        stats.galleryInserted += 1;
      }
    }

    return stats;
  },
});
