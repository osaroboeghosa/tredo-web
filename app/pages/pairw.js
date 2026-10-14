var pwLab = {
  Momentum: "Momentum", COT: "Large trader positioning", Rates: "Rate difference",
  GDP: "Growth", "Retail Sales": "Retail sales", Retail: "Retail trader positioning",
  CPI: "Inflation", UE: "Unemployment", Season: "Seasonality"
};

function pwRow(x) {
  var c = x.v > 0 ? "up" : "down";
  return '<div class="rtn"><span>' + esc(pwLab[x.n] || x.n) + '</span><span class="' + c + '">' + (x.v > 0 ? "+" : "") + x.v + '</span></div>';
}

async function pwLoad(p) {
  var r = await sb("signals_latest?pair=eq." + p + "&select=name,value");
  var up = [], dn = [], fl = [], na = [];
  r.forEach(function (x) {
    if (x.value === null || x.value === undefined) { na.push(pwLab[x.name] || x.name); return; }
    var v = Number(x.value);
    if (v > 0) up.push({ n: x.name, v: v });
    else if (v < 0) dn.push({ n: x.name, v: v });
    else fl.push(pwLab[x.name] || x.name);
  });
  up.sort(function (a, b) { return b.v - a.v; });
  dn.sort(function (a, b) { return a.v - b.v; });
  var h = '<h2>Signal drivers</h2><div class="card"><b>Pointing up</b>';
  h += up.length ? up.map(pwRow).join("") : '<div class="rtn"><span class="muted">None</span></div>';
  h += '<p></p><b>Pointing down</b>';
  h += dn.length ? dn.map(pwRow).join("") : '<div class="rtn"><span class="muted">None</span></div>';
  if (up.length && dn.length) {
    h += '<p class="reason">Mixed picture: ' + up.length + ' signal' + (up.length > 1 ? "s" : "") + ' point up and ' + dn.length + ' point down. Read the score with care.</p>';
  }
  if (fl.length) h += '<p class="reason">Neutral: ' + esc(fl.join(", ")) + '.</p>';
  if (na.length) h += '<p class="reason">No data: ' + esc(na.join(", ")) + '.</p>';
  return h + '</div><p class="note">A positive number favours the first currency of the pair. Each signal runs from -2 to +2.</p>';
}

var pwBase = PAGES.pair;
PAGES.pair = async function (el, p) {
  await pwBase(el, p);
  if (!el.querySelector(".ph")) return;
  try {
    var h = await pwLoad(p);
    if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", h);
  } catch (e) {
    el.insertAdjacentHTML("beforeend", '<p class="note">Could not load signal drivers.</p>');
  }
};
