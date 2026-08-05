# NM Plotter iPhone — open suggestions

**Maintained by Claude. Updated and re-attached with every build.**
Status as of **v272 · 5 Aug 2026**.

Everything I have proposed, offered or flagged that has not been built or
explicitly declined. Items move to *Closed* when they ship, so this file is
also the record of what got picked up.

Legend: **[A]** waiting on Danny · **[R]** ready, no blocker · **[D]** needs a
decision · **[B]** blocked on data Danny supplies · **[?]** I would argue
against it

---

## Waiting on you

- **[D] If the needle is hard to read in the air, the triangle-and-N is the
  fallback.** Danny's first reference reads faster than any needle — but it
  duplicates the badge's own text label and cannot rotate. Revisit only if the
  needle fails in daylight.
- **[A] FLY TRACK-UP AND SAY WHETHER IT STAYS.** Merged into the app in v260,
  off by default — tap the needle top right of the map. It could never have
  been tested the way I kept asking: track-up needs ground movement, heading-up
  needs a compass permission a preview frame cannot raise. Now it can be flown.
  Three things I cannot test from here: do taps land where you point, does it
  stutter with terrain on, do labels stay upright with the aircraft still
  turning. If it does not earn its place, it comes out.
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
- **[R] Edit a Times stamp.** Tapping a set stamp undoes it, which loses
  the time. A late press — Skids Down three minutes after it happened,
  hands full on short final — needs the time corrected, not discarded.
  This is the thing background recording could not have given you
  anyway, and the gap is real in the air. Next round unless you say
  otherwise.
- **[D] Times on a filed card is read-only.** Tapping one opens nothing.
  Worth deciding whether a filed run should be editable, or frozen once
  filed and corrected only before you file it.
- **[D] Times and REC are two records of one flight.** REC gives a track
  and elapsed; Times gives engine and skids. They are filed separately
  and nothing joins them. If you run both, you get two cards for one
  sortie. Not obviously wrong — leaving it until you have flown it.
- **[D] Sequencing has no arrival announcement and no off-switch.** It moves
  the live leg and toasts which one; it does not tell you the destination is
  next, and there is no setting to stop it. Both are cheap. Fly it first.
- **[R] Terrain profile: flown vs to-come.** Now that the live leg moves on
  its own, the profile's single undifferentiated fill is the last place the
  three states are not shown. The map has three leg states; the
  profile is one undifferentiated fill. Shade the flown portion back and drop a
  tick at your actual position.
- **[R] Airfield label decluttering** — dots at low zoom, labels appearing as
  you zoom in. Long-standing, no blocker.
- **[D] Show the source on a mark's card.** Every mark now carries
  `src:'gps'` or `src:'centre'`, and a GPS one carries the accuracy it was
  taken at. The name says which, but the card does not show either. Cheap to
  add and it is the sort of thing you want to see before you fly to one.
- **[D] Marks taken before v239 have no `src`.** They are all screen-centre
  marks but nothing on them says so. Worth deciding whether to leave them,
  label them 'source unknown', or leave well alone.
- **[R] ~~Edit coordinates on a saved waypoint.~~ DECLINED v240.** You asked
  for the opposite and you are right: a mark records where something was, and
  a position you can edit is not a record. Struck off rather than left open.
- **[D] Elevation on the airfield and pin cards too.** v242 fetches it for a
  mark. Every other card could state the same figure the same way, and the
  pin window already does its own version. Worth unifying rather than having
  three answers to one question.
- **[D] Nothing writes `el` any more.** Marks made before v240 keep whatever
  you typed and it still shows, labelled. Whether the field should be
  migrated, shown as legacy, or quietly retired is your call.
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
- **[D] Other floating windows may have the same fault as the terrain
  window did.** The frequency window and the point window both sit over the
  map; the terrain one was the only modal among them and it was the one you
  work while looking at what it changes. Worth deciding whether any other
  `.gpsov` is really a HUD wearing a modal's clothes.
- **[D] The same three rules probably belong on the other sheets.** The
  terrain bar cannot be resized and the GPS window still covers the tab bar.
  Whether they should all behave like Times now, or whether Times is the odd
  one because you work it for a whole flight, is your call.
- **[R] Toolbar declutter and the landscape HUD over real tiles.** Polish.
- **[R] Measure tool refinements** — nothing specific requested, but total
  bearing end-to-end and a running area would both be cheap.

## Needs a decision from you

- **[A] READ CONTAINER SCALE FIRST. IT DECIDES EVERYTHING ELSE.** After v272
  it should read **1.000** at rest. The renderer catch-up now actually runs on
  every settle, which is what v250 built it to do and what it has never once
  done. If it reads 1.000 and the legs are the right weight, the fat leg and
  most of the float were three builds of having no catch-up at all, and the
  next question is only whether `NMX_ZSYNC` needs to come back for the pinch
  itself. If it still reads high, the scale is coming from somewhere I have not
  looked and I have been wrong twice about this.

- **[A] TAP: send me the numbers before I change the pad size.** 44 px is
  Apple's minimum, not a measurement of this map. What matters is **Nearest on
  a miss, mean**. Well under 22 and the pad is greedy — it will cost accuracy
  around Goroka for nothing, and I would take it down to 30 or so. Up near 22
  and 44 is right. **Took a path** is the other one worth watching: if it is
  non-zero, airways and zones are still stealing taps meant for airfields and
  the pad is not deep enough.

- **[D] Nearest-wins tap resolver, if the pad is not enough.** The pad cannot
  choose between two markers — Leaflet arbitrates overlapping icons by
  z-index, taken from the projected y, so the SOUTHERNMOST wins rather than the
  nearest. A resolver that gathers every marker within a radius and opens the
  closest fixes that properly, but it is a new interaction pattern and it has
  to arbitrate against the path handlers rather than sit above them. Only worth
  building if the panel says clusters are actually a problem.

- **[?] A harness that greps cannot tell you the code runs.** `zoom.js`
  asserted the exact string `if (typeof nmxRendererSync === 'function')
  nmxRendererSync();` and passed on it for eighteen versions, against a call
  that could never resolve. Source text existing is not source text executing.
  Folding `scopeproof.js` into `checkorder.js` is the general answer and is
  still on the list below.

- **[?] I broke my own rule inside the build that stated it.** v270's changelog
  says an instrument that cannot fail is not an instrument, and the same build
  shipped a vector sampler whose guard capped its own error at 120 px. Worth
  keeping written down: a plausibility guard on a measurement is a way of
  hiding the measurement failing. Detect the condition you meant to exclude —
  v271 checks `_rings` against `_parts` — or exclude nothing.

- **[D] `NMX_ZSYNC` — does the per-frame vector re-projection come back?**
  Still `false`. Deliberately not touched in v270 so that build changed one
  thing. During a pinch you will still see fat strokes and a route clipped in
  mid-air; that is v269's experiment, not a new fault. The decision is now
  informed rather than guessed: if Vector offset is near zero, re-arming it
  only ever addressed the stroke, and there are cheaper ways to hold a stroke
  width than re-projecting 253 paths a frame.

- **[R] Add a scope-resolution pass to `checkorder.js`.** `renderMap`'s call
  into `nmxRendererSync` has never executed — the name is declared inside
  `bootMap()` and `renderMap` is not, and the `typeof` guard turned the scope
  error into silence. `checkorder.js` counts 559 functions and 389 top-level
  vars and did not see it. `scopeproof.js` in the working directory walks the
  AST and reports every identifier reference that cannot resolve; folding it
  in makes this class of fault impossible to ship again. One evening's work,
  no blocker, and it would have saved this one.

- **[?] Two of my own diagnostic habits were wrong, and both are worth
  keeping written down.** The sampler lived inside `nmxRendererSync`, so
  turning the sync off turned the measurement off and the panel read zero —
  which looked like an answer and was an absence. And it measured `.nmx-di`,
  a 0×0 box with `overflow:visible`, which is pinned to the projection by
  construction and could only ever report success; it read 1.4 px while the
  visible dot sat 15 px away. An instrument that cannot fail is not an
  instrument. Both are fixed in v270, but the pattern will recur.

- **[A] MAPS / ZOOM / FLOATING IS NOT CLOSED.** Danny's note, 4 Aug: more
  testing to come, the topic stays open. As of v258 a pan or a zoom rebuilds
  nothing — route and tracks carried by Leaflet, markers and zones diffed —
  and the panel reports kept/added/removed for both. Two things are still
  NOT in the diff and are the next suspects if it still floats: the **terrain
  tile layer**, and the **own-ship marker** (`G.ship`), which `paintShip()`
  repaints separately on every frame. Do not treat this as done.
- **[A] Fly the zoom and say whether it is done.** As of v258 a pan or a zoom
  rebuilds nothing: route and tracks are carried by Leaflet, markers and zones
  are diffed. The panel reports kept/added/removed for both. If it still
  floats, the next suspects are the terrain tile layer and the own-ship
  marker, neither of which is in the diff.
- **[?] ~~THE ZONES — the last group still rebuilding.~~ Done v258.** `G.box` (airspace,
  danger areas, CTA/TMA, airways, broadcast zones) is still cleared and
  rebuilt on every view change. It is mostly fixed geometry; only the zone
  frequency labels need the viewport, because they are placed inside the
  *visible* part of their zone. Split the labels from the shapes and the
  shapes can be diffed the same way the markers now are.
- **[A] ~~THE MARKERS — the last of the floating.~~ Done v257.** Airports, waypoints and
  fixes are still destroyed and re-created on every pan and zoom. The
  declutter is a collision pass in screen space and the rank gates read the
  zoom, so *which* markers exist genuinely changes with the view — but a
  marker on screen before and after a gesture should not be destroyed in
  between. The fix is a diff keyed on id plus label state: keep, add and
  remove the difference rather than clearing the group. Now that the renderer
  is proven, this is the remaining cause.
- **[A] ~~Read the re-projection timing off the diagnostics panel.~~ Done:
  worst 5 ms over 1950 re-projections. Affordable.**
- **[A] Old: read the re-projection timing off the diagnostics panel.** The
  overlay is **253 paths**, not the six I claimed — the route legs plus every
  airspace, airway, danger area and zone ring in the same pane. v254
  re-projects all of them on every frame of a pinch. The panel now reports
  last/worst milliseconds; anything approaching 16 ms is a dropped frame.
- **[D] If it is slow: a dedicated renderer for the route.** Put the legs in
  their own pane with their own `L.svg`, re-project only that per frame, and
  leave the airspace on Leaflet's cheap transform until the fingers lift. The
  route is what has to be right during a pinch; the zones can float for a
  second.
- **[D] Line weights against ForeFlight's.** Their legs are nearer 8 px than
  our 2.5/3.5, and read as considerably more confident on a moving map. Now
  that width is constant at every zoom, it is worth deciding what that width
  should be. Not changed without you.
- **[R] ZOOM PART SIX — the markers.** v248 stopped the route and tracks
  being rebuilt on a view change. `G.mk` still is, and legitimately: the
  declutter is a collision pass in screen space and the rank gates read the
  zoom, so *which* markers exist changes with the view. The fix is a diff —
  keep a map of id to marker, compute the wanted set, remove and add only the
  difference — so a waypoint that is on screen before and after a zoom is
  never destroyed. Bigger than it sounds because a marker's icon also changes
  with zoom (dot against dot-plus-label), so the diff key has to carry the
  label state.
- **[R] ZOOM PART SEVEN — the zones.** `G.box` is geometry except that zone
  frequency labels are placed inside the *visible* part of their zone. Split
  the labels from the shapes and the shapes stop being rebuilt too.
- **[R] ~~ZOOM PART TWO — stop rebuilding the overlay on every view change.~~**
  The measured cause of the floating. `renderMap()` clears every layer group
  and re-creates the lot, bound to `moveend`, `zoomend`, `resize` AND
  `viewreset`. Every pan and every zoom throws away hundreds of markers and
  lines and draws them again a frame later, which is why nothing feels glued.
  The fix is to split *data changed* from *view changed*: a view change should
  rebuild nothing, because Leaflet already carries what is there. Only the
  genuinely viewport-dependent parts — which airfields are in view, label
  decluttering, highest-in-view — need a view-driven pass, and that should add
  and remove the difference rather than clear everything.
  This is a build of its own with a real regression surface (every layer, the
  ship, the route, the profile all read from the same render). `zoom.js` holds
  the present behaviour as a measured baseline so the change can be proved
  rather than felt.



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

- **[?] Other `pointer-events:none` lockouts may have the same hole.** The
  measure lockout looked right for as long as the tool has existed and did
  nothing, because a child re-enabled itself. Worth one pass over every other
  place the app disables taps on a container to check none of them is relying
  on inheritance that pointer-events does not have.
- **[?] No other glyph pair in the app has been measured.** `tiles.js`
  computes extents and optical squares for these two. The tab bar, the More
  list tiles and the rail all draw icons that have only ever been eyeballed.
  One pass with the same measurement would say whether they are siblings or
  just look like it.
- **[?] Other v101-era map-only fixes may have the same blind spot.** The
  double-tap hardening was written for `#lmap` and read for two years as
  though it covered the app. Worth one pass over anything else pinned to the
  map element that arguably belongs to the whole app.
- **[D] `proc` looks like a dead duplicate of `fixes`.** Both are titled
  "Procedure fixes" in LAYER_META with different glyphs, and `proc` is in
  neither rail pool. Delete or keep — your call.
- **[D] Three triangles remain**: Enroute fixes, Danger & restricted, and
  `proc`. Danger keeps its exclamation so it reads apart; worth a look on the
  icon sheet to decide whether that is enough.
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
| renderMap's renderer sync never ran | v272 | Moved to top level; AST proof says the call resolves |
| Markers take 2–3 taps to hit | v272 | 44 px transparent pad, above the airway and route hit lines |
| Pad size is a guess | v272 | Tap section measures how far misses land, so the size comes off data |
| Vector offset reads nonsense at rest | v271 | `getScreenCTM` replaced with container rect + viewBox; no SVG geometry API |
| Clipped samples guessed at by magnitude | v271 | Detected against `_rings`, counted and dropped |
| Fat leg is a feeling, not a number | v271 | Container scale reported, 1.000 at rest |
| Pen readout reports the casing | v271 | Reads the visible leg and names which path it read |
| Waypoints float / legs miss their endpoints | v270 | `.rotfix` was inline-block; every label sat one baseline (15.00 px) below its own coordinates |
| Marker drift instrument reads the wrong box | v270 | Now measures the visible dot and the drawn leg end, not the 0×0 anchor |
| Drift measurement dies with the sync | v270 | Sampler moved out of `nmxRendererSync` onto its own rAF |
| Is the gap a fixed offset or a projection error? | v270 | Zoom band now printed, so constancy is read rather than inferred |
| Track-up rotation pivot | v270 | Was 15 px below the anchor; now on it. Fixed before rotation was ever flown |
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
| Per-frame vector sync switched OFF as a controlled test | v269 | One clock for vectors and markers; flag NMX_ZSYNC |
| Every dropped pin was named PIN 1 | v268 | Name checked against the route as well as the database |
| Flights mixed times, tracks and routes in one column | v267 | Three headed, counted sections |
| Airports, Strips, Terminal areas and Enroute fixes wore the wrong glyphs | v265 | Chart convention; Terminal areas stops drawing a mountain |
| Fast double tap broke the layout outside the map | v264 | touch-action:manipulation across .app; scroll net |
| UTC readout sat beside the clock rather than centred | v263 | Auto margins; title gives up its grow, scoped to this sheet |
| Times opened at full height; no date anywhere | v262 | Opens at the stamps; UTC date in the header |
| North needle redrawn from Danny's reference | v261 | Two triangles and a pivot hub; no letter, no red |
| Track-up merged into the app; rot.html retired | v260 | Off by default, filled two-tone needle |
| FPL panel opened through the middle of a row | v259 | Opening height snapped to whole chip rows |
| Zones rebuilt on every pan and zoom | v258 | Same diff, keyed on shape digest + paint |
| Markers destroyed and rebuilt on every pan and zoom | v257 | Diffed on view-only renders, keyed on position + icon html |
| Route rebuilt on every pan and zoom | v256 | View-only render, now that the renderer catches up |
| v253's sync found no renderer and re-clipped instead of re-projecting | v254 | options.renderer included; `_reset()` not `_update()` |
| Route fat and cut off DURING a pinch | v253, **completed v254** | Re-project every zoom frame; renderer padding 0.1 → 0.6 |
| Map diagnostics panel, so the next fix is measured | v252 | More > Diagnostics; renderer kind, pen, clip, transform |
| Stroke width scaled with the map during a zoom | v251 | non-scaling-stroke on every map vector |
| Route drawn fat and clipped: stale renderer bounds and transform | v250 | Renderers made to catch up before every draw |
| ~~Route and tracks left for Leaflet to carry~~ | v248, **reverted v249** | Exposed a stale renderer transform: clipped and fattened the route |
| Pinch hijacked by an armed drag-zoom; pinch also fired the two-finger step | v247 | Second finger ends the drag; tap told from pinch |
| Map re-zoomed itself; two gestures, two zoom ranges | v246 | Limits named on the map; one NMX_ZMIN/ZMAX |
| Times actions were two full-width rows | v245 | Two buttons on one line; Clear arms first |
| Downloads/Settings tiles: low glyphs, wrong shape, mismatched sizes | v244 | .tb recipe, gapped row, one 16-unit optical square |
| Times sheet covered the tab bar; no way to size or flick it away | v243 | Stops above the bar; grip drag; tap above to dismiss |
| Mark card's elevation read as a dash | v242 | Wrong sampler; terrainAt fetches the tile on demand |
| Leg colours never changed in flight | v241 | GPS sequences the live leg on waypoint passage |
| Mark card asked you to type coordinates and elevation | v240 | Name only; ground read from terrain |
| Mark dropped the waypoint at the screen centre, not at you | v239 | GPS fix, with a named and flagged fallback |
| Terrain shading window covered the map it was changing | v238 | Bottom bar, non-modal, slider full width |
| Tapping inside an airspace opened it instead of measuring | v237 | Lockout now outbids Leaflet's own `pointer-events:auto` |
| Downloads and Settings tiles said it twice | v236 | Symbol only; names moved to aria-label |
| Times — four stamps, sectors, filed to Flights | v235 | An activity like GPS; one engine run, a list of skids pairs |
| Switching sets turned your layers off | v234 | My v227 idea, reversed after flying it |
| Bars page ran to the screen edge | v233 | Wrapped in a padded page of its own |
| Rail symbols invisible on lit cells | v232 | Set tints the cell, not the glyph; column carries the set |
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
