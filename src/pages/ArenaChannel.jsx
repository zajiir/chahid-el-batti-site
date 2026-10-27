import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchChannelInfo, fetchContents, blockImage, blockFullImage, blockText } from "../lib/arena";
import Lightbox from "../components/Lightbox";
import arena from "../content/arena.json";

const PER_PAGE = 24;

function isVideo(block) {
  return block.attachment?.content_type?.startsWith("video/");
}

export default function ArenaChannel() {
  const { slug } = useParams();
  const known = arena.channels.find((c) => c.slug === slug);
  const [title, setTitle] = useState(known?.title || slug);
  const [blocks, setBlocks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setBlocks([]);
    setPage(1);
    setLightboxIndex(null);
    setTitle(known?.title || slug);
    setLoading(true);
    fetchChannelInfo(slug)
      .then((info) => !cancelled && info.title && setTitle(info.title.trim()))
      .catch(() => {});
    fetchContents(slug, { page: 1, per: PER_PAGE })
      .then((res) => {
        if (cancelled) return;
        setBlocks(res.blocks);
        setHasMore(res.hasMore);
      })
      .catch(() => !cancelled && setHasMore(false))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function loadMore() {
    const next = page + 1;
    setLoading(true);
    fetchContents(slug, { page: next, per: PER_PAGE })
      .then((res) => {
        setBlocks((prev) => [...prev, ...res.blocks]);
        setHasMore(res.hasMore);
        setPage(next);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }

  // Tous les blocs visuels du channel, navigables un par un dans la lightbox.
  const media = useMemo(() => {
    const list = [];
    const indexById = {};
    for (const b of blocks) {
      if (b.type === "Channel" || !blockImage(b)) continue;
      indexById[b.id] = list.length;
      list.push({
        src: blockImage(b, "large"),
        fallback: blockFullImage(b),
        video: isVideo(b) ? b.attachment.url : undefined,
      });
    }
    return { list, indexById };
  }, [blocks]);

  const others = arena.channels.filter((c) => c.slug !== slug);

  return (
    <div className="page page--wide">
      <Link className="btn" to="/arena">
        ← Tous les channels
      </Link>
      <h1 className="arena-detail__title">{title}</h1>

      <div className="arena-detail__switch">
        {others.map((c) => (
          <Link key={c.slug} className="chip" to={`/arena/${c.slug}`}>
            {c.title} ↗
          </Link>
        ))}
      </div>

      <div className="arena-blocks">
        {blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            onOpen={() => setLightboxIndex(media.indexById[block.id])}
          />
        ))}
      </div>

      {loading && <p className="arena-loading">Chargement…</p>}

      {!loading && blocks.length === 0 && (
        <p className="arena-loading">Aucun contenu trouvé pour ce channel.</p>
      )}

      {!loading && hasMore && (
        <button className="btn btn--accent arena-more" onClick={loadMore}>
          Charger plus
        </button>
      )}

      <Lightbox
        images={media.list}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}

function BlockCard({ block, onOpen }) {
  // Channel imbriqué : Are.na permet d'organiser des channels dans des
  // channels — on les rend navigables directement sur le site.
  if (block.type === "Channel" && block.slug) {
    return (
      <Link className="arena-block arena-block--channel" to={`/arena/${block.slug}`}>
        <div className="arena-block__title">↳ {block.title?.trim() || block.slug}</div>
        <div className="arena-block__meta">Channel — Parcourir ↗</div>
      </Link>
    );
  }

  const img = blockImage(block, "medium");
  if (img) {
    return (
      <button className="arena-block arena-block--image" onClick={onOpen}>
        <img src={img} alt={block.title || ""} loading="lazy" decoding="async" />
        {isVideo(block) && <span className="arena-block__badge">▶</span>}
      </button>
    );
  }

  if (block.source?.url) {
    return (
      <a
        className="arena-block arena-block--link"
        href={block.source.url}
        target="_blank"
        rel="noopener"
      >
        <div className="arena-block__title">{block.title || block.source.url}</div>
        <div className="arena-block__meta">Lien ↗</div>
      </a>
    );
  }

  const text = blockText(block) || block.description?.plain || "";
  return (
    <div className="arena-block arena-block--text">
      {block.title && <div className="arena-block__title">{block.title}</div>}
      {text && <p>{text.length > 280 ? text.slice(0, 280) + "…" : text}</p>}
    </div>
  );
}
