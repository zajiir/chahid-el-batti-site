import parcours from "../content/parcours.json";
import { useLang } from "../lib/i18n";

const SECTIONS = parcours.sections;

export default function Parcours() {
  const { t, tr } = useLang();

  return (
    <div className="page page--narrow">
      <div className="page-head">
        <span className="eyebrow">{t("cv.eyebrow")}</span>
        <h1>{t("cv.title")}</h1>
      </div>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="section-title">{tr(section, "title")}</div>
          {section.items.map((item, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-item__year">{item.year}</div>
              <div>
                <div className="timeline-item__title">{tr(item, "title")}</div>
                <div className="timeline-item__detail">{tr(item, "detail")}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
