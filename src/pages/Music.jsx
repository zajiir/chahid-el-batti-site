import { useEffect, useState } from "react";
import music from "../content/music.json";

const { trackUrl: TRACK_URL, trackTitle: TRACK_TITLE, platforms: PLATFORMS } = music;

export default function Music() {
  const [cover, setCover] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(TRACK_URL)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.thumbnail_url) setCover(data.thumbnail_url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div
        className="music-cover-bg"
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      />
      <div className="page page--narrow">
        <div className="page-head">
          <span className="eyebrow">03 / MUSIC</span>
          <h1>Music</h1>
        </div>

        <h2 className="music__track-title">{TRACK_TITLE}</h2>
        <div className="music__player">
          <iframe
            title={`${TRACK_TITLE} (SoundCloud)`}
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
              TRACK_URL
            )}&color=%233f00ff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
          />
        </div>

        <hr className="rule" style={{ margin: "2.5rem 0" }} />

        <h2 className="music__section-title">Plateformes</h2>
        <div className="platforms">
          {PLATFORMS.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener" className="platform">
              <strong>{p.name}</strong>
              <span>{p.handle}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
