// Build script inserts the site's static files here.
const ASSETS = __EMBEDDED_ASSETS__;
const COOKIE = "tattica_session";
const MAX_BODY = 2_000_000;
const SESSION_HOURS = 12;
const REMEMBER_DAYS = 30;
const PROTECTED_ADMINS = new Set(["tordi", "contran"]);
// Workers caps each PBKDF2 derivation at 100,000 iterations. Chaining these
// rounds keeps the overall password work factor at 260,000 iterations.
const PBKDF2_ROUNDS = [100_000, 100_000, 60_000];
const encoder = new TextEncoder();

const loginPage = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Accesso · Lavagna tattica</title><style>
:root{font-family:system-ui,-apple-system,sans-serif;color:#251b35;background:#f7f5fa}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:20px}.login{width:min(430px,100%);padding:34px;background:white;border:1px solid #e6e0ee;border-radius:20px;box-shadow:0 12px 40px #251b3512}.brand{display:flex;align-items:center;gap:14px;margin-bottom:26px}.brand img{width:52px;height:52px;object-fit:contain}.brand h1{margin:0;font-size:27px;letter-spacing:-.04em}.brand p{margin:4px 0 0;color:#6b6279;font-size:14px}.field{display:grid;gap:7px;margin:16px 0}.field label{font-weight:650;font-size:14px}.field input{width:100%;padding:12px 13px;border:1px solid #e0d9e9;border-radius:10px;font:inherit;background:#fbfafe}.field input:focus{outline:3px solid #a981dc;outline-offset:2px}.password-wrap{position:relative}.password-wrap input{padding-right:48px}.password-toggle{position:absolute;right:7px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:8px;background:transparent;color:#6b6279;cursor:pointer}.password-toggle:hover{background:#f0ebf6;color:#6334a4}.password-toggle:focus-visible{outline:3px solid #a981dc;outline-offset:1px}.password-toggle svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.password-toggle .eye-off{display:none}.password-toggle[aria-pressed="true"] .eye-on{display:none}.password-toggle[aria-pressed="true"] .eye-off{display:block}.remember{display:flex;align-items:center;gap:9px;color:#625970;font-size:14px;margin:12px 0 20px}.remember input{accent-color:#6334a4;width:17px;height:17px}.submit{width:100%;border:0;border-radius:10px;background:#6334a4;color:white;padding:13px;font:inherit;font-weight:700;cursor:pointer}.submit:disabled{opacity:.6;cursor:wait}.error{min-height:20px;margin:12px 0 0;color:#a22435;font-size:13px}.footer{margin:24px 0 0;text-align:center;color:#7a7187;font-size:12px}
</style></head><body><main class="login"><div class="brand"><img src="/fiorentina.png" alt=""><div><h1>Lavagna tattica</h1><p>Accedi al tuo archivio personale</p></div></div><form id="login-form" autocomplete="off"><div class="field"><label for="username">Nome utente</label><input id="username" name="account_name" autocomplete="off" autocapitalize="none" spellcheck="false" required autofocus></div><div class="field"><label for="password">Password</label><div class="password-wrap"><input id="password" name="account_key" type="password" autocomplete="new-password" required><button class="password-toggle" id="password-toggle" type="button" aria-label="Mostra password" aria-pressed="false"><svg class="eye-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><svg class="eye-off" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16.7 16.7 0 0 1-3.2 4.1M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.3 3.3-.7"/></svg></button></div></div><label class="remember"><input id="remember" type="checkbox"><span>Rimani collegato su questo dispositivo</span></label><button class="submit" type="submit">Accedi</button><p id="error" class="error" role="alert"></p></form><p class="footer">Accesso riservato agli utenti autorizzati</p></main><script>
const form=document.querySelector('#login-form'),button=form.querySelector('.submit'),error=document.querySelector('#error'),password=document.querySelector('#password'),passwordToggle=document.querySelector('#password-toggle');passwordToggle.addEventListener('click',()=>{const showing=password.type==='password';password.type=showing?'text':'password';passwordToggle.setAttribute('aria-pressed',String(showing));passwordToggle.setAttribute('aria-label',showing?'Nascondi password':'Mostra password');password.focus({preventScroll:true})});form.addEventListener('submit',async event=>{event.preventDefault();error.textContent='';button.disabled=true;button.textContent='Accesso…';try{const response=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({username:document.querySelector('#username').value,password:password.value,remember:document.querySelector('#remember').checked})});if(!response.ok)throw new Error(response.status===429?'Troppi tentativi. Riprova più tardi.':response.status>=500?'Accesso temporaneamente non disponibile. Riprova.':'Nome utente o password non corretti.');location.replace('/')}catch(reason){error.textContent=reason.message||'Accesso non riuscito. Riprova.';button.disabled=false;button.textContent='Accedi'}});
</script></body></html>`;

const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
});
const secureHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
};
function b64url(bytes) {
  let raw = "";
  for (const byte of new Uint8Array(bytes)) raw += String.fromCharCode(byte);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64(value) {
  const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}
function toB64(bytes) {
  let raw = "";
  for (const byte of new Uint8Array(bytes)) raw += String.fromCharCode(byte);
  return btoa(raw);
}
function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function cookies(request) {
  const value = request.headers.get("cookie") || "";
  return Object.fromEntries(value.split(";").map((part) => part.trim().split(/=(.*)/s).slice(0, 2)).filter(([key, val]) => key && val));
}
function authConfig(env) {
  try { return JSON.parse(env.AUTH_USERS_JSON || "{}"); } catch { return {}; }
}
async function sign(payload, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), {name: "HMAC", hash: "SHA-256"}, false, ["sign"]);
  const encoded = b64url(encoder.encode(JSON.stringify(payload)));
  const signature = b64url(await crypto.subtle.sign("HMAC", key, encoder.encode(encoded)));
  return encoded + "." + signature;
}
async function currentUser(request, env) {
  const token = cookies(request)[COOKIE];
  if (!token || !env.SESSION_SECRET || !env.DB) return null;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;
  try {
    const key = await crypto.subtle.importKey("raw", encoder.encode(env.SESSION_SECRET), {name: "HMAC", hash: "SHA-256"}, false, ["verify"]);
    if (!await crypto.subtle.verify("HMAC", key, fromB64(signature), encoder.encode(encoded))) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64(encoded)));
    if (!Number.isFinite(payload.expires) || payload.expires < Date.now()) return null;
    const configured = await env.DB.prepare("SELECT username, role, active, session_version FROM app_users WHERE username = ?1").bind(payload.username).first();
    if (!configured || !configured.active || configured.session_version !== payload.version) return null;
    return {username: configured.username, role: configured.role === "admin" ? "admin" : "user"};
  } catch { return null; }
}
function cookieHeader(token, remember, maxAge) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict${remember ? `; Max-Age=${maxAge}` : ""}`;
}
async function derivePasswordHash(password, salt) {
  let material = encoder.encode(password);
  for (let round = 0; round < PBKDF2_ROUNDS.length; round++) {
    const key = await crypto.subtle.importKey("raw", material, "PBKDF2", false, ["deriveBits"]);
    const roundSalt = new Uint8Array(salt.length + 1);
    roundSalt.set(salt);
    roundSalt[salt.length] = round + 1;
    material = new Uint8Array(await crypto.subtle.deriveBits(
      {name: "PBKDF2", hash: "SHA-256", salt: roundSalt, iterations: PBKDF2_ROUNDS[round]}, key, 256,
    ));
  }
  return material;
}
async function passwordMatches(password, user) {
  try {
    const salt = fromB64(user.salt);
    const actual = await derivePasswordHash(password, salt), expected = fromB64(user.hash);
    if (actual.length !== expected.length) return false;
    let difference = 0;
    for (let index = 0; index < actual.length; index++) difference |= actual[index] ^ expected[index];
    return difference === 0;
  } catch { return false; }
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);
  return {salt: toB64(salt), hash: toB64(hash)};
}
async function initializeUsers(db, env, username) {
  if (!username || !validUsername(username)) return;
  const marker = `seed_credentials_v4:${username}`;
  const initialized = await db.prepare("SELECT value FROM auth_settings WHERE key = ?1").bind(marker).first();
  if (initialized) return;
  const user = authConfig(env)[username];
  if (!user || typeof user.password !== "string") return;
  const credentials = await hashPassword(user.password);
  await db.batch([
    db.prepare("INSERT INTO app_users (username, salt, password_hash, role, active, session_version) VALUES (?1, ?2, ?3, ?4, 1, 1) ON CONFLICT(username) DO UPDATE SET salt = excluded.salt, password_hash = excluded.password_hash, role = excluded.role, session_version = app_users.session_version + 1, updated_at = CURRENT_TIMESTAMP").bind(username, credentials.salt, credentials.hash, user.role === "admin" ? "admin" : "user"),
    db.prepare("INSERT OR IGNORE INTO auth_settings (key, value) VALUES (?1, '1')").bind(marker),
  ]);
}
function normalizeUsername(value) {
  return typeof value === "string" ? value.normalize("NFKC").trim().toLowerCase() : "";
}
function validUsername(value) { return /^[a-z0-9][a-z0-9._-]{1,31}$/.test(value); }
async function countLoginAttempt(db, ip) {
  const now = Math.floor(Date.now() / 1000);
  const row = await db.prepare("SELECT attempts, window_started FROM login_attempts WHERE ip_key = ?1").bind(ip).first();
  if (row && now - row.window_started < 900 && row.attempts >= 10) return false;
  const start = row && now - row.window_started < 900 ? row.window_started : now;
  const attempts = row && start === row.window_started ? row.attempts + 1 : 1;
  await db.prepare("INSERT INTO login_attempts (ip_key, attempts, window_started) VALUES (?1, ?2, ?3) ON CONFLICT(ip_key) DO UPDATE SET attempts = excluded.attempts, window_started = excluded.window_started").bind(ip, attempts, start).run();
  return true;
}
function sameOrigin(request) { return request.headers.get("origin") === new URL(request.url).origin; }
function responseHeaders(extra = {}) { return {...secureHeaders, ...extra}; }

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/login" && request.method === "POST") {
      if (!sameOrigin(request)) return json({error: "forbidden"}, 403, responseHeaders());
      if (!env.DB || !env.SESSION_SECRET) return json({error: "Login non configurato."}, 503, responseHeaders());
      if (Number(request.headers.get("content-length") || 0) > 8192) return json({error: "invalid_request"}, 413, responseHeaders());
      const ip = request.headers.get("cf-connecting-ip") || "unknown";
      try {
        if (!await countLoginAttempt(env.DB, ip)) return json({error: "rate_limited"}, 429, responseHeaders());
        const body = await request.json();
        const username = normalizeUsername(body.username);
        const password = typeof body.password === "string" ? body.password : "";
        if (username.length > 50 || password.length > 256) return json({error: "invalid_credentials"}, 401, responseHeaders());
        await initializeUsers(env.DB, env, username);
        const configured = await env.DB.prepare("SELECT username, salt, password_hash, role, active, session_version FROM app_users WHERE username = ?1").bind(username).first();
        const dummy = {salt: "MDAwMDAwMDAwMDAwMDAwMA==", hash: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="};
        const valid = await passwordMatches(password, configured ? {salt: configured.salt, hash: configured.password_hash} : dummy);
        if (!configured || !configured.active || !valid) return json({error: "invalid_credentials"}, 401, responseHeaders());
        await env.DB.prepare("DELETE FROM login_attempts WHERE ip_key = ?1").bind(ip).run();
        const remember = body.remember === true;
        const seconds = remember ? REMEMBER_DAYS * 86400 : SESSION_HOURS * 3600;
        const token = await sign({username, version: configured.session_version, expires: Date.now() + seconds * 1000, nonce: crypto.randomUUID()}, env.SESSION_SECRET);
        return json({ok: true}, 200, responseHeaders({"set-cookie": cookieHeader(token, remember, seconds)}));
      } catch (error) { console.error("login processing failed", error?.name || "Error", error?.message || "unknown"); return json({error: "temporarily_unavailable"}, 503, responseHeaders()); }
    }
    if (url.pathname === "/api/logout" && request.method === "POST") {
      if (!sameOrigin(request)) return json({error: "forbidden"}, 403, responseHeaders());
      return json({ok: true}, 200, responseHeaders({"set-cookie": `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`}));
    }
    if (url.pathname === "/api/users") {
      const user = await currentUser(request, env);
      if (!user || user.role !== "admin") return json({error: "forbidden"}, 403, responseHeaders());
      if (!env.DB) return json({error: "storage_unavailable"}, 503, responseHeaders());
      try {
        await initializeUsers(env.DB, env);
        if (request.method === "GET") {
          const result = await env.DB.prepare("SELECT username, role, active, created_at FROM app_users ORDER BY role DESC, username COLLATE NOCASE").all();
          return json({users: result.results || []}, 200, responseHeaders());
        }
        if (!sameOrigin(request)) return json({error: "forbidden"}, 403, responseHeaders());
        if (request.method === "POST") {
          const body = await request.json();
          const username = normalizeUsername(body.username);
          const password = typeof body.password === "string" ? body.password : "";
          if (!validUsername(username) || password.length < 8 || password.length > 128) return json({error: "invalid_user"}, 400, responseHeaders());
          const credentials = await hashPassword(password);
          const result = await env.DB.prepare("INSERT OR IGNORE INTO app_users (username, salt, password_hash, role, active, session_version) VALUES (?1, ?2, ?3, 'user', 1, 1)").bind(username, credentials.salt, credentials.hash).run();
          if (!result.meta?.changes) return json({error: "username_exists"}, 409, responseHeaders());
          return json({ok: true}, 201, responseHeaders());
        }
        if (request.method === "PUT") {
          const body = await request.json();
          const username = normalizeUsername(body.username);
          if (!validUsername(username)) return json({error: "invalid_user"}, 400, responseHeaders());
          const target = await env.DB.prepare("SELECT username, role FROM app_users WHERE username = ?1").bind(username).first();
          if (!target) return json({error: "not_found"}, 404, responseHeaders());
          if (body.action === "password") {
            const password = typeof body.password === "string" ? body.password : "";
            if (password.length < 8 || password.length > 128) return json({error: "invalid_password"}, 400, responseHeaders());
            const credentials = await hashPassword(password);
            await env.DB.prepare("UPDATE app_users SET salt = ?1, password_hash = ?2, session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP WHERE username = ?3").bind(credentials.salt, credentials.hash, username).run();
            return json({ok: true}, 200, responseHeaders());
          }
          if (body.action === "role") {
            const role = body.role === "admin" || body.role === "user" ? body.role : null;
            if (!role || (username === user.username && role !== "admin")) return json({error: "invalid_action"}, 400, responseHeaders());
            if (PROTECTED_ADMINS.has(username) && role !== "admin") return json({error: "protected_account"}, 403, responseHeaders());
            if (role === "user" && target.role === "admin") {
              const admins = await env.DB.prepare("SELECT COUNT(*) AS count FROM app_users WHERE role = 'admin' AND active = 1").first();
              if ((admins?.count || 0) <= 1) return json({error: "last_admin"}, 409, responseHeaders());
            }
            await env.DB.prepare("UPDATE app_users SET role = ?1, session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP WHERE username = ?2").bind(role, username).run();
            return json({ok: true}, 200, responseHeaders());
          }
          if (body.action === "active") {
            if (username === user.username || target.role === "admin" || typeof body.active !== "boolean") return json({error: "invalid_action"}, 400, responseHeaders());
            if (PROTECTED_ADMINS.has(username) && body.active === false) return json({error: "protected_account"}, 403, responseHeaders());
            await env.DB.prepare("UPDATE app_users SET active = ?1, session_version = session_version + 1, updated_at = CURRENT_TIMESTAMP WHERE username = ?2").bind(body.active ? 1 : 0, username).run();
            return json({ok: true}, 200, responseHeaders());
          }
          return json({error: "invalid_action"}, 400, responseHeaders());
        }
        return new Response(null, {status: 405, headers: responseHeaders({allow: "GET, POST, PUT"})});
      } catch { return json({error: "storage_unavailable"}, 503, responseHeaders()); }
    }
    if (url.pathname === "/api/data") {
      const user = await currentUser(request, env);
      if (!user) return json({error: "unauthorized"}, 401, responseHeaders());
      if (!env.DB) return json({error: "storage_unavailable"}, 503, responseHeaders());
      const requested = url.searchParams.get("user");
      const target = requested || user.username;
      if (target !== user.username && user.role !== "admin") return json({error: "forbidden"}, 403, responseHeaders());
      const account = await env.DB.prepare("SELECT username FROM app_users WHERE username = ?1").bind(target).first();
      if (!account) return json({error: "not_found"}, 404, responseHeaders());
      if (request.method === "GET") {
        try {
          const row = await env.DB.prepare("SELECT payload FROM archives WHERE username = ?1").bind(target).first();
          return json(row ? JSON.parse(row.payload) : null, 200, responseHeaders());
        } catch { return json({error: "storage_unavailable"}, 503, responseHeaders()); }
      }
      if (request.method === "PUT" || request.method === "POST") {
        if (!sameOrigin(request)) return json({error: "forbidden"}, 403, responseHeaders());
        const size = Number(request.headers.get("content-length") || 0);
        if (size > MAX_BODY) return json({error: "too_large"}, 413, responseHeaders());
        try {
          const body = await request.text();
          if (body.length > MAX_BODY) return json({error: "too_large"}, 413, responseHeaders());
          const data = JSON.parse(body);
          if (!data || typeof data !== "object" || Array.isArray(data) || !Array.isArray(data.saved) || !Array.isArray(data.folders) || !data.boards || typeof data.boards !== "object") return json({error: "invalid_data"}, 400, responseHeaders());
          await env.DB.prepare("INSERT INTO archives (username, payload, updated_at) VALUES (?1, ?2, CURRENT_TIMESTAMP) ON CONFLICT(username) DO UPDATE SET payload = excluded.payload, updated_at = CURRENT_TIMESTAMP").bind(target, JSON.stringify(data)).run();
          return json({ok: true}, 200, responseHeaders());
        } catch { return json({error: "storage_unavailable"}, 503, responseHeaders()); }
      }
      return new Response(null, {status: 405, headers: responseHeaders({allow: "GET, PUT, POST"})});
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", {status: 405, headers: responseHeaders()});
      const user = await currentUser(request, env);
      if (!user) return new Response(request.method === "HEAD" ? null : loginPage, {headers: responseHeaders({"content-type": "text/html; charset=utf-8", "cache-control": "no-store"})});
      if (!env.DB) return new Response("Archivio online non disponibile.", {status: 503, headers: responseHeaders({"content-type": "text/plain; charset=utf-8"})});
      try {
        const row = await env.DB.prepare("SELECT payload FROM archives WHERE username = ?1").bind(user.username).first();
        const data = row ? JSON.parse(row.payload) : null;
        await initializeUsers(env.DB, env);
        const users = user.role === "admin"
          ? (await env.DB.prepare("SELECT username, role, active FROM app_users ORDER BY role DESC, username COLLATE NOCASE").all()).results || []
          : [{username: user.username, role: user.role}];
        const bootstrap = {account: {...user, users}, data};
        const source = new TextDecoder().decode(fromB64(ASSETS["/index.html"].body));
        const html = source.replace("window.__SITE_BOOTSTRAP__ = null;", "window.__SITE_BOOTSTRAP__ = " + safeJson(bootstrap) + ";");
        return new Response(request.method === "HEAD" ? null : html, {headers: responseHeaders({"content-type": "text/html; charset=utf-8", "cache-control": "no-store"})});
      } catch { return new Response("Archivio online non disponibile.", {status: 503, headers: responseHeaders({"content-type": "text/plain; charset=utf-8"})}); }
    }
    const asset = ASSETS[url.pathname];
    if (asset && (request.method === "GET" || request.method === "HEAD")) {
      // Keep CSS and JS fresh after small visual updates without a hard reload.
      const cacheControl = /\.(?:css|js)$/.test(url.pathname) ? "public, max-age=300, must-revalidate" : "public, max-age=31536000, immutable";
      return new Response(request.method === "HEAD" ? null : fromB64(asset.body), {headers: responseHeaders({"content-type": asset.type, "cache-control": cacheControl})});
    }
    return new Response("Not found", {status: 404, headers: responseHeaders({"content-type": "text/plain; charset=utf-8"})});
  }
};
