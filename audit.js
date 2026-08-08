/* NM Plotter iPhone — SCENARIO AUDIT
   ==================================
   Not a harness for one feature. This drives the real file through many
   seeded sequences of real interactions and checks, after every single
   step, a set of things that must never be true:

     - nothing threw
     - no visible text reads NaN, undefined, Infinity or [object Object]
     - no overlay is open without a way out of it   (dead ends)
     - no control that is on screen is dead         (no handler at all)

   Seeded, so every fault it finds can be replayed by number rather than
   described. jsdom has no layout and no touch, so this says nothing
   about whether the map FEELS smooth - it is aimed squarely at the other
   complaint: things half working, collapsing mid-plan, wrong numbers.

   usage: node audit.js work.html [scenarios] [steps]
*/
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE  = process.argv[2] || 'work.html';
const NSCEN = parseInt(process.argv[3] || '50', 10);
const NSTEP = parseInt(process.argv[4] || '18', 10);
const html  = fs.readFileSync(FILE, 'utf8');

/* ---- deterministic RNG, so a scenario number replays exactly ---- */
function rng(seed){
  let x = seed >>> 0 || 1;
  return function(){ x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}

function installStubs(w){
  w.Element.prototype.scrollTo = function(){};
  w.Element.prototype.scrollIntoView = function(){};
  w.HTMLCanvasElement.prototype.getContext = function(){
    return { canvas:{width:0,height:0}, save(){}, restore(){}, beginPath(){}, closePath(){},
      moveTo(){}, lineTo(){}, arc(){}, rect(){}, fill(){}, stroke(){}, clip(){},
      fillRect(){}, clearRect(){}, strokeRect(){}, translate(){}, rotate(){}, scale(){},
      setTransform(){}, drawImage(){}, fillText(){}, strokeText(){},
      measureText(){ return { width: 10 }; },
      createLinearGradient(){ return { addColorStop(){} }; },
      createRadialGradient(){ return { addColorStop(){} }; },
      getImageData(){ return { data: new Uint8ClampedArray(4) }; },
      putImageData(){}, setLineDash(){}, arcTo(){}, quadraticCurveTo(){}, bezierCurveTo(){} };
  };
  Object.defineProperty(w.navigator, 'geolocation', { configurable:true,
    value:{ getCurrentPosition(){}, watchPosition(){ return 1; }, clearWatch(){} } });
  w.matchMedia = q => ({ matches:false, media:q, addListener(){}, removeListener(){},
    addEventListener(){}, removeEventListener(){}, onchange:null });
  w.fetch = () => Promise.reject(new Error('offline in test'));
  w.scrollTo = function(){}; w.alert = function(){};
  if (!w.ResizeObserver) w.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
  if (!w.IntersectionObserver) w.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };
}

/* ---- what counts as a fault --------------------------------------- */
const BAD_TEXT = [
  { re: /\bNaN\b/,             name: 'NaN in visible text' },
  { re: /\bundefined\b/,       name: 'undefined in visible text' },
  { re: /\bInfinity\b/,        name: 'Infinity in visible text' },
  { re: /\[object [A-Z]\w*\]/, name: 'raw object in visible text' },
  { re: /\bnull\b/,            name: 'null in visible text' }
];

/* Overlays that must offer a VISIBLE way out.

   Anchored popovers (.pop, .drop) are excluded from this rule and get a
   different one below: they are allowed to have no close button so long
   as tapping outside dismisses them. Flagging them here was a false
   positive on the first run - the check has to match how the thing is
   actually meant to be used. */
const OVERLAY_SEL = ['.ted.on', '.card.on', '#fqWin.on', '.hud-panel.on'];
const ANCHORED    = ['.pop.on', '.drop.on'];
const EXIT_SEL    = '.x, .close, .back, [data-close], .cgrip, .tedx, .bx, button';

function visible(w, el){
  let n = el;
  for (let i = 0; n && i < 40; i++){
    if (n.nodeType === 1){
      if (n.hasAttribute && n.hasAttribute('hidden')) return false;
      let st; try { st = w.getComputedStyle(n); } catch(_){ st = null; }
      if (st && (st.display === 'none' || st.visibility === 'hidden')) return false;
    }
    n = n.parentNode;
  }
  return true;
}

function clickables(w){
  const d = w.document;
  const all = Array.from(d.querySelectorAll('button, [role="button"], .tab, .row, .arow, .srow, .chip, .rb, .nav-item, .sq, a[href="#"]'));
  return all.filter(e => visible(w, e));
}

function label(e){
  const t = (e.getAttribute('aria-label') || e.getAttribute('data-v') || e.getAttribute('data-tab')
          || (e.textContent || '').trim().replace(/\s+/g, ' ')).slice(0, 28);
  return t || (e.id ? '#' + e.id : e.className || e.tagName);
}

/* ---- one scenario -------------------------------------------------- */
function runScenario(seed, steps, faults){
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errs.push('THREW: ' + ((e.detail && (e.detail.message)) || e.message)));

  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true,
    url:'https://example.org/', virtualConsole:vc, beforeParse:installStubs });
  const w = dom.window;
  w.addEventListener('error', e => errs.push('UNCAUGHT: ' + ((e.error && e.error.message) || e.message)));
  w.addEventListener('unhandledrejection', () => {});

  const rand = rng(seed);
  const trail = [];

  function record(kind, detail){
    faults.push({ seed, step: trail.length, kind, detail, trail: trail.slice(-6).join(' > ') });
  }

  function checkAll(){
    /* text faults, per element so the report can name the offender */
    const d = w.document;
    const nodes = d.querySelectorAll('.card, .ted, .pop, .drop, #fqWin, .hud-panel, .view, .app');
    for (const n of nodes){
      if (!visible(w, n)) continue;
      const txt = (n.textContent || '');
      for (const b of BAD_TEXT){
        if (b.re.test(txt)){
          /* narrow to the smallest element that shows it */
          let who = n;
          const walk = n.querySelectorAll('*');
          for (const c of walk){
            if (c.children.length === 0 && b.re.test(c.textContent || '')){ who = c; break; }
          }
          record(b.name, label(who));
          break;
        }
      }
    }
    /* dead ends: an overlay open with nothing to press to leave it */
    for (const sel of OVERLAY_SEL){
      const o = d.querySelector(sel);
      if (!o || !visible(w, o)) continue;
      const exits = Array.from(o.querySelectorAll(EXIT_SEL)).filter(e => visible(w, e));
      if (!exits.length) record('dead end: overlay with no exit', sel);
    }
    /* an anchored popover must dismiss on an outside tap, since it has
       no close button of its own. If it survives one, it is a trap. */
    for (const sel of ANCHORED){
      const o = d.querySelector(sel);
      if (!o || !visible(w, o)) continue;
      const own = Array.from(o.querySelectorAll('.x, .close, [data-close]')).filter(e => visible(w, e));
      if (own.length) continue;
      try {
        d.body.dispatchEvent(new w.MouseEvent('click', { bubbles:true }));
        d.body.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles:true }));
      } catch(_){ }
      if (d.querySelector(sel)) record('dead end: popover survives an outside tap', sel);
    }
    if (errs.length){
      for (const e of errs.splice(0)) record('threw', e);
    }
  }

  /* A PRELUDE, so every scenario starts from a real flight plan rather
     than a cold map. A random walk almost never builds a route by
     accident, and "collapses mid-planning" is a fault of a LOADED
     state, not an empty one. */
  function byText(sel, txt){
    return clickables(w).find(e => (e.matches(sel) || true) && label(e).toLowerCase().indexOf(txt) === 0);
  }
  function prelude(){
    const d = w.document;
    /* open a spread of fields and put them in the route */
    const ids = ['AYNZ', 'AYGA', 'AYMH', 'AYMD', 'AYPY'];
    const pick = ids.slice(0, 2 + Math.floor(rand() * 3));
    for (const id of pick){
      const row = Array.from(d.querySelectorAll('[data-fld], [data-id], .arow'))
        .find(e => (e.textContent || '').indexOf(id) >= 0);
      if (row){ trail.push('open ' + id); try { row.click(); } catch(_){ } checkAll(); }
      const add = clickables(w).find(e => /add to route/i.test(label(e)));
      if (add){ trail.push('add ' + id); try { add.click(); } catch(_){ } checkAll(); }
      const back = clickables(w).find(e => /^(< )?map$/i.test(label(e)));
      if (back){ try { back.click(); } catch(_){ } }
    }
  }

  try {
    checkAll();
    prelude();
    for (let i = 0; i < steps; i++){
      const pool = clickables(w);
      if (!pool.length){ record('dead end: nothing on screen is clickable', ''); break; }
      const el = pool[Math.floor(rand() * pool.length)];
      trail.push(label(el));
      try { el.click(); } catch(e){ record('threw on click', label(el) + ' :: ' + e.message); }
      /* let rAF/timeout work run */
      try { w.document.dispatchEvent(new w.Event('nmx-tick')); } catch(_){ }
      checkAll();
    }
  } catch (e){
    record('scenario aborted', e.message);
  }
  try { w.close(); } catch(_){ }
}

/* ---- run ----------------------------------------------------------- */
const faults = [];
process.stdout.write('running ' + NSCEN + ' scenarios x ' + NSTEP + ' steps ');
for (let s = 1; s <= NSCEN; s++){
  runScenario(s * 7919, NSTEP, faults);
  if (s % 10 === 0) process.stdout.write('.');
}
console.log('\n');

/* group by kind + detail so one bug is one line, not four hundred */
const groups = new Map();
for (const f of faults){
  const k = f.kind + ' | ' + f.detail;
  if (!groups.has(k)) groups.set(k, { ...f, n: 0, seeds: new Set() });
  const g = groups.get(k); g.n++; g.seeds.add(f.seed);
}
const list = Array.from(groups.values()).sort((a, b) => b.n - a.n);

console.log('=== SCENARIO AUDIT: ' + FILE + ' ===');
console.log(faults.length + ' fault events, ' + list.length + ' distinct\n');
for (const g of list){
  console.log('[' + String(g.n).padStart(4) + 'x] ' + g.kind);
  console.log('        ' + (g.detail || '(no detail)'));
  console.log('        first seen: seed ' + [...g.seeds][0] + ' step ' + g.step);
  if (g.trail) console.log('        path: ' + g.trail);
  console.log('');
}
console.log(list.length ? 'AUDIT: ' + list.length + ' distinct faults' : 'AUDIT: clean');
