import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchChannel, blockImageUrl, blockFullImageUrl } from "../lib/arena";
import Lightbox from "../components/Lightbox";

const CHANNELS = [
  { slug: "going-through-life", label: "Going Through Life" },
  { slug: "books-wybua5xvvoa", label: "Books" },
  { slug: "poem-hg0zs9crmwa", label: "Poem" },
];
const PER_PAGE = 24;

export default function ArenaChannel() {
  const { slug } = useParams();
  const [title, setTitle] = useState(slug);
  const [blocks, setBlocks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    setBlocks([]);
    setHasMore(true);
    setTitle(slug);
    loadPage(1, true);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function loadPage(p, replace = false) {
    setLoading(true);
    fetchChannel(slug, { page: p, per: PER_PAGE })
      .then((data) => {
        if (data.title) setTitle(data.title.trim());
        const newBlocks = data.contents || [];
        setBlocks((prev) => (replace ? newBlocks : [...prev, ...newBlocks]));
        setHasMore(newBlocks.length === PER_PAGE);
        setPage(p);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }

  const others = CHANNELS.filter((c) => c.slug !== slug);

  return (
    <div className="page page--wide">
      <Link className="btn" to="/arena">
        ← Tous les channels
      </Link>
      <h1 className="arena-detail__title">{title}</h1>

      <div className="arena-detail__switch">
        {others.map((c) => (
          <Link key={c.slug} className="chip" to={`/arena/${c.slug}`}>
            {c.label} ↗
          </Link>
        ))}
      </div>

      <div className="arena-blocks">
        {blocks.map((block) => (
          <BlockCard key={block.id} block={block} onImageClick={setLightboxSrc} />
        ))}
      </div>

      {loading && <p className="arena-loading">Chargement…</p>}

      {!loading && blocks.length === 0 && (
        <p className="arena-loading">Aucun contenu trouvé pour ce channel.</p>
      )}

      {!loading && hasMore && blocks.length > 0 && (
        <button className="btn btn--accent arena-more" onClick={() => loadPage(page + 1)}>
          Charger plus
        </button>
      )}

      <Lightbox
        images={lightboxSrc ? [{ src: lightboxSrc }] : []}
        index={lightboxSrc ? 0 : null}
        onClose={() => setLightboxSrc(null)}
      />
    </div>
  );
}

function BlockCard({ block, onImageClick }) {
  // Channel imbriqué : Are.na permet d'organiser des channels dans des
  // channels — on les rend navigables directement sur le site.
  if (block.class === "Channel" && block.slug) {
    return (
      <Link className="arena-block arena-block--channel" to={`/arena/${block.slug}`}>
        <div className="arena-block__title">↳ {block.title || block.slug}</div>
        <div className="arena-block__meta">Channel — Parcourir ↗</div>
      </Link>
    );
  }

  const img = blockImageUrl(block);
  if (img) {
    return (
      <button
        className="arena-block arena-block--image"
        onClick={() => onImageClick(blockFullImageUrl(block))}
      >
        <img src={img} alt={block.title || ""} loading="lazy" />
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

  const text = block.content || block.description || "";
  return (
    <div className="arena-block arena-block--text">
      <div className="arena-block__title">{block.title || "Sans titre"}</div>
      {text && <p>{text.length > 220 ? text.slice(0, 220) + "…" : text}</p>}
    </div>
  );
}
