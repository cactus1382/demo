/* Winning-card demo template — Alireza HA
 * Zero dependencies. All business data lives in config.js (or examples/<name>.js via ?demo=<name>).
 * Every dynamic value inserted as HTML goes through esc(). */
(() => {
"use strict";

/* ---------- helpers ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const FA_D = "۰۱۲۳۴۵۶۷۸۹";
const faDigits = s => String(s).replace(/\d/g, d => FA_D[d]);
const enDigits = s => String(s ?? "").replace(/[۰-۹]/g, d => FA_D.indexOf(d)).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
const faNum = n => Number(n || 0).toLocaleString("fa-IR");
const toman = n => faNum(n) + " تومان";
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const norm = s => enDigits(String(s || "")).toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[‌ً-ٟ]/g, " ").replace(/[؟?!.,،]/g, " ").replace(/\s+/g, " ").trim();

const IC = {
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke-width="3" stroke-linecap="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>'
};

const DAYS = [["sat","شنبه"],["sun","یکشنبه"],["mon","دوشنبه"],["tue","سه‌شنبه"],["wed","چهارشنبه"],["thu","پنجشنبه"],["fri","جمعه"]];
const DAY_NAME = Object.fromEntries(DAYS);
const JS_PREV = { sat:"fri", sun:"sat", mon:"sun", tue:"mon", wed:"tue", thu:"wed", fri:"thu" };
const EN_DAY = { Sun:"sun", Mon:"mon", Tue:"tue", Wed:"wed", Thu:"thu", Fri:"fri", Sat:"sat" };

const SECTORS = {
  cafe:       { catalog:"منوی کافه", kicker:"منو", sub:"سفارش بدید، آماده‌ش می‌کنیم", cta:"سفارش آنلاین", emoji:["☕","🥐","🍰"] },
  restaurant: { catalog:"منوی غذا", kicker:"منو", sub:"گرم و تازه، مستقیم از آشپزخانه", cta:"سفارش آنلاین", emoji:["🍲","🥗","🍢"] },
  bakery:     { catalog:"شیرینی‌ها و کیک‌ها", kicker:"ویترین", sub:"تازه از تنور، هر روز صبح", cta:"سفارش آنلاین", emoji:["🎂","🥐","🍪"] },
  clinic:     { catalog:"خدمات و تعرفه‌ها", kicker:"خدمات", sub:"تعرفه‌ها شفاف و به‌روز", cta:"رزرو نوبت", emoji:["✨","💆‍♀️","🌿"] },
  salon:      { catalog:"خدمات سالن", kicker:"خدمات", sub:"خدمات و تعرفه‌ها", cta:"رزرو نوبت", emoji:["💇‍♀️","💅","✨"] },
  boutique:   { catalog:"محصولات", kicker:"کالکشن", sub:"جدیدترین‌ها رو ببینید و سفارش بدید", cta:"خرید آنلاین", emoji:["👗","👜","✨"] }
};

/* ---------- color utils (theme from config) ---------- */
const hex2rgb = h => { h = String(h).replace("#", ""); if (h.length === 3) h = [...h].map(c => c + c).join(""); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgb2hex = a => "#" + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const x = hex2rgb(a), y = hex2rgb(b); return rgb2hex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = h => { const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const onColor = h => lum(h) > .45 ? "#161616" : "#ffffff";

/* ---------- install prompt must be captured early ---------- */
let deferredInstall = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; if (window.__siteReady) showInstall(); });

/* ---------- config loading ---------- */
function loadScript(src) {
  return new Promise(res => { const s = document.createElement("script"); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); });
}
async function loadConfig() {
  const demo = new URLSearchParams(location.search).get("demo");
  if (demo && /^[a-z0-9-]{1,40}$/.test(demo) && await loadScript(`examples/${demo}.js`) && window.SITE) return window.SITE;
  await loadScript("config.js");
  return window.SITE;
}

let S, SEC, cart, ITEMS = new Map(), slug;

function applyTheme() {
  const t = S.theme || {};
  const primary = t.primary || "#7a4a2b", accent = t.accent || "#e0a458", bg = t.bg || "#fbf6f0";
  const dark = lum(bg) < .3;
  const text = t.text || (dark ? "#f4efe9" : mix("#000000", primary, .18));
  const r = document.documentElement.style;
  r.setProperty("--primary", primary);
  r.setProperty("--accent", accent);
  r.setProperty("--bg", bg);
  r.setProperty("--text", text);
  r.setProperty("--muted", mix(text, bg, .42));
  r.setProperty("--surface", dark ? mix(bg, "#ffffff", .06) : mix(bg, "#ffffff", .75));
  r.setProperty("--surface2", dark ? mix(bg, "#ffffff", .11) : mix(bg, primary, .07));
  r.setProperty("--line", dark ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.08)");
  r.setProperty("--on-primary", onColor(primary));
  r.setProperty("--on-accent", onColor(accent));
  document.documentElement.dataset.mood = t.mood || "warm";
  $('meta[name="theme-color"]').content = primary;
  S._thumbs = [
    `linear-gradient(135deg,${mix(bg, primary, .16)},${mix(bg, accent, .38)})`,
    `linear-gradient(135deg,${mix(bg, accent, .30)},${mix(bg, primary, .10)})`,
    `linear-gradient(160deg,${mix(bg, primary, .28)},${mix(bg, primary, .08)})`,
    `linear-gradient(135deg,${mix(bg, accent, .18)},${mix(bg, accent, .45)})`
  ];
}

function iconSvg() {
  const t = S.theme || {}, txt = esc((S.logo && S.logo.text) || S.name.slice(0, 1));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${esc(t.primary)}"/><stop offset="1" stop-color="${esc(t.accent)}"/></linearGradient></defs><rect width="512" height="512" rx="112" fill="url(#g)"/><text x="256" y="300" font-family="Vazirmatn,Tahoma,sans-serif" font-size="${txt.length > 2 ? 150 : 220}" font-weight="800" text-anchor="middle" dominant-baseline="middle" fill="${onColor(t.primary || "#000")}">${txt}</text></svg>`;
}
function applyMeta() {
  document.title = `${S.name} | ${S.tagline || ""}`;
  $('meta[name="description"]').content = S.description || S.tagline || "";
  const icon = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(iconSvg());
  $("#favicon").href = icon;
  try {
    const man = {
      name: S.name, short_name: S.shortName || S.name, lang: "fa", dir: "rtl",
      start_url: location.href, scope: new URL(".", location.href).href, display: "standalone",
      background_color: S.theme.bg, theme_color: S.theme.primary,
      icons: [{ src: icon, sizes: "any", type: "image/svg+xml", purpose: "any" }]
    };
    $("#manifestLink").href = URL.createObjectURL(new Blob([JSON.stringify(man)], { type: "application/manifest+json" }));
  } catch {}
}

/* ---------- hours ---------- */
function ranges(spec) {
  if (!spec) return [];
  return String(spec).split(",").map(p => p.trim().split("-").map(t => { const [h, m] = enDigits(t).split(":").map(Number); return h * 60 + (m || 0); }))
    .filter(r => r.length === 2 && !isNaN(r[0]) && !isNaN(r[1])).map(([a, b]) => [a, b <= a ? b + 1440 : b]);
}
function tehranParts(d = new Date()) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const g = t => (p.find(x => x.type === t) || {}).value;
  return { day: EN_DAY[g("weekday")], min: (+g("hour") % 24) * 60 + +g("minute") };
}
const fmtMin = m => faDigits(`${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
function openStatus() {
  const { day, min } = tehranParts(), r = ranges((S.hours || {})[day]);
  const prev = JS_PREV[day], late = ranges((S.hours || {})[prev]).find(([, b]) => b > 1440 && min + 1440 < b);
  if (late) return { open: true, text: `باز است · تا ${fmtMin(late[1])}` };
  const cur = r.find(([a, b]) => min >= a && min < b);
  if (cur) return { open: true, text: `باز است · تا ${fmtMin(cur[1])}` };
  const next = r.find(([a]) => min < a);
  if (next) return { open: false, text: `بسته · باز می‌شود ${fmtMin(next[0])}` };
  return { open: false, text: "الان بسته است" };
}
const hoursText = spec => { const r = ranges(spec); return r.length ? r.map(([a, b]) => `${fmtMin(a)} تا ${fmtMin(b)}`).join(" و ") : "تعطیل"; };

/* ---------- render ---------- */
function thumbHTML(it, i, cls = "thumb") {
  const bg = it.bg ? esc(it.bg) : S._thumbs[i % 4];
  const inner = it.image ? `<img src="${esc(it.image)}" alt="${esc(it.name)}" loading="lazy">` : `<span aria-hidden="true">${esc(it.emoji || "🍽️")}</span>`;
  return `<div class="${cls}" style="background:${bg}">${inner}</div>`;
}
const priceHTML = it => it.price == null ? `<span class="price"><small>تماس بگیرید</small></span>`
  : `<span class="price">${it.oldPrice ? `<s>${faNum(it.oldPrice)}</s>` : ""}${it.priceFrom ? "<small>از </small>" : ""}${faNum(it.price)} <small>تومان</small></span>`;

function itemCard(it, i) {
  const q = qtyOf(it.id);
  const hot = (it.tags || []).find(t => /پرفروش|محبوب|جدید|ویژه|تخفیف/.test(t));
  let action;
  if (it.soldOut) action = `<span class="add txt" style="background:var(--surface2);color:var(--muted)">ناموجود</span>`;
  else if (!S.modules.cart) action = S.modules.booking ? `<button class="add txt" data-act="bookItem" data-id="${esc(it.id)}">رزرو</button>` : `<button class="add txt" data-act="ask" data-id="${esc(it.id)}">سفارش</button>`;
  else if (q && !(it.options && it.options.length)) action = `<div class="step"><button data-act="inc" data-id="${esc(it.id)}" aria-label="بیشتر">+</button><span>${faNum(q)}</span><button data-act="dec" data-id="${esc(it.id)}" aria-label="کمتر">−</button></div>`;
  else action = `<button class="add" data-act="${it.options && it.options.length ? "open" : "inc"}" data-id="${esc(it.id)}" aria-label="افزودن ${esc(it.name)}">+</button>`;
  return `<article class="item rv${it.soldOut ? " soldout" : ""}" data-act="open" data-id="${esc(it.id)}">
    ${thumbHTML(it, i).replace("</div>", hot ? `<span class="tag hot">${esc(hot)}</span></div>` : "</div>")}
    <div class="body"><h3>${esc(it.name)}</h3><div class="desc">${esc(it.desc || "")}</div>
    <div class="row">${priceHTML(it)}${action}</div></div></article>`;
}

function catalogHTML(filter = "") {
  const f = norm(filter);
  let out = "", n = 0;
  (S.catalog || []).forEach((c, ci) => {
    const items = c.items.filter(it => !f || norm(`${it.name} ${it.desc || ""} ${(it.tags || []).join(" ")} ${c.name}`).includes(f));
    if (!items.length) return;
    out += `<h3 class="cat-title" id="cat-${ci}">${esc(c.icon || "")} ${esc(c.name)}</h3><div class="grid">${items.map(it => itemCard(it, n++)).join("")}</div>`;
  });
  return out || `<p class="empty">چیزی پیدا نشد 🤔<br>از دستیار بپرسید یا مستقیم پیام بدهید.</p>`;
}

function render() {
  const st = openStatus(), m = S.modules, c = S.contact || {};
  const reviews = S.reviews || [];
  const avg = reviews.length ? reviews.reduce((a, r) => a + (r.stars || 5), 0) / reviews.length : 0;
  const heroImg = S.hero && S.hero.image;
  const emoji = (S.hero && S.hero.emoji) || SEC.emoji;
  const bookFirst = m.booking && !m.cart;
  const primaryCta = m.catalog ? `<a class="btn ${bookFirst ? "btn-ghost" : "btn-accent"}" href="#catalog">${esc(bookFirst ? (S.texts && S.texts.catalogTitle || SEC.catalog) : (S.hero && S.hero.cta || SEC.cta))}</a>` : "";
  const bookCta = m.booking ? `<a class="btn ${bookFirst ? "btn-accent" : "btn-ghost"}" href="#booking">📅 ${esc(S.hero && S.hero.bookCta || "رزرو نوبت آنلاین")}</a>` : "";
  const waCta = c.whatsapp ? `<a class="btn btn-ghost" href="https://wa.me/${esc(c.whatsapp)}" target="_blank" rel="noopener">پیام در واتساپ</a>` : "";

  $("#app").innerHTML = `
  ${S.badge && S.badge.show !== false ? `<div class="ribbon" id="ribbon">✨ <span>دمو اختصاصی برای ${esc(S.name)} — ساخته‌شده توسط <a href="https://homefoodpro.ir/dev/" target="_blank" rel="noopener">علیرضا</a></span><button class="x" data-act="hideRibbon" aria-label="بستن">×</button></div>` : ""}
  <header class="hdr"><div class="wrap">
    <div class="logo">${S.logo && S.logo.image ? `<img src="${esc(S.logo.image)}" alt="">` : esc((S.logo && S.logo.text) || S.name.slice(0, 1))}</div>
    <div class="brand"><b>${esc(S.name)}</b><small><i class="dot${st.open ? " on" : ""}"></i>${esc(st.text)}</small></div>
    ${c.phone ? `<a class="iconbtn" href="tel:${esc(c.phone)}" aria-label="تماس">${IC.phone}</a>` : ""}
    ${c.instagram ? `<a class="iconbtn" href="https://instagram.com/${esc(c.instagram)}" target="_blank" rel="noopener" aria-label="اینستاگرام">${IC.ig}</a>` : ""}
  </div></header>

  <main class="wrap">
    <section class="hero"><div class="hero-card${heroImg ? " has-img" : ""}"${heroImg ? ` style="background-image:url('${esc(heroImg)}')"` : ""}>
      <div class="hero-top"><span class="pill">${esc(S.hero && S.hero.badge || S.sectorLabel || "📍 " + (S.city || "مشهد"))}</span>
      ${heroImg ? "" : `<div class="emo" aria-hidden="true">${emoji.slice(0, 3).map((e, i) => `<span style="animation-delay:${i * .7}s">${esc(e)}</span>`).join("")}</div>`}</div>
      ${heroImg ? "" : `<div class="ghost" aria-hidden="true">${esc(emoji[0])}</div>`}
      <h1>${esc(S.hero && S.hero.title || S.name)}</h1>
      <p>${esc(S.tagline || "")}</p>
      <div class="hero-stats">
        ${reviews.length ? `<div><b>${faDigits(avg.toFixed(1))} ★</b>رضایت مشتری</div>` : ""}
        ${S.stats ? S.stats.map(s => `<div><b>${esc(s.value)}</b>${esc(s.label)}</div>`).join("") : ""}
      </div>
      <div class="ctas">${bookFirst ? bookCta + primaryCta : primaryCta + bookCta}${!bookCta || !primaryCta ? waCta : ""}</div>
    </div></section>

    ${S.highlights && S.highlights.length ? `<div class="hl">${S.highlights.map(h => `<div class="rv"><i>${esc(h.icon)}</i><span><b>${esc(h.title)}</b><small>${esc(h.text)}</small></span></div>`).join("")}</div>` : ""}

    ${m.catalog ? `<section class="sec" id="catalog">
      <div class="sec-h"><div><span class="kicker">${esc(SEC.kicker)}</span><h2>${esc(S.texts && S.texts.catalogTitle || SEC.catalog)}</h2><p>${esc(S.texts && S.texts.catalogSub || SEC.sub)}</p></div></div>
      <label class="search"><span class="sr">جستجو</span>${IC.search}<input id="q" type="search" placeholder="جستجو در ${esc(SEC.kicker)}…" autocomplete="off"></label>
      <nav class="cats" id="cats">${(S.catalog || []).map((cat, ci) => `<button class="cat${ci ? "" : " on"}" data-act="cat" data-i="${ci}">${esc(cat.icon || "")} ${esc(cat.name)}</button>`).join("")}</nav>
      <div id="items">${catalogHTML()}</div>
    </section>` : ""}

    ${m.booking ? `<section class="sec" id="booking">
      <div class="sec-h"><div><span class="kicker">رزرو آنلاین</span><h2>${esc(S.booking.title || "رزرو نوبت")}</h2><p>${esc(S.booking.subtitle || "خدمت، روز و ساعت را انتخاب کنید؛ تأیید نهایی در پیام‌رسان.")}</p></div></div>
      <div class="book rv" id="bookBox"></div>
    </section>` : ""}

    ${m.reviews && reviews.length ? `<section class="sec" id="reviews">
      <div class="sec-h"><div><span class="kicker">نظر مشتری‌ها</span><h2>مشتری‌ها چه می‌گویند</h2></div><div class="score"><b>${faDigits(avg.toFixed(1))}</b><span class="stars">★★★★★</span></div></div>
      <div class="revs">${reviews.map(r => `<div class="rev"><div class="stars">${"★".repeat(r.stars || 5)}${"☆".repeat(5 - (r.stars || 5))}</div><p>${esc(r.text)}</p><small>${esc(r.name)}${r.when ? " · " + esc(r.when) : ""}</small></div>`).join("")}</div>
    </section>` : ""}

    ${m.location ? `<section class="sec" id="location">
      <div class="sec-h"><div><span class="kicker">ساعات کاری و آدرس</span><h2>سر بزنید 👋</h2></div></div>
      <div class="info">
        <div class="card rv"><ul class="hours">${DAYS.map(([k, n]) => `<li class="${k === tehranParts().day ? "today" : ""}"><span>${n}</span><span class="${S.hours && S.hours[k] ? "" : "cl"}">${hoursText(S.hours && S.hours[k])}</span></li>`).join("")}</ul></div>
        <div class="card rv"><div class="map"><span class="pin">📍</span></div>
          <p class="addr">${esc(S.address && S.address.text || "")}</p>
          <div class="row2">${S.address && S.address.map ? `<a class="btn btn-primary" href="${esc(S.address.map)}" target="_blank" rel="noopener">مسیریابی</a>` : ""}${c.phone ? `<a class="btn btn-soft" href="tel:${esc(c.phone)}">تماس: ${esc(faDigits(c.phoneLabel || c.phone))}</a>` : ""}</div></div>
      </div>
    </section>` : ""}

    ${m.instagram && c.instagram ? `<section class="sec"><a class="insta rv" href="https://instagram.com/${esc(c.instagram)}" target="_blank" rel="noopener">
      <span class="ig-ic">${IC.ig}</span><span><b>@${esc(c.instagram)}</b><small>${esc(S.texts && S.texts.instagram || "جدیدترین‌ها رو اول در پیج ما ببینید")}</small></span><span class="btn">دنبال کنید</span></a></section>` : ""}
  </main>

  <footer class="wrap">© ${esc(S.name)} — ${esc(S.city || "مشهد")}<br>${S.badge && S.badge.show !== false ? `طراحی و توسعه: <a href="https://homefoodpro.ir/dev/" target="_blank" rel="noopener">علیرضا HA</a> · اپ وب نصب‌شدنی (PWA)` : ""}</footer>

  ${m.cart ? `<button class="cartbar" id="cartbar" data-act="openCart"><span class="cnt" id="cartCnt">۰</span><b>مشاهده سبد و ثبت سفارش</b><span id="cartSum"></span></button>` : ""}
  ${m.assistant ? `<button class="fab" data-act="openChat" aria-label="دستیار هوشمند">${IC.chat}<i class="ping"></i></button><div class="fab-tip" id="fabTip" hidden>سوالی دارید؟ بپرسید 🙂</div>` : ""}
  <div class="install" id="install" role="dialog" aria-label="نصب اپ"><div class="logo">${esc((S.logo && S.logo.text) || S.name.slice(0, 1))}</div><div><b>اپ ${esc(S.name)} را نصب کنید</b><span id="installTxt">بدون نیاز به استور، روی صفحه اصلی گوشی</span></div><button class="btn btn-primary" id="installBtn" data-act="install">نصب</button><button class="x" data-act="hideInstall" aria-label="بستن">×</button></div>
  <div class="sheet" id="sheet" aria-hidden="true"><div class="bd" data-act="close"></div><div class="panel" role="dialog" aria-modal="true" id="panel"></div></div>
  <div class="toast" id="toast" role="status"></div>`;

  if (m.booking) renderBooking();
  updateCart();
  reveal();
}

/* ---------- cart ---------- */
const qtyOf = id => Object.entries(cart).reduce((a, [k, q]) => a + (k.split("|")[0] === id ? q : 0), 0);
function cartLines() {
  return Object.entries(cart).filter(([, q]) => q > 0).map(([k, q]) => { const [id, opt] = k.split("|"); const it = ITEMS.get(id); return it && { k, it, opt, q, sum: (it.price || 0) * q }; }).filter(Boolean);
}
function deliveryFee(sub, mode) {
  const o = S.order || {};
  if (mode !== "delivery") return 0;
  if (o.freeOver && sub >= o.freeOver) return 0;
  return o.deliveryFee ?? null;
}
function setQty(key, q) {
  if (q <= 0) delete cart[key]; else cart[key] = Math.min(q, 99);
  store.set("cart:" + slug, cart);
  updateCart();
}
function updateCart() {
  const bar = $("#cartbar"); if (!bar) return;
  const lines = cartLines(), n = lines.reduce((a, l) => a + l.q, 0), sub = lines.reduce((a, l) => a + l.sum, 0);
  bar.classList.toggle("show", n > 0);
  $("#cartCnt").textContent = faNum(n);
  $("#cartSum").textContent = toman(sub);
}
function refreshItems() { const box = $("#items"); if (box) { box.innerHTML = catalogHTML($("#q") ? $("#q").value : ""); $$(".rv", box).forEach(e => e.classList.add("in")); } }

/* ---------- sheets ---------- */
let lastFocus = null;
function openSheet(html, cls = "") {
  lastFocus = document.activeElement;
  const p = $("#panel"); p.className = "panel " + cls; p.innerHTML = html;
  $("#sheet").classList.add("open"); $("#sheet").setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
  setTimeout(() => { const f = p.querySelector("[autofocus]") || p.querySelector("button"); f && f.focus({ preventScroll: true }); }, 60);
}
function closeSheet() {
  $("#sheet").classList.remove("open"); $("#sheet").setAttribute("aria-hidden", "true");
  document.body.classList.remove("lock");
  lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
}
const head = t => `<div class="ph"><h3>${esc(t)}</h3><button class="iconbtn" data-act="close" aria-label="بستن">${IC.x}</button></div>`;

let sheetItem = null, sheetOpt = null, sheetQty = 1;
function openItem(id) {
  const it = ITEMS.get(id); if (!it) return;
  sheetItem = it; sheetOpt = it.options && it.options[0] || null; sheetQty = 1;
  drawItem(true);
}
function drawItem(first) {
  const it = sheetItem, m = S.modules;
  const idx = [...ITEMS.keys()].indexOf(it.id);
  let foot;
  if (it.soldOut) foot = `<button class="btn btn-soft btn-block" disabled>فعلاً ناموجود</button>`;
  else if (m.cart) foot = `<div style="display:flex;gap:10px;align-items:center"><div class="step"><button data-act="sq" data-d="1">+</button><span>${faNum(sheetQty)}</span><button data-act="sq" data-d="-1">−</button></div><button class="btn btn-primary" style="flex:1" data-act="addSheet">افزودن به سبد · ${toman((it.price || 0) * sheetQty)}</button></div>`;
  else if (m.booking) foot = `<button class="btn btn-primary btn-block" data-act="bookItem" data-id="${esc(it.id)}">📅 رزرو همین خدمت</button>`;
  else foot = `<button class="btn btn-primary btn-block" data-act="ask" data-id="${esc(it.id)}">سفارش / سوال در پیام‌رسان</button>`;
  const html = head(it.name) + `<div class="pb">${thumbHTML(it, idx, "big-thumb")}
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3 style="font-size:19px">${esc(it.name)}</h3>${priceHTML(it)}</div>
    ${it.tags && it.tags.length ? `<div class="tags">${it.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
    <p style="color:var(--muted);margin:6px 0 0">${esc(it.long || it.desc || "")}</p>
    ${it.duration ? `<p style="margin:6px 0 0">⏱ مدت: ${esc(faDigits(it.duration))}</p>` : ""}
    ${it.options && it.options.length ? `<span class="lbl">${esc(it.optionLabel || "انتخاب کنید")}</span><div class="chips wrapc">${it.options.map(o => `<button class="chip${o === sheetOpt ? " on" : ""}" data-act="opt" data-v="${esc(o)}">${esc(o)}</button>`).join("")}</div>` : ""}
  </div><div class="pf">${foot}</div>`;
  if (first) openSheet(html); else $("#panel").innerHTML = html;
}

/* checkout */
let mode = null;
function openCart(redraw) {
  const lines = cartLines(), o = S.order || {};
  const modes = o.modes || ["delivery", "pickup"];
  mode = mode && modes.includes(mode) ? mode : modes[0];
  if (!lines.length) { closeSheet(); return; }
  const sub = lines.reduce((a, l) => a + l.sum, 0), fee = deliveryFee(sub, mode);
  const form = store.get("buyer", {});
  const html = head("سبد خرید") + `<div class="pb">
    ${lines.map(l => `<div class="line"><div class="em" style="background:${l.it.bg ? esc(l.it.bg) : S._thumbs[0]}">${l.it.image ? `<img src="${esc(l.it.image)}" alt="">` : esc(l.it.emoji || "🍽️")}</div>
      <div class="nm">${esc(l.it.name)}${l.opt ? ` <small>${esc(l.opt)}</small>` : ""}<small>${toman(l.sum)}</small></div>
      <div class="step"><button data-act="cinc" data-k="${esc(l.k)}">+</button><span>${faNum(l.q)}</span><button data-act="cdec" data-k="${esc(l.k)}">−</button></div></div>`).join("")}
    ${modes.length > 1 ? `<span class="lbl" style="margin-top:16px">نحوه تحویل</span><div class="seg">${modes.map(md => `<button class="${md === mode ? "on" : ""}" data-act="mode" data-v="${md}">${md === "delivery" ? "🛵 ارسال با پیک" : "🏪 تحویل حضوری"}</button>`).join("")}</div>` : ""}
    ${o.note ? `<p style="font-size:12px;color:var(--muted);margin:8px 0 0">${esc(o.note)}</p>` : ""}
    <div class="sum"><div><span>جمع سفارش</span><span>${toman(sub)}</span></div>
      ${mode === "delivery" ? `<div><span>هزینه ارسال</span><span>${fee === null ? "طبق مسافت" : fee ? toman(fee) : "رایگان 🎉"}</span></div>` : ""}
      <div class="tot"><span>مبلغ قابل پرداخت</span><span>${toman(sub + (fee || 0))}</span></div></div>
    ${o.freeOver && mode === "delivery" && sub < o.freeOver ? `<p style="font-size:12px;margin:0 0 8px;color:var(--primary)">فقط ${toman(o.freeOver - sub)} دیگر تا ارسال رایگان!</p>` : ""}
    <div class="two"><input class="field" id="bName" placeholder="نام شما" value="${esc(form.name || "")}" autocomplete="name"><input class="field" id="bPhone" placeholder="موبایل" inputmode="tel" value="${esc(form.phone || "")}" autocomplete="tel"></div>
    ${mode === "delivery" ? `<textarea class="field" id="bAddr" placeholder="آدرس دقیق (محله، خیابان، پلاک)" style="margin-top:10px" autocomplete="street-address">${esc(form.addr || "")}</textarea>` : ""}
    <input class="field" id="bNote" placeholder="توضیحات (اختیاری)" style="margin-top:10px">
    <div class="err" id="bErr"></div>
    <div class="send">${channelButtons("order")}</div>
    ${o.payment ? `<p style="font-size:12px;color:var(--muted);text-align:center;margin:10px 0 0">💳 ${esc(o.payment)}</p>` : ""}
  </div>`;
  if (redraw) { const keep = ["bName","bPhone","bAddr","bNote"].map(id => [id, $("#" + id) && $("#" + id).value]); $("#panel").innerHTML = html; keep.forEach(([id, v]) => { if (v != null && $("#" + id)) $("#" + id).value = v; }); }
  else openSheet(html);
}
function channelButtons(kind) {
  const c = S.contact || {}, order = (S.channels || ["whatsapp", "telegram", "instagram"]);
  const lbl = { whatsapp: ["wa", "ارسال در واتساپ"], telegram: ["tg", "ارسال در تلگرام"], instagram: ["ig", "ارسال در دایرکت اینستاگرام"] };
  return order.filter(ch => c[ch]).map(ch => `<button class="btn ${lbl[ch][0]}" data-act="send" data-kind="${kind}" data-ch="${ch}">${lbl[ch][1]}</button>`).join("");
}
const validPhone = p => /^(\+?98|0)?9\d{9}$/.test(enDigits(p).replace(/[\s-]/g, ""));
const code = () => Math.random().toString(36).slice(2, 6).toUpperCase();

function orderText() {
  const name = $("#bName").value.trim(), phone = $("#bPhone").value.trim(), addr = $("#bAddr") ? $("#bAddr").value.trim() : "", note = $("#bNote").value.trim();
  if (name.length < 2) return err("bErr", "لطفاً نام را وارد کنید");
  if (!validPhone(phone)) return err("bErr", "شماره موبایل معتبر نیست (مثلاً ۰۹۱۵…)");
  if (mode === "delivery" && addr.length < 8) return err("bErr", "آدرس را کامل‌تر بنویسید");
  store.set("buyer", { name, phone, addr });
  const lines = cartLines(), sub = lines.reduce((a, l) => a + l.sum, 0), fee = deliveryFee(sub, mode), line = "━━━━━━━━━━";
  return [`🧾 سفارش جدید از اپ ${S.name}`, `کد سفارش: #${code()}`, line,
    ...lines.map(l => `${faNum(l.q)} × ${l.it.name}${l.opt ? ` (${l.opt})` : ""} — ${toman(l.sum)}`), line,
    `جمع: ${toman(sub)}`,
    mode === "delivery" ? `ارسال: ${fee === null ? "طبق مسافت" : fee ? toman(fee) : "رایگان"}` : "تحویل: حضوری",
    `💰 مبلغ کل: ${toman(sub + (fee || 0))}`, line,
    `👤 ${name}`, `📞 ${faDigits(enDigits(phone))}`, mode === "delivery" ? `📍 ${addr}` : "", note ? `📝 ${note}` : ""].filter(Boolean).join("\n");
}
function err(id, t) { const e = $("#" + id); if (e) e.textContent = t; return null; }

/* message delivery — no backend: WhatsApp gets prefilled text, Telegram/Instagram get copied text + open chat */
function sendVia(ch, text) {
  const c = S.contact;
  if (ch === "whatsapp") { window.open(`https://wa.me/${encodeURIComponent(c.whatsapp)}?text=${encodeURIComponent(text)}`, "_blank", "noopener"); return; }
  copy(text);
  toast("متن پیام کپی شد ✅ در چت، Paste کنید و بفرستید");
  setTimeout(() => window.open(ch === "telegram" ? `https://t.me/${encodeURIComponent(c.telegram)}` : `https://ig.me/m/${encodeURIComponent(c.instagram)}`, "_blank", "noopener"), 50);
}
function copy(text) {
  try { if (navigator.clipboard && isSecureContext) { navigator.clipboard.writeText(text).catch(fallback); return; } } catch {}
  fallback();
  function fallback() { const t = document.createElement("textarea"); t.value = text; t.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch {} t.remove(); }
}
let toastT;
function toast(t) { const e = $("#toast"); e.textContent = t; e.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove("show"), 3200); }

/* ---------- booking ---------- */
const B = { svc: null, day: null, time: null };
function bookDays() {
  const out = [], n = S.booking.daysAhead || 14;
  for (let i = 0; i < n + 7 && out.length < n; i++) {
    const d = new Date(Date.now() + i * 864e5), { day } = tehranParts(d);
    out.push({ d, key: day, i, closed: !ranges(S.hours && S.hours[day]).length,
      label: i === 0 ? "امروز" : i === 1 ? "فردا" : DAY_NAME[day],
      date: new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: "Asia/Tehran", day: "numeric", month: "long" }).format(d),
      full: new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: "Asia/Tehran", weekday: "long", day: "numeric", month: "long" }).format(d) });
  }
  return out;
}
function bookSlots(day) {
  if (!day || day.closed) return [];
  const step = S.booking.slotMinutes || 60, now = tehranParts().min, out = [];
  ranges(S.hours[day.key]).forEach(([a, b]) => { for (let t = a; t + step <= b; t += step) out.push({ t, past: day.i === 0 && t < now + 45 }); });
  return out;
}
function renderBooking() {
  const box = $("#bookBox"); if (!box) return;
  const svcs = S.booking.services || [], days = bookDays().filter(d => !d.closed);
  if (!B.day) B.day = days.find(d => bookSlots(d).some(s => !s.past)) || days[0];
  const slots = bookSlots(B.day);
  const keep = ["kName","kPhone","kNote"].map(id => [id, $("#" + id) && $("#" + id).value]);
  box.innerHTML = `
    <span class="lbl">۱. انتخاب خدمت</span>
    <div class="chips">${svcs.map(s => `<button class="chip${B.svc === s.name ? " on" : ""}" data-act="bsvc" data-v="${esc(s.name)}">${esc(s.name)}${s.price ? `<small>${s.priceFrom ? "از " : ""}${toman(s.price)}</small>` : s.price === 0 ? "<small>رایگان</small>" : ""}</button>`).join("")}</div>
    <span class="lbl">۲. انتخاب روز</span>
    <div class="chips">${days.map(d => `<button class="chip${B.day && B.day.i === d.i ? " on" : ""}" data-act="bday" data-i="${d.i}">${esc(d.label)}<small>${esc(d.date)}</small></button>`).join("")}</div>
    <span class="lbl">۳. انتخاب ساعت</span>
    <div class="chips wrapc">${slots.length ? slots.map(s => `<button class="chip${B.time === s.t ? " on" : ""}" data-act="btime" data-t="${s.t}"${s.past ? " disabled" : ""}>${fmtMin(s.t)}</button>`).join("") : `<span style="color:var(--muted);font-size:13px">این روز وقت خالی ندارد</span>`}</div>
    <span class="lbl">۴. اطلاعات شما</span>
    <div class="two"><input class="field" id="kName" placeholder="نام و نام خانوادگی" autocomplete="name"><input class="field" id="kPhone" placeholder="موبایل" inputmode="tel" autocomplete="tel"></div>
    <input class="field" id="kNote" placeholder="توضیحات (اختیاری)" style="margin-top:10px">
    <div class="err" id="kErr"></div>
    <div class="send">${channelButtons("booking")}</div>
    <p style="font-size:12px;color:var(--muted);margin:10px 0 0;text-align:center">${esc(S.booking.note || "نوبت پس از تأیید در پیام‌رسان قطعی می‌شود.")}</p>`;
  const buyer = store.get("buyer", {});
  keep.forEach(([id, v]) => { const e = $("#" + id); if (e) e.value = v != null ? v : id === "kName" ? buyer.name || "" : id === "kPhone" ? buyer.phone || "" : ""; });
}
function bookingText() {
  const name = $("#kName").value.trim(), phone = $("#kPhone").value.trim(), note = $("#kNote").value.trim();
  if (!B.svc) return err("kErr", "یک خدمت انتخاب کنید");
  if (!B.day || B.time == null) return err("kErr", "روز و ساعت را انتخاب کنید");
  if (name.length < 2) return err("kErr", "لطفاً نام را وارد کنید");
  if (!validPhone(phone)) return err("kErr", "شماره موبایل معتبر نیست");
  store.set("buyer", Object.assign(store.get("buyer", {}), { name, phone }));
  return [`📅 درخواست رزرو نوبت — ${S.name}`, "━━━━━━━━━━", `خدمت: ${B.svc}`, `روز: ${B.day.full}`, `ساعت: ${fmtMin(B.time)}`, "━━━━━━━━━━", `👤 ${name}`, `📞 ${faDigits(enDigits(phone))}`, note ? `📝 ${note}` : "", "", "لطفاً تأیید بفرمایید 🙏"].filter((x, i, a) => x || i === a.length - 2).join("\n");
}

/* ---------- Assistant (rule-based, swappable) ----------
 * The UI only calls Assistant.reply(text) -> Promise<{text, actions?}>.
 * To upgrade to a real AI bot later, replace reply() with e.g.:
 *   async reply(text) {
 *     const r = await fetch(S.assistant.endpoint, { method: "POST", headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ message: text, context: Assistant.context() }) });
 *     return { text: (await r.json()).answer };
 *   }
 * context() already flattens hours/address/catalog/FAQ into plain text for an LLM system prompt. */
const Assistant = {
  context() {
    return [`کسب‌وکار: ${S.name} (${S.city || "مشهد"})`, `آدرس: ${S.address && S.address.text}`,
      "ساعات: " + DAYS.map(([k, n]) => `${n} ${hoursText(S.hours && S.hours[k])}`).join("، "),
      "محصولات/خدمات: " + [...ITEMS.values()].map(i => `${i.name} ${i.price ? i.price + " تومان" : ""}`).join("؛ "),
      ...(S.faq || []).map(f => `${f.q}: ${f.a}`)].join("\n");
  },
  intents: [
    { id: "greet", keys: ["سلام", "درود", "وقت بخیر", "hi", "hello"], fn: () => ({ text: `سلام! 👋 من دستیار ${S.name} هستم. درباره ساعات کاری، آدرس، قیمت‌ها${S.modules.cart ? "، ارسال" : ""}${S.modules.booking ? " و رزرو نوبت" : ""} بپرسید.` }) },
    { id: "hours", keys: ["ساعت", "باز", "بسته", "تعطیل", "کی میای", "چه ساعتی", "جمعه", "امروز"], fn: () => { const st = openStatus(); return { text: `الان ${st.text}.\n\n` + DAYS.map(([k, n]) => `${n}: ${hoursText(S.hours && S.hours[k])}`).join("\n") }; } },
    { id: "address", keys: ["آدرس", "کجا", "کجاست", "لوکیشن", "مسیر", "نقشه", "نشانی", "پارکینگ"], fn: () => ({ text: `📍 ${S.address && S.address.text}`, actions: S.address && S.address.map ? [{ label: "مسیریابی", href: S.address.map }] : [] }) },
    { id: "delivery", keys: ["ارسال", "پیک", "دلیوری", "تحویل", "میفرستید", "می فرستید", "بفرستید", "هزینه ارسال"], fn: () => {
      const o = S.order || {};
      if (!S.modules.cart) return { text: "سفارش و هماهنگی از طریق پیام‌رسان انجام می‌شود 🙂" };
      return { text: [o.note, o.deliveryFee === 0 ? "ارسال رایگان است 🎉" : o.deliveryFee ? `هزینه ارسال: ${toman(o.deliveryFee)}` : "هزینه ارسال طبق مسافت محاسبه می‌شود.", o.freeOver ? `برای سفارش بالای ${toman(o.freeOver)} ارسال رایگان است.` : "", (o.modes || []).includes("pickup") ? "تحویل حضوری هم داریم." : ""].filter(Boolean).join("\n"), actions: [{ label: "دیدن " + SEC.kicker, act: "goCatalog" }] };
    } },
    { id: "booking", keys: ["نوبت", "رزرو", "وقت خالی", "وقت میخوام", "وقت می خوام"], fn: () => S.modules.booking ? { text: "رزرو آنلاین داریم! خدمت، روز و ساعت را انتخاب کنید تا درخواست مستقیم برای ما ارسال شود.", actions: [{ label: "📅 رزرو نوبت", act: "goBooking" }] } : { text: "برای هماهنگی لطفاً تماس بگیرید یا پیام بدهید." } },
    { id: "popular", keys: ["پیشنهاد", "پرفروش", "محبوب", "چی دارید", "منو", "لیست", "خدمات", "چی خوبه", "جدید"], fn: () => {
      const pop = [...ITEMS.values()].filter(i => (i.tags || []).some(t => /پرفروش|محبوب|ویژه|جدید/.test(t))).slice(0, 4);
      const list = (pop.length ? pop : [...ITEMS.values()].slice(0, 4)).map(i => `• ${i.name}${i.price ? " — " + toman(i.price) : ""}`).join("\n");
      return { text: `پیشنهاد ما:\n${list}`, actions: [{ label: "دیدن همه", act: "goCatalog" }] };
    } },
    { id: "contact", keys: ["تماس", "شماره", "تلفن", "واتساپ", "تلگرام", "زنگ"], fn: () => { const c = S.contact || {}; return { text: [c.phone && `📞 ${faDigits(c.phoneLabel || c.phone)}`, c.whatsapp && "💬 واتساپ: همین حالا پیام بدهید", c.telegram && `✈️ تلگرام: @${c.telegram}`].filter(Boolean).join("\n"), actions: c.whatsapp ? [{ label: "پیام در واتساپ", href: `https://wa.me/${c.whatsapp}` }] : [] }; } },
    { id: "payment", keys: ["پرداخت", "کارت", "آنلاین", "قسط", "نقد"], fn: () => ({ text: (S.order && S.order.payment) || "پرداخت پس از هماهنگی در پیام‌رسان (کارت‌به‌کارت یا درگاه) انجام می‌شود." }) },
    { id: "insta", keys: ["اینستا", "پیج", "instagram"], fn: () => ({ text: `پیج ما: @${S.contact.instagram}`, actions: [{ label: "دیدن پیج", href: `https://instagram.com/${S.contact.instagram}` }] }) }
  ],
  matchItems(q) {
    const words = q.split(" ").filter(w => w.length >= 3 && !/قیمت|چند|چنده|هزینه|تومن|تومان|دارید|میخوام|است|هست/.test(w));
    return [...ITEMS.values()].filter(it => { const n = norm(it.name); return q.includes(n) || words.some(w => n.includes(w)); }).slice(0, 4);
  },
  async reply(text) {
    const q = norm(text);
    for (const f of S.faq || []) if ((f.keys || []).some(k => q.includes(norm(k)))) return { text: f.a };
    const asksPrice = /قیمت|چند|چنده|هزینه|تعرفه|گرون|ارزون|نرخ/.test(q);
    const items = this.matchItems(q);
    if (items.length) return {
      text: items.map(i => `• ${i.name}: ${i.price ? (i.priceFrom ? "از " : "") + toman(i.price) : "تماس بگیرید"}${i.soldOut ? " (فعلاً ناموجود)" : ""}${!asksPrice && i.desc ? `\n  ${i.desc}` : ""}`).join("\n"),
      actions: [{ label: S.modules.cart ? "سفارش" : S.modules.booking ? "رزرو" : "مشاهده", act: S.modules.booking && !S.modules.cart ? "goBooking" : "goCatalog" }]
    };
    let best = null, score = 0;
    for (const it of this.intents) { const s = it.keys.filter(k => q.includes(norm(k))).length; if (s > score) { best = it; score = s; } }
    if (best) return best.fn();
    if (asksPrice) { const all = [...ITEMS.values()].filter(i => i.price); if (all.length) { const p = all.map(i => i.price); return { text: `قیمت‌ها از ${toman(Math.min(...p))} تا ${toman(Math.max(...p))} است. نام محصول را بنویسید تا دقیق بگویم 🙂`, actions: [{ label: "دیدن لیست قیمت", act: "goCatalog" }] }; } }
    const c = S.contact || {};
    return { text: "این را دقیق نمی‌دانم 🙏 سوالتان را مستقیم از همکاران ما بپرسید:", actions: c.whatsapp ? [{ label: "پرسیدن در واتساپ", href: `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(text)}` }] : [] };
  }
};

const chatLog = [];
function msgHTML(m) {
  return `<div class="msg ${m.me ? "me" : "bot"}">${esc(m.text)}${(m.actions || []).map(a => a.href ? `<br><a href="${esc(a.href)}" target="_blank" rel="noopener">${esc(a.label)}</a>` : `<br><a href="#" data-act="${esc(a.act)}">${esc(a.label)}</a>`).join("")}</div>`;
}
function openChat() {
  if (!chatLog.length) chatLog.push({ text: (S.assistant && S.assistant.welcome) || `سلام! 👋 دستیار هوشمند ${S.name} هستم. هر سوالی دارید بپرسید.` });
  const quick = (S.assistant && S.assistant.quick) || ["ساعت کاری؟", "آدرس کجاست؟", S.modules.booking ? "رزرو نوبت" : "هزینه ارسال؟", "پیشنهاد شما؟"];
  openSheet(head("دستیار هوشمند 🤖") + `<div class="pb" id="chatBody" aria-live="polite">${chatLog.map(msgHTML).join("")}</div>
    <div class="quick">${quick.map(qq => `<button data-act="quick" data-v="${esc(qq)}">${esc(qq)}</button>`).join("")}</div>
    <form class="chatform" id="chatForm"><input id="chatIn" placeholder="سوالتان را بنویسید…" autocomplete="off" aria-label="پیام"><button aria-label="ارسال">${IC.send}</button></form>
    <p class="ai-note">پاسخ‌ها خودکار و بر اساس اطلاعات همین کسب‌وکار است</p>`, "chat");
  scrollChat();
  const tip = $("#fabTip"); if (tip) tip.hidden = true;
}
const scrollChat = () => { const b = $("#chatBody"); if (b) b.scrollTop = b.scrollHeight; };
async function ask(text) {
  text = String(text || "").trim().slice(0, 300); if (!text) return;
  chatLog.push({ me: true, text });
  const b = $("#chatBody"); if (!b) return;
  b.insertAdjacentHTML("beforeend", msgHTML({ me: true, text }) + `<div class="msg bot typing" id="typing">در حال نوشتن…</div>`); scrollChat();
  const [r] = await Promise.all([Assistant.reply(text), new Promise(res => setTimeout(res, 550))]);
  chatLog.push(r);
  const t = $("#typing"); if (t) t.outerHTML = msgHTML(r); scrollChat();
}

/* ---------- install ---------- */
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone;
function showInstall() {
  if (!S.modules.install || standalone() || store.get("noInstall:" + slug, false)) return;
  const el = $("#install"); if (!el) return;
  if (!deferredInstall && isIOS) { $("#installTxt").textContent = "در Safari دکمه Share و سپس Add to Home Screen را بزنید"; $("#installBtn").hidden = true; }
  else if (!deferredInstall) return;
  setTimeout(() => el.classList.add("show"), 1500);
}

/* ---------- events ---------- */
function bind() {
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]"); if (!t) return;
    const a = t.dataset.act, id = t.dataset.id;
    if (t.tagName === "A" && t.getAttribute("href") === "#") e.preventDefault();
    const it = id && ITEMS.get(id);
    switch (a) {
      case "open": openItem(id); break;
      case "inc": e.stopPropagation(); setQty(id, (cart[id] || 0) + 1); refreshItems(); break;
      case "dec": e.stopPropagation(); setQty(id, (cart[id] || 0) - 1); refreshItems(); break;
      case "opt": sheetOpt = t.dataset.v; drawItem(); break;
      case "sq": sheetQty = Math.max(1, Math.min(99, sheetQty + +t.dataset.d)); drawItem(); break;
      case "addSheet": { const k = sheetItem.id + (sheetOpt ? "|" + sheetOpt : ""); setQty(k, (cart[k] || 0) + sheetQty); refreshItems(); closeSheet(); toast(`${sheetItem.name} به سبد اضافه شد ✓`); break; }
      case "openCart": openCart(); break;
      case "cinc": setQty(t.dataset.k, (cart[t.dataset.k] || 0) + 1); openCart(true); refreshItems(); break;
      case "cdec": setQty(t.dataset.k, (cart[t.dataset.k] || 0) - 1); openCart(true); refreshItems(); break;
      case "mode": mode = t.dataset.v; openCart(true); break;
      case "send": { const txt = t.dataset.kind === "order" ? orderText() : bookingText(); if (txt) sendVia(t.dataset.ch, txt); break; }
      case "close": closeSheet(); break;
      case "cat": { const sec = $("#cat-" + t.dataset.i); $$(".cat").forEach(c => c.classList.toggle("on", c === t)); if (sec) scrollTo({ top: sec.getBoundingClientRect().top + scrollY - 130, behavior: "smooth" }); break; }
      case "bsvc": B.svc = t.dataset.v; renderBooking(); break;
      case "bday": B.day = bookDays().find(d => d.i === +t.dataset.i); B.time = null; renderBooking(); break;
      case "btime": B.time = +t.dataset.t; renderBooking(); break;
      case "bookItem": e.stopPropagation();
        if (it) { if (!S.booking.services.some(s => s.name === it.name)) S.booking.services.unshift({ name: it.name, price: it.price, priceFrom: it.priceFrom }); B.svc = it.name; }
        closeSheet(); renderBooking(); $("#booking").scrollIntoView({ behavior: "smooth" }); break;
      case "ask": e.stopPropagation(); if (it) sendVia(S.channels && S.channels[0] || "whatsapp", `سلام، درباره «${it.name}» سوال/سفارش داشتم.`); break;
      case "openChat": openChat(); break;
      case "quick": ask(t.dataset.v); break;
      case "goCatalog": closeSheet(); $("#catalog") && $("#catalog").scrollIntoView({ behavior: "smooth" }); break;
      case "goBooking": closeSheet(); $("#booking") && $("#booking").scrollIntoView({ behavior: "smooth" }); break;
      case "hideRibbon": $("#ribbon").remove(); break;
      case "install": if (deferredInstall) { deferredInstall.prompt(); deferredInstall.userChoice.finally(() => { deferredInstall = null; $("#install").classList.remove("show"); }); } break;
      case "hideInstall": $("#install").classList.remove("show"); store.set("noInstall:" + slug, true); break;
    }
  });
  document.addEventListener("submit", e => { if (e.target.id === "chatForm") { e.preventDefault(); const i = $("#chatIn"); ask(i.value); i.value = ""; } });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#sheet").classList.contains("open")) closeSheet(); });
  let qt; document.addEventListener("input", e => { if (e.target.id === "q") { clearTimeout(qt); qt = setTimeout(refreshItems, 120); } });
}

function reveal() {
  const els = $$(".rv");
  if (!("IntersectionObserver" in window) || !document.documentElement.classList.contains("anim")) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -6% 0px" });
  els.forEach(e => io.observe(e));
  // category tab follows scroll
  const tabs = $$(".cat");
  if (tabs.length) {
    const cio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { const i = en.target.id.split("-")[1]; tabs.forEach(t => t.classList.toggle("on", t.dataset.i === i)); const on = tabs[+i], bar = $("#cats"); if (on && bar) { const a = on.getBoundingClientRect(), b = bar.getBoundingClientRect(); bar.scrollBy({ left: a.left - b.left - (b.width - a.width) / 2, behavior: "smooth" }); } } }), { rootMargin: "-130px 0px -65% 0px" });
    $$(".cat-title").forEach(h => cio.observe(h));
  }
}

/* ---------- boot ---------- */
async function boot() {
  S = await loadConfig();
  if (!S) { $("#app").innerHTML = `<p class="empty">فایل config.js پیدا نشد.</p>`; return; }
  SEC = Object.assign({}, SECTORS[S.sector] || SECTORS.cafe, S.texts || {});
  S.modules = Object.assign({ catalog: true, cart: true, booking: false, assistant: true, reviews: true, location: true, instagram: true, install: true }, S.modules || {});
  S.theme = Object.assign({ primary: "#7a4a2b", accent: "#e0a458", bg: "#fbf6f0" }, S.theme || {});
  S.booking = Object.assign({ services: [] }, S.booking || {});
  if (S.modules.booking && !S.booking.services.length) S.booking.services = (S.catalog || []).flatMap(c => c.items).map(i => ({ name: i.name, price: i.price, priceFrom: i.priceFrom }));
  slug = S.slug || norm(S.name).replace(/\s/g, "-");
  (S.catalog || []).forEach((c, ci) => c.items.forEach((it, ii) => { it.id = String(it.id || `c${ci}i${ii}`); ITEMS.set(it.id, it); }));
  cart = store.get("cart:" + slug, {});
  Object.keys(cart).forEach(k => { if (!ITEMS.has(k.split("|")[0])) delete cart[k]; });
  applyTheme(); applyMeta(); render(); bind();
  window.__siteReady = true;
  if (deferredInstall || isIOS) showInstall();
  if (S.modules.assistant) setTimeout(() => { const tip = $("#fabTip"); if (tip && !$("#sheet").classList.contains("open")) { tip.hidden = false; setTimeout(() => tip.hidden = true, 6000); } }, 3500);
  setInterval(() => { const st = openStatus(), b = $(".brand small"); if (b) b.innerHTML = `<i class="dot${st.open ? " on" : ""}"></i>${esc(st.text)}`; }, 60000);
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
}
boot();
})();
