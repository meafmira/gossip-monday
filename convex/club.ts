import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { LIMITS, LIST_LIMITS } from "./limits";

const rsvpStatus = v.union(
  v.literal("yes"),
  v.literal("no"),
  v.literal("maybe"),
  v.literal("unknown"),
);

function trimRequired(value: string, label: string, maxLength: number): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} не может быть пустым.`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${label} слишком длинный: максимум ${maxLength} символов.`);
  }
  return trimmed;
}

function trimOptional(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(`Слишком длинный текст: максимум ${maxLength} символов.`);
  }
  return trimmed;
}

function assertIsoDate(value: string, label: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} должна быть датой в формате YYYY-MM-DD.`);
  }
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${label} выглядит как дата, но календарь с этим не согласен.`);
  }
}

export const getPageData = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db
      .query("members")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
    const rsvps = await ctx.db.query("rsvps").collect();
    const backlogItems = await ctx.db
      .query("backlogItems")
      .withIndex("by_created_at")
      .order("desc")
      .take(LIST_LIMITS.backlog);
    const vacations = await ctx.db
      .query("vacations")
      .withIndex("by_created_at")
      .order("desc")
      .take(LIST_LIMITS.vacations);
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
    const galleryEvents = await ctx.db
      .query("galleryEvents")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();

    const rsvpsByMember = new Map(rsvps.map((rsvp) => [rsvp.memberSlug, rsvp]));

    return {
      members: members.map((member) => ({
        id: member._id,
        slug: member.slug,
        name: member.name,
        nickname: member.nickname,
        role: member.role,
        funFact: member.funFact,
        canLetIn: member.canLetIn,
        avatar: member.avatar,
        color: member.color,
      })),
      rsvps: Object.fromEntries(
        members.map((member) => {
          const rsvp = rsvpsByMember.get(member.slug);
          return [
            member.slug,
            {
              id: rsvp?._id ?? null,
              memberSlug: member.slug,
              status: rsvp?.status ?? "unknown",
              comment: rsvp?.comment ?? "",
              canLetIn: rsvp?.canLetIn ?? member.canLetIn,
              updatedAt: rsvp?.updatedAt ?? 0,
            },
          ];
        }),
      ),
      backlogItems: backlogItems.map((item) => ({
        id: item._id,
        title: item.title,
        author: item.author,
        anonymous: item.anonymous,
        createdAt: item.createdAt,
      })),
      vacations: vacations.map((item) => ({
        id: item._id,
        memberSlug: item.memberSlug,
        from: item.from,
        to: item.to,
        reason: item.reason,
        createdAt: item.createdAt,
      })),
      reports: reports.map((report) => ({
        id: report._id,
        title: report.title,
        date: report.date,
        summary: report.summary,
        outcomes: report.outcomes,
      })),
      galleryEvents: galleryEvents.map((event) => ({
        id: event._id,
        title: event.title,
        date: event.date,
        photos: event.photos,
      })),
    };
  },
});

export const updateRsvp = mutation({
  args: {
    memberSlug: v.string(),
    status: rsvpStatus,
    canLetIn: v.boolean(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_slug", (q) => q.eq("slug", args.memberSlug))
      .unique();

    if (!member) {
      throw new Error("Участник не найден. Возможно, он ушёл в witness protection.");
    }

    const comment = trimOptional(args.comment, LIMITS.rsvpComment);
    const existing = await ctx.db
      .query("rsvps")
      .withIndex("by_member_slug", (q) => q.eq("memberSlug", args.memberSlug))
      .unique();

    const payload = {
      memberSlug: args.memberSlug,
      status: args.status,
      canLetIn: args.canLetIn,
      comment,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("rsvps", payload);
  },
});

export const addBacklogItem = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    anonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const title = trimRequired(args.title, "Заголовок", LIMITS.backlogTitle);
    const author = trimOptional(args.author, LIMITS.backlogAuthor) || "Редакция";

    return await ctx.db.insert("backlogItems", {
      title,
      author,
      anonymous: args.anonymous,
      createdAt: Date.now(),
    });
  },
});

export const addVacation = mutation({
  args: {
    memberSlug: v.string(),
    from: v.string(),
    to: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_slug", (q) => q.eq("slug", args.memberSlug))
      .unique();

    if (!member) {
      throw new Error("Участник для отсутствия не найден.");
    }

    assertIsoDate(args.from, "Дата начала");
    assertIsoDate(args.to, "Дата окончания");

    if (Date.parse(`${args.to}T00:00:00Z`) < Date.parse(`${args.from}T00:00:00Z`)) {
      throw new Error("Дата окончания не может быть раньше даты начала. Даже для драматичного отпуска.");
    }

    const reason = trimRequired(args.reason, "Причина", LIMITS.vacationReason);

    return await ctx.db.insert("vacations", {
      memberSlug: args.memberSlug,
      from: args.from,
      to: args.to,
      reason,
      createdAt: Date.now(),
    });
  },
});

export const addJoinApplication = mutation({
  args: {
    name: v.string(),
    invitedBy: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const name = trimRequired(args.name, "Имя", LIMITS.joinName);
    const invitedBy = trimRequired(args.invitedBy, "Кто пригласил", LIMITS.joinInvitedBy);
    const reason = trimRequired(args.reason, "Причина", LIMITS.joinReason);

    return await ctx.db.insert("joinApplications", {
      name,
      invitedBy,
      reason,
      createdAt: Date.now(),
    });
  },
});
