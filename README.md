# tredo-web

Public website for tredo, a macro bias tool for forex. Static HTML, CSS and JS on GitHub Pages. No framework, no build step. The live site is app/index.html.

## app/ (current site)
- app/index.html: loads every css and script with ?v=N (bump all N after each change), script order matters, new pages go before core/shell.js.
- app/settings.js: shared settings.
- app/core/api.js: sb() Supabase read helper and esc() text escaper.
- app/core/auth.js: optional Supabase sign in. The app stays open without an account; signing in only enables saved preferences and alerts.
- app/core/shell.js: router and page shell. No hash opens the landing page; #/start is the landing, everything else is the workspace. Desktop (980px and up) gets a fixed sidebar, breadcrumb top bar and wide content column; phones get a compact top bar and five bottom tabs. Also owns the live-score badge, loading skeletons and the per-route entrance animation.
- app/pages/landing.js: the entry page. Longer marketing layout with a live score preview, feature grid, three-step explainer, FAQ and two entry buttons (Get started goes to #/home, Sign in goes to #/auth).
- app/pages/auth.js: sign in, create account and magic link at #/auth.
- app/pages/alerts.js: Confluence Alerts, instruments where technical, sentiment and macro agree.
- app/pages/strength.js: Currency Strength, all 8 majors scored from every pair score that contains them, plus divergences.
- app/pages/corr.js: Correlations, daily return matrix of pairs over 30, 60 or 90 days.
- app/pages/gx.js: gxr(label, sub, value, cls) row builder and gxg(rows) group builder.
- app/pages/more.js: More page, mrItems list of links (Reports, Tools and info), dark mode switch.
- app/pages/calendar.js: Calendar, releases by day with impact filter, forecast, previous and actual (actuals from release_actuals).
- app/pages/weekly.js: Weekly report, score changes, strength, next 40 High events.
- app/pages/sentiment.js: Sentiment, retail long/short per pair.
- app/pages/macro.js: Macro, growth, retail sales, inflation, jobs per currency.
- app/pages/heat.js: Heatmap of all currencies (old, do not overwrite).
- app/pages/usheat.js: US heatmap (old, do not overwrite).
- app/pages/econheat.js: Economic Heatmap per currency (econheat/USD etc.), reads heat_state_v.
- app/pages/groupscfg.js and groups.js: Groups, one heatmap per signal group.
- app/pages/techcfg.js, techmap.js, techscore.js, tech.js: Technical pages (trend, averages, volatility).
- app/pages/econcfg.js and usecon.js: US economy page, latest releases against forecast.
- app/pages/assets.js: Asset Scorecard, indices, oil, gold, silver.
- app/pages/season.js: Seasonality, average return per month.
- app/pages/perf.js: Performance, stored scores against later price moves.
- app/pages/wts.js: Weights, try your own signal weights.
- app/pages/acc.js: "How accurate is this?" page.
- app/pages/tools.js: Tools, lot size calculator.
- app/pages/banks.js: Central banks.
- app/pages/flow.js and filter.js: Flow tab and its filter (filter.js matches pair names only; the Scores tab handles assets itself).
- app/pages/home.js, scores.js, ts2.js, top3.js: Home and Scores tabs.
- app/pages/scorescfg.js: Scores tab settings (S3CFG, S3G group columns, sort state).
- app/pages/scores3.js: Scores tab table of every signal and group total, with Hide Neutral and a Macro only switch (sorts by macro, labels from macro score, adds the 5 assets from asset_scores as group-total rows).
- app/pages/scan.js, scan2.js, scan3.js, scan4.js: scan blocks used by the Scores tab.
- app/pages/pair.js, pair2.js, pairx.js, pairy.js, pairz.js, pairw.js, pairv.js, pairu.js, pairt.js, pairm.js, pairh.js: pair page and its blocks.
- app/pages/yieldcurve.js: Yield curve, daily chart of the US yield curve (reads raw_values, names no maturities).
- app/pages/carry.js: Carry Trade Scanner, pairs ranked by policy rate difference (reads central_banks).
- app/pages/surprise.js: Eco Surprise Index, share of Bullish readings per currency, ranked, Currency/Stocks toggle (reads heat_state_v).
- app/pages/updates.js: Data Updates Log, last update time of each dataset with a freshness dot (reads the latest date in each table).
- app/pages/ecostrength.js: Eco Strength, 8 majors ranked by real yield, policy rate minus latest CPI (reads central_banks and heat_state_v).
- app/pages/marketmap.js: Market Heatmap, 1 day change of each of the 28 currency pairs as tiles and ranked bars (reads prices).
- app/pages/creditspread.js: Credit Spreads, US high-yield spread with 1 day, 1 week and 1 month change, range stats and a 6M/1Y/3Y line chart (reads raw_values, series US_HY_SPREAD).
- app/pages/realyield.js: Real Yield History, 2 year yield minus yearly CPI for USD, EUR and CAD, monthly lines with a 1Y/3Y toggle (reads raw_values, 2Y yield and CPI series).
- app/css/tokens.css: colour, font, radius, gradient and shadow tokens, plus base resets. Dark is the default, light mode is a token swap on data-theme or prefers-color-scheme. The palette is declared only here.
- app/css/site.css: every other style, merged from the old split files in their original cascade order. Sections: base shell, design layer, per-page styles, legacy polish rules, shared data utilities (dtable, chip, gauge, brow, tile, dot, row2, legend), charts. The legacy palette, headings and shell overrides that used to fight tokens.css were removed.

## Older files at repo root
Left from the first version (index.html, scores.html, pair.html, central-banks.html, sentiment.html, cot.html, seasonality.html, whats-new.html, upgrade.html, tools.html, css/, js/). Delete this line once they are removed.

## Notes
- Web is now at ?v=102.
- Only public keys (Supabase URL and publishable key) are used here.
- The site never shows data source names or backtest numbers.
- Scores help prioritise attention. They are not trade entries or financial advice.
