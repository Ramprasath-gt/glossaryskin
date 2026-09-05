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
  googleSheetWebhookUrl: "https://script.google.com/macros/s/AKfycbyTLnXCVDxVKAthIU_cfMpBXyQ7oJiSy-exUSPnItMTeZDKZGs1s1QhoZ5FRlpw3WoJhw/exec",

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
// UX TIMING — auto-popup + story-reel behaviour.
// -----------------------------------------------------------------------------
const UX_CONFIG = {
  // First automatic booking-form popup, ms after page load (skipped if the
  // visitor already opened the form manually before this fires).
  autoOpenDelayMs: 5000,
  // If the visitor closes that first popup, a second (final) attempt fires
  // this many ms later. No further auto-popups after that.
  autoReopenDelayMs: 15000,
  // How long each reel "story" auto-plays before advancing to the next one.
  storyDurationMs: 15000,
};

// -----------------------------------------------------------------------------
// MEDIA — drop files in with these EXACT names and they activate automatically,
// no code changes needed. Until a file exists at a path, the page shows a
// tasteful placeholder instead of a broken image/video. See SETUP.md → "Adding
// real photography & video" for exact specs (dimensions, format, size).
// -----------------------------------------------------------------------------
const MEDIA = {
  programImages: {
    "tirzetone-360": "assets/img/program-tirzetone.png",
    "sematone-360": "assets/img/program-sematone.png",
    "wegotone-360": "assets/img/program-wegotone.webp",
  },
};

// -----------------------------------------------------------------------------
// TRUST BADGES — "Why Clients Choose Glossary" photo grid.
// -----------------------------------------------------------------------------
const TRUST_BADGES = [
  { label: "Certified Doctors", image: "assets/img/trust-certified-doctors.png" },
  { label: "Premium At-Home Treatments", image: "assets/img/trust-at-home-treatments.png" },
  { label: "Personalized Care", image: "assets/img/trust-personalized-care.png" },
  { label: "Medical Supervision", image: "assets/img/trust-medical-supervision.png" },
  { label: "Structured Monitoring", image: "assets/img/trust-structured-monitoring.png" },
  { label: "Private & Convenient Experience", image: "assets/img/trust-private-experience.png" },
];

// -----------------------------------------------------------------------------
// PROGRAMS — sourced from glossaryskin.com/treatment/{slug} pages.
// -----------------------------------------------------------------------------
const PROGRAMS = [
  {
    id: "tirzetone-360",
    name: "TirzeTone 360",
    positioning: "Doctor-led GLP-1 weight management paired with advanced body contouring.",
    priceLabel: "₹60,000",
    inclusions: [
      "Online consultation with an Endocrinologist / medical expert",
      "Prescription-based weekly clinical protocol",
      "Doctor-led dose titration and adjustments",
      "Advanced body contouring (Cavitation + RF + EMS)",
      "Personalised nutritionist meal plans",
      "Monthly progress check-ins",
    ],
  },
  {
    id: "sematone-360",
    name: "SemaTone 360",
    positioning: "GLP-1 weight management with medical monitoring, nutrition support and weekly slimming sessions.",
    priceLabel: "₹40,374",
    inclusions: [
      "Weekly doctor-supervised metabolic protocol",
      "Weekly body-slimming sessions",
      "Dietician consultations",
      "Medical diagnostics and monitoring",
      "Lifestyle coaching",
      "GI-relief kit for side-effect support",
      "Optional maintenance after 90 days",
    ],
  },
  {
    id: "wegotone-360",
    name: "WegoTone 360",
    positioning: "Doctor-guided GLP-1 weight management combined with structured body-slimming support.",
    priceLabel: "₹56,171",
    inclusions: [
      "Weekly doctor-supervised metabolic protocol",
      "Weekly body-slimming sessions",
      "Dietician consultations",
      "Medical diagnostics and monitoring",
      "Lifestyle coaching",
      "GI-relief kit for side-effect support",
      "Optional maintenance after 90 days",
    ],
  },
];

// -----------------------------------------------------------------------------
// TESTIMONIALS — provided directly by the Glossary Skin team, one per program.
// -----------------------------------------------------------------------------
const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    service: "TirzeTone 360",
    quote:
      "The TirzeTone 360 program gave me a much more structured approach to my weight-management journey. The doctor explained everything clearly, monitored my progress and guided me throughout the process. I also really appreciated the body-contouring sessions and the overall professional experience.",
  },
  {
    name: "Sneha Kapoor",
    service: "SemaTone 360",
    quote:
      "I'm really happy with my experience with SemaTone 360. The regular doctor consultations, dietician support and weekly slimming sessions made the program easy to follow. The team was professional, supportive and attentive throughout.",
  },
  {
    name: "Rahul Sharma",
    service: "WegoTone 360",
    quote:
      "WegoTone 360 has been a positive experience for me. I liked having regular medical guidance along with dietician support and weekly body-slimming sessions. Everything was explained properly, and the team made the entire process comfortable and well managed.",
  },
  {
    name: "Ananya Iyer",
    service: "Weight Management Program",
    quote:
      "What I liked most was that the weight-management program wasn't just about one treatment. I received medical guidance, nutrition support and regular monitoring throughout the journey. The team was professional, approachable and made me feel supported at every step.",
  },
];

// -----------------------------------------------------------------------------
// REELS — story-style, auto-advancing every UX_CONFIG.storyDurationMs.
// Drop video files in at these EXACT paths (assets/video/reel-1.mp4, etc, with
// matching posters in assets/img/) and they activate automatically — until a
// file exists there, that slot shows a tasteful placeholder instead of a
// broken/fabricated video. See SETUP.md for exact specs.
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
];

// -----------------------------------------------------------------------------
// APPOINTMENT SLOTS — placeholder availability, not a live calendar feed.
// Swap getAvailableSlots() for a real availability API call later; keep the
// same return shape ([{id,label,period}]) and nothing else needs to change.
// -----------------------------------------------------------------------------
const DAILY_SLOTS = [
  { id: "10-00", label: "10:00 AM", period: "Morning" },
  { id: "11-00", label: "11:00 AM", period: "Morning" },
  { id: "12-00", label: "12:00 PM", period: "Morning" },
  { id: "13-00", label: "1:00 PM", period: "Afternoon" },
  { id: "14-00", label: "2:00 PM", period: "Afternoon" },
  { id: "15-00", label: "3:00 PM", period: "Afternoon" },
  { id: "16-00", label: "4:00 PM", period: "Afternoon" },
  { id: "17-00", label: "5:00 PM", period: "Evening" },
  { id: "18-00", label: "6:00 PM", period: "Evening" },
  { id: "19-00", label: "7:00 PM", period: "Evening" },
];

function getAvailableSlots(dateISO) {
  const date = new Date(dateISO + "T00:00:00");
  const seed = date.getDate();
  return DAILY_SLOTS.filter((_, i) => (seed + i) % 5 !== 0);
}

const WEIGHT_LOSS_GOALS = ["Lose under 5 kg", "Lose 5–10 kg", "Lose 10–20 kg", "Lose 20+ kg"];
