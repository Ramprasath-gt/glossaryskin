// =============================================================================
// GLOSSARY SKIN — WEIGHT MANAGEMENT LANDING PAGE
// Central configuration. Edit values here — never scatter them through
// index.html or main.js.
// =============================================================================

const SITE_CONFIG = {
  name: "Glossary Skin",
  tagline: "Beauty Scientifically Perfected",
  phone: "+91 98218 21567",
  whatsapp: "919821821567",
  // Prefilled text for every on-page WhatsApp link (wa.me opens the app on
  // mobile and WhatsApp Web / Desktop on a computer).
  whatsappMessage: "Hi Glossary, I'd like to know more about your personalised weight management and body contouring options.",
  email: "glossaryappointments@gmail.com",
  address: "B-62, Sector 2, Noida, Uttar Pradesh – 201301",
  serviceAreas: ["Delhi", "Noida", "Gurugram"],

  // Backend endpoint that receives the booking form submission (see
  // /assets/php/submit-lead.php) for email notifications + local CSV backup.
  // Point this at the PHP file's live URL once deployed on Hostinger, e.g.
  // "https://glossaryskin.com/assets/php/submit-lead.php". Only works on a
  // host that runs PHP — on a static host (e.g. GitHub Pages) this call
  // silently fails and is skipped, which is fine: googleSheetWebhookUrl below
  // is what actually has to succeed for a lead to be captured.
  leadEndpoint: "assets/php/submit-lead.php",

  // Apps Script Web App URL for the Google Sheet (Step1 / Final tabs). The
  // browser is the only thing that writes to the Sheet — keep
  // GOOGLE_SHEET_WEBHOOK_URL in assets/php/config.php blank or every lead is
  // logged twice. Not a secret: it is a public write-only endpoint.
  googleSheetWebhookUrl: "https://script.google.com/macros/s/AKfycbzbOp0FCQ0_re7rBEBC12UxIJ9OlapM9SYL8nuBLttKZeYYJPQ7t32yoaeSxAkzIOooOg/exec",

  // Tracking IDs — leave blank to skip injecting that script entirely.
  // Google Tag Manager (GTM-5DSV6QFV) is installed directly in the <head> of
  // index.html and enquiry-confirmed.html, so gtmId stays blank here to avoid
  // loading the container twice. Add Meta Pixel / GA4 as tags inside GTM
  // rather than here, for the same reason.
  metaPixelId: "",
  ga4Id: "",
  gtmId: "",
};

// -----------------------------------------------------------------------------
// POPUP_CONFIG — when the enquiry form may open by itself. Demand-based: never
// on page load, only after real engagement (or desktop exit intent), at most
// `sessionLimit` times per browser session. Explicit CTA clicks always open
// the form and ignore all of this. Change values here for CRO/A-B tests.
// Times are seconds of VISIBLE time on the page; scroll values are the % of
// the page the visitor has seen (bottom of viewport / page height).
// -----------------------------------------------------------------------------
const POPUP_CONFIG = {
  // All devices: open this many seconds after the visitor first scrolls
  // (more than scrollStartMinPx), regardless of the intent score below.
  scrollStartDelay: 5,
  scrollStartMinPx: 80,
  // Desktop (viewport >= mobileBreakpoint)
  desktopTime: 35,          // Trigger A: this long on the page…
  desktopScroll: 45,        // …AND scrolled this far
  highIntentDwell: 10,      // Trigger B: seconds engaged in a high-intent section
  exitIntentMinTime: 20,    // Trigger C (exit intent) only after this long…
  exitIntentMinScroll: 30,  // …and this far down the page
  // Mobile (viewport < mobileBreakpoint) — whichever comes first
  mobileTime: 55,
  mobileScroll: 60,
  mobileBreakpoint: 768,
  // Intent score the visitor needs before any engagement trigger can fire
  // (exit intent uses its own conditions above). Never shown to visitors.
  minIntentScore: 40,
  intentPoints: {
    scroll30: 10, scroll45: 15, scroll60: 20,
    bodyContouring: 15, journeys: 10, stories: 10, faq: 10,
    goalSelector: 25, treatmentCta: 30,
  },
  // Wait this long after the visitor last used the calculator, FAQ, carousel,
  // a treatment card or any field before interrupting.
  interactionCooldownMs: 4000,
  sessionLimit: 1,
};

// Form heading, chosen from the CTA that opened the form (its data-source).
// The automatic popup always uses `auto_popup`, never the CTA of whatever
// section happens to be on screen. CTAs not listed here (nav, sticky bar,
// goal selector) fall back to the goal-based copy in POPUP_COPY below.
const FORM_CONTEXT_TITLES = {
  hero_starting_point: "Let's Find the Right Starting Point for You",
  hero_consultation: "Book Your Consultation",
  glp1_consultation: "Let's Talk About Your Weight-Management Goals",
  bmi_understand: "Want to Understand Your Result?",
  bmi_consult_doctor: "Let's Talk About Your Weight-Management Goals",
  abdomen_treatment: "Looking to Work on Your Abdomen?",
  hips_treatment: "Looking to Work on Your Hips?",
  thighs_treatment: "Looking to Work on Your Thighs?",
  body_contouring_journey: "Let's Talk About Your Body-Contouring Goal",
  journey_abdomen: "Looking to Work on Your Abdomen?",
  journey_hips: "Looking to Work on Your Hips?",
  journey_thighs: "Looking to Work on Your Thighs?",
  journey_weight: "Let's Talk About Your Weight-Management Goals",
  care_team: "Talk to Our Care Team",
  final_consultation: "Let's Start With a Conversation",
  auto_popup: "Not Sure Where to Start?",
};

// Supporting line for CTAs that need their own; everything else uses the
// goal-based line + reassurance from POPUP_COPY.
const FORM_CONTEXT_SUBTITLES = {
  bmi_understand: "Share a few details and our team can help you understand the next step.",
  bmi_consult_doctor: "Share a few details to request a consultation with the Glossary team.",
};

// Goal-based heading + supporting line. The line is used under every
// heading; the heading only when the CTA has no entry above.
const POPUP_COPY = {
  abdomen: ["Looking to work on your abdomen?", "Tell us a little about your goal and we'll help you understand your options."],
  hips: ["Exploring targeted care for your hips?", "Tell us what you're looking to achieve and we'll help you understand your options."],
  thighs: ["Looking to focus on your thighs?", "Tell us what you're looking to achieve and we'll help you understand your options."],
  glp1: ["Exploring weight management?", "Tell us what you're looking to achieve and we'll help you understand your options."],
  general: ["Not Sure Where to Start?", "Tell us what you're looking to achieve. A member of the Glossary team will help you understand which approach may be right for you."],
  reassurance: "No pressure. No obligation to proceed.",
};

// -----------------------------------------------------------------------------
// INTEREST OPTIONS — the segmentation question in the booking modal ("What
// Are You Interested In?"), matching the five Meta ad audiences 1:1 so every
// lead is captured with the intent it arrived with. priceLabel only shows a
// public starting price for the inch-loss treatments — GLP-1 pricing is never
// shown here (shared during consultation instead).
// -----------------------------------------------------------------------------
const INTEREST_OPTIONS = [
  { id: "glp1", label: "GLP-1 Weight Management", priceLabel: "" },
  { id: "abdomen", label: "Abdomen Inch Loss", priceLabel: "Starting from ₹6,999" },
  { id: "hips", label: "Hips Inch Loss", priceLabel: "Starting from ₹6,999" },
  { id: "thighs", label: "Thighs Inch Loss", priceLabel: "Starting from ₹6,999" },
  { id: "not-sure", label: "I'm Not Sure — Help Me Choose", priceLabel: "" },
];

// -----------------------------------------------------------------------------
// TESTIMONIALS — provided directly by the Glossary Skin team. Quotes and names
// are unchanged from the original.
// -----------------------------------------------------------------------------
const TESTIMONIALS = [
  {
    name: "Nandini Rao",
    service: "GLP-1 Weight Management",
    quote:
      "What I liked most was that I wasn't simply given a treatment and left on my own. The doctor took the time to understand my goals and explained the GLP-1 approach clearly. <strong>The regular follow-ups and nutrition guidance made the whole process feel much more structured.</strong> I always knew what the next step was.",
  },
  {
    name: "Meera Nair",
    service: "Abdomen Inch Loss",
    quote:
      "I specifically wanted to work on my abdomen, and the team explained the treatment properly before starting. <strong>The session was comfortable and the overall experience felt very professional.</strong>",
  },
  {
    name: "Rhea Menon",
    service: "GLP-1 Weight Management",
    quote:
      "I was honestly quite unsure about GLP-1 when I first enquired. <strong>The consultation helped me understand whether it was appropriate for me instead of feeling like I was being pushed into it.</strong> I really appreciated that approach.",
  },
  {
    name: "Aishwarya Kulkarni",
    service: "Hips Inch Loss",
    quote:
      "I came in specifically for my hips and liked how clearly everything was explained. <strong>The treatment itself was relaxing, and the team was attentive throughout.</strong>",
  },
  {
    name: "Sahana Iyer",
    service: "Thighs Inch Loss",
    quote:
      "The biggest difference for me was the overall experience. From the initial consultation to the treatment sessions, <strong>everyone was patient and explained what they were doing.</strong> I was looking for something focused on my thighs rather than another general weight-loss plan, so having an area-specific treatment made sense for what I wanted.",
  },
  {
    name: "Kavya Shetty",
    service: "Weight Management & Body Contouring",
    quote:
      "I initially came to Glossary for weight management, but I also wanted to understand what could be done for specific areas. I liked that the team looked at the bigger picture instead of immediately recommending one treatment. <strong>The consultation felt personal and the follow-up was reassuring.</strong>",
  },
];

// -----------------------------------------------------------------------------
// RESULTS JOURNEYS — "Real Treatment Journeys" before/after carousel. Each
// entry needs a genuine, verified before/after pair from the same client —
// never a stock photo, never two unrelated photos. `before`/`after` are left
// null until a verified matched pair exists for that area; the carousel
// renders those as a "photos coming soon" slide instead of inventing one.
// age/sessions/duration are deliberately not fields here at all — the
// project has no verified value for any of them for any client yet. Add a
// field only once a real, confirmed number exists for that specific pair.
// -----------------------------------------------------------------------------
// Pairs 1–3 are the client-supplied "Before N / After N" images (assets/img,
// converted to before-N.webp / after-N.webp). The area label is inferred
// from what each pair shows — confirm with the Glossary team if any differ.
// Story copy describes the TREATMENT (verified service facts), never the
// person pictured: no client names, quotes, goals, session counts or
// outcomes are attached to a pair until the client has verified them.
// `program` preselects the form; null = no preselection.
const RESULTS_JOURNEYS = [
  {
    id: "abdomen",
    area: "Abdomen",
    label: "Abdomen · Body Contouring",
    heading: "Targeted care for the abdomen.",
    summary: "A guided session combining G5 massage, ultrasonic cavitation, radio frequency, lymphatic drainage and heat + EMS.",
    details: [["Treatment", "Abdomen Inch Loss"], ["Session", "90 min · Starts ₹6,999"]],
    program: "abdomen",
    before: "assets/img/before-1.webp",
    after: "assets/img/after-1.webp",
  },
  {
    id: "hips",
    area: "Hips",
    label: "Hips · Body Contouring",
    heading: "Targeted care for the hips.",
    summary: "The same guided, multi-step approach, focused on the hips.",
    details: [["Treatment", "Hips Inch Loss"], ["Session", "120 min · Starts ₹6,999"]],
    program: "hips",
    before: "assets/img/before-2.webp",
    after: "assets/img/after-2.webp",
  },
  {
    id: "thighs",
    area: "Thighs",
    label: "Thighs · Body Contouring",
    heading: "Targeted care for the thighs.",
    summary: "The same guided, multi-step approach, focused on the thighs.",
    details: [["Treatment", "Thighs Inch Loss"], ["Session", "120 min · Starts ₹6,999"]],
    program: "thighs",
    before: "assets/img/results-thighs-before.webp",
    after: "assets/img/results-thighs-after.webp",
  },
  {
    id: "weight",
    area: "Weight Management",
    label: "Weight Management",
    heading: "Doctor-guided weight management.",
    summary: "A personalised approach that starts with a doctor's suitability assessment.",
    details: [["Treatment", "Weight Management"], ["Approach", "Doctor-guided · Suitability assessed"]],
    program: null,
    before: "assets/img/before-3.webp",
    after: "assets/img/after-3.webp",
  },
];

// -----------------------------------------------------------------------------
// REELS — "See the Care Behind the Treatment" video cards; tapping one opens
// that video full-screen with sound. Approved clips only. reel-2.mp4 is the
// web-compressed "reel 2.mp4" (7 MB vs 126 MB source); its poster is a clean,
// text-free frame. The footage itself mentions EMSCULPT and a ₹24,999
// package — approved for display as supplied, but never repeat either in
// page copy or captions.
// -----------------------------------------------------------------------------
const REELS = [
  {
    id: "how-it-works",
    title: "How the Program Works",
    posterUrl: "assets/img/reel-1-poster.jpg",
    videoUrl: "assets/video/reel-1.mp4",
  },
  {
    id: "glossary-experience",
    title: "The Glossary Experience",
    posterUrl: "assets/img/reel-2-poster.jpg",
    videoUrl: "assets/video/reel-2.mp4",
  },
];

// -----------------------------------------------------------------------------
// TIME PREFERENCES — the booking modal asks which part of the day works
// best rather than a specific slot. There's no live calendar/slot-availability
// system behind this yet, so offering an exact time (e.g. "2:00 PM") would
// imply real-time availability that isn't actually being checked — a general
// preference is both simpler to choose from and honest about what it is.
// The team confirms the exact time when they call. Swap this for a real
// slot-picker once live availability exists.
// -----------------------------------------------------------------------------
const TIME_PREFERENCES = ["Anytime", "Morning", "Afternoon", "Evening"];
