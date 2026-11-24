/**
 * A tiny inline script that runs before first paint (see app/layout.tsx).
 *
 * 1. Applies the saved theme, so there's no flash of the wrong theme.
 * 2. Wires up the site-wide effects without React:
 *    - the pointer spotlight on .card
 *    - copy buttons on code blocks (one delegated click listener)
 *    (Reveal-on-scroll is pure CSS: see [data-reveal] in globals.css.)
 *
 * Keeping this outside React means none of it adds hydration cost.
 */
export const bootScript = `(() => {
  var d = document.documentElement;
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") d.dataset.theme = t;
  } catch (e) {}
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Copy buttons are rendered on the server; one delegated listener handles them all.
  document.addEventListener("click", function (ev) {
    var btn = ev.target && ev.target.closest && ev.target.closest(".copy-btn");
    if (!btn) return;
    var code = btn.parentElement && btn.parentElement.querySelector("code");
    if (!code || !navigator.clipboard) return;
    navigator.clipboard.writeText(code.innerText).then(function () {
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = "Copy"; }, 1500);
    });
  });

  // Spotlight: one passive listener for every card on the page.
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    var raf = 0, last;
    document.addEventListener("pointermove", function (ev) {
      last = ev;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var card = last.target && last.target.closest && last.target.closest(".card");
        if (!card) return;
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (last.clientX - r.left) + "px");
        card.style.setProperty("--my", (last.clientY - r.top) + "px");
      });
    }, { passive: true });
  }
})();`;
