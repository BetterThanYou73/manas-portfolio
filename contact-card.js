document.addEventListener("DOMContentLoaded", () => {
  const contactSection = document.querySelector(".contact-section");
  if (!contactSection || typeof gsap === "undefined") return;

  let played = false;

  function playContactAnimation() {
    if (played) return;
    played = true;

    const lasers = gsap.utils.toArray(".laser-line");
    const grid   = document.getElementById("contact-grid");
    const card   = document.getElementById("contact-card");
    const rect   = document.querySelector("#card-outline rect");

    if (!lasers.length || !grid || !card || !rect) return;

    // prep SVG outline for stroke animation
    const length = rect.getTotalLength();
    rect.style.strokeDasharray  = length;
    rect.style.strokeDashoffset = length;

    // initial card state
    gsap.set(card, { opacity: 0, y: 12, scale: 0.95 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // 1) three parallel laser lines, like planes flying by
    tl.fromTo(
      lasers,
      { xPercent: -150, opacity: 0 },
      {
        xPercent: 150,
        opacity: 1,
        duration: 2.2,
        ease: "power3.out",
        stagger: 0.06
      }
    ).to(lasers, { opacity: 0, duration: 0.35 }, "-=0.3");

    // 2) grid blooms in
    tl.fromTo(
      grid,
      { opacity: 0, scaleY: 0.25 },
      { opacity: 0.35, scaleY: 1, duration: 0.9 },
      "-=0.7"
    );

    // 3) outline traced
    tl.to(
      rect,
      { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" },
      "-=0.1"
    );

    // 4) card materializes
    tl.to(
      card,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.5)"
      },
      "-=0.4"
    );
  }

  // play when the section comes into view (once)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playContactAnimation();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(contactSection);
});
