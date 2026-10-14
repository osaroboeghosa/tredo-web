var FILT = {mode: "all", q: ""};

function filtMatch(pair) {
  var p = String(pair).toUpperCase();
  var usd = p.indexOf("USD") !== -1;
  if (FILT.mode === "usd" && !usd) return false;
  if (FILT.mode === "cross" && usd) return false;
  if (FILT.q && p.indexOf(FILT.q.toUpperCase()) === -1) return false;
  return true;
}

function filtBar() {
  var b = [["all", "All"], ["usd", "USD pairs"], ["cross", "Crosses"]];
  var h = '<div class="fbar">';
  b.forEach(function (x) {
    h += '<button type="button" class="fbtn' + (FILT.mode === x[0] ? " on" : "") + '" data-m="' + x[0] + '">' + x[1] + "</button>";
  });
  h += '</div><input id="fq" class="fq" type="search" placeholder="Search pair or currency, e.g. JPY" value="' + esc(FILT.q) + '">';
  return h;
}

function filtEmpty() {
  return '<p class="muted">No pairs match.</p>';
}

function filtWire(el, draw) {
  var btns = el.querySelectorAll(".fbtn");
  btns.forEach(function (btn) {
    btn.onclick = function () {
      FILT.mode = btn.getAttribute("data-m");
      btns.forEach(function (x) { x.className = "fbtn" + (x === btn ? " on" : ""); });
      draw();
    };
  });
  var q = el.querySelector("#fq");
  if (q) q.oninput = function () { FILT.q = q.value.trim(); draw(); };
}
