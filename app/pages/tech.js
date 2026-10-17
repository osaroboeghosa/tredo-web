function tcn(v) { return v == null ? null : Number(v); }
function tcs(v) { return v == null ? "n/a" : (v > 0 ? "+" : "") + v; }

function tcTotal(x) {
  var t = tcn(x.trend), s = tcn(x.season10);
  if (t == null && s == null) return null;
  return (t || 0) + (s || 0);
}

function tcKey(x) { var t = tcTotal(x); return t == null ? -1 : Math.abs(t); }

function tcDot(f, i) { return sdot(f == null ? null : (f === "Bullish" ? 2 : -2), i); }

function tcRow(x) {
  var t = tcTotal(x);
  var c = (t == null || t === 0) ? "muted" : (t > 0 ? "up" : "down");
  var d = [x.sma20, x.sma50, x.sma100, x.sma200].map(tcDot).join("");
  var sub = "Trend " + tcs(tcn(x.trend)) + " &middot; Season " + tcs(tcn(x.season10)) + (x.vol ? " &middot; " + esc(x.vol) + " volatility" : "");
  return '<a class="sr" href="#/pair/' + esc(x.pair) + '"><div class="sm"><div class="sn">' + esc(x.pair) + '</div><div class="sd2">' + sub + '</div></div><div class="dots">' + d + '</div><div class="sv ' + c + '">' + tcs(t) + '</div><span class="sch">&#8250;</span></a>';
}

PAGES.technical = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("tech?select=pair,as_of,trend,season10,sma20,sma50,sma100,sma200,vol&order=as_of.desc&limit=28");
    if (!r.length) {
      el.innerHTML = '<h1>Technical</h1><p class="muted">No data yet.</p>';
      return;
    }
    var day = r[0].as_of;
    r = r.filter(function (x) { return x.as_of === day; });
    r.sort(function (a, b) { return tcKey(b) - tcKey(a); });
    var h = '<h1>Technical</h1><p class="muted sub">As of ' + esc(day) + '</p>' + filtBar() + '<div id="res"></div>';
    h += '<p class="note">The big number is trend plus seasonality, from -4 to +4. Trend compares the 3-day and 14-day averages. Seasonality is the average return of the current month over 10 years. The four dots are the 20, 50, 100 and 200 day averages: green when price is above, red when below.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var f = r.filter(function (x) { return filtMatch(x.pair); });
      res.innerHTML = f.length ? '<div class="sl">' + f.map(tcRow).join("") + "</div>" : filtEmpty();
    };
    filtWire(el, draw);
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load technical data: ' + esc(e.message) + "</p>";
  }
};
