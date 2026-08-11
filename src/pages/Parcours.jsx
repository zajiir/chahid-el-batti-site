import parcours from "../content/parcours.json";

const SECTIONS = parcours.sections;

export default function Parcours() {
  return (
    <div className="page page--narrow">
      <div className="page-head">
        <span className="eyebrow">06 / PARCOURS</span>
        <h1>Parcours</h1>
      </div>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="section-title">{section.title}</div>
          {section.items.map((item, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-item__year">{item.year}</div>
              <div>
                <div className="timeline-item__title">{item.title}</div>
                <div className="timeline-item__detail">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
