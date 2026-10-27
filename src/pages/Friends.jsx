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

// Amis / collaborations, ajoutés depuis le CMS. Tant que la liste est vide,
// la page garde son message d'attente.
export default function Friends() {
  const { t, tr } = useLang();
  const list = friends.friends || [];
  const intro = tr(friends, "intro");

  return (
    <div className={"page " + (list.length ? "page--wide" : "page--narrow")}>
      <div className="page-head">
        <span className="eyebrow">04 / FRIENDS (TOGETHER)</span>
        <h1>{friends.heading}</h1>
      </div>

      {list.length ? (
        <>
          {intro && <p className="friends__intro">{intro}</p>}
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
        </>
      ) : (
        <div className="friends__placeholder">
          <span className="friends__glyph">19</span>
          <p>{tr(friends, "message")}</p>
        </div>
      )}
    </div>
  );
}
