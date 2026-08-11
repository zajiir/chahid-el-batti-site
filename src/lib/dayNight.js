// Rotation typographique jour/nuit : Electric Blue le jour, FT88 la nuit.
// Basé sur l'heure locale du visiteur (pas de fuseau serveur à gérer, c'est
// un site statique). Plage ajustable ici si besoin.
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 19;

export function isDaytime(date = new Date()) {
  const h = date.getHours();
  return h >= DAY_START_HOUR && h < DAY_END_HOUR;
}

export function applyDayNightAttribute() {
  document.documentElement.dataset.daytime = isDaytime() ? "day" : "night";
}
