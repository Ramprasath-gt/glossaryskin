// =============================================================================
// GLOSSARY SKIN — WEIGHT MANAGEMENT LANDING PAGE
// Vanilla JS only — no build step, no framework. Reads data from config.js.
// =============================================================================

document.getElementById("year").textContent = new Date().getFullYear();

/* -----------------------------------------------------------------------
   TRACKING
   Meta Pixel / GA4 / GTM are injected only if an ID is present in config.js.
------------------------------------------------------------------------ */
const TRACK_EVENTS = {
  PAGE_VIEW: "PageView",
  VIEW_CONTENT: "ViewContent",
  CTA_CLICK: "CTA_Click",
  PROGRAM_CLICK: "Program_Click",
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
   REVEAL ON SCROLL — staggered: siblings inside the same parent cascade in
   with an incremental delay instead of popping in together.
------------------------------------------------------------------------ */
function applyStagger(container) {
  const items = container.querySelectorAll(":scope > .reveal");
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
  });
}
document.querySelectorAll(".problem__grid, .approach__grid, .why__grid").forEach(applyStagger);

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
   RENDER: PROGRAMS
------------------------------------------------------------------------ */
const programsGrid = document.getElementById("programsGrid");
programsGrid.innerHTML = PROGRAMS.map(
  (p) => `
  <div class="program-card reveal">
    <div class="program-card__visual">
      <img src="${MEDIA.programImages[p.id] || ""}" alt="${p.name}" loading="lazy" decoding="async" onload="this.classList.add('is-loaded')" onerror="this.remove()" />
      <span>${p.name}</span>
    </div>
    <div class="program-card__body">
      <h3>${p.name}</h3>
      <p class="program-card__positioning">${p.positioning}</p>
      <ul class="program-card__list">
        ${p.inclusions
          .slice(0, 4)
          .map((i) => `<li><span class="dot"></span>${i}</li>`)
          .join("")}
        ${p.inclusions.length > 4 ? `<li class="more">+${p.inclusions.length - 4} more included</li>` : ""}
      </ul>
      <p class="program-card__note">Pricing shared during your consultation — tailored to your plan.</p>
      <button class="btn btn--primary btn--md full-width" data-open-booking data-program="${p.id}" data-source="program_card">Check My Eligibility</button>
    </div>
  </div>`
).join("");
applyStagger(programsGrid);
programsGrid.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* -----------------------------------------------------------------------
   RENDER: TRUST BADGES ("Why Clients Choose Glossary" photo grid)
------------------------------------------------------------------------ */
const trustBadgesGrid = document.getElementById("trustBadgesGrid");
trustBadgesGrid.innerHTML = TRUST_BADGES.map(
  (b) => `
  <div class="trust-badge-card reveal">
    <div class="trust-badge-card__visual">
      <img src="${b.image}" alt="${b.label}" loading="lazy" decoding="async" onload="this.classList.add('is-loaded')" onerror="this.remove()" />
    </div>
    <p>${b.label}</p>
  </div>`
).join("");
applyStagger(trustBadgesGrid);
trustBadgesGrid.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* -----------------------------------------------------------------------
   RENDER: TESTIMONIALS
------------------------------------------------------------------------ */
const testimonialsRow = document.getElementById("testimonialsRow");
testimonialsRow.innerHTML = TESTIMONIALS.map(
  (t) => `
  <div class="testimonial-card reveal">
    <span class="stars">★★★★★</span>
    <p class="testimonial-quote">&ldquo;${t.quote}&rdquo;</p>
    <div class="testimonial-meta">
      <p class="name">${t.name}</p>
      <p class="service">${t.service}</p>
    </div>
  </div>`
).join("");
applyStagger(testimonialsRow);
testimonialsRow.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Gentle auto-advance on wide screens where the row can actually scroll —
// pauses on hover/touch so nobody fights the carousel to read a review, and
// the interval is fully torn down (not just skipped) while the section is
// off-screen so it isn't quietly ticking for the entire time someone is
// reading the hero or FAQ instead.
(function autoAdvanceTestimonials() {
  let paused = false;
  let dir = 1;
  let intervalId = null;

  testimonialsRow.addEventListener("mouseenter", () => (paused = true));
  testimonialsRow.addEventListener("mouseleave", () => (paused = false));
  testimonialsRow.addEventListener("touchstart", () => (paused = true), { passive: true });

  function tick() {
    if (paused) return;
    const maxScroll = testimonialsRow.scrollWidth - testimonialsRow.clientWidth;
    if (maxScroll <= 4) return;
    if (testimonialsRow.scrollLeft >= maxScroll - 4) dir = -1;
    if (testimonialsRow.scrollLeft <= 4) dir = 1;
    testimonialsRow.scrollBy({ left: dir * 2, behavior: "auto" });
  }

  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !intervalId) {
          intervalId = setInterval(tick, 30);
        } else if (!entry.isIntersecting && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      });
    },
    { threshold: 0.2 }
  ).observe(testimonialsRow);
})();

/* -----------------------------------------------------------------------
   REELS — story-style auto-advancing carousel (Instagram/TikTok pattern).
   Each reel plays for UX_CONFIG.storyDurationMs, then auto-advances. Tap the
   left/right edges to jump manually; tap the expand button for a full,
   unmuted view. A missing video/poster file falls back to a labelled
   placeholder instead of a broken/fabricated asset.
------------------------------------------------------------------------ */
const storyProgress = document.getElementById("storyProgress");
const storyVideo = document.getElementById("storyVideo");
const storyPlaceholder = document.getElementById("storyPlaceholder");
const storyTitle = document.getElementById("storyTitle");
const storyCaption = document.getElementById("storyCaption");
const storyStage = document.getElementById("storyStage");

storyProgress.innerHTML = REELS.map(() => `<div class="story__seg"><i></i></div>`).join("");
const storySegments = Array.from(storyProgress.querySelectorAll("i"));

let storyIndex = 0;
let storyStart = 0;
let storyElapsedAtPause = 0;
let storyPaused = true; // starts paused; the IntersectionObserver below starts it once it's actually on screen
let storyInView = false;
let storyRaf = null;

function loadReelMedia(reel) {
  storyVideo.pause();
  storyVideo.removeAttribute("src");
  storyVideo.style.display = "none";
  storyPlaceholder.style.display = "none";
  storyPlaceholder.textContent = "[ Add real reel video ]";

  if (reel.videoUrl) {
    storyVideo.src = reel.videoUrl;
    storyVideo.poster = reel.posterUrl || "";
    storyVideo.style.display = "block";
    storyVideo.currentTime = 0;
    storyVideo.onerror = () => {
      storyVideo.style.display = "none";
      storyPlaceholder.style.display = "flex";
    };
    // Actual playback only starts once the carousel is on screen — see
    // resumeStory(), triggered by the IntersectionObserver below. Loading a
    // video's metadata here (to know if it 404s) is fine; autoplaying it
    // before the visitor has scrolled to it is not.
    if (storyInView && !storyPaused) {
      storyVideo.play().catch(() => {
        storyVideo.style.display = "none";
        storyPlaceholder.style.display = "flex";
      });
    }
  } else {
    storyPlaceholder.style.display = "flex";
  }
}

function renderStory(index, resetTimer = true) {
  storyIndex = (index + REELS.length) % REELS.length;
  const reel = REELS[storyIndex];
  storyTitle.textContent = reel.title;
  storyCaption.textContent = reel.caption;
  loadReelMedia(reel);

  storySegments.forEach((seg, i) => {
    seg.style.transition = "none";
    seg.style.width = i < storyIndex ? "100%" : "0%";
  });
  // Force reflow so the next transition isn't merged with the reset above.
  void storyProgress.offsetWidth;
  storySegments.forEach((seg) => (seg.style.transition = ""));

  if (resetTimer) {
    storyStart = performance.now();
    storyElapsedAtPause = 0;
  }
}

// The rAF loop only runs while storyPaused is false, and is fully cancelled
// (not just skipped) whenever paused — an unconditional infinite rAF loop
// running from page load regardless of scroll position wastes battery/CPU
// for no benefit while the carousel is off-screen.
function stepStory() {
  const elapsed = storyElapsedAtPause + (performance.now() - storyStart);
  const pct = Math.min(1, elapsed / UX_CONFIG.storyDurationMs);
  storySegments[storyIndex].style.width = pct * 100 + "%";
  if (pct >= 1) {
    renderStory(storyIndex + 1);
  }
  storyRaf = requestAnimationFrame(stepStory);
}

function pauseStory() {
  if (storyPaused) return;
  storyPaused = true;
  storyElapsedAtPause += performance.now() - storyStart;
  if (!storyVideo.paused) storyVideo.pause();
  if (storyRaf) {
    cancelAnimationFrame(storyRaf);
    storyRaf = null;
  }
}

function resumeStory() {
  if (!storyPaused || !storyInView) return;
  storyPaused = false;
  storyStart = performance.now();
  if (storyVideo.style.display === "block") storyVideo.play().catch(() => {});
  if (!storyRaf) storyRaf = requestAnimationFrame(stepStory);
}

const storyVisibilityObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      storyInView = entry.isIntersecting;
      if (storyInView) resumeStory();
      else pauseStory();
    });
  },
  { threshold: 0.3 }
);
storyVisibilityObserver.observe(storyStage);

document.getElementById("storyPrev").addEventListener("click", () => renderStory(storyIndex - 1));
document.getElementById("storyNext").addEventListener("click", () => renderStory(storyIndex + 1));
storyStage.addEventListener("mousedown", pauseStory);
storyStage.addEventListener("touchstart", pauseStory, { passive: true });
["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((evt) =>
  storyStage.addEventListener(evt, resumeStory)
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseStory();
  else resumeStory();
});

const reelLightbox = document.createElement("div");
reelLightbox.className = "reel-lightbox";
reelLightbox.innerHTML = `<div class="reel-lightbox__inner"><video controls playsinline></video><button class="reel-lightbox__close">Close ✕</button></div>`;
document.body.appendChild(reelLightbox);
const reelLightboxVideo = reelLightbox.querySelector("video");

document.getElementById("storyExpand").addEventListener("click", () => {
  const reel = REELS[storyIndex];
  if (!reel.videoUrl) return;
  pauseStory();
  reelLightboxVideo.src = reel.videoUrl;
  reelLightboxVideo.muted = false;
  reelLightbox.classList.add("is-open");
  reelLightboxVideo.play().catch(() => {});
});
reelLightbox.addEventListener("click", (e) => {
  if (e.target === reelLightbox || e.target.closest(".reel-lightbox__close")) {
    reelLightbox.classList.remove("is-open");
    reelLightboxVideo.pause();
    reelLightboxVideo.removeAttribute("src");
    resumeStory();
  }
});

renderStory(0, false); // set up the first story's media/caption; the visibility observer starts the timer once it's on screen

/* -----------------------------------------------------------------------
   VALIDATION HELPERS
------------------------------------------------------------------------ */
const isValidMobile = (v) => /^[6-9]\d{9}$/.test((v || "").replace(/\D/g, ""));
const isValidPincode = (v) => /^\d{6}$/.test((v || "").trim());
const isNonEmpty = (v) => (v || "").trim().length > 0;
const isValidAge = (v) => Number.isInteger(Number(v)) && Number(v) >= 18 && Number(v) <= 90;
const isValidWeight = (v) => Number(v) > 25 && Number(v) < 350;
const isValidHeight = (v) => Number(v) > 100 && Number(v) < 230;

function setError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message || "";
}

/* -----------------------------------------------------------------------
   BOOKING MODAL STATE
------------------------------------------------------------------------ */
const overlay = document.getElementById("modalOverlay");
const modalHeader = document.getElementById("modalHeader");
const stepLabel = document.getElementById("stepLabel");
const progressBars = [1, 2, 3, 4].map((n) => document.getElementById("progressBar" + n));
const stickyCta = document.getElementById("stickyCta");

const STEP_LABELS = ["Your Goal", "Program Fit", "Schedule", "Location"];
const TOTAL_STEPS = 4;

const bookingState = {
  step: 1,
  hasStarted: false,
  data: { consent: true },
};

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

const STEP_PATH_NAMES = ["step-1-your-goal", "step-2-program-fit", "step-3-schedule", "step-4-location", "success"];

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
  overlay.classList.add("is-open");
  stickyCta.classList.add("is-hidden");
  document.body.classList.add("modal-open");
  pushModalUrl(programId);
  showStep(bookingState.step);
}

function closeBooking(opts) {
  overlay.classList.remove("is-open");
  stickyCta.classList.remove("is-hidden");
  document.body.classList.remove("modal-open");
  if (!(opts && opts.fromPopState)) popModalUrl();
  scheduleSecondPopup();
}

function resetBooking() {
  bookingState.step = 1;
  bookingState.hasStarted = false;
  bookingState.data = { consent: true };
  document.querySelectorAll(".form-step input, .form-step textarea").forEach((el) => {
    if (el.type === "checkbox") el.checked = true;
    else el.value = "";
  });
  document.querySelectorAll(".pill-grid .pill, .pill-stack .pill").forEach((p) => p.classList.remove("is-selected"));
  locationNote.textContent = "";
  mapContainer.innerHTML = "";
  gmap = null;
  gmarker = null;
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
  if (n === 2) renderStep2();
  if (n === 3) renderStep3();
  // Only touch the URL while the modal is actually open — showStep(1) also
  // runs right after the modal has been closed (resetting it for next time),
  // and that must never re-push a "?form=open" URL onto a closed page.
  if (overlay.classList.contains("is-open")) updateModalStepUrl(n);
}

document.querySelectorAll("[data-step-back]").forEach((btn) =>
  btn.addEventListener("click", () => showStep(Math.max(1, bookingState.step - 1)))
);

/* --------------------------- STEP 1 --------------------------- */
document.querySelector('[data-step-next="1"]').addEventListener("click", () => {
  const fullName = document.getElementById("f_fullName").value;
  const mobile = document.getElementById("f_mobile").value;
  const age = document.getElementById("f_age").value;
  const city = document.getElementById("f_city").value;
  const email = document.getElementById("f_email").value;

  let valid = true;
  if (!isNonEmpty(fullName)) { setError("err_fullName", "Please enter your full name."); valid = false; } else setError("err_fullName", "");
  if (!isValidMobile(mobile)) { setError("err_mobile", "Enter a valid 10-digit mobile number."); valid = false; } else setError("err_mobile", "");
  if (!isValidAge(age)) { setError("err_age", "Age must be between 18 and 90."); valid = false; } else setError("err_age", "");
  if (!isNonEmpty(city)) { setError("err_city", "Please enter your city."); valid = false; } else setError("err_city", "");
  if (!valid) return;

  Object.assign(bookingState.data, { fullName, mobile, age, city, email });
  track(TRACK_EVENTS.FORM_STEP_COMPLETED, { step: 1 });
  capturePartialLead();
  showStep(2);
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
  const program = PROGRAMS.find((p) => p.id === d.preferredProgram);
  const programName =
    d.preferredProgram === "not-sure" ? "Not sure — help me choose" : program ? program.name : d.preferredProgram || "";

  return {
    stage,
    fullName: d.fullName || "",
    mobile: d.mobile || "",
    email: d.email || "",
    age: d.age || "",
    city: d.city || "",
    currentWeight: d.currentWeight || "",
    height: d.height || "",
    weightLossGoal: d.weightLossGoal || "",
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
  // No explicit Content-Type header: fetch defaults a string body to
  // text/plain, which keeps this a CORS "simple request" — Apps Script Web
  // Apps don't implement the OPTIONS preflight that application/json would
  // trigger. Apps Script parses e.postData.contents as JSON regardless.
  return fetch(SITE_CONFIG.googleSheetWebhookUrl, {
    method: "POST",
    body: JSON.stringify(buildSheetPayload(stage)),
  }).then((res) => res.json().catch(() => ({ ok: true })));
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

/* --------------------------- STEP 2 --------------------------- */
function renderStep2() {
  const goalPills = document.getElementById("goalPills");
  goalPills.innerHTML = WEIGHT_LOSS_GOALS.map(
    (g) => `<button type="button" class="pill ${bookingState.data.weightLossGoal === g ? "is-selected" : ""}" data-goal="${g}">${g}</button>`
  ).join("");
  goalPills.querySelectorAll(".pill").forEach((btn) =>
    btn.addEventListener("click", () => {
      bookingState.data.weightLossGoal = btn.dataset.goal;
      goalPills.querySelectorAll(".pill").forEach((p) => p.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      setError("err_goal", "");
    })
  );

  const programPills = document.getElementById("programPills");
  const options = PROGRAMS.map((p) => ({ id: p.id, label: p.name, sub: p.positioning })).concat({
    id: "not-sure",
    label: "Not sure — help me choose",
    sub: "",
  });
  programPills.innerHTML = options
    .map(
      (o) => `<button type="button" class="pill pill--block ${bookingState.data.preferredProgram === o.id ? "is-selected" : ""}" data-program="${o.id}">
        <span class="pill__title">${o.label}</span>
        ${o.sub ? `<span class="pill__sub">${o.sub}</span>` : ""}
      </button>`
    )
    .join("");
  programPills.querySelectorAll(".pill").forEach((btn) =>
    btn.addEventListener("click", () => {
      bookingState.data.preferredProgram = btn.dataset.program;
      programPills.querySelectorAll(".pill").forEach((p) => p.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      setError("err_program", "");
      updatePriceReveal(btn.dataset.program);
    })
  );

  document.getElementById("f_weight").value = bookingState.data.currentWeight || "";
  document.getElementById("f_height").value = bookingState.data.height || "";
  updatePriceReveal(bookingState.data.preferredProgram);
}

// Pricing is intentionally absent from the public page — it only appears
// here, inside the form, once a program is actually selected on Step 2.
function updatePriceReveal(programId) {
  const reveal = document.getElementById("priceReveal");
  const program = PROGRAMS.find((p) => p.id === programId);
  if (!program) {
    reveal.hidden = true;
    return;
  }
  document.getElementById("priceRevealValue").textContent = program.priceLabel;
  reveal.hidden = false;
}

document.querySelector('[data-step-next="2"]').addEventListener("click", () => {
  const currentWeight = document.getElementById("f_weight").value;
  const height = document.getElementById("f_height").value;

  let valid = true;
  if (!isValidWeight(currentWeight)) { setError("err_weight", "Enter a valid weight in kg."); valid = false; } else setError("err_weight", "");
  if (!isValidHeight(height)) { setError("err_height", "Enter a valid height in cm."); valid = false; } else setError("err_height", "");
  if (!isNonEmpty(bookingState.data.weightLossGoal)) { setError("err_goal", "Please select a goal."); valid = false; }
  if (!isNonEmpty(bookingState.data.preferredProgram)) { setError("err_program", "Please select a program."); valid = false; }
  if (!valid) return;

  Object.assign(bookingState.data, { currentWeight, height });
  track(TRACK_EVENTS.FORM_STEP_COMPLETED, { step: 2 });
  showStep(3);
});

/* --------------------------- STEP 3 --------------------------- */
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

function renderStep3() {
  const dateStrip = document.getElementById("dateStrip");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  dateStrip.innerHTML = days
    .map((d) => {
      const iso = toISO(d);
      const selected = bookingState.data.appointmentDate === iso;
      return `<button type="button" class="date-chip ${selected ? "is-selected" : ""}" data-date="${iso}">
        <span class="month">${d.toLocaleDateString("en-IN", { month: "short" })}</span>
        <span class="day">${d.getDate()}</span>
        <span class="weekday">${d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
      </button>`;
    })
    .join("");

  dateStrip.querySelectorAll(".date-chip").forEach((btn) =>
    btn.addEventListener("click", () => {
      bookingState.data.appointmentDate = btn.dataset.date;
      bookingState.data.appointmentTime = null;
      dateStrip.querySelectorAll(".date-chip").forEach((c) => c.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      setError("err_schedule", "");
      track(TRACK_EVENTS.DATE_SELECTED, { date: btn.dataset.date });
      renderSlots();
    })
  );

  renderSlots();
}

function renderSlots() {
  const slotsField = document.getElementById("slotsField");
  const container = document.getElementById("slotsContainer");
  if (!bookingState.data.appointmentDate) {
    slotsField.hidden = true;
    return;
  }
  slotsField.hidden = false;
  const slots = getAvailableSlots(bookingState.data.appointmentDate);
  if (slots.length === 0) {
    container.innerHTML = `<p class="no-slots">No slots available this day — please choose another date.</p>`;
    return;
  }
  const periods = ["Morning", "Afternoon", "Evening"];
  container.innerHTML = periods
    .map((period) => {
      const periodSlots = slots.filter((s) => s.period === period);
      if (periodSlots.length === 0) return "";
      return `<div class="slot-group">
        <span class="slot-group__label">${period}</span>
        <div class="slot-group__row">
          ${periodSlots
            .map(
              (s) =>
                `<button type="button" class="slot-pill ${bookingState.data.appointmentTime === s.label ? "is-selected" : ""}" data-time="${s.label}">${s.label}</button>`
            )
            .join("")}
        </div>
      </div>`;
    })
    .join("");

  container.querySelectorAll(".slot-pill").forEach((btn) =>
    btn.addEventListener("click", () => {
      bookingState.data.appointmentTime = btn.dataset.time;
      container.querySelectorAll(".slot-pill").forEach((p) => p.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      setError("err_schedule", "");
      track(TRACK_EVENTS.TIME_SELECTED, { time: btn.dataset.time });
    })
  );
}

document.querySelector('[data-step-next="3"]').addEventListener("click", () => {
  if (!bookingState.data.appointmentDate || !bookingState.data.appointmentTime) {
    setError("err_schedule", "Please choose a date and time slot.");
    return;
  }
  setError("err_schedule", "");
  track(TRACK_EVENTS.FORM_STEP_COMPLETED, { step: 3 });
  showStep(4);
});

/* --------------------------- STEP 4: LOCATION --------------------------- */
const useLocationBtn = document.getElementById("useLocationBtn");
const locationNote = document.getElementById("locationNote");
const mapContainer = document.getElementById("mapContainer");

useLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationNote.textContent = "Location isn't supported on this device — please enter your address manually.";
    return;
  }
  useLocationBtn.disabled = true;
  useLocationBtn.textContent = "Locating…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      bookingState.data.latitude = pos.coords.latitude;
      bookingState.data.longitude = pos.coords.longitude;
      locationNote.textContent = "Location captured. Drag the pin below if it isn't exact, or confirm your address.";
      track(TRACK_EVENTS.LOCATION_ADDED, { method: "geolocation" });
      useLocationBtn.disabled = false;
      useLocationBtn.textContent = "📍 Use My Current Location";
      renderMap();
    },
    () => {
      locationNote.textContent = "Location permission denied — please enter your address manually below.";
      useLocationBtn.disabled = false;
      useLocationBtn.textContent = "📍 Use My Current Location";
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

let mapsLoaderPromise = null;
function loadGoogleMaps() {
  if (!SITE_CONFIG.googleMapsApiKey) return Promise.reject(new Error("No Maps API key configured"));
  if (window.google && window.google.maps) return Promise.resolve();
  if (mapsLoaderPromise) return mapsLoaderPromise;
  mapsLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${SITE_CONFIG.googleMapsApiKey}&libraries=places&loading=async`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return mapsLoaderPromise;
}

let gmap = null;
let gmarker = null;
function renderMap() {
  if (!SITE_CONFIG.googleMapsApiKey) return; // graceful fallback: no map, geolocation + manual entry still work
  const { latitude, longitude } = bookingState.data;
  if (latitude == null || longitude == null) return;

  loadGoogleMaps()
    .then(() => {
      mapContainer.innerHTML = `<div class="gmap"></div><p class="gmap-hint">Drag the pin to your exact location</p>`;
      const mapEl = mapContainer.querySelector(".gmap");
      const google = window.google;
      gmap = new google.maps.Map(mapEl, { center: { lat: latitude, lng: longitude }, zoom: 15, disableDefaultUI: true, zoomControl: true });
      gmarker = new google.maps.Marker({ position: { lat: latitude, lng: longitude }, map: gmap, draggable: true });
      gmarker.addListener("dragend", () => {
        const pos = gmarker.getPosition();
        bookingState.data.latitude = pos.lat();
        bookingState.data.longitude = pos.lng();
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat: pos.lat(), lng: pos.lng() } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            document.getElementById("f_address").value = results[0].formatted_address;
            bookingState.data.address = results[0].formatted_address;
          }
        });
      });
    })
    .catch(() => {
      mapContainer.innerHTML = "";
    });
}

document.getElementById("submitBtn").addEventListener("click", async () => {
  const address = document.getElementById("f_address").value;
  const houseNumber = document.getElementById("f_house").value;
  const area = document.getElementById("f_area").value;
  const pincode = document.getElementById("f_pincode").value;
  const phone = document.getElementById("f_phone").value;
  const consent = document.getElementById("f_consent").checked;

  let valid = true;
  if (!isNonEmpty(address)) { setError("err_address", "Please enter your address."); valid = false; } else setError("err_address", "");
  if (!isNonEmpty(houseNumber)) { setError("err_house", "Please enter your house/flat/unit number."); valid = false; } else setError("err_house", "");
  if (!isNonEmpty(area)) { setError("err_area", "Please enter your area/locality."); valid = false; } else setError("err_area", "");
  if (!isValidPincode(pincode)) { setError("err_pincode", "Enter a valid 6-digit pincode."); valid = false; } else setError("err_pincode", "");
  if (!isValidMobile(phone)) { setError("err_phone", "Enter a valid 10-digit phone number."); valid = false; } else setError("err_phone", "");
  if (!consent) { setError("err_submit", "Please accept the consent checkbox to continue."); valid = false; }
  if (!valid) return;

  Object.assign(bookingState.data, { address, houseNumber, area, pincode, phone, consent });
  track(TRACK_EVENTS.LOCATION_ADDED, { method: "manual" });
  track(TRACK_EVENTS.FORM_SUBMIT, { program: bookingState.data.preferredProgram });

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";
  setError("err_submit", "");

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

    track(TRACK_EVENTS.LEAD, { program: bookingState.data.preferredProgram });
    track(TRACK_EVENTS.BOOKING_COMPLETED, { program: bookingState.data.preferredProgram });
    bookingCompleted = true;
    renderSuccess();
    showStep(5);
  } catch (err) {
    setError("err_submit", err.message || "Something went wrong. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
});

/* --------------------------- STEP 5: SUCCESS --------------------------- */
function renderSuccess() {
  const d = bookingState.data;
  const program = PROGRAMS.find((p) => p.id === d.preferredProgram);
  const programName = program ? program.name : "Not sure — team will help you choose";
  const formattedDate = d.appointmentDate
    ? new Date(d.appointmentDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    : "";

  document.getElementById("summaryCard").innerHTML = `
    <div class="summary-row"><span>Program</span><strong>${programName}</strong></div>
    <div class="summary-row"><span>Date</span><strong>${formattedDate}</strong></div>
    <div class="summary-row"><span>Time</span><strong>${d.appointmentTime || ""}</strong></div>
    <div class="summary-row"><span>Address</span><strong>${[d.houseNumber, d.area, d.city].filter(Boolean).join(", ")}</strong></div>
  `;
  document.getElementById("phoneNote").textContent = `Please keep your phone available — our team will call you on ${d.phone || d.mobile} to confirm.`;
}

document.getElementById("doneBtn").addEventListener("click", () => {
  closeBooking();
  setTimeout(() => {
    resetBooking();
    showStep(1);
  }, 300);
});

/* -----------------------------------------------------------------------
   AUTO-POPUP — first attempt 5s after landing, a single second attempt 15s
   after the visitor closes that one. Never fires if they already opened the
   form themselves, and never nags a third time.
------------------------------------------------------------------------ */
let hasManuallyOpened = false;
let secondPopupShown = false;
let firstAutoPopupHappened = false;
let bookingCompleted = false;

setTimeout(() => {
  if (!hasManuallyOpened && !overlay.classList.contains("is-open")) {
    firstAutoPopupHappened = true;
    openBooking(undefined, "auto_popup_5s");
  }
}, UX_CONFIG.autoOpenDelayMs);

function scheduleSecondPopup() {
  if (!firstAutoPopupHappened || secondPopupShown || hasManuallyOpened) return;
  secondPopupShown = true;
  setTimeout(() => {
    if (!overlay.classList.contains("is-open") && !hasManuallyOpened && !bookingCompleted) {
      openBooking(undefined, "auto_popup_15s");
    }
  }, UX_CONFIG.autoReopenDelayMs);
}
