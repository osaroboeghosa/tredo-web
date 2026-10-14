var acTests = [
  ["Momentum, 7 USD pairs", "48 to 49%", "No edge"],
  ["Seasonality, 7 USD pairs", "47%", "No edge"],
  ["Rate difference (carry)", "52.1%", "Stable, small"],
  ["Positioning of large traders", "n/a", "No variant held in both halves"],
  ["US inflation signal", "61 to 66%", "Did not repeat on other currencies"],
  ["Other currencies, macro pooled", "n/a", "No reliable edge"]
];

var acOpen = [
  "Cross pairs", "JPY and NZD macro", "Retail sentiment", "Futures positioning split",
  "Positioning velocity", "Bond yields", "Surveys", "Actual versus forecast"
];

function acRow(t) {
  return '<div class="rtn"><span>' + esc(t[0]) + '</span><span>' + esc(t[1]) + '</span></div>' +
    '<div class="rtn"><span class="muted">' + esc(t[2]) + '</span></div>';
}

PAGES.accuracy = async function (el) {
  var h = '<h1>How accurate is this?</h1>';
  h += '<p class="muted sub">Short answer: not proven. Scores rank where to look first. They are not forecasts.</p>';
  h += '<div class="card"><b>Tests on past data</b>';
  h += '<p class="muted">Share of times the signal pointed the right way. 50% is a coin flip.</p>';
  h += acTests.map(acRow).join("") + '</div>';
  h += '<div class="card"><b>What we did about it</b>';
  h += '<div class="rtn"><span>All weights kept, no sign flipped. Nothing was tuned to chase a result.</span></div></div>';
  h += '<div class="card"><b>Not tested yet</b>';
  h += '<div class="rtn"><span>' + acOpen.map(esc).join(", ") + '.</span></div></div>';
  h += '<div class="card"><b>Known weaknesses</b>';
  h += '<div class="rtn"><span>All signals carry equal weight, with no evidence for that.</span></div>';
  h += '<div class="rtn"><span>Data releases are compared with the previous one, not with the level.</span></div>';
  h += '<div class="rtn"><span>Thresholds were set by hand.</span></div>';
  h += '<div class="rtn"><span>A score built from 3 signals can reach +100 or -100 as easily as one built from 6.</span></div>';
  h += '<div class="rtn"><span>Scores are not probabilities.</span></div></div>';
  h += '<p class="note">About 35 combinations were tested, so a single good line can be chance. A rule changes only if it holds in both halves of the history.</p>';
  h += '<p class="note">The live record is on the <a href="#/performance">Performance</a> page.</p>';
  h += '<p class="note">Past results do not predict future results.</p>';
  el.innerHTML = h;
};
