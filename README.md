# WebCloner AI 🌐🤖
### *Intelligent Website Migration & Frontend Replicator*

[![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-00f0ff?style=for-the-badge&logo=three.js)](https://threejs.org)
[![Licence](https://img.shields.io/badge/License-MIT-00ffaa?style=for-the-badge)](LICENSE)

**WebCloner AI** is a futuristic, highly interactive single-page web application designed for frontend developers, designers, and site owners to analyze, reconstruct, and back up websites. Users specify an authorized domain URL, and the application simulates the complete replication pipeline—discovering DOM hierarchies, resolving style rules, visualising assets, and packaging a deployable clean codebase.

*Designed with an immersive Apple Vision Pro-inspired glassmorphism interface, Tron-style perspective floor grid, and dynamic real-time WebGL visualizers.*

---

## 🌟 Interactive Experience & Features

1. **AI Landing Page & URL Scanner**
   * Neon search bar with laser sweep scanning indicators.
   * Prompts confirming ownership/authorization compliance prior to crawling.

2. **Time-Travel Replay Timeline (Cinema Playback)**
   * A persistent scrubber footer with controls: Play/Pause, Rewind, Fast Forward, and variable speeds (1.0x, 1.5x, 2.5x).
   * Scrubbing or playing automatically updates all scanner components, checkboxes, and core rotation speeds step-by-step through: `Scan` ➔ `Download` ➔ `Reconstruct` ➔ `Validate` ➔ `Deploy`.

3. **Three.js Background & Hologram Core**
   * **Neural Network Background**: Renders 180 drifting vector particles in WebGL with dynamic connection segments.
   * **AI Core Sphere**: A rotating, wireframe 3D sphere that speeds up and glows matching chosen themes, expanding particles upon task completion.

4. **Web Graph Canvas (Draggable Node Web)**
   * Interactive 2D Canvas mapping page structures (Home, About, Pricing, etc.).
   * Drag nodes to adjust layout physics; data pulses flow along connecting lines representing asset streaming.
   * Supports **Mouse Wheel Zooming** and **Empty Space Click-Dragging** to pan the workspace layout!

5. **Asset Galaxy (Orbital Physics)**
   * Asset files (HTML, CSS, JS, Images, Fonts) float as orbital bodies revolving around a center core gravity.
   * Hover over planets to inspect details (size, path, and validation flags).

6. **Live synchronized Split Preview**
   * Compare Original vs. Reconstructed site layout side-by-side.
   * Synced scroll mirroring: scrolling one panel shifts the other in real-time.
   * Moves on mouse positions to tilt both simulated browser windows in 3D perspective space.
   * Interactive "Diff" console displays code changes overlay.

7. **AI Assistant Orb**
   * Clickable breathing orb opening an interactive console. Select suggestion chips or type debugger questions regarding styles, layout, and script optimizations.

8. **AI Package ZIP Generator (JSZip)**
   * Generates a fully functional workspace download bundle (`index.html`, `css/style.css`, `css/animations.css`, `js/app.js`, and `assets/logo.svg`) directly inside the browser using client-side blobbing!

---

## 🎨 Creative Themes
Switch themes in the header dynamically to update WebGL materials and CSS variable overlays:
* **Cyber Blue** (Deep navy & neon cyan glow)
* **Neon Purple** (Cyberpunk midnight & magenta)
* **Emerald Matrix** (Terminal green matrix)
* **Synthwave** (Sunset pink, orange, and violet)
* **Aurora** (Soft polar green & teal)
* **Midnight Glass** (Monochrome frosted glass layout)

---

## ⚡ Deployment & Setup

This repository is optimized as a lightweight, static ESM Single-Page Application (SPA) with zero local build step requirements. 

### 1. Local Run
To run this application locally, simply clone the repository and open `index.html` directly in any browser:
```bash
double-click index.html
```

### 2. Deploy on Vercel
This project includes a pre-configured `vercel.json` file to manage Clean URLs and single-page routing rewrite rules:
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** ➔ **Project**.
3. Select your linked GitHub account, search for the **`webcloner`** repository, and click **Import**.
4. Click **Deploy**. Vercel will build and host your WebCloner app on a fast global CDN in under 15 seconds!

---

## 🛠️ Built With
* [Three.js](https://github.com/mrdoob/three.js) (WebGL Particles and Sphere)
* [JSZip](https://github.com/Stuk/jszip) (Client-side ZIP packaging)
* [Lucide Icons](https://github.com/lucide-icons/lucide) (Futuristic Developer Icons)
* [Canvas-Confetti](https://github.com/catdad/canvas-confetti) (Celebration FX)
* HTML5 Canvas, Vanilla CSS Grid/Flexbox, ES6 modules
