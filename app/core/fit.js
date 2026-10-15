(function () {
  function fit() {
    var d = document.documentElement;
    d.style.zoom = "";
    var s = Math.min(screen.width, screen.height);
    var w = window.innerWidth;
    if (s <= 600 && w > s * 1.4) d.style.zoom = (w / s).toFixed(3);
  }
  fit();
  window.addEventListener("resize", fit);
})();
