# NM Plotter iPhone — open suggestions

**Maintained by Claude. Updated and re-attached with every build.**
Status as of **v231 · 3 Aug 2026**.

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
- **[R] Toolbar declutter and the landscape HUD over real tiles.** Polish.
- **[R] Measure tool refinements** — nothing specific requested, but total
  bearing end-to-end and a running area would both be cheap.

## Needs a decision from you



- **[D] Weather sub-tabs on the card — the remaining piece of the v208 spec.**
  METAR is in. TAF needs a second feed through the `nmplotter-wx` worker. You
  mentioned a weather model in v262: I want to look at what that actually
  fetches before wiring anything to it, because a modelled figure sitting
  beside an observed one has to be told apart on sight. Send me the v262 file
  or the worker route and this is a short build.
- **[R] The diagram square is in place (v218) and already looks for an Airport
  plate.** Nothing more to wire — it fills itself the day charts land.
- **[D] Density altitude on the weather tab** — computable from temperature,
  QNH and elevation, all of which we already hold. Cheap, and useful out of a
  hot strip.

- **[D] Charts.** The largest thing v262 has that this does not: georeferenced
  plate overlay, calibration, `parsePlate`, the IndexedDB chart store. Needs a
  plan agreed before any code. Raised three times, never planned.
- **[D] PDF export.** jsPDF is not inlined — roughly 350 KB into the file
  before a line is written. Worth it or not is your call.

## Flagged, not chased

- **Two field names in the pack read badly** — "(Duplicate) Utai" and "Awar
  Airport (unusable)". They are what OurAirports says. Sorting them properly
  does not make them right; worth deciding whether to override the names
  locally or leave the source visible.

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
| Build number missing from the More sheet | v224, fixed v225 | Restored to #sver, pinned under the list |
| Airport page still jumped on tab switch | v225 | v221 measured a pinned row; now keeps the scroll position |
| Sort switch on Frequencies; sloppy letter band | v223 | By name everywhere; band spans the gutters; ident stops wrapping |
| Cloud headings crammed against their fields | v222 | Spacing added; labels stop repeating the heading |
| Airport page jumped to the top on tab switch | v221 | Tab row held in place; tabs pinned |
| Heading flush under a sheet title, third time | v231 | Fixed as a rule on the sheet body, not per builder |
| Layout row did not match the view rows | v230 | Tinted tile, symbol, label — same as every view |
| Six layout rows cluttering the More sheet | v229 | One row, Bars and sizing, opening a page |
| IFR rail was fixed, not configurable | v228 | Five slots, stored and edited exactly as VFR |
| VFR / IFR layer sets on the rail | v227 | Two cells in the open rail; switching swaps the map |
| Four aircraft pushed Settings off-screen | v226 | Picker is its own wrapping row; unnamed profiles numbered |
| Aircraft pills did not match the app's UI | v220 | Now a segment in a labelled row; Add is a row, not a symbol |
| Worker URLs in two different views | v219 | Both under Cloud; Settings points there |
| Airport page had no diagram square | v218 | Added; becomes the button that opens the plate when one exists |
| Reorder editor removed entirely | v217 | Nobody asked for it; groups do the job. Bar editors kept |
| Drag never worked on device | v216 | Replaced with tap-to-lift, tap-to-place; no gestures at all |
| Drag barely worked; groups were a fence | v215 | Hit test used the window centre, not the finger; views move between groups |
| Bar views vanished from the list | v214 | My v213 mistake; the list is complete again |
| Slot editor — bottom bar reconfigurable | v213 | Bar is the first group in the More editor; drag to swap |
| No way back from a shuffled view order | v212 | Reset to the default order, arm-then-fire |
| More list labels jumped to centre | v211 | My v206 regression; text-align:left |
| Reordering by arrows, and a hide feature nobody wanted | v211 | One grip, drag to reorder; hiding removed |
| Minima and fix tables cluttering the Procedure tab | v210 | Removed from the card; data kept for the picker |
| By name / By code control on Airports | v209 | Removed; the list is always by name |
| Card structure spec: nearest, light, sub-tabs, NOTAM link | v208 | Weather sub-tabs still open |
| Long lists were one unbroken column | v207 | Sticky letter headings and an A–Z jump strip |
| More edit mode looked like a spreadsheet | v206 | Label truncates; one joined control group; hide is an eye |
| Procedures led with fixes, not documents | v205 | Plates first by category; ENR 4.3 fixes below |
| GROUND over GND 121.7 said it twice | v205 | A lone generic label collapses into its heading |
| Fuel and contact took two taps for one idea | v204 | One editor: company, phone, fuel, notes; phone dials |
| TWR frequency repeated under the card title | v204 | Removed; every frequency lives on the Info tab |
| Card frequencies a flat list | v203 | Grouped by call type, Other catches the rest |
| Runway wind said H7 X3, not which end | v203 | Best wind marked, head and cross split |
| Leg states told apart by weight, heavy casing | v202 | Magenta flying / cyan to come / grey flown, lighter casing |
| Area CTAF showed a meaningless "2" | v201 | It was the array index; v262 shows no number either |
| Six lines of explanation under the route list | v201 | One line stays, the rest folds behind a tap |
| Fuel wheel headed with the last window's value | v200 | Own readout branch; unknown controls now clear it |
| Fuel wheel ran past the tank | v198 | Usable fuel is a per-aircraft field, default 540 kg |
| Fuel on board typed, not dialled | v197 | Wheel in tens, 0–1,200 kg, with quick steps |
| No way to a point's card from the plan | v197 | Open the card row in the point sheet |
| Plan opened with its points cut in half | v197, ~~reversed v199~~ | The taller floor stopped the grip going small; back to v191's floor |
| Hold-to-reorder route chips broken | v196 | The scrolling body claimed the gesture; chips now opt out |
| Plan closed behind its own windows | v195 | Panel held while a quick field is open |
| Fuel on board buried in Settings | v195 | Tap Fuel on arrival to set it; same store as the Fuel view |
| Frequency list looked unsorted | v194 | A hidden third grouping (rank) cut the alphabet; removed, two headed groups |
| Long lists ordered by ICAO code | v193 | By name default, By code optional, shared by both lists |
| Remove rows unclickable and misdrawn | v192 | `dgr` collided with the map's danger-area class; renamed, gate check added |
