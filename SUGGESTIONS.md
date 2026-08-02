# NM Plotter iPhone — open suggestions

**Maintained by Claude. Updated and re-attached with every build.**
Status as of **v191 · 2 Aug 2026**.

Everything I have proposed, offered or flagged that has not been built or
explicitly declined. Items move to *Closed* when they ship, so this file is
also the record of what got picked up.

Legend: **[A]** waiting on Danny · **[R]** ready, no blocker · **[D]** needs a
decision · **[B]** blocked on data Danny supplies · **[?]** I would argue
against it

---

## Waiting on you

- **[A] `rot.html` — track-up / heading-up.** Built, gated, rebuilt on every
  version since v168. Never driven. Three questions: do taps land, does it
  stutter with terrain on, do the labels stay upright. Cannot merge until
  those are answered.
- **[A] Icon alternates.** `nmp-leg` shipped. `nmp-leg-dash` (route continues
  past the destination) and `nmp-ship` (blue GPS chevron over a dashed track)
  are attached and are a one-line swap.
- **[A] Sanity-check the three unrotated frames** against the Garmin: published
  AIP track values, METAR wind, hold courses. Everything else is magnetic since
  v181.

## Ready to build, nothing blocking

- **[B] ENR 4.4 RNAV five-letter fixes.** You located roughly twelve pages of
  coordinates, but they have not reached this session — I do not have the
  numbers, and I will not approximate a fix position. Send the pages and it is
  a short build. *(Was listed [R]; that was wrong.)*
- **[R] Terrain profile: flown vs to-come.** The map has three leg states; the
  profile is one undifferentiated fill. Shade the flown portion back and drop a
  tick at your actual position.
- **[R] Airfield label decluttering** — dots at low zoom, labels appearing as
  you zoom in. Long-standing, no blocker.
- **[R] Edit coordinates on a saved waypoint.** You can rename it, set its
  elevation and delete it; you cannot nudge its position.
- **[R] Checklists round two** — a per-aircraft *set* (start-up → pre-takeoff →
  shutdown as one group), and duplicate-and-edit so P2-COP can be forked from
  P2-LAW rather than pasted fresh. Now that there is a fleet, a checklist could
  belong to a registration.
- **[R] Version banner on update** — "Updated to v188, reload to finish" —
  plus the version in the More header. You have hit stale cache on the iPad at
  least once.
- **[R] Four views share one generic document glyph** — Calculator, Broadcast
  zones, Checklists, Notes. Grouping in v186 made it more obvious.
- **[R] More sheet row dividers step further right down the list.** Each
  hairline ends at a different x. Looks unintentional.
- **[R] Slot editor** — reconfigurable bottom-bar slots. Deferred at the start
  of the iPhone port and never revisited.
- **[R] Toolbar declutter and the landscape HUD over real tiles.** Polish.
- **[R] Measure tool refinements** — nothing specific requested, but total
  bearing end-to-end and a running area would both be cheap.

## Needs a decision from you

- **[D] Charts.** The largest thing v262 has that this does not: georeferenced
  plate overlay, calibration, `parsePlate`, the IndexedDB chart store. Needs a
  plan agreed before any code. Raised three times, never planned.
- **[D] PDF export.** jsPDF is not inlined — roughly 350 KB into the file
  before a line is written. Worth it or not is your call.

## Flagged, not chased

- **[?] 101 empty `catch` blocks.** Most are legitimate (storage in private
  mode, a DOM node not there yet), but it is a lot of places a fault can die
  quietly. Worth one pass with fresh eyes.
- **Seven storage keys are string literals** rather than named constants.
  Cosmetic — but a duplicated key literal is how the `REC_KEY` collision
  happened.
- **WMM2025 expires in 2030.** It computes past that and says it is
  extrapolating; it will want the 2030 coefficients.

## Blocked on data from you

- **[B] ENR 5.1 coordinate pages** — four of the twelve danger areas are drawn
  from estimated geometry and marked as such.
- **[B] Bush-strip and en-route HF frequencies** — 15 of 575 fields have
  published ones.

## I would argue against

- **[?] Open-Meteo model weather.** On the gap list, but the Flight Category
  layer is METAR-only on purpose, and mixing modelled data into a weather layer
  is how you end up trusting a forecast that reads like an observation. If you
  want it, it should be visually distinct from anything observed.

---

## Closed

| Suggested | Shipped | What |
|---|---|---|
| Point/leg stays in view under the panel | v183 | Map pans to the uncovered area |
| Mag var on the point card | v185 | Computed from WMM anywhere |
| Subject re-centres when the panel closes | v187 | Remembered subject, same focus re-run |
| More sheet too wide on iPad | v186 | Capped at 340 px |
| Views grouped and Edit actually edits | v186 | Flying / Planning / Data, reorder + hide |
| Layout section did not belong in Settings | v186 | Moved under More → Edit |
| More than one aircraft | v186 | Fleet profiles, fuel on board excluded |
| Written rule for sheet layout | v184 | Facts first, headed groups, destructive row last, units inline, body scrolls |
| Active leg hard to tell from to-come | v172 | Casing plus a brighter amber |
| Notes on waypoints | v173 | Same store as the airfield card |
| Bulk delete of waypoints | v173 | Tick boxes, arm-then-fire |
| Calculator reorder was undiscoverable | v173 | Explicit Edit mode |
| iPad FPL panel empty gap | v169 | Panel takes the height its content needs |
| Measure tool | v176 | Great-circle segments, per-leg bearing and distance |
| Waypoint library before pulling | v176 | Browse the cloud, pull only what you tick |
| Copy route | — | Already existed as Duplicate; struck off rather than built twice |
| GPX export | v164 | Tracks and routes |
| Magnetic courses | v181 | WMM2025, validated to 0.0002° |
| Full-screen airport page | v182 | One card, two hosts |
| Checklists, lists and PDFs | v179 | Two kinds, size-adjustable |
| Fuel and phone per field | v189 | Yours to add, same idea as frequencies |
| Holds in the frame you fly | v189 | Courses labelled M or T; GPS suggestion converted |
| Zoom-in jitter | v188 | Deadband in metres as well as pixels |
| FPL panel drag cap and clipped row | v190 | My regression from v169; grip free again, hand-set height wins |
| FPL floor smaller than its own chrome | v191 | Measured floor: chrome + one row |
| Route chip sheet was a bare word list | v191 | Icons, headed groups, v184 rule |
| Measure chip under the frequency window | v191 | Centred over what is left of the map |
| Leg card's remove row escaping the card | v191 | Groups clip their children; tablet sheet clips |
