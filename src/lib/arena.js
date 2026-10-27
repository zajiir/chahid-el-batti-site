const API = "https://api.are.na/v3";

// Cache mémoire partagé par toutes les pages : revenir sur Are.na ou
// l'accueil ne refait pas les mêmes requêtes pendant la session.
const cache = new Map();

function get(path) {
  if (!cache.has(path)) {
    const req = fetch(API + path).then((res) => {
      if (!res.ok) throw new Error(`Are.na ${res.status}`);
      return res.json();
    });
    req.catch(() => cache.delete(path));
    cache.set(path, req);
  }
  return cache.get(path);
}

export function fetchChannelInfo(slug) {
  return get(`/channels/${slug}`);
}

// Blocs du plus récent au plus ancien.
export async function fetchContents(slug, { page = 1, per = 24 } = {}) {
  const json = await get(
    `/channels/${slug}/contents?page=${page}&per=${per}&sort=created_at_desc`
  );
  return { blocks: json.data || [], hasMore: !!json.meta?.has_more_pages };
}

export function blockImage(block, size = "large") {
  const img = block?.image;
  if (!img) return null;
  return img[size]?.src || img.large?.src || img.medium?.src || img.src || null;
}

export function blockFullImage(block) {
  return block?.image?.src || blockImage(block);
}

export function blockText(block) {
  return block?.content?.plain?.trim() || "";
}
