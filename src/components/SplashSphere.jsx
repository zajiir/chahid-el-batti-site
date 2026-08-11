import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

// Marque de l'artiste (étoile + figure) — mêmes tracés que l'icône Accueil de
// la nav, recadrés sur leur boîte englobante réelle. Réutilisés ici pour que
// l'emblème au centre de la sphère soit rigoureusement identique au pictogramme.
const LOGO_VIEWBOX = "419 422 543 518";
const LOGO_PATHS = [
  "M737.28,929.61c-.7,2.85-2.28,9.48-4.96,10.35-6.38,2.09-10.01-3.75-10.31-9.04-.35-6.1-3.65-10.94-5.03-16.83l-2.7-11.46-4.06-35.38-7.41-55.82-3.12-26.04-2.18-12.98c-.86-5.16-.26-14.3-6.47-17l-36.36-2.33-26.66-9.69c-5.06-1.84-9.32-5.53-13.52-8.29-8.52-5.61-14.07-12.32-19.55-20.73l-7.49-11.51c-5.78-8.87-11.64-17.41-14.91-27.61-6.52-14.03-12.2-27.84-16-42.84l2.14-4.61c.51-1.1,3.73-.52,4.86.37l53.2,41.36,15.82,12.95,12.73,10.41,19.42,15.19c2.92,2.29,6.33-3.21,7.74-5.46l13.2-21.24c6.13-9.86,15.33-18.78,23.57-26.67l9.18-8.79,9.04-8.65-13.63-10.08c-4.98-3.68-11.55-6.58-15.62-11.43l-10.77-12.84c-5.62-6.7-9.01-15.73-13.49-23.43l-4.49-7.71-21.92-32.03,23.75-1.96,13.82,14.22c10.08,10.37,19.19,22.19,31.61,29.83l27.09,16.67,8,4.55c2.08,1.18,6.81,3.46,7.81,5.54,4.56,9.47,12.51,14.07,21.87,16.56l19.7,5.25,20.79,5.04c6.87,1.67,15.12,2.44,20.46,6.7l13.13,10.46,20.53,19,17.05,15.84c10.09,9.37,21.85,16.89,35.37,20.56l29.06,7.9c1.42.38,4.64,2.89,4.02,4.14s-3.39,4.11-4.77,4.24l-11.79,1.13-19.36.62-28.81.64c-5.16-3.57-10.4-4.63-16.05-4.64l-17.04-10.72c-19.07-12.41-38.77-22.53-59.38-32.39-4.4-2.1-7.09-2.97-11.11.87l-34.22,32.72c-3.74,3.57-9.26,6.95-11.48,11.3-4.94,9.67-3.7,19.66-.87,29.53.73,10.98,2.9,21.54,5.91,32.16l1.65,44.31c.33,8.88-1.77,18.26-2.06,27.32-.33,10.11-.48,20.47-3.25,30.21l-9.25,32.52-2.4,9.75Z",
  "M624.48,596.82l-2.32,12.37c-1.43,7.61-2.45,14.4-5.76,22.05-.91-6.9-1.18-13.8-.49-20.77l1.37-13.9,1.67-19.08,2.77-25.94,1.17-16.54.87-25.22-19.14-4.14-9.94-1.06-11.43-.57-14.49,1.03c3.54-4.03,7.09-4.02,11.54-5.67l32.71-12.14,11.32-4.51c2.44-5.82,4.1-13.18,4.03-20.05l-.11-9.63-1.72-14.91c-.94-8.19-5.6-12.96-5.2-13.39l2.35-2.51c.55-.58,1.96,2.5,1.95,3.26l31.81,48.24,33.31-4.82,14.92-3.08,24.68-4.09c1.69-.73,3.79-.26,1.79,1.15l-27.67,11.16c-8.62,3.48-16.8,8.81-23.98,14.67-8.01,6.54-7.54,16.69-1.24,23.87,16.84,19.24,61.96,35.74,88.96,43.71,5.55,1.64,10.55,3.67,14.97,7.18l-14.68-3.21-27.63-8.33-24.2-8.1-46.09-18.41c-4.27-1.7-9.2-4.31-13.77-2.98-10.2,2.97-15.66,10.88-20.39,19.62-5.08,9.39-5.93,19.8-7.76,30.46l-4.16,24.29Z",
  "M490.95,607.82c-5.22-.44-12.24,2.81-16.14,6.55-12.98,12.45-26.78,21.74-43.12,29.6-2.74,1.32-3.85,3.46-4.4,6.53-1.39-1.09-2.44-2.37-3.39-2.25l-6.33.77,51.4-36.49c2.69-1.91,6.26-7.86,8.14-10.57,8.65-12.5-5.57-36.79-18.89-48.92l-15.02-13.67-2.71-2.19c-.61-.5,1.43-2.72,2.05-2.22l2.77,2.22c8.83,7.07,19.05,12.9,26.02,21.79l16.95,21.6c1.09,1.39,3.62,4.01,5.07,3.55l6.6-2.08c8.16-2.57,16.03-5,23.55-9.31l28.35-16.28,1.2,1.51-24.6,17.13c-6.84,4.76-12.5,9.75-18.05,16.13-4.43,5.1-5.84,10.45-1.86,17.27,10.49,17.99,25.56,32.01,40.02,48.66-18.3-6.09-29.87-20.86-39.61-35.85-4.19-6.44-9.11-12.72-17.98-13.47Z",
  "M809.36,598.81l-1.77,10.58-17.55,5.14c-10.51,3.08-15.9-5.9-18.56-13.36-2.97-8.36-3.14-13.46,1.52-21.31,1.39-2.34,3.05-6.91,5.24-8.02,2.91-1.49,8.51-1.13,11.67-.68l10.83,1.53c4.56.64,11.61,1.69,14.2,5.92l-5.59,20.22Z",
  "M554.07,508.21c-12.52,3.64-24.41,7.8-39.26,10.4,7.76-4.77,16.81-6.89,26.2-9.35,4.01-1.05,7.49-1.64,13.06-1.05Z",
];

const WIRE_COLOR = 0x3f00ff; // var(--blue)
const LOGO_COLOR = 0x0b0a14; // var(--ink)
const IDLE_SPEED_Y = 0.32; // rad/s
const IDLE_SPEED_X = 0.05; // rad/s (léger tangage)
const DRAG_SENSITIVITY = 0.012;
const FRICTION = 1.6; // décroissance exponentielle de la vitesse après relâchement
const CLICK_MOVE_THRESHOLD = 6; // px — au-delà, on considère que c'est un drag, pas un clic

function buildLogoGroup() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}">${LOGO_PATHS.map(
    (d) => `<path d="${d}"/>`
  ).join("")}</svg>`;

  const loader = new SVGLoader();
  const data = loader.parse(svg);
  const material = new THREE.MeshBasicMaterial({
    color: LOGO_COLOR,
    side: THREE.DoubleSide,
  });

  const inner = new THREE.Group();
  data.paths.forEach((path) => {
    path.toShapes(true).forEach((shape) => {
      const geometry = new THREE.ShapeGeometry(shape);
      inner.add(new THREE.Mesh(geometry, material));
    });
  });
  inner.scale.set(1, -1, 1); // SVG (y vers le bas) -> Three.js (y vers le haut)

  const box = new THREE.Box3().setFromObject(inner);
  const center = box.getCenter(new THREE.Vector3());
  inner.position.sub(center);

  const size = box.getSize(new THREE.Vector3());
  const targetDiameter = 1.62; // légèrement inférieur au diamètre de la sphère (2)
  const scale = targetDiameter / Math.max(size.x, size.y);

  const outer = new THREE.Group();
  outer.add(inner);
  outer.scale.setScalar(scale);
  return outer;
}

function buildWireframeSphere() {
  const geometry = new THREE.IcosahedronGeometry(1, 3);
  const wireframe = new THREE.WireframeGeometry(geometry);
  const material = new THREE.LineBasicMaterial({
    color: WIRE_COLOR,
    transparent: true,
    opacity: 0.8,
  });
  return new THREE.LineSegments(wireframe, material);
}

export default function SplashSphere({ size = 150, onEnter }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 2.7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size);
    host.appendChild(renderer.domElement);

    const sphereGroup = new THREE.Group();
    sphereGroup.add(buildWireframeSphere());
    sphereGroup.add(buildLogoGroup());
    scene.add(sphereGroup);

    // --- État d'interaction : rotation idle + inertie du drag ---
    let angularVelY = IDLE_SPEED_Y;
    let angularVelX = IDLE_SPEED_X;
    let dragging = false;
    let dragMoved = false;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let flickVelX = 0;
    let flickVelY = 0;
    let pointerId = null;

    function onPointerDown(e) {
      dragging = true;
      dragMoved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      flickVelX = 0;
      flickVelY = 0;
      pointerId = e.pointerId;
      host.setPointerCapture(pointerId);
      host.style.cursor = "grabbing";
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dt = Math.max(now - lastT, 1) / 1000;

      if (!dragMoved && Math.hypot(e.clientX - lastX, dy) > CLICK_MOVE_THRESHOLD) {
        dragMoved = true;
      }
      // Le mouvement horizontal tourne autour de Y, le vertical autour de X.
      sphereGroup.rotation.y += dx * DRAG_SENSITIVITY;
      sphereGroup.rotation.x += dy * DRAG_SENSITIVITY;

      flickVelY = (dx * DRAG_SENSITIVITY) / dt;
      flickVelX = (dy * DRAG_SENSITIVITY) / dt;

      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    }

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      host.style.cursor = "grab";
      if (pointerId !== null && host.hasPointerCapture?.(pointerId)) {
        host.releasePointerCapture(pointerId);
      }
      if (dragMoved) {
        // Conserve l'élan du dernier geste, plafonné pour rester lisible.
        const maxVel = 14;
        angularVelY = THREE.MathUtils.clamp(flickVelY, -maxVel, maxVel);
        angularVelX = THREE.MathUtils.clamp(flickVelX, -maxVel, maxVel);
      } else if (typeof onEnter === "function") {
        onEnter();
      }
    }

    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerup", endDrag);
    host.addEventListener("pointercancel", endDrag);

    let raf = 0;
    let prevT = performance.now();

    function animate() {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - prevT) / 1000, 0.05);
      prevT = now;

      if (!dragging) {
        sphereGroup.rotation.y += angularVelY * dt;
        sphereGroup.rotation.x += angularVelX * dt;
        // La vitesse décroît vers la rotation idle (jamais vers zéro complet).
        const decay = Math.exp(-FRICTION * dt);
        angularVelY = IDLE_SPEED_Y + (angularVelY - IDLE_SPEED_Y) * decay;
        angularVelX = IDLE_SPEED_X + (angularVelX - IDLE_SPEED_X) * decay;
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", endDrag);
      host.removeEventListener("pointercancel", endDrag);
      host.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj) => {
        obj.geometry?.dispose?.();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material?.dispose?.();
      });
    };
  }, [size, onEnter]);

  return (
    <div
      ref={hostRef}
      className="splash-sphere"
      style={{ width: size, height: size }}
      role="button"
      tabIndex={0}
      aria-label="Entrer sur le site"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEnter?.();
        }
      }}
    />
  );
}
