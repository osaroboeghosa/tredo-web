(function () {
  function $(i) { return document.getElementById(i); }
  function calc() {
    var bal = +$("bal").value, rk = +$("risk").value, sl = +$("sl").value;
    var pr = +$("price").value, p = $("pair").value, out = $("out");
    if (!(bal > 0 && rk > 0 && sl > 0)) {
      out.textContent = "Enter balance, risk and stop loss.";
      return;
    }
    var pip = p === "USDJPY" ? 0.01 : 0.0001;
    var pv = 10;
    if (p.slice(0, 3) === "USD") {
      if (!(pr > 0)) {
        out.textContent = "Enter the current price for " + p + ".";
        return;
      }
      pv = 100000 * pip / pr;
    }
    var risk = bal * rk / 100;
    var lots = risk / (sl * pv);
    out.innerHTML =
      "<div class='big'>" + lots.toFixed(2) + " lots</div>" +
      "<div>Units: " + Math.round(lots * 100000).toLocaleString() + "</div>" +
      "<div>Money at risk: $" + risk.toFixed(2) + "</div>" +
      "<div>Pip value per lot: $" + pv.toFixed(2) + "</div>";
  }
  ["pair", "bal", "risk", "sl", "price"].forEach(function (id) {
    $(id).addEventListener("input", calc);
    $(id).addEventListener("change", calc);
  });
  calc();
})();
