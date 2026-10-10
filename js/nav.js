(function () {
  var PAGES = [
    ["Dashboard", "index.html", true],
    ["Scores", "scores.html", true],
    ["Sentiment", "sentiment.html", true],
    ["COT", "cot.html", true],
    ["Central Banks", "central-banks.html", true],
    ["Seasonality", "seasonality.html", true],
    ["Alerts", "alerts.html", false],
    ["Tools", "tools.html", false],
    ["What's New", "whats-new.html", false],
    ["Upgrade", "upgrade.html", false]
  ];
  var here = location.pathname.split("/").pop() || "index.html";
  var items = PAGES.map(function (p) {
    if (!p[2]) {
      return '<span class="nav-item soon">' + p[0] + "<small>soon</small></span>";
    }
    var on = p[1] === here ? " active" : "";
    return '<a class="nav-item' + on + '" href="' + p[1] + '">' + p[0] + "</a>";
  }).join("");
  var nav = document.getElementById("nav");
  if (nav) {
    nav.innerHTML = '<div class="bar"><a class="brand" href="index.html">tredo</a>' +
      '<button id="menuBtn" type="button">Menu</button></div>' +
      '<nav id="menu" class="menu">' + items + "</nav>";
    document.getElementById("menuBtn").onclick = function () {
      document.getElementById("menu").classList.toggle("open");
    };
  }
  var foot = document.getElementById("foot");
  if (foot) {
    foot.className = "foot";
    foot.textContent = "Scores help prioritise attention. They are not trade entries or financial advice.";
  }
})();
