import { useEffect, useRef } from "react";

// Galerie horizontale pilotée par la vitesse de scroll : molette / trackpad,
// glisser (souris ou tactile) ou flèches clavier. Le flou et le zoom sont
// proportionnels à la vitesse instantanée — "l'accélération" comme interface.
export default function KineticGallery({ images, onImageClick }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const pressStartRef = useRef({ x: 0, y: 0, index: null });

  // Nouvelle catégorie : on repart du début.
  useEffect(() => {
    positionRef.current = 0;
    velocityRef.current = 0;
    if (trackRef.current) {
      trackRef.current.style.transform = "translateX(0px)";
    }
  }, [images]);

  useEffect(() => {
    let raf;

    function clampPos(x) {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return x;
      const min = Math.min(0, viewport.clientWidth - track.scrollWidth);
      return Math.max(min, Math.min(0, x));
    }

    function frame() {
      const track = trackRef.current;
      if (track) {
        positionRef.current = clampPos(positionRef.current - velocityRef.current);
        velocityRef.current *= 0.9;
        if (Math.abs(velocityRef.current) < 0.03) velocityRef.current = 0;

        const speed = Math.abs(velocityRef.current);
        const blur = Math.min(speed * 0.18, 7);
        const scale = 1 + Math.min(speed * 0.0025, 0.07);

        track.style.transform = `translateX(${positionRef.current}px) scale(${scale})`;
        track.style.filter = blur > 0.15 ? `blur(${blur}px)` : "none";
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // onWheel via addEventListener non-passif : React rend onWheel passif par
  // défaut, ce qui empêcherait preventDefault() de bloquer le scroll de page.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    function handleWheel(e) {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      velocityRef.current = Math.max(-70, Math.min(70, velocityRef.current + delta * 0.55));
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  function onPointerDown(e) {
    draggingRef.current = true;
    lastXRef.current = e.clientX;

    // `setPointerCapture` ci-dessous retargete tous les événements suivants
    // (y compris le "click" natif) vers le viewport, jamais vers le bouton
    // sous le doigt/curseur — un simple tap n'ouvrirait donc jamais l'image.
    // On fait le hit-test nous-mêmes avant la capture pour savoir quelle
    // image a été pressée, et on décide "clic ou glissé" à la levée en
    // comparant la distance parcourue.
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const item = el?.closest(".kinetic__item");
    const index = item ? Array.prototype.indexOf.call(trackRef.current.children, item) : null;
    pressStartRef.current = { x: e.clientX, y: e.clientY, index };

    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    positionRef.current += dx;
    velocityRef.current = -dx * 1.2;
  }
  function onPointerUp(e) {
    draggingRef.current = false;
    const { x, y, index } = pressStartRef.current;
    if (index == null) return;
    const moved = Math.hypot(e.clientX - x, e.clientY - y);
    if (moved < 6) onImageClick(index);
  }
  function onPointerLeave() {
    draggingRef.current = false;
  }
  function onKeyDown(e) {
    if (e.key === "ArrowRight") velocityRef.current += 24;
    if (e.key === "ArrowLeft") velocityRef.current -= 24;
  }

  return (
    <div
      className="kinetic"
      ref={viewportRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-label="Galerie — molette, glisser ou flèches gauche/droite pour naviguer"
    >
      <div className="kinetic__track" ref={trackRef}>
        {images.map((img, i) => (
          <button key={img.src + i} className="kinetic__item" tabIndex={-1}>
            <img src={img.src} alt="" draggable={false} loading="lazy" />
            {img.caption && (
              <span className="kinetic__item-tag">{img.caption.title}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
