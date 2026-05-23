// Syntax-check: extraherar största <script>-blocket ur index.html och validerar med vm.Script
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('C:\\Resistance\\index.html', 'utf8');
const matches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];

if (!matches.length) {
  console.error('Hittade inget <script>-block i index.html');
  process.exit(1);
}

const largest = matches.sort((a, b) => b[1].length - a[1].length)[0];

try {
  new vm.Script(largest[1]);
  console.log('Syntax OK');
} catch (e) {
  console.error('Syntaxfel:', e.message);
  process.exit(1);
}
