async function loadDash() {
  var app = document.getElementById("app");
  try {
    var s = await sb("scores_latest?select=pair,score,label,direction,tier,conviction,reason,as_of");
    var c = await sb("currency_strength?select=currency,value,as_of&order=as_of.desc&limit=8");
    s.sort(function (a, b) { return Math.abs(b.score) - Math.abs(a.score); });
    var h = "";
    if (s.length) h += '<p class="note">Scores as of ' + esc(s[0].as_of) + ". Tap a card for the full breakdown.</p>";
    h += '<div class="pairs">';
    s.forEach(function (x) {
      var d = dirClass(x.direction);
      h += '<a class="pcard" href="pair.html?p=' + esc(x.pair) + '"><div class="card"><div class="ptop"><span class="pname">' + esc(x.pair) + "</span>";
      h += '<span class="pscore ' + d + '">' + fmtScore(x.score) + "</span></div>";
      h += '<div class="plabel ' + d + '">' + esc(x.label) + "</div>";
      h += '<div class="badges"><span class="badge' + (x.tier === 1 ? " t1" : "") + '">' + tierName(x.tier) + "</span>";
      h += '<span class="badge">' + esc(x.conviction) + " conviction</span></div>";
      h += '<p class="reason">' + esc(x.reason) + "</p></div></a>";
    });
    h += "</div>";
    if (c.length) {
      var day = c[0].as_of;
      var cs = c.filter(function (r) { return r.as_of === day; });
      cs.sort(function (a, b) { return b.value - a.value; });
      h += "<h2>Currency strength</h2>";
      h += '<p class="note">Macro data picture, not a trade view.</p><div class="strip">';
      cs.forEach(function (r) {
        h += '<div class="chip"><b>' + esc(r.currency) + '</b><span class="' + signClass(r.value) + '">' + fmtVal(r.value) + "</span></div>";
      });
      h += "</div>";
    }
    app.innerHTML = h;
  } catch (e) {
    app.textContent = "Could not load scores: " + e.message;
  }
}
