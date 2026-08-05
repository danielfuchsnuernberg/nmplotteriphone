/* focus — the map keeps the tapped subject in the part of the map that
   is still visible. The geometry is run against measured rectangles. */
const fs = require('fs');
const src = fs.readFileSync(process.argv[2] || 'demo-work.html', 'utf8');
const out = [];
const check = (n,c,d) => out.push([!!c, n, d||'']);

check('there is one focus helper', (src.match(/function mapFocus\(/g) || []).length === 1);
check('it measures the panel rather than assuming a size',
      /getBoundingClientRect\(\)/.test(src.slice(src.indexOf('function mapFocus'),
                                                src.indexOf('function mapFocus') + 2000)));
/* v273: this used to assert two requestAnimationFrames, and two frames
   was the bug. The card slides up over 220 ms and getBoundingClientRect
   reports the transformed box, so two frames in the sheet is still most
   of the way off screen and almost nothing gets trimmed - which looked
   correct whenever the card happened to be open already. It now waits
   for the overlay rectangles to STOP CHANGING, with a ceiling so a
   transition that never ends cannot hang the focus. */
check('it waits for the sheet to stop moving, not for a fixed frame count',
      /function sig\(\)\{/.test(src) &&
      /if \(now === last\)\{ if \(\+\+same >= 2\) return run\(\); \}/.test(src));
check('and gives up waiting rather than hanging on a transition',
      /if \(Date\.now\(\) - t0 > 400\) return run\(\);/.test(src));
check('it never zooms',
      !/setZoom|setView/.test(src.slice(src.indexOf('function mapFocus'),
                                        src.indexOf('function mapFocus') + 2600)));
check('it does nothing for a subject already in place',
      /Math\.abs\(d\.x\) < 4 && Math\.abs\(d\.y\) < 4/.test(src));
check('it gives up rather than aim at a sliver',
      /bottom - top < 60 \|\| right - left < 60/.test(src));
check('it picks the side that LEAVES the most map, not the smallest cut',
      /compare what each one LEAVES, in area/.test(src) &&
      /opts\.sort\(function\(x, y\)\{ return y\.a - x\.a; \}\)/.test(src));
check('every overlay that can cover the map is considered',
      /'\.ted\.on \.tedw', '\.card\.on', '\.drop\.on', '\.hud-panel\.on'/.test(src));
/* v273: tapping a point on the map is a request to look at it there. */
check('a map tap opens the card at half the screen',
      /function cardHalfH\(\)\{/.test(src) &&
      /Math\.round\(window\.innerHeight \* 0\.5\)/.test(src) &&
      /card\.style\.height = \(cardHalf \? cardHalfH\(\)/.test(src));
check('and only a map tap - other openings keep the dragged height',
      /function openCard\(id, fromMap\)\{[\s\S]{0,200}?cardHalf = !!fromMap;/.test(src) &&
      /function openCardPoint\(p, fromMap\)\{[\s\S]{0,200}?cardHalf = !!fromMap;/.test(src));
check('a hand on the grip drops the half-screen mode',
      /function move\(y\)\{[\s\S]{0,200}?cardHalf = false;/.test(src));
check('every marker opens its card from the map',
      /mk\.on\('click', function\(\)\{ openCard\(p\.id, true\); \}\);/.test(src));
check('including a route point with no database entry',
      /wm\.on\('click', function\(\)\{ openCardPoint\(p, true\); \}\);/.test(src) &&
      !/wm\.on\('click', function\(\)\{ openChip\(i\); \}\);/.test(src));
check('and the route-order actions it used to reach still exist',
      /function openChip\(i\)\{/.test(src) && /\n          openChip\(i\);/.test(src));

check('airfields focus', /var f = dbById\(id\);\s*\n\s*if \(f\) mapFocus\(f\.lat, f\.lon\);/.test(src));
check('dropped points focus', /if \(p\) mapFocus\(p\.lat, p\.lon\);/.test(src));
check('a leg focuses on its middle',
      /mapFocus\(\(a\.lat \+ b\.lat\) \/ 2, \(a\.lon \+ b\.lon\) \/ 2\)/.test(src));
check('airways focus', /if \(mid && mid\.a != null\) mapFocus\(mid\.a, mid\.o\)/.test(src));
check('airspace zones focus', /if \(ctr\) mapFocus\(ctr\[0\], ctr\[1\]\)/.test(src));

/* --- run the geometry --- */
const i = src.indexOf('function mapFocus(');
const open = i;
/* the outer try, matched by braces - there is a nested try inside now,
   so indexOf on the first '} catch' would cut the body in half */
const bodyStart = src.indexOf('try {', src.indexOf('function run()', i));
let depth = 0, k = src.indexOf('{', bodyStart), bodyEnd = k;
for (; bodyEnd < src.length; bodyEnd++){
  if (src[bodyEnd] === '{') depth++;
  else if (src[bodyEnd] === '}'){ depth--; if (!depth) break; }
}
const body = src.slice(k + 1, bodyEnd);

function run({ mapRect, panelSel, panelRect, at }){
  let panned = null;
  const L = { point: (x, y) => ({ x, y, subtract(o){ return { x:this.x-o.x, y:this.y-o.y }; } }) };
  const LMAP = {
    latLngToContainerPoint: () => ({ x:at.x, y:at.y,
      subtract(o){ return { x:this.x-o.x, y:this.y-o.y }; } }),
    panBy: (d) => { panned = d; }
  };
  const document = {
    getElementById: () => ({ getBoundingClientRect: () => mapRect }),
    querySelector: (sel) => (sel === panelSel
      ? { getBoundingClientRect: () => panelRect } : null)
  };
  /* the selector list moved out of the function in v273 so the frame
     sampler and the geometry could share it; hand it in the same way
     everything else here is handed in, read from the real source rather
     than retyped, so the harness cannot drift from the app. */
  const SELS = JSON.parse('[' + (src.match(/MAPFOCUS_SELS = \[([\s\S]*?)\]/)[1])
                                  .replace(/'/g, '"') + ']');
  new Function('L','LMAP','document','lat','lon','follow','locState',
               'locCentreOnFix','locSync','toast','MAPFOCUS_SELS', body)
    (L, LMAP, document, -6, 146, false, 0, false, function(){}, function(){}, SELS);
  return panned;
}

/* a phone: 390 x 700 map, bottom sheet covering the lower 60% */
const phone = { mapRect:{ top:0, bottom:700, left:0, right:390 },
                panelSel:'.ted.on .tedw',
                panelRect:{ top:280, bottom:700, left:0, right:390, width:390, height:420 } };
let p = run(Object.assign({ at:{ x:195, y:500 } }, phone));
check('a subject hidden under a bottom sheet is pulled up', !!p && p.y > 0,
      p ? 'panBy y=' + p.y.toFixed(0) : 'no pan');
check('and lands in the middle of the strip that is left',
      !!p && Math.abs((500 - p.y) - 140) < 1, p ? 'ends at y=' + (500 - p.y) : '');
p = run(Object.assign({ at:{ x:195, y:140 } }, phone));
check('a subject already in the strip is left alone', p === null, p ? 'panned' : 'no pan');

/* a tablet: 1180 wide, side panel on the right third */
const tablet = { mapRect:{ top:0, bottom:820, left:0, right:1180 },
                 panelSel:'.card.on',
                 panelRect:{ top:0, bottom:820, left:780, right:1180, width:400, height:820 } };
p = run(Object.assign({ at:{ x:1000, y:400 } }, tablet));
check('a subject behind a side panel is pulled left', !!p && p.x > 0,
      p ? 'panBy x=' + p.x.toFixed(0) : 'no pan');
check('and lands in the middle of the map that is left',
      !!p && Math.abs((1000 - p.x) - 390) < 1, p ? 'ends at x=' + (1000 - p.x) : '');
check('the vertical is left alone for a full-height side panel',
      !!p && Math.abs((400 - p.y) - 410) < 1, p ? 'ends at y=' + (400 - p.y) : '');

/* a panel that covers nearly everything: give up rather than aim at a sliver */
const swamped = { mapRect:{ top:0, bottom:700, left:0, right:390 },
                  panelSel:'.ted.on .tedw',
                  panelRect:{ top:30, bottom:700, left:0, right:390, width:390, height:670 } };
check('a panel that leaves no room is declined',
      run(Object.assign({ at:{ x:195, y:500 } }, swamped)) === null);

/* no panel at all: centre of the map */
const bare = { mapRect:{ top:0, bottom:700, left:0, right:390 },
               panelSel:'.nothing', panelRect:{ top:0, bottom:0, left:0, right:0 } };
p = run(Object.assign({ at:{ x:300, y:600 } }, bare));
check('with nothing covering it, the subject goes to the centre',
      !!p && Math.abs((600 - p.y) - 350) < 1 && Math.abs((300 - p.x) - 195) < 1,
      p ? 'ends at ' + (300 - p.x) + ',' + (600 - p.y) : '');

check('focusing the map lets go of Follow',
      /if \(follow\)\{[\s\S]{0,220}locState = 1;/.test(src) &&
      /Follow off/.test(src));
check('and it only lets go when it actually panned',
      src.indexOf('LMAP.panBy(d,') < src.indexOf('if (follow){'));

/* v187: the subject is remembered and re-centred when the panel goes */
check('the last focused subject is remembered', /var mapSubject = null;/.test(src) &&
      /mapSubject = \{ lat:lat, lon:lon \};/.test(src));
check('there is a refocus', /function mapRefocus\(\)/.test(src));
check('every close path re-centres it',
      (src.match(/mapRefocus\(\);/g) || []).length === 3,
      (src.match(/mapRefocus\(\);/g) || []).length + ' close paths');
check('a subject panned off the map is left where it is',
      /p\.x < 0 \|\| p\.y < 0 \|\| p\.x > host\.clientWidth/.test(src) &&
      /mapSubject = null; return;/.test(src));
check('refocus goes through the same focus, so it centres when nothing covers it',
      /mapFocus\(mapSubject\.lat, mapSubject\.lon\);/.test(src));

out.forEach(r => console.log((r[0]?'PASS  ':'FAIL  ') + r[1] + (r[2] ? '   ['+r[2]+']' : '')));
const bad = out.filter(r => !r[0]);
console.log(bad.length ? '\nFOCUS: FAIL ('+bad.length+')' : '\nFOCUS: PASS');
process.exit(bad.length ? 1 : 0);
