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

// --- Sélection qui change toutes les deux semaines (bandeau de l'accueil) ---

const DAY = 24 * 60 * 60 * 1000;
const PERIOD_EPOCH = Date.UTC(2026, 10, 2); // lundi 2 novembre 2026 : un lundi sur deux

// Numéro de la quinzaine en cours : le même pour tous les visiteurs.
export function fortnight(now = Date.now()) {
  return Math.floor((now - PERIOD_EPOCH) / (14 * DAY));
}

// Petit générateur pseudo-aléatoire reproductible (même graine = même suite).
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// `slices` tranches de `per` blocs tirées dans tout l'historique du channel
// (ordre chronologique : ajouter des blocs ne décale pas les tranches en cours
// de quinzaine). Toutes les deux semaines, d'autres tranches sont tirées.
export async function fetchFortnightBlocks(slug, { slices = 2, per = 50 } = {}) {
  const head = await get(`/channels/${slug}/contents?per=1&sort=created_at_asc`);
  // Pages complètes seulement : la dernière, partielle, donnerait une tranche trop courte.
  const pages = Math.max(1, Math.floor((head.meta?.total_count || 0) / per));
  const period = fortnight();
  const rand = seededRandom(period * 7919 + 17);
  const picked = [];
  while (picked.length < Math.min(slices, pages)) {
    const page = 1 + Math.floor(rand() * pages);
    if (!picked.includes(page)) picked.push(page);
  }
  const results = await Promise.all(
    picked.map((page) => get(`/channels/${slug}/contents?page=${page}&per=${per}&sort=created_at_asc`))
  );
  return { blocks: results.flatMap((r) => r.data || []), rand };
}
