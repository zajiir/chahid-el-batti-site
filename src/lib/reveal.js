// Les rubriques "se condensent" (comme un nuage) quand elles arrivent à
// l'écran : elles reçoivent la classe .reveal, puis .is-in une fois visibles
// (styles dans index.css). Les éléments ajoutés plus tard (contenu Are.na…)
// sont pris en compte automatiquement.
const SELECTOR = [
  ".page-head",
  ".sub-nav",
  ".works-index",
  ".work",
  ".arena-card",
  ".arena-block",
  ".press-card",
  ".friend",
  ".platform",
  ".release",
  ".release__poem",
  ".video-slot",
  ".section-title",
  ".timeline-item",
  ".about__contact",
  ".about__bio p",
  ".about__social",
].join(", ");

export function startReveal(root) {
  if (
    !root ||
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return () => {};
  }

  let answered = false;
  const io = new IntersectionObserver(
    (entries) => {
      answered = true;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
  );

  const seen = new WeakSet();
  function scan() {
    root.querySelectorAll(SELECTOR).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  let pending = 0;
  const mo = new MutationObserver(() => {
    if (!pending) pending = requestAnimationFrame(() => ((pending = 0), scan()));
  });
  scan();
  mo.observe(root, { childList: true, subtree: true });

  // Filet de sécurité : si le navigateur ne signale jamais la visibilité
  // (onglet en arrière-plan, aperçu…), on affiche tout plutôt que de laisser
  // des rubriques invisibles.
  const safety = setTimeout(() => {
    if (answered) return;
    mo.disconnect();
    io.disconnect();
    root.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }, 1500);

  return () => {
    clearTimeout(safety);
    cancelAnimationFrame(pending);
    mo.disconnect();
    io.disconnect();
  };
}
