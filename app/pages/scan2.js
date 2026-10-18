function scnCot(c, cur) {
  if (!c) return gxr(cur + " net positioning", "", "n/a", "muted");
  var w = c.weekly_change == null ? "" : "Weekly change " + (c.weekly_change > 0 ? "+" : "") + Number(c.weekly_change).toLocaleString();
  var p = c.pct52 == null ? "" : " · " + Math.round(c.pct52) + "th percentile of 52 weeks";
  return gxr(cur + " net positioning", w + p + " · " + esc(c.report_date), Number(c.net).toLocaleString(), Number(c.net) >= 0 ? "up" : "down");
}

function scnP(title, score, rows) {
  score = scnV(score);
  return "<h2>" + title + "</h2>" + gxg([gxr("Panel score", "", scnN(score), scnC(score))].concat(rows));
}

function scnPanels(x, t, cb, cots, rt, sd) {
  var b = x.pair.slice(0, 3), q = x.pair.slice(3), pr = {};
  cb.forEach(function (r) { pr[r.currency] = r.policy_rate == null ? "n/a" : Number(r.policy_rate).toFixed(2) + "%"; });
  var h = scnP("Technical", x.technical, [
    scnR("Trend", "Short-term average against medium-term average", x.trend),
    scnR("Seasonality", t && t.season10_avg != null ? "Average move this month over 10 years: " + t.season10_avg + "%" : "This month over 10 years", x.season)
  ]);
  h += scnP("Institutional activity", x.cot, [scnCot(cots[0], b), scnCot(cots[1], q), scnR("Positioning signal", "Big-trader positioning, base against quote", x.cot)]);
  h += scnP("Crowd sentiment", x.crowd, [scnR("Retail crowd", rt && rt.long_pct != null ? Math.round(rt.long_pct) + "% of retail traders are long (read as contrarian)" : "No data", x.crowd)]);
  h += scnP("Economic growth", x.growth, [scnR("GDP", scnS(sd["GDP"], b, q, "Output growth, base against quote"), x.gdp), scnR("Retail sales", scnS(sd["Retail Sales"], b, q, "Spending, base against quote"), x.retail_sales), scnR("Consumer confidence", "How households feel", x.consumer)]);
  h += scnP("Inflation", x.inflation, [scnR("CPI", scnS(sd["CPI"], b, q, "Consumer prices, base against quote"), x.cpi), scnR("Interest rates", b + " " + pr[b] + " · " + q + " " + pr[q], x.rates), scnR("PPI", "US producer prices", x.ppi), scnR("PCE", "US core PCE prices", x.pce)]);
  h += scnP("Jobs market", x.jobs, [scnR("Unemployment", scnS(sd["UE"], b, q, "Jobless rate, base against quote"), x.unemp), scnR("NFP", "US monthly job gains", x.nfp), scnR("Jobless claims", "US weekly claims", x.claims), scnR("JOLTS", "US job openings", x.jolts)]);
  return h;
}
