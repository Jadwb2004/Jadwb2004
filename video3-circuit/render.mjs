// Usage: node render.mjs <outdir> [fps] [onlyTimes comma list for stills]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
const out = process.argv[2] || 'out';
const fps = +(process.argv[3] || 30);
const stills = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + path.join(here, 'scene.html'));
await page.evaluate(() => window.setupScene());
const sched = await page.evaluate(() => window.SCHEDULE);
fs.writeFileSync(path.join(out, 'schedule.json'), JSON.stringify(sched, null, 1));
async function grab(t) {
  const b64 = await page.evaluate((t) => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
  return Buffer.from(b64, 'base64');
}
if (stills) {
  for (const t of stills) fs.writeFileSync(path.join(out, `still_${t.toFixed(2)}.png`), await grab(t));
} else {
  const N = Math.round(sched.dur * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps), path.join(out, 'video_silent.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const buf = await grab(i / fps);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`frame ${i}/${N} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
}
await browser.close();
