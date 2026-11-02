import { useEffect, useRef, useState } from "react";

const SPEED = 140; // px/s
const SPEED_REDUCED = 45; // px/s — "animations réduites" : plus lent, mais le bandeau vit
const GAP = 20; // px

// Bandeau défilant de l'accueil. Avec 50 à 100 blocs, on ne crée pas 100
// images d'un coup : seules celles qui traversent l'écran existent, et chaque
// image sortie à gauche est recyclée à droite avec le bloc suivant. La page
// reste légère et fluide quel que soit le nombre de blocs.
export default function HeroMarquee({ items }) {
  const boxRef = useRef(null);
  const trackRef = useRef(null);
  const [view, setView] = useState({ slots: [], h: 0 });

  useEffect(() => {
    const box = boxRef.current;
    const track = trackRef.current;
    if (!box || !track || !items.length) return;

    let slots = [];
    let next = 0;
    let uid = 0;
    let offset = 0;
    let h = 0;
    let wordW = 0;
    let raf = 0;
    let sizedFor = null; // [largeur, hauteur] utilisées pour la mise en page

    const widthOf = (item) => (item.type === "image" ? h * (item.ratio || 0.75) : wordW);

    function makeSlot(x) {
      const index = next % items.length;
      next++;
      return { key: uid++, index, x, w: widthOf(items[index]) };
    }

    function fill() {
      const limit = box.clientWidth + 2 * h - offset;
      let last = slots[slots.length - 1];
      let added = false;
      while (!last || last.x + last.w < limit) {
        const slot = makeSlot(last ? last.x + last.w + GAP : 0);
        slots.push(slot);
        last = slot;
        added = true;
        // Précharge l'image qui viendra juste après.
        const upcoming = items[next % items.length];
        if (upcoming?.type === "image") new Image().src = upcoming.src;
      }
      return added;
    }

    function layout() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (!vw || !vh) return false; // fenêtre pas encore dimensionnée : on réessaiera
      // Sur téléphone, la barre d'adresse qui apparaît / disparaît au défilement
      // déclenche des "resize" : on les ignore (sinon le bandeau repartirait du
      // début à chaque fois et semblerait figé).
      if (sizedFor && sizedFor[0] === vw && Math.abs(sizedFor[1] - vh) < vh * 0.25) return true;
      sizedFor = [vw, vh];
      const mobile = window.matchMedia("(max-width: 600px)").matches;
      h = vh * (mobile ? 0.6 : 0.78);
      wordW = vh * (mobile ? 0.34 : 0.44);
      // Vraie nouvelle taille : on repart du bloc actuellement en tête.
      next = slots.length ? slots[0].index : 0;
      slots = [];
      offset = 0;
      track.style.transform = "translate3d(0, 0, 0)";
      fill();
      setView({ slots: [...slots], h });
      return true;
    }

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    const speed = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? SPEED_REDUCED : SPEED;
    let prev = performance.now();
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!sizedFor && !layout()) return;
      const dt = Math.max(0, Math.min((now - prev) / 1000, 0.05));
      prev = now;
      offset -= speed * dt;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      let changed = false;
      while (slots.length && slots[0].x + slots[0].w + offset < 0) {
        slots.shift(); // sortie à gauche : recyclée par fill() à droite
        changed = true;
      }
      if (fill() || changed) setView({ slots: [...slots], h });
    };
    layout();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [items]);

  return (
    <div className="hero__marquee" ref={boxRef}>
      <div className="hero__track" ref={trackRef} style={{ height: view.h, marginTop: -view.h / 2 }}>
        {view.slots.map((slot) => {
          const item = items[slot.index];
          const style = { left: slot.x, width: slot.w, height: view.h };
          return item.type === "image" ? (
            <img key={slot.key} src={item.src} alt="" decoding="async" style={style} />
          ) : (
            <div key={slot.key} className="hero__word" style={style}>
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
