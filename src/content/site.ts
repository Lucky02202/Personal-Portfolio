/**
 * Static site content: who you are, how to reach you, how you work.
 *
 * This is the content that changes rarely, so it lives in version control
 * (typed, reviewable, zero runtime cost). Everything that changes often —
 * posts, projects, downloads, experience and the "Currently" section — lives
 * in the database and is edited from /admin.
 *
 * Search for "TODO" to find the values you still need to fill in.
 */

export const site = {
  name: "Laxmikant Patil",
  firstName: "Laxmikant",
  initials: "LP",
  role: "Software Engineer",
  /** TODO: your city, e.g. "Pune, India". */
  location: "Your City, Country",
  timezone: "Asia/Kolkata", // TODO: used for the local-time indicator in the hero
  tagline: "Software Engineer building things and documenting the journey.",
  description:
    "Laxmikant Patil — software engineer building applications, exploring technology, and documenting what I learn along the way.",
  /** TODO: set NEXT_PUBLIC_SITE_URL in production; this is the fallback. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** TODO: your public contact email. */
  email: "hello@example.com",
  /** Put your CV in /public/files and point to it here, or use any URL. */
  resumeUrl: "/files/resume.pdf",
  locale: "en_US",
  twitterHandle: undefined as string | undefined, // e.g. "@yourhandle"
};

export const socials = {
  github: "https://github.com/your-handle", // TODO
  linkedin: "https://www.linkedin.com/in/your-handle", // TODO
  x: undefined as string | undefined,
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Blog" },
  { href: "/downloads", label: "Downloads" },
] as const;

/** Hero copy. `intro` is a single sentence; keep it plain. */
export const hero = {
  greeting: `Hi, I'm ${site.firstName}.`,
  intro:
    "I build applications, automate the boring parts of work, and write down what I learn so the next person (usually future me) has an easier time.",
};

/** About page. Each paragraph is plain text; keep them short. */
export const about = {
  headline: "I like building things that make work feel lighter.",
  intro: [
    "I'm a software engineer. Most of my days are spent on enterprise applications and automation — the kind of software people use every morning without thinking about it, which is exactly why it has to be good.",
    "Outside of work I build small tools for myself, try out whatever new idea is pulling at my attention, and write about it here. This site is part portfolio, part notebook.",
  ],
  enjoy: [
    {
      title: "Tools people actually use",
      body: "Internal apps, trackers, dashboards. Software with a real user on the other side who will tell you, honestly, when it's slow.",
    },
    {
      title: "Automation",
      body: "If I've done something by hand three times, I start wondering what it would take to never do it again.",
    },
    {
      title: "Explaining things",
      body: "Writing a guide is how I find out whether I actually understand something.",
    },
  ],
  approach: [
    {
      title: "Start with the problem, not the stack",
      body: "The best tool is usually the one the team can maintain after I've moved on.",
    },
    {
      title: "Make it work, then make it obvious",
      body: "Clear names, small pieces, and fewer clever tricks. Code is read far more than it's written.",
    },
    {
      title: "Ship, then listen",
      body: "A rough version in someone's hands beats a perfect one in my head.",
    },
    {
      title: "Write it down",
      body: "Decisions, gotchas, the fix that took four hours. Notes compound.",
    },
  ],
  interests: ["AI-assisted development", "Azure", "Workflow automation", "Developer experience", "Writing"],
};

/**
 * Journey timeline (About page). Education → first experiences → now → next.
 * `kind` controls the marker style.
 */
export const journey: {
  period: string;
  title: string;
  body: string;
  kind: "education" | "work" | "now" | "next";
}[] = [
  {
    period: "TODO: years",
    title: "Studied computer science", // TODO: your degree / institution
    body: "Where I wrote my first real programs and realised I liked building more than studying for exams.",
    kind: "education",
  },
  {
    period: "TODO: year",
    title: "First steps into the industry",
    body: "Learned how software gets built by teams: code reviews, deadlines, and production bugs at inconvenient hours.",
    kind: "work",
  },
  {
    period: "Now",
    title: "Software Engineer",
    body: "Building enterprise applications and automation on Microsoft Power Platform, plus web apps on the side.",
    kind: "now",
  },
  {
    period: "Next",
    title: "Going deeper on AI and cloud",
    body: "Bringing AI into everyday business tools in a way that's useful, not gimmicky, and getting properly good at Azure.",
    kind: "next",
  },
];

/**
 * Tech stack, grouped. `icon` maps to a simple-icons slug in
 * src/components/ui/tech-icon.tsx; anything without an icon gets a monogram.
 */
export const stack: { group: string; note: string; items: { name: string; icon?: string }[] }[] = [
  {
    group: "Web development",
    note: "What I reach for when building for the browser.",
    items: [
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextdotjs" },
      { name: "HTML", icon: "html5" },
      { name: "CSS", icon: "css" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
    ],
  },
  {
    group: "Microsoft Power Platform",
    note: "Day-to-day work: business apps and automation.",
    items: [
      { name: "Power Apps" },
      { name: "Power Automate" },
      { name: "SharePoint" },
      { name: "Dataverse" },
      { name: "Power BI" },
    ],
  },
  {
    group: "Backend & data",
    note: "Where the data lives.",
    items: [
      { name: "Node.js", icon: "nodedotjs" },
      { name: "MongoDB", icon: "mongodb" },
      { name: "SQL" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "Supabase", icon: "supabase" },
    ],
  },
  {
    group: "Currently learning",
    note: "Rough edges expected.",
    items: [{ name: "AI / LLMs", icon: "claude" }, { name: "Azure" }, { name: "Python", icon: "python" }],
  },
];

/** Labels and accent per "Currently" kind. */
export const nowKinds = {
  building: { label: "Building", verb: "Currently building" },
  learning: { label: "Learning", verb: "Learning" },
  exploring: { label: "Exploring", verb: "Exploring" },
  reading: { label: "Reading", verb: "Reading" },
  writing: { label: "Writing", verb: "Writing about" },
} as const;

export const projectCategories = {
  professional: "Professional",
  personal: "Personal",
  experiment: "Experiments",
  "open-source": "Open source",
} as const;

export const projectStatuses = {
  building: "In progress",
  shipped: "Shipped",
  maintained: "Maintained",
  paused: "Paused",
  archived: "Archived",
} as const;

export const contact = {
  headline: "Have an idea, a project, or just want to talk about technology?",
  body: "My inbox is open. I read everything and reply to most things — usually within a few days.",
};
