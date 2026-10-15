function gxr(l, s, v, c) {
  return '<div class="gr"><div class="gl">' + l + (s ? '<div class="gs">' + s + '</div>' : '') + '</div>' +
    (v == null || v === "" ? "" : '<span class="gv ' + (c || "") + '">' + v + '</span>') + '</div>';
}

function gxg(a) {
  return '<div class="gx">' + a.join("") + '</div>';
}
