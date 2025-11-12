window.onload = () => {
    startMatrixAnimation();
};

// matrix animation (not complete yet)
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

function startMatrixAnimation() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
    letters = letters.split("");

    let fontSize = 14;
    let columns = canvas.width / fontSize;

    let drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px arial";
        ctx.shadowColor = "#0F0";
        ctx.shadowBlur = 10;

        for (let i = 0; i < drops.length; i++) {
            let text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    let interval = setInterval(draw, 33);

    // After 3.5 sec → Fade out Matrix and reveal main content
    setTimeout(() => {
        clearInterval(interval);

        gsap.to("#matrixCanvas", { opacity: 0, duration: 1.5 });
        gsap.to("#mainContent", { opacity: 1, duration: 1.5, delay: 0.5 });

        gsap.from("#nameTitle", { y: 50, opacity: 0, duration: 1 });
        gsap.from("#introText", { y: 20, opacity: 0, duration: 1, delay: 0.5 });

    }, 3500);
}
