var acLimits = [
  "Scores are an attention ranking, not forecasts or probabilities.",
  "Signals currently carry equal weight, a starting point that will be refined.",
  "Thresholds are set by hand and will be reviewed as more data arrives.",
  "A score built from fewer signals can swing further than one built from more."
];

var acOpen = [
  "Cross pairs", "Retail sentiment", "Bond yields", "Surveys",
  "Positioning speed", "Actual versus forecast"
];

PAGES.accuracy = async function (el) {
  var h = '<h1>How accurate is this?</h1>';
  h += '<p class="muted sub">Accuracy is not proven. Scores rank where to look first. They are not forecasts.</p>';
  h += '<div class="card"><b>Where this stands</b>';
  h += '<div class="rtn"><span>The rules are being tested and refined. Results will be published here once they have been checked on past data.</span></div></div>';
  h += '<div class="card"><b>Still being checked</b>';
  h += '<div class="rtn"><span>' + acOpen.map(esc).join(", ") + '.</span></div></div>';
  h += '<div class="card"><b>Known limits</b>';
  h += acLimits.map(function (t) { return '<div class="rtn"><span>' + esc(t) + '</span></div>'; }).join("") + '</div>';
  h += '<p class="note">A rule changes only after it holds on both halves of the history, and every change gets a new version label.</p>';
  h += '<p class="note">The live record is on the <a href="#/performance">Performance</a> page.</p>';
  h += '<p class="note">Past results do not predict future results.</p>';
  el.innerHTML = h;
};
