var TREDO_URL = "https://dnhqqvxgojldpvmaaaho.supabase.co/rest/v1/";
var TREDO_KEY = "sb_publishable_fPMkPFHXExto4m1RB20Y7Q_9jcQHlBS";

async function sb(path) {
  var r = await fetch(TREDO_URL + "/rest/v1/" + path, {
    headers: { apikey: TREDO_KEY, Authorization: "Bearer " + TREDO_KEY }
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

async function readTest() {
  var out = document.getElementById("api-test");
  if (!out) return;
  try {
    var rows = await sb("scores_latest?select=pair,score,label&order=score.desc");
    out.textContent = rows.map(function (x) {
      return x.pair + " " + x.score + " " + x.label;
    }).join(" | ");
  } catch (e) {
    out.textContent = "Read failed: " + e.message;
  }
}
