import { useEffect, useRef, useState } from "react";
import { useLang } from "../lib/i18n";

// images: [{ src, fallback?, alt?, caption?: { title, meta }, video? }]
// `video` : URL d'un fichier vidéo, `src` sert alors d'affiche.
// index: position dans `images`, ou null/undefined si fermé.
// onNavigate: optionnel — si absent (ou une seule image), pas de flèches prev/next.
// shareUrl: optionnel — adresse de l'image affichée, avec un bouton "Partager".
export default function Lightbox({ images, index, onClose, onNavigate, shareUrl }) {
  const { t } = useLang();
  const open = index != null && images && images[index];
  const canNavigate = onNavigate && images && images.length > 1;
  const touchRef = useRef(null);
  const [copied, setCopied] = useState(false);

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

  // Précharge les voisines : passer d'une image à l'autre reste instantané.
  useEffect(() => {
    if (!open || !canNavigate) return;
    for (const d of [1, -1]) {
      const img = new Image();
      img.src = images[(index + d + images.length) % images.length].src;
    }
  }, [open, canNavigate, index, images]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  if (!open) return null;

  const { src, fallback, alt, caption, video } = images[index];

  async function share(e) {
    e.stopPropagation();
    // Téléphone : feuille de partage du système ; ordinateur : copie du lien.
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: caption?.title || document.title, url: shareUrl });
      } catch {
        // partage annulé
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      window.prompt(t("lightbox.share"), shareUrl);
    }
  }

  return (
    <div
      className="lightbox"
      onClick={onClose}
      onTouchStart={(e) => {
        touchRef.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchRef.current == null) return;
        const dx = e.changedTouches[0].clientX - touchRef.current;
        touchRef.current = null;
        if (Math.abs(dx) > 50) goTo(dx < 0 ? 1 : -1);
      }}
    >
      {video ? (
        <video
          key={video}
          src={video}
          poster={src}
          controls
          autoPlay
          playsInline
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          key={src}
          src={src}
          alt={alt || caption?.title || ""}
          onError={(e) => {
            if (!fallback || e.currentTarget.dataset.fallback) return;
            e.currentTarget.dataset.fallback = "1";
            e.currentTarget.src = fallback;
          }}
        />
      )}

      {caption && (
        <div className="lightbox__caption" onClick={(e) => e.stopPropagation()}>
          <strong>{caption.title}</strong>
          {caption.meta && <span>{caption.meta}</span>}
        </div>
      )}

      {canNavigate && (
        <>
          <button
            className="lightbox__nav lightbox__nav--prev"
            aria-label={t("lightbox.prev")}
            onClick={(e) => {
              e.stopPropagation();
              goTo(-1);
            }}
          >
            ←
          </button>
          <button
            className="lightbox__nav lightbox__nav--next"
            aria-label={t("lightbox.next")}
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

      {shareUrl && (
        <button className="lightbox__share" onClick={share} aria-live="polite">
          {copied ? `${t("lightbox.copied")} ✓` : `${t("lightbox.share")} ↗`}
        </button>
      )}

      <button
        className="lightbox__close"
        aria-label={t("lightbox.close")}
        onClick={(e) => {
          // Sinon le clic remonte aussi au fond (qui ferme déjà) : double fermeture.
          e.stopPropagation();
          onClose();
        }}
      >
        ✕
      </button>
    </div>
  );
}
