function ring(score) {
  var C = 163.4;
  var a = Math.min(100, Math.abs(score)) / 100 * C;
  var col = Math.abs(score) < 10 ? "var(--muted)" : (score > 0 ? "var(--up)" : "var(--down)");
  return '<svg class="ring" viewBox="0 0 64 64">' +
    '<circle cx="32" cy="32" r="26" fill="none" stroke="var(--line)" stroke-width="6"/>' +
    '<circle cx="32" cy="32" r="26" fill="none" stroke="' + col + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + a.toFixed(1) + ' ' + C + '" transform="rotate(-90 32 32)"/>' +
    '<text x="32" y="37" text-anchor="middle" font-size="16" font-weight="700" fill="var(--text)">' + (score > 0 ? "+" : "") + score + '</text></svg>';
}

function pairCard(x) {
  var s = Number(x.score);
  return '<a class="card pair" href="#/pair/' + esc(x.pair) + '">' + ring(s) +
    '<div class="sym">' + esc(x.pair) + '</div><div class="lab">' + esc(x.label) + '</div></a>';
}

PAGES.home = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var rows = await sb("scores_latest?select=pair,score,label&order=score.desc");
    el.innerHTML = '<h1>Which pairs deserve attention</h1><p class="muted sub">Macro gives the bias. The chart gives the timing.</p><div class="grid">' + rows.map(pairCard).join("") + '</div>';
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load scores: ' + esc(e.message) + '</p>';
  }
};
