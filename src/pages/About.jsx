import about from "../content/about.json";
import { useLang } from "../lib/i18n";

export default function About() {
  const { tr } = useLang();
  return (
    <div className="page page--narrow">
      <div className="page-head">
        <span className="eyebrow">06 / ABOUT</span>
        <h1>About</h1>
      </div>

      <div className="about__contact">
        <div>
          <a href={`mailto:${about.email}`}>{about.email}</a>
        </div>
        <div>{tr(about, "location")}</div>
      </div>

      <div className="about__bio">
        {tr(about, "bio").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="about__social">
        {about.social.map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener">
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}
