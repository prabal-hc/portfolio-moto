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
  kicker: "Nº 01 — The rider",
  // {key} = a sticker chip (defined below), *starred* = serif italics
  statement:
    "I build {react} interfaces that load fast, look sharp and ride *smooth.* {years} of shipping with {next} and {ts} — and off the clock, I'm out on my\u00a0{hunter}",
  chips: {
    react: { label: "React", icon: "react", tilt: -4 },
    years: { label: "2.5+ years", tone: "orange", tilt: 3 },
    next: { label: "Next.js", icon: "next", tilt: -3 },
    ts: { label: "TypeScript", icon: "ts", tilt: 4 },
    hunter: { label: "Hunter 350", icon: "helmet", tone: "ink", tilt: -5 },
  },
  note: "still loving every km",
}

/** Skills, as a motorcycle spec sheet: each group is a part of the bike. */
export const specs = {
  kicker: "Nº 02 — Specifications",
  title: "Under the hood.",
  edition: "Prabal Holla · 2026 edition",
  parts: [
    { part: "engine", label: "Engine", note: "what powers everything", group: "Languages", items: ["JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3", "SQL"] },
    {
      part: "tank",
      label: "Bodywork",
      note: "what people see",
      group: "Frontend",
      items: ["React.js", "Next.js", "Redux Toolkit", "Context API", "Tailwind CSS", "Three.js", "Vue.js"],
    },
    { part: "wheel", label: "Chassis", note: "what holds it all up", group: "Backend & APIs", items: ["REST APIs", "Supabase", "PostgreSQL", "Auth & RBAC", "RLS"] },
    { part: "cockpit", label: "Cockpit", note: "how it's ridden", group: "Workflow", items: ["Git & GitHub", "Jira", "Agile / Scrum", "Testing", "AI-assisted dev"] },
  ] as const,
};

export const garage = {
  kicker: "Nº 03 — The garage",
  title: "Built in this garage.",
  note: "things I've put miles on",
  items: [
    {
      name: "Hyundai IONIQ 9 Configurator",
      tag: "React · Three.js · 4Syte",
      blurb: "Real-time 3D vehicle configurator with live trim customization and 360° viewing.",
      href: "https://hyundai-3dconfigurator.com/",
    },
    {
      name: "Western Aroma",
      tag: "Next.js · React · TypeScript",
      blurb: "Estate-to-cup coffee and spice brand site: product catalogue, storytelling sections and checkout.",
      href: "https://westernaroma.netlify.app/",
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
  kicker: "Nº 04 — The route",
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
  kicker: "Nº 05 — Let's ride",
  title: ["Let's", "ride."],
  body: "Open to new frontend roles and interesting projects. Tell me what you're building.",
  note: "I reply fast",
  marquee: ["Build fast", "Ship clean", "Ride often", "React", "Next.js", "TypeScript"],
};
