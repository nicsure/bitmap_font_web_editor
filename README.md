# Bitmap Font Web Editor

[Open the live app on GitHub Pages.](https://nicsure.github.io/bitmap_font_web_editor/)

## Overview

Pixel-level font editing for nicFW880 RMS compatible fonts. Use this tool to put the finishing touches on system-converted fonts or build new bitmap fonts from scratch.

## How to use

1. Open the app in your browser (either the GitHub Pages link above or a local copy).
2. Create a new font or open an existing one (depending on your workflow and the files you have).
3. Edit glyphs at the pixel level using the grid editor.
4. Save or export your font when you are satisfied.

## Run locally

Because this app is static, you can run it directly from files or serve it with a tiny local web server.

### Option 1: Open directly

1. Clone or download this repository.
2. Open `index.html` in your browser.

### Option 2: Serve with a local web server

Some browser features work better with a local server. From the repo root:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Host on your own web server

This project is a static site. To host it, copy these files to your server's web root:

- `index.html`
- `app.js`
- `styles.css`

For example, you could place them in `/var/www/html/bitmap_font_web_editor/` on a typical Linux host, then visit `https://your-domain/bitmap_font_web_editor/`.
