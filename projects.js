// projects-timeline.js
// One wavy line per project + dot on each line.
// Active project = orange line/dot, others = green.

(() => {
  const canvas = document.getElementById("timelineCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  if (!canvas || !ctx) return;

  const nodeLayer   = document.getElementById("timelineNodeLayer");
  const logBody     = document.getElementById("timelineLog");
  const detailsBox  = document.getElementById("projectDetails");

  const bootOverlay = document.getElementById("crtBoot");
  const bootText    = document.getElementById("crtBootText");
  const skipBtn     = document.getElementById("crtSkipBtn");

  // ---------- DATA: EDIT HERE FOR PROJECTS ----------
  // order = event#, date = label in the table
  const items = [
    {
      id: "neuromotion",
      order: 7,
      year: 2025,
      month: 11,
      date: "2025-11",
      type: "Neural",
      title: "Neuromotion · NatHacks 2025",
      stack: "EEG · CSP · PyTorch · OpenBCI",
      summary:
        "NatHacks 2025 MedTech project: utilizes OpenBCI kit and performs motor-imagery classification via MLP Feed Forward Neural Network trained on OpenBCNI2014 Dataset with CSP, bandpower and asymmetry features extracted, runs real-time (2 seconds context sliding window) with neurofeedback visualisations.",
      link: "https://github.com/Alberta-Bionix-natHacks-2025/natHacks2025",
    },
    
    {
      id: "skynav",
      order: 6,
      year: 2025,
      month: 2,
      date: "2025-02",
      type: "Navigation",
      title: "SkyNav · Weather-aware Routing",
      stack: "Python · RL-style logic · A* · Random Forest · Flask",
      summary:
      "HackED project: navigation system for small drones / light aircraft that reasons about no-fly zones and weather constraints.",
      link: "https://skynav.pythonanywhere.com/",
    },

      {
      id: "genai",
      order: 5,
      year: 2025,
      month: 4,
      date: "2025-04",
      type: "Speech",
      title: "XTTS + Wav2Lip Pipeline",
      stack: "XTTS v2 · Wav2Lip-GAN · FFMPEG",
      summary:
        "End-to-end multilingual speech synthesis & lip-sync pipeline. Voice cloning via reference audio (EN/HI) using XTTS v2 to preserve pronunciation, intonation, and speaker artifacts. Loudness normalisation ensures audio consistency, then Wav2Lip-GAN maps generated speech to facial motion for final MP4 output.",
      link: "https://github.com/BetterThanYou73/GenAI_Task",
    },
    
    {
      id: "tfmathvision",
      order: 4,
      year: 2024,
      month: 8,
      date: "2024-08",
      type: "Vision",
      title: "TensorFlow Math Vision",
      stack: "TensorFlow · CNNs · Image augmentation",
      summary:
      "A deep learning model built with TensorFlow (now working in porting to Pytorch) that can accurately recognize and interpret handwritten mathematical expressions from images. Utilizes convolutional neural networks (CNNs) and extensive image augmentation techniques to improve accuracy and robustness.",
      link: "https://github.com/BetterThanYou73/tensorflow-math-vision",
    },

    {
      id: "mathvision",
      order: 3,
      year: 2024,
      month: 8,
      date: "2024-08",
      type: "Vision",
      title: "Math Vision · OCR Evaluator",
      stack: "Python · CV · OCR · Expression parser",
      summary:
        "Symbol-level vision system that reads handwritten/printed math expressions, parses them, and evaluates the result.",
      link: "https://github.com/BetterThanYou73/math-vision",
    },

    {
      id: "nightmares",
      order: 2,
      year: 2023,
      month: 11,
      date: "2023-11",
      type: "Neural",
      title: "Nightmares · EMG-driven Horror",
      stack: "EMG · Game engine · Signal processing",
      summary:
        "Biofeedback-adaptive horror game prototype. Reads real-time EMG muscle activation and adjusts pacing, intensity, and encounters.",
      link: "https://github.com/GOATMaxwellN/Nightmares",
    },

    {
      id: "ultron",
      order: 1,
      year: 2021,
      month: 3,
      date: "2021-03",
      type: "Automation",
      title: "Ultron 2.0",
      stack: "Python · CLI automation",
      summary:
        "Early Python assistant exploring scripting, automation, and command handling - the starting point for everything I have built so far.",
      link: "https://github.com/BetterThanYou73/Ultron2.0",
    },
  ];

  // Vertical lane order = items order as written above.
  const lanesData = [...items];

  // Horizontal position of each dot is based on chronological order.
  const chrono = [...items].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    return a.order - b.order;
  });

  const phaseById = new Map();
  chrono.forEach((p, idx) => {
    const t = (idx + 1) / (chrono.length + 1); // 0..1, padded from edges
    phaseById.set(p.id, t);
  });

  // ---------- STATE ----------
  let width = 0;
  let height = 0;
  let lanes = []; // { project, baseY, amp, left, right, phase, dotX, dotY, nodeDom, rowDom }
  let lastTime = 0;
  let activeId = lanesData[0]?.id || null;

  // ---------- LAYOUT ----------
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || 800;
    height = rect.height || 220;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    layoutLanes();
  }

  function layoutLanes() {
    if (nodeLayer) nodeLayer.innerHTML = "";
    lanes = [];

    const count = lanesData.length;
    if (!count) return;

    const topBand = height * 0.28;
    const bottomBand = height * 0.72;
    const usable = bottomBand - topBand;
    const spacing = count > 1 ? usable / (count - 1) : 0;

    const left = 70;
    const right = width - 70;
    const ampBase = height * 0.045;

    lanesData.forEach((p, idx) => {
      const baseY = topBand + idx * spacing;
      const amp = ampBase;
      const phase = phaseById.get(p.id) ?? ((idx + 1) / (count + 1));

      const lane = {
        project: p,
        baseY,
        amp,
        left,
        right,
        phase,  // dot position 0..1 along line
        dotX: 0,
        dotY: 0,
        nodeDom: null,
        rowDom: null,
      };
      lanes.push(lane);

      if (nodeLayer) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "timeline-node";
        btn.dataset.id = p.id;
        btn.innerHTML = `
          <span class="timeline-node-id">${String(p.order).padStart(3, "0")}</span>
          <span class="timeline-node-dot"></span>
        `;
        nodeLayer.appendChild(btn);
        lane.nodeDom = btn;

        btn.addEventListener("mouseenter", () => setActive(p.id));
        btn.addEventListener("click", () => setActive(p.id));
      }
    });
  }

  // ---------- LOG + DETAILS ----------
  function buildLog() {
    if (!logBody) return;
    logBody.innerHTML = "";

    lanes.forEach((lane) => {
      const p = lane.project;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "timeline-log-row";
      row.dataset.id = p.id;
      row.innerHTML = `
        <span class="col-event">${String(p.order).padStart(3, "0")}</span>
        <span class="col-date">${p.date}</span>
        <span class="col-type">${p.type.toUpperCase()}</span>
        <span class="col-stack">${p.stack}</span>
      `;
      logBody.appendChild(row);
      lane.rowDom = row;

      row.addEventListener("mouseenter", () => setActive(p.id));
      row.addEventListener("click", () => setActive(p.id));
    });
  }

  function updateDetails() {
    if (!detailsBox || !activeId) return;
    const p = items.find((x) => x.id === activeId);
    if (!p) return;

    detailsBox.innerHTML = `
      <h3 class="details-title">${p.title}</h3>
      <p class="details-meta">${p.date} · ${p.type}</p>
      <p class="details-body">${p.summary}</p>
      <p class="details-stack"><strong>Stack:</strong> ${p.stack}</p>
      <a class="details-link" href="${p.link}" target="_blank" rel="noopener">
        ↗ Open project
      </a>
    `;
  }

  function setActive(id) {
    if (!id || activeId === id) return;
    activeId = id;

    lanes.forEach((lane) => {
      const isActive = lane.project.id === id;
      lane.rowDom?.classList.toggle("is-active", isActive);
      lane.nodeDom?.classList.toggle("is-active", isActive);
    });

    updateDetails();
  }

  // ---------- RENDER ----------
  function render(ts) {
    const time = ts * 0.0006; // controls wave motion speed
    lastTime = ts;

    ctx.clearRect(0, 0, width, height);

    // background inside CRT
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#020806");
    bgGrad.addColorStop(1, "#010302");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    if (!lanes.length) {
      requestAnimationFrame(render);
      return;
    }

    lanes.forEach((lane, idx) => {
      const isActive = lane.project.id === activeId;

      // wavy line for this project
      ctx.save();
      ctx.lineWidth = isActive ? 2.4 : 1.4;
      ctx.strokeStyle = isActive
        ? "rgba(255, 190, 120, 0.95)"
        : "rgba(0, 255, 153, 0.80)";
      ctx.shadowColor = isActive
        ? "rgba(255, 190, 120, 0.7)"
        : "rgba(0, 255, 153, 0.5)";
      ctx.shadowBlur = isActive ? 20 : 14;

      ctx.beginPath();
      const steps = 180;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = lane.left + t * (lane.right - lane.left);
        const wave = Math.sin(t * Math.PI * 2 + time + idx * 0.7) * lane.amp;
        const y = lane.baseY + wave;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // dot position along this line (same wave, specific phase)
      const tDot = lane.phase;
      const xDot = lane.left + tDot * (lane.right - lane.left);
      const waveDot =
        Math.sin(tDot * Math.PI * 2 + time + idx * 0.7) * lane.amp;
      const yDot = lane.baseY + waveDot;
      lane.dotX = xDot;
      lane.dotY = yDot;

      // glowing dot on canvas
      ctx.save();
      const outer = isActive ? 10 : 7;
      const inner = isActive ? 4.5 : 3;

      const g = ctx.createRadialGradient(xDot, yDot, 0, xDot, yDot, outer * 2.2);
      if (isActive) {
        g.addColorStop(0, "rgba(255, 235, 180, 1)");
        g.addColorStop(0.4, "rgba(255, 190, 120, 0.9)");
      } else {
        g.addColorStop(0, "rgba(0, 255, 153, 1)");
        g.addColorStop(0.4, "rgba(0, 255, 153, 0.7)");
      }
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(xDot, yDot, outer * 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(0, 20, 10, 0.95)";
      ctx.beginPath();
      ctx.arc(xDot, yDot, inner, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // move DOM node to follow the wave
      if (lane.nodeDom) {
        lane.nodeDom.style.left = `${(xDot / width) * 100}%`;
        lane.nodeDom.style.top = `${(yDot / height) * 100}%`;
      }
    });

    requestAnimationFrame(render);
  }

  // ---------- BOOT SEQUENCE ----------
  function startTimeline() {
    resize();
    buildLog();
    setActive(activeId);
    updateDetails();
    requestAnimationFrame(render);
  }

  function runBoot() {
    if (!bootOverlay) {
      startTimeline();
      return;
    }

    if (bootText) {
      bootText.textContent = "> INITIALIZING TVA_DISPLAY...";
    }

    const finish = () => {
      bootOverlay.classList.add("crt-boot-fade");
      setTimeout(() => {
        bootOverlay.style.display = "none";
      }, 350);
      startTimeline();
    };

    if (skipBtn) {
      skipBtn.addEventListener("click", finish);
    }

    setTimeout(() => {
      if (bootText) {
        bootText.textContent = "> LOADING PROJECT_TIMELINE...";
      }
    }, 700);

    setTimeout(finish, 2100);
  }

  window.addEventListener("resize", resize);

  // script is at bottom of body, so DOM is ready
  runBoot();
})();
