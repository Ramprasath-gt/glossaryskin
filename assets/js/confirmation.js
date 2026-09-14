// =============================================================================
// GLOSSARY SKIN — ENQUIRY CONFIRMATION PAGE (/enquiry-confirmed)
// Vanilla JS, no build step. This page is never linked from the site itself —
// it's reached only via the redirect main.js performs after a successful
// booking-form submission. Deliberately does NOT load main.js: this page has
// no modal, reels, testimonials, or landing-page interactions to wire up.
// =============================================================================

// ---- Tracking bootstrap — identical conditional pattern to main.js's
// injectTracking(): only loads a pixel/tag if config.js actually has an ID,
// so this stays a no-op until the business supplies real values. Runs first
// (before the conversion-firing logic below) so window.fbq/gtag exist in
// time — the inline snippets define them synchronously as queueing stubs
// even before the real network scripts finish loading. -----------------------
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
})();

(function () {
  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get("service");
  const date = params.get("date");
  const time = params.get("time");
  const cid = params.get("cid");

  /* ---- Contact links — verified values from config.js only ---------------- */
  const phoneLink = document.getElementById("confPhoneLink");
  if (phoneLink) {
    const phoneLinkText = document.getElementById("confPhoneLinkText");
    if (phoneLinkText) phoneLinkText.textContent = SITE_CONFIG.phone;
    phoneLink.href = `tel:${SITE_CONFIG.phone.replace(/\s+/g, "")}`;
  }
  const waLink = document.getElementById("confWhatsappLink");
  if (waLink) waLink.href = `https://wa.me/${SITE_CONFIG.whatsapp}`;

  /* ---- Summary card --------------------------------------------------------
     Only rendered when a real service param exists (i.e. this genuinely came
     from the booking form's redirect). Date/time are each optional on their
     own — the visitor may have closed the modal before reaching the schedule
     step in a future flow variant, so neither is assumed present. */
  function formatDatePretty(iso) {
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch (e) {
      return iso;
    }
  }

  const serviceOption =
    typeof INTEREST_OPTIONS !== "undefined" ? INTEREST_OPTIONS.find((o) => o.id === serviceId) : null;
  const serviceLabel = serviceOption ? serviceOption.label : null;

  if (serviceLabel) {
    const summary = document.getElementById("confSummary");
    const list = document.getElementById("confSummaryList");
    const rows = [["Service", serviceLabel]];
    if (date) rows.push(["Preferred Date", formatDatePretty(date)]);
    if (time) rows.push(["Preferred Time", time]);
    list.innerHTML = rows
      .map(([label, value]) => `<div class="conf-summary__row"><dt>${label}</dt><dd>${value}</dd></div>`)
      .join("");
    summary.hidden = false;
  }

  /* ---- Message-match doesn't stop at conversion — naming the actual
     service back to the visitor here (instead of only the generic "your
     request") reassures them the right thing was received. Skipped for
     "not-sure" (serviceId !== that) since there's no specific service to
     name — the generic copy already in the HTML already fits that case. */
  if (serviceLabel && serviceId !== "not-sure") {
    const sub = document.getElementById("confSub");
    if (sub) sub.textContent = `We’ve received your ${serviceLabel} enquiry. We’ll take care of the next step from here.`;
    const nextStepText = document.getElementById("confNextStepText");
    if (nextStepText) nextStepText.textContent = `We’ll contact you about your ${serviceLabel} enquiry using the details you provided.`;
  }

  /* ---- Conversion tracking, with dedup -------------------------------------
     Three-tier design so this URL actually represents a completed enquiry
     rather than "someone loaded this page":

     1. `cid` in the URL must match the pending id main.js wrote to
        sessionStorage immediately before redirecting here. A new tab, a
        different browser session, or someone pasting/bookmarking this link
        never has that value in ITS sessionStorage — sessionStorage doesn't
        travel with the URL — so it never fires a conversion. This is what
        makes "visit the URL directly" not count as a lead.
     2. Even a genuine match only fires once per cid, tracked in its own
        sessionStorage flag — refreshing or using back/forward on the SAME
        tab that just converted re-renders the page without double-firing.
     3. No `service` param at all means there's nothing to key dedup off;
        the page falls back to the generic "request received" copy already
        in the HTML and tracking never fires. */
  let pendingCid = null;
  try {
    pendingCid = sessionStorage.getItem("glossary_pending_cid");
  } catch (e) {}

  const isGenuineArrival = !!cid && cid === pendingCid;
  let alreadyFired = false;
  if (cid) {
    try {
      alreadyFired = sessionStorage.getItem("glossary_fired_" + cid) === "1";
    } catch (e) {}
  }

  if (isGenuineArrival && !alreadyFired) {
    fireConversion(serviceLabel || serviceId || undefined);
    try {
      sessionStorage.setItem("glossary_fired_" + cid, "1");
    } catch (e) {}
  }

  function fireConversion(serviceName) {
    // Standard events — not the landing page's fbq('trackCustom', ...)
    // wrapper — because these are what Meta/GA4's own conversion
    // optimisation and reporting actually read.
    if (window.fbq) {
      window.fbq("track", "Lead", serviceName ? { content_name: serviceName } : {});
    }
    if (window.gtag) {
      window.gtag("event", "generate_lead", serviceName ? { service: serviceName } : {});
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "generate_lead", service: serviceName || undefined });
    console.debug("[confirmation] conversion fired", { service: serviceName || null });
  }
})();
