import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Force l'écoute en IPv4 : sur certaines machines Windows, Node.js
    // résout "localhost" en IPv6 (::1) uniquement, ce qui rend le serveur
    // injoignable via http://localhost:5173 (connexion refusée).
    host: "127.0.0.1",
  },
});
