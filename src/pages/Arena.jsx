import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchChannel, blockImageUrl } from "../lib/arena";

const CHANNELS = [
  { slug: "going-through-life", note: "Images en flux" },
  { slug: "books-wybua5xvvoa", note: "Références & lectures" },
  { slug: "poem-hg0zs9crmwa", note: "Textes & poésie" },
];

export default function Arena() {
  const [cards, setCards] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      CHANNELS.map((c) =>
        fetchChannel(c.slug, { per: 20 }).catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      setCards(
        results.map((data, i) => ({
          ...CHANNELS[i],
          title: data?.title?.trim() || CHANNELS[i].slug,
          length: data?.length,
          cover: data ? data.contents?.map(blockImageUrl).find(Boolean) : null,
        }))
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const list = cards || CHANNELS;

  return (
    <div className="page page--wide">
      <div className="page-head">
        <span className="eyebrow">02 / ARE.NA</span>
        <h1>Are.na</h1>
      </div>
      <a
        className="btn"
        href="https://www.are.na/zaji-idoo/channels"
        target="_blank"
        rel="noopener"
      >
        Tous les channels ↗
      </a>

      <div className="arena-grid">
        {list.map((c) => (
          <Link className="arena-card" to={`/arena/${c.slug}`} key={c.slug}>
            {c.cover ? (
              <img className="arena-card__img" src={c.cover} alt="" loading="lazy" />
            ) : (
              <div className="arena-card__img arena-card__img--empty" />
            )}
            <div className="arena-card__body">
              <div className="arena-card__title">{c.title || c.slug}</div>
              <div className="arena-card__note">{c.note}</div>
              <div className="arena-card__cta">
                {c.length !== undefined ? `${c.length} blocs — ` : ""}
                Parcourir ↗
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
