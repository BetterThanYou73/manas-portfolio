// ===== canvas + context ==================================================
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);

// ===== subtle background waves (runs AFTER intro, or immediately if intro already done) ====
let wavesStarted = false;

function startSubtleWaves() {
    if (!canvas || !ctx || wavesStarted) return;
    wavesStarted = true;

    resizeCanvas();
    canvas.style.opacity = 0.35;   // keep subtle behind cards

    let t = 0;

    function drawWaves() {
        // 1) Reset transform every frame
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // 2) Dark base
        ctx.fillStyle = "#000";
        ctx.globalAlpha = 0.9;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        // 3) We draw on a square of size = diagonal of the screen
        const diag = Math.sqrt(
            canvas.width * canvas.width + canvas.height * canvas.height
        );

        ctx.save();

        // rotate everything so lines are diagonal
        const angle = -Math.PI / 6;      // -30° tilt; tweak if you want
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);

        // draw in a diag×diag area centered on the screen
        ctx.translate(-diag / 2, -diag / 2);

        const rows       = 14;           // number of lines
        const amplitude  = 18;           // wave height
        const wavelength = 180;          // distance between peaks
        const speed      = 0.012;        // overall animation speed

        // global up/down bobbing of the whole field
        const globalOffset = Math.sin(t * 0.4) * 25;

        for (let r = 0; r < rows; r++) {
            const yBase = (diag * (r + 1)) / (rows + 1) + globalOffset;

            ctx.beginPath();
            for (let x = 0; x <= diag; x += 6) {
                const y =
                    yBase +
                    Math.sin((x / wavelength) * Math.PI * 2 + t + r * 0.7) *
                    amplitude;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = "rgba(39,255,159,0.35)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        ctx.restore();

        t += speed;
        requestAnimationFrame(drawWaves);
    }

    requestAnimationFrame(drawWaves);
}

// ===== your ORIGINAL intro animation (only tiny edits near the end) =====

let bgFade = 1;
let frozenCanvas = null;
let frozenCtx = null;

// STATES
let state = "rain";
const FINAL_TEXT = "ACCESS GRANTED";
const MORPH_FONT_SIZE = 28;

let scramble = [];
let bandProgress = 0;
let fadeSteps = 0;      // how many frames we've been fading
let morphFrames = 0;    // how many frames we've been morphing

for (let i = 0; i < FINAL_TEXT.length; i++) scramble[i] = 0;

function startMatrixAnimation() {
    resizeCanvas();

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*():?><".split("");
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    let drops = new Array(columns).fill(0);

    function draw() {
        // CLEAR BACKGROUND
        if (state === "morph") {
            // during morph: FULL clear, no trails at all
            ctx.globalAlpha = 1;
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (state === "fade") {
            // during fade we DON'T wipe the frame first – we darken it gradually below
            ctx.globalAlpha = 1;
        } else {
            // during rain/slowdown/freeze: trailing clear
            ctx.globalAlpha = 1;
            ctx.fillStyle = "rgba(0,0,0,0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // fade the frozen matrix frame
        if (state === "fade") {
            ctx.globalAlpha = 0.12;           // fade strength per frame
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;

            fadeSteps++;

            if (fadeSteps > 20) {
                fadeSteps = 0;
                scramble = scramble.map(() => 0);
                bandProgress = 0;
                morphFrames = 0;
                state = "morph";
            }
            return;
        }

        // MATRIX RAIN (rain / slowdown / freeze)
        if (state !== "morph") {
            ctx.fillStyle = "#0F0";
            ctx.font = `${fontSize}px arial`;
            ctx.shadowBlur = 3;

            for (let i = 0; i < drops.length; i++) {

                if (state === "rain")    drops[i] += 1;
                if (state === "slowdown") drops[i] += 0.8; // slowing down
                if (state === "freeze") drops[i] += 0;   // fully frozen

                const ch = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(ch, i * fontSize, drops[i] * fontSize);

                if ((state === "rain" || state === "slowdown") &&
                    drops[i] * fontSize > canvas.height &&
                    Math.random() > 0.975) {
                    drops[i] = 0;
                }
            }
        }

        // morph to final text
        if (state === "morph") {

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            ctx.font = `${MORPH_FONT_SIZE}px "Courier New", monospace`;
            const textWidth = ctx.measureText(FINAL_TEXT).width;
            const x = (canvas.width - textWidth) / 2;
            const y = canvas.height / 2;   // centered vertically

            morphFrames++;

            // scramble lock
            const lockProb = 0.07;
            for (let i = 0; i < FINAL_TEXT.length; i++) {
                if (scramble[i] === 0 && Math.random() < lockProb) {
                    scramble[i] = 1;
                }
            }
            // safety
            if (morphFrames > 60) scramble.fill(1);

            // output string
            let out = "";
            for (let i = 0; i < FINAL_TEXT.length; i++) {
                out += scramble[i]
                    ? FINAL_TEXT[i]
                    : letters[Math.floor(Math.random() * letters.length)];
            }

            ctx.fillStyle = "#0F0";
            ctx.shadowBlur = 2;
            ctx.fillText(out, x, y);

            return;
        }
    }

    const interval = setInterval(draw, 33);

    /* TIMELINE (Smooth & Realistic) */

    setTimeout(() => state = "slowdown", 4500);
    setTimeout(() => state = "freeze",   6200);
    setTimeout(() => {
        bgFade = 1;
        fadeSteps = 0;
        state = "fade";
    }, 6200);

    setTimeout(() => {
        clearInterval(interval);

        // Instead of killing the canvas, just soften it
        gsap.to("#matrixCanvas", { opacity: 0.35, duration: 2 });

        gsap.to("#mainContent", {
            opacity: 1,
            duration: 2,
            delay: 0.4,
            onComplete() {
                document.body.style.overflowY = "auto";
                document.body.classList.remove("loading");

                // mark intro done for this tab
                sessionStorage.setItem("matrixIntroDone", "1");

                // switch to calm waves in the same canvas
                startSubtleWaves();
            }
        });
    }, 10000);
}

// ===== ENTRY POINT: play intro ONCE per TAB ============================

window.addEventListener("load", () => {
    if (!canvas || !ctx) return;

    const mainContent = document.getElementById("mainContent");
    const introAlreadyDone =
        sessionStorage.getItem("matrixIntroDone") === "1";

    if (!introAlreadyDone) {
        // First page visit in this tab → full animation
        document.body.style.overflowY = "hidden";
        if (mainContent) mainContent.style.opacity = 0;
        canvas.style.opacity = 1;
        startMatrixAnimation();
    } else {
        // Intro already ran in this tab → show content instantly + waves
        resizeCanvas();
        if (mainContent) mainContent.style.opacity = 1;
        document.body.style.overflowY = "auto";
        document.body.classList.remove("loading");
        canvas.style.opacity = 0.35;
        startSubtleWaves();
    }
});
