# tredo-web

Public website for tredo, a macro bias tool for forex. Static HTML, CSS and JS served by GitHub Pages. No framework, no build step.

## Files
- README.md: this file, one line per file, updated every phase.
- index.html: Dashboard page, 7 pair cards (each opens its pair page) and the currency strength strip.
- scores.html: Scores page, table of all pairs with the 9 signals.
- pair.html: detail page for one pair, opened as pair.html?p=USDCAD.
- css/tokens.css: colour, font and radius tokens (dark theme, teal accent).
- css/app.css: shared layout, menu, card, badge and strength strip styles.
- css/scores.css: styles for the Scores table only.
- css/pair.css: styles for the pair page, signal rows, retail bar and tappable cards.
- js/api.js: Supabase read helper sb(path), holds the public URL and anon key.
- js/nav.js: renders the shared menu and footer disclaimer on every page.
- js/ui.js: small helpers for escaping text, score colours, tier names and number formats.
- js/dashboard.js: loads scores_latest and currency_strength, draws the Dashboard.
- js/scores.js: loads scores_latest and signals_latest, draws the Scores table.
- js/pair.js: loads one pair from scores_latest and signals_latest, draws blocks, signals and retail bar.

## Notes
- Only public keys (Supabase URL and publishable key) are ever used here.
- Scores help prioritise attention. They are not trade entries or financial advice.
