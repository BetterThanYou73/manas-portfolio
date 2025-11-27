// page-transition.js
(function () {
  const overlay = document.getElementById("pageTransition");
  if (!overlay) return;

  const NAV_LINK_SELECTOR = ".top-nav a"; // adjust if your nav selector differs

  // ----- OUTRO: leaving current page -----
  function startTransitionAndNavigate(url) {
    if (!url) return;

    // mark that next page should play intro fade-out
    try {
      sessionStorage.setItem("playPageIntro", "1");
    } catch (e) {}

    overlay.classList.add("is-active");

    // give the lines a tiny moment to show before navigation
    setTimeout(() => {
      window.location.href = url;
    }, 550); // tweak if you want longer / shorter
  }

  // intercept nav clicks
  const navLinks = document.querySelectorAll(NAV_LINK_SELECTOR);
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http")) return; // skip external

    link.addEventListener("click", (e) => {
      // don't re-load same page
      if (window.location.pathname.endsWith(href)) return;

      e.preventDefault();
      startTransitionAndNavigate(href);
    });
  });

  // ----- INTRO: arriving on a new page -----
  window.addEventListener("load", () => {
    let shouldIntro = false;
    try {
      shouldIntro = sessionStorage.getItem("playPageIntro") === "1";
      sessionStorage.removeItem("playPageIntro");
    } catch (e) {}

    if (!shouldIntro) return;

    // show overlay immediately, then fade it out
    overlay.classList.add("is-active");

    // let browser paint once before we start fading
    requestAnimationFrame(() => {
      overlay.classList.add("is-fading-out");

      overlay.addEventListener(
        "transitionend",
        () => {
          overlay.classList.remove("is-active", "is-fading-out");
        },
        { once: true }
      );
    });
  });
})();
