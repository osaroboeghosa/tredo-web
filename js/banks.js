function fmtRate(x) {
  var n = Number(x);
  if (isNaN(n)) return "n/a";
  return n.toFixed(3).replace(/0$/, "") + "%";
}

function daysTo(s) {
  if (!s) return null;
  var t = new Date(s + "T00:00:00Z").getTime();
  return Math.ceil((t - Date.now()) / 86400000);
}

async function loadBanks() {
  var app = document.getElementById("app");
  try {
    var r = await sb("central_banks?select=currency,bank,policy_rate,rate_label,stance,trend,last_meeting,next_meeting,note");
    r.sort(function (a, b) {
      return String(a.next_meeting || "9").localeCompare(String(b.next_meeting || "9"));
    });
    var h = '<p class="note">Sorted by next meeting. Updated by hand after each meeting.</p><div class="pairs">';
    r.forEach(function (x) {
      var dd = daysTo(x.next_meeting);
      var when = dd == null ? "" : dd > 0 ? " (in " + dd + " days)" : dd === 0 ? " (today)" : " (date passed, check)";
      h += '<div class="card"><div class="ptop"><span class="pname">' + esc(x.currency) + "</span>";
      h += '<span class="pscore">' + fmtRate(x.policy_rate) + "</span></div>";
      h += '<div class="plabel">' + esc(x.bank) + "</div>";
      h += '<div class="badges"><span class="badge">' + esc(x.stance) + '</span><span class="badge">' + esc(x.trend) + "</span></div>";
      h += '<p class="reason">' + esc(x.rate_label) + "</p>";
      h += '<p class="reason">Last meeting: ' + esc(x.last_meeting) + "</p>";
      h += '<p class="reason">Next meeting: ' + esc(x.next_meeting) + esc(when) + "</p>";
      if (x.note) h += '<p class="reason">' + esc(x.note) + "</p>";
      h += "</div>";
    });
    h += "</div>";
    h += '<p class="note">Stance and trend are our own reading of each bank\'s recent decisions. They do not feed the headline score.</p>';
    app.innerHTML = h;
  } catch (e) {
    app.textContent = "Could not load central banks: " + e.message;
  }
        }
