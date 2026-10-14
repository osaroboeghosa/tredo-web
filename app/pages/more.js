var mrItems = [
  ["weekly", "Weekly report", "Score changes, currency strength and upcoming events"],
  ["sentiment", "Sentiment", "Where retail traders are positioned, read as a contrarian signal"],
  ["macro", "Macro", "Growth, retail sales, inflation and jobs for each currency"],
  ["seasonality", "Seasonality", "Average return of each calendar month"],
  ["performance", "Performance", "Stored scores compared with what price did next"],
  ["accuracy", "How accurate is this?", "What the scores are and are not"],
  ["tools", "Tools", "Lot size calculator"]
];

PAGES.more = async function (el) {
  var h = '<h1>More</h1><p class="muted sub">Every page in one place.</p>';
  h += mrItems.map(function (x) {
    return '<a class="card rt" href="#/' + x[0] + '"><div class="rtr"><span class="rtp">' + esc(x[1]) + '</span><span class="muted">&rsaquo;</span></div>' +
      '<div class="rtn"><span class="muted">' + esc(x[2]) + '</span></div></a>';
  }).join("");
  el.innerHTML = h;
};
