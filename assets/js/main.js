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
  // Automatic-popup funnel (see AUTO-POPUP). None of these is ever a Lead.
  POPUP_AUTO_SHOWN: "popup_auto_shown",
  POPUP_CLOSED: "popup_closed",
  POPUP_FORM_STARTED: "popup_form_started",
  POPUP_FORM_COMPLETED: "popup_form_completed",
  WHATSAPP_CLICK_GENERIC: "whatsapp_click",
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
// Every on-page WhatsApp link is built from SITE_CONFIG (number + prefilled
// message), so the number lives in one place. The static href in the markup
// is only a no-JS fallback. Tracked as WhatsApp_Click — never as a Lead.
const WHATSAPP_URL = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessage || "")}`;
document.querySelectorAll("[data-whatsapp-click]").forEach((el) => {
  el.href = WHATSAPP_URL;
  el.addEventListener("click", () => {
    // They chose the direct path — the automatic popup stays away for the
    // rest of the session.
    try { sessionStorage.setItem("glossary_whatsapp_clicked", "1"); } catch (e) {}
    track(TRACK_EVENTS.WHATSAPP_CLICK, { source: el.dataset.source || "unknown" });
    track(TRACK_EVENTS.WHATSAPP_CLICK_GENERIC, { source: el.dataset.source || "unknown" });
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
   BMI CALCULATOR — informational only. BMI (weight / height²) is the one
   computed value; it never predicts weight loss and never fires a Lead.
   The marker sits on a 15–40 BMI arc split into the standard WHO bands.
------------------------------------------------------------------------ */
(function initCalculator() {
  const form = document.getElementById("calcForm");
  if (!form) return;
  const heightEl = document.getElementById("calcHeight");
  const weightEl = document.getElementById("calcWeight");
  const errorEl = document.getElementById("calcError");
  const valueEl = document.getElementById("calcBmiValue");
  const tagEl = document.getElementById("calcBmiTag");
  const marker = document.getElementById("calcMarker");
  const ctaBtns = document.querySelectorAll("#calcCtas button");
  const setCtasEnabled = (on) => ctaBtns.forEach((b) => (b.disabled = !on));
  let userEntered = false; // the prefilled example values aren't "your results"
  const BMI_MIN = 15;
  const BMI_MAX = 40;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let shownBmi = null;
  let rafId = 0;
  let settleId = 0;

  // Eases the displayed number from its previous value to the new one, so a
  // recalculation reads as the same result updating rather than a hard swap.
  // The timeout guarantees the final value lands even if animation frames
  // are throttled, so the number can never disagree with the category text.
  function showBmi(bmi) {
    cancelAnimationFrame(rafId);
    clearTimeout(settleId);
    const from = shownBmi;
    shownBmi = bmi;
    if (from === null || reduceMotion.matches) {
      valueEl.textContent = bmi.toFixed(1);
      return;
    }
    settleId = setTimeout(() => {
      cancelAnimationFrame(rafId);
      valueEl.textContent = bmi.toFixed(1);
    }, 500);
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / 450);
      const eased = 1 - Math.pow(1 - p, 3);
      valueEl.textContent = (from + (bmi - from) * eased).toFixed(1);
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }

  function bmiCategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  function render(showErrors) {
    const heightCm = Number(heightEl.value);
    const weight = Number(weightEl.value);
    const heightOk = heightCm >= 120 && heightCm <= 220;
    const weightOk = weight >= 30 && weight <= 250;
    if (!heightOk || !weightOk) {
      setCtasEnabled(false);
      if (showErrors) {
        errorEl.textContent = "Please enter a height between 120–220 cm and a weight between 30–250 kg.";
        heightEl.setAttribute("aria-invalid", String(!heightOk));
        weightEl.setAttribute("aria-invalid", String(!weightOk));
      }
      return;
    }
    errorEl.textContent = "";
    heightEl.removeAttribute("aria-invalid");
    weightEl.removeAttribute("aria-invalid");
    setCtasEnabled(userEntered);
    const bmi = weight / Math.pow(heightCm / 100, 2);
    showBmi(bmi);
    tagEl.textContent = bmiCategory(bmi);

    const t = (Math.min(BMI_MAX, Math.max(BMI_MIN, bmi)) - BMI_MIN) / (BMI_MAX - BMI_MIN);
    const angle = Math.PI * (1 - t);
    marker.setAttribute("cx", (110 + 90 * Math.cos(angle)).toFixed(2));
    marker.setAttribute("cy", (110 - 90 * Math.sin(angle)).toFixed(2));
  }

  // Calculates as the visitor types; validation messages wait until a field
  // is committed (change/blur, or Enter) so they don't flash mid-typing.
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    render(true);
  });
  [heightEl, weightEl].forEach((el) => {
    el.addEventListener("input", () => {
      userEntered = true;
      render(false);
    });
    el.addEventListener("change", () => render(true));
  });
  render(false);
})();

/* -----------------------------------------------------------------------
   ROTATOR — shared autoplay for the Journeys and Client Stories carousels.
   Advances only while idle and on screen; pauses on hover, keyboard focus,
   touch (resumes after 6s idle), the pause button, a hidden tab, or when
   scrolled away. Never autoplays under prefers-reduced-motion. Arrows,
   selectors and ←/→ always work and restart the timer.
------------------------------------------------------------------------ */
function createRotator({ root, zones, count, interval, show, fill, pauseBtn, pauseLabel }) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0;
  let timer = 0;
  let startedAt = 0;
  let remaining = interval;
  let ticking = false;
  let userPaused = false;
  let hovering = false;
  let focused = false;
  let touching = false;
  let inView = false;
  let touchTimer = 0;

  const canRun = () =>
    !reduceMotion.matches && !userPaused && !hovering && !focused && !touching && inView && !document.hidden;

  function setFill(scale, ms) {
    const el = fill();
    el.style.transition = ms ? `transform ${ms}ms linear` : "none";
    el.style.transform = `scaleX(${scale})`;
  }

  function stop() {
    if (!ticking) return;
    clearTimeout(timer);
    ticking = false;
    remaining = Math.max(0, remaining - (performance.now() - startedAt));
    setFill(new DOMMatrix(getComputedStyle(fill()).transform).a, 0);
  }

  function start() {
    if (ticking || !canRun()) return;
    ticking = true;
    startedAt = performance.now();
    void fill().offsetWidth;
    setFill(1, remaining);
    timer = setTimeout(() => {
      ticking = false;
      go(index + 1);
    }, remaining);
  }

  const update = () => (canRun() ? start() : stop());

  function go(i) {
    clearTimeout(timer);
    ticking = false;
    index = (i + count) % count;
    show(index);
    remaining = interval;
    setFill(reduceMotion.matches || userPaused ? 1 : 0, 0);
    update();
  }

  zones.forEach((zone) => {
    zone.addEventListener("mouseenter", () => { hovering = true; update(); });
    zone.addEventListener("mouseleave", () => { hovering = false; update(); });
    // Only keyboard focus pauses — a mouse click also focuses the button,
    // and that shouldn't stop autoplay from resuming once the pointer leaves.
    zone.addEventListener("focusin", (e) => { focused = e.target.matches(":focus-visible"); update(); });
    zone.addEventListener("focusout", (e) => {
      if (!zones.some((z) => z.contains(e.relatedTarget))) { focused = false; update(); }
    });
    zone.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;
      touching = true;
      update();
      clearTimeout(touchTimer);
      touchTimer = setTimeout(() => { touching = false; update(); }, 6000);
    });
    zone.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    });
  });

  root.querySelector("[data-rotator-prev]").addEventListener("click", () => go(index - 1));
  root.querySelector("[data-rotator-next]").addEventListener("click", () => go(index + 1));

  pauseBtn.hidden = reduceMotion.matches;
  pauseBtn.addEventListener("click", () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute("aria-pressed", String(userPaused));
    pauseBtn.setAttribute("aria-label", `${userPaused ? "Play" : "Pause"} ${pauseLabel}`);
    pauseBtn.classList.toggle("is-paused", userPaused);
    update();
  });

  new IntersectionObserver(
    (entries) => entries.forEach((entry) => { inView = entry.isIntersecting; update(); }),
    { threshold: 0.35 }
  ).observe(root);
  document.addEventListener("visibilitychange", update);
  reduceMotion.addEventListener("change", () => { pauseBtn.hidden = reduceMotion.matches; go(index); });

  go(0);
  return { go };
}

const pad2 = (n) => String(n).padStart(2, "0");

/* -----------------------------------------------------------------------
   REAL TREATMENT JOURNEYS — featured before/after story + selector
------------------------------------------------------------------------ */
(function initJourneys() {
  const root = document.getElementById("journey");
  const stage = document.getElementById("journeyStage");
  const tabsEl = document.getElementById("journeyTabs");
  if (!root || typeof RESULTS_JOURNEYS === "undefined" || RESULTS_JOURNEYS.length === 0) return;
  const total = RESULTS_JOURNEYS.length;

  stage.innerHTML = RESULTS_JOURNEYS.map((j, i) => `
    <article class="journey__slide" aria-label="${i + 1} of ${total}: ${j.area}">
      <div class="journey__media">
        <figure class="journey__shot"><img src="${j.before}" alt="${j.area} — before treatment" loading="lazy" decoding="async" /><figcaption>Before</figcaption></figure>
        <figure class="journey__shot"><img src="${j.after}" alt="${j.area} — after treatment" loading="lazy" decoding="async" /><figcaption>After</figcaption></figure>
      </div>
      <div class="journey__info">
        <span class="journey__count">${pad2(i + 1)} / ${pad2(total)}</span>
        <span class="journey__label">${j.label}</span>
        <h3>${j.heading}</h3>
        <p>${j.summary}</p>
        <dl class="journey__details">${j.details.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
        <button type="button" class="link-arrow" data-open-booking${j.program ? ` data-program="${j.program}"` : ""} data-source="journey_${j.id}">Explore This Journey</button>
      </div>
    </article>`).join("");

  tabsEl.innerHTML = RESULTS_JOURNEYS.map((j, i) => `
    <button type="button" class="journey__tab" aria-label="Show ${j.area} journey">
      <span class="journey__thumb" aria-hidden="true"><img src="${j.before}" alt="" loading="lazy" /><img src="${j.after}" alt="" loading="lazy" /></span>
      <span class="journey__tab-label"><span>${pad2(i + 1)}</span>${j.area}</span>
      <span class="journey__bar"><span class="journey__fill"></span></span>
    </button>`).join("");

  const slides = [...stage.children];
  const tabs = [...tabsEl.children];

  const rotator = createRotator({
    root,
    zones: [root, tabsEl.parentElement],
    count: total,
    interval: 5500,
    pauseBtn: tabsEl.parentElement.querySelector("[data-rotator-pause]"),
    pauseLabel: "journeys",
    fill: () => tabs[tabs.findIndex((t) => t.classList.contains("is-active"))].querySelector(".journey__fill"),
    show(i) {
      slides.forEach((s, n) => { s.classList.toggle("is-active", n === i); s.inert = n !== i; });
      tabs.forEach((t, n) => {
        t.classList.toggle("is-active", n === i);
        if (n === i) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
        const f = t.querySelector(".journey__fill");
        if (n !== i) { f.style.transition = "none"; f.style.transform = "scaleX(0)"; }
      });
    },
  });
  tabs.forEach((t, n) => t.addEventListener("click", () => rotator.go(n)));
})();

/* -----------------------------------------------------------------------
   CLIENT STORIES — featured testimonial panel
------------------------------------------------------------------------ */
// Real customer photos aren't available for these named reviews, and using
// unrelated stock photos under a real person's name would misrepresent who
// they are — an initials avatar is the honest option here.
function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

(function initStories() {
  const root = document.getElementById("stories");
  const stage = document.getElementById("storiesStage");
  const peopleEl = document.getElementById("storiesPeople");
  const fillEl = document.getElementById("storiesFill");
  if (!root || TESTIMONIALS.length === 0) return;
  const stories = TESTIMONIALS.slice(0, 4);
  const total = stories.length;

  stage.innerHTML = stories.map((t, i) => `
    <figure class="story" aria-label="${i + 1} of ${total}: ${t.name}">
      <blockquote class="story__quote">&ldquo;${t.quote}&rdquo;</blockquote>
      <figcaption class="story__meta">
        <span class="story__who"><span class="quote__avatar" aria-hidden="true">${getInitials(t.name)}</span><span><strong>${t.name}</strong><span>${t.service}</span></span></span>
      </figcaption>
    </figure>`).join("");

  peopleEl.innerHTML = stories.map((t) => `
    <button type="button" class="stories__person" aria-label="Show ${t.name}'s story">
      <span class="quote__avatar" aria-hidden="true">${getInitials(t.name)}</span>
      <span class="stories__person-text"><strong>${t.name}</strong><span>${t.service}</span></span>
    </button>`).join("");

  const slides = [...stage.children];
  const people = [...peopleEl.children];
  fillEl.style.width = `${100 / total}%`;

  const rotator = createRotator({
    root,
    zones: [root, peopleEl, fillEl.closest(".stories__progress")],
    count: total,
    interval: 5500,
    pauseBtn: fillEl.closest(".stories__progress").querySelector("[data-rotator-pause]"),
    pauseLabel: "client stories",
    fill: () => fillEl,
    show(i) {
      slides.forEach((s, n) => { s.classList.toggle("is-active", n === i); s.inert = n !== i; });
      people.forEach((p, n) => {
        p.classList.toggle("is-active", n === i);
        if (n === i) p.setAttribute("aria-current", "true"); else p.removeAttribute("aria-current");
      });
      fillEl.style.left = `${(100 / total) * i}%`;
    },
  });
  people.forEach((p, n) => p.addEventListener("click", () => rotator.go(n)));
})();

/* -----------------------------------------------------------------------
   TREATMENT CARDS — "What's included"
------------------------------------------------------------------------ */
document.querySelectorAll(".included__toggle").forEach((btn) => {
  const panel = document.getElementById(btn.getAttribute("aria-controls"));
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
  });
});

/* -----------------------------------------------------------------------
   FAQ ACCORDION — keeps native <details>/<summary> (keyboard + screen-reader
   expanded/collapsed state for free) and only animates the answer's height.
------------------------------------------------------------------------ */
(function faqAccordion() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const easing = "cubic-bezier(0.4, 0, 0.2, 1)";

  document.querySelectorAll(".faq__item").forEach((item) => {
    const summary = item.querySelector("summary");
    const answer = item.querySelector(".faq__answer");
    if (!summary || !answer) return;
    let anim = null;

    // finish() fires onfinish; the timeout makes sure the open/closed state
    // always settles even if animation frames are throttled.
    function run(keyframes, duration, done) {
      const a = answer.animate(keyframes, { duration, easing });
      anim = a;
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        if (anim === a) anim = null;
        done();
      };
      a.onfinish = settle;
      setTimeout(() => {
        if (a.playState === "idle") return; // cancelled by a newer click
        a.finish();
        settle();
      }, duration + 60);
    }

    summary.addEventListener("click", (e) => {
      if (reduceMotion.matches) return;
      e.preventDefault();
      const wasClosing = item.classList.contains("is-closing");
      if (anim) {
        anim.onfinish = null;
        anim.cancel();
        anim = null;
      }
      item.classList.remove("is-closing");

      if (item.open && !wasClosing) {
        item.classList.add("is-closing");
        run([{ height: `${answer.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }], 260, () => {
          item.open = false;
          item.classList.remove("is-closing");
        });
      } else {
        item.open = true;
        run([{ height: "0px", opacity: 0 }, { height: `${answer.offsetHeight}px`, opacity: 1 }], 320, () => {});
      }
    });
  });
})();

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
    else if (heroCleared) start();
  });

  closeBtn.addEventListener("click", () => {
    toast.classList.remove("is-visible");
    stop();
    try {
      sessionStorage.setItem("glossary_toast_dismissed", "1");
    } catch (e) {}
  });

  // Never show the toast over the hero — it shares that corner of the
  // viewport with the logo, nav and hero CTA. Wait until the hero has
  // actually scrolled out of view, on top of the existing delay, so the
  // first appearance can't land on top of them.
  let heroCleared = false;
  const hero = document.getElementById("top");
  if (hero) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            heroCleared = true;
            heroObserver.disconnect();
            start();
          }
        });
      },
      { threshold: 0 }
    );
    heroObserver.observe(hero);
  } else {
    heroCleared = true;
  }

  // First appearance is also deliberately delayed — not an instant pop-up
  // the moment the page loads, so it reads as organic activity rather than
  // an intrusive greeting. Whichever condition (hero cleared / timer) is met
  // last is the one that actually starts the cycle.
  setTimeout(() => {
    if (heroCleared) start();
  }, 8000);
})();

/* -----------------------------------------------------------------------
   TREATMENT VIDEOS — poster + play icon per approved clip; the video itself
   only loads when tapped (in reelLightbox), never on page load.
------------------------------------------------------------------------ */
const phoneMockupGrid = document.getElementById("phoneMockupGrid");

phoneMockupGrid.innerHTML = REELS.map(
  (reel, i) => `
    <button type="button" class="reel-card" data-reel-index="${i}" aria-label="Play video: ${reel.title}">
      <img src="${reel.posterUrl}" alt="" loading="lazy" decoding="async" />
      <span class="reel-card__play" aria-hidden="true"></span>
      <span class="reel-card__caption">${reel.title}</span>
    </button>`
).join("");

const reelLightbox = document.createElement("div");
reelLightbox.className = "reel-lightbox";
reelLightbox.innerHTML = `<div class="reel-lightbox__inner"><video controls playsinline></video><button class="reel-lightbox__close">Close ✕</button></div>`;
document.body.appendChild(reelLightbox);
const reelLightboxVideo = reelLightbox.querySelector("video");

phoneMockupGrid.querySelectorAll(".reel-card").forEach((tile) => {
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
const isValidAddress = (v) => (v || "").trim().length >= 10;

// Maps each error span to the field it belongs to, so setError can put a
// visible border on the field itself instead of leaving that to a small
// text line alone.
const FIELD_FOR_ERROR = {
  err_fullName: "f_fullName",
  err_mobile: "f_mobile",
  err_email: "f_email",
  err_city: "f_city",
  err_address: "f_address",
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
      : fieldId === "f_address"
      ? isValidAddress
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

// The hero already has its own inline CTA — showing the sticky bar on top
// of it too just doubles up the ask in the first viewport. Keep the sticky
// bar hidden until the hero (and its own CTA) has scrolled out of view.
(function hideStickyCtaOverHero() {
  const hero = document.getElementById("top");
  if (!hero || !stickyCta) return;
  const whatsappFab = document.getElementById("whatsappFab");
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        stickyCta.classList.toggle("is-hidden-hero", entry.isIntersecting);
        if (whatsappFab) whatsappFab.classList.toggle("is-hidden-hero", entry.isIntersecting);
      });
    },
    { threshold: 0 }
  );
  heroObserver.observe(hero);
})();

const STEP_LABELS = ["About You", "Your Goal", "Schedule", "Location"];
const TOTAL_STEPS = 4;

const bookingState = {
  step: 1,
  hasStarted: false,
  data: { consent: true },
};

// Picking a row in the goal selector still just navigates to that section
// (so the visitor reads the relevant content before committing to anything),
// but it also records the intent immediately — so if they end up booking
// from a later, generic CTA (final CTA, sticky bar) instead of that
// section's own CTA, their earlier choice is still carried into the form.
document.querySelectorAll("[data-goal]").forEach((el) => {
  el.addEventListener("click", () => {
    bookingState.data.preferredProgram = el.dataset.goal;
  });
});

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

// Header copy follows the CTA that opened the form; the form itself is
// unchanged. The automatic popup always gets the general copy, so it never
// inherits a goal picked earlier or the section currently on screen.
const modalTitleEl = document.getElementById("modalTitle");
const modalSubtitleEl = document.querySelector(".modal__subtitle");
const AUTO_POPUP_SOURCE = "auto_popup";
function setModalCopy(programId, source) {
  const isAuto = source === AUTO_POPUP_SOURCE;
  const [goalTitle, line] = (!isAuto && POPUP_COPY[programId]) || POPUP_COPY.general;
  modalTitleEl.textContent = FORM_CONTEXT_TITLES[source] || goalTitle;
  modalSubtitleEl.textContent = FORM_CONTEXT_SUBTITLES[source] || `${line} ${POPUP_COPY.reassurance}`;
}

// BMI CTAs send one generic intent event with no parameters — never the BMI
// value, height, weight or category — and count as a form start only once
// the visitor actually types into the form.
const BMI_INTENT_EVENTS = { bmi_understand: "bmi_understand_click", bmi_consult_doctor: "bmi_consult_doctor_click" };
let pendingFormStartSource = null;

function openBooking(programId, source) {
  const isAuto = source === AUTO_POPUP_SOURCE;
  bookingState.data.leadSource = source || "unknown"; // internal only, sent with the submission
  if (programId) {
    bookingState.data.preferredProgram = programId;
    wantsGoalChange = false;
    track(TRACK_EVENTS.PROGRAM_CLICK, { program: programId, source });
  }
  // An automatic open is not a click and not a form start — it's tracked by
  // the popup_* events instead.
  if (!isAuto) {
    const bmiEvent = BMI_INTENT_EVENTS[source];
    if (bmiEvent) track(bmiEvent, {});
    else track(TRACK_EVENTS.CTA_CLICK, { source: source || "unknown" });
    pendingFormStartSource = null;
    if (!bookingState.hasStarted) {
      if (bmiEvent) {
        pendingFormStartSource = source;
      } else {
        track(TRACK_EVENTS.FORM_START, { source: source || "unknown" });
        bookingState.hasStarted = true;
      }
    }
    hasManuallyOpened = true;
    popupSessionActive = false;
    try { sessionStorage.setItem("glossary_form_opened", "1"); } catch (e) {}
  }
  setModalCopy(bookingState.data.preferredProgram, source);
  modalTriggerEl = document.activeElement;
  overlay.classList.add("is-open");
  stickyCta.classList.add("is-hidden");
  document.body.classList.add("modal-open");
  pushModalUrl(programId);
  showStep(bookingState.step);
  modalEl.focus();
}

modalEl.addEventListener("input", () => {
  if (!pendingFormStartSource || bookingState.hasStarted) return;
  track(TRACK_EVENTS.FORM_START, { source: pendingFormStartSource });
  bookingState.hasStarted = true;
  pendingFormStartSource = null;
});

modalEl.addEventListener("input", () => {
  if (!popupSessionActive || popupFormStartTracked) return;
  popupFormStartTracked = true;
  track(TRACK_EVENTS.POPUP_FORM_STARTED, {});
});

function closeBooking(opts) {
  overlay.classList.remove("is-open");
  stickyCta.classList.remove("is-hidden");
  document.body.classList.remove("modal-open");
  pendingFormStartSource = null;
  if (!(opts && opts.fromPopState)) popModalUrl();
  // Closing an auto-shown popup is a meaningful "not now" — respect it for
  // the rest of the session.
  if (popupSessionActive) {
    popupSessionActive = false;
    track(TRACK_EVENTS.POPUP_CLOSED, { step: bookingState.step });
    try {
      sessionStorage.setItem("glossary_booking_auto_dismissed", "1");
    } catch (e) {}
  }
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
  if (n === 1) updateIntentNote();
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
// When the visitor arrives with a goal already chosen (goal selector, a
// treatment card, ?service=…), say so in step 1 so they can see it was
// carried over — and let them change it instead of silently skipping the
// goal step.
let wantsGoalChange = false;
function updateIntentNote() {
  const note = document.getElementById("intentNote");
  const option = INTEREST_OPTIONS.find((o) => o.id === bookingState.data.preferredProgram);
  note.hidden = !option || wantsGoalChange;
  if (option) document.getElementById("intentNoteValue").textContent = option.label;
}
document.getElementById("intentNoteChange").addEventListener("click", () => {
  wantsGoalChange = true;
  updateIntentNote();
  document.getElementById("f_fullName").focus();
});

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
  if (bookingState.data.preferredProgram && !wantsGoalChange) {
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
    leadSource: d.leadSource || "",
  };
}

function postToGoogleSheet(stage) {
  if (!SITE_CONFIG.googleSheetWebhookUrl) return Promise.resolve({ ok: true });
  // No explicit Content-Type header: fetch defaults a string body to
  // text/plain, which keeps this a CORS "simple request" — Apps Script Web
  // Apps don't implement the OPTIONS preflight that application/json would
  // trigger. Apps Script parses e.postData.contents as JSON regardless.
  const body = JSON.stringify(buildSheetPayload(stage));
  // The step-1 save runs in the background: keepalive lets it finish even
  // if the visitor leaves the page, and it is never aborted.
  if (stage === "partial") {
    return fetch(SITE_CONFIG.googleSheetWebhookUrl, { method: "POST", body, keepalive: true })
      .then((res) => res.json().catch(() => ({ ok: true })));
  }
  // The final submit blocks the button, so it needs an upper bound. The
  // Apps Script regularly takes ~14s (measured), so 30s leaves headroom
  // before showing the "taking longer than expected" message.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  return fetch(SITE_CONFIG.googleSheetWebhookUrl, {
    method: "POST",
    body,
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
// Address + pincode + phone — no geolocation/map. The address lets the team
// plan at-home visits; the pincode confirms Delhi NCR serviceability.
document.getElementById("submitBtn").addEventListener("click", async () => {
  const address = document.getElementById("f_address").value.trim();
  const pincode = document.getElementById("f_pincode").value;
  const phone = document.getElementById("f_phone").value;
  const consent = document.getElementById("f_consent").checked;

  let valid = true;
  if (!isValidAddress(address)) { setError("err_address", "Enter your full address (house / flat no., street, area)."); valid = false; } else setError("err_address", "");
  if (!isValidPincode(pincode)) { setError("err_pincode", "Enter a valid 6-digit pincode."); valid = false; } else setError("err_pincode", "");
  if (!isValidMobile(phone)) { setError("err_phone", "Enter a valid 10-digit phone number."); valid = false; } else setError("err_phone", "");
  if (!consent) { setError("err_submit", "Please accept the consent checkbox to continue."); valid = false; }
  if (!valid) { focusFirstInvalid(); return; }

  Object.assign(bookingState.data, { address, pincode, phone, consent });
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
  const slowerHintTimer = setTimeout(() => {
    if (submitBtn.disabled) submitBtnLabel.textContent = "Saving, please keep this page open…";
  }, 12000);

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

    // Not a Lead — Lead fires once on the confirmation page (confirmation.js).
    if (popupSessionActive) track(TRACK_EVENTS.POPUP_FORM_COMPLETED, { program: bookingState.data.preferredProgram });
    try { sessionStorage.setItem("glossary_lead_submitted", "1"); } catch (e) {}
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
    clearTimeout(slowerHintTimer);
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
   AUTO-POPUP — the enquiry form never opens on page load, only after:
     S (all)     scrollStartDelay seconds after the visitor first scrolls
     A (desktop) POPUP_CONFIG.desktopTime visible seconds AND desktopScroll %
     B (desktop) highIntentDwell seconds engaged in Body Contouring,
                 Journeys, Client Stories or FAQ
     C (desktop) exit intent — cursor leaves through the top edge, after
                 exitIntentMinTime / exitIntentMinScroll
     M (mobile)  mobileTime seconds OR mobileScroll %, whichever first
   A, B and M also need the (hidden) intent score to reach minIntentScore,
   so completely passive visitors are never interrupted. It never fires while
   the visitor is typing, in another modal/video, or mid-interaction with the
   calculator, FAQ, carousel or a treatment card — it waits until that ends.

   At most POPUP_CONFIG.sessionLimit automatic opens per browser session, and
   none at all after the visitor has closed it, submitted, clicked WhatsApp
   or opened the form themselves. Explicit CTA clicks bypass all of this.
------------------------------------------------------------------------ */
let hasManuallyOpened = false;
let popupSessionActive = false; // the currently open modal was opened automatically
let popupFormStartTracked = false;

const POPUP_KEYS = {
  count: "glossary_popup_auto_count",
  dismissed: "glossary_booking_auto_dismissed",
  submitted: "glossary_lead_submitted",
  whatsapp: "glossary_whatsapp_clicked",
  formOpened: "glossary_form_opened",
};
function popupFlag(key) {
  try { return sessionStorage.getItem(key); } catch (e) { return null; }
}
function setPopupFlag(key, value) {
  try { sessionStorage.setItem(key, value); } catch (e) {}
}

function autoPopupAllowed() {
  return (
    Number(popupFlag(POPUP_KEYS.count) || 0) < POPUP_CONFIG.sessionLimit &&
    popupFlag(POPUP_KEYS.dismissed) !== "1" &&
    popupFlag(POPUP_KEYS.submitted) !== "1" &&
    popupFlag(POPUP_KEYS.whatsapp) !== "1" &&
    popupFlag(POPUP_KEYS.formOpened) !== "1" &&
    !hasManuallyOpened
  );
}

const isMobileViewport = () => window.innerWidth < POPUP_CONFIG.mobileBreakpoint;

/* ---- Engagement signals ---- */
const popupSignals = { activeSeconds: 0, maxScroll: 0, score: 0, awarded: new Set(), dwell: 0, inHighIntent: new Set(), firstScrollAt: null };

function award(signal) {
  if (popupSignals.awarded.has(signal)) return;
  popupSignals.awarded.add(signal);
  popupSignals.score += POPUP_CONFIG.intentPoints[signal] || 0;
}

function measureScroll() {
  const h = document.documentElement;
  const pct = Math.round(((h.scrollTop + h.clientHeight) / (h.scrollHeight || 1)) * 100);
  if (pct > popupSignals.maxScroll) popupSignals.maxScroll = pct;
  if (popupSignals.firstScrollAt === null && window.scrollY > POPUP_CONFIG.scrollStartMinPx) {
    popupSignals.firstScrollAt = performance.now();
  }
  if (popupSignals.maxScroll >= 30) award("scroll30");
  if (popupSignals.maxScroll >= 45) award("scroll45");
  if (popupSignals.maxScroll >= 60) award("scroll60");
}
window.addEventListener("scroll", measureScroll, { passive: true });

const HIGH_INTENT_SECTIONS = { "body-contouring": "bodyContouring", results: "journeys", reviews: "stories", faqs: "faq" };
// "Viewed" = the section has come well into view (its top past 60% of the
// viewport). "Engaged" = it occupies the middle band of the viewport.
const viewedObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) award(HIGH_INTENT_SECTIONS[e.target.id]); }),
  { rootMargin: "0px 0px -40% 0px" }
);
const dwellObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) popupSignals.inHighIntent.add(e.target.id);
    else popupSignals.inHighIntent.delete(e.target.id);
  }),
  { rootMargin: "-30% 0px -30% 0px" }
);
Object.keys(HIGH_INTENT_SECTIONS).forEach((id) => {
  const el = document.getElementById(id);
  if (el) { viewedObserver.observe(el); dwellObserver.observe(el); }
});

document.querySelectorAll("[data-goal], .goal-select__row").forEach((el) =>
  el.addEventListener("click", () => award("goalSelector"))
);
document.querySelectorAll("[data-open-booking][data-program]").forEach((el) =>
  el.addEventListener("click", () => award("treatmentCta"))
);

/* ---- "Don't interrupt" guard ---- */
const BUSY_ZONES = "#calculator, #faqs, #stories, #storiesPeople, .stories__progress, .contouring__card";
let lastInteractionAt = -Infinity;
["pointerdown", "keydown", "input", "focusin"].forEach((type) =>
  document.addEventListener(type, (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest(BUSY_ZONES) || t.matches("input, textarea, select")) lastInteractionAt = performance.now();
  }, true)
);

function visitorIsBusy() {
  const active = document.activeElement;
  return (
    overlay.classList.contains("is-open") ||
    reelLightbox.classList.contains("is-open") ||
    mobileMenu.classList.contains("is-open") ||
    (active && active.matches("input, textarea, select, [contenteditable='true']")) ||
    performance.now() - lastInteractionAt < POPUP_CONFIG.interactionCooldownMs ||
    !!document.querySelector(".contouring__card:hover, #stories:hover")
  );
}

/* ---- Showing it ---- */
const TRIGGER_EVENTS = {
  scroll_start: "popup_scroll_start_shown",
  scroll_time: "popup_scroll_time_shown",
  high_intent: "popup_high_intent_shown",
  exit_intent: "popup_exit_intent",
  mobile_time: "popup_scroll_time_shown",
  mobile_scroll: "popup_scroll_time_shown",
};

function showAutoPopup(trigger) {
  if (!autoPopupAllowed() || visitorIsBusy()) return false;
  setPopupFlag(POPUP_KEYS.count, String(Number(popupFlag(POPUP_KEYS.count) || 0) + 1));
  const detail = {
    source: AUTO_POPUP_SOURCE,
    trigger,
    intent_score: popupSignals.score,
    scroll_depth: popupSignals.maxScroll,
    seconds_on_page: popupSignals.activeSeconds,
  };
  track(TRACK_EVENTS.POPUP_AUTO_SHOWN, detail);
  track(TRIGGER_EVENTS[trigger], detail);
  popupSessionActive = true;
  popupFormStartTracked = false;
  openBooking(undefined, AUTO_POPUP_SOURCE);
  return true;
}

// One 1-second tick drives visible time, section dwell and trigger checks, so
// a trigger that qualifies while the visitor is busy simply waits for the
// next idle tick instead of being lost.
const popupTicker = setInterval(() => {
  if (!autoPopupAllowed()) { clearInterval(popupTicker); return; }
  if (document.hidden) return;
  popupSignals.activeSeconds += 1;
  popupSignals.dwell = popupSignals.inHighIntent.size ? popupSignals.dwell + 1 : 0;
  measureScroll(); // also catches scrolls whose events were coalesced/missed
  const scrolledAt = popupSignals.firstScrollAt;
  if (scrolledAt !== null && performance.now() - scrolledAt >= POPUP_CONFIG.scrollStartDelay * 1000) {
    if (showAutoPopup("scroll_start")) return;
  }
  if (popupSignals.score < POPUP_CONFIG.minIntentScore) return;

  const s = popupSignals;
  if (isMobileViewport()) {
    if (s.maxScroll >= POPUP_CONFIG.mobileScroll) showAutoPopup("mobile_scroll");
    else if (s.activeSeconds >= POPUP_CONFIG.mobileTime) showAutoPopup("mobile_time");
  } else if (s.activeSeconds >= POPUP_CONFIG.desktopTime && s.maxScroll >= POPUP_CONFIG.desktopScroll) {
    showAutoPopup("scroll_time");
  } else if (s.dwell >= POPUP_CONFIG.highIntentDwell) {
    showAutoPopup("high_intent");
  }
}, 1000);

// Desktop exit intent: the cursor leaves the page through the top edge
// (towards the tabs / address bar). Never used on mobile.
document.addEventListener("mouseout", (e) => {
  if (e.relatedTarget || e.clientY > 0) return;
  if (isMobileViewport()) return;
  if (popupSignals.activeSeconds < POPUP_CONFIG.exitIntentMinTime) return;
  if (popupSignals.maxScroll < POPUP_CONFIG.exitIntentMinScroll) return;
  showAutoPopup("exit_intent");
});

measureScroll();

/* -----------------------------------------------------------------------
   SCROLL REVEAL — content fades up as it enters the viewport, staggered
   within a group. The classes come off once shown so hover effects keep
   their own transforms. Skipped entirely under prefers-reduced-motion.
------------------------------------------------------------------------ */
(function scrollReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const SELECTOR = [
    "section:not(.hero) .section-tag", "section:not(.hero) h2", ".goal-select__sub", ".center-head__sub",
    ".goal-select__row", ".glp1__visual", ".glp1__content > p", ".calculator__result", ".calc-ctas",
    ".contouring__card", ".timeline__step", ".why__photo", ".why__grid > li", ".steps > li",
    ".reels__intro p", ".faq__item", ".final-cta__content > p", ".final-cta__actions", ".final-cta__visual",
  ].join(", ");
  const pending = new Set();
  function show(el) {
    if (!pending.delete(el)) return;
    io.unobserve(el);
    el.classList.add("is-in");
    const done = () => el.classList.remove("reveal", "is-in");
    el.addEventListener("transitionend", (e) => { if (e.target === el) done(); });
    setTimeout(done, 1500);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) show(entry.target); });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(SELECTOR).forEach((el) => {
    const group = Array.from(el.parentElement.children).filter((c) => c.matches(SELECTOR));
    el.style.setProperty("--reveal-delay", `${Math.min(group.indexOf(el), 5) * 0.08}s`);
    el.classList.add("reveal");
    pending.add(el);
    io.observe(el);
  });
  // Safety net: content must never stay invisible if the observer is late
  // or never fires (throttled tabs, in-app browsers, fast jumps via anchors).
  const sweep = setInterval(() => {
    pending.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight) show(el); });
    if (!pending.size) clearInterval(sweep);
  }, 500);
})();
