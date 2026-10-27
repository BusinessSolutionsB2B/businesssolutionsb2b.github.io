// Globo 3D con países reales y rutas de pago animadas desde Bolivia
(() => {
  const canvas = document.getElementById("globe");
  if (!canvas || !window.d3 || !window.topojson) return;
  const ctx = canvas.getContext("2d");

  const ORIGIN = [-66.16, -17.39]; // Cochabamba
  const ROUTES = [
    { to: [114.06, 22.54], color: "#3ee08a" }, // Shenzhen, China (SWIFT confirmado)
    { to: [9.99, 53.55], color: "#e0a070" },   // Hamburgo, Alemania
    { to: [-80.19, 25.76], color: "#7fd3ff" }, // Miami, EE.UU.
    { to: [139.69, 35.68], color: "#7fd3ff" }, // Tokio, Japón
    { to: [-46.63, -23.55], color: "#7fd3ff" } // São Paulo, Brasil
  ].map((r, i) => ({ ...r, interp: d3.geoInterpolate(ORIGIN, r.to), offset: i * 0.22 }));

  const projection = d3.geoOrthographic().clipAngle(90).precision(0.4);
  const path = d3.geoPath(projection, ctx);
  const graticule = d3.geoGraticule10();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let size = 0, radius = 0, land, borders, bolivia;
  let rotation = [40, 8, 0];
  let dragging = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = size / 2 * 0.8;
    projection.translate([size / 2, size / 2]).scale(radius);
  }

  const visible = p => d3.geoDistance(p, [-rotation[0], -rotation[1]]) < Math.PI / 2 - 0.02;

  function draw(time) {
    const cx = size / 2, cy = size / 2;
    ctx.clearRect(0, 0, size, size);
    projection.rotate(rotation);

    // Halo exterior
    const halo = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.22);
    halo.addColorStop(0, "rgba(70,150,255,.35)");
    halo.addColorStop(1, "rgba(70,150,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, radius * 1.22, 0, 2 * Math.PI); ctx.fill();

    // Océano
    const ocean = ctx.createRadialGradient(cx - radius * .35, cy - radius * .4, radius * .1, cx, cy, radius);
    ocean.addColorStop(0, "#173a7a");
    ocean.addColorStop(1, "#060d1f");
    ctx.fillStyle = ocean;
    ctx.beginPath(); path({ type: "Sphere" }); ctx.fill();

    // Cuadrícula
    ctx.beginPath(); path(graticule);
    ctx.strokeStyle = "rgba(120,180,255,.10)"; ctx.lineWidth = .6; ctx.stroke();

    if (land) {
      // Continentes
      ctx.beginPath(); path(land);
      ctx.fillStyle = "rgba(60,130,240,.30)"; ctx.fill();
      // Fronteras de países
      ctx.beginPath(); path(borders);
      ctx.strokeStyle = "rgba(140,210,255,.55)"; ctx.lineWidth = .6; ctx.stroke();
      // Costas con brillo
      ctx.save();
      ctx.shadowColor = "#5fc8ff"; ctx.shadowBlur = 6;
      ctx.beginPath(); path(land);
      ctx.strokeStyle = "rgba(150,220,255,.9)"; ctx.lineWidth = .9; ctx.stroke();
      ctx.restore();
      // Bolivia resaltada
      ctx.save();
      ctx.shadowColor = "#e0a070"; ctx.shadowBlur = 14;
      ctx.beginPath(); path(bolivia);
      ctx.fillStyle = "rgba(224,160,112,.85)"; ctx.fill();
      ctx.strokeStyle = "#ffd2ad"; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }

    // Rutas de pago
    const t = time / 4200;
    ROUTES.forEach(r => {
      ctx.beginPath();
      path({ type: "LineString", coordinates: d3.range(0, 1.001, .02).map(r.interp) });
      ctx.strokeStyle = r.color + "40"; ctx.lineWidth = 1.2; ctx.stroke();

      const p = ((t + r.offset) % 1) * 1.25;
      const head = Math.min(p, 1), tail = Math.max(0, p - .3);
      if (tail < 1) {
        ctx.save();
        ctx.shadowColor = r.color; ctx.shadowBlur = 10;
        ctx.beginPath();
        path({ type: "LineString", coordinates: d3.range(tail, head + .001, .01).map(r.interp) });
        ctx.strokeStyle = r.color; ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.stroke();
        ctx.restore();
      }
      if (visible(r.to)) {
        const [x, y] = projection(r.to);
        const pulse = (time / 900 + r.offset * 5) % 1;
        ctx.beginPath(); ctx.arc(x, y, 3 + pulse * 9, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(255,255,255,${.6 * (1 - pulse)})`; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = r.color; ctx.fill();
      }
    });

    // Punto de origen (Bolivia)
    if (visible(ORIGIN)) {
      const [x, y] = projection(ORIGIN);
      const pulse = (time / 1200) % 1;
      ctx.beginPath(); ctx.arc(x, y, 4 + pulse * 14, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(255,200,150,${.8 * (1 - pulse)})`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff"; ctx.fill();
    }

    // Borde atmosférico
    ctx.save();
    ctx.shadowColor = "#5fc8ff"; ctx.shadowBlur = 18;
    ctx.beginPath(); path({ type: "Sphere" });
    ctx.strokeStyle = "rgba(120,210,255,.7)"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();

    // Brillo de luz
    const shine = ctx.createRadialGradient(cx - radius * .45, cy - radius * .5, 0, cx - radius * .45, cy - radius * .5, radius * .9);
    shine.addColorStop(0, "rgba(255,255,255,.10)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.beginPath(); path({ type: "Sphere" }); ctx.fill();
  }

  let last = performance.now();
  function frame(now) {
    const dt = now - last; last = now;
    if (!dragging && !reduced) rotation[0] -= dt * 0.006;
    draw(now);
    requestAnimationFrame(frame);
  }

  // Arrastrar para girar
  canvas.addEventListener("pointerdown", e => {
    dragging = { x: e.clientX, y: e.clientY, r: rotation.slice() };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", e => {
    if (!dragging) return;
    const k = 180 / (Math.PI * radius);
    rotation[0] = dragging.r[0] + (e.clientX - dragging.x) * k;
    rotation[1] = Math.max(-60, Math.min(60, dragging.r[1] - (e.clientY - dragging.y) * k));
  });
  const stop = () => { dragging = null; };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);

  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json")
    .then(r => r.json())
    .then(world => {
      const countries = world.objects.countries;
      land = topojson.feature(world, world.objects.land);
      borders = topojson.mesh(world, countries, (a, b) => a !== b);
      bolivia = topojson.feature(world, countries).features.find(f => f.id === "068");
    });
})();
