import { useEffect, useRef, useState } from "react";
import { fetchContents, blockImage, blockText } from "../lib/arena";
import Plane from "../components/Plane";
import home from "../content/home.json";

const CHANNEL = "going-through-life";
const MAX_IMAGES = 14;
const MAX_WORDS = 5;
const WORD_EVERY = 3; // un mot glissé toutes les 3 images
const MAX_WORD_LENGTH = 90;

// Derniers ajouts du channel : images + courts textes ("mots"), entremêlés.
function buildItems(blocks) {
  const images = [];
  const words = [];
  for (const b of blocks) {
    // Les blocs "Link" n'ont souvent qu'une capture de page web (écran de
    // connexion Instagram…) : on ne garde que les vraies images / vidéos.
    const src = b.type === "Link" ? null : blockImage(b, "medium");
    if (src && images.length < MAX_IMAGES) {
      const { width, height } = b.image;
      images.push({ type: "image", id: b.id, src, ratio: width && height ? width / height : null });
    } else if (b.type === "Text" && words.length < MAX_WORDS) {
      const text = blockText(b);
      if (text && text.length <= MAX_WORD_LENGTH) words.push({ type: "word", id: b.id, text });
    }
  }
  const items = [];
  images.forEach((img, i) => {
    items.push(img);
    if ((i + 1) % WORD_EVERY === 0 && words.length) items.push(words.shift());
  });
  return items.concat(words);
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const nameRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetchContents(CHANNEL, { per: 48 })
      .then(({ blocks }) => {
        if (cancelled) return;
        const list = buildItems(blocks);
        setItems(list);
        setStatus(list.length ? "ok" : "error");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const loop = items.length ? [...items, ...items] : [];

  return (
    <div className="hero">
      <div className="hero__marquee">
        {status === "ok" && (
          <div className="hero__track">
            {loop.map((item, i) =>
              item.type === "image" ? (
                <img
                  key={i}
                  src={item.src}
                  alt=""
                  decoding="async"
                  style={item.ratio ? { aspectRatio: item.ratio } : undefined}
                />
              ) : (
                <div key={i} className="hero__word" aria-hidden={i >= items.length}>
                  <span>{item.text}</span>
                </div>
              )
            )}
          </div>
        )}
        {status === "error" && <div className="hero__fallback">Images non disponibles</div>}
      </div>
      <div className="hero__content">
        <h1 ref={nameRef}>{home.name}</h1>
        <p className="eyebrow">{home.subtitle}</p>
      </div>
      <div className="hero__hint">↓</div>
      <Plane anchorRef={nameRef} mode="roam" zBehind={0} zFront={2} />
    </div>
  );
}
