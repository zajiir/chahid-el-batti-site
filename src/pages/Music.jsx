import { useState } from "react";
import music from "../content/music.json";

const { release: RELEASE, video: VIDEO, platforms: PLATFORMS } = music;

function formatDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// YouTube (watch, youtu.be, shorts), Vimeo, ou lien direct vers un fichier vidéo.
function parseVideo(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return {
      kind: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`,
      poster: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`,
    };
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  return { kind: "file", src: url };
}

function VideoSlot({ url, title, fallbackPoster }) {
  const [playing, setPlaying] = useState(false);
  const video = parseVideo(url);

  if (!video) {
    return (
      <div className="video-slot video-slot--empty" style={{ backgroundImage: `url(${fallbackPoster})` }}>
        <span>Vidéo — bientôt</span>
      </div>
    );
  }

  if (video.kind === "file") {
    return (
      <div className="video-slot">
        <video src={video.src} poster={fallbackPoster} controls playsInline preload="none" />
      </div>
    );
  }

  // Le lecteur (lourd) n'est chargé qu'au clic : la page reste légère.
  return (
    <div className="video-slot">
      {playing ? (
        <iframe
          src={video.src}
          title={title || "Vidéo"}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      ) : (
        <button
          className="video-slot__poster"
          style={{ backgroundImage: `url(${video.poster || fallbackPoster})` }}
          onClick={() => setPlaying(true)}
          aria-label={`Lire la vidéo${title ? ` : ${title}` : ""}`}
        >
          <span className="video-slot__play">▶</span>
        </button>
      )}
    </div>
  );
}

export default function Music() {
  const poem = (RELEASE.poem || "").split("\n");

  return (
    <>
      <div className="music-cover-bg" style={{ backgroundImage: `url(${RELEASE.cover})` }} />
      <div className="page page--music">
        <div className="page-head">
          <span className="eyebrow">02 / MUSIC</span>
          <h1>Music</h1>
        </div>

        <section className="release">
          <a className="release__cover" href={RELEASE.bandcampUrl} target="_blank" rel="noopener">
            <img src={RELEASE.cover} alt={`Pochette — ${RELEASE.title}`} width="1200" height="1200" />
          </a>

          <div className="release__info">
            <span className="release__tag">Out now — {formatDate(RELEASE.date)}</span>
            <h2 className="release__title">{RELEASE.title}</h2>
            <div className="release__artist">{RELEASE.artist}</div>

            <div className="release__player">
              <iframe
                title={`${RELEASE.title} (Bandcamp)`}
                src={`https://bandcamp.com/EmbeddedPlayer/album=${RELEASE.bandcampAlbumId}/size=large/bgcol=ffffff/linkcol=3f00ff/artwork=none/tracklist=true/transparent=true/`}
                seamless
                loading="lazy"
              />
            </div>

            <a className="btn btn--accent" href={RELEASE.bandcampUrl} target="_blank" rel="noopener">
              Acheter / écouter sur Bandcamp ↗
            </a>
          </div>
        </section>

        <section className="release__poem">
          {poem.map((line, i) =>
            line.trim() ? (
              <p key={i} dir="auto">
                {line}
              </p>
            ) : (
              <br key={i} />
            )
          )}
          {RELEASE.moreUrl && (
            <a className="release__more" href={RELEASE.moreUrl} target="_blank" rel="noopener">
              {RELEASE.moreUrl.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </section>

        <section className="release__video">
          <h2 className="music__section-title">{VIDEO.title || "Vidéo"}</h2>
          <VideoSlot url={VIDEO.url} title={VIDEO.title} fallbackPoster={RELEASE.cover} />
        </section>

        {RELEASE.credits && (
          <section className="release__credits">
            <h2 className="music__section-title">Crédits</h2>
            <p>{RELEASE.credits}</p>
          </section>
        )}

        <section>
          <h2 className="music__section-title">Plateformes</h2>
          <div className="platforms">
            {PLATFORMS.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener" className="platform">
                <strong>{p.name}</strong>
                <span>{p.handle}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
