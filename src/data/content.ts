// Every word on the site. Facts come from Prabal's résumé; edit freely.

export const profile = {
  name: "Prabal Holla",
  role: "Frontend Developer",
  location: "Bangalore, India",
  email: "prabalholla20@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/prabal-hc" },
    { label: "LinkedIn", href: "https://linkedin.com/in/prabal-holla-hc" },
  ],
};

/** The cover: one statement, one friendly line, and the bike to play with. */
export const cover = {
  intro: "Hi, I'm Prabal — a frontend developer in Bangalore",
  // each line is set on its own, slightly tilted; the last word is in orange
  headline: ["Websites", "built to", "ride smooth"],
  cue: "click to start the engine",
  vroom: "vroom!",
};

export const rider = {
  // {key} = a sticker chip (defined below), *starred* = serif italics
  statement:
    "I build {react} interfaces that load fast, look sharp and ride *smooth.* {years} of shipping with {next} and {ts}.",
  chips: {
    react: { label: "React", icon: "react", tilt: -4 },
    years: { label: "2.5+ years", tone: "orange", tilt: 3 },
    next: { label: "Next.js", icon: "next", tilt: -3 },
    ts: { label: "TypeScript", icon: "ts", tilt: 4 },
  },
  // the wall the bike crashes into: four bricks a row
  wall: [
    "JavaScript", "TypeScript", "React", "Next.js",
    "HTML5", "CSS3", "Tailwind", "Redux",
    "Supabase", "PostgreSQL", "REST APIs", "Three.js",
    "Vue.js", "Git", "GSAP", "SQL",
  ],
  hot: ["React", "Next.js", "TypeScript"],
  boom: "crash!",
};

/** Skills, as a workshop tool wall: one tool per group. */
export const specs = {
  note: "the toolbox",
  tools: [
    { tool: "wrench", group: "Languages", note: "what powers everything", items: ["JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3", "SQL"] },
    { tool: "screwdriver", group: "Frontend", note: "what people see", items: ["React.js", "Next.js", "Redux Toolkit", "Context API", "Tailwind CSS", "Three.js", "Vue.js"] },
    { tool: "pliers", group: "Backend & APIs", note: "what holds it all up", items: ["REST APIs", "Supabase", "PostgreSQL", "Auth & RBAC", "RLS"] },
    { tool: "hammer", group: "Workflow", note: "how it gets built", items: ["Git & GitHub", "Jira", "Agile / Scrum", "Testing", "AI-assisted dev"] },
  ] as const,
};

export const garage = {
  title: "Built in this garage.",
  note: "things I've put miles on",
  items: [
    {
      name: "Indians in Korea",
      tag: "Next.js · Supabase · GSAP",
      blurb: "Community platform for Indians across South Korea: events, news, resources and memberships, with a Supabase-backed admin for every section.",
      href: "https://indiansinkorea.netlify.app/",
      cover: "/projects/iik-hero.jpg",
    },
    {
      name: "Western Aroma",
      tag: "Next.js · React · TypeScript",
      blurb: "Estate-to-cup coffee and spice brand site: product catalogue, storytelling sections and checkout.",
      href: "https://westernaroma.netlify.app/",
      cover: "/projects/western-aroma-hero.jpg",
    },
    {
      name: "MediTrack",
      tag: "Next.js · React · TypeScript",
      blurb: "Healthcare management frontend for inventory, billing, customers and pharmacy operations.",
    },
    {
      name: "Entermaya",
      tag: "Web development · Contract",
      blurb: "Several sections of Entermaya's crowdfunding site for the MAYA narrative universe: multimedia storytelling, backer rewards and press coverage.",
      href: "https://www.entermaya.com/",
    },
  ],
};

/** The journey, oldest first: the road runs from the start line to now. */
export const route = {
  title: "Every stop on the way here.",
  start: "B.E. Information Science & Engineering · Jyothy Institute of Technology · 2023",
  stops: [
    {
      when: "Jan 2022 — Dec 2022",
      what: "AR Engineer Intern",
      where: "BrioBrill Technologies · Bangalore",
      point: "Browser-based WebAR experiences with 8th Wall and A-Frame for Android and iOS.",
    },
    {
      when: "Jan 2024 — Jun 2025",
      what: "Junior UI Developer",
      where: "DigiCollect · Bangalore",
      point: "Enterprise Vue.js UIs, RBAC scheduling with multi-timezone support, 20+ REST integrations.",
    },
    {
      when: "Jun 2025 — Now",
      what: "Contract Web Developer",
      where: "4Syte · Bangalore",
      point: "5+ production apps, plus a 30+ component UI library that cut build effort by 40%.",
    },
    {
      when: "Jul 2026 · 1 month",
      what: "Tech Generalist — Contract",
      where: "Entermaya · Goa (on-site)",
      point: "Built out several sections of the Entermaya website and an automated web-scraping tool to source marketing lead data.",
    },
  ],
};

export const ride = {
  title: ["Out of fuel?", "Let's talk."],
  neon: "open to work",
  nozzle: "click the pump to fill up (and grab my email)",
  body: "Open to new frontend roles and interesting projects. Tell me what you're building.",
  note: "I reply fast",
};
