var TABS = [["home", "Home"], ["scores", "Scores"], ["flow", "Flow"], ["banks", "Banks"], ["more", "More"]];

function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("tredo-theme", t); } catch (e) {}
}

function initTheme() {
  var t = null;
  try { t = localStorage.getItem("tredo-theme"); } catch (e) {}
  if (t) setTheme(t);
}

function drawShell() {
  document.getElementById("top").innerHTML = '<div class="brand">' + esc(TREDO.name) + '<b>.</b></div><button id="theme">Light / Dark</button>';
  document.getElementById("foot").textContent = TREDO.disclaimer;
  document.getElementById("theme").onclick = function () {
    var cur = document.documentElement.getAttribute("data-theme");
    if (!cur) cur = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    setTheme(cur === "light" ? "dark" : "light");
  };
}

function route() {
  var parts = (location.hash || "#/home").replace("#/", "").split("/");
  var name = parts[0] || "home";
  var arg = parts[1] || "";
  var tab = name === "pair" ? "scores" : name;
  var isTab = TABS.some(function (t) { return t[0] === tab; });
  if (!isTab) tab = "more";
  document.getElementById("tabs").innerHTML = TABS.map(function (t) {
    return '<a href="#/' + t[0] + '" class="' + (t[0] === tab ? "on" : "") + '">' + t[1] + '</a>';
  }).join("");
  var el = document.getElementById("view");
  if (PAGES[name]) PAGES[name](el, arg);
  else el.innerHTML = '<h1>' + esc(name) + '</h1><p class="muted sub">This page is being rebuilt.</p>';
  window.scrollTo(0, 0);
}

initTheme();
drawShell();
route();
window.addEventListener("hashchange", route);
