var tlPx = {};

function tlUsd(q) {
  if (q === "USD") return 1;
  if (tlPx[q + "USD"]) return tlPx[q + "USD"];
  if (tlPx["USD" + q]) return 1 / tlPx["USD" + q];
  return null;
}

function tlCalc(el) {
  var out = el.querySelector("#tlo");
  var p = el.querySelector("#tlp").value;
  var bal = Number(el.querySelector("#tlb").value);
  var pct = Number(el.querySelector("#tlr").value);
  var sl = Number(el.querySelector("#tls").value);
  if (!(bal > 0 && pct > 0 && sl > 0)) { out.innerHTML = '<p class="muted">Fill in all fields.</p>'; return; }
  var q = p.slice(3), fx = tlUsd(q);
  if (!fx) { out.innerHTML = '<p class="down">No price to convert this pair.</p>'; return; }
  var pv = 100000 * (q === "JPY" ? 0.01 : 0.0001) * fx;
  var risk = bal * pct / 100;
  var lots = Math.floor(risk / (sl * pv) * 100 + 1e-9) / 100;
  var h = '<div class="card"><b>Result</b>';
  h += '<div class="rtn"><span>Risk budget</span><span>$' + risk.toFixed(2) + '</span></div>';
  h += '<div class="rtn"><span>Pip value, 1 lot</span><span>$' + pv.toFixed(2) + '</span></div>';
  if (lots < 0.01) {
    h += '<div class="rtn"><span class="down">Lot size</span><span class="down">0</span></div></div>';
    h += '<p class="down">Even 0.01 lot would risk $' + (0.01 * sl * pv).toFixed(2) + ', above your budget of $' + risk.toFixed(2) + '. Use a smaller stop or a larger budget.</p>';
  } else {
    h += '<div class="rtn"><span>Lot size (rounded down)</span><span><b>' + lots.toFixed(2) + '</b></span></div>';
    h += '<div class="rtn"><span>Actual risk at that size</span><span>$' + (lots * sl * pv).toFixed(2) + '</span></div></div>';
  }
  out.innerHTML = h;
}

PAGES.tools = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("prices?select=pair,d,close&order=d.desc&limit=300");
    r.forEach(function (x) { if (!tlPx[x.pair]) tlPx[x.pair] = Number(x.close); });
    var ps = Object.keys(tlPx).sort();
    var h = '<h1>Tools</h1><p class="muted sub">Lot size calculator for an account in USD.</p>';
    h += '<div class="card"><label class="muted">Pair</label><select id="tlp" class="tlf">';
    h += ps.map(function (p) { return '<option>' + esc(p) + '</option>'; }).join("") + '</select>';
    h += '<label class="muted">Balance (USD)</label><input id="tlb" class="tlf" type="number" inputmode="decimal" value="1000">';
    h += '<label class="muted">Risk per trade (%)</label><input id="tlr" class="tlf" type="number" inputmode="decimal" value="1">';
    h += '<label class="muted">Stop distance (pips)</label><input id="tls" class="tlf" type="number" inputmode="decimal" value="30"></div>';
    h += '<div id="tlo"></div>';
    h += '<p class="note">Lots are rounded down so the risk never goes above your budget. Pip values use the latest stored close, so treat them as close estimates and check your broker.</p>';
    h += '<p class="note">This is a sizing aid only. It is not a trade entry or financial advice.</p>';
    el.innerHTML = h;
    el.addEventListener("input", function () { tlCalc(el); });
    tlCalc(el);
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load tools: ' + esc(e.message) + '</p>';
  }
};
