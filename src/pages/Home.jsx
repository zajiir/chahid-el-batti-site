import { useEffect, useRef, useState } from "react";
import { fetchContents, fetchFortnightBlocks, blockImage, blockText, shuffle } from "../lib/arena";
import Plane from "../components/Plane";
import HeroMarquee from "../components/HeroMarquee";
import HomeNotice from "../components/HomeNotice";
import { useLang } from "../lib/i18n";
import home from "../content/home.json";

const CHANNEL = "going-through-life";
const MAX_IMAGES = 90;
const MAX_WORDS = 14;
const WORD_EVERY = 5; // un mot glissé toutes les 5 images
const MAX_WORD_LENGTH = 90;

// Images + courts textes ("mots") du channel, entremêlés.
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
  const { t, tr } = useLang();

  useEffect(() => {
    let cancelled = false;
    // 100 blocs tirés dans tout le channel, renouvelés toutes les deux
    // semaines (même sélection pour tous) ; à défaut, les derniers ajouts.
    fetchFortnightBlocks(CHANNEL, { slices: 2, per: 50 })
      .then(({ blocks, rand }) => shuffle(blocks, rand))
      .catch(() => fetchContents(CHANNEL, { per: 48 }).then((r) => r.blocks))
      .then((blocks) => {
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

  return (
    <div className="hero">
      {status === "ok" && <HeroMarquee items={items} />}
      {status === "error" && (
        <div className="hero__marquee">
          <div className="hero__fallback">{t("home.noImages")}</div>
        </div>
      )}
      <div className="hero__content">
        <h1 ref={nameRef}>{home.name}</h1>
        <p className="eyebrow">{tr(home, "subtitle")}</p>
      </div>
      <div className="hero__hint">↓</div>
      <Plane anchorRef={nameRef} mode="roam" size={36} zBehind={0} zFront={2} />
      <HomeNotice />
    </div>
  );
}
