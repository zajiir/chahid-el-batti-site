import { useMemo, useState } from "react";
import KineticGallery from "../components/KineticGallery";
import Lightbox from "../components/Lightbox";
import { shuffle } from "../lib/dailyShuffle";
import { getCaption } from "../lib/captions";

const photoModules = import.meta.glob("../assets/travaux/photos/*", {
  eager: true,
  query: "?url",
  import: "default",
});
const sculptureModules = import.meta.glob("../assets/travaux/sculptures/*", {
  eager: true,
  query: "?url",
  import: "default",
});
const graphiqueModules = import.meta.glob("../assets/travaux/graphiques/*", {
  eager: true,
  query: "?url",
  import: "default",
});

const CATEGORIES = [
  { id: "photos", label: "Photos", modules: photoModules },
  { id: "sculptures", label: "Sculptures / Installations", modules: sculptureModules },
  { id: "graphiques", label: "Arts graphiques", modules: graphiqueModules },
];

// "../assets/travaux/sculptures/DSC_3451.jpg" -> "DSC_3451.jpg"
function filenameFromPath(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}

function buildImages(category) {
  return Object.entries(category.modules).map(([path, src]) => {
    const filename = filenameFromPath(path);
    return { src, caption: getCaption(category.id, filename) };
  });
}

export default function Travaux() {
  const [active, setActive] = useState("photos");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === active);
    return shuffle(buildImages(cat));
  }, [active]);

  return (
    <div className="page page--wide">
      <div className="page-head">
        <span className="eyebrow">05 / TRAVAUX</span>
        <h1>Travaux</h1>
      </div>
      <p className="travaux__hint">
        Molette, glisser, ou ← → — la vitesse pilote le flou. Cliquer une image
        pour l'agrandir.
      </p>

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

      <KineticGallery images={images} onImageClick={setLightboxIndex} />

      <Lightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
