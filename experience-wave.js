// experience-wave.js
(() => {
  const wrap = document.getElementById("expWaveWrap");
  const canvas = document.getElementById("expWave");
  const ctx = canvas.getContext("2d");
  const nodeLayer = document.getElementById("expNodeLayer");
  const items = Array.from(document.querySelectorAll(".exp-item"));

  if (!wrap || !canvas || !ctx) return;

  // canvas size
  let w = 0;
  let h = 0;

  // wave config
  const lineCount = 14;
  const baseAmplitude = 26;
  const falloff = 0.015;
  const waveFreq = 0.055;
  const speed = 0.8;

  // mouse warp
  let mouse = { x: 0.5, y: 0.4 };
  let targetMouse = { x: 0.5, y: 0.4 };

  function resize() {
    const rect = wrap.getBoundingClientRect();
    w = rect.width;
    h = rect.height;

    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    positionNodes();
  }

  // create nodes + tick marks
  function positionNodes() {
    if (!nodeLayer) return;
    nodeLayer.innerHTML = "";

    const total = items.length;
    if (!total) return;

    items.forEach((item, idx) => {
      const ratio = (idx + 1) / (total + 1); // evenly spaced %

      // --- glowing node ---
      const node = document.createElement("div");
      node.className = "exp-node";
      node.style.left = `${ratio * 100}%`;
      nodeLayer.appendChild(node);

      // --- timeline tick mark ---
      const tick = document.createElement("div");
      tick.className = "exp-tick";
      tick.style.left = `${ratio * 100}%`;
      nodeLayer.appendChild(tick);

      // pass CSS var to card
      item.style.setProperty("--node-x", `${ratio * 100}%`);
    });
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animate(t) {
    requestAnimationFrame(animate);
    if (!w || !h) return;

    mouse.x = lerp(mouse.x, targetMouse.x, 0.08);
    mouse.y = lerp(mouse.y, targetMouse.y, 0.08);

    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.1;
    ctx.lineCap = "round";

    const time = t * 0.001;

    // ------------------------
    // DRAW THE LIQUID WAVE LINES
    // ------------------------
    for (let i = 0; i < lineCount; i++) {
      const yBase = h * 0.18 + (h * 0.55 * i) / (lineCount - 1);

      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const dx = x - mouse.x * w;
        const dy = yBase - mouse.y * h;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // wave blend layers
        const wave =
          Math.sin(x * 0.008 + t * 0.0015 + i * 0.2) * 8 +
          Math.sin(x * 0.018 + t * 0.0035 + i * 0.4) * 5 +
          Math.sin(x * 0.003 + t * 0.0007 + i * 1.1) * 6;

        // mouse warp
        const warp =
          baseAmplitude *
          Math.exp(-dist * falloff) *
          Math.cos(dist * waveFreq - time * speed);

        const y = yBase + wave * 0.4 + warp;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const alpha = 0.2 + (i / lineCount) * 0.55;
      ctx.strokeStyle = `rgba(0,255,154,${alpha})`;
      ctx.stroke();
    }

    // ------------------------
    // STRAIGHT TIMELINE BASELINE
    // ------------------------
    const timelineY = h * 0.62;

    ctx.beginPath();
    ctx.moveTo(0, timelineY);
    ctx.lineTo(w, timelineY);
    ctx.strokeStyle = "rgba(0,255,154,0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  wrap.addEventListener("mousemove", (e) => {
    const rect = wrap.getBoundingClientRect();
    targetMouse.x = (e.clientX - rect.left) / rect.width;
    targetMouse.y = (e.clientY - rect.top) / rect.height;
  });

  wrap.addEventListener("mouseleave", () => {
    targetMouse.x = 0.5;
    targetMouse.y = 0.4;
  });

  window.addEventListener("resize", resize);

  resize();
  requestAnimationFrame(animate);
})();
