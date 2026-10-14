// Erasmus Pilot ses efektleri: hepsi WebAudio ile anında üretilir (ses dosyası yok, sayfa hafif kalır).
// Tarayıcılar sesi ancak kullanıcı bir yere tıkladıktan sonra çalar; ilk tıklamada ses açılır.
(function () {
  let ctx = null, master = null;
  let on = true;
  try { on = localStorage.getItem("ep-sound") !== "0"; } catch (_) {}

  function init() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = on ? 0.55 : 0;
    master.connect(ctx.destination);
  }

  function tone(freq, t0, dur, { type = "sine", vol = 0.15, slide = 0, attack = 0.005 } = {}) {
    if (!ctx || !on) return;
    const t = ctx.currentTime + t0, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.03);
  }

  function noise(t0, dur, { vol = 0.08, freq = 2000, q = 1, type = "bandpass" } = {}) {
    if (!ctx || !on) return;
    const t = ctx.currentTime + t0, n = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
    s.connect(f).connect(g).connect(master); s.start(t);
  }

  const N = (m) => 440 * Math.pow(2, (m - 69) / 12);

  window.SFX = {
    init,
    isOn: () => on,
    set(v) {
      on = v;
      try { localStorage.setItem("ep-sound", v ? "1" : "0"); } catch (_) {}
      init();
      if (master) master.gain.setTargetAtTime(v ? 0.55 : 0, ctx.currentTime, 0.05);
    },
    // Havalimanı anons gongu (CTA)
    chime() { [76, 72, 67].forEach((m, i) => { tone(N(m), i * 0.22, 1.1, { vol: 0.12, attack: 0.01 }); tone(N(m + 12), i * 0.22, 0.6, { vol: 0.03 }); }); },
    tick() { tone(N(96), 0, 0.035, { type: "triangle", vol: 0.05 }); },
    hover() { tone(N(100), 0, 0.025, { type: "triangle", vol: 0.025 }); },
    click() { noise(0, 0.03, { vol: 0.12, freq: 3500 }); tone(N(84), 0, 0.05, { type: "square", vol: 0.04 }); },
    // Pano harfi dönerken "tak"
    flap() { noise(0, 0.018, { vol: 0.07, freq: 2600 + Math.random() * 900, q: 4 }); },
    // Mail gönderildi: hızlı whoosh
    whoosh() { noise(0, 0.32, { vol: 0.09, freq: 900, q: 0.7, type: "lowpass" }); tone(380, 0, 0.3, { vol: 0.04, slide: 500 }); },
    // Cevap geldi
    pop() { tone(N(84), 0, 0.09, { vol: 0.12 }); tone(N(91), 0.07, 0.14, { vol: 0.1 }); },
    // Olumlu cevap / teklif
    success() { [72, 76, 79, 84].forEach((m, i) => tone(N(m), i * 0.08, 0.22, { type: "triangle", vol: 0.1 })); },
    soft() { tone(N(64), 0, 0.12, { vol: 0.05 }); },
    open() { tone(N(79), 0, 0.08, { vol: 0.07 }); tone(N(86), 0.05, 0.1, { vol: 0.06 }); },
    close() { tone(N(86), 0, 0.08, { vol: 0.06 }); tone(N(79), 0.05, 0.1, { vol: 0.05 }); },
  };
})();
