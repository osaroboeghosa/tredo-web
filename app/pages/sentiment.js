function rtSig(p) {
  return p >= 70 ? -2 : p >= 58 ? -1 : p <= 30 ? 2 : p <= 42 ? 1 : 0;
}

function rtWord(s) {
  if (s <= -2) return "Crowded long, reads bearish";
  if (s === -1) return "Leans long, reads bearish";
  if (s === 0) return "Balanced";
  if (s === 1) return "Leans short, reads bullish";
  return "Crowded short, reads bullish";
}

function rtCard(x) {
  var l = Math.round(Number(x.long_pct));
  var s = rtSig(l);
  var c = s === 0 ? "muted" : (s > 0 ? "up" : "down");
  return '<a class="card rt" href="#/pair/' + esc(x.pair) + '"><div class="rtr"><span class="rtp">' + esc(x.pair) + '</span><span class="' + c + '">' + (s > 0 ? "+" : "") + s + '</span></div>' +
    '<div class="rtbar"><i class="rtl" style="width:' + l + '%"></i><i class="rts" style="width:' + (100 - l) + '%"></i></div>' +
    '<div class="rtn"><span>Long ' + l + '%</span><span>Short ' + (100 - l) + '%</span></div>' +
    '<div class="rtn"><span class="' + c + '">' + rtWord(s) + '</span></div></a>';
}

PAGES.sentiment = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("retail?select=pair,as_of,long_pct&order=as_of.desc&limit=200");
    var seen = {}, rows = [];
    r.forEach(function (x) {
      if (!seen[x.pair]) { seen[x.pair] = 1; rows.push(x); }
    });
    rows.sort(function (a, b) { return Number(b.long_pct) - Number(a.long_pct); });
    var h = '<h1>Sentiment</h1>';
    if (rows.length) h += '<p class="muted sub">Retail trader positioning, read as a contrarian signal. As of ' + esc(rows[0].as_of) + '</p>';
    h += filtBar() + '<div id="res"></div>';
    h += '<p class="note">Crowded longs (70% or more) read bearish. Crowded shorts (30% or less) read bullish. The number is the signal, from -2 to +2.</p>';
    h += '<p class="note">This is context only and is not part of the headline score. Tap a pair to open its detail page.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var f = rows.filter(function (x) { return filtMatch(x.pair); });
      res.innerHTML = f.length ? f.map(rtCard).join("") : filtEmpty();
    };
    filtWire(el, draw);
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load sentiment: ' + esc(e.message) + '</p>';
  }
};
