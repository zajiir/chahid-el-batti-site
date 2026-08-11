const API = "https://api.are.na/v2";

// L'endpoint /channels/:slug (sans /contents) renvoie à la fois les
// métadonnées (title, length) ET les blocs paginés — un seul appel suffit.
export async function fetchChannel(slug, { page = 1, per = 20 } = {}) {
  const res = await fetch(`${API}/channels/${slug}?page=${page}&per=${per}`);
  if (!res.ok) throw new Error(`Are.na ${res.status}`);
  return res.json();
}

export function blockImageUrl(block) {
  return (
    block?.image?.large?.url ||
    block?.image?.medium?.url ||
    block?.image?.thumb?.url ||
    null
  );
}

export function blockFullImageUrl(block) {
  return block?.image?.original?.url || blockImageUrl(block);
}
