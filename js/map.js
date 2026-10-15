// Avrupa nokta haritası + Türkiye'den uçan mail ışık izleri (canvas, kütüphanesiz).
(function () {
  // [ad, enlem, boylam, ülke]
  const CITIES = [
    ["Lizbon", 38.72, -9.14, "PT"], ["Porto", 41.15, -8.61, "PT"], ["Faro", 37.02, -7.93, "PT"], ["Coimbra", 40.2, -8.42, "PT"],
    ["Sevilla", 37.39, -5.98, "ES"], ["Granada", 37.18, -3.6, "ES"], ["Málaga", 36.72, -4.42, "ES"], ["Madrid", 40.42, -3.7, "ES"], ["Valensiya", 39.47, -0.38, "ES"],
    ["Barselona", 41.39, 2.17, "ES"], ["Bilbao", 43.26, -2.93, "ES"], ["Santiago", 42.88, -8.54, "ES"], ["Palma", 39.57, 2.65, "ES"], ["İbiza", 38.91, 1.43, "ES"], ["Salamanca", 40.97, -5.66, "ES"], ["Zaragoza", 41.65, -0.89, "ES"],
    ["Paris", 48.86, 2.35, "FR"], ["Lyon", 45.76, 4.84, "FR"], ["Marsilya", 43.3, 5.37, "FR"], ["Nis", 43.7, 7.27, "FR"], ["Bordeaux", 44.84, -0.58, "FR"], ["Toulouse", 43.6, 1.44, "FR"],
    ["Nantes", 47.22, -1.55, "FR"], ["Strazburg", 48.58, 7.75, "FR"], ["Lille", 50.63, 3.06, "FR"], ["Montpellier", 43.61, 3.88, "FR"], ["Annecy", 45.9, 6.13, "FR"], ["Rennes", 48.11, -1.68, "FR"], ["Biarritz", 43.48, -1.56, "FR"], ["Ajaccio", 41.93, 8.74, "FR"],
    ["Roma", 41.9, 12.5, "IT"], ["Milano", 45.46, 9.19, "IT"], ["Venedik", 45.44, 12.33, "IT"], ["Floransa", 43.77, 11.26, "IT"], ["Napoli", 40.85, 14.27, "IT"], ["Bologna", 44.49, 11.34, "IT"], ["Torino", 45.07, 7.69, "IT"],
    ["Palermo", 38.12, 13.36, "IT"], ["Catania", 37.5, 15.09, "IT"], ["Bari", 41.12, 16.87, "IT"], ["Verona", 45.44, 10.99, "IT"], ["Siena", 43.32, 11.33, "IT"], ["Cagliari", 39.22, 9.12, "IT"], ["Bolzano", 46.5, 11.35, "IT"], ["Cenova", 44.41, 8.93, "IT"], ["Lecce", 40.35, 18.17, "IT"],
    ["Berlin", 52.52, 13.4, "DE"], ["Münih", 48.14, 11.58, "DE"], ["Hamburg", 53.55, 9.99, "DE"], ["Köln", 50.94, 6.96, "DE"], ["Frankfurt", 50.11, 8.68, "DE"], ["Dresden", 51.05, 13.74, "DE"], ["Stuttgart", 48.78, 9.18, "DE"],
    ["Leipzig", 51.34, 12.37, "DE"], ["Freiburg", 47.99, 7.85, "DE"], ["Nürnberg", 49.45, 11.08, "DE"], ["Rostock", 54.09, 12.1, "DE"], ["Hannover", 52.37, 9.73, "DE"], ["Garmisch", 47.49, 11.1, "DE"],
    ["Viyana", 48.21, 16.37, "AT"], ["Salzburg", 47.81, 13.04, "AT"], ["Innsbruck", 47.27, 11.4, "AT"], ["Graz", 47.07, 15.44, "AT"], ["Zell am See", 47.32, 12.8, "AT"],
    ["Amsterdam", 52.37, 4.9, "NL"], ["Rotterdam", 51.92, 4.48, "NL"], ["Utrecht", 52.09, 5.12, "NL"], ["Maastricht", 50.85, 5.69, "NL"], ["Brüksel", 50.85, 4.35, "BE"], ["Gent", 51.05, 3.72, "BE"], ["Brugge", 51.21, 3.22, "BE"], ["Anvers", 51.22, 4.4, "BE"], ["Lüksemburg", 49.61, 6.13, "LU"],
    ["Dublin", 53.35, -6.26, "IE"], ["Galway", 53.27, -9.05, "IE"], ["Cork", 51.9, -8.47, "IE"],
    ["Kopenhag", 55.68, 12.57, "DK"], ["Aarhus", 56.16, 10.2, "DK"], ["Oslo", 59.91, 10.75, "NO"], ["Bergen", 60.39, 5.32, "NO"], ["Trondheim", 63.43, 10.39, "NO"], ["Stockholm", 59.33, 18.07, "SE"], ["Göteborg", 57.71, 11.97, "SE"], ["Malmö", 55.6, 13.0, "SE"],
    ["Helsinki", 60.17, 24.94, "FI"], ["Turku", 60.45, 22.27, "FI"], ["Tallinn", 59.44, 24.75, "EE"], ["Riga", 56.95, 24.11, "LV"], ["Vilnius", 54.69, 25.28, "LT"], ["Kaunas", 54.9, 23.9, "LT"],
    ["Varşova", 52.23, 21.01, "PL"], ["Krakov", 50.06, 19.94, "PL"], ["Gdańsk", 54.35, 18.65, "PL"], ["Wrocław", 51.11, 17.03, "PL"], ["Poznań", 52.41, 16.93, "PL"], ["Zakopane", 49.3, 19.95, "PL"], ["Lublin", 51.25, 22.57, "PL"],
    ["Prag", 50.08, 14.44, "CZ"], ["Brno", 49.2, 16.61, "CZ"], ["Český Krumlov", 48.81, 14.32, "CZ"], ["Bratislava", 48.15, 17.11, "SK"], ["Košice", 48.72, 21.26, "SK"],
    ["Budapeşte", 47.5, 19.04, "HU"], ["Debrecen", 47.53, 21.63, "HU"], ["Pécs", 46.07, 18.23, "HU"], ["Ljubljana", 46.06, 14.51, "SI"], ["Bled", 46.37, 14.11, "SI"],
    ["Atina", 37.98, 23.73, "GR"], ["Selanik", 40.64, 22.94, "GR"], ["Kandiye", 35.34, 25.13, "GR"], ["Hanya", 35.51, 24.02, "GR"], ["Rodos", 36.43, 28.22, "GR"], ["Santorini", 36.39, 25.46, "GR"], ["Korfu", 39.62, 19.92, "GR"], ["Kalamata", 37.04, 22.11, "GR"],
    ["Sofya", 42.7, 23.32, "BG"], ["Varna", 43.21, 27.91, "BG"], ["Plovdiv", 42.14, 24.75, "BG"], ["Valletta", 35.9, 14.51, "MT"],
  ];
  const ORIGIN = ["Kapadokya", 38.62, 34.71];
  // Yalnızca kara izlenimi için (hedef değil): Anadolu
  const LAND_EXTRA = [[41.01, 28.98], [39.93, 32.85], [38.42, 27.14], [36.9, 30.7], [37.87, 32.48], [38.72, 35.48], [40.18, 29.06], [37.0, 35.32], [39.75, 30.52], [41.2, 36.3], [39.9, 36.5], [37.77, 29.09]];
  const B = { lonMin: -11.5, lonMax: 41, latMin: 33.5, latMax: 64.5 };
  const K = 0.64; // enlem sıkıştırma (Mercator benzeri görünüm)

  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }

  class EuropeMap {
    constructor(canvas, opts = {}) {
      this.c = canvas;
      this.g = canvas.getContext("2d");
      this.opts = Object.assign({ rate: 6, returns: 0.14, glow: true, onArrive: null, onReturn: null }, opts);
      this.flights = [];
      this.rings = [];
      this.highlight = null; // ülke kodları kümesi
      this.running = false;
      this.alpha = 1;
      this._resize = this.resize.bind(this);
      addEventListener("resize", this._resize);
      this.resize();
      // Kara izlenimi için şehir çevresine dağılmış noktalar (sabit tohum: her yüklemede aynı)
      const r = rng(11);
      this.land = [];
      [...CITIES.map((c) => [c[0], c[1], c[2]]), ...LAND_EXTRA.map(([a, b]) => ["", a, b])].forEach(([, lat, lon]) => {
        for (let i = 0; i < 26; i++) {
          const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 1.9;
          this.land.push([lat + Math.sin(a) * d * K * 0.9, lon + Math.cos(a) * d]);
        }
      });
    }
    resize() {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = this.c.clientWidth, h = this.c.clientHeight;
      this.w = w; this.h = h;
      this.c.width = w * dpr; this.c.height = h * dpr;
      this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const spanX = (B.lonMax - B.lonMin) * K, spanY = B.latMax - B.latMin;
      this.scale = Math.min(w / spanX, h / spanY) * 0.98;
      this.ox = (w - spanX * this.scale) / 2;
      this.oy = (h - spanY * this.scale) / 2;
    }
    p(lat, lon) { return [this.ox + (lon - B.lonMin) * K * this.scale, this.oy + (B.latMax - lat) * this.scale]; }
    launch(city, back = false) {
      const [x0, y0] = this.p(ORIGIN[1], ORIGIN[2]);
      const [x1, y1] = this.p(city[1], city[2]);
      const dist = Math.hypot(x1 - x0, y1 - y0);
      const f = { from: back ? [x1, y1] : [x0, y0], to: back ? [x0, y0] : [x1, y1], t: 0, speed: 0.55 + Math.random() * 0.35, lift: dist * 0.28, back, city };
      this.flights.push(f);
      return f;
    }
    start() { if (this.running) return; this.running = true; this.last = performance.now(); this.acc = 0; requestAnimationFrame((t) => this.frame(t)); }
    stop() { this.running = false; }
    frame(t) {
      if (!this.running) return;
      const dt = Math.min(0.05, (t - this.last) / 1000);
      this.last = t;
      this.acc += dt * this.opts.rate;
      while (this.acc > 1) {
        this.acc -= 1;
        const pool = this.highlight ? CITIES.filter((c) => this.highlight.has(c[3])) : CITIES;
        this.launch(pool[(Math.random() * pool.length) | 0]);
      }
      this.draw(dt);
      requestAnimationFrame((n) => this.frame(n));
    }
    bez(f, t) {
      const [x0, y0] = f.from, [x1, y1] = f.to;
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - f.lift;
      const u = 1 - t;
      return [u * u * x0 + 2 * u * t * mx + t * t * x1, u * u * y0 + 2 * u * t * my + t * t * y1];
    }
    draw(dt = 0) {
      const g = this.g;
      g.clearRect(0, 0, this.w, this.h);
      g.globalAlpha = this.alpha;
      // kara noktaları
      g.fillStyle = "rgba(160, 180, 255, 0.24)";
      for (const [lat, lon] of this.land) { const [x, y] = this.p(lat, lon); g.fillRect(x, y, 1.6, 1.6); }
      // şehirler
      for (const c of CITIES) {
        const [x, y] = this.p(c[1], c[2]);
        const on = this.highlight && this.highlight.has(c[3]);
        g.fillStyle = on ? "rgba(255, 210, 63, 0.95)" : "rgba(210, 222, 255, 0.7)";
        g.beginPath(); g.arc(x, y, on ? 2.4 : 1.7, 0, 7); g.fill();
      }
      // çıkış noktası
      const [ox, oy] = this.p(ORIGIN[1], ORIGIN[2]);
      const pulse = (performance.now() / 1000) % 1.6 / 1.6;
      g.strokeStyle = `rgba(255, 122, 69, ${0.6 * (1 - pulse)})`; g.lineWidth = 2;
      g.beginPath(); g.arc(ox, oy, 6 + pulse * 22, 0, 7); g.stroke();
      g.fillStyle = "#ff7a45"; g.beginPath(); g.arc(ox, oy, 5, 0, 7); g.fill();
      // uçuşlar
      const keep = [];
      for (const f of this.flights) {
        f.t += dt * f.speed;
        const head = Math.min(1, f.t), tail = Math.max(0, f.t - 0.35);
        const col = f.back ? [47, 209, 139] : [255, 196, 90];
        g.lineCap = "round";
        const steps = 22;
        for (let i = 0; i < steps; i++) {
          const a = tail + (head - tail) * (i / steps), b = tail + (head - tail) * ((i + 1) / steps);
          const [xa, ya] = this.bez(f, a), [xb, yb] = this.bez(f, b);
          const k = (i + 1) / steps;
          g.strokeStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.85 * k * (f.t > 1 ? Math.max(0, 1.35 - f.t) / 0.35 : 1)})`;
          g.lineWidth = 0.6 + 1.6 * k;
          g.beginPath(); g.moveTo(xa, ya); g.lineTo(xb, yb); g.stroke();
        }
        if (f.t <= 1) {
          const [hx, hy] = this.bez(f, head);
          if (this.opts.glow) { g.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0.25)`; g.beginPath(); g.arc(hx, hy, 6, 0, 7); g.fill(); }
          g.fillStyle = `rgb(${col[0]}, ${col[1]}, ${col[2]})`; g.beginPath(); g.arc(hx, hy, 2.2, 0, 7); g.fill();
        }
        if (f.t >= 1 && !f.arrived) {
          f.arrived = true;
          this.rings.push({ x: f.to[0], y: f.to[1], t: 0, back: f.back });
          if (!f.back) {
            this.opts.onArrive && this.opts.onArrive(f.city);
            if (Math.random() < this.opts.returns) setTimeout(() => { const r = this.launch(f.city, true); r.speed *= 0.8; }, 500 + Math.random() * 900);
          } else this.opts.onReturn && this.opts.onReturn(f.city);
        }
        if (f.t < 1.35) keep.push(f);
      }
      this.flights = keep;
      this.rings = this.rings.filter((r) => (r.t += dt * 1.4) < 1);
      for (const r of this.rings) {
        g.strokeStyle = r.back ? `rgba(47, 209, 139, ${1 - r.t})` : `rgba(255, 210, 63, ${0.8 * (1 - r.t)})`;
        g.lineWidth = 1.5;
        g.beginPath(); g.arc(r.x, r.y, 3 + r.t * (r.back ? 26 : 14), 0, 7); g.stroke();
      }
      g.globalAlpha = 1;
    }
  }
  window.EuropeMap = EuropeMap;
  window.EP_CITIES = CITIES;
})();
