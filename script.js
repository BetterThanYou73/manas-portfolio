window.onload = () => startMatrixAnimation();

let bgFade = 1;
let frozenCanvas = null;
let frozenCtx = null;

// CANVAS
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

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
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

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
            // during rain/slowdown/freeze/fade: trailing clear
            ctx.globalAlpha = 1;
            ctx.fillStyle = "rgba(0,0,0,0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // fade the frozen matrix frame
        if (state === "fade") {
            // overlay semi-transparent black each frame → matrix disappears smoothly
            ctx.globalAlpha = 0.12;           // fade strength per frame (tweak me)
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;

            fadeSteps++;

            // after enough frames, the background is basically black → start morph
            if (fadeSteps > 20) {             // fade duration ≈ fadeSteps * 33 ms
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

            // scramble lock – starts from all random, resolves over ~1–1.5s
            const lockProb = 0.07;         // ↑ for faster, ↓ for slower morph
            for (let i = 0; i < FINAL_TEXT.length; i++) {
                if (scramble[i] === 0 && Math.random() < lockProb) {
                    scramble[i] = 1;
                }
            }
            // safety: force full text after ~2s even if RNG is unlucky
            if (morphFrames > 60) scramble.fill(1);

            // output string
            let out = "";
            for (let i = 0; i < FINAL_TEXT.length; i++) {
                out += scramble[i]
                    ? FINAL_TEXT[i]
                    : letters[Math.floor(Math.random() * letters.length)];
            }

            ctx.fillStyle = "#0F0";
            ctx.shadowBlur = 2;   // tiny glow; set to 0 if you want super crisp
            ctx.fillText(out, x, y);

            return;
        }
    }

    const interval = setInterval(draw, 33);

    /* TIMELINE (Smooth & Realistic) */

    setTimeout(() => state = "slowdown", 4500);  // tweak: when slowing starts
    setTimeout(() => state = "freeze",   6200);  // tweak: when it fully freezes
    setTimeout(() => {                   // start fading immediately after freeze
        bgFade = 1;
        fadeSteps = 0;
        state = "fade";
    }, 6200);

    setTimeout(() => {
        clearInterval(interval);

        gsap.to("#matrixCanvas", { opacity: 0, duration: 2 });
        gsap.to("#mainContent", { opacity: 1, duration: 2, delay: 0.4 });

        // allow scrolling once content is visible
        document.body.style.overflowY = "auto";

    }, 10000);
}
