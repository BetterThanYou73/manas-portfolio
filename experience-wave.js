// experience-wave.js  — sacred timeline, node-locked strands
(() => {
    const wrap = document.getElementById("expWaveWrap");
    const canvas = document.getElementById("expWave");
    const ctx = canvas.getContext("2d");
    const nodeLayer = document.getElementById("expNodeLayer");
    const items = Array.from(document.querySelectorAll(".exp-item"));

    if (!wrap || !canvas || !ctx || !items.length) return;

    let w = 0, h = 0;

    // each strand: { y, ratio }  (ratio = node X in [0,1])
    const strands = [];
    const nodeElements = [];
    const hoverIndex = { index: -1 };

    const baseAmp = 22;

    let mouse = { x: 0.5, y: 0.5 };
    let targetMouse = { x: 0.5, y: 0.5 };

    // ------------------ sizing / setup ------------------
    function resize() {
        const rect = wrap.getBoundingClientRect();
        w = rect.width;
        h = rect.height;

        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

        buildStrands();
        positionNodes();
    }

    function buildStrands() {
        strands.length = 0;
        const N = items.length;

        for (let i = 0; i < N; i++) {
            const y = h * 0.25 + (i / (N - 1 || 1)) * h * 0.45;
            // give a default ratio; will be overwritten in positionNodes
            const ratio = (i + 1) / (N + 1);
            strands.push({ y, ratio });
        }
    }

    function positionNodes() {
        nodeLayer.innerHTML = "";
        nodeElements.length = 0;

        const rect = wrap.getBoundingClientRect();
        const N = items.length;

        items.forEach((item, i) => {
            const ratio = (i + 1) / (N + 1);      // 0–1 along width
            const strandY = strands[i].y;

            const node = document.createElement("div");
            node.className = "exp-node sacred-node";
            node.style.left = `${ratio * 100}%`;
            node.style.top  = `${(strandY / h) * 100}%`;

            nodeLayer.appendChild(node);
            nodeElements.push(node);

            // store ratio on strand so drawing code knows node X
            strands[i].ratio = ratio;

            // CSS vars for vertical connectors under the card
            item.style.setProperty("--node-x", `${ratio * 100}%`);
            item.style.setProperty("--node-y", `${(strandY / h) * 100}%`);

            // hover → highlight this strand + card
            node.addEventListener("mouseenter", () => {
                hoverIndex.index = i;
                item.classList.add("exp-hover");
            });

            node.addEventListener("mouseleave", () => {
                hoverIndex.index = -1;
                item.classList.remove("exp-hover");
            });
        });
    }

    // ------------------ animation ------------------
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function animate(t) {
        requestAnimationFrame(animate);

        if (!w || !h) return;

        mouse.x = lerp(mouse.x, targetMouse.x, 0.08);
        mouse.y = lerp(mouse.y, targetMouse.y, 0.08);

        ctx.clearRect(0, 0, w, h);
        const time = t * 0.001;

        strands.forEach((strand, i) => {
            const yBase   = strand.y;
            const ratio   = strand.ratio ?? 0.5;
            const nodeX   = ratio * w;

            // ---- compute offset at the node, so we can re-zero the curve there ----
            const dxNode = nodeX - mouse.x * w;
            const dyNode = yBase - mouse.y * h;
            const distNode = Math.sqrt(dxNode * dxNode + dyNode * dyNode);

            const waveNode =
                Math.sin(nodeX * 0.01 + time * 1.4) * 4 +
                Math.sin(nodeX * 0.02 + time * 0.7) * 3 +
                Math.sin(nodeX * 0.004 - time * 2.0) * 6;

            const warpNode =
                baseAmp *
                Math.exp(-distNode * 0.01) *
                Math.cos(distNode * 0.03 - time * 1.4);

            const nodeOffset = waveNode + warpNode * 0.35;

            // ---- draw strand, re-centred so offset(nodeX) = 0 ----
            ctx.beginPath();

            for (let x = 0; x <= w; x += 3) {
                const dx = x - mouse.x * w;
                const dy = yBase - mouse.y * h;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const wave =
                    Math.sin(x * 0.01 + time * 1.4) * 4 +
                    Math.sin(x * 0.02 + time * 0.7) * 3 +
                    Math.sin(x * 0.004 - time * 2.0) * 6;

                const warp =
                    baseAmp *
                    Math.exp(-dist * 0.01) *
                    Math.cos(dist * 0.03 - time * 1.4);

                const offset = (wave + warp * 0.35) - nodeOffset;
                const y = yBase + offset;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            const glow = hoverIndex.index === i ? 1 : 0;
            ctx.strokeStyle = glow
                ? "rgba(0,255,160,0.9)"
                : "rgba(0,255,140,0.38)";
            ctx.lineWidth = glow ? 2.4 : 1.4;
            ctx.lineCap = "round";
            ctx.stroke();
        });
    }

    // ------------------ interaction ------------------
    wrap.addEventListener("mousemove", (e) => {
        const rect = wrap.getBoundingClientRect();
        targetMouse.x = (e.clientX - rect.left) / rect.width;
        targetMouse.y = (e.clientY - rect.top) / rect.height;
    });

    wrap.addEventListener("mouseleave", () => {
        targetMouse.x = 0.5;
        targetMouse.y = 0.5;
    });

    window.addEventListener("resize", resize);

    resize();
    requestAnimationFrame(animate);
})();
