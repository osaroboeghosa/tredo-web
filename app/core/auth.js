/* tredo auth: optional sign-in via Supabase. No gating - signing in only enables saved prefs and alerts. */

var sbAuth = null;
try {
  if (window.supabase && window.supabase.createClient && window.TREDO) {
    sbAuth = window.supabase.createClient(TREDO.url, TREDO.key);
  }
} catch (e) { sbAuth = null; }

var tredoUser = null;

function renderAuthbox() {
  var box = document.getElementById("authbox");
  if (!box) return;
  if (tredoUser) {
    var email = tredoUser.email || "signed in";
    var initial = email.slice(0, 1).toUpperCase();
    box.innerHTML = '<span class="userchip" title="' + esc(email) + '">' + esc(initial) + "</span>" +
      '<button id="signout" class="btn ghost sm">Sign out</button>';
    var so = document.getElementById("signout");
    if (so) so.onclick = authSignOut;
  } else {
    box.innerHTML = '<a href="#/auth" class="btn primary sm">Sign in</a>';
  }
}

function authSignOut() {
  if (!sbAuth) return;
  sbAuth.auth.signOut();
}

var authBound = false;

function authInit() {
  if (!sbAuth) return;
  sbAuth.auth.getSession().then(function (r) {
    tredoUser = (r && r.data && r.data.user) || null;
    renderAuthbox();
  });
  if (authBound) return;
  authBound = true;
  sbAuth.auth.onAuthStateChange(function (ev, session) {
    tredoUser = (session && session.user) || null;
    renderAuthbox();
    // signed in while on the auth page -> go home
    if (tredoUser && location.hash.indexOf("#/auth") === 0) location.hash = "#/home";
  });
}
