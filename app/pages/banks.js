function bkDays(d) {
  if (!d) return null;
  var t = new Date(); t = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  return Math.round((Date.parse(d + "T00:00:00Z") - t) / 86400000);
}

function bkWhen(n) {
  if (n == null) return ["n/a", "muted"];
  if (n < 0) return ["Date passed, update due", "down"];
  if (n === 0) return ["Today", "up"];
  return ["In " + n + (n === 1 ? " day" : " days"), n <= 7 ? "up" : "muted"];
}

function bkRow(k) {
  var w = bkWhen(bkDays(k.next_meeting));
  var st = k.stance ? esc(k.stance) + (k.trend ? ", " + esc(k.trend) : "") : "";
  var h = '<div class="bkq"><div class="bkt"><div class="bkm"><span class="bkcu">' + esc(k.currency) + '</span> <span class="bkna">' + esc(k.bank) + '</span></div>';
  h += '<div class="bkrt">' + (k.policy_rate == null ? "n/a" : Number(k.policy_rate) + "%") + '</div></div>';
  h += '<div class="bkt"><div class="bks">' + esc(k.rate_label || "Policy rate") + '</div><div class="bks ' + w[1] + '">' + w[0] + '</div></div>';
  h += '<div class="bks">Next ' + esc(k.next_meeting || "n/a") + " &middot; Last " + esc(k.last_meeting || "n/a") + (st ? " &middot; " + st : "") + '</div>';
  if (k.note) h += '<div class="bks bknt">' + esc(k.note) + '</div>';
  return h + "</div>";
}

PAGES.banks = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("central_banks?select=currency,bank,policy_rate,rate_label,stance,trend,last_meeting,next_meeting,note&order=next_meeting.asc");
    var h = '<h1>Central Banks</h1><p class="muted sub">Policy rates, stance and the next meeting. Soonest meeting first.</p>';
    h += '<div class="bkg">' + r.map(bkRow).join("") + "</div>";
    h += '<p class="note">Rates, stance and meeting dates are updated by hand after each meeting. If a date has passed, the row says so.</p>';
    h += '<p class="note">Stance describes the tone of recent policy. It is context for the Rates signal and is not a forecast of the next decision.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load banks: ' + esc(e.message) + "</p>";
  }
};
