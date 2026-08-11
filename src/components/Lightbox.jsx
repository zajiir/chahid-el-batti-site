import { useEffect } from "react";

// images: [{ src, alt?, caption?: { title, medium, details, year } }]
// index: position dans `images`, ou null/undefined si fermé.
// onNavigate: optionnel — si absent (ou une seule image), pas de flèches prev/next.
export default function Lightbox({ images, index, onClose, onNavigate }) {
  const open = index != null && images && images[index];
  const canNavigate = onNavigate && images && images.length > 1;

  function goTo(delta) {
    if (!canNavigate) return;
    const next = (index + delta + images.length) % images.length;
    onNavigate(next);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(1);
      if (e.key === "ArrowLeft") goTo(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, images]);

  if (!open) return null;

  const { src, alt, caption } = images[index];

  return (
    <div className="lightbox" onClick={onClose}>
      <img src={src} alt={alt || caption?.title || ""} />

      {caption && (
        <div className="lightbox__caption" onClick={(e) => e.stopPropagation()}>
          <strong>{caption.title}</strong>
          <span>
            {caption.medium} — {caption.details} — {caption.year}
          </span>
        </div>
      )}

      {canNavigate && (
        <>
          <button
            className="lightbox__nav lightbox__nav--prev"
            aria-label="Image précédente"
            onClick={(e) => {
              e.stopPropagation();
              goTo(-1);
            }}
          >
            ←
          </button>
          <button
            className="lightbox__nav lightbox__nav--next"
            aria-label="Image suivante"
            onClick={(e) => {
              e.stopPropagation();
              goTo(1);
            }}
          >
            →
          </button>
          <div className="lightbox__count" onClick={(e) => e.stopPropagation()}>
            {index + 1} / {images.length}
          </div>
        </>
      )}

      <button className="lightbox__close" aria-label="Fermer" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
