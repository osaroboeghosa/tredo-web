var tlPx = {};

function tlUsd(q) {
  if (q === "USD") return 1;
  if (tlPx[q + "USD"]) return tlPx[q + "USD"];
  if (tlPx["USD" + q]) return 1 / tlPx["USD" + q];
  return null;
}

function tlF(l, id, c) {
  return '<div class="gr"><label class="gl" for="' + id + '">' + l + '</label>' + c + '</div>';
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
  var a = [gxr("Risk budget", "", "$" + risk.toFixed(2)), gxr("Pip value, 1 lot", "", "$" + pv.toFixed(2))];
  var h = "<h2>Result</h2>";
  if (lots < 0.01) {
    a.push(gxr("Lot size", "", "0", "down"));
    h += gxg(a) + '<p class="down">Even 0.01 lot would risk $' + (0.01 * sl * pv).toFixed(2) + ', above your budget of $' + risk.toFixed(2) + '. Use a smaller stop or a larger budget.</p>';
  } else {
    a.push(gxr("Lot size (rounded down)", "", "<b>" + lots.toFixed(2) + "</b>"));
    a.push(gxr("Actual risk at that size", "", "$" + (lots * sl * pv).toFixed(2)));
    h += gxg(a);
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
    h += '<div class="gx">';
    h += tlF("Pair", "tlp", '<select id="tlp" class="tlf">' + ps.map(function (p) { return '<option>' + esc(p) + '</option>'; }).join("") + '</select>');
    h += tlF("Balance (USD)", "tlb", '<input id="tlb" class="tlf" type="number" inputmode="decimal" value="1000">');
    h += tlF("Risk per trade (%)", "tlr", '<input id="tlr" class="tlf" type="number" inputmode="decimal" value="1">');
    h += tlF("Stop distance (pips)", "tls", '<input id="tls" class="tlf" type="number" inputmode="decimal" value="30">');
    h += '</div><div id="tlo"></div>';
    h += '<p class="note">Lots are rounded down so the risk never goes above your budget. Pip values use the latest stored close, so treat them as close estimates and check your broker.</p>';
    h += '<p class="note">This is a sizing aid only. It is not a trade entry or financial advice.</p>';
    el.innerHTML = h;
    el.addEventListener("input", function () { tlCalc(el); });
    tlCalc(el);
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load tools: ' + esc(e.message) + '</p>';
  }
};
