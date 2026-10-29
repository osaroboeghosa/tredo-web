/* tredo shell: landing entry, desktop workspace sidebar, mobile tab bar, page transitions. */

var TABS = [["home", "Home"], ["scores", "Scores"], ["flow", "Flow"], ["banks", "Banks"], ["more", "More"]];

var NAV_MAIN = [
  ["home", "Home", "M8 2a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2zM8 2a2 2 0 002 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2z"],
  ["scores", "Scores", "M5 20V10M12 20V4M15 5v5m0 0h5m-5-5a7 7 0 110 14h2a7 7 0 010-14h-2z"],
  ["flow", "Flow", "M4 7h16M8 21l4-4h-4zM12 3v9m0 0v9m0-9h.01M12 15l3 3m0 0l-3 3m0-6V3"],
  ["banks", "Banks", "M5 2v6m3 6V2m-3-6h.01M3 21h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14z"],
  ["more", "More", "M6 12h.01M12 12h.01M18 12h.01"]
];

var NAV_SUB = [
  ["alerts", "Alerts", "M12 4l9 16H3a2 2 0 00-2 2V8a2 2 0 002 0V4a4 4 0 01-4 4 4 4 0 01-4-4V3a4 4 0 014-4 4 4 0 014 4zM12 16l-1-5M12 1l1 5"],
  ["strength", "Strength", "M4 8h16M8 14l2 2M16 14l2-2M12 20a4 4 0 000-8 4 4 0 000 8z"],
  ["corr", "Correlations", "M2 4h20M2 10h20M2 16h20"],
  ["calendar", "Calendar", "M4 7h16M8 20l4-4H7M5 18l3-3 3 3M5 12h.01M9 12h.01M13 12h.01"]
];

var NAVMAP = { pair: "scores", scan: "home" };

var LBL = {
  home: "Home", scores: "Scores", flow: "Flow", banks: "Banks", more: "More",
  alerts: "Confluence alerts", strength: "Currency strength", corr: "Correlations",
  calendar: "Calendar", pair: "Pair detail", scan: "Pair detail", auth: "Account"
};

var NO_SKELETON = { start: 1, auth: 1, more: 1 };
var shellMode = null;
var liveState = null;

function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("tredo-theme", t); } catch (e) {}
}

function initTheme() {
  var t = null;
  try { t = localStorage.getItem("tredo-theme"); } catch (e) {}
  if (t) setTheme(t);
}

function label(name) {
  if (LBL[name]) return LBL[name];
  var s = String(name || "").replace(/[-_]/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function navIcon(d) {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
}

function sideHTML() {
  var main = NAV_MAIN.map(function (n) {
    return '<a href="#/' + n[0] + '" data-nav="' + n[0] + '">' + navIcon(n[2]) + "<span>" + esc(n[1]) + "</span></a>";
  }).join("");
  var sub = NAV_SUB.map(function (n) {
    return '<a href="#/' + n[0] + '" data-nav="' + n[0] + '">' + navIcon(n[2]) + "<span>" + esc(n[1]) + "</span></a>";
  }).join("");
  return '<a class="side-brand brand" href="#/home">' + esc(TREDO.name) + "<b>.</b></a>" +
    '<div class="side-tag">Macro confluence for FX</div>' +
    '<nav class="snav" id="snav">' + main + "</nav>" +
    '<div class="side-label">Signals</div>' +
    '<nav class="snav snav-sub" id="ssub">' + sub + "</nav>" +
    '<div class="side-foot"><a href="#/start">About tredo</a><span class="ver">v1.0</span></div>';
}

function appTopHTML(pageLabel) {
  return '<div class="topbar">' +
    '<a class="brand" href="#/home">' + esc(TREDO.name) + "<b>.</b></a>" +
    '<div class="crumb"><span class="cb">Workspace</span><span class="sep">/</span><b id="cnow">' + esc(pageLabel) + "</b></div>" +
    '<div class="ta">' +
      '<span class="live" id="livetag"><i></i><span>Live data</span></span>' +
      '<button id="theme" title="Light / dark">&#9686;</button>' +
      '<span id="authbox"></span>' +
    "</div></div>";
}

function landingTopHTML() {
  return '<div class="topbar landing-bar">' +
    '<a class="brand" href="#/start">' + esc(TREDO.name) + "<b>.</b></a>" +
    '<nav class="lnav">' +
      '<a href="#/start" data-scroll="features">Features</a>' +
      '<a href="#/start" data-scroll="how">How it works</a>' +
      '<a href="#/start" data-scroll="faq">FAQ</a>' +
    "</nav>" +
    '<div class="ta">' +
      '<a class="btn ghost sm" href="#/auth">Sign in</a>' +
      '<a class="btn primary sm" href="#/home">Get started</a>' +
    "</div></div>";
}

function bindShell() {
  var b = document.getElementById("theme");
  if (b) b.onclick = function () {
    var cur = document.documentElement.getAttribute("data-theme");
    if (!cur) cur = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    setTheme(cur === "dark" ? "light" : "dark");
  };
  Array.prototype.forEach.call(document.querySelectorAll(".lnav [data-scroll]"), function (a) {
    a.onclick = function (e) {
      var t = document.getElementById(a.getAttribute("data-scroll"));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  });
  if (typeof renderAuthbox === "function") renderAuthbox();
  if (typeof authInit === "function") authInit();
}

function renderShell(mode, tab, name) {
  var side = document.getElementById("side");
  if (side && !side.childNodes.length) side.innerHTML = sideHTML();
  var tabs = document.getElementById("tabs");
  if (tabs && !tabs.childNodes.length) {
    tabs.innerHTML = TABS.map(function (t) {
      return '<a href="#/' + t[0] + '" data-tab="' + t[0] + '">' + esc(t[1]) + "</a>";
    }).join("");
  }
  if (tabs) {
    Array.prototype.forEach.call(tabs.querySelectorAll("a[data-tab]"), function (a) {
      a.classList.toggle("on", a.getAttribute("data-tab") === tab);
    });
  }
  var top = document.getElementById("top");
  if (mode !== shellMode) {
    top.innerHTML = mode === "landing" ? landingTopHTML() : appTopHTML(label(name));
    shellMode = mode;
    bindShell();
  }
  if (mode === "app") {
    var c = document.getElementById("cnow");
    if (c) c.textContent = label(name);
    Array.prototype.forEach.call(document.querySelectorAll("#side a[data-nav]"), function (a) {
      a.classList.toggle("on", a.getAttribute("data-nav") === tab);
    });
    shellLive();
  }
}

function fmtDay(d) {
  var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var p = String(d || "").split("-");
  if (p.length < 3) return String(d || "");
  return Number(p[2]) + " " + (m[Number(p[1]) - 1] || "");
}

function paintLive(d) {
  var t = document.getElementById("livetag");
  if (!t) return;
  if (!d) { t.style.display = "none"; return; }
  t.style.display = "";
  var s = t.querySelector("span");
  if (s) s.textContent = "Scores " + fmtDay(d);
  t.dataset.painted = "1";
}

function shellLive() {
  var t = document.getElementById("livetag");
  if (!t) return;
  if (liveState) { paintLive(liveState); return; }
  var cached = null;
  try { cached = JSON.parse(sessionStorage.getItem("tredo-live") || "null"); } catch (e) {}
  if (cached && cached.d) { liveState = cached.d; paintLive(liveState); return; }
  if (!window.sb) { paintLive(null); return; }
  sb("scores_v3?select=as_of&order=as_of.desc&limit=1").then(function (r) {
    if (r && r[0] && r[0].as_of) {
      liveState = r[0].as_of;
      paintLive(liveState);
      try { sessionStorage.setItem("tredo-live", JSON.stringify({ d: liveState })); } catch (e) {}
    }
  }).catch(function () {});
}

function skel() {
  var stat = '<div class="sk sk-stat"></div>';
  var line = '<div class="sk sk-line"></div>';
  return '<div class="skwrap" aria-busy="true" aria-label="Loading">' +
    '<div class="sk sk-kicker"></div><div class="sk sk-title"></div><div class="sk sk-sub"></div>' +
    '<div class="sk-stats">' + stat + stat + stat + stat + "</div>" +
    '<div class="sk sk-hero"></div>' +
    '<div class="sk-lines">' + line + line + line + line + "</div>" +
    "</div>";
}

function route() {
  var raw = (location.hash || "").replace(/^#\/?/, "");
  var parts = raw.split("/");
  var name = parts[0] || "start";
  var arg = parts[1] || "";
  var landing = name === "start";
  var nav = NAVMAP[name] || name;

  document.body.classList.toggle("landing", landing);
  renderShell(landing ? "landing" : "app", nav, name);

  var el = document.getElementById("view");
  if (PAGES[name]) {
    if (!NO_SKELETON[name]) el.innerHTML = skel();
    PAGES[name](el, arg);
  } else {
    el.innerHTML = '<div class="pagehead"><div><div class="kicker">Not found</div><h1>' + esc(label(name)) + "</h1></div></div>" +
      '<p class="muted sub">This page is being rebuilt. Head back to the workspace.</p>' +
      '<a class="btn primary" href="#/home">Open the app</a>';
  }
  window.scrollTo(0, 0);
}

function drawShell() {
  var foot = document.getElementById("foot");
  if (foot) foot.textContent = TREDO.disclaimer;
}

initTheme();
drawShell();
route();
window.addEventListener("hashchange", route);
