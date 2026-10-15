// Erasmus Pilot sitesi: kaydırma sahneleri (GSAP + Lenis), canlı harita, canlı rakamlar, hesaplayıcı, ses.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const S = window.SFX;
  const fmt = (n) => Math.round(n).toLocaleString("tr-TR");
  const { gsap, ScrollTrigger, Lenis } = window;
  const hasGsap = !!(gsap && ScrollTrigger);

  // ---------- Ses ----------
  const snd = $("#snd");
  const paint = () => snd.setAttribute("aria-pressed", String(S.isOn()));
  paint();
  snd.addEventListener("click", () => { S.set(!S.isOn()); paint(); if (S.isOn()) S.chime(); toast(S.isOn() ? "Ses efektleri açık 🔊" : "Ses efektleri kapalı"); });
  addEventListener("pointerdown", () => S.init(), { once: true });
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-sfx]");
    if (el && S[el.dataset.sfx]) S[el.dataset.sfx]();
    else if (e.target.closest("a, button, summary")) S.click();
  });
  let lastHover = 0;
  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const el = e.target.closest(".btn, .b, .plan, .faq summary, .show-list li, .seg button");
    if (!el || el.contains(e.relatedTarget)) return;
    if (performance.now() - lastHover > 70) { S.hover(); lastHover = performance.now(); }
  });
  $$(".faq details").forEach((d) => d.addEventListener("toggle", () => (d.open ? S.open() : S.close())));
  let toastT;
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2000); }

  // ---------- Bento ışık takibi ----------
  $$(".b").forEach((b) => b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.setProperty("--mx", `${e.clientX - r.left}px`);
    b.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  // ---------- Canlı rakamlar ----------
  const RATES = { small: [0.063, 0.0121], mix: [0.05, 0.008], hotel: [0.018, 0.0022] };
  let stats = null;
  fetch("data/stats.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (!d) return;
    stats = d;
    $$("[data-stat]").forEach((el) => { if (d[el.dataset.stat] != null) el.dataset.to = d[el.dataset.stat]; });
    $("#liveEmails").textContent = fmt(d.emails);
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const since = d.since ? new Date(d.since) : null, upd = d.updated ? new Date(d.updated) : null;
    $("#numNote").textContent = `${since ? `${months[since.getMonth()]} ${since.getFullYear()}'dan bu yana` : ""}${upd ? ` · son güncelleme ${upd.getDate()} ${months[upd.getMonth()]}` : ""}`;
    if (d.reply_rate) RATES.mix = [d.reply_rate, d.positive_rate];
    calc();
  }).catch(() => {});
  $$("[data-stat]").forEach((el) => (el.dataset.to = el.textContent.replace(/\./g, "")));
  function countUp(el) {
    const to = +el.dataset.to || 0, t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 1800); el.textContent = fmt(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  // ---------- Hesaplayıcı ----------
  let cType = "small";
  function calc() {
    const acc = +$("#cAcc").value, weeks = +$("#cWeek").value;
    $("#cAccV").textContent = acc;
    $("#cWeekV").textContent = `${weeks} hafta`;
    const sent = acc * 60 * 7 * weeks;
    const [rr, pr] = RATES[cType];
    const rep = sent * rr, pos = sent * pr;
    $("#rSent").textContent = fmt(sent);
    $("#rRep").textContent = "~" + fmt(rep);
    $("#rPos").textContent = "~" + fmt(Math.max(1, pos));
    $("#rBar").style.width = Math.min(100, (pos / 120) * 100) + "%";
    const typeTxt = { small: "pansiyon/B&B", mix: "karışık", hotel: "büyük otel" }[cType];
    const msg = `Merhaba, Erasmus Pilot hakkında bilgi almak istiyorum. Planım: ${acc} Gmail hesabı, ${weeks} hafta, hedef: ${typeTxt}.`;
    $("#calcCta").href = "https://wa.me/905317114577?text=" + encodeURIComponent(msg);
  }
  $$("#cType button").forEach((b) => b.addEventListener("click", () => { cType = b.dataset.v; $$("#cType button").forEach((x) => x.classList.toggle("on", x === b)); calc(); }));
  ["#cAcc", "#cWeek"].forEach((id) => $(id).addEventListener("input", () => { calc(); S.tick(); }));
  calc();

  // ---------- Kalkış sayacı ----------
  const days = Math.max(0, Math.ceil((new Date("2027-02-01T00:00:00") - new Date()) / 86400000));
  $("#cdDays").textContent = days;

  // ---------- Haritalar ----------
  const arrivals = $("#arrivals");
  let arrN = 0;
  function arrival(city, back) {
    if (++arrN % (back ? 1 : 3)) return; // her varışı yazma, akış sakin kalsın
    const d = document.createElement("div");
    d.className = "arr-i" + (back ? " back" : "");
    d.innerHTML = back ? `<span class="ok">✓</span> ${city[0]} · cevap geldi` : `<span class="ok">✈</span> ${city[0]} · mail ulaştı`;
    arrivals.prepend(d);
    while (arrivals.children.length > 4) arrivals.lastChild.remove();
    if (back && S.isOn()) S.pop();
  }
  const heroMap = new window.EuropeMap($("#heroMap"), { rate: 4.5, returns: 0.16, onArrive: (c) => arrival(c, false), onReturn: (c) => arrival(c, true) });
  const jMap = new window.EuropeMap($("#jMap"), { rate: 2, returns: 0.2 });
  const finalMap = new window.EuropeMap($("#finalMap"), { rate: 3, returns: 0.1, glow: false });
  const watch = (el, map) => new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? map.start() : map.stop())), { rootMargin: "100px" }).observe(el);
  window.EP_MAPS = { heroMap, jMap, finalMap };
  watch($("#heroMap"), heroMap);
  watch($(".j-stage"), jMap);
  watch($("#finalMap"), finalMap);
  addEventListener("resize", () => { heroMap.resize(); jMap.resize(); finalMap.resize(); });

  // ---------- Yolculuk sahnesi ----------
  const MAIL = "Quinta do Vale looks like exactly the kind of rural guesthouse we were hoping to find for our traineeship. We are Ayşe and Mehmet, a couple from Türkiye, looking for a six-month Erasmus+ traineeship from March 2027…";
  let typing = 0, typed = false;
  function typeMail() {
    if (typed) return;
    typed = true;
    const el = $("#jmBody");
    let i = 0;
    clearInterval(typing);
    typing = setInterval(() => {
      i += 2;
      el.innerHTML = MAIL.slice(0, i).replace(/&/g, "&amp;").replace(/</g, "&lt;") + '<span class="caret"></span>';
      if (i % 8 === 0) S.tick();
      if (i >= MAIL.length) clearInterval(typing);
    }, 22);
  }
  let jStep = -1;
  function setStep(i) {
    if (i === jStep) return;
    jStep = i;
    $$(".j-step").forEach((s, k) => s.classList.toggle("on", k === i));
    $("#jMail").classList.toggle("on", i === 1);
    $("#jInbox").classList.toggle("on", i === 3);
    $("#jMap").style.opacity = i === 0 || i === 2 ? 1 : 0.18;
    if (i === 0) { jMap.highlight = new Set(["PT", "ES", "IT", "GR"]); jMap.opts.rate = 2; }
    if (i === 2) { jMap.highlight = null; jMap.opts.rate = 9; S.whoosh(); }
    if (i === 1) typeMail();
    if (i === 3) S.success();
    if (i !== 1) typed = false;
    S.tick();
  }
  setStep(0);

  // ---------- Vitrin ----------
  let sIdx = -1;
  function setShot(i) {
    if (i === sIdx) return;
    sIdx = i;
    $$(".shot").forEach((s, k) => { s.classList.toggle("on", k === i); s.classList.toggle("past", k < i); });
    $$(".show-list li").forEach((li, k) => li.classList.toggle("on", k === i));
    S.tick();
  }
  setShot(0);

  // ---------- Kaydırma (GSAP) ----------
  if (!hasGsap) {
    $$("[data-stat]").forEach(countUp);
    $$(".show-list li").forEach((li) => li.addEventListener("click", () => setShot(+li.dataset.i)));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const t = id === "#top" ? 0 : $(id);
    if (t === null || !lenis) return;
    e.preventDefault();
    lenis.scrollTo(t, { duration: 1.6, offset: id === "#top" ? 0 : -10 });
  }));

  // Hero girişi
  gsap.from(".hero-h .w", { yPercent: 110, duration: 1.2, ease: "power4.out", stagger: 0.12, delay: 0.15 });
  gsap.from(".live-chip, .hero-sub, .hero .cta-row, .arrivals", { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.5 });
  gsap.from(".nav", { y: -30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3 });
  gsap.from("#heroMap", { opacity: 0, scale: 0.92, duration: 2, ease: "power3.out" });
  gsap.to(".hero-in", { y: -80, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // 3D ekran düzleşir
  const mm = gsap.matchMedia();
  mm.add("(min-width: 641px)", () => {
    gsap.fromTo("#tilt", { rotateX: 32, scale: 0.88 }, { rotateX: 0, scale: 1, ease: "none", scrollTrigger: { trigger: ".tilt-sec", start: "top 95%", end: "top 15%", scrub: true } });
  });

  // Rakamlar sayar
  ScrollTrigger.create({ trigger: ".numbers", start: "top 75%", once: true, onEnter: () => { $$("[data-stat]").forEach(countUp); S.tick(); } });

  // Yolculuk: sabitlenir, 4 adım kaydırmayla ilerler
  ScrollTrigger.create({
    trigger: ".journey", start: "top top", end: "+=260%", pin: ".journey-pin", scrub: true,
    onUpdate: (s) => { setStep(Math.min(3, Math.floor(s.progress * 4))); $("#jBar").style.width = s.progress * 100 + "%"; },
  });

  // Vitrin: sabitlenir, ekranlar sırayla değişir
  const showST = ScrollTrigger.create({
    trigger: ".show", start: "top top", end: "+=200%", pin: ".show-pin", scrub: true,
    onUpdate: (s) => setShot(Math.min(3, Math.floor(s.progress * 4))),
  });
  $$(".show-list li").forEach((li) => li.addEventListener("click", () => {
    const i = +li.dataset.i, y = showST.start + ((i + 0.5) / 4) * (showST.end - showST.start);
    lenis ? lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y, behavior: "smooth" });
  }));

  // Bölüm girişleri
  $$(".bento .b, .plan, .faq details, .proof-list li, .founders figure, .calc-card, .countdown, .num").forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  $$(".bento-sec .h2, .calc-sec .h2, .proof-sec .h2, .plans-sec .h2, .faq-sec .h2, .final-h").forEach((el) => {
    gsap.from(el, { y: 70, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // Nav koyulaşır
  ScrollTrigger.create({ start: 80, onToggle: (s) => ($("#nav").style.background = s.isActive ? "rgba(10, 14, 26, .82)" : "") });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
