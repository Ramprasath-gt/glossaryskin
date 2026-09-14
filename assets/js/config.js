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

  // The same Apps Script Web App URL as GOOGLE_SHEET_WEBHOOK_URL in
  // assets/php/config.php. Called directly from the browser so leads still
  // reach the Google Sheet even when hosted somewhere without PHP (e.g.
  // GitHub Pages) — not a secret, it's a public write-only endpoint. Leave
  // blank to skip.
  googleSheetWebhookUrl: "https://script.google.com/macros/s/AKfycbzbOp0FCQ0_re7rBEBC12UxIJ9OlapM9SYL8nuBLttKZeYYJPQ7t32yoaeSxAkzIOooOg/exec",

  // Google Maps JavaScript API key (public, browser-restricted — NOT a secret).
  // Restrict it in Google Cloud Console to your production domain + the Maps
  // JavaScript API, Places API and Geocoding API. Leave empty to skip the
  // interactive map — the booking flow still works via geolocation + manual entry.
  googleMapsApiKey: "",

  // Tracking IDs — leave blank to skip injecting that script entirely.
  metaPixelId: "",
  ga4Id: "",
  gtmId: "",
};

// -----------------------------------------------------------------------------
// UX TIMING — auto-popup behaviour.
// -----------------------------------------------------------------------------
const UX_CONFIG = {
  // Fallback timer for the first automatic booking-form popup — only used if
  // the visitor hasn't already scrolled to the "Two Clear Paths" section
  // (which triggers the popup immediately, since reaching it means they've
  // had a chance to confirm their service is on the page). Skipped entirely
  // if the visitor already opened the form manually before either fires.
  autoOpenDelayMs: 5000,
  // Every time the visitor closes an auto-opened popup without completing
  // the form, it reopens again after this delay — repeating, not a single
  // second attempt, per the current campaign strategy.
  autoReopenDelayMs: 10000,
  // Safety cap on how many times the auto-popup can reopen itself in one
  // session (on top of the first appearance) — keeps "keeps coming back"
  // from becoming a literal infinite loop that never stops nagging a visitor
  // who has no intention of booking. Raise or remove if you've decided
  // that's genuinely worth the bounce-rate risk.
  maxAutoReopens: 4,
};

// -----------------------------------------------------------------------------
// TRUST BADGES — "Why Clients Choose Glossary" photo grid.
// -----------------------------------------------------------------------------
const TRUST_BADGES = [
  { label: "Certified Doctors", image: "assets/img/trust-certified-doctors.webp" },
  { label: "Premium At-Home Treatments", image: "assets/img/trust-at-home-treatments.webp" },
  { label: "Personalized Care", image: "assets/img/trust-personalized-care.webp" },
  { label: "Medical Supervision", image: "assets/img/trust-medical-supervision.webp" },
  { label: "Structured Monitoring", image: "assets/img/trust-structured-monitoring.webp" },
  { label: "Private & Convenient Experience", image: "assets/img/trust-private-experience.webp" },
];

// Real, verified credential shown as a caption over the featured "Certified
// Doctors" photo above (TRUST_BADGES[0]). Only edit this alongside that
// image — the two must stay in sync with whoever is actually pictured.
const FEATURED_DOCTOR = {
  name: "Dr. Shah Nawaz",
  credential: "MD Medicine · Royal College of Physicians, UK",
  experience: "25+ Years of Experience",
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
  { id: "abdomen", label: "Abdomen Inch Loss", priceLabel: "Starting from ₹4,050" },
  { id: "hips", label: "Hips Inch Loss", priceLabel: "Starting from ₹4,050" },
  { id: "thighs", label: "Thighs Inch Loss", priceLabel: "Starting from ₹4,050" },
  { id: "emsculpt", label: "EMSCULPT", priceLabel: "Starting from ₹10,000" },
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
// REELS — shown as a 4-up phone-mockup grid; tapping a tile opens that video
// full-screen with sound. Drop video files in at these EXACT paths
// (assets/video/reel-1.mp4, etc, with matching posters in assets/img/) and
// they activate automatically. See SETUP.md for exact specs.
// -----------------------------------------------------------------------------
const REELS = [
  {
    id: "how-it-works",
    title: "How the Program Works",
    caption: "A walkthrough of the doctor-guided process, from consultation to monitoring.",
    posterUrl: "assets/img/reel-1-poster.jpg",
    videoUrl: "assets/video/reel-1.mp4",
  },
  {
    id: "clinical-experience",
    title: "The Doctor-Led Experience",
    caption: "Meet the clinical approach behind every Glossary weight management program.",
    posterUrl: "assets/img/reel-2-poster.jpg",
    videoUrl: "assets/video/reel-2.mp4",
  },
  {
    id: "patient-experience",
    title: "The Glossary Experience",
    caption: "What to expect at every step, from booking to your first check-in.",
    posterUrl: "assets/img/reel-3-poster.jpg",
    videoUrl: "assets/video/reel-3.mp4",
  },
  {
    id: "spa-experience",
    title: "Inside a Treatment Session",
    caption: "A look at the calm, spa-grade setting every session takes place in.",
    posterUrl: "assets/img/reel-4-poster.jpg",
    videoUrl: "assets/video/reel-4.mp4",
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
