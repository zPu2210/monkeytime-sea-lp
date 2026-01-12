# Brainstorm: Universal Deployment Refactor

**Date:** 2026-01-12
**Status:** Agreed
**Decision:** Option A - Pre-built + Relative Paths

---

## Problem Statement

MonkeyTime SEA landing page fails on AWS/S3 deployment due to:
1. Absolute paths (`/assets/`, `/css/`, `/js/`) break subdirectory deployments
2. Build step required (npm install + npm run build)
3. Tarball missing built `dist/` folder
4. Vercel-specific config doesn't help other platforms

---

## Evaluated Options

### Option A: Pre-built + Relative Paths (SELECTED)
- Convert absolute to relative paths (`/` → `./`)
- Include built `dist/` in tarball
- Zero runtime dependencies

| Pros | Cons |
|------|------|
| Works on any static host | Need rebuild for style changes |
| Optimized (~220KB total) | Two-step deploy (extract + upload) |
| Cache-friendly | |
| Professional/production-ready | |

### Option B: Single-file HTML
- Inline all CSS/JS, base64 images

| Pros | Cons |
|------|------|
| Single file | ~500KB+ file size |
| Ultimate portability | Hard to maintain |
| | No caching benefits |

### Option C: CDN Tailwind
- Use Tailwind CDN, no build

| Pros | Cons |
|------|------|
| Zero build step | ~300KB CSS (vs 8KB built) |
| Instant changes | CDN dependency |
| | Slower page load |

---

## Implementation Requirements

### Path Changes (src/index.html)
```
/css/output.css     → ./css/output.css
/js/main.js         → ./js/main.js
/assets/images/*    → ./assets/images/*
```

### Build Process
```bash
npm run build  # Generates dist/
```

### Tarball Creation
```bash
tar -czvf monkeytime-sea-lp-deploy.tar.gz -C dist .
```

---

## Success Criteria
- [ ] All paths use relative `./` prefix
- [ ] `dist/` contains complete built site
- [ ] Tarball < 250KB
- [ ] Deploys successfully on S3 without errors
- [ ] Images, CSS, JS all load correctly
- [ ] Works in subdirectory (e.g., `/landing/`)

---

## Risks
| Risk | Mitigation |
|------|------------|
| Forgot path somewhere | Grep for remaining `/assets` patterns |
| Build failure | Test full npm run build before tarball |
| Browser caching old version | Add cache-busting query string if needed |

---

## Next Steps
1. Create implementation plan
2. Apply path fixes to src/index.html
3. Run npm run build
4. Test locally with simple HTTP server
5. Create deployment tarball
6. Test on S3
