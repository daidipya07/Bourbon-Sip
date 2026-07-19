// Maintenance mode — takes the PUBLIC production site offline while leaving
// /admin, API routes, and local `npm run dev` fully working.
//
// To bring the site back ONLINE, do either one:
//   1. Set MAINTENANCE_DEFAULT below to false, commit, and push, OR
//   2. Set env var MAINTENANCE_MODE=false in Vercel and redeploy.
// The env var, when present, always wins over the code default.

const MAINTENANCE_DEFAULT = true

export function isMaintenanceMode(): boolean {
  // Never gate local development — you can keep working offline.
  if (process.env.NODE_ENV === 'development') return false

  const env = process.env.MAINTENANCE_MODE
  if (env === 'true') return true
  if (env === 'false') return false
  return MAINTENANCE_DEFAULT
}

export function maintenancePage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Bourbon Pour — Back Soon</title>
<style>
  :root { --amber:#c8963e; --deep:#0a0a0a; --card:#111; --border:#1e1e1e; }
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; }
  body {
    background:
      radial-gradient(1200px 600px at 50% -10%, rgba(200,150,62,0.10), transparent 60%),
      var(--deep);
    color:#e8e8e8;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    display:flex; align-items:center; justify-content:center;
    min-height:100vh; padding:24px; text-align:center;
  }
  .wrap { max-width:560px; }
  .mark {
    display:inline-flex; align-items:center; gap:10px;
    margin-bottom:32px; letter-spacing:2px; text-transform:uppercase;
    font-size:12px; color:var(--amber); font-weight:600;
  }
  .dot { width:9px; height:9px; border-radius:2px; background:var(--amber); }
  h1 {
    font-family: Georgia, "Times New Roman", serif;
    font-size:clamp(34px, 7vw, 56px); font-weight:700;
    line-height:1.1; margin-bottom:20px; letter-spacing:-0.5px;
  }
  h1 .accent { color:var(--amber); font-style:italic; }
  p { color:#9a9a9a; font-size:16px; line-height:1.6; margin-bottom:14px; }
  .rule { width:48px; height:2px; background:var(--amber); margin:28px auto; opacity:0.7; }
  .foot {
    margin-top:36px; font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size:11px; color:#555; letter-spacing:1px; text-transform:uppercase;
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="mark"><span class="dot"></span> Bourbon Pour</div>
    <h1>We're pouring a <span class="accent">fresh</span> one.</h1>
    <div class="rule"></div>
    <p>The site is briefly offline for improvements. Finance &amp; technology intelligence returns shortly.</p>
    <div class="foot">Temporarily Unavailable · Back Soon</div>
  </div>
</body>
</html>`
}
