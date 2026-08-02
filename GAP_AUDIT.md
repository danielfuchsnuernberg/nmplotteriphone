# NM Plotter — v262 vs iPhone/iPad build

**Status as of v175 · 2 Aug 2026**

Audit done by extracting datasets and capability probes from both files,
not from memory. Counts are measured.

**Gate scripts note (v153–v164):** the four gate scripts were not in the
handoff attachments, so they were rebuilt this session: `boot_test.js`,
`checkorder.js` (was `checkorder.py`, now AST-based via acorn), `mirror.py`,
`sheets.js`. The rebuilt boot test FAILS on the shipped v152 with the
`cardRwy` fault and PASSES on v164, and checkorder found the `REC_KEY`
collision and the `openAts` collision on its own. Feature harnesses added
this session: `verify153.js`, `conv.js`, `addpoint.js`, `ptwin.js`,
`fqcorr.js`, `airspace.js`, `prof.js`, `ctl.js`, `ats.js`, `mbz.js`,
`gpx.js`. Fifteen checks run before every ship.

**Release gate (from v133):** `node boot_test.js` loads the real file in
jsdom, reports anything that throws on load, then clicks every bottom tab,
every chrome control and every view. `node --check` only sees syntax — three
runtime faults shipped past it (TAB_MQ, ENROUTE, fqWin). Nothing goes out
on a FAIL. `python3 checkorder.py` also checks declaration order, listener
stacking, and CSS cascade order (a media rule declared before a base rule of
equal specificity loses to it — that defeated the tablet sheet width for 18
versions). `python3 mirror.py` asserts `.ted` mirrors `.gpsov` property for
property, so the 13 modal windows cannot drift apart. `node sheets.js`
enumerates every overlay so coverage is proved, not assumed.

---

## Progress

| Version | Closed |
|---|---|
| v175 | **Whole-file survey** (`survey.js`: dead functions, undefined calls, orphan `data-` hooks, unstyled classes, framing phrases, storage keys, unread datasets, silent catches). **Found:** two airway datasets — the map drew all 99 `PNG_ROUTES` while the Routes view read a 14-route `ATS_ROUTES` copy, so 85 airways were visible but unselectable. Single source now; copy deleted. Two dead functions removed. Everything else clean. |
| v174 | **Bug found:** GPS Follow recentred on every fix with no idea a gesture was in progress, so a fix landing mid-pinch yanked the map back — the zoom "jump". One shared busy test now covers touches on the map plus Leaflet's own zoom and drag (600 ms tail); Follow resumes on the next fix after the finger leaves; Centred keeps its one-shot flag until it is used. Plus a 6 px deadband, so a parked aircraft's GPS wander stops panning the map. |
| v173 | **Waypoint notes** (same NOTES store as the card, one builder two hosts), **bulk delete** in My waypoints (tick boxes, arm-then-fire, self-disarming), **calculator tab Edit mode** with arrows replacing the undiscoverable long press. **Stale framing removed:** the card footnote called weather, procedures, NOTAMs and fix coordinates "demo placeholders" — all four now real. |
| v172 | Active leg now reads as active: dark casing under a lighter amber, to-come dropped slightly. Flown/flying/to-come differ in colour, weight and opacity. **Gate fixed:** `mirror.py` only checked one direction, which is why `.tedw` could carry a max-height and scrolling body for versions while `.gpswin` had neither. Symmetric now for layout properties; catches all three when run against v152. |
| v171 | **Bug found:** `.gpswin` had no max-height, so a modal taller than the phone grew past it in both directions — title clipped above, advisory line clipped below, nothing scrollable. All six windows are now flex columns with a fixed header and a scrolling body, capped at the safe-area box. `.tedw` had it right all along. Coordinate block tightened to one box. |
| v170 | Layers menu grouped into Aerodromes / Points / Airspace / Routes / Weather, with an Other fallback so a layer added to `OVERLAYS` but not to a group cannot vanish. **Mislabel found:** the layer named "Controlled airspace" draws CTAFZ — *uncontrolled* advisory areas — and sat two rows above Control zones and Terminal areas. Renamed CTAF zones. |
| v169 | **FPL panel takes the height its content needs**, up to the grip's ceiling, eased over 140 ms. It was fixed at 72% of available height — on an iPad that left a third of the screen empty between the last route chip and the fuel strip. The grip can no longer be dragged past the content. |
| v168 | Terrain shading altitude is a slider (500–20,000 in hundreds, 30 px thumb in a 44 px strip) instead of four ± buttons. Readout and legend follow the thumb live without rebuilding the window; shading repaints throttled during the drag and once on release. |
| v167 | Home-screen icon: a real PNG mark (amber leg between two square waypoint markers) replacing the SVG letter-N, which iOS never reliably rendered. Page title no longer says "iPhone Layout Demo". |
| v166 | **Bug found:** Show on map was dead on every recorded flight. Two faults stacked — the sheet's action rows were wired after the recorded-track branch had already returned, so they had no handler at all; and the saved track was drawn by mapping the whole fix list, which threw on the null gap markers *inside* `renderMap` and took the map render down with it. Now drawn per segment, nulls filtered before fitBounds, header reads Recorded flight. |
| v165 | **Approach minima** — `PROC_META` lifted verbatim (5 procedures, all AYPY), verified identical to v262. Procedure tab rebuilt: procedures derived from the ENR 4.3 fixes, so all five fields with published approaches show theirs; minima shown where carried, stated plainly where not. **Fabricated data removed:** the NOTAM tab was rendering three hardcoded NOTAMs — serials, date ranges, one closing a runway to night ops — for any field with a FIELD_INFO entry. |
| v164 | **GPX export** — GPX 1.1 for recorded tracks (`<trk>`, reception gaps become new `<trkseg>`) and saved routes (`<rte>` + a `<wpt>` per point). Altitude converted feet→metres for `<ele>`. iOS share sheet where supported, download link as fallback. |
| v163 | **MBZ zones + editor** — lifted from v262 with Purari preloaded unchanged (128.4, 31 nm, SFC–7000, AIRAC 2/2018, verify before use). Folded into v161's zone rows via `zonesAt()`. Editor view under More with full validation. **Bug found:** saving an untouched zone moved its centre — DDM at a tenth of a minute is ~200 m, so Purari went 7.144614 → 7.145 on a no-op save. |
| v162 | **ATS routes** — `PNG_ROUTES` (99: 82 lower, 17 upper) lifted verbatim, verified identical to v262. Two layers, thumb-sized hit lines, per-leg track/distance/LSALT table (double-LSALT legs flagged, never resolved), appends to the working route. **Collision caught by checkorder:** `openAts` already existed — renamed `openAirway`. |
| v161 | **Airspace-driven frequencies** — v159's zones connected to the radio. Route points list the airspace they sit inside, legs list what they cross, the frequency window carries the zones over your position. Vertical limits parsed (SFC / ft / FL). **Bug found:** v158's corridor dropped fields beside the first and last legs — Tokua, 2 nm off the departure pad, fell in the half-mile end gap. |
| v160 | **Bug found:** terrain/flight profile drew small and centred — viewBox set from a container measured before layout, so `preserveAspectRatio="meet"` scaled to height and centred. Both painters now defer a width-less paint and repaint on real resize. Overlapping waypoint labels drop on collision, destination first. |
| v159 | **Controlled airspace** — `PNG_CTA` (9) + `PNG_TMA_SECTORS` (20) lifted verbatim, verified identical to the digit. Two layers, TMA envelopes suppressed while sectors draw, ceiling-over-floor sector labels from zoom 8. |
| v158 | **Next frequency from a route corridor**, adapted from v262's `nearestOnRoute`/`fqAheadList`. Green = inside the ring +2 nm, and only with a fix. Frequency window/HUD (NEXT + THEN), full route list, map approach ring. Corridor cached behind a bbox. |
| v157 | **Editable elevation on personal waypoints** — feet AMSL, blank clears rather than storing 0, editable from both hosts. **Two bugs found:** `cloudPullWaypoints` dropped `lb` and `el` on the way down; `saveMarks` was storing the transient `_d` sort distance to disk and to the cloud. |
| v156 | Saved-waypoint window and dropped-pin window now share one head (`ptHead`). Both gained a named distance fallback and self-exclusion from Nearest. |
| v155 | **Add point gets four scopes** — Nearest / All / Favourites / Recent. **Two bugs found:** `CAT_ORDER` had no `navaid`, so 32 navaids were unreachable from three surfaces; `cardFav` was never persisted, so every card star was lost on reload. |
| v154 | Minutes ↔ decimal hours boxes take typed input on either side; the conv wheel paths removed rather than left unreachable. |
| v153 | **Frequencies on every landing site** — was drawn only where FIELD_INFO had an entry (6 fields), so 569 strips and heliports had no way in. **Four bugs found:** `cardRwy` threw on 371 of 377 fields with runway data; a second `var REC_KEY` meant the recorder deleted the recent-searches list on every stop; `ddm()` had no minute carry (E146 60.0); `cardIdentity` printed the category twice. |
| v128 | **Enroute fixes** — 170 lifted, 168 after merging TESEM/WESFI into PROCFIX. Own layer, own category, airways on the card, both search surfaces. |
| v129 | Layers menu fix (not a gap item) — two columns don't fit a phone; labels were hard-clipping. Stacked. |
| v130 | Hold courses on wheels instead of a keyboard (not a gap item). |
| v131 | Memory line set as a feature card (not a gap item). |
| v152 | **Bug found:** Frequencies field picker hard-capped at 40 of 575 fields with no indication, and sorted twice so rank order was discarded. Both fixed. |
| v151 | Action sheets grouped with SVG icons; favourites use a filled star. |
| v150 | Calculator tabs reorderable (long press); new minutes ↔ decimal-hours converter. |
| v149 | Hold course on one wheel instead of two; headings now run 1–360 so north reads 360, not 000. |
| v148 | Layers popover 320 → 240 pt, measured off a screenshot rather than estimated. |
| v147 | **Bug found:** a single failed terrain tile hung the profile on "Loading terrain" forever — failed tiles read as ready. Now retried, then counted dead; profile draws with gaps and lowest-safe is withheld. |
| v146 | **My waypoints** view under More — list, search, sort, favourite, rename, delete, direct to, add to route. Favourites system is new. |
| v145 | **Bug found:** terrain profile blank in landscape — the HUD panel built the markup but never painted or wired it. Both hosts now share `drawTerr()`. Two false 'in the real build' strings removed. |
| v144 | Long-press the map to drop a pin — coordinates, ground elevation, nearest point, add to route / direct to / save. |
| v143 | **Bug found:** route lines drawn as rhumb (straight Mercator) while all numbers are great-circle — up to 699 m off. Now interpolated along the great circle, and drawn per leg state. |
| v142 | NavLog legs distinguish flown / flying / to come. |
| v141 | Route chips show point names; drag-to-reorder now persists, updates the map, and keeps the active point. |
| v140 | All 13 modal windows share one shell — `.ted` mirrors `.gpsov` property for property. Mirror + coverage checks added to the gate. |
| v139 | Profile axis text un-stretched — fixed viewBox against a 100% width was distorting 2.1× on iPad. |
| v138 | Terrain window — reference altitude, margin, legend, highest-in-view. **Bug found:** shading referenced planned cruise, not your actual level. |
| v137 | Layers popover 420 → 320, matching the phone. |
| v136 | **Overlay rule** written into the stylesheet — every tablet overlay is a modal card, side panel or anchored panel. Cascade-order check added to the gate. |
| v135 | Add point sheet: grouped + colour-tagged. **Bugs found:** all 170 enroute fixes rendered `undefined` (no name set in v128); tablet sheet width defeated by CSS cascade order since v116. |
| v134 | Landscape panel narrowed to 38%, layers to one column. **Bug found:** the landscape frequency panel had a hardcoded `'124.1'` area CTAF — fabricated data. Both hosts now share one builder. |
| v133 | **v132 was broken on load** — fixed. Added a jsdom boot test as a release gate. |
| v132 | Floating frequency window replaces the compact panel. **Bug found:** `allFreqFor` read only FIELD_INFO (6 fields) — the airfield pack has frequencies for **15**. Nine fields' published frequencies were in the data and never shown anywhere. Fixed. |

---

## 1. Missing navigation data — all present in v262, all liftable now

| Dataset | v262 | iPhone | What it is |
|---|---|---|---|
| ~~`PNG_ENROUTE`~~ | 170 | **168** | ~~Enroute significant points~~ — **done, v128** |
| ~~`PNG_ROUTES`~~ | 99 | **99** | ~~ATS routes/airways~~ — **done, v162** |
| ~~`PNG_TMA_SECTORS`~~ | 20 | **20** | ~~TMA sectors~~ — **done, v159** |
| ~~`PNG_CTA`~~ | 9 | **9** | ~~Control zones and areas~~ — **done, v159** |
| ~~MBZ zones~~ | yes | **yes** | ~~MBZ + editor~~ — **done, v163** |
| ~~`PROC_META`~~ | yes | **yes** | ~~Approach minima~~ — **done, v165** |
| `WMO` | yes | 0 | Weather-code table for model forecast data |

`PNG_NAVAIDS` is 37 in v262 vs 32 here — ours merges co-sited pairs
deliberately, so that difference is intended, not a gap.

## 2. Missing map layers

v262 has 16 overlay toggles. We have 11. Missing:

- ~~Enroute fixes~~ — **done, v128**
- ~~ATS routes and Upper ATS routes~~ — **done, v162**
- ~~Control zones (CTR / ATZ)~~ — **done, v159**
- ~~Terminal areas (TMA / CTA)~~ — **done, v159**
- ~~MBZ~~ — **done, v163**

## 3. Missing features

**Charts — the whole subsystem.** Georeferenced plate overlay, calibration,
`parsePlate` filename parsing, the IndexedDB chart store, and the
Airport/Departure/Arrival/Approach/Other procedure tabs. Our Charts view is
a picker over an empty set.

**Briefing side-profile** with the draggable crosshair scrubber.

**PDF export** — jsPDF is not inlined here at all.

~~**GPX export**~~ — **done, v164**.

**Measure tool** — I probed for this and got a false positive from my own
changelog text. It is genuinely absent.

**Weight and balance** — dropped from the list at Danny's request; he has a
separate app for it.

**Waypoint library** (cloud waypoint browser) and the **copy-route modal**.

**Village pin**, **MBZ editor**, **Open-Meteo model weather**.

## 4. What we have that v262 doesn't

Worth stating so the list isn't one-sided: label decluttering, the instrument
strip, the landscape HUD, fuel additions, approximate-geometry marking on
danger areas, navaid co-siting, the compact radio panel, the cruising-level
picker, cloud-base and airspeed calculators, and Holds.

---

## Suggested order

1. ~~`PNG_ENROUTE`~~ — **done in v128.**
2. ~~**`PNG_CTA` + `PNG_TMA_SECTORS`**~~ — **done in v159**, verified identical.
3. ~~**`PNG_ROUTES`**~~ — **done in v162**, verified identical.
4. ~~**MBZ**~~ — **done in v163**, with the editor.
5. ~~**GPX export**~~ — **done in v164**.
6. ~~**`PROC_META`**~~ — **done in v165**, verified identical.
7. **Charts** — the big one, still wants its own plan.
8. **PDF export** — jsPDF is not inlined in this build.
9. Smaller, unblocked: measure tool, waypoint notes, bulk delete, the
   empty gap in the iPad FPL panel — **done, v169**.
