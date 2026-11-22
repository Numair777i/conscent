// Usage:  node scripts/check-seo.mjs                      (tests http://localhost:3000)
//         node scripts/check-seo.mjs https://conscentfragrances.com
// Needs Node 18+. For localhost run `npm run build && npm start` first.
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const PAGES = [
  "/",
  "/parfums",
  "/parfums/trial-set",
  "/parfums/secret-affair",
  "/parfums/lumora",
  "/parfums/does-not-exist",
  "/track",
  "/contact",
  "/privacy",
  "/terms",
  "/shipping",
  "/refunds",
  "/account",
  "/account/login",
  "/account/orders",
];
const FILES = [
  ["/favicon.ico", "image/"],
  ["/icon.svg", "image/svg"],
  ["/icon.png", "image/png"],
  ["/apple-icon.png", "image/png"],
  ["/og-image.jpg", "image/jpeg"],
  ["/icon-192.png", "image/png"],
  ["/icon-512.png", "image/png"],
  ["/manifest.webmanifest", "json"],
  ["/robots.txt", "text/plain"],
  ["/sitemap.xml", "xml"],
];

const UA = { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" };
const decode = (s) =>
  s
    ?.replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"');
const pick = (h, re) => decode(re.exec(h)?.[1]);
const meta = (h, attr, key) =>
  pick(h, new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`, "i"));
let problems = 0;
const bad = (msg) => {
  problems++;
  console.log(`   ✗ ${msg}`);
};

console.log(`\n=== FILES (${BASE}) ===`);
for (const [path, type] of FILES) {
  try {
    const r = await fetch(BASE + path, { headers: UA, redirect: "manual" });
    const ct = r.headers.get("content-type") ?? "";
    const ok = r.status === 200 && ct.includes(type);
    console.log(`${ok ? "✓" : "✗"} ${path.padEnd(22)} ${r.status} ${ct}`);
    if (!ok) problems++;
  } catch (e) {
    console.log(`✗ ${path} -> ${e.message}`);
    problems++;
  }
}

console.log("\n=== PAGES ===");
for (const path of PAGES) {
  const r = await fetch(BASE + path, { headers: UA, redirect: "manual" });
  console.log(`\n${path}  ->  HTTP ${r.status}`);
  if (r.status >= 300 && r.status < 400) {
    console.log(
      `   redirects to ${r.headers.get("location")} (private page behind login: expected)`,
    );
    continue;
  }
  const html = await r.text();
  const title = pick(html, /<title>([^<]*)<\/title>/i);
  const desc = meta(html, "name", "description");
  const robots = meta(html, "name", "robots");
  const canon = pick(html, /<link rel="canonical" href="([^"]*)"/i);
  const ogImg = meta(html, "property", "og:image");
  const ogTitle = meta(html, "property", "og:title");
  const tw = meta(html, "name", "twitter:card");
  console.log(`   title (${title?.length ?? 0}): ${title}`);
  console.log(`   desc  (${desc?.length ?? 0}): ${desc}`);
  console.log(`   robots: ${robots ?? "-"} | canonical: ${canon ?? "-"}`);
  console.log(`   og:image: ${ogImg ?? "-"} | twitter:card: ${tw ?? "-"}`);

  const noindex = /noindex/i.test(robots ?? "");
  if (!title) bad("missing <title>");
  if (title && title.length > 60) bad(`title is ${title.length} chars (>60)`);
  if (title && /\| CONSCENT.*\| CONSCENT/i.test(title))
    bad("brand name doubled in title");
  if (!desc) bad("missing description");
  if (desc && desc.length > 155)
    bad(`description is ${desc.length} chars (>155)`);
  if (ogTitle && title && !title.startsWith(ogTitle.split(" | ")[0]))
    bad("og:title differs from <title>");
  if (!ogImg) bad("missing og:image");
  if (ogImg && !/^https?:\/\//.test(ogImg))
    bad("og:image is not an absolute URL");
  if (/(10|8)–(12|10)\+? ?h/i.test(desc ?? "") && /10–12/.test(desc ?? ""))
    bad("description says 10–12 hr; page says 8–10");
  if (r.status === 200 && !noindex && !canon)
    bad("indexable page has no canonical");
  if (canon && path !== "/" && new URL(canon).pathname === "/")
    bad("canonical points to the homepage");
  if (r.status === 404 && !noindex) bad("404 page should be noindex");
  if (path.startsWith("/account") && r.status === 200 && !noindex)
    bad("private page is indexable");
}
console.log(
  problems ? `\n⚠ ${problems} problem(s) found` : "\n✓ All checks passed",
);
