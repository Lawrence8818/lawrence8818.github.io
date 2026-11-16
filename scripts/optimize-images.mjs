// 构建前:给 public/images/ 里的照片各出两张较小的 WebP(480 / 960 宽)。
//
//   node scripts/optimize-images.mjs     ← `npm run build` 的第一步
//
// 原图(JPG/PNG)照旧保留、照旧是 <img src> 指向的文件;这里生成的
// public/images/opt/<名字>-<宽>.webp 只是给浏览器多一个更省流量的选择
// (见 src/components/Picture.astro)。生成的文件不进 git,每次构建重出。
// 原图没变就跳过,所以本地重复构建很快。
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const DIR = new URL('../public/images/', import.meta.url).pathname;
const OUT = DIR + 'opt/';
export const WIDTHS = [480, 960];

mkdirSync(OUT, { recursive: true });
const files = readdirSync(DIR).filter((n) => /\.(jpe?g|png)$/i.test(n)).sort();
let made = 0, before = 0, after = 0;

for (const file of files) {
  const src = DIR + file;
  const base = file.replace(/\.[^.]+$/, '');
  const srcStat = statSync(src);
  before += srcStat.size;
  for (const w of WIDTHS) {
    const out = OUT + base + '-' + w + '.webp';
    if (!existsSync(out) || statSync(out).mtimeMs < srcStat.mtimeMs) {
      // rotate() 先按 EXIF 摆正;小图不放大
      await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
      made++;
    }
    if (w === WIDTHS[WIDTHS.length - 1]) after += statSync(out).size;
  }
}
console.log(
  files.length + ' 张照片 · 新出 ' + made + ' 个 WebP · 原图合计 ' +
    (before / 1048576).toFixed(1) + ' MB → 960 宽 WebP 合计 ' + (after / 1048576).toFixed(1) + ' MB',
);
