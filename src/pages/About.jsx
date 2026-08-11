import about from "../content/about.json";

export default function About() {
  return (
    <div className="page page--narrow">
      <div className="page-head">
        <span className="eyebrow">04 / ABOUT</span>
        <h1>About</h1>
      </div>

      <div className="about__contact">
        <div>
          <a href={`mailto:${about.email}`}>{about.email}</a>
        </div>
        <div>
          <a href={`tel:${about.phone.replace(/\s+/g, "")}`}>{about.phone}</a>
        </div>
        <div>{about.location}</div>
      </div>

      <div className="about__bio">
        {about.bio.map((paragraph, i) => (
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
