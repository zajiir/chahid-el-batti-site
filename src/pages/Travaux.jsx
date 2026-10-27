import { useMemo, useState } from "react";
import WorksStrip from "../components/WorksStrip";
import Lightbox from "../components/Lightbox";
import { CATEGORIES, getWorks } from "../lib/travaux";

export default function Travaux() {
  const [active, setActive] = useState("photos");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const works = getWorks(active);
  const lightboxImages = useMemo(
    () => works.map((w) => ({ src: w.large, fallback: w.original, caption: w.caption })),
    [works]
  );

  return (
    <div className="page page--wide">
      <div className="page-head">
        <span className="eyebrow">01 / TRAVAUX</span>
        <h1>Travaux</h1>
      </div>

      <div className="sub-nav">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={"tab-btn" + (active === c.id ? " active" : "")}
            onClick={() => {
              setActive(c.id);
              setLightboxIndex(null);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <WorksStrip works={works} onOpen={setLightboxIndex} />

      <Lightbox
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
