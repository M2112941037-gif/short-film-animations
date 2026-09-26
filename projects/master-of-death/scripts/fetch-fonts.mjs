// Downloads the film's fonts into public/fonts so renders never hit the network.
// Noto Serif SC is subset to exactly the CJK characters that appear in src/.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'public/fonts');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const walk = (dir) => fs.readdirSync(dir, {withFileTypes: true}).flatMap((d) =>
  d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);

const cjk = new Set();
for (const file of walk(path.join(root, 'src'))) {
  for (const ch of fs.readFileSync(file, 'utf8')) {
    if (/[　-〿一-鿿＀-￯—…“”·]/.test(ch)) cjk.add(ch);
  }
}
const cjkText = [...cjk].sort().join('');

const families = [
  {name: 'CormorantGaramond', query: 'family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500', subset: 'latin'},
  {name: 'Cinzel', query: 'family=Cinzel:wght@400;600', subset: 'latin'},
  {name: 'NotoSerifSC', query: `family=Noto+Serif+SC:wght@400;600&text=${encodeURIComponent(cjkText)}`, subset: null},
];

const manifest = [];
for (const fam of families) {
  const res = await fetch(`https://fonts.googleapis.com/css2?${fam.query}&display=block`, {headers: {'User-Agent': UA}});
  if (!res.ok) throw new Error(`${fam.name}: ${res.status}`);
  const text = await res.text();
  // Each @font-face block is preceded by a /* subset */ comment for full families.
  const blocks = text.split('@font-face').slice(1);
  const comments = [...text.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face/g)].map((m) => m[1]);
  for (const [i, block] of blocks.entries()) {
    if (fam.subset && comments[i] !== fam.subset) continue;
    const style = /font-style: (\w+)/.exec(block)[1];
    const weight = /font-weight: (\d+)/.exec(block)[1];
    const url = /url\((.+?)\)/.exec(block)[1];
    const file = `${fam.name}-${weight}${style === 'italic' ? 'i' : ''}.woff2`;
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(path.join(outDir, file), buf);
    const family = fam.name.replace(/([a-z])([A-Z])/g, '$1 $2').replace('Serif S C', 'Serif SC');
    manifest.push({family, style, weight, file});
    console.log(`${file}  ${(buf.length / 1024).toFixed(0)} KB`);
  }
}
fs.writeFileSync(path.join(outDir, 'fonts.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`CJK glyphs subset: ${cjk.size}`);
