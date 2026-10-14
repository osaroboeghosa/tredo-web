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

PAGES.banks = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("central_banks?select=currency,bank,policy_rate,rate_label,stance,trend,last_meeting,next_meeting,note&order=next_meeting.asc");
    var h = '<h1>Central Banks</h1><p class="muted sub">Policy rates, stance and the next meeting. Soonest meeting first.</p><div class="grid">';
    r.forEach(function (k) {
      var w = bkWhen(bkDays(k.next_meeting));
      var st = k.stance ? esc(k.stance) + (k.trend ? ", " + esc(k.trend) : "") : "";
      h += '<div class="card bkc"><div class="mh"><span class="mcur">' + esc(k.currency) + "</span>" + (st ? '<span class="badge">' + st + "</span>" : "") + "</div>";
      h += '<div class="bkn">' + esc(k.bank) + "</div>";
      h += '<div class="bkr">' + (k.policy_rate == null ? "n/a" : Number(k.policy_rate) + "%") + "</div>";
      h += '<div class="ms">' + esc(k.rate_label || "Policy rate") + "</div>";
      h += '<div class="mrow"><div class="mt"><span>Next meeting</span><span>' + esc(k.next_meeting || "n/a") + '</span></div><div class="ms ' + w[1] + '">' + w[0] + "</div></div>";
      h += '<div class="mrow"><div class="mt"><span>Last meeting</span><span>' + esc(k.last_meeting || "n/a") + "</span></div></div>";
      if (k.note) h += '<div class="ms bkx">' + esc(k.note) + "</div>";
      h += "</div>";
    });
    h += "</div>";
    h += '<p class="note">Rates, stance and meeting dates are updated by hand after each meeting. If a date has passed, the card says so.</p>';
    h += '<p class="note">Stance describes the tone of recent policy. It is context for the Rates signal and is not a forecast of the next decision.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load banks: ' + esc(e.message) + "</p>";
  }
};
