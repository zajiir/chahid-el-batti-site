import { useEffect, useState } from "react";
import { fetchChannel, blockImageUrl } from "../lib/arena";
import { seededShuffle, todaySeed } from "../lib/dailyShuffle";
import home from "../content/home.json";

const CHANNEL = "going-through-life";
const DAILY_COUNT = 10;

export default function Home() {
  const [imgs, setImgs] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    let cancelled = false;
    fetchChannel(CHANNEL, { per: 50 })
      .then((data) => {
        if (cancelled) return;
        const all = (data.contents || [])
          .map(blockImageUrl)
          .filter(Boolean);
        if (!all.length) {
          setStatus("error");
          return;
        }
        const daily = seededShuffle(all, todaySeed()).slice(0, DAILY_COUNT);
        setImgs(daily);
        setStatus("ok");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const loop = imgs.length ? [...imgs, ...imgs] : [];

  return (
    <div className="hero">
      <div className="hero__marquee">
        {status === "ok" && (
          <div className="hero__track">
            {loop.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
        )}
        {status === "error" && <div className="hero__fallback">Images non disponibles</div>}
      </div>
      <div className="hero__content">
        <h1>{home.name}</h1>
        <p className="eyebrow">{home.subtitle}</p>
      </div>
      <div className="hero__hint">↓</div>
    </div>
  );
}
