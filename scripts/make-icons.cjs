const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = "/home/z/my-project/public/icons";
fs.mkdirSync(dir, { recursive: true });

const iconSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#17162a"/>
      <stop offset="1" stop-color="#131316"/>
    </linearGradient>
    <linearGradient id="cube" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c6cf0"/>
      <stop offset="1" stop-color="#14b8a6"/>
    </linearGradient>
    <linearGradient id="top" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a99af7"/>
      <stop offset="1" stop-color="#7ee8d8"/>
    </linearGradient>
    <linearGradient id="side" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5b4bd4"/>
      <stop offset="1" stop-color="#0e9488"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <g transform="translate(256,268)">
    <path d="M0 -148 L128 -74 L0 0 L-128 -74 Z" fill="url(#top)"/>
    <path d="M-128 -74 L0 0 L0 148 L-128 74 Z" fill="url(#side)"/>
    <path d="M128 -74 L0 0 L0 148 L128 74 Z" fill="url(#cube)"/>
    <path d="M0 -148 L128 -74 L128 74 L0 148 L-128 74 L-128 -74 Z M-128 -74 L0 0 L128 -74 M0 0 L0 148" stroke="rgba(255,255,255,0.35)" stroke-width="6" fill="none" stroke-linejoin="round"/>
    <text x="0" y="66" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-style="italic" font-size="128" fill="#ffffff" opacity="0.97">?</text>
  </g>
</svg>`;

const badgeSvg = `
<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <rect width="72" height="72" rx="18" fill="#7c6cf0"/>
  <text x="36" y="50" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-style="italic" font-size="40" fill="#fff">?</text>
</svg>`;

(async () => {
  await sharp(Buffer.from(iconSvg(512))).png().toFile(path.join(dir, "icon-512.png"));
  await sharp(Buffer.from(iconSvg(192))).png().toFile(path.join(dir, "icon-192.png"));
  await sharp(Buffer.from(iconSvg(180))).png().toFile(path.join(dir, "apple-180.png"));
  await sharp(Buffer.from(badgeSvg)).png().toFile(path.join(dir, "badge-72.png"));
  console.log("icons done");
})();
