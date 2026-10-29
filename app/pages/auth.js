/* tredo auth page (#/auth) - sign in / sign up / magic link. App stays open without an account. */

var authMode = "in";

function authFormHTML() {
  var signingUp = authMode === "up";
  return {
    title: signingUp ? "Create account" : "Sign in",
    sub: signingUp
      ? "Sign-in only enables saved preferences and alerts. The app works without an account."
      : "The app is open without an account. Signing in enables saved preferences and alerts.",
    swap: signingUp ? "Already have an account? Sign in" : "New here? Create account",
    swapMode: signingUp ? "in" : "up",
    button: signingUp ? "Create account" : "Sign in"
  };
}

PAGES.auth = function (el) {
  var f = authFormHTML();
  el.innerHTML =
    '<div class="authwrap">' +
    '<aside class="authside">' +
      '<span class="kicker">Workspace access</span>' +
      "<h2>The macro picture, already scored.</h2>" +
      "<p>Signing in is optional. The workspace opens without an account; an account only keeps your preferences and alerts attached to you.</p>" +
      "<ul><li>Saved filters and layout</li><li>Confluence alerts by pair</li><li>Same data, on every device</li></ul>" +
      '<a class="btn ghost sm" href="#/start" style="align-self:flex-start;margin-top:8px">Back to landing</a>' +
    "</aside>" +
    '<div class="card authcard">' +
      '<div class="kicker">Account</div>' +
      "<h1>" + esc(f.title) + "</h1>" +
      '<p class="muted sub">' + esc(f.sub) + "</p>" +
      (tredoUser
        ? '<p class="muted">Signed in as <b>' + esc(tredoUser.email || "") + "</b>.</p>" +
          '<div class="cta-row"><button id="aout" class="btn primary">Sign out</button><a href="#/home" class="btn ghost">Back to app</a></div>'
        : "<form id='af'>" +
          "<label>Email<input type='email' id='ae' required autocomplete='email' placeholder='you@example.com'></label>" +
          "<label>Password<input type='password' id='ap' required minlength='6' autocomplete='current-password' placeholder='minimum 6 characters'></label>" +
          "<div id='aerr' class='aerr'></div>" +
          "<div class='cta-row'>" +
            "<button type='submit' class='btn primary lg'>" + esc(f.button) + "</button>" +
            "<button type='button' id='amagic' class='btn ghost lg'>Email me a magic link</button>" +
          "</div>" +
          "</form>" +
          "<p class='muted'><a href='#' id='aswap'>" + esc(f.swap) + "</a></p>") +
    "</div></div>";

  var out = document.getElementById("aout");
  if (out) out.onclick = authSignOut;

  var swap = document.getElementById("aswap");
  if (swap) swap.onclick = function (e) {
    e.preventDefault();
    authMode = f.swapMode;
    PAGES.auth(el);
  };

  var form = document.getElementById("af");
  var err = document.getElementById("aerr");
  function showErr(m) { if (err) { err.textContent = m; err.style.display = "block"; } }
  function clearErr() { if (err) { err.textContent = ""; err.style.display = "none"; } }

  if (!sbAuth) { showErr("Auth is unavailable right now - open the app without signing in."); return; }

  if (form) form.onsubmit = async function (e) {
    e.preventDefault();
    clearErr();
    var email = document.getElementById("ae").value.trim();
    var pass = document.getElementById("ap").value;
    if (!email || !pass) { showErr("Fill in both fields."); return; }
    var r;
    if (authMode === "up") r = await sbAuth.auth.signUp({ email: email, password: pass });
    else r = await sbAuth.auth.signInWithPassword({ email: email, password: pass });
    if (r && r.error) { showErr(r.error.message); return; }
    if (authMode === "up") {
      el.innerHTML = '<div class="card authcard"><h1>Check your inbox</h1>' +
        "<p class='muted'>We sent a confirmation link to " + esc(email) + ". Confirm it, then sign in here.</p>" +
        "<div class='cta-row'><a href='#/auth' class='btn ghost' id='aback'>Back to sign in</a></div></div>";
      var ab = document.getElementById("aback");
      if (ab) ab.onclick = function (e2) { e2.preventDefault(); authMode = "in"; PAGES.auth(el); };
    }
    // success: onAuthStateChange in core/auth.js redirects to #/home
  };

  var magic = document.getElementById("amagic");
  if (magic) magic.onclick = async function () {
    clearErr();
    var emailE = document.getElementById("ae");
    if (!emailE.value.trim()) { showErr("Type your email first."); return; }
    var r = await sbAuth.auth.signInWithOtp({ email: emailE.value.trim() });
    if (r && r.error) { showErr(r.error.message); return; }
    el.innerHTML = '<div class="card authcard"><h1>Magic link sent</h1>' +
      "<p class='muted'>Open the link we emailed to " + esc(emailE.value.trim()) + " to sign in.</p>" +
      "<div class='cta-row'><a href='#/home' class='btn ghost'>Back to app</a></div></div>";
  };
};
