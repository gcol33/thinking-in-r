# Thinking in R — Development Notes

## Deployment

- Book hosted on **GitHub Pages** at `thinking-in-r.gillescolling.com` (serves `docs/` from `main`)
- Analytics hosted on **Netlify** at `thinking-in-r.netlify.app` (functions only, no static site)
- **Always re-render before pushing**: run `quarto render --to html` locally, then commit `docs/` along with source changes
- The `_date.lua` Lua filter auto-sets `date-modified` from the latest git commit
- Analytics: custom hit counter via Netlify Functions + Blobs
  - Dashboard: `thinking-in-r.netlify.app/api/dashboard`
  - Reset: `thinking-in-r.netlify.app/api/reset?key=reset-thinking-in-r-2026`

## Workflow

1. Edit `.qmd` source files
2. `quarto render --to html`
3. Commit source + `docs/`
4. Push to `main` — GitHub Pages auto-deploys

## PDF

- Render separately with `quarto render --to pdf` — never commit the PDF (it's sold separately)
- Covers: `covers/front-cover.tex` (front) and `covers/back-cover.tex` (back) are included via `_quarto.yml` (`include-before-body` / `include-after-body`)
- Cover images: `covers/cover1/front.png` and `covers/cover1/back.png` — uses PNG because LaTeX doesn't natively support SVG
- TikZ overlay places covers full-bleed on their own pages
