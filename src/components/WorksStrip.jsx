import { useEffect, useRef, useState } from "react";
import { useLang } from "../lib/i18n";

const DRAG_THRESHOLD = 6; // px — au-delà, un appui souris est un glissé, pas un clic
const EASE = 0.2; // part de la distance restante parcourue à chaque frame
const ARROW_DURATION = 420; // ms

// Défilement animé maison pour les flèches : scrollTo({ behavior: "smooth" })
// est ignoré par certains navigateurs / réglages, et les flèches ne faisaient
// alors rien. Si aucune image n'est dessinée (onglet en arrière-plan…), on
// arrive quand même à destination.
function animateScroll(el, to) {
  const from = el.scrollLeft;
  const start = performance.now();
  let done = false;
  function step(now) {
    if (done) return;
    const k = Math.min(1, (now - start) / ARROW_DURATION);
    el.scrollLeft = from + (to - from) * (1 - Math.pow(1 - k, 3));
    if (k < 1) requestAnimationFrame(step);
    else done = true;
  }
  requestAnimationFrame(step);
  setTimeout(() => {
    if (done) return;
    done = true;
    el.scrollLeft = to;
  }, ARROW_DURATION + 150);
}

// Bande horizontale en défilement natif : swipe trackpad / tactile gérés par
// le navigateur, glisser à la souris, flèches et clavier. Un clic ouvre le
// plein écran.
// focusIndex : image affichée en plein écran — la bande la garde centrée
// derrière, pour la retrouver à la fermeture (ou en arrivant par son lien).
// wheel : convertit aussi la molette verticale en défilement horizontal (à
// éviter quand la page elle-même défile verticalement d'une bande à l'autre).
// tags : affiche le titre sur chaque image.
export default function WorksStrip({
  works,
  onOpen,
  focusIndex = null,
  wheel = false,
  tags = true,
  eagerCount = 3,
}) {
  const { t, tr } = useLang();
  const scrollerRef = useRef(null);
  const suppressClickRef = useRef(0);
  const [current, setCurrent] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Nouvelle catégorie : retour au début.
  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollLeft = 0;
  }, [works]);

  useEffect(() => {
    const el = scrollerRef.current;
    const item = focusIndex != null && el?.children[focusIndex];
    if (!item) return;
    el.scrollLeft = item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2;
  }, [focusIndex, works]);

  // Compteur + état des flèches, recalculés au plus une fois par frame.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    function update() {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      const start = el.scrollLeft <= 2;
      const end = el.scrollLeft >= max - 2;
      setAtStart(start);
      setAtEnd(end);
      const items = el.children;
      if (!items.length) return;
      if (start) return setCurrent(0);
      if (end) return setCurrent(items.length - 1);
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < items.length; i++) {
        const d = Math.abs(items[i].offsetLeft + items[i].offsetWidth / 2 - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      setCurrent(best);
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    update();
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [works]);

  // Molette + glisser souris, avec un même lissage (cible vers laquelle on
  // glisse progressivement) pour que les deux restent fluides.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let target = null;
    let raf = 0;

    const maxScroll = () => el.scrollWidth - el.clientWidth;
    function step() {
      const diff = target - el.scrollLeft;
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = target;
        target = null;
        raf = 0;
        return;
      }
      el.scrollLeft += diff * EASE;
      raf = requestAnimationFrame(step);
    }
    function glideTo(left) {
      target = Math.max(0, Math.min(maxScroll(), left));
      if (!raf) raf = requestAnimationFrame(step);
    }
    function stopGlide() {
      cancelAnimationFrame(raf);
      raf = 0;
      target = null;
    }

    function onWheel(e) {
      if (e.ctrlKey) return; // zoom au pincement
      // Geste horizontal (trackpad) : le défilement natif s'en charge.
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const delta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      const base = target ?? el.scrollLeft;
      const next = Math.max(0, Math.min(maxScroll(), base + delta));
      // Arrivé au bout : on laisse la page défiler normalement.
      if (next === base) return;
      e.preventDefault();
      glideTo(next);
    }

    let drag = null;
    function onPointerDown(e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      stopGlide();
      drag = { x: e.clientX, left: el.scrollLeft, moved: false, samples: [] };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    }
    function onPointerMove(e) {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD) {
        drag.moved = true;
        el.classList.add("is-dragging");
      }
      if (!drag.moved) return;
      el.scrollLeft = drag.left - dx;
      drag.samples.push({ x: e.clientX, t: performance.now() });
      if (drag.samples.length > 5) drag.samples.shift();
    }
    function onPointerUp() {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (drag?.moved) {
        // Le "click" natif qui suit immédiatement un glissé ne doit pas ouvrir l'image.
        suppressClickRef.current = performance.now() + 80;
        el.classList.remove("is-dragging");
        // Élan du lâcher, proportionnel à la vitesse des derniers mouvements.
        const s = drag.samples;
        if (s.length >= 2) {
          const dt = s[s.length - 1].t - s[0].t || 1;
          const v = (s[s.length - 1].x - s[0].x) / dt; // px/ms
          glideTo(el.scrollLeft - v * 280);
        }
      }
      drag = null;
    }

    if (wheel) el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    return () => {
      stopGlide();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [wheel]);

  // Flèches : amène l'image suivante / précédente au bord gauche.
  function go(dir) {
    const el = scrollerRef.current;
    if (!el) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const items = Array.from(el.children);
    const lefts = items.map((it) => it.offsetLeft - pad);
    const max = el.scrollWidth - el.clientWidth;
    const target =
      dir > 0
        ? lefts.find((l) => l > el.scrollLeft + 4)
        : [...lefts].reverse().find((l) => l < el.scrollLeft - 4);
    animateScroll(el, Math.max(0, Math.min(max, target ?? (dir > 0 ? max : 0))));
  }

  function onKeyDown(e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  }

  function handleClick(i) {
    if (performance.now() < suppressClickRef.current) return;
    onOpen(i);
  }

  return (
    <div className="strip">
      <div
        className="strip__scroller"
        ref={scrollerRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={t("strip.label")}
      >
        {works.map((w, i) => (
          <button key={w.key} className="strip__item" onClick={() => handleClick(i)}>
            <img
              src={w.thumb}
              width={w.width}
              height={w.height}
              alt={(w.caption && tr(w.caption, "title")) || ""}
              loading={i < eagerCount ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              onError={(e) => {
                if (e.currentTarget.dataset.fallback) return;
                e.currentTarget.dataset.fallback = "1";
                e.currentTarget.src = w.original;
              }}
            />
            {tags && w.caption && <span className="strip__tag">{tr(w.caption, "title")}</span>}
          </button>
        ))}
      </div>

      <button
        className={"strip__arrow strip__arrow--prev" + (atStart ? " is-hidden" : "")}
        onClick={() => go(-1)}
        aria-label={t("strip.prev")}
        tabIndex={atStart ? -1 : 0}
      >
        ←
      </button>
      <button
        className={"strip__arrow strip__arrow--next" + (atEnd ? " is-hidden" : "")}
        onClick={() => go(1)}
        aria-label={t("strip.next")}
        tabIndex={atEnd ? -1 : 0}
      >
        →
      </button>

      {works.length > 1 && (
        <div className="strip__count" aria-live="polite">
          {current + 1} / {works.length}
        </div>
      )}
    </div>
  );
}
