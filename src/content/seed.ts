/**
 * Starter content.
 *
 * Used in two places:
 *  1. As the site's content when Supabase isn't configured yet (local dev, first deploy).
 *  2. By "Import starter content" in /admin, which copies it into an empty database.
 *
 * Everything here is meant to be edited or deleted once you're writing your own.
 */
import type { Category, Download, Experience, NowItem, Post, Project } from "@/lib/types";

const T = "2026-11-01T09:00:00.000Z";
const stamp = { created_at: T, updated_at: T };

export const seedCategories: Category[] = [
  ["development", "Development", "Building software: code, tools, patterns."],
  ["power-platform", "Power Platform", "Power Apps, Power Automate, SharePoint, Dataverse."],
  ["ai", "AI", "Working with models, agents and AI-assisted development."],
  ["productivity", "Productivity", "Systems, habits and automation for getting things done."],
  ["career", "Career", "Lessons from the job."],
  ["learning", "Learning", "Notes from learning in public."],
  ["personal", "Personal", "Everything else."],
  ["technology", "Technology", "Opinions on where things are heading."],
].map(([slug, name, description], i) => ({ id: `cat-${slug}`, slug, name, description, sort: i }));

export const seedPosts: Post[] = [
  {
    id: "post-hello",
    slug: "why-this-site-exists",
    title: "Why this site exists",
    subtitle: "A personal corner of the internet for the things I'm building, learning and thinking about.",
    category: "personal",
    tags: ["meta", "writing", "learning-in-public"],
    status: "published",
    published_at: "2026-11-20T08:00:00.000Z",
    featured: true,
    reading_minutes: null,
    cover_url: null,
    cover_alt: null,
    seo_title: null,
    seo_description: null,
    ...stamp,
    content: `For a long time my notes lived in five different places: a notes app, a folder of half-finished documents, a pile of browser bookmarks and, most of the time, nowhere at all. This site is my attempt to fix that.

## What you'll find here

It's less a portfolio than a workshop. I've organised it around three questions:

- **What am I working on right now?** The *Currently* section on the home page is updated as things change. It's the most honest part of the site.
- **What have I built?** Projects, including professional work described at a high level where the details aren't mine to share.
- **What have I learned?** Articles, notes and downloadable resources such as checklists and cheat sheets that I actually use.

## Why write in public

> Writing is nature's way of letting you know how sloppy your thinking is.

That line has stuck with me. Whenever I try to explain something I *think* I understand, I find the gaps. Writing it down closes them, and publishing it means someone else might skip the four hours I spent stuck on the same problem.

## What to expect

Mostly:

1. Practical notes on **Power Platform**: delegation, flows, the parts the docs don't cover.
2. Web development, and things I build on the side.
3. What I'm learning about **AI** and **Azure**, mistakes included.

Some posts will be polished. Others will be closer to lab notes. Both are fine.

If something here helps you, or you think I've got it wrong, [tell me](/contact). That's half the point.
`,
  },
  {
    id: "post-delegation",
    slug: "power-apps-delegation-without-the-jargon",
    title: "Power Apps delegation, without the jargon",
    subtitle: "Why your gallery shows 500 rows when the list has 8,000, and how to design so it never happens.",
    category: "power-platform",
    tags: ["power-apps", "sharepoint", "performance"],
    status: "published",
    published_at: "2026-11-12T08:00:00.000Z",
    featured: false,
    reading_minutes: null,
    cover_url: null,
    cover_alt: null,
    seo_title: null,
    seo_description: "A plain-language explanation of delegation in Power Apps, with the patterns I use to avoid hitting the data row limit.",
    ...stamp,
    content: `Every Power Apps developer meets delegation the same way: the app works perfectly in testing, then someone in production says *"I can't find my record."* The record exists. The app just never looked at it.

## The one-sentence version

**Delegation means asking the data source to do the filtering.** When a formula is delegable, Power Apps sends the query to SharePoint, Dataverse or SQL and gets back only the matching rows. When it isn't, Power Apps downloads the first *N* rows and filters those locally. Everything after row *N* is invisible.

*N* is the **data row limit**. It defaults to 500 and can be raised to 2,000 in the app settings. Raising it hides the problem for longer. It doesn't fix it.

## Spotting it

Power Apps warns you with a blue underline and a yellow triangle in the formula bar. Treat those warnings as bugs. Each one is a query that will silently return incomplete results once your data grows.

\`\`\`powerfx
// ⚠️ Not delegable on SharePoint: only checks the first 500 rows
Filter(Requests, "urgent" in Title)

// ✅ Delegable on SharePoint
Filter(Requests, StartsWith(Title, "Urgent"))
\`\`\`

## Why it differs per data source

Delegation depends on what the *connector* can translate into a query. Dataverse supports much more than SharePoint. Always check the delegation table for the connector you're actually using:

| Pattern | SharePoint | Dataverse |
| --- | --- | --- |
| \`Filter\` with \`=\`, \`<\`, \`>\` | ✅ | ✅ |
| \`StartsWith\` | ✅ | ✅ |
| \`in\` (substring) | ❌ | ✅ |
| \`Search()\` | ❌ | ✅ |
| \`CountRows\` on a filtered table | ❌ | ⚠️ (see docs) |

*Details change between releases, so check the current docs before you rely on any one row.*

## The patterns I use

### 1. Design the data for the query

If users search by status and owner, those should be columns you can filter on directly, and indexed if the list will pass 5,000 items. Most delegation problems are really data-model problems.

### 2. Filter first, then do clever things

Delegable filters narrow the data on the server. Then non-delegable functions run on a small, *complete* result set:

\`\`\`powerfx
With(
    { mine: Filter(Requests, Owner.Email = User().Email, Status.Value = "Open") },
    SortByColumns(Search(mine, txtSearch.Text, Title), "Modified", SortOrder.Descending)
)
\`\`\`

This is safe as long as \`mine\` is guaranteed to stay under the row limit. Here it's one person's open requests.

### 3. Test with too much data

Make a copy of the list with more rows than the limit. Temporarily set the row limit to **1** while testing: anything that breaks wasn't delegating.

## Takeaway

Delegation isn't an edge case. It's the boundary between a demo and an app that still works a year later. Design your data around the queries you need, and treat every blue underline as a bug.

I keep a [checklist](/downloads) of this and other performance checks that I run before an app goes live.
`,
  },
  {
    id: "post-expressions",
    slug: "power-automate-expressions-i-use-every-week",
    title: "The Power Automate expressions I use every week",
    subtitle: "A short, opinionated list. The full cheat sheet is in the downloads section.",
    category: "power-platform",
    tags: ["power-automate", "automation", "cheat-sheet"],
    status: "published",
    published_at: "2026-11-05T08:00:00.000Z",
    featured: false,
    reading_minutes: null,
    cover_url: null,
    cover_alt: null,
    seo_title: null,
    seo_description: null,
    ...stamp,
    content: `The expression editor in Power Automate is where flows go from *clicked together* to *reliable*. These are the expressions I keep coming back to.

## Never trust a property to exist

The \`?\` operator turns a failed run into a \`null\`:

\`\`\`text
triggerBody()?['manager']?['email']
\`\`\`

Pair it with \`coalesce()\` to provide a sensible default:

\`\`\`text
coalesce(triggerBody()?['manager']?['email'], 'team-inbox@contoso.com')
\`\`\`

## Dates, in the right time zone

\`utcNow()\` is UTC, and your users almost certainly aren't. Convert at the edge, right before you display or send something:

\`\`\`text
convertTimeZone(utcNow(), 'UTC', 'India Standard Time', 'dd MMM yyyy, HH:mm')
\`\`\`

## Empty checks that actually work

\`empty()\` works on strings, arrays *and* objects, so it's my default "is there anything here?" check:

\`\`\`text
empty(outputs('Get_items')?['body/value'])
\`\`\`

## Quick de-duplication

\`union()\` of an array with itself removes duplicates. It's not obvious, but it's useful:

\`\`\`text
union(variables('Emails'), variables('Emails'))
\`\`\`

## Debug with Compose

Before putting a complicated expression into a condition, put it in a **Compose** action. The run history then shows its exact output, which saves a lot of guessing.

---

I've collected these and a few dozen more into a [one-page cheat sheet](/downloads).
`,
  },
  {
    id: "post-draft-azure",
    slug: "notes-on-learning-azure",
    title: "Notes on learning Azure",
    subtitle: "What I'm learning, in the order I'm learning it.",
    category: "learning",
    tags: ["azure", "cloud", "learning-in-public"],
    status: "draft",
    published_at: null,
    featured: false,
    reading_minutes: null,
    cover_url: null,
    cover_alt: null,
    seo_title: null,
    seo_description: null,
    ...stamp,
    content: `Drafts never appear on the public site. Use this one to try the editor.\n\n## Starting point\n\n- What I already know\n- What I want to be able to build\n`,
  },
];

export const seedProjects: Project[] = [
  {
    id: "proj-tracker",
    slug: "intelligent-tracker",
    title: "Intelligent Tracker",
    summary: "A smarter way to track work and progress. In active development, so details will be filled in as it takes shape.",
    description: `I'm building this in the open. This page will grow with notes on decisions, trade-offs and what I learn along the way.

*TODO: describe what the tracker does, who it's for, and why you're building it.*`,
    category: "personal",
    status: "building",
    visibility: "public",
    role: "Solo: design, build, everything",
    tech: ["TypeScript", "React", "AI"],
    cover_url: null,
    images: [],
    github_url: null,
    demo_url: null,
    started_at: "2026-09-01",
    ended_at: null,
    learnings: [],
    challenges: [],
    outcome: null,
    featured: true,
    published: true,
    sort: 0,
    ...stamp,
  },
  {
    id: "proj-enterprise-pm",
    slug: "enterprise-project-tracking-platform",
    title: "Enterprise project & activity tracking platform",
    summary: "An enterprise project management and activity tracking platform built on Microsoft Power Platform.",
    description: `A suite of business apps and automated workflows that replaced spreadsheet-and-email project tracking for a large team.

This is client work, so it's described here at a high level only. No company names, screenshots or internal details.

*TODO: adjust the description, learnings and outcome so they're accurate.*`,
    category: "professional",
    status: "maintained",
    visibility: "confidential",
    role: "Power Platform developer",
    tech: ["Power Apps", "Power Automate", "SharePoint", "Dataverse", "Power BI"],
    cover_url: null,
    images: [],
    github_url: null,
    demo_url: null,
    started_at: "2025-01-01",
    ended_at: null,
    learnings: [
      "Designing the data model around delegation from day one",
      "Building approval workflows people actually trust",
      "Making a low-code app maintainable by someone other than me",
    ],
    challenges: ["Data volume growing far past the original estimate", "Many teams with different processes in one app"],
    outcome: "In daily use, replacing a manual, spreadsheet-driven process.",
    featured: true,
    published: true,
    sort: 1,
    ...stamp,
  },
  {
    id: "proj-site",
    slug: "this-website",
    title: "This website",
    summary: "My personal site: a portfolio, blog, resource library and admin dashboard, built to be maintained for years.",
    description: `A personal site that's meant to stay alive: a blog with a proper editor, a resource library, and a *Currently* section, all managed from a private dashboard instead of code changes.

### How it's built

- **Next.js** with Cache Components. Public pages are prerendered and served from cache, then refreshed when content changes.
- **Supabase** for Postgres, authentication and file storage. Every write is checked by row-level security policies in the database, not just the UI.
- **Markdown** for posts, rendered on the server with syntax highlighting. The editor preview uses the same renderer.
- Very little client-side JavaScript: a handful of small interactive islands.`,
    category: "personal",
    status: "shipped",
    visibility: "public",
    role: "Design & development",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL"],
    cover_url: null,
    images: [],
    github_url: null,
    demo_url: null,
    started_at: "2026-11-01",
    ended_at: null,
    learnings: [
      "Separating content from UI so the site can change without code changes",
      "Enforcing security in the database with row-level security, not in the UI",
      "Keeping a content site fast by caching at the data layer",
    ],
    challenges: ["Keeping it minimal while still giving it a distinctive feel"],
    outcome: "You're looking at it.",
    featured: false,
    published: true,
    sort: 2,
    ...stamp,
  },
];

export const seedDownloads: Download[] = [
  {
    id: "dl-pa-expr",
    slug: "power-automate-expressions-cheat-sheet",
    title: "Power Automate Expressions Cheat Sheet",
    description: "The expressions I use most for data access, dates, text, arrays and null handling, on one page.",
    category: "Power Automate",
    file_url: "/files/power-automate-expressions-cheat-sheet.md",
    file_name: "power-automate-expressions-cheat-sheet.md",
    file_type: "md",
    file_size: 4066,
    preview_url: null,
    published: true,
    download_count: 0,
    created_at: "2026-11-05T08:00:00.000Z",
    updated_at: "2026-11-05T08:00:00.000Z",
  },
  {
    id: "dl-papps-perf",
    slug: "power-apps-delegation-performance-checklist",
    title: "Power Apps Delegation & Performance Checklist",
    description: "What I check before a Power App goes live: delegation, SharePoint limits, loading, controls and writes.",
    category: "Power Apps",
    file_url: "/files/power-apps-delegation-checklist.md",
    file_name: "power-apps-delegation-checklist.md",
    file_type: "md",
    file_size: 2630,
    preview_url: null,
    published: true,
    download_count: 0,
    created_at: "2026-11-12T08:00:00.000Z",
    updated_at: "2026-11-12T08:00:00.000Z",
  },
];

export const seedExperience: Experience[] = [
  {
    id: "exp-current",
    company: "Your Company", // TODO
    role: "Software Engineer",
    location: null,
    employment_type: "Full-time",
    start_date: "2024-01-01", // TODO
    end_date: null,
    description:
      "Building enterprise applications and workflow automation on Microsoft Power Platform for internal teams.",
    responsibilities: [
      "Design and build Power Apps for business processes",
      "Automate approvals, notifications and data sync with Power Automate",
      "Model data in SharePoint and Dataverse",
    ],
    contributions: ["TODO: one or two things you're proud of. Be specific, but keep confidential details out."],
    tech: ["Power Apps", "Power Automate", "SharePoint", "Dataverse", "Power BI"],
    published: true,
    sort: 0,
    ...stamp,
  },
];

export const seedNow: NowItem[] = [
  {
    id: "now-1",
    kind: "building",
    title: "Intelligent Tracker",
    detail: "A side project, and my excuse to try new ideas.",
    href: "/projects/intelligent-tracker",
    highlight: true,
    published: true,
    sort: 0,
    ...stamp,
  },
  {
    id: "now-2",
    kind: "building",
    title: "Enterprise apps on Power Platform",
    detail: "At work: business apps and automation for internal teams.",
    href: "/experience",
    highlight: true,
    published: true,
    sort: 1,
    ...stamp,
  },
  {
    id: "now-3",
    kind: "learning",
    title: "AI & Azure",
    detail: "LLMs in real workflows, and the cloud services around them.",
    href: null,
    highlight: true,
    published: true,
    sort: 2,
    ...stamp,
  },
  {
    id: "now-4",
    kind: "exploring",
    title: "AI agents for everyday automation",
    detail: "Where they actually beat a well-built flow, and where they don't.",
    href: null,
    highlight: false,
    published: true,
    sort: 3,
    ...stamp,
  },
  {
    id: "now-5",
    kind: "reading",
    title: "Microsoft Learn — Azure fundamentals",
    detail: "Working through the learning paths, one module at a time.",
    href: "https://learn.microsoft.com/training/azure/",
    highlight: false,
    published: true,
    sort: 4,
    ...stamp,
  },
  {
    id: "now-6",
    kind: "writing",
    title: "Development, automation & things I learn",
    detail: null,
    href: "/blog",
    highlight: true,
    published: true,
    sort: 5,
    ...stamp,
  },
];
