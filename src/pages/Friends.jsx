import friends from "../content/friends.json";
import { useLang } from "../lib/i18n";

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Amis / collaborations et articles, ajoutés depuis le CMS. Tant que les deux
// listes sont vides, la page garde son message d'attente.
export default function Friends() {
  const { t, tr } = useLang();
  const list = friends.friends || [];
  const articles = friends.articles || [];
  const intro = tr(friends, "intro");

  return (
    <div className={"page " + (list.length || articles.length ? "page--wide" : "page--narrow")}>
      <div className="page-head">
        <span className="eyebrow">04 / FRIENDS (TOGETHER)</span>
        <h1>{friends.heading}</h1>
      </div>

      {intro && <p className="friends__intro">{intro}</p>}

      {list.length > 0 && (
        <div className="friends-grid">
          {list.map((f, i) => {
            const role = tr(f, "role");
            const Tag = f.url ? "a" : "div";
            const linkProps = f.url ? { href: f.url, target: "_blank", rel: "noopener" } : {};
            return (
              <Tag key={`${f.name}-${i}`} className="friend" {...linkProps}>
                <div className="friend__photo">
                  {f.image ? (
                    <img src={f.image} alt={f.name} loading="lazy" decoding="async" />
                  ) : (
                    <span aria-hidden="true">{initials(f.name)}</span>
                  )}
                </div>
                <div className="friend__name">{f.name}</div>
                {role && <div className="friend__role">{role}</div>}
                {f.url && <div className="friend__cta">{t("friends.visit")}</div>}
              </Tag>
            );
          })}
        </div>
      )}

      {articles.length > 0 && (
        <section className="press">
          <h2 className="music__section-title">{t("friends.press")}</h2>
          <div className="press-grid">
            {articles.map((a) => (
              <a key={a.url} className="press-card" href={a.url} target="_blank" rel="noopener">
                {a.image && (
                  <div className="press-card__img">
                    <img src={a.image} alt="" loading="lazy" decoding="async" />
                  </div>
                )}
                <div className="press-card__body">
                  <span className="press-card__source">
                    {[a.source, tr(a, "date")].filter(Boolean).join(" · ")}
                  </span>
                  <h3 className="press-card__title">{a.title}</h3>
                  {tr(a, "excerpt") && <p className="press-card__excerpt">{tr(a, "excerpt")}</p>}
                  <span className="press-card__cta">{t("friends.read")}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {!list.length && !articles.length && (
        <div className="friends__placeholder">
          <span className="friends__glyph">19</span>
          <p>{tr(friends, "message")}</p>
        </div>
      )}
    </div>
  );
}
