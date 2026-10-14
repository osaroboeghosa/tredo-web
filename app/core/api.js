var PAGES = {};

async function sb(path) {
  var r = await fetch(TREDO.url + "/rest/v1/" + path, {
    headers: { apikey: TREDO.key, Authorization: "Bearer " + TREDO.key }
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

function esc(s) {
  var m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return m[c]; });
}
