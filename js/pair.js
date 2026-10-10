var PS = ["Momentum", "Rates", "GDP", "Retail Sales", "CPI", "UE", "COT", "Retail", "Season"];

function sigText(n, d) {
  d = d || {};
  if (n === "Momentum") return d.z == null ? "" : "Trend strength z = " + Number(d.z).toFixed(2);
  if (n === "Rates") return d.diff == null ? "" : "Rate gap (base minus quote): " + Number(d.diff).toFixed(2);
  if (n === "Retail") return d.long_pct == null ? "" : d.long_pct + "% of retail traders are long (read as contrarian)";
  if (n === "Season") return d.avg2y == null ? "" : "2Y avg " + Number(d.avg2y).toFixed(2) + ", 5Y avg " + Number(d.avg5y).toFixed(2);
  if (d.base != null) return "Base step " + fmtScore(d.base) + ", quote step " + fmtScore(d.quote);
  return "";
}

function blockDir(d) {
  return d > 0 ? "bullish" : d < 0 ? "bearish" : "neutral";
}

async function loadPair() {
  var app = document.getElementById("app");
  var p = new URLSearchParams(location.search).get("p") || "";
  if (!/^[A-Z]{6}$/.test(p)) {
    app.innerHTML = '<p class="note">Pick a pair from the <a href="index.html">Dashboard</a>.</p>';
    return;
  }
  try {
    var r = await sb("scores_latest?pair=eq." + p + "&select=*");
    var g = await sb("signals_latest?pair=eq." + p + "&select=name,value,detail");
    if (!r.length) { app.textContent = "No score for " + p + " yet."; return; }
    var x = r[0], d = dirClass(x.direction), m = {};
    g.forEach(function (s) { m[s.name] = s; });
    document.title = "tredo | " + p;
    var h = '<div class="card"><div class="ptop"><span class="pname">' + esc(p) + '</span><span class="pscore ' + d + '">' + fmtScore(x.score) + "</span></div>";
    h += '<div class="plabel ' + d + '">' + esc(x.label) + "</div>";
    h += '<div class="badges"><span class="badge' + (x.tier === 1 ? " t1" : "") + '">' + tierName(x.tier) + "</span>";
    h += '<span class="badge">' + esc(x.conviction) + " conviction</span>";
    h += '<span class="badge">Data confidence: ' + esc(x.confidence) + "</span>";
    h += '<span class="badge">' + esc(x.band) + " size</span></div>";
    h += '<p class="reason">' + esc(x.reason) + "</p>";
    h += '<p class="note">Scores as of ' + esc(x.as_of) + ". " + x.aligned + " of 9 signals align with the headline. Headline uses " + x.n_headline + " of 6 signals.</p></div>";
    h += "<h2>Blocks</h2><div class=\"strip\">";
    var b = x.blocks || {};
    Object.keys(b).forEach(function (k) {
      var bd = blockDir(b[k].dir), mn = b[k].mean;
      h += '<div class="chip"><b>' + esc(k) + '</b><span class="' + dirClass(bd) + '">' + (mn == null ? "n/a" : (mn > 0 ? "+" : "") + Number(mn).toFixed(2)) + "</span></div>";
    });
    h += '</div><p class="note">' + x.agreement + " of 3 blocks match the headline.</p>";
    h += "<h2>Signals</h2>";
    PS.forEach(function (n) {
      var s = m[n], v = s ? s.value : null;
      h += '<div class="card srow"><div class="ptop"><span class="pname sn">' + esc(n) + '</span><span class="pscore sv ' + signClass(v) + '">' + fmtScore(v) + "</span></div>";
      h += '<p class="reason">' + esc(s ? sigText(n, s.detail) : "") + "</p></div>";
    });
    var lp = m["Retail"] && m["Retail"].detail ? m["Retail"].detail.long_pct : null;
    if (lp != null) {
      h += "<h2>Retail positioning</h2>";
      h += '<div class="rbar"><div class="rl" style="width:' + lp + '%"></div></div>';
      h += '<p class="note">Long ' + lp + "% | Short " + (100 - lp) + "%. Crowds are often wrong at extremes, so this is read as contrarian.</p>";
    }
    app.innerHTML = h;
  } catch (e) {
    app.textContent = "Could not load " + p + ": " + e.message;
  }
                                      }
