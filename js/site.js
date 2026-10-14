// Erasmus Pilot sitesi: kalkış panosu, canlı demo, sayaçlar, kaydırma efektleri ve sesler.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const S = window.SFX;

  // ---------- Ses düğmesi ----------
  const sndBtn = $("#snd");
  const paintSnd = () => sndBtn.setAttribute("aria-pressed", String(S.isOn()));
  paintSnd();
  sndBtn.addEventListener("click", () => { S.set(!S.isOn()); paintSnd(); if (S.isOn()) S.open(); toast(S.isOn() ? "Ses efektleri açık 🔊" : "Ses efektleri kapalı"); });
  addEventListener("pointerdown", () => S.init(), { once: true });
  addEventListener("keydown", () => S.init(), { once: true });

  // data-sfx: tıklamada ses
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-sfx]");
    if (el && S[el.dataset.sfx]) S[el.dataset.sfx]();
    else if (e.target.closest("a, button, summary")) S.click();
  });
  let lastHover = 0;
  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const el = e.target.closest(".btn, .step, .feat, .plan, .pain, .faq summary, .nav-links a");
    if (!el || el.contains(e.relatedTarget)) return;
    const now = performance.now();
    if (now - lastHover > 70) { S.hover(); lastHover = now; }
  });
  $$(".faq details").forEach((d) => d.addEventListener("toggle", () => (d.open ? S.open() : S.close())));

  // ---------- Toast ----------
  let toastT = 0;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("on"), 2000);
  }

  // ---------- Saat ----------
  const clock = $("#clock");
  const tickClock = () => { clock.textContent = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }); };
  tickClock();
  setInterval(tickClock, 10000);

  // ---------- Kalkış panosu ----------
  const CITIES = ["LİZBON", "PORTO", "SEVİLLA", "VALENSİYA", "FLORANSA", "BOLOGNA", "MÜNİH", "SALZBURG", "PRAG", "KRAKOV", "ATİNA", "SELANİK", "VALLETTA", "AMSTERDAM", "GENT", "TALLİNN", "LJUBLJANA", "BUDAPEŞTE", "DUBLİN", "NİS", "MADEİRA", "GİRİT", "TİROL", "TOSKANA"];
  const BIZ = ["BUTİK OTEL", "AGRİTURİZMO", "HOSTEL", "TUR ŞİRKETİ", "ŞARAP EVİ", "PANSİYON", "SÖRF KAMPI", "MÜZE", "EKO LODGE", "KREATİF AJANS", "DAĞ OTELİ", "SAHİL RESORT"];
  const STATUS = [["GÖNDERİLDİ", "sent", 5], ["KONTROL ✓", "check", 2], ["CEVAP GELDİ", "reply", 2], ["TEKLİF ✓", "offer", 1]];
  const pickStatus = () => { const bag = STATUS.flatMap((s) => Array(s[2]).fill(s)); return rnd(bag); };
  const board = $("#board");
  const ROWS = 7;
  let minute = 8 * 60 + 5;
  const nextTime = () => { minute = (minute + 3 + Math.floor(Math.random() * 9)) % (24 * 60); return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`; };

  function cellHtml(text, len, cls = "") {
    const t = text.padEnd(len, " ").slice(0, len);
    return `<span class="cell ${cls}">${[...t].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("")}</span>`;
  }
  function rowData() { const st = pickStatus(); return { time: nextTime(), city: rnd(CITIES), biz: rnd(BIZ), st }; }
  function renderRow(el, d, animate) {
    el.innerHTML = cellHtml(d.time, 5) + cellHtml(d.city, 10) + cellHtml(d.biz, 13, "biz") + `<span class="st ${d.st[1]}">${d.st[0]}</span>`;
    if (!animate) return;
    const chars = $$(".ch", el);
    chars.forEach((c, i) => {
      setTimeout(() => {
        c.classList.add("flip");
        if (i % 3 === 0 && boardVisible) S.flap();
      }, i * 28);
    });
  }
  for (let i = 0; i < ROWS; i++) {
    const r = document.createElement("div");
    r.className = "brow";
    renderRow(r, rowData(), false);
    board.appendChild(r);
  }
  let boardVisible = true;
  new IntersectionObserver((es) => es.forEach((e) => (boardVisible = e.isIntersecting))).observe(board);
  setInterval(() => {
    if (!boardVisible || document.hidden) return;
    // En üste yeni satır ekle, en alttakini at: kalkış panosu gibi akar.
    const r = document.createElement("div");
    r.className = "brow";
    board.prepend(r);
    renderRow(r, rowData(), true);
    while (board.children.length > ROWS) board.lastChild.remove();
  }, 2600);

  // ---------- Sayaçlar ----------
  const counted = new WeakSet();
  const counterIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting || counted.has(e.target)) return;
    counted.add(e.target);
    const el = e.target, to = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = pre + v.toLocaleString("tr-TR") + suf;
      if (k < 1) requestAnimationFrame(step); else S.tick();
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach((el) => counterIO.observe(el));

  // ---------- Kaydırınca beliren kartlar ----------
  const revealEls = $$(".pain, .step, .feat, .plan, .faq details, .proof-list li, .founder, .compare, .app, .ticket, .h2");
  revealEls.forEach((el) => el.classList.add("reveal"));
  const revIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const sibs = [...e.target.parentElement.children].filter((x) => x.classList.contains("reveal"));
    e.target.style.transitionDelay = `${Math.min(sibs.indexOf(e.target), 6) * 70}ms`;
    e.target.classList.add("in");
    revIO.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el) => revIO.observe(el));

  // ---------- Canlı demo ----------
  const PLACES = [["Casa do Rio", "Portekiz"], ["Hotel Seeblick", "Avusturya"], ["Agriturismo Le Querce", "İtalya"], ["Nomad Hostel", "İspanya"], ["Villa Aurora", "Yunanistan"], ["Quinta da Luz", "Portekiz"], ["Pension Alpenrose", "Almanya"], ["Surf House Atlântico", "Portekiz"], ["Bodega Los Olivos", "İspanya"], ["Penzion Lipa", "Çekya"], ["Hotel De Linde", "Hollanda"], ["Kalimera Studios", "Yunanistan"], ["Weingut Sonnhof", "Avusturya"], ["Eco Lodge Bohinj", "Slovenya"], ["Malta Dive Inn", "Malta"], ["Gasthof Adler", "Almanya"]];
  const REPLIES = [
    ["pos", "Olumlu", "We'd love to hear more. Can you send your dates?", "success"],
    ["auto", "Otomatik", "Thank you for your email. We are out of office…", "soft"],
    ["neg", "Red", "Unfortunately we have no staff housing this year.", "soft"],
    ["offer", "Teklif", "We can offer a private room, meals and an allowance.", "success"],
    ["pos", "Olumlu", "Interesting! Are you available from March?", "success"],
    ["auto", "Otomatik", "Automatische Antwort: Wir melden uns bald.", "soft"],
    ["neg", "Red", "Grazie, ma non prendiamo stagisti.", "soft"],
  ];
  const k = { sent: 0, reply: 0, pos: 0, block: 0 };
  let queue = 1240, demoOn = false, demoTimer = 0, tickN = 0;
  const outFeed = $("#outFeed"), inFeed = $("#inFeed"), badge = $("#badge");
  const setK = () => {
    $("#kSent").textContent = k.sent.toLocaleString("tr-TR");
    $("#kReply").textContent = k.reply;
    $("#kPos").textContent = k.pos;
    $("#kBlock").textContent = k.block;
    $("#queueInfo").textContent = `kuyruk: ${queue.toLocaleString("tr-TR")} hedef`;
  };
  function push(feed, html, max = 7) {
    const d = document.createElement("div");
    d.className = "fi";
    d.innerHTML = html;
    feed.prepend(d);
    while (feed.children.length > max) feed.lastChild.remove();
  }
  function demoStep() {
    tickN++;
    const [name, country] = rnd(PLACES);
    if (Math.random() < 0.13) {
      k.block++; queue--;
      push(outFeed, `<span class="ico">🛡️</span><span class="who"><b>${name}</b><small>Alan adı mail almıyor, gönderilmedi</small></span><span class="tag block">Engellendi</span>`);
      S.soft();
    } else {
      k.sent++; queue--;
      push(outFeed, `<span class="ico">✉️</span><span class="who"><b>${name}</b><small>${country} · kişisel mail + PDF</small></span><span class="tag sent">Gönderildi</span>`);
      S.whoosh();
    }
    if (tickN % 3 === 0) {
      const [cls, label, text, snd] = rnd(REPLIES);
      const [rn, rc] = rnd(PLACES);
      k.reply++;
      if (cls === "pos" || cls === "offer") k.pos++;
      setTimeout(() => {
        push(inFeed, `<span class="ico">${cls === "offer" ? "🎉" : cls === "pos" ? "💬" : cls === "neg" ? "🙁" : "🤖"}</span><span class="who"><b>${rn} · ${rc}</b><small>${text}</small></span><span class="tag ${cls}">${label}</span>`);
        badge.textContent = k.reply;
        badge.classList.add("bump");
        setTimeout(() => badge.classList.remove("bump"), 200);
        S[snd]();
      }, 500);
    }
    setK();
  }
  function startDemo() {
    if (demoOn) return;
    demoOn = true;
    $("#appStatus").innerHTML = '<span class="pulse"></span>Motor aktif · 2 hesap';
    demoStep();
    demoTimer = setInterval(demoStep, 1300);
  }
  function stopDemo() { demoOn = false; clearInterval(demoTimer); $("#appStatus").innerHTML = '<span class="pulse"></span>Duraklatıldı'; }
  new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? startDemo() : stopDemo())), { threshold: 0.35 }).observe($("#app"));
  setK();

  // ---------- Uygulama ekranları ----------
  const CAPS = {
    "app-panel": "Motoru tek tuşla başlat; bugün kaç mail gittiğini, gelen fırsatları ve hesaplarının durumunu tek ekranda gör.",
    "app-gmail": "Gmail'i bağlamak için ekran ekran rehber: iki adımlı doğrulama, uygulama şifresi, tek tıkla bağlantı testi.",
    "app-preview": "İşletmeye gidecek maili önceden gör. Altı farklı metin döner; her biri işletmenin adıyla başlar.",
    "app-replies": "Cevaplar kendiliğinden ayrılır: teklif, olumlu, red, otomatik. Tek tıkla Gmail'de aç ve cevapla.",
  };
  $$(".shot-tabs button").forEach((b) => b.addEventListener("click", () => {
    $$(".shot-tabs button").forEach((x) => x.classList.toggle("on", x === b));
    const img = $("#shotImg");
    img.classList.add("fade");
    setTimeout(() => {
      img.onload = () => img.classList.remove("fade");
      img.src = `assets/app/${b.dataset.shot}.webp`;
      setTimeout(() => img.classList.remove("fade"), 900); // önbellekten gelirse onload kaçabilir
    }, 180);
    $("#shotCap").textContent = CAPS[b.dataset.shot];
    S.tick();
  }));

  // ---------- Nav: kaydırınca koyulaş ----------
  const nav = $("#nav");
  addEventListener("scroll", () => { nav.style.background = scrollY > 40 ? "rgba(12,18,34,.9)" : ""; }, { passive: true });
})();
