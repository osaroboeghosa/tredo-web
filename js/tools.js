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
    var budget = bal * rk / 100;
    var lots = Math.floor(budget / (sl * pv) * 100 + 1e-9) / 100;
    if (lots < 0.01) {
      var mn = 0.01 * sl * pv;
      out.innerHTML =
        "<div class='big'>0.00 lots</div>" +
        "<div>Too small: even 0.01 lot would risk $" + mn.toFixed(2) +
        ", more than your $" + budget.toFixed(2) + " budget.</div>" +
        "<div>Lower the stop loss, or raise balance or risk %.</div>";
      return;
    }
    var real = lots * sl * pv;
    out.innerHTML =
      "<div class='big'>" + lots.toFixed(2) + " lots</div>" +
      "<div>Rounded down to 0.01 lot, so risk is never above your budget.</div>" +
      "<div>Units: " + Math.round(lots * 100000).toLocaleString() + "</div>" +
      "<div>Money at risk: $" + real.toFixed(2) + " (budget $" + budget.toFixed(2) + ")</div>" +
      "<div>Pip value per lot: $" + pv.toFixed(2) + "</div>";
  }
  ["pair", "bal", "risk", "sl", "price"].forEach(function (id) {
    $(id).addEventListener("input", calc);
    $(id).addEventListener("change", calc);
  });
  calc();
})();
