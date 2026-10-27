import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchChannelInfo, fetchContents, blockImage } from "../lib/arena";
import arena from "../content/arena.json";
import { useLang } from "../lib/i18n";

const CHANNELS = arena.channels;

export default function Arena() {
  const { t, tr } = useLang();
  const [details, setDetails] = useState({});

  useEffect(() => {
    let cancelled = false;
    CHANNELS.forEach((c) => {
      Promise.all([
        fetchChannelInfo(c.slug).catch(() => null),
        fetchContents(c.slug, { per: 12 }).catch(() => null),
      ]).then(([info, contents]) => {
        if (cancelled) return;
        // Les vraies images d'abord : les blocs "Link" n'ont souvent qu'une
        // capture de page web, gardés seulement en dernier recours.
        const blocks = contents?.blocks || [];
        const covers = [
          ...blocks.filter((b) => b.type !== "Link"),
          ...blocks.filter((b) => b.type === "Link"),
        ]
          .map((b) => blockImage(b, "medium"))
          .filter(Boolean)
          .slice(0, 3);
        setDetails((prev) => ({
          ...prev,
          [c.slug]: {
            title: info?.title?.trim(),
            description: info?.description?.plain?.trim(),
            count: info?.counts?.contents,
            covers,
          },
        }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page page--wide">
      <div className="page-head">
        <span className="eyebrow">03 / ARE.NA</span>
        <h1>Are.na</h1>
      </div>
      <a className="btn" href={arena.profile} target="_blank" rel="noopener">
        {t("arena.profile")}
      </a>

      <div className="arena-grid">
        {CHANNELS.map((c, i) => {
          const d = details[c.slug];
          const note = tr(c, "note") || d?.description;
          return (
            <Link className="arena-card" to={`/arena/${c.slug}`} key={c.slug}>
              <div className={"arena-card__covers" + (d ? "" : " is-loading")}>
                {d?.covers.length ? (
                  d.covers.map((src, j) => <img key={j} src={src} alt="" loading="lazy" decoding="async" />)
                ) : (
                  <span className="arena-card__index">{String(i + 1).padStart(2, "0")}</span>
                )}
              </div>
              <div className="arena-card__body">
                <div className="arena-card__title">{d?.title || c.title || c.slug}</div>
                {note && <div className="arena-card__note">{note}</div>}
                <div className="arena-card__cta">
                  {d?.count !== undefined ? t("arena.blocks", { n: d.count }) : ""}
                  {t("arena.browse")}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
