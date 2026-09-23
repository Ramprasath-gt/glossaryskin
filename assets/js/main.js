// =============================================================================
// GLOSSARY SKIN — WEIGHT MANAGEMENT LANDING PAGE
// Vanilla JS only — no build step, no framework. Reads data from config.js.
// =============================================================================

/* -----------------------------------------------------------------------
   TRACKING
   Meta Pixel / GA4 / GTM are injected only if an ID is present in config.js.
------------------------------------------------------------------------ */
const TRACK_EVENTS = {
  PAGE_VIEW: "PageView",
  VIEW_CONTENT: "ViewContent",
  CTA_CLICK: "CTA_Click",
  PROGRAM_CLICK: "Program_Click",
  INTEREST_SELECTED: "Interest_Selected",
  SERVICE_NAV_CLICK: "Service_Nav_Click",
  WHATSAPP_CLICK: "WhatsApp_Click",
  FORM_START: "Form_Start",
  FORM_STEP_COMPLETED: "Form_Step_Completed",
  LOCATION_ADDED: "Location_Added",
  DATE_SELECTED: "Date_Selected",
  TIME_SELECTED: "Time_Selected",
  FORM_SUBMIT: "Form_Submit",
  LEAD: "Lead",
  BOOKING_COMPLETED: "Booking_Completed",
};

function track(eventName, payload) {
  payload = payload || {};
  if (window.fbq) window.fbq("trackCustom", eventName, payload);
  if (window.gtag) window.gtag("event", eventName, payload);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: eventName }, payload));
  console.debug("[track]", eventName, payload);
}

(function injectTracking() {
  if (SITE_CONFIG.gtmId) {
    const s = document.createElement("script");
    s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${SITE_CONFIG.gtmId}');`;
    document.head.appendChild(s);
  }
  if (SITE_CONFIG.metaPixelId) {
    const s = document.createElement("script");
    s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${SITE_CONFIG.metaPixelId}');fbq('track','PageView');`;
    document.head.appendChild(s);
  }
  if (SITE_CONFIG.ga4Id) {
    const s1 = document.createElement("script");
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.ga4Id}`;
    s1.async = true;
    document.head.appendChild(s1);
    const s2 = document.createElement("script");
    s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${SITE_CONFIG.ga4Id}');`;
    document.head.appendChild(s2);
  }
  track(TRACK_EVENTS.PAGE_VIEW, {});
})();

/* -----------------------------------------------------------------------
   NAVBAR + SCROLL PROGRESS BAR
   One rAF-throttled scroll listener drives both — cheaper than two raw
   "scroll" handlers doing style writes on every fired event (scroll can fire
   far more often than the display can repaint, especially during momentum
   scrolling on mobile).
------------------------------------------------------------------------ */
const navbar = document.getElementById("navbar");
const scrollProgress = document.getElementById("scrollProgress");

let scrollTicking = false;
function updateOnScroll() {
  navbar.classList.toggle("navbar--scrolled", window.scrollY > 12);
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
  scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, scrolled))})`;
  scrollTicking = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateOnScroll);
  },
  { passive: true }
);
updateOnScroll(); // set correct initial state if the page loads already scrolled (e.g. back-navigation)

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
burgerBtn.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("is-open");
  burgerBtn.classList.toggle("is-open", open);
  burgerBtn.setAttribute("aria-expanded", String(open));
});
mobileMenu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    burgerBtn.classList.remove("is-open");
  })
);

/* -----------------------------------------------------------------------
   SERVICE QUICK-NAV (hero) + WHATSAPP CLICK TRACKING
------------------------------------------------------------------------ */
document.querySelectorAll("[data-track-nav]").forEach((el) => {
  el.addEventListener("click", () => {
    track(TRACK_EVENTS.SERVICE_NAV_CLICK, { service: el.dataset.trackNav });
  });
});

// Subtle scrollspy: highlight the quick-nav chip for whichever service
// section currently sits in the vertical centre of the viewport. Purely a
// "you are here" cue — extremely subtle by design, not an attention-getter.
(function serviceNavActiveState() {
  // Grouped as arrays, not single elements — the intent chips now exist
  // twice (a standalone mobile card, and a desktop overlay on the hero
  // photo), and both copies for a given service need to light up together.
  const chipsById = {};
  document.querySelectorAll("[data-track-nav]").forEach((chip) => {
    (chipsById[chip.dataset.trackNav] ||= []).push(chip);
  });
  const targets = Object.keys(chipsById)
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (targets.length === 0) return;

  const navSpyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const chips = chipsById[entry.target.id];
        if (!chips) return;
        chips.forEach((chip) => chip.classList.toggle("is-active", entry.isIntersecting));
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );
  targets.forEach((el) => navSpyObserver.observe(el));
})();
document.querySelectorAll("[data-whatsapp-click]").forEach((el) => {
  el.addEventListener("click", () => {
    track(TRACK_EVENTS.WHATSAPP_CLICK, { source: el.dataset.source || "unknown" });
  });
});

/* -----------------------------------------------------------------------
   BUTTON RIPPLE — Material-style click feedback on every .btn. Purely
   visual (no functional change); `currentColor` makes it adapt automatically
   to each button variant's own text colour instead of needing per-variant
   overrides.
------------------------------------------------------------------------ */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn || btn.disabled) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "btn-ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = e.clientX - rect.left - size / 2 + "px";
  ripple.style.top = e.clientY - rect.top - size / 2 + "px";
  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
});

/* -----------------------------------------------------------------------
   REVEAL ON SCROLL — staggered: siblings inside the same parent cascade in
   with an incremental delay instead of popping in together.
------------------------------------------------------------------------ */
function applyStagger(container) {
  const items = container.querySelectorAll(":scope > .reveal");
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 40, 200)}ms`;
  });
}
document.querySelectorAll(".problem__grid, .approach__grid, .why__grid, .glp1__journey, .contouring__grid, .tech__index, .paths__grid").forEach(applyStagger);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* -----------------------------------------------------------------------
   WEIGHT-MANAGEMENT CALCULATOR — weight slider drives the dial and reflects
   the visitor's own entered weight back at them. The only computed value is
   BMI (weight / height^2), a standard, real screening formula — not a
   predicted or invented weight-loss outcome. There is no verified weight-
   loss calculation methodology in this project, so this deliberately never
   predicts a number and instead points to a real consultation.
------------------------------------------------------------------------ */
(function initCalculator() {
  const weightSlider = document.getElementById("calcWeight");
  const heightSlider = document.getElementById("calcHeight");
  if (!weightSlider || !heightSlider) return;
  const valueEl = document.getElementById("calcWeightValue");
  const heightValueEl = document.getElementById("calcHeightValue");
  const bmiValueEl = document.getElementById("calcBmiValue");
  const bmiTagEl = document.getElementById("calcBmiTag");
  const needle = document.getElementById("calcNeedle");
  const dialFill = document.getElementById("calcDialFill");
  const min = Number(weightSlider.min);
  const max = Number(weightSlider.max);
  const dialLength = dialFill ? dialFill.getTotalLength() : 0;
  if (dialFill) dialFill.style.strokeDasharray = String(dialLength);

  // Standard WHO BMI bands — informational classification, not a diagnosis.
  function bmiCategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  function update() {
    const weight = Number(weightSlider.value);
    const heightCm = Number(heightSlider.value);
    valueEl.textContent = weightSlider.value;
    heightValueEl.textContent = heightSlider.value;

    const fraction = (weight - min) / (max - min);
    if (dialFill) dialFill.style.strokeDashoffset = String(dialLength * (1 - fraction));
    if (needle) needle.style.transform = `rotate(${-125 + fraction * 250}deg)`;

    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    bmiValueEl.textContent = bmi.toFixed(1);
    bmiTagEl.textContent = bmiCategory(bmi);
  }
  weightSlider.addEventListener("input", update);
  heightSlider.addEventListener("input", update);
  update();
})();

/* -----------------------------------------------------------------------
   RENDER: REAL TREATMENT JOURNEYS (before/after carousel)
------------------------------------------------------------------------ */
// One journey visible at a time — a visitor evaluating proof shouldn't have
// to scroll past several large image pairs, and this keeps mobile (the
// majority of ad traffic) to one clear comparison per view. Arrows and dots
// call the same setActive() as touch swipe. Journeys with no verified
// before/after pair yet (see RESULTS_JOURNEYS in config.js) render as an
// honest "coming soon" panel — never a stock or mismatched photo.
(function renderResultsCarousel() {
  const dotsEl = document.getElementById("resultsDots");
  const stageEl = document.getElementById("resultsStage");
  const prevBtn = document.getElementById("resultsPrev");
  const nextBtn = document.getElementById("resultsNext");
  if (!dotsEl || !stageEl || typeof RESULTS_JOURNEYS === "undefined" || RESULTS_JOURNEYS.length === 0) return;

  function slideMarkup(j) {
    const media =
      j.before && j.after
        ? `
      <div class="results__pair">
        <div class="results__shot">
          <img src="${j.before}" alt="${j.area} — before" loading="lazy" decoding="async" />
          <span class="results__shot-label">Before</span>
        </div>
        <div class="results__shot">
          <img src="${j.after}" alt="${j.area} — after" loading="lazy" decoding="async" />
          <span class="results__shot-label">After</span>
        </div>
      </div>`
        : `
      <div class="results__pending">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 16l-5-4-4 3-3-2-6 5"/></svg>
        <p>Verified before-and-after photos for ${j.treatment} are being added.</p>
      </div>`;

    const quote = j.quote
      ? `
      <blockquote class="results__quote">
        <p>&ldquo;${j.quote}&rdquo;</p>
        <cite>— ${j.quoteName}, ${j.treatment} client</cite>
      </blockquote>`
      : "";

    return `
    <div class="results__slide" data-id="${j.id}">
      ${media}
      <div class="results__info">
        <h3>${j.treatment}</h3>
        <p>${j.description}</p>
        ${quote}
        <button class="btn btn--primary btn--md" data-open-booking data-program="${j.program}" data-source="results_${j.id}">Explore My Treatment Options</button>
      </div>
    </div>`;
  }

  stageEl.innerHTML = RESULTS_JOURNEYS.map(slideMarkup).join("");
  dotsEl.innerHTML = RESULTS_JOURNEYS.map(
    (j, i) => `
    <button type="button" class="results__dot" data-index="${i}" aria-label="Show ${j.area} treatment journey">
      ${j.avatar ? `<img src="${j.avatar}" alt="" loading="lazy" decoding="async" />` : `<span class="results__dot-fallback">${j.area.slice(0, 1)}</span>`}
    </button>`
  ).join("");

  const slides = Array.from(stageEl.querySelectorAll(".results__slide"));
  const dots = Array.from(dotsEl.querySelectorAll(".results__dot"));

  // Default to the first journey that actually has real photos — a
  // visitor's first impression of this section should be real proof,
  // not a "coming soon" panel, even though Abdomen sorts first in the list.
  let activeIndex = RESULTS_JOURNEYS.findIndex((j) => j.before && j.after);
  if (activeIndex === -1) activeIndex = 0;

  function setActive(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === activeIndex));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === activeIndex));
  }
  setActive(activeIndex);

  prevBtn.addEventListener("click", () => setActive(activeIndex - 1));
  nextBtn.addEventListener("click", () => setActive(activeIndex + 1));
  dots.forEach((d) => d.addEventListener("click", () => setActive(Number(d.dataset.index))));

  // Touch swipe (left = next, right = prev) — a threshold-based commit on
  // release, no drag-following animation, so it can't fight page scroll.
  let touchStartX = null;
  stageEl.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stageEl.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) setActive(activeIndex + (delta < 0 ? 1 : -1));
      touchStartX = null;
    },
    { passive: true }
  );
})();

/* -----------------------------------------------------------------------
   RENDER: TRUST BADGES ("Why Clients Choose Glossary" photo grid)
------------------------------------------------------------------------ */
// One dominant image (the first entry) plus smaller supporting tiles,
// instead of six equal-weight photos — reads as "here's the evidence,"
// not a uniform marketing-claims grid.
const trustBadgesGrid = document.getElementById("trustBadgesGrid");
const [featuredBadge, ...supportingBadges] = TRUST_BADGES;
// Inline icon set for badges with no verified photo — see TRUST_BADGES.
const TRUST_ICONS = {
  care: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 8.6c0 4.6-8.8 10-8.8 10s-8.8-5.4-8.8-10a4.8 4.8 0 0 1 8.8-2.7A4.8 4.8 0 0 1 20.8 8.6Z"/></svg>',
  private: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
};
trustBadgesGrid.innerHTML = `
  <div class="trust-feature reveal">
    <div class="trust-feature__visual">
      <img src="${featuredBadge.image}" alt="${FEATURED_DOCTOR.name}, ${FEATURED_DOCTOR.credential}" loading="lazy" decoding="async" onload="this.classList.add('is-loaded')" onerror="this.remove()" />
      <div class="trust-feature__caption">
        <p class="trust-feature__name">${FEATURED_DOCTOR.name}</p>
        <p class="trust-feature__credential">${FEATURED_DOCTOR.credential}</p>
        <span class="trust-feature__experience">${FEATURED_DOCTOR.experience}</span>
      </div>
    </div>
    <p>${featuredBadge.label}</p>
  </div>
  <div class="trust-badges__grid">
    ${supportingBadges
      .map(
        (b) => `
    <div class="trust-badge-card reveal">
      <div class="trust-badge-card__visual${b.icon ? " trust-badge-card__visual--icon" : ""}">
        ${
          b.icon
            ? TRUST_ICONS[b.icon] || ""
            : `<img src="${b.image}" alt="${b.label}" loading="lazy" decoding="async" onload="this.classList.add('is-loaded')" onerror="this.remove()" />`
        }
      </div>
      <p>${b.label}</p>
    </div>`
      )
      .join("")}
  </div>
`;
applyStagger(trustBadgesGrid.querySelector(".trust-badges__grid"));
trustBadgesGrid.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* -----------------------------------------------------------------------
   RENDER: TESTIMONIALS
------------------------------------------------------------------------ */
// Real customer photos aren't available for these named reviews, and using
// unrelated stock photos under a real person's name would misrepresent who
// they are — an initials avatar (the same convention Google Reviews itself
// falls back to) is the honest option here.
function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// One featured review (the first entry) stops the scroll; the rest support
// it in a smaller grid — six identical cards made genuine testimonials read
// as filler, which is exactly what this avoids.
function testimonialCard(t, extraClass) {
  return `
  <div class="testimonial-card${extraClass ? " " + extraClass : ""} reveal">
    <span class="stars">★★★★★</span>
    <p class="testimonial-quote">&ldquo;${t.quote}&rdquo;</p>
    <div class="testimonial-meta">
      <span class="testimonial-avatar" aria-hidden="true">${getInitials(t.name)}</span>
      <div>
        <p class="name">${t.name}</p>
        <span class="service-pill">${t.service}</span>
      </div>
    </div>
  </div>`;
}

const testimonialsRow = document.getElementById("testimonialsRow");
const [featuredTestimonial, ...supportingTestimonials] = TESTIMONIALS;
testimonialsRow.innerHTML =
  testimonialCard(featuredTestimonial, "testimonial-card--featured") +
  `<div class="testimonials__grid">${supportingTestimonials.map((t) => testimonialCard(t)).join("")}</div>`;
applyStagger(testimonialsRow.querySelector(".testimonials__grid"));
testimonialsRow.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* -----------------------------------------------------------------------
   SOCIAL PROOF TOAST — a corner notification cycling through real reviews,
   replacing the pull-quotes that used to be scattered across individual
   sections. Shows one review at a time, on a 30s cycle; pauses while the
   tab is hidden so it never runs invisibly, and stays dismissed for the
   session if closed so it never re-annoys a visitor who already closed it.
------------------------------------------------------------------------ */
(function socialProofToast() {
  const toast = document.getElementById("socialToast");
  if (!toast || TESTIMONIALS.length === 0) return;
  const avatarEl = document.getElementById("socialToastAvatar");
  const nameEl = document.getElementById("socialToastName");
  const textEl = document.getElementById("socialToastText");
  const closeBtn = document.getElementById("socialToastClose");

  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem("glossary_toast_dismissed") === "1";
  } catch (e) {
    /* private-browsing / storage blocked — just don't persist the dismissal */
  }
  if (dismissed) return;

  const CYCLE_MS = 30000;
  const VISIBLE_MS = 7000;
  let index = 0;
  let cycleId = null;
  let hideTimeoutId = null;

  function showNext() {
    const t = TESTIMONIALS[index % TESTIMONIALS.length];
    index++;
    avatarEl.textContent = getInitials(t.name);
    nameEl.textContent = t.name;
    textEl.textContent = `Left a 5★ Google review for ${t.service}`;
    toast.classList.add("is-visible");
    clearTimeout(hideTimeoutId);
    hideTimeoutId = setTimeout(() => toast.classList.remove("is-visible"), VISIBLE_MS);
  }

  function start() {
    if (cycleId) return;
    showNext();
    cycleId = setInterval(showNext, CYCLE_MS);
  }
  function stop() {
    clearInterval(cycleId);
    cycleId = null;
    clearTimeout(hideTimeoutId);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  closeBtn.addEventListener("click", () => {
    toast.classList.remove("is-visible");
    stop();
    try {
      sessionStorage.setItem("glossary_toast_dismissed", "1");
    } catch (e) {}
  });

  // First appearance is deliberately delayed — not an instant pop-up the
  // moment the page loads, so it reads as organic activity rather than an
  // intrusive greeting.
  setTimeout(start, 8000);
})();

/* -----------------------------------------------------------------------
   REELS — static 4-up "phone mockup" grid. Each tile is a poster image
   inside a CSS phone-bezel frame with a play button; tapping any tile opens
   the same video full-screen with sound via reelLightbox. A missing video
   file just disables that tile's click instead of showing a broken player.
------------------------------------------------------------------------ */
const phoneMockupGrid = document.getElementById("phoneMockupGrid");

phoneMockupGrid.innerHTML = REELS.map(
  (reel, i) => `
    <button type="button" class="phone-mockup" data-reel-index="${i}" aria-label="Play: ${reel.title}">
      <span class="phone-mockup__frame">
        <span class="phone-mockup__notch"></span>
        <img class="phone-mockup__poster" src="${reel.posterUrl}" alt="${reel.title}" loading="lazy"
          onload="this.classList.add('is-loaded')" onerror="this.remove()">
        <span class="phone-mockup__play">▶</span>
      </span>
      <span class="phone-mockup__caption">${reel.title}</span>
    </button>`
).join("");

const reelLightbox = document.createElement("div");
reelLightbox.className = "reel-lightbox";
reelLightbox.innerHTML = `<div class="reel-lightbox__inner"><video controls playsinline></video><button class="reel-lightbox__close">Close ✕</button></div>`;
document.body.appendChild(reelLightbox);
const reelLightboxVideo = reelLightbox.querySelector("video");

phoneMockupGrid.querySelectorAll(".phone-mockup").forEach((tile) => {
  tile.addEventListener("click", () => {
    const reel = REELS[Number(tile.dataset.reelIndex)];
    if (!reel.videoUrl) return;
    reelLightboxVideo.src = reel.videoUrl;
    reelLightboxVideo.muted = false;
    reelLightbox.classList.add("is-open");
    reelLightboxVideo.play().catch(() => {});
  });
});
reelLightbox.addEventListener("click", (e) => {
  if (e.target === reelLightbox || e.target.closest(".reel-lightbox__close")) {
    reelLightbox.classList.remove("is-open");
    reelLightboxVideo.pause();
    reelLightboxVideo.removeAttribute("src");
  }
});

/* -----------------------------------------------------------------------
   VALIDATION HELPERS
------------------------------------------------------------------------ */
const isValidMobile = (v) => /^[6-9]\d{9}$/.test((v || "").replace(/\D/g, ""));
const isValidPincode = (v) => /^\d{6}$/.test((v || "").trim());
const isNonEmpty = (v) => (v || "").trim().length > 0;
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());

// Maps each error span to the field it belongs to, so setError can put a
// visible border on the field itself instead of leaving that to a small
// text line alone.
const FIELD_FOR_ERROR = {
  err_fullName: "f_fullName",
  err_mobile: "f_mobile",
  err_email: "f_email",
  err_city: "f_city",
  err_pincode: "f_pincode",
  err_phone: "f_phone",
};

function setError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message || "";
  const fieldId = FIELD_FOR_ERROR[id];
  if (fieldId) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.toggle("has-error", !!message);
  }
}

// A stale error sitting under a field the visitor already fixed reads as
// "this form is broken" — clears the moment that one field becomes valid,
// without nagging with a NEW error while they're still mid-typing.
function clearErrorWhenValid(fieldId, errorId, validator) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.addEventListener("input", () => {
    if (validator(field.value)) setError(errorId, "");
  });
}
// On a short step this never matters, but step 4 (location) has enough
// fields that a visitor who scrolled down before hitting Continue could
// submit, see nothing happen, and never notice an error sitting above the
// current scroll position. Brings the first invalid field into view and
// focuses it so a failed validation is never silently invisible.
function focusFirstInvalid() {
  const field = document.querySelector(".form-step:not([hidden]) .has-error");
  if (!field) return;
  field.scrollIntoView({ block: "center", behavior: "smooth" });
  field.focus({ preventScroll: true });
}

Object.entries(FIELD_FOR_ERROR).forEach(([errorId, fieldId]) => {
  const validator =
    fieldId === "f_mobile" || fieldId === "f_phone"
      ? isValidMobile
      : fieldId === "f_pincode"
      ? isValidPincode
      : fieldId === "f_email"
      ? isValidEmail
      : isNonEmpty;
  clearErrorWhenValid(fieldId, errorId, validator);
});

/* -----------------------------------------------------------------------
   BOOKING MODAL STATE
------------------------------------------------------------------------ */
const overlay = document.getElementById("modalOverlay");
const modalHeader = document.getElementById("modalHeader");
const stepLabel = document.getElementById("stepLabel");
const progressBars = [1, 2, 3, 4].map((n) => document.getElementById("progressBar" + n));
const stickyCta = document.getElementById("stickyCta");

const STEP_LABELS = ["About You", "Your Goal", "Schedule", "Location"];
const TOTAL_STEPS = 4;

const bookingState = {
  step: 1,
  hasStarted: false,
  data: { consent: true },
};

// Optional contextual preselection: if the Meta ad's destination URL appends
// ?service=glp1 (or abdomen/hips/thighs/not-sure), pre-select that interest
// before the visitor even opens the form. Safe no-op if the parameter is
// absent or unrecognised — nothing on the current ad setup is assumed to send
// this yet; it only activates once/if the ad URLs are updated to include it.
(function presetInterestFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const preset = params.get("service") || params.get("interest");
  if (preset && INTEREST_OPTIONS.some((o) => o.id === preset)) {
    bookingState.data.preferredProgram = preset;
    track(TRACK_EVENTS.PROGRAM_CLICK, { program: preset, source: "url_param" });
  }
})();

// The URL changes on EVERY page of the form (e.g.
// "?form=open&step=2&program=sematone-360#book-consultation") so each step is
// a distinct, trackable page in GA4/Meta Ads Manager — funnel drop-off per
// step becomes visible, not just "did they open the form at all". Uses
// pushState once (on open) + replaceState per step, so the visitor's real
// browser-history stack never fills up with one entry per step; the actual
// browser back button is instead handled reactively via popstate below,
// which mirrors "close the modal" the way a native app screen would.
const BASE_URL = (function () {
  const params = new URLSearchParams(window.location.search);
  ["form", "program", "step"].forEach((key) => params.delete(key));
  const qs = params.toString();
  return window.location.pathname + (qs ? "?" + qs : "");
})();

const STEP_PATH_NAMES = ["step-1-about-you", "step-2-your-goal", "step-3-schedule", "step-4-location", "success"];

function pushModalUrl(programId) {
  const params = new URLSearchParams(window.location.search);
  params.set("form", "open");
  params.set("step", "1");
  if (programId) params.set("program", programId);
  const newUrl = `${window.location.pathname}?${params.toString()}#book-consultation`;
  history.pushState({ glossaryModal: true }, "", newUrl);
}

function updateModalStepUrl(step) {
  const params = new URLSearchParams(window.location.search);
  params.set("form", "open");
  params.set("step", String(step));
  if (bookingState.data.preferredProgram) params.set("program", bookingState.data.preferredProgram);
  const newUrl = `${window.location.pathname}?${params.toString()}#book-consultation`;
  history.replaceState({ glossaryModal: true }, "", newUrl);

  const pathName = STEP_PATH_NAMES[step - 1] || `step-${step}`;
  track(TRACK_EVENTS.VIEW_CONTENT, {
    virtual_page: `/book-consultation/${pathName}`,
    step,
    program: bookingState.data.preferredProgram || undefined,
  });
}

function popModalUrl() {
  if (history.state && history.state.glossaryModal) {
    history.replaceState({}, "", BASE_URL);
  }
}

window.addEventListener("popstate", () => {
  if (overlay.classList.contains("is-open")) {
    closeBooking({ fromPopState: true });
  }
});

/* -----------------------------------------------------------------------
   MODAL FOCUS TRAP — keyboard focus must stay inside the dialog while it's
   open (WAI-ARIA dialog pattern): focus moves in on open, Tab/Shift+Tab
   cycle only through the modal's own visible controls, and focus returns to
   whatever triggered the modal once it closes. Queried fresh on every Tab
   press rather than cached, since the visible field set changes between
   the form's steps.
------------------------------------------------------------------------ */
const modalEl = document.querySelector(".modal");
let modalTriggerEl = null;

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null);
}

function trapModalFocus(e) {
  if (e.key !== "Tab" || !overlay.classList.contains("is-open")) return;
  const focusable = getFocusableElements(modalEl);
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeInModal = modalEl.contains(document.activeElement);
  if (e.shiftKey) {
    if (!activeInModal || document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (!activeInModal || document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function openBooking(programId, source) {
  if (programId) {
    bookingState.data.preferredProgram = programId;
    track(TRACK_EVENTS.PROGRAM_CLICK, { program: programId, source });
  }
  track(TRACK_EVENTS.CTA_CLICK, { source: source || "unknown" });
  if (!bookingState.hasStarted) {
    track(TRACK_EVENTS.FORM_START, { source: source || "unknown" });
    bookingState.hasStarted = true;
  }
  if (!source || !source.startsWith("auto_popup")) hasManuallyOpened = true;
  modalTriggerEl = document.activeElement;
  overlay.classList.add("is-open");
  stickyCta.classList.add("is-hidden");
  document.body.classList.add("modal-open");
  pushModalUrl(programId);
  showStep(bookingState.step);
  modalEl.focus();
}

function closeBooking(opts) {
  overlay.classList.remove("is-open");
  stickyCta.classList.remove("is-hidden");
  document.body.classList.remove("modal-open");
  if (!(opts && opts.fromPopState)) popModalUrl();
  scheduleAutoReopen();
  if (modalTriggerEl && document.body.contains(modalTriggerEl)) modalTriggerEl.focus();
  modalTriggerEl = null;
}

document.querySelectorAll("[data-open-booking]").forEach((btn) => {
  btn.addEventListener("click", () => openBooking(btn.dataset.program, btn.dataset.source));
});
document.getElementById("modalCloseBtn").addEventListener("click", closeBooking);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeBooking();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("is-open")) closeBooking();
  else trapModalFocus(e);
});

function showStep(n) {
  bookingState.step = n;
  document.querySelectorAll(".form-step").forEach((el) => {
    el.hidden = Number(el.dataset.step) !== n;
  });
  const isSuccess = n > TOTAL_STEPS;
  modalHeader.hidden = isSuccess;
  if (!isSuccess) {
    progressBars.forEach((bar, i) => bar.classList.toggle("is-filled", i < n));
    stepLabel.textContent = `Step ${n} of ${TOTAL_STEPS} · ${STEP_LABELS[n - 1]}`;
  }
  document.getElementById("modalBody").scrollTop = 0;
  if (n === 2) renderInterestPills();
  if (n === 3) renderScheduleStep();
  // Only touch the URL/focus while the modal is actually open — showStep(1)
  // also runs right after the modal has been closed (resetting it for next
  // time), and that must never re-push a "?form=open" URL onto a closed
  // page or steal focus on a hidden dialog.
  if (overlay.classList.contains("is-open")) {
    updateModalStepUrl(n);
    // One less tap per step: lands the visitor straight in the first field
    // instead of requiring them to tap into it themselves. Only steps 1 and
    // 4 lead with a text field — 2 and 3 start with a tap-to-select control,
    // where autofocusing a hidden input wouldn't help.
    const firstField = document.querySelector(`.form-step[data-step="${n}"] input, .form-step[data-step="${n}"] textarea`);
    // A timer, not requestAnimationFrame: rAF only fires on the next paint,
    // which browsers can defer indefinitely while the tab/pane isn't the
    // active one — this needs to win the race against modalEl.focus() below
    // reliably, not "whenever the browser next feels like painting."
    if (firstField) setTimeout(() => firstField.focus({ preventScroll: true }), 50);
  }
}

document.querySelectorAll("[data-step-back]").forEach((btn) =>
  btn.addEventListener("click", () => showStep(Math.max(1, bookingState.step - 1)))
);

/* --------------------------- STEP 1 --------------------------- */
function renderInterestPills() {
  const programPills = document.getElementById("programPills");
  programPills.innerHTML = INTEREST_OPTIONS.map(
    (o) => `<button type="button" class="pill pill--block ${bookingState.data.preferredProgram === o.id ? "is-selected" : ""}" data-program="${o.id}">
        <span class="pill__title">${o.label}</span>
      </button>`
  ).join("");
  programPills.querySelectorAll(".pill").forEach((btn) =>
    btn.addEventListener("click", () => {
      bookingState.data.preferredProgram = btn.dataset.program;
      programPills.querySelectorAll(".pill").forEach((p) => p.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      setError("err_program", "");
      updatePriceReveal(btn.dataset.program);
      track(TRACK_EVENTS.INTEREST_SELECTED, { interest: btn.dataset.program });
    })
  );
  updatePriceReveal(bookingState.data.preferredProgram);
}

// Pricing is intentionally absent from the public page — it only appears
// here, inside the form, and only for the inch-loss treatments (GLP-1
// pricing is shared during consultation, never shown publicly).
function updatePriceReveal(interestId) {
  const reveal = document.getElementById("priceReveal");
  const option = INTEREST_OPTIONS.find((o) => o.id === interestId);
  if (!option || !option.priceLabel) {
    reveal.hidden = true;
    return;
  }
  document.getElementById("priceRevealValue").textContent = option.priceLabel;
  reveal.hidden = false;
}

document.querySelector('[data-step-next="1"]').addEventListener("click", () => {
  const fullName = document.getElementById("f_fullName").value;
  const mobile = document.getElementById("f_mobile").value;
  const email = document.getElementById("f_email").value;
  const city = document.getElementById("f_city").value;

  let valid = true;
  if (!isNonEmpty(fullName)) { setError("err_fullName", "Please enter your full name."); valid = false; } else setError("err_fullName", "");
  if (!isValidMobile(mobile)) { setError("err_mobile", "Enter a valid 10-digit phone number."); valid = false; } else setError("err_mobile", "");
  if (!isValidEmail(email)) { setError("err_email", "Enter a valid email address."); valid = false; } else setError("err_email", "");
  if (!isNonEmpty(city)) { setError("err_city", "Please enter your city."); valid = false; } else setError("err_city", "");
  if (!valid) { focusFirstInvalid(); return; }

  Object.assign(bookingState.data, { fullName, mobile, email, city });
  track(TRACK_EVENTS.FORM_STEP_COMPLETED, { step: 1 });
  capturePartialLead();

  // A CTA that already told us the service (e.g. "Explore Abdomen") shouldn't
  // make the visitor re-confirm it — skip straight to scheduling.
  if (bookingState.data.preferredProgram) {
    showStep(3);
  } else {
    showStep(2);
  }
});

document.querySelector('[data-step-next="2"]').addEventListener("click", () => {
  if (!isNonEmpty(bookingState.data.preferredProgram)) {
    setError("err_program", "Please select what you're interested in.");
    return;
  }
  setError("err_program", "");
  track(TRACK_EVENTS.FORM_STEP_COMPLETED, { step: 2 });
  showStep(3);
});

/**
 * Fires the moment Step 1 is valid, independent of whether the visitor ever
 * finishes the rest of the form — so a name + mobile number is never lost to
 * drop-off. Fire-and-forget: never blocks the step transition, never shown to
 * the visitor even if it fails (the full submit at the end is what matters
 * for their experience; this is a safety net for the team).
 */
/**
 * Builds the row payload for the Google Sheets Apps Script (field names must
 * match what GOOGLE_APPS_SCRIPT.md's doPost() expects) and posts it straight
 * from the browser — this is what actually has to succeed for a lead to be
 * captured, independent of whether the current host can run PHP.
 */
function buildSheetPayload(stage) {
  const d = bookingState.data;
  const option = INTEREST_OPTIONS.find((o) => o.id === d.preferredProgram);
  const programName = option ? option.label : d.preferredProgram || "";

  return {
    stage,
    fullName: d.fullName || "",
    mobile: d.mobile || "",
    email: d.email || "",
    city: d.city || "",
    programName,
    appointmentDate: d.appointmentDate || "",
    appointmentTime: d.appointmentTime || "",
    houseNumber: d.houseNumber || "",
    area: d.area || "",
    address: d.address || "",
    pincode: d.pincode || "",
    phone: d.phone || "",
    latitude: d.latitude || "",
    longitude: d.longitude || "",
  };
}

function postToGoogleSheet(stage) {
  if (!SITE_CONFIG.googleSheetWebhookUrl) return Promise.resolve({ ok: true });
  // Google Apps Script Web Apps routinely take several seconds to respond
  // (measured ~4.7s in testing, and it can run longer on a cold start) — with
  // no timeout, a slow or hung response left the "Confirm My Consultation"
  // button stuck on "Submitting…" indefinitely, reading as broken. Aborting
  // after 15s guarantees the UI always resolves one way or the other.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  // No explicit Content-Type header: fetch defaults a string body to
  // text/plain, which keeps this a CORS "simple request" — Apps Script Web
  // Apps don't implement the OPTIONS preflight that application/json would
  // trigger. Apps Script parses e.postData.contents as JSON regardless.
  return fetch(SITE_CONFIG.googleSheetWebhookUrl, {
    method: "POST",
    body: JSON.stringify(buildSheetPayload(stage)),
    signal: controller.signal,
  })
    .then((res) => res.json().catch(() => ({ ok: true })))
    .finally(() => clearTimeout(timeoutId));
}

let partialLeadSent = false;
function capturePartialLead() {
  if (partialLeadSent) return; // one partial lead per session is enough
  partialLeadSent = true;

  // Best-effort — only succeeds on a host that runs PHP (e.g. Hostinger).
  fetch(SITE_CONFIG.leadEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...bookingState.data, leadStage: "partial" }),
  }).catch(() => {});

  // This is the one that actually has to work.
  postToGoogleSheet("partial").catch(() => {
    partialLeadSent = false; // allow a retry (e.g. on step 2) if the network call itself failed
  });
}

/* --------------------------- STEP 2: SCHEDULE --------------------------- */
function toISO(d) {
  // Build the ISO date from LOCAL date parts. d.toISOString() converts
  // through UTC first, which silently shifts the date backward by a day for
  // any visitor in a timezone ahead of UTC (e.g. India, UTC+5:30) —
  // confirmed during testing: "today" rendered correctly as e.g. Sept 3 but
  // was being stored/submitted as Sept 2.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Bounds the whole calendar to "today" through "29 days from today" — the
// same 30-day booking horizon the old date-strip used, just presented as a
// real calendar instead of a scroll list. Recomputed each time the step
// renders rather than cached, since "today" can roll over between visits.
function bookingWindow() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(max.getDate() + 29);
  return { today, max };
}

// Tracks which month the calendar is currently showing — separate from
// which date is selected, since a visitor can browse to a different month
// without having picked a day in it yet. Reset whenever the step is entered
// fresh with no date already chosen.
let calendarViewDate = null;

function renderScheduleStep() {
  const { today, max } = bookingWindow();
  if (!calendarViewDate) {
    calendarViewDate = bookingState.data.appointmentDate ? new Date(bookingState.data.appointmentDate + "T00:00:00") : new Date(today);
  }
  calendarViewDate.setDate(1);

  document.getElementById("calMonthLabel").textContent = calendarViewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const prevBtn = document.getElementById("calPrevBtn");
  const nextBtn = document.getElementById("calNextBtn");
  const isFirstMonth = calendarViewDate.getFullYear() === today.getFullYear() && calendarViewDate.getMonth() === today.getMonth();
  const isLastMonth = calendarViewDate.getFullYear() === max.getFullYear() && calendarViewDate.getMonth() === max.getMonth();
  prevBtn.disabled = isFirstMonth;
  nextBtn.disabled = isLastMonth;

  const grid = document.getElementById("calGrid");
  const firstWeekday = calendarViewDate.getDay();
  const daysInMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate();

  let cells = "";
  for (let i = 0; i < firstWeekday; i++) cells += `<span class="calendar__cell calendar__cell--empty"></span>`;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
    const iso = toISO(d);
    const inWindow = d >= today && d <= max;
    const selected = bookingState.data.appointmentDate === iso;
    cells += `<button type="button" class="calendar__cell ${selected ? "is-selected" : ""}" data-date="${iso}" ${inWindow ? "" : "disabled"}>${day}</button>`;
  }
  grid.innerHTML = cells;

  grid.querySelectorAll(".calendar__cell[data-date]").forEach((btn) =>
    btn.addEventListener("click", () => {
      bookingState.data.appointmentDate = btn.dataset.date;
      setError("err_schedule", "");
      track(TRACK_EVENTS.DATE_SELECTED, { date: btn.dataset.date });
      renderScheduleStep();
    })
  );

  renderTimePreference();
}

function renderTimePreference() {
  const grid = document.getElementById("timePrefGrid");
  grid.innerHTML = TIME_PREFERENCES.map(
    (label) =>
      `<button type="button" class="time-pref__option ${bookingState.data.appointmentTime === label ? "is-selected" : ""}" data-time="${label}">${label}</button>`
  ).join("");

  grid.querySelectorAll(".time-pref__option").forEach((btn) =>
    btn.addEventListener("click", () => {
      bookingState.data.appointmentTime = btn.dataset.time;
      grid.querySelectorAll(".time-pref__option").forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      setError("err_schedule", "");
      track(TRACK_EVENTS.TIME_SELECTED, { time: btn.dataset.time });
    })
  );
}

document.getElementById("calPrevBtn").addEventListener("click", () => {
  calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
  renderScheduleStep();
});
document.getElementById("calNextBtn").addEventListener("click", () => {
  calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
  renderScheduleStep();
});

document.querySelector('[data-step-next="3"]').addEventListener("click", () => {
  if (!bookingState.data.appointmentDate || !bookingState.data.appointmentTime) {
    setError("err_schedule", "Please choose a date and preferred time.");
    return;
  }
  setError("err_schedule", "");
  track(TRACK_EVENTS.FORM_STEP_COMPLETED, { step: 3 });
  showStep(4);
});

/* --------------------------- STEP 3: LOCATION --------------------------- */
// Simplified to pincode + phone only — no full address, no geolocation/map.
// A Meta lead-gen form should stay low-friction; pincode is enough for the
// team to confirm Delhi NCR serviceability before the actual call, and full
// address collection can happen then instead of at the ad-click stage.
document.getElementById("submitBtn").addEventListener("click", async () => {
  const pincode = document.getElementById("f_pincode").value;
  const phone = document.getElementById("f_phone").value;
  const consent = document.getElementById("f_consent").checked;

  let valid = true;
  if (!isValidPincode(pincode)) { setError("err_pincode", "Enter a valid 6-digit pincode."); valid = false; } else setError("err_pincode", "");
  if (!isValidMobile(phone)) { setError("err_phone", "Enter a valid 10-digit phone number."); valid = false; } else setError("err_phone", "");
  if (!consent) { setError("err_submit", "Please accept the consent checkbox to continue."); valid = false; }
  if (!valid) { focusFirstInvalid(); return; }

  Object.assign(bookingState.data, { pincode, phone, consent });
  track(TRACK_EVENTS.FORM_SUBMIT, { program: bookingState.data.preferredProgram });

  const submitBtn = document.getElementById("submitBtn");
  const submitBtnLabel = submitBtn.querySelector(".btn-label");
  submitBtn.disabled = true;
  submitBtn.classList.add("is-loading");
  submitBtnLabel.textContent = "Submitting…";
  setError("err_submit", "");

  // The Google Sheets call below can take several seconds — without this,
  // a visitor watching an unchanged "Submitting…" label for that long has no
  // way to tell a slow response apart from a frozen one.
  const slowHintTimer = setTimeout(() => {
    if (submitBtn.disabled) submitBtnLabel.textContent = "Almost there…";
  }, 4000);

  try {
    // Best-effort — only succeeds on a host that runs PHP (e.g. Hostinger).
    fetch(SITE_CONFIG.leadEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingState.data),
    }).catch(() => {});

    // This is the one that actually has to work.
    const json = await postToGoogleSheet("complete");
    if (!json.ok) throw new Error(json.error || "Something went wrong. Please try again.");

    bookingCompleted = true;
    redirectToConfirmation();
  } catch (err) {
    // We already have their name + phone from step 1 (capturePartialLead) —
    // a slow/failed final submit doesn't mean the team has no way to reach
    // them, so say so instead of leaving this read as a dead end.
    const timedOut = err.name === "AbortError";
    setError(
      "err_submit",
      timedOut
        ? "This is taking longer than expected. We already have your details, so our team can still reach out — please try again, or message us on WhatsApp."
        : err.message || "Something went wrong. Please try again."
    );
  } finally {
    clearTimeout(slowHintTimer);
    submitBtn.disabled = false;
    submitBtn.classList.remove("is-loading");
    submitBtnLabel.textContent = "Confirm My Consultation";
  }
});

/* --------------------------- POST-SUCCESS REDIRECT ---------------------------
   A successful submit navigates the browser to the dedicated confirmation
   page (see enquiry-confirmed.html + assets/js/confirmation.js) instead of
   showing an in-modal success screen. This makes that URL a real, trackable
   conversion destination for Meta/GA4 — the standard Lead/generate_lead
   events fire there, not here, so this page's job ends at "submission
   succeeded, hand off."
------------------------------------------------------------------------ */
function redirectToConfirmation() {
  // One-time id: stored in sessionStorage now, carried in the redirect URL,
  // and re-checked on the confirmation page before it fires any tracking —
  // see confirmation.js for why this is what prevents a refresh, a shared
  // link, or someone typing the URL directly from counting as a conversion.
  const cid =
    window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    sessionStorage.setItem("glossary_pending_cid", cid);
  } catch (e) {}

  // Reuses window.location.search rather than re-deriving attribution: the
  // modal's own URL bookkeeping (pushModalUrl/updateModalStepUrl) has kept
  // any UTM/click-id params intact in the address bar throughout, since it
  // only ever adds/overwrites its own form/step/program keys and never
  // touches anything else already present.
  const params = new URLSearchParams(window.location.search);
  ["form", "step", "program"].forEach((k) => params.delete(k));
  params.set("service", bookingState.data.preferredProgram || "");
  if (bookingState.data.appointmentDate) params.set("date", bookingState.data.appointmentDate);
  if (bookingState.data.appointmentTime) params.set("time", bookingState.data.appointmentTime);
  params.set("cid", cid);

  // Deliberately NOT name/phone/email/address/pincode — none of that belongs
  // in a URL, and the confirmation page has no legitimate need to display it.
  window.location.href = `enquiry-confirmed?${params.toString()}`;
}

/* -----------------------------------------------------------------------
   AUTO-POPUP — fires once the visitor has actually had a chance to confirm
   relevance (reached the "Two Clear Paths" section), or after a shorter
   fallback delay (UX_CONFIG.autoOpenDelayMs) for visitors who read without
   scrolling much. If the visitor closes it without completing the form, it
   keeps reopening every UX_CONFIG.autoReopenDelayMs — capped at
   UX_CONFIG.maxAutoReopens so it can't nag a genuinely uninterested visitor
   forever. Never fires at all if they already opened the form themselves.
------------------------------------------------------------------------ */
let hasManuallyOpened = false;
let firstAutoPopupHappened = false;
let bookingCompleted = false;
let autoPopupFired = false;
let autoReopenCount = 0;

function maybeShowFirstPopup(source) {
  if (autoPopupFired || hasManuallyOpened || overlay.classList.contains("is-open")) return;
  autoPopupFired = true;
  firstAutoPopupHappened = true;
  openBooking(undefined, source);
}

const autoPopupTrigger = document.getElementById("programs"); // "Two Clear Paths" section
if (autoPopupTrigger) {
  const autoPopupObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          maybeShowFirstPopup("auto_popup_scroll_depth");
          autoPopupObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  autoPopupObserver.observe(autoPopupTrigger);
}

// Fallback for visitors who read attentively without scrolling far.
setTimeout(() => {
  maybeShowFirstPopup("auto_popup_timeout");
}, UX_CONFIG.autoOpenDelayMs);

function scheduleAutoReopen() {
  if (!firstAutoPopupHappened || hasManuallyOpened || bookingCompleted) return;
  if (autoReopenCount >= UX_CONFIG.maxAutoReopens) return;
  autoReopenCount += 1;
  const attempt = autoReopenCount;
  setTimeout(() => {
    if (!overlay.classList.contains("is-open") && !hasManuallyOpened && !bookingCompleted) {
      openBooking(undefined, `auto_popup_reopen_${attempt}`);
    }
  }, UX_CONFIG.autoReopenDelayMs);
}
