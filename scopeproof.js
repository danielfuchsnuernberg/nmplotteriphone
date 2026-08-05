/* Prove, from the AST rather than by eye, whether the identifier
   `nmxRendererSync` referenced inside renderMap() can resolve to the
   function declaration of that name. */
const fs = require('fs');
const acorn = require('acorn');

const file = process.argv[2] || 'work.html';
const html = fs.readFileSync(file, 'utf8');

/* the app script is the LAST <script> without a src */
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m, blocks = [];
while ((m = re.exec(html))) blocks.push({ code: m[1], at: m.index });
const app = blocks[blocks.length - 1];
console.log('app script block: ' + app.code.length + ' chars');

const ast = acorn.parse(app.code, { ecmaVersion: 2020 });

/* walk, carrying a scope chain of function nodes */
let declScope = null, refScopes = [];
let renderMapNode = null;

function isFn(n){
  return n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression'
      || n.type === 'ArrowFunctionExpression';
}

function walk(node, chain){
  if (!node || typeof node.type !== 'string') return;
  let next = chain;
  if (isFn(node)) next = chain.concat([node]);

  if (node.type === 'FunctionDeclaration' && node.id) {
    if (node.id.name === 'nmxRendererSync') declScope = chain;   // scope it lands in
    if (node.id.name === 'renderMap') renderMapNode = node;
  }
  if (node.type === 'Identifier' && node.name === 'nmxRendererSync') {
    refScopes.push({ start: node.start, chain: next });
  }

  for (const k in node) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => walk(c, next));
    else if (v && typeof v.type === 'string') walk(v, next);
  }
}
walk(ast, []);

function name(fn){
  if (!fn) return '(module top level)';
  return (fn.id && fn.id.name) || '(anonymous fn @' + fn.start + ')';
}

console.log('\nnmxRendererSync DECLARED in scope chain:');
console.log('  ' + (declScope.length ? declScope.map(name).join(' > ') : '(top level)'));
const home = declScope[declScope.length - 1] || null;
console.log('  innermost owner: ' + name(home));

console.log('\nreferences to the identifier nmxRendererSync:');
let bad = 0;
for (const r of refScopes) {
  const inScope = r.chain.indexOf(home) >= 0 || home === null;
  const owner = r.chain[r.chain.length - 1] || null;
  const line = app.code.slice(0, r.start).split('\n').length;
  console.log('  script line ' + line + '  in ' + name(owner)
            + '   -> ' + (inScope ? 'RESOLVES' : '*** UNRESOLVABLE ***'));
  if (!inScope) bad++;
}
console.log('\n' + (bad ? bad + ' reference(s) can NEVER resolve.' : 'all references resolve.'));
