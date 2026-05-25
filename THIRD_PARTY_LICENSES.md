# Third-Party Licenses

Bayaan Web is distributed under **AGPL-3.0-or-later**. This file lists the dependencies bundled in production builds along with their licenses. All licenses are either permissive or copyleft-compatible with AGPL.

## License distribution

Across **760 packages** (prod + dev, all depths), distribution is:

- **MIT** — 649
- **ISC** — 39
- **Apache-2.0** — 31
- **BSD-2-Clause** — 13
- **BSD-3-Clause** — 11
- **BlueOak-1.0.0** — 4
- **MPL-2.0** — 3
- **MIT-0** — 2
- **CC0-1.0** — 2
- **LGPL-3.0-or-later** — 1
- **CC-BY-4.0** — 1
- **(MPL-2.0 OR Apache-2.0)** — 1
- **(MIT OR CC0-1.0)** — 1
- **Python-2.0** — 1
- **Unlicense** — 1
- **0BSD** — 1

## Direct production dependencies

| Package                    | License                 |
| -------------------------- | ----------------------- |
| `@base-ui/react`           | MIT                     |
| `@dnd-kit/core`            | MIT                     |
| `@dnd-kit/sortable`        | MIT                     |
| `@dnd-kit/utilities`       | MIT                     |
| `class-variance-authority` | Apache-2.0              |
| `clsx`                     | MIT                     |
| `dompurify`                | (MPL-2.0 OR Apache-2.0) |
| `fuse.js`                  | Apache-2.0              |
| `lucide-react`             | ISC                     |
| `next`                     | MIT                     |
| `react`                    | MIT                     |
| `react-dom`                | MIT                     |
| `shadcn`                   | MIT                     |
| `swr`                      | MIT                     |
| `tailwind-merge`           | MIT                     |
| `tw-animate-css`           | MIT                     |
| `zustand`                  | MIT                     |

## Fonts

- **Manrope** — Apache-2.0 ([GitHub](https://github.com/sharanda/manrope))
- **Custom glyph fonts for surah names** — bundled with this project under the same AGPL-3.0-or-later license

## Regenerating

This document is generated manually from `package.json` + `node_modules`. To refresh the distribution numbers after adding or removing dependencies, run:

```bash
node -e "
const fs = require('fs'), path = require('path');
function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const n of fs.readdirSync(dir)) {
    const f = path.join(dir, n);
    if (!fs.statSync(f).isDirectory()) continue;
    if (n.startsWith('@')) { walk(f, out); continue; }
    const p = path.join(f, 'package.json');
    if (fs.existsSync(p)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
        const l = typeof pkg.license === 'string' ? pkg.license : (pkg.license?.type || 'UNSPECIFIED');
        out.push(l);
      } catch {}
    }
    walk(path.join(f, 'node_modules'), out);
  }
}
const out = []; walk('node_modules', out);
const c = {};
for (const l of out) c[l] = (c[l]||0)+1;
for (const [l,n] of Object.entries(c).sort((a,b)=>b[1]-a[1])) console.log(n+'x '+l);
"
```
