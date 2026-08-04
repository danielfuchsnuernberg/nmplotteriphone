# NM Plotter — v262 vs iPhone/iPad build

**Status as of v268 · 5 Aug 2026**

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
| v268 | **Dropped pins get unique names.** `pinName()` checked only `DB`, but Add-to-route and Insert-as-next push into `ROUTE`, so every pin was named PIN 1. Now checked against both. |
| v267 | **Flights view split into Times / Flights / Routes**, each headed and counted, newest first within each section. Count line now reads routes · tracks · times. |
| v266 | **Marker drift instrumented.** Every zoom frame, one marker's on-screen position is compared with its projected position; the worst gap and the zoom it occurred at are reported in the diagnostics panel. No fix in this build — the number decides which fix. |
| v265 | **Four layer glyphs corrected to chart convention.** Airports takes the ICAO aerodrome symbol, Enroute fixes takes the triangle, Strips becomes a plain open circle, Terminal areas stops drawing the same mountain as Terrain shading. |
| v264 | **Native double-tap zoom disabled across the whole app**, not just the map — `touch-action` does not inherit, so the v101/v102 fix covered `#lmap` and nothing else. Plus a viewport-scroll recovery net. |
| v263 | **UTC readout centred** between the sheet title and the local clock, by auto margins rather than absolute positioning so it degrades rather than overlaps on a narrow header. |
| v262 | **Times sheet opens at the four stamps** rather than its full natural height, measured off the real chrome; drag floor lowered to 160 so the default stays reachable. **UTC date and time added to the header**, marked Z, beside the local clock. |
| v261 | **North needle redrawn**: two triangles meeting at a pivot hub, amber head and light grey tail. No letter in the glyph (the badge already labels itself) and no red (reserved for destructive actions). |
| v260 | **Track-up / heading-up merged into the app, off by default.** North arrow redrawn as a filled two-tone needle. `rot.html` and `editrot.py` retired — rotation is no longer a separate build. v262 has no equivalent. |
| v259 | **FPL panel opening height snapped to whole chip rows.** With no route it opens showing `+ Add`; with a route it never opens part-way down a waypoint. The grip stays pixel-exact and a hand-set height larger than the content is honoured. |
| v258 | **Zones diffed as well; a view change now rebuilds nothing.** One key covers markers (position + icon html) and paths (shape digest + paint). The zone frequency label needed no special case — its position depends on the viewport, so its key moves and it is replaced. |
| v257 | **Markers diffed rather than rebuilt on a view change.** Keyed on position plus icon html so a label change still makes a new marker; only applied to view-only renders, so click handlers closing over data can never go stale. |
| v256 | **A view change no longer rebuilds the route or the recorded tracks.** Retry of v248, this time with the renderer sync proven on the device (scale(1), clip covers map, 5 ms worst over 1950 re-projections). Markers and zones still rebuild. |
| v255 | **Re-projection cost instrumented.** The overlay is 253 paths, not the six previously assumed; the diagnostics panel now reports last and worst re-projection time so the per-frame cost is measured rather than asserted. |
| v254 | **v253's renderer sync corrected.** It collected only `map._renderer`, which Leaflet never creates once a renderer is passed as a map option, and it called `_update()` (re-clip) rather than `_reset()` (re-project). Both made v253 a no-op. |
| v253 | **Fat and clipped route during a pinch — first attempt.** Leaflet fakes a zoom with an outer CSS `scale()` on the `<svg>` element, which scales the pen and shrinks the drawn area; `vector-effect` cannot reach it. Now re-projects on every zoom frame, with renderer padding raised 0.1 → 0.6. |
| v252 | **Map diagnostics panel** (More > Diagnostics). Reports build, renderer kind, path/canvas counts, computed stroke-width and vector-effect on a real route path, container transform, clip rectangle vs map size, `_animatingZoom`. v262 has no equivalent. |
| v251 | **Map vectors keep their stroke width through a zoom** (`vector-effect:non-scaling-stroke`), matching ForeFlight's constant-weight legs. v250 fixed the weight after a gesture; this fixes it during one. |
| v250 | **Fat, clipped route diagnosed and fixed.** `SVG._update()` refuses to run while `_animatingZoom` is set, so the clip bounds and container transform went stale across overlapping zoom gestures — affecting new paths as much as old ones. Every renderer is now made to catch up at the top of `renderMap`. |
| v249 | **v248 reverted.** Leaving the route for Leaflet to carry exposed a stale SVG renderer transform and clip bounds: the route drew clipped in mid-air at low zoom and several times too thick at high zoom. The full rebuild was masking it. Back to the full rebuild until the in-place update is proven. |
| v248 | **Zoom part three: a view change no longer destroys the route or the recorded tracks.** `renderMap(viewOnly)` splits view changes from data changes; the two geometry-only groups are left for Leaflet to carry. Markers and zones still rebuild, for stated reasons. |
| v247 | **Zoom part two: our own gestures were setting the zoom mid-pinch.** An armed drag-zoom survived a pinch and resumed from the pre-pinch level when a finger lifted; and every pinch also fired the two-finger step zoom-out at its end. |
| v246 | **Zoom part one.** Map now names its own min/max zoom, so Leaflet's `_updateZoomLevels` can no longer call `setZoom()` on a layer add or remove; the drag gesture and the map share one range. Part two — the overlay rebuild on every view change — is identified, measured and not yet done. |
| v245 | **Times actions are two buttons on one line rather than two full-width rows**, saving ~90 px of a sheet you look past. Clear now arms then fires, since a smaller destructive control sitting beside the one you want costs more on a mis-tap. |
| v244 | **More sheet's two tiles rebuilt on the toolbar's own icon-button recipe.** Glyphs were sitting low (`display:block` missing), the joined pill said 'pick one state' for two destinations, and the two marks were different optical sizes. Settings mark unified across the sheet, toolbar and landscape HUD. |
| v243 | **Times sheet: stops above the tab bar, drag-resizable by a grip, dismissed by dragging under the threshold or tapping the map above it.** Drag lifted from the FPL panel rather than written fresh. |
| v242 | **Mark elevation now fetches its terrain tile instead of reading whatever the shading layer had decoded.** Works offline for a downloaded region; reads 'reading…' until the tile lands and redraws itself when it does. |
| v241 | **The live leg sequences from GPS.** Waypoint passage is the 90-degree crossing test, forward only, one waypoint per fix, guarded on fix age, groundspeed and cross-track distance. The leg colours were already correct — nothing was moving the index they read. |
| v240 | **The mark card is a name and a delete.** Coordinate editing and Move to map centre removed; elevation is no longer typed in either host, and is read from the terrain tiles and stated with its source. v262 still lets you type an elevation — the builds differ here on purpose. |
| v239 | **Mark drops the waypoint at the GPS fix rather than the map centre.** Falls back to the centre with no usable fix, but names and flags it differently so the two cannot be confused. A fix older than 15 s counts as absent. |
| v238 | **Terrain shading moved from a modal window to a non-modal bottom bar.** The slider and the terrain it shades are now on screen together. Legend, source line and the long advisory paragraph dropped from the control; the framing kept as a one-line caption. v262 still has this as a panel — the two builds now differ here on purpose. |
| v237 | **Measure tool: tapping inside an airspace now drops a point instead of opening the airspace.** The existing pane lockout never worked — Leaflet sets `pointer-events:auto` on interactive children, which is not overridden by `none` on an ancestor. The lockout now names the same four selectors under `#map.measuring`. |
| v236 | **The two tiles at the top of More are symbols only.** Downloads and Settings each carried a glyph and its name; every other control in the app picks one. Names moved to `aria-label`, height to `--mod-b`. |
| v235 | **Times — a new activity, with no equivalent in v262.** Four stamps left to right in the order flown: Engine Start, Skids Up, Skids Down, Engine Shut down. The record is one engine run holding a *list* of skids pairs, because one start-up covers more than one sector. Both totals carry h:mm and the decimal. Filed into `FLIGHTS` as a third kind of record beside a saved route and a recorded track. Nothing runs in the background and nothing needs to: a stamp is an absolute timestamp, elapsed is computed on read. **This is a gap in the other direction — the iPhone build now has something the desktop does not.** |
| v234 | **Reversed v227's set behaviour.** Switching VFR↔IFR no longer turns the leaving set's layers off — it changes which buttons the rail shows, nothing else. Every layer stays as left, in both sets, and is still lit on return. A control that changes what you can see has no business deciding what is drawn. |
| v233 | The Bars and sizing page ran edge-to-edge — its title was inset and its content was not, because the shared sheet body has no gutter and the page assumed one. Wrapped in its own padded page (`.dgrpad`) rather than padding the body for every sheet. Same lesson as the MY NOTES block in v177. |
| v232 | **Bug found:** v227 tinted the rail *symbol* with the live set's colour, but the rail fills the whole cell when a layer is on — an amber glyph on an amber fill, so every lit layer read as a blank tile. IFR's cells were amber too because the class meant to turn them blue was never applied to the column. The set now tints the cell (symbol stays dark) and the column carries the set as a class. |
| v231 | The first heading in a sheet body sat flush against the title bar (third instance of this fault after v222 and v205). Fixed as a **rule on `.dgrbody`** rather than a margin typed into one builder, so the next sheet inherits it. |
| v230 | The **Bars and sizing** row now matches every view row above it — tinted tile, symbol, label — instead of being a settings-style row with a chevron. Steel tint rather than one of the flying colours, signalling set-up rather than something reached for in the air. |
| v229 | The six layout editors collapse to a single **Bars and sizing** row in the More sheet, opening a page that groups them: four bars you arrange, two sizes you set. One tap deeper for the things touched least. |
| v228 | **Both rails are configurable.** The IFR set is five slots, stored under its own key and edited by the same screen; the rail editor now asks which rail at the top of itself, and picking there switches the live rail so you edit what you can see. CTAF zones dropped from the IFR default (a VFR structure in an IFR list) — put back in a slot if wanted. |
| v227 | **VFR / IFR sets on the layer rail.** The head button now means something: which set is live. VFR is the rail you configured; IFR is navaids, ATS routes, upper routes, procedure fixes, controlled airspace and TMA sectors. Two cells at the top of the open rail — no new button, both visible, no cycling; tapping the live set closes the rail as before. Switching turns the other set off. Colour carries it: amber VFR, blue IFR. |
| v226 | **Bug found:** the aircraft picker was a segment squeezed into the right of a label row and sized for two — four aircraft would not fit, the row would not wrap, and the whole Settings page scrolled sideways with every field going off screen. It is now its own full-width wrapping row, and `#setBody` cannot scroll horizontally. Unnamed profiles are numbered (Aircraft 2) rather than all reading Unnamed. |
| v225 | Two corrections. The build line belongs in `#sver`, a sibling pinned under the list — the element was there all along; only the code filling it went out in v217. v224's copy inside the list scrolled away with the content. And the airport page still jumped on tab switch: v221 measured the tab row's screen position, but the row is **sticky**, so that measurement is always zero once pinned. It now keeps the scroll position itself. |
| v224 | The build line is back at the foot of the More sheet (`NM Plotter iPhone · v224 · 2026-08-03`). It had been inside the reorder-editor block removed in v217 — the third thing that block was quietly holding, after `MORE_TILES` and `MORE_TINT`. Harness now asserts the string matches the file's own VERSION. |
| v223 | Frequencies loses its By name / By code switch — both lists are alphabetical by name and all the sort state is deleted. The sticky letter band carried the scroller's background but not its side padding, so the row underneath showed through at the gutters; it now spans them. The frequency ident column was 52 px, so five-character PG numbers wrapped onto two lines — 76 px and truncating. |
| v222 | Cloud's section headings sat directly on their field labels — both small uppercase, so they read as one doubled heading. Spacing added between a `.csec` and the field under it, and the labels stop repeating the heading (WEATHER › Worker URL; LIBRARY › Worker URL, Key). |
| v221 | Changing tab on the airport page no longer jumps to the top: the tab row's screen position is measured before the rebuild and restored after, clamped to what the new tab can scroll. Tabs and Procedure sub-tabs are also **pinned** to the top of the scroller. |
| v220 | The aircraft picker was a row of pills with a floating round plus — shapes used nowhere else in the build. It is now a **segment in a labelled row**, the same control every other Settings choice uses, and **Add an aircraft** is a full-width row with a label rather than a lone symbol. Remove names the registration it will remove. |
| v219 | **Both Cloudflare worker URLs are under Cloud** — the weather proxy moved out of Settings to sit beside the library worker, each labelled for its job. Settings keeps a pointer rather than a second input; two boxes writing one setting is a bug waiting for the day they disagree. |
| v218 | The full-screen airport page gains the **diagram square** beside the ident, matching the map card's thumbnail; the header is a row rather than a stack. Empty it shows the field's kind (RWY / STRIP); when a plate exists under Airport it becomes a button reading DIAGRAM that opens the plate viewer. |
| v217 | **The reorder editor is removed entirely** — four versions of a feature nobody asked for. The More list is grouped Flying / Planning / Data in the app's own order, fixed. The layout editors (bottom bar, activity bar, layer rail, card actions, type scale, metrics) are now always visible at the bottom of the sheet rather than behind an Edit mode. All stored order, group-override and hide state deleted. |
| v216 | **The drag is gone.** Reordering is now tap-to-lift, tap-to-place: tap a row's handle, every other row offers *Put here*, tap one to land it — including a bottom-bar slot, which swaps. Cancel on the banner or the handle again puts it back. All clicks, delegated on the list (a rebuild was killing handlers bound to the old buttons — which is why the first attempt did nothing at all). |
| v215 | **Bug found:** the drag's hit test used `elementFromPoint` at the middle of the *window*, but the More sheet is a right-hand panel — so it was testing the map behind it and found nothing most of the time. Now uses the finger's own x. Views can also be dragged **between** groups now and stay there; Reset restores both order and groups. |
| v214 | **Reverted v213's list filter** — taking bar views out of the list made Charts vanish from where you look for it. Reachable elsewhere is not the same as being where expected. |
| v213 | **Slot editor**, in the reference shape: the bottom bar is the first group in the More editor, with the same grip. Dragging a view onto a slot swaps — the displaced view returns to the list. A view in the bar no longer also appears in the list. Writes `tabCfg`, the same store the old Edit-bottom-bar screen used. More keeps the last slot and cannot be moved. |
| v212 | **Reset to the default order** in the More editor, armed before it fires. From the same reference: Cancel/Save deliberately not copied (edits commit as you go, nothing destructive to abandon); the bottom-bar slots as the list's first group — the slot editor — logged as its own round of work. |
| v211 | **Regression fixed (mine, v206):** wrapping the More-list label so it could truncate made it inherit the row's centring, so every name jumped to the middle — `text-align:left`. Edit mode now has **one grip and a drag** instead of two arrows and an eye; the row moves as you cross another, within its group only. **Hiding removed entirely** — anything hidden before is back. |
| v210 | The Procedure tab is the document list and nothing else — the ENR 4.3 minima block (DA, MDA, glidepath, TCH, threshold elevation) and the fix table are no longer rendered on the card. The dataset is untouched and the IFR procedure picker still reads it. |
| v209 | The **By name / By code** control is gone from Airports — the list is always alphabetical by name, using an explicit comparator rather than the shared setting, so nothing switched elsewhere can reorder it. The letter headings derive from the same explicit key. Frequencies keeps its control for now. |
| v208 | Airport card built to spec: **Nearest fields** (five closest, distance and bearing, each opens that field) and **Light** (today plus three days, first/last light) on Info; **Procedure sub-tabs** Airport/Departure/Arrival/Approach/Other with counts, all five always shown; **NOTAM links to NiuSky Pacific**; elevation added to the page header. Weather TAF/Daily/Winds deferred pending the v262 model check. |
| v207 | Airports (All) and the frequency list are broken up alphabetically: a **sticky letter heading** so the letter you are in stays on screen, and an **A–Z strip** above the list that jumps to it. The letter derives from the same key the list is sorted by, so headings cannot disagree with the order. Nearest, Recent and any filtered list get no headings — they are not alphabetical. |
| v206 | More sheet edit mode rebuilt: the row label was a bare text node (so it ran under the buttons instead of truncating) and now truncates properly; the three outlined buttons became one joined group of two arrows and an eye; a hidden view dims and carries a HIDDEN tag rather than its button changing to Show. |
| v205 | **Procedures is the document list**: Airport / Departure / Arrival / Approach / Other first, with the ENR 4.3 fixes and minima moved below under their own heading. **Frequency headings stop repeating themselves** — a group holding one row whose label adds nothing (GROUND / GND) collapses to a single line; distinctive labels and multi-row groups are unchanged. |
| v204 | **Fuel and contact is one record**: a single editor holding Company, Phone, Fuel and Notes, headed by the field's ident. The card shows company over number; the number is a real `tel:` link so iOS raises its own Call/Cancel sheet, dialling digits only while displaying what was typed. The **TWR pill under the card title is gone** — every frequency is on the Info tab, grouped. |
| v203 | Card frequencies grouped by call type (Information / Clearance / Ground / Tower / Approach / Area / Common, with Other catching anything unmatched). Runway card now names the favoured end — **Best wind**, only when that end actually has a headwind — with head and cross split onto separate lines and the wind used stated above them. |
| v202 | Leg states now differ by **colour**, not by weight of one amber: magenta flying (matching the Garmin's active leg), cyan to come, grey dashed flown. Casing thinned to 4–5 px at 40% and dropped entirely on flown legs. Amber stays on the waypoint markers. |
| v201 | Area CTAF was showing the zone's array index ("2") as if it were a name — v262 shows no number at all, so nor does this; HF now joined with middots as v262 does. The six-line explanation under the route list folds behind **What am I looking at?**, leaving one line: green now · amber active waypoint · tap to copy · advisory only. |
| v200 | **Bug found:** the fuel wheel was headed `20:00Z` — `qkPaintVal` had no branch for it, so nothing was written and the element kept the ETD from the previous open. Fuel now has its own readout in kilos, painted before the frame rather than in a rAF, and any control the painter does not recognise clears the readout instead of inheriting the last one's answer. |
| v199 | **Reversed v197's panel floor.** Counting the header block plus a second route row stopped the grip going small — worse on the device than what it replaced. Back to v191's floor: the panel's own furniture plus one row. |
| v198 | **Usable fuel is now a per-aircraft field** (default 540 kg, BK117) rather than a constant — the fleet holds three airframes and a full tank is not the same figure twice. The wheel stops at the tank, Full means it, and the save clamp uses the same reader. |
| v197 | Fuel on board moved to a wheel (tens, 0–1,200 kg, quick steps, Clear for unknown) and now reads only the wheel — it could previously fall through to whatever was left in the text box. **Open the card** added to the route-point sheet. FPL floor now measures the header block inside the body, so the panel no longer opens with a route point sliced in half. |
| v196 | **Bug found:** hold-to-reorder was dead. The panel body became a scrolling container in v169, iOS claims the gesture and fires `touchcancel`, which was wired straight to `dragEnd` — so the 260 ms hold never armed. Chips now set `touch-action:none`, and a cancel before the hold arms only stands the timer down. Third v169-era regression. |
| v195 | The FPL panel now stays open behind the windows it launches (registration, type, altitude, ETD); Procedure and Routes still take it, being whole views. **Fuel on arrival is now the button that sets fuel on board** — same `AC.fob` the Fuel view uses, blank clears to unknown rather than zero. Header wiring moved to one delegated listener. |
| v194 | **Bug found:** the frequency list carried a third, invisible ordering (a majors-first "rank") inside its two groups, so the alphabet restarted partway down with nothing on screen explaining it — it read as no sorting at all. Rank removed; two groups only, each with a heading and a count. |
| v193 | Airports (All) and Frequencies were ordered by ICAO code, hiding Goroka under G-for-AYGA. **By name** is now the default with **By code** as a choice — one setting shared by both lists. Leading punctuation is skipped for sorting; Frequencies still groups fields that have them first. |
| v192 | **Bug found:** the destructive-row modifier `dgr` collided with the map's danger-area class (`position:absolute`, red border, `pointer-events:none`), so every Remove row since v184 was absolutely positioned against the page and **unclickable**. Renamed `arow-del`. `checkorder` gained a CSS modifier/component collision check that catches it. |
| v191 | Four iPad layout faults: FPL floor was a flat 250 while the panel's own chrome exceeded 200 (chips sliced) — floor now measured as chrome + one row, drag included; route chip sheet rebuilt with icons and headed groups; measure chip centred over the uncovered map so it stops colliding with the frequency window; `.agrp` and the tablet sheet now clip, so the leg card's remove row cannot escape. |
| v190 | **Regression fixed (mine, from v169):** the FPL grip could no longer be dragged past the content height, and the panel clipped its last row. Cap removed — the grip runs to full height again; once dragged, the hand-set height wins permanently. Clipping had two causes: a 2 px allowance (a row's bottom margin falls outside `scrollHeight`) and measuring in the same tick as the redraw. |
| v189 | **Fuel and phone per field** — free text you own, same idea as user frequencies; shown on the card and the airport page, listed in the summary only when set. **Holds** now carry their frame (°M/°T) and the Use-GPS-track suggestion is converted before storing; the entry logic needed no change because it works on differences. |
| v188 | **Bug found:** the follow deadband was six PIXELS, and a pixel is a distance that changes with zoom — wide out it suppressed everything, zoomed in it was a few metres, so GPS wander cleared it on every fix and the map jittered close in. Deadband now in both units (6 px AND 10 m of real movement). Corrections over 60 px glide over 0.35 s instead of teleporting. |
| v187 | Closing a card, leg or zone sheet re-centres the subject in the now-full map — the last focused subject is remembered and the same focus runs again on every close path. Guard: a subject panned off the map since opening is left where it is. |
| v186 | More sheet capped at 340 px (was 59%, most of an iPad). Views grouped Flying / Planning / Data with an Other fallback; **Edit** now reorders within a group and hides views, both persisted, and hosts the six layout editors moved out of Settings. **Aircraft profiles**: a fleet with per-airframe reg/type/cruise/burn/reserve/altitude; fuel on board deliberately excluded as it belongs to the flight. |
| v185 | **Mag var** on the point window, airport page and leg card, computed from WMM at that position. **Bug found:** opening a card panned the map to keep the subject in sight, but Follow dragged it straight back on the next fix — the "snaps back to centre" behaviour. Focusing now drops Follow to Centred, with the locate button and a toast saying so. |
| v184 | **The sheet rule**, written into the stylesheet: facts first; every action group headed; a destructive action is the last row of the group it acts on, not a group of its own; units beside the number, not under it; the body scrolls. Applied to the leg card and the waypoint window, which both had a floating unheaded delete box. |
| v183 | **Keep the subject in sight.** Opening a card, leg, airway or airspace sheet now pans the map so the subject sits in the middle of the part the panel is *not* covering. Panels are measured, not assumed; the trim side is chosen by which leaves the most map area (a full-width bottom sheet and a right-hand side panel resolve correctly). Never zooms; no-ops within 4 px. |
| v182 | **Full-screen airport page.** Picking a field from Airports opens it as a page — header (ident, name, town, coordinates, first/last light), a summary of what is actually held (elevation, runways, procedures, latest weather, airspace, all frequencies), and the same five tabs. One card, two hosts: the tab bodies and their wiring are shared, `wireCardBody(sel, f)` replacing six blocks that named `#cardBody`. Show on map hands the field to the side card. |
| v181 | **Magnetic courses via the World Magnetic Model.** WMM2025 official coefficients (NOAA/NCEI + BGS, from the published COF file) with secular variation; declination computed from lat/lon/date anywhere. Validated against an independent implementation at 12 points across PNG, Australia, Peru, the equator and both poles — worst disagreement 0.0002°. Settings switch Magnetic/True, magnetic default, every course carries °M or °T. AIP tracks, METAR wind and hold courses deliberately not rotated. |
| v180 | **Bug found by real data:** the checklist parser used one regex with an alternation, so it split at the leftmost separator of any kind — `N1 - 10% ... Push Power forward` split at the hyphen and made the item `N1`. Separators are now tried in order of authority (dots, tab, spaced hyphen) across the whole line, and a line opening with a hyphen is an aside. Regression cases taken from P2-LAW. |
| v179 | **Checklists** — two kinds. A **list** you own, edited as text (sections with `#`, actions after dots/tab/spaced hyphen), re-parsed on save. A **PDF** stored whole in IndexedDB (new `files` store, db v2) and opened in the system viewer rather than drawn inline. Text size A−/A+ 70–200%, remembered. Ticks deliberately not persisted. |
| v178 | **Route leg card** — tap a leg (18 px hit line) for distance, course, highest ground and lowest safe, plus Fly this leg / Direct to leg end / Remove leg end. Course is **true** (no variation data exists in this build); **Lowest safe** replaces ForeFlight's Mountainous yes/no, which would need a designated-area chart we don't hold. |
| v177 | My notes block ran to the window edge while ROUTE and WAYPOINT beside it were inset — the card body pads itself, the point-window body does not. Block is wrapped; the wrapper takes the `--edge` inset in the window only. |
| v176 | **Measure tool** (ruler on the rail; great-circle segments, per-leg bearing/distance, running total, marker pane locked out while measuring) and **waypoint library** (browse the cloud, held rows untickable, pull only what you tick). **Copy route struck off, not built:** the flight sheet has had Duplicate since it was written. |
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

~~**Measure tool**~~ — **done, v176**.

**Weight and balance** — dropped from the list at Danny's request; he has a
separate app for it.

~~**Waypoint library**~~ — **done, v176**. ~~Copy-route~~ — already existed as Duplicate.

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
