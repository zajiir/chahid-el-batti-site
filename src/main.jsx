import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyDayNightAttribute } from "./lib/dayNight";
import "./index.css";

// Posé avant le premier rendu pour éviter un flash de la mauvaise police.
applyDayNightAttribute();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
