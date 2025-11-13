window.onload = () => {
    startMatrixAnimation();
};

// MATRIX CANVAS
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

// STATES
let state = "rain";
const FINAL_TEXT = "ACCESS GRANTED";
const MORPH_FONT_SIZE = 28;

// scramble lock array
let scramble = [];
let bandProgress = 0; // 0 → 1 (expanding band)

// initialize scramble array
for (let i = 0; i < FINAL_TEXT.length; i++) {
    scramble[i] = 0;
}

function startMatrixAnimation() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*():?><";
    letters = letters.split("");

    let fontSize = 14;
    let columns = canvas.width / fontSize;

    let drops = [];
    for (let i = 0; i < columns; i++) drops[i] = 0;

    function draw() {

        /*--------------------------------------
        | CLEAR FRAME (except during morph)
        --------------------------------------*/
        if (state !== "morph") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
            ctx.shadowBlur = 0;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        /*--------------------------------------
        | NORMAL MATRIX RAIN
        --------------------------------------*/
        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px arial";
        ctx.shadowColor = "#0F0";
        ctx.shadowBlur = 3;

        for (let i = 0; i < drops.length; i++) {

            if (state === "morph") break;

            if (state === "rain") drops[i] += 1;
            else if (state === "slowdown") drops[i] += 0.7;
            else if (state === "freeze") drops[i] += 0;

            const char = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            if ((state === "rain" || state === "slowdown") &&
                drops[i] * fontSize > canvas.height &&
                Math.random() > 0.975) {
                drops[i] = 0;
            }
        }

        /*--------------------------------------
        | MORPH PHASE — SCRAMBLE EFFECT
        --------------------------------------*/
        if (state === "morph") {

            ctx.font = `${MORPH_FONT_SIZE}px "Courier New", monospace`;

            const textMetrics = ctx.measureText(FINAL_TEXT);
            const textWidth = textMetrics.width;

            const startX = (canvas.width - textWidth) / 2;
            const targetY = canvas.height / 2;


            /*--------------------------------------
            | EXPANDING BAND (center → outward)
            --------------------------------------*/
            bandProgress = Math.min(1, bandProgress + 0.03); // speed
            const fullWidth = canvas.width;
            const currentWidth = fullWidth * bandProgress;
            const centerX = canvas.width / 2;

            const bandHeight = MORPH_FONT_SIZE * 2.2;
            const bandTop = targetY - MORPH_FONT_SIZE * 1.3;

            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.fillRect(centerX - currentWidth / 2, bandTop, currentWidth, bandHeight);
            ctx.restore();


            /*--------------------------------------
            | SCRAMBLE LOCK-IN LOGIC
            --------------------------------------*/
            for (let i = 0; i < FINAL_TEXT.length; i++) {
                if (scramble[i] === 0 && Math.random() < 0.06) {
                    scramble[i] = 1;
                }
            }

            /*--------------------------------------
            | BUILD DISPLAY STRING
            --------------------------------------*/
            let displayText = "";
            for (let i = 0; i < FINAL_TEXT.length; i++) {
                if (scramble[i] === 1 || FINAL_TEXT[i] === " ") {
                    displayText += FINAL_TEXT[i];
                } else {
                    displayText += letters[Math.floor(Math.random() * letters.length)];
                }
            }

            /*--------------------------------------
            | DRAW FINAL SCRAMBLE TEXT
            --------------------------------------*/
            ctx.fillStyle = "#0F0";
            ctx.shadowColor = "rgba(0,255,0,0.5)";
            ctx.shadowBlur = 8;

            ctx.fillText(displayText, startX, targetY);
            return;
        }

        if (state === "complete") return;
    }

    let interval = setInterval(draw, 33);


    /*--------------------------------------
    | TIMELINE
    --------------------------------------*/

    setTimeout(() => {
        state = "slowdown";

        setTimeout(() => { state = "freeze"; }, 1000);

        setTimeout(() => {
            scramble = scramble.map(() => 0);
            bandProgress = 0;
            state = "morph";
        }, 3000);

        setTimeout(() => {
            state = "complete";
            clearInterval(interval);

            setTimeout(() =>
                gsap.to("#matrixCanvas", { opacity: 0, duration: 2 })
            , 1500);

            gsap.to("#mainContent", { opacity: 1, duration: 2, delay: 0.3 });
            gsap.from("#nameTitle", { y: 50, opacity: 0, duration: 1 });
            gsap.from("#introText", { y: 20, opacity: 0, duration: 1, delay: 0.5 });

        }, 5000);

    }, 6000);
}
