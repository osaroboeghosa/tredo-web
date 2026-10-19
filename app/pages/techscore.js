function tmsTot(x) {
  var t = tmhN(x.trend), s = tmhN(x.season10);
  return (t == null && s == null) ? null : (t || 0) + (s || 0);
}

function tmsCell(x) {
  var v = tmsTot(x);
  if (v == null) return '<td class="tmn">n/a</td>';
  var a = Math.abs(v), k = a >= 3 ? 2 : (a >= 1 ? 1 : 0);
  return tmhC(tmhSg(v), v > 0 ? k : -k);
}
