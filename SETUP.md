# Glossary Skin — Weight Management Landing Page

A static, dependency-free one-pager: plain HTML/CSS/JS on the front end, PHP
on the back end. No build step, no Node.js required — upload and it runs on
any Hostinger shared hosting plan.

## File structure

```
index.html                      the entire page
assets/css/style.css            all styling + animation
assets/js/config.js             editable data: programs, testimonials, reels, slots, tracking IDs, media paths, popup timing
assets/js/main.js               all interactivity (nav, booking modal, form, validation, story carousel, auto-popup)
assets/php/config.php           editable backend settings: emails, Google Sheet URL
assets/php/submit-lead.php      receives the booking form, sends email, logs the lead
assets/php/leads/leads.csv      local backup of every lead (auto-created, blocked from web access)
assets/php/GOOGLE_APPS_SCRIPT.md   steps to log leads into a Google Sheet
assets/img/, assets/video/      drop real photography/video in here — see below
```

## Deploying to Hostinger

1. Upload everything (via File Manager or FTP) into `public_html/` — or a
   subfolder if this should live at `glossaryskin.com/weight-management/`.
2. Open `assets/js/config.js` and set `leadEndpoint` to the live path of
   `submit-lead.php`, e.g. `"/assets/php/submit-lead.php"`.
3. Open `assets/php/config.php` and confirm `INTERNAL_NOTIFICATION_EMAILS`.
   PHP's `mail()` works out of the box on Hostinger; no further setup needed
   for basic delivery.
4. That's it for a minimum-viable launch — the form now emails your team and
   backs up every lead to `assets/php/leads/leads.csv`.

## Adding real photography & video

Nothing fabricated ships in this build — every photo/video slot is a
tasteful placeholder until you drop in a real file. Add files with these
**exact names** at these **exact paths** and they activate automatically —
no code changes needed:

| Slot | Path | Spec |
|---|---|---|
| Hero cutout photo | `assets/img/hero-doctors.webp` | ✅ added. Doctor/medical-team cutout, transparent background works best |
| Abdomen Inch Loss card | `assets/img/treatment-abdomen.jpg` | 1280×720px (16:9), under 200KB |
| Hips Inch Loss card | `assets/img/treatment-hips.jpg` | 1280×720px (16:9), under 200KB |
| Thighs Inch Loss card | `assets/img/treatment-thighs.jpg` | 1280×720px (16:9), under 200KB |

**Note on file extensions:** the extension in the filename must match the
actual image format (a PNG saved with a `.jpg` name will 404 silently in some
setups). If your browser's "Save image as" defaults to `.png` for an image,
save it with a `.png` extension — don't rename the extension by hand.
| Reel 1 video | `assets/video/reel-1.mp4` | 9:16 vertical, ≤15s, MP4 (H.264), under 8MB, no audio needed (plays muted) |
| Reel 1 poster | `assets/img/reel-1-poster.jpg` | 720×1280px, first-frame still of reel 1 |
| Reel 2 video / poster | `assets/video/reel-2.mp4` / `assets/img/reel-2-poster.jpg` | same spec as reel 1 |
| Reel 3 video / poster | `assets/video/reel-3.mp4` / `assets/img/reel-3-poster.jpg` | same spec as reel 1 |
| Reel 4 video / poster | `assets/video/reel-4.mp4` / `assets/img/reel-4-poster.jpg` | same spec as reel 1 |

If a file isn't there yet, that tile just won't open a player on click — safe
to deploy before all assets are ready, and safe to add them one at a time
later.

The reels are shown as a 4-up "phone mockup" grid — each tile is a poster
image inside a CSS phone-bezel frame with a play button. Tapping any tile
opens that video full-screen with sound and controls.

## Pricing — form-gated, not public

GLP-1 pricing is never shown on the public page. The inch-loss treatments'
starting price (₹4,050) IS shown publicly on their cards, matching what the
Meta ads themselves already promise — but `INTEREST_OPTIONS[].priceLabel` in
`assets/js/config.js` is what drives the price shown inside the booking
form (Step 1) once a visitor picks that option.

## Lead capture — fires from Step 1, not just on final submit

To make sure no lead is lost to drop-off, the form sends a lead to
`submit-lead.php` **twice**:

1. **Partial** — the instant Step 1 (name, phone, email, city, interest) is
   valid. Your team gets an email titled "New Step 1 Lead (Partial)" so you
   can follow up even if the visitor never finishes.
2. **Complete** — on final submission, with the full appointment + address
   details, titled "New Lead: NAME — INTEREST".

Both are logged to `assets/php/leads/leads.csv` with a `Stage` column so you
can filter partial vs. complete, and both forward to your Google Sheet (if
configured) with a `stage` field.

## Auto-popup behaviour

The booking form opens itself once — either as soon as the visitor scrolls to
the "Two Clear Paths" section (having had a chance to confirm their service
is on the page), or after a 20-second fallback for visitors who read without
scrolling far, whichever comes first. Skipped entirely if the visitor already
opened it manually. If they close it without engaging, it tries once more, 15
seconds later — then stops. The fallback delay and the re-open delay are both
configurable via `UX_CONFIG.autoOpenDelayMs` / `autoReopenDelayMs` in
`config.js`; the scroll trigger itself watches `#programs` in `main.js`.

### Optional: contextual preselection from the ad URL

If a Meta ad's destination URL includes `?service=abdomen` (or `glp1` /
`hips` / `thighs` / `not-sure`), the booking form pre-selects that interest
before the visitor even opens it. This is inert until the ad URLs are
actually updated to include the parameter — nothing currently sends it.

## Trackable form-open URL — on every step, not just on open

The page URL changes on **every page of the form**, not only when it first
opens, so each step is its own distinct, filterable "page" in GA4/Meta Ads
Manager and you can see exactly where people drop off:

| Step | URL |
|---|---|
| 1 — Your Goal | `?form=open&step=1#book-consultation` |
| 2 — Schedule | `?form=open&step=2&program=abdomen#book-consultation` |
| 3 — Location | `?form=open&step=3&program=abdomen#book-consultation` |
| Success | `?form=open&step=4&program=abdomen#book-consultation` |

`program` is one of the five `INTEREST_OPTIONS` ids: `glp1`, `abdomen`,
`hips`, `thighs`, or `not-sure` — matching the five Meta ad audiences 1:1.

Each transition fires a `ViewContent` event with a matching `virtual_page`
(e.g. `/book-consultation/step-2-schedule`) and a `step` number, so you can
build a proper funnel report instead of just a single "opened the form" event.
`history.pushState` runs once (on open) and `history.replaceState` on every
step after that, so the visitor's back-button history stays clean — one entry
for "the form is open," not one per step. Closing the modal restores the
original URL; the browser's back button also closes the modal (so it behaves
like a native app screen, not a broken link).

## Optional: log leads to a Google Sheet

Follow `assets/php/GOOGLE_APPS_SCRIPT.md`, then paste the Web App URL into
`GOOGLE_SHEET_WEBHOOK_URL` in `assets/php/config.php`. Leads are split across
two tabs: **Sheet1** holds Step-1-only drop-offs (so they're never lost),
**Sheet2** holds fully completed bookings — and a lead moves out of Sheet1
into Sheet2 automatically if they go on to finish the form.

## Performance

- `.htaccess` at the project root enables gzip compression and long-lived
  browser caching for CSS/JS/images/video on Apache (Hostinger's default) —
  delete it if your host already handles this, it's additive, not required.
- Fonts are trimmed to exactly the weights actually used (Playfair Display
  400/700, Manrope 400/600/700) — fewer font files to download, and loaded
  with `display=swap` so text renders immediately in a fallback font rather
  than staying invisible while fonts load.
- Scroll-driven effects (navbar shadow, top progress bar) share a single
  `requestAnimationFrame`-throttled listener instead of running on every raw
  scroll event.
- The testimonials auto-scroll and the reel story-carousel's timer both fully
  stop (not just idle) whenever their section is scrolled out of view, via
  `IntersectionObserver` — nothing animates or ticks off-screen.
- Below-the-fold images use `loading="lazy"`; the hero image loads eagerly
  since it's above the fold.

## Optional: interactive map on the location step

Get a Google Maps JavaScript API key, restrict it (Google Cloud Console) to
your domain and the Maps JavaScript API + Geocoding API, then paste it into
`googleMapsApiKey` in `assets/js/config.js`. Without a key, the location step
still works fully via "Use My Current Location" + manual address entry — it
just skips the visual map.

## Optional: Meta Pixel / GA4 / GTM

Paste the relevant IDs into `assets/js/config.js` (`metaPixelId`, `ga4Id`,
`gtmId`). Leave any of them blank to skip injecting that script. Every step
of the funnel already fires the matching event (`PageView`, `ViewContent`,
`CTA_Click`, `Program_Click`, `Form_Start`, `Form_Step_Completed`,
`Location_Added`, `Date_Selected`, `Time_Selected`, `Form_Submit`, `Lead`,
`Booking_Completed`) so ad platforms see the full funnel as soon as IDs are
added.

## Testing locally before upload

Any static file server works, e.g. from this folder:

```bash
php -S localhost:8000
```

Then open `http://localhost:8000`. The booking form will submit successfully
if PHP's `mail()` is configured locally; if not, the lead is still validated,
logged to `leads.csv`, and the API responds success (so you can test the full
front-end flow) — check your terminal for a `mail() failed` warning if so.

## Content sourcing note

Program details, pricing, eligibility criteria, doctor credentials and the
weight-management testimonials were provided directly by the Glossary Skin
team or pulled from the live glossaryskin.com site — nothing was invented.
