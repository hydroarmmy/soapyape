# SoapyApe

Static pixel-art homepage for soapyape.com (Cloudflare Pages).

## Structure
- `index.html`, `css/style.css` — homepage
- `assets/ui/` — all pixel art pieces (27 pieces + generated `bar-top.png`)
- `_headers` — Cloudflare Pages headers

## How the layout stretches
Art is drawn for an 836px-wide design. `--s` in `css/style.css` is the pixel scale
(1 below 900px, 1.5 from 900px, 2 from 1600px).

Hero, the plant edge and the footer are 3-part strips: `*-left` and `*-right` are fixed caps,
`*-center` repeats on the X axis, so the page stretches to any width.

## Deploy
Push to `main`. Cloudflare: Workers & Pages → Create → Pages → Connect to Git → `hydroarmmy/soapyape`.
Build command: empty · Output directory: `/` · add custom domain `soapyape.com`.

## Notes on edited art
- `hero-left/center/right.png`: replaced with the smoothed versions (left/right 456px wide caps, center 23px wide repeat strip)
- `logo-big.png`: new logo (273x80)
- `bar-top-left/center/right.png`: wood top bar, 3-part (caps 349px, center 137px repeat-x), drawn as layered CSS backgrounds on `.topbar`

## TODO
- Real Google Play URL in the "Top Game Mobile" card (`index.html`, search for TODO)
- Social links (Discord / YouTube / itch.io)
- Card thumbnails (`.thumb`, e.g. `assets/thumbs/cozy-farm.png`)
- Pages: /games, /assets, /play, /apps, /privacy
