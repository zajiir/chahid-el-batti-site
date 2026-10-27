import about from "../content/about.json";
import { useLang } from "../lib/i18n";

// "06 29 41 02 17" -> "+33629410217" : le lien d'appel marche aussi depuis l'étranger.
function internationalPhone(phone) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("0") ? `+33${digits.slice(1)}` : digits;
}

// Affichage anglais : "+33 6 29 41 02 17".
function displayPhone(phone, lang) {
  const p = phone.trim();
  if (lang !== "en" || !/^0\d( ?\d{2}){4}$/.test(p)) return phone;
  return `+33 ${p.slice(1)}`;
}

export default function About() {
  const { lang, tr } = useLang();
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
        <div>
          <a href={`tel:${internationalPhone(about.phone)}`}>{displayPhone(about.phone, lang)}</a>
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
