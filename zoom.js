/* zoom — the map's zoom range, and a measured baseline for the overlay
   rebuild that makes the layers feel unglued.

   FINDINGS THIS LOCKS IN (v246):

   1. Leaflet decides min/max zoom from the layers on the map whenever
      options.minZoom / options.maxZoom are undefined. _updateZoomLevels
      runs on EVERY layer add and remove and can end in a setZoom() you
      did not ask for. Both limits are named on the map now, so that
      branch is unreachable.

   2. The double-tap-drag gesture carried its own private clamp of 4..17
      while the map's ceiling came from whatever raster happened to be
      on. Two opinions about where zoom stops is how a gesture ends
      somewhere the next gesture will not go. One constant now.

   3. THE BIG ONE, NOT FIXED HERE: renderMap() calls clearLayers() on
      every overlay group and rebuilds all of it, and it is bound to
      moveend/zoomend/resize/viewreset. So every pan and every zoom
      destroys and re-creates the whole overlay. This harness records
      that as a number so the change that fixes it can be shown to have
      fixed it, rather than felt to have. */
const fs = require('fs');
const FILE = process.argv[2] || 'work.html';
const src  = fs.readFileSync(FILE, 'utf8');
/* Counting literal occurrences in the raw file counts them in COMMENTS
   too, and this harness has now failed three times against code that
   was correct because the comment explaining the rule quoted the rule.
   `code` is the file with /* *\/ comments stripped: use it for counting
   declarations, and `src` for everything else. */
const code = src
  .replace(/<!--[\s\S]*?-->/g, '')      /* the CHANGELOG lives in one of these */
  .replace(/\/\*[\s\S]*?\*\//g, '');

const fails = [], passes = [], notes = [];
function check(name, cond, detail){
  (cond ? passes : fails).push(name + (cond || !detail ? '' : '   [' + detail + ']'));
}

/* ---------- 1. one range, named on the map ---------- */
check('the app declares its zoom range once',
      /var NMX_ZMIN = 4, NMX_ZMAX = 17;/.test(src));
check('the map is built with both limits named',
      /minZoom:NMX_ZMIN, maxZoom:NMX_ZMAX/.test(src));
check('so Leaflet can never set the zoom from its layers',
      !/L\.map\(host, \{[\s\S]{0,400}?\}\)/.test(src) ||
      /minZoom:NMX_ZMIN/.test(src));
check('the drag gesture clamps to the same range, not its own',
      /Math\.max\(NMX_ZMIN, Math\.min\(NMX_ZMAX, dz\.want\)\)/.test(src));
check('no hard-coded 4..17 survives in the gesture',
      !/Math\.max\(4, Math\.min\(17,/.test(src));
check('free zoom is on, so a pinch lands where you left it',
      /zoomSnap:0/.test(src));
/* worldCopyJump is one of Leaflet's own option names, so it appears in
   the inlined library whatever we do. Only OUR map options matter. */
const mapOpts = (src.match(/L\.map\(host, \{[\s\S]*?\}\)/) || [''])[0];
check('the map options were found', mapOpts.length > 0);
check('and the antimeridian re-projection is not among them',
      mapOpts.indexOf('worldCopyJump') < 0);

/* ---------- 2. the rebuild, measured ---------- */
const clears = (src.match(/\.clearLayers\(\)/g) || []).length;
const idle = src.match(/LMAP\.on\('([^']+)', onIdle\)/);
const idleEvents = idle ? idle[1].split(/\s+/) : [];

check('the idle handler is still bound to view events',
      idleEvents.length > 0, idleEvents.join(','));
notes.push('clearLayers() appears ' + clears + ' times in the file');
notes.push('and runs on: ' + idleEvents.join(', '));

/* This is the baseline, not a target. It is asserted so that the day
   the overlay stops being rebuilt on view change, this harness fails
   and has to be updated deliberately — rather than the improvement
   sliding in unmeasured, or sliding back out later. */
/* ---------- v256: the view-only render is back, on a fixed renderer ----
   v248 tried this and the route came out clipped and fat - because the
   renderer was never catching up, not because the idea was wrong. v254
   fixed the sync (right renderer object, _reset not _update) and v255
   measured it on the device: scale(1), clip covers the map, worst
   re-projection 5 ms over 1950. So the reason to rebuild the route on
   every pan and zoom is gone. */
check('a view change asks for a view-only render',
      /try \{ renderMap\(true\); paintShip\(\); nmxDraws\+\+; \}/.test(src));
check('renderMap knows the difference', /function renderMap\(viewOnly\)/.test(src));
check('the route and the tracks are handed a stub on a view change',
      /leg:NMX_KEEP, trk:NMX_KEEP \};/.test(src));
check('the stub swallows both clearing and adding',
      /NMX_KEEP = \{ addLayer:function\(\)\{ return this; \},[\s\S]{0,90}clearLayers:function\(\)\{ return this; \} \}/.test(src));
check('renderMap is never handed to a listener bare',
      !/addEventListener\('[a-z]+', renderMap\)/.test(code));
check('and the panel counts view-only renders, so this is visible',
      /L1\('View-only renders', NMX_SYNC\.viewOnly\)/.test(src));

/* the cost this leaves in place, recorded rather than remembered */
notes.push('a view change still rebuilds G.mk (markers) and G.box (zones);'
         + ' the route and tracks are now left to Leaflet');

/* ---------- v250: the renderer is made to catch up ----------
   SVG._update() is where the container transform and the clip bounds
   are recomputed, and it refuses to run while _animatingZoom is set.
   Miss it and paths keep the previous zoom's scale (fat lines) and the
   previous zoom's clip rectangle (route cut off in open ground) -
   whether they are old paths or brand new ones. */
/* v272: this used to assert the exact string
     if (typeof nmxRendererSync === 'function') nmxRendererSync();
   and passed for eighteen versions against a call that could never
   run - the name was declared inside bootMap and renderMap is not, so
   typeof returned 'undefined' and the guard swallowed it. Source text
   existing is not the same as source text executing, and a harness
   that only greps cannot tell the two apart. Now: the declaration must
   be at TOP LEVEL, where renderMap can see it, and the call must carry
   no guard at all. */
check('the renderer sync is declared at top level, in renderMap\'s scope',
      /\n  function nmxRendererSync\(\)\{/.test(code));
check('renderMap forces the renderers to update, unguarded',
      /\n    nmxRendererSync\(\);/.test(code) &&
      !/typeof nmxRendererSync === 'function'/.test(code));
check('and does it BEFORE anything is cleared or drawn',
      src.indexOf('nmxRendererSync();') < src.indexOf('G.box.clearLayers();'));
/* Two call sites, both deliberate: once at the top of renderMap so
   every draw starts from a caught-up renderer, and once per zoom frame
   so the pinch itself is right. */
check('the renderer sync has exactly its two call sites',
      (code.match(/nmxRendererSync\(\);/g) || []).length === 2,
      String((code.match(/nmxRendererSync\(\);/g) || []).length) + ' calls');
check('the animating flag is dropped for the call and put back',
      /var was = LMAP\._animatingZoom;[\s\S]{0,60}LMAP\._animatingZoom = false;/.test(src) &&
      /LMAP\._animatingZoom = was;/.test(src));
check('every renderer is covered, not just the default one',
      /LMAP\._paneRenderers/.test(src));
check('bounds are recomputed and every path re-projected',
      /r\._update\(\); r\.fire\('update'\);/.test(src));
check('and the whole thing cannot throw into the render',
      /function nmxRendererSync\(\)\{[\s\S]{0,200}try \{/.test(src));

/* ---------- v251: the pen does not scale with the map ----------
   Leaflet scales the SVG container during a zoom, which scales the
   stroke with it - the legs swell through the gesture and snap back.
   ForeFlight's are the same weight at every zoom. non-scaling-stroke
   applies the transform to the geometry and not to the pen. */
check('map vectors keep their stroke width under the zoom transform',
      /\.leaflet-overlay-pane svg path\{vector-effect:non-scaling-stroke\}/.test(src));
check('it is one rule covering every vector, not one per layer',
      (code.match(/vector-effect:non-scaling-stroke/g) || []).length === 1);
/* count DECLARATIONS - `vector-effect:` with the colon - not every
   mention of the property name. The diagnostics panel labels a readout
   with it, which is a string, not a rule. */
check('and nothing else sets vector-effect to fight it',
      (code.match(/vector-effect:/g) || []).length === 1,
      String((code.match(/vector-effect:/g) || []).length) + ' declarations');

/* ---------- v253: the pinch itself ----------
   Measured on the device: the fat stroke and the cut-off route happen
   ONLY while two fingers are still down. Leaflet fakes a zoom with a
   CSS scale() on the <svg> element - an outer scale that takes the pen
   with it and shrinks the drawn area. vector-effect cannot reach an
   outer CSS scale, which is why v251 did nothing. */
/* v269: the per-frame sync is OFF as a controlled test. Two clocks for
   one coordinate - vectors re-projected per frame, markers on Leaflet's
   schedule - is the standing suspect for the leg not meeting its
   endpoint. The wiring stays, behind one flag, so it is one word to put
   back rather than a rewrite. */
/* v276: this asserted `= false` - the value the EXPERIMENT happened to
   need - so the harness would have failed the day the experiment ended,
   which it did. A flag's value is a decision, not a contract; what the
   harness should hold is that the flag still exists and still gates the
   wiring, so it stays one word to change either way. The value itself
   is reported as a note. */
check('the per-frame sync is switchable, not deleted',
      /var NMX_ZSYNC = (true|false);/.test(src) &&
      /if \(NMX_ZSYNC\) LMAP\.on\('zoom', function\(\)\{/.test(src));
notes.push('per-frame vector re-projection is '
     + (/var NMX_ZSYNC = true;/.test(src) ? 'ON' : 'OFF'));
check('and the renderMap-time sync is untouched',
      /\n    nmxRendererSync\(\);/.test(code));
check('one frame at a time, so zoom events cannot queue up',
      /if \(zsync\) return;[\s\S]{0,120}requestAnimationFrame/.test(src));
check('the drawn area is padded well past the viewport',
      /renderer: L\.svg\(\{ padding: 0\.6 \}\)/.test(src));
check('which is more than the 1.2x a default padding gives',
      !/L\.svg\(\{ padding: 0\.1 \}\)/.test(src));

/* ---------- v254: the sync now finds the renderer, and re-projects ----
   Two faults in my own fix, both of which made v253 a no-op:
     - Leaflet resolves map.options.renderer BEFORE map._renderer, and
       once one is passed as a map option _renderer is never created.
       The sync collected only _renderer and _paneRenderers.
     - _update() re-clips but does not re-project; _project() is only
       called on zoomend. So it was re-clipping the previous zoom's
       geometry. _reset() does bounds, transform AND re-projection. */
check('the sync looks at the renderer passed as a map option',
      /add\(LMAP\.options && LMAP\.options\.renderer\);/.test(src));
check('and still covers the default and the pane renderers',
      /add\(LMAP\._renderer\);/.test(src) && /for \(var k in pr\) add\(pr\[k\]\);/.test(src));
check('it re-projects rather than only re-clipping',
      /if \(typeof r\._reset === 'function'\) r\._reset\(\);/.test(src));
check('with _update kept only as a fallback',
      /else if \(typeof r\._update === 'function'\)\{ r\._update\(\); r\.fire\('update'\); \}/.test(src));
check('the diagnostics say which renderer was found and its padding',
      /L1\('Found via', rsrc\)/.test(src) && /L1\('Padding'/.test(src));

/* ---------- v257: the markers are diffed, not rebuilt ---------- */
check('there is a marker key, and it carries the icon html',
      /return 'm\|' \+ ll\.lat\.toFixed\(6\)[\s\S]{0,80}\(ic && ic\.html\)/.test(src));
check('position alone is not the key - a label change must make a new marker',
      /ic\.html/.test(src));
check('the diff is only used on a view-only render',
      /if \(viewOnly\)\{[\s\S]{0,900}?mk:nmxMkDiff\(G\.mk, 'mk'\)/.test(src));
check('clearLayers is a no-op inside the diff',
      /clearLayers: function\(\)\{ return this; \}/.test(src));
check('anything already on the map is kept, not re-added',
      /if \(k && prev\[k\]\)\{ seen\[k\] = prev\[k\]; NMX_SYNC\[tally \+ 'Kept'\]\+\+; return this; \}/.test(src));
check('and whatever was not wanted this time is removed',
      /for \(var k in prev\)\{[\s\S]{0,140}real\.removeLayer\(prev\[k\]\)/.test(src));
check('the commit runs at the end of the render',
      /if \(G\.mk && typeof G\.mk\.commit === 'function'\) G\.mk\.commit\(\);/.test(src));
check('and the panel counts kept, added and removed',
      /L1\('Markers kept'/.test(src) && /L1\('Markers added'/.test(src) &&
      /L1\('Markers removed'/.test(src));

/* ---------- v258: the zones are diffed too ---------- */
check('one key serves markers and paths',
      /function nmxLayerKey\(l\)\{/.test(src));
check('a path key digests its shape rather than its whole vertex list',
      /return 'p\|' \+ n \+ '\|' \+ at\(0\) \+ '\|' \+ at\(n >> 1\) \+ '\|' \+ at\(n - 1\)/.test(src));
check('and includes the paint, so a colour change makes a new path',
      /\+ '\|' \+ \(o\.color \|\| ''\) \+ '\|' \+ \(o\.weight \|\| ''\)/.test(src));
check('the zone group goes through the diff on a view change',
      /box:nmxMkDiff\(G\.box, 'bx'\)/.test(src));
check('and its commit runs too',
      /if \(G\.box && typeof G\.box\.commit === 'function'\) G\.box\.commit\(\);/.test(src));
check('the two groups are tallied separately',
      /NMX_SYNC\[tally \+ 'Kept'\]\+\+/.test(src) &&
      /bxKept:0, bxAdded:0, bxGone:0/.test(src));
check('the panel reports the zone counts',
      /L1\('Zones kept'/.test(src) && /L1\('Zones added'/.test(src));

/* ---------- v266/v270: is a marker actually glued? ----------
   "Glued" has an exact meaning: a marker's pixel on screen should be
   the pixel its lat/lon projects to, every frame. The gap between those
   two IS the floating, in pixels.

   REWRITTEN IN v270, because the v266 version of this section asserted
   the old sampler line by line and would have gone on passing while the
   sampler measured the wrong thing in a place it could not run.

   Two faults it did not catch, and now does:

     - the sampler lived INSIDE nmxRendererSync, so turning the sync off
       turned the measurement off with it. It must be reachable on its
       own.
     - it read .nmx-di, which is 0x0 with overflow:visible. That box is
       pinned to the projection by construction and can only ever report
       success. The number that matters is the VISIBLE dot. */
check('the sampler is its own function, not part of the renderer sync',
      /\n  function nmxDriftSample\(\)\{/.test(src));
check('and it is driven by the map, on its own frame',
      /LMAP\.on\('zoom move zoomend moveend viewreset'[\s\S]{0,320}?nmxDriftSample\(\)/.test(src));
/* on `code`, not `src`: the replacement COMMENT inside that function
   names nmxDriftSample, and a harness that counts source literals
   counts them in comments too. Third time that has bitten. */
/* bounded by the NEXT top-level declaration, not by `var settle` -
   that lived next door only while the function was inside bootMap. */
const syncBody = (code.split('function nmxRendererSync(){')[1] || '')
                   .split('\n  function ')[0];
check('and it is NOT inside nmxRendererSync any more',
      syncBody.length > 0 &&
      syncBody.indexOf('nmxDriftSample') < 0 &&
      syncBody.indexOf('mkDrift') < 0);
check('drift is measured against the projection, not by eye',
      /LMAP\.latLngToContainerPoint\(pick\.l\.getLatLng\(\)\)/.test(src));
check('the marker sample reads the VISIBLE dot, not the 0x0 icon box',
      /querySelector\('\.fld i'\)/.test(src));
check('the old icon-box number is kept, so the two can be compared',
      /pick\.l\._icon\.getBoundingClientRect\(\)/.test(src) &&
      /if \(bg > D\.box\) D\.box = bg;/.test(src));
/* v271: both of these were rewritten because the thing they asserted
   was itself the fault. The old pair proved the vector end came from
   getScreenCTM and that a 120 px cap was applied - and BOTH of those
   were the bug. A harness that pins an implementation cannot tell you
   the implementation is wrong; it can only tell you it has not
   changed. These assert the properties instead. */
check('the vector end uses NO SVG geometry API',
      !/getScreenCTM/.test(code) &&
      !/getPointAtLength/.test(code) &&
      !/getTotalLength/.test(code));
check('it maps the drawn point through the container rect and viewBox',
      /svg\.getBoundingClientRect\(\)/.test(src) &&
      /getAttribute\('viewBox'\)/.test(src) &&
      /sr\.left \+ \(pE\.x - vx0\) \* kx/.test(src));
check('clipping is DETECTED against _rings, not inferred from magnitude',
      /rE\.x !== pE\.x \|\| rE\.y !== pE\.y/.test(src) &&
      /D\.vClip\+\+/.test(src));
check('and no magnitude cap survives anywhere in the sampler',
      !/Math\.abs\(vx\) < 120/.test(code));
check('the container scale is reported, so the fat pen is a number',
      /D\.scale = kx;/.test(src) && /L1\('Container scale, last'/.test(src));
check('the pen is read off the leg, not the casing under it',
      /String\(l\.options\.color \|\| ''\)\.toLowerCase\(\) === '#0a0e13'/.test(src) &&
      /L1\('Pen read from', pSrc\)/.test(src));
check('both worst cases carry the zoom they happened at',
      /D\.wAt = 'z' \+ z;/.test(src) && /D\.wvAt = 'z' \+ z;/.test(src));
check('the zoom band sampled is recorded, so constancy is readable',
      /if \(!D\.zlo \|\| z < D\.zlo\) D\.zlo = z;/.test(src) &&
      /if \(z > D\.zhi\) D\.zhi = z;/.test(src));
check('it samples one marker, not all of them, inside a gesture',
      /if \(pick \|\| !l\._icon \|\| !l\.getLatLng\) return;/.test(src));
check('and it cannot throw into the render',
      /try \{ nmxDriftSample\(\); \} catch\(_\)\{ \}/.test(src));
check('the panel reports both, signed',
      /L1\('Dot offset, worst'/.test(src) &&
      /L1\('Vector offset, worst'/.test(src) &&
      /L1\('Icon box, worst'/.test(src));

/* v272: the tap target. The dot is 9 px, 6 for a strip, against a 44 px
   published minimum - and .fld being pointer-events:none meant a near
   miss fell through to a 16 px airway hit line rather than failing. */
check('markers carry a transparent hit pad',
      /\.fld::before\{content:'';position:absolute/.test(code) &&
      /pointer-events:auto/.test(code));
check('the pad is sized from one variable, not a magic number',
      /--tap-pad:\d+px;/.test(code) &&
      /width:var\(--tap-pad\);height:var\(--tap-pad\)/.test(code));
check('the pad is centred on the anchor, not hung off it',
      /margin:calc\(var\(--tap-pad\) \/ -2\) 0 0 calc\(var\(--tap-pad\) \/ -2\)/.test(code));
check('the label grows by padding, so nothing moves',
      /\.fld b\{position:absolute;left:0;top:3px;transform:translateX\(-50%\);\s*\n\s*padding:4px 6px;/.test(code));
check('taps are sampled at capture, so the reading is of the tap',
      /addEventListener\('click', nmxTapSample, true\)/.test(src));
check('and the sample records who took it',
      /t\.closest\('\.nmx-di'\)/.test(src) && /t\.closest\('svg'\)/.test(src));
check('only a tap no marker took counts toward the miss distance',
      /if \(kind !== 'marker'\)\{/.test(src));
check('the panel reports the tap numbers',
      /L1\('Nearest on a miss, mean'/.test(src) &&
      /L1\('Took a path', T\.path\)/.test(src));

/* v270: the fix the above exists to prove. An inline-block wrapper gave
   .nmx-di a line box, and every map label is position:absolute with no
   left/top, so the static position dropped one baseline - 15.00 CSS px,
   measured identically at two zooms three levels apart. */
check('.rotfix is a block, so there is no line box to fall past',
      /\.rotfix\{display:block;transform-origin:50% 50%\}/.test(code));
check('and nothing later puts it back to inline-block',
      !/\.rotfix\{[^}]*display:inline-block/.test(code));

/* ---------- 3. our gestures must not fight Leaflet's ----------
   Both of these were felt as "the map jumps to a different zoom". */
check('a second finger ends the drag-zoom',
      /if \(e\.touches && e\.touches\.length > 1\)\{[\s\S]{0,600}?if \(dz\) endDrag\(\);/.test(src));
check('a pinch does not also fire the two-finger step',
      /var quick = \(Date\.now\(\) - multiAt\) < 300;/.test(src) &&
      /Math\.abs\(LMAP\.getZoom\(\) - multiZ0\) < 0\.05/.test(src) &&
      /if \(quick && stillZ\) zoomAt/.test(src));
check('the unconditional two-finger zoom-out is gone',
      !/if \(multi >= 2\)\{ multi = 0; touchZoomAt = Date\.now\(\); zoomAt/.test(src));
check('the pinch start is recorded so a tap can be told from it',
      /var multiAt = 0, multiZ0 = null;/.test(src));

/* ---------- 4. the guards that already exist ---------- */
check('a continuous drag-zoom suppresses the rebuild while the finger is down',
      /if \(nmxGesture\) return;/.test(src));
check('and the rebuild is deferred to a frame, not a timeout',
      /settle = requestAnimationFrame/.test(src));
check('rasters do not refetch mid-zoom',
      /updateWhenZooming:false/.test(src));

passes.forEach(p => console.log('PASS  ' + p));
fails.forEach(f  => console.log('FAIL  ' + f));
notes.forEach(n  => console.log('NOTE  ' + n));
console.log('NOTE  jsdom does not lay out or animate — this measures the code, not the feel.');
console.log('ZOOM: ' + (fails.length ? 'FAIL (' + fails.length + ')' : 'PASS'));
process.exit(fails.length ? 1 : 0);
