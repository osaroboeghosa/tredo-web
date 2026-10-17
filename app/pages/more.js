var mrItems = [
  ["weekly", "Weekly report", "Score changes, currency strength and upcoming events", "#0A84FF", "M4 7h16v13H4zM4 11h16M8 4v4M16 4v4", 0],
  ["sentiment", "Sentiment", "Where retail traders are positioned, read as a contrarian signal", "#FF9F0A", "M12 21a9 9 0 100-18 9 9 0 000 18zM8 14c1 2 7 2 8 0", 0],
  ["macro", "Macro", "Growth, retail sales, inflation and jobs for each currency", "#5E5CE6", "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18", 0],
  ["heatmap", "Heatmap", "Economic readings of all 8 currencies side by side", "#FF9500", "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", 0],
  ["technical", "Technical", "Trend, moving averages and volatility", "#FFD60A", "M4 16l4-4 3 3 5-6M4 20h16", 0],
  ["usecon", "US economy", "Latest US releases against forecast", "#FF375F", "M5 20v-9M12 20V5M19 20v-7", 0],
  ["seasonality", "Seasonality", "Average return of each calendar month", "#30D158", "M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 100 8 4 4 0 000-8z", 0],
  ["performance", "Performance", "Stored scores compared with what price did next", "#BF5AF2", "M4 18l5-6 4 3 7-9", 1],
  ["weights", "Weights", "Try your own signal weights on this phone", "#64D2FF", "M4 7h16M4 12h16M4 17h16M9 5v4M15 10v4M8 15v4", 1],
  ["accuracy", "How accurate is this?", "What the scores are and are not", "#FF453A", "M12 21a9 9 0 100-18 9 9 0 000 18zM12 8v5M12 16v.5", 1],
  ["tools", "Tools", "Lot size calculator", "#8E8E93", "M5 4h14v16H5zM8 8h8M8 12h2M12 12h2M8 16h2M12 16h4", 1]
];

function mrDark() {
  var t = document.documentElement.getAttribute("data-theme");
  if (t) return t === "dark";
  return !window.matchMedia("(prefers-color-scheme: light)").matches;
}

function mrRow(x) {
  return '<a class="mrw" href="#/' + x[0] + '"><span class="mic" style="background:' + x[3] + '"><svg viewBox="0 0 24 24"><path d="' + x[4] + '"/></svg></span>' +
    '<span class="mtx">' + esc(x[1]) + '<small>' + esc(x[2]) + '</small></span><span class="mch">&rsaquo;</span></a>';
}

PAGES.more = async function (el) {
  var g = ["Reports", "Tools and info"];
  var h = "<h1>More</h1>";
  g.forEach(function (t, i) {
    h += "<h2>" + t + '</h2><div class="mgx">' + mrItems.filter(function (x) { return x[5] === i; }).map(mrRow).join("") + "</div>";
  });
  h += '<h2>Appearance</h2><div class="mgx"><div class="mrw"><span class="mtx">Dark mode</span><button class="msw' + (mrDark() ? " on" : "") + '" id="mrsw" aria-label="Dark mode"><i></i></button></div></div>';
  el.innerHTML = h;
  var b = el.querySelector("#mrsw");
  b.onclick = function () {
    var t = document.getElementById("theme");
    if (t) t.click();
    setTimeout(function () { b.className = "msw" + (mrDark() ? " on" : ""); }, 50);
  };
};
