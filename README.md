# Cybermen Website

Minimal static website for Cybermen, covering new website builds, redesigns, website care, security checks, performance support, and free website reviews.

## Local Preview

Run a simple local server from this folder:

```powershell
python -m http.server 4179 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4179/
```

## Form

The website review form submits to Formspree:

```text
https://formspree.io/f/mjgllgre
```

## Files

- `index.html` - page markup and content
- `styles.css` - responsive visual design and animations
- `app.js` - navigation, reveal animation, intro animation, and Formspree submit handling
- `assets/` - production images and favicon
