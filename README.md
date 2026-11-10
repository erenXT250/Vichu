# Vichu ❤️ — Interactive Proposal Website

A minimal, dreamy, cinematic romantic interactive proposal website built with React, TypeScript, Tailwind CSS, and Framer Motion, specifically optimized for mobile phones (iPhone & Android).

---

## ✨ Features & Highlights

- **Visual Atmosphere**:
  - Dark romantic background: deep midnight purple (`#080312`) with breathing pink ambient lighting.
  - Multi-layered canvas of floating cherry blossom petals falling naturally from top to bottom with 3D rotation, fluttering, sideways drifting, and wind turbulence.
  - Subtle twinkling starfield and glowing particles.

- **Main Proposal Screen**:
  - Pure, minimal, distraction-free typography:
    - **Vichu ❤️**
    - *"Will you give me a chance?"*
  - Interactive **YES 🙈** and **NO 😭** buttons.

- **Interactive Playful NO Button**:
  - Dodges the cursor smoothly on desktop and touch attempts on mobile devices.
  - Uses physics-based spring movement (`stiffness: 420`, `damping: 24`).
  - Strict bounding logic ensures the button never leaves the visible screen on any mobile display.
  - Playful progression: After a few playful dodges, the button stays stationary and allows selecting NO normally.

- **YES Outcome Screen**:
  - Triggers a celebratory cherry blossom shower and rose-gold firework confetti burst.
  - Glowing floating hearts drift up into the night sky.
  - Cinematic transition to:
    - **"Thank you, Vichu ❤️"**
    - *"Let's take it one day at a time."*

- **NO Outcome Screen**:
  - Gentle, dignified transition to:
    - **"I understand ❤️"**
    - *"Your feelings and your choice matter."*

- **Background Music**:
  - Built-in Web Audio API romantic ambient harp/celesta piano arpeggios that work offline with zero external network dependencies.
  - Small, unobtrusive floating toggle in the top-right corner.
  - Browser-compliant autoplay: starts seamlessly after first user touch/interaction.

- **Mobile First**:
  - Dynamic viewport height (`100dvh`) preventing jumpy mobile address bar layout shifts.
  - Native iOS/Android safe area support (`env(safe-area-inset-*)`).
  - `touch-action: manipulation`, zero horizontal scroll, and 60fps canvas animation optimized for mobile battery life.

---

## 🚀 Running Locally

### 1. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To test on your mobile phone on the same Wi-Fi network:
```bash
npm run dev -- --host
```

### 2. Build for Production
```bash
npm run build
```
The optimized static build is generated in the `dist/` directory.
