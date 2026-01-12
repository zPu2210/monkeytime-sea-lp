# Universal Deployment Refactor Plan

**Created:** 2026-01-12
**Status:** DONE (2026-01-12 17:24)
**Complexity:** Simple
**Estimated Tasks:** 5

---

## Objective

Make MonkeyTime SEA landing page deployable on ANY static host (S3, nginx, Apache, GitHub Pages) without build step at deploy time.

## Problem

Current setup uses absolute paths (`/assets/`, `/css/`, `/js/`) which break when:
- Deployed to subdirectory (e.g., `bucket.s3.amazonaws.com/landing/`)
- Served from non-root path

## Solution

Convert all absolute paths to relative (`./`) and package pre-built `dist/` folder.

---

## Implementation Phases

### Phase 1: Fix Paths in Source

**File:** `src/index.html`

**Changes:**
| Line | From | To |
|------|------|-----|
| 31 | `href="/assets/images/favicon.ico"` | `href="./assets/images/favicon.ico"` |
| 42 | `href="/css/output.css"` | `href="./css/output.css"` |
| 90 | `src="/assets/images/logo_new.webp"` | `src="./assets/images/logo_new.webp"` |
| 166 | `src="/assets/images/hero_monkey_mockup.webp"` | `src="./assets/images/hero_monkey_mockup.webp"` |
| 238 | `src="/assets/images/logo_new.webp"` | `src="./assets/images/logo_new.webp"` |
| 384 | `src="/js/main.js"` | `src="./js/main.js"` |

**Command:**
```bash
sed -i '' 's|href="/|href="./|g; s|src="/|src="./|g' src/index.html
```

### Phase 2: Rebuild Dist

```bash
npm run build
```

This generates:
- `dist/index.html` (minified)
- `dist/css/output.css` (compiled Tailwind)
- `dist/js/main.js` (minified)
- `dist/assets/images/*` (copied)

### Phase 3: Verify Paths

```bash
grep -E '(href|src)="/' dist/index.html
# Should return empty (no absolute paths)
```

### Phase 4: Test Locally

```bash
cd dist && python3 -m http.server 8080
# Open http://localhost:8080
# Verify: images load, styles applied, JS works
```

### Phase 5: Create Deployment Tarball

```bash
tar -czvf monkeytime-sea-lp-deploy.tar.gz -C dist .
ls -lh monkeytime-sea-lp-deploy.tar.gz
# Should be < 250KB
```

---

## Validation Checklist

- [x] No absolute paths (`/`) in dist/index.html
- [x] All images load correctly
- [x] CSS styles applied (gradient background, rounded buttons)
- [x] JS works (sticky CTA, modals, player count)
- [x] Tarball size < 250KB (215KB achieved)
- [x] Works when served from subdirectory

## Deployment Instructions (Post-Refactor)

```bash
# On any server:
tar -xzf monkeytime-sea-lp-deploy.tar.gz -C /var/www/html/monkeytime/
# Or upload extracted contents to S3 bucket
```

---

## Files Modified

1. `src/index.html` - Path fixes
2. `dist/*` - Rebuilt output

## Risks

| Risk | Mitigation |
|------|------------|
| Missed a path | Grep verification in Phase 3 |
| Build fails | Run `npm install` first if needed |
| Cache issues | Hard refresh or incognito test |
