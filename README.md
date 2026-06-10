# Ashutosh Reddy Atimyala — Portfolio

## Structure
```
portfolio/
├── index.html
├── README.md
└── assets/
    ├── css/style.css
    ├── js/main.js
    ├── img/profile.jpg (+ classical-cv-*.jpg)
    └── docs/Ashutosh_Reddy_Atimyala_Resume.docx
```

## Features (v2.6)
- **Boot-sequence preloader** — terminal-style loading screen, plays once per session
- **Lenis smooth scrolling** — inertia-based scroll with eased anchor navigation
- **Scramble/decode typography** — hero name and section headings decode on reveal
- **Rotating role text** in the hero tagline
- **Tech ticker marquee** between hero and skills
- **Spotlight cards** — cursor-tracked glow on skill, experience, project, and education cards
- **Blur + slide scroll reveals** with custom easing
- **Mobile menu** — full-screen overlay with staggered links (hamburger appears ≤1024px)
- **Back-to-top button**, custom scrollbar, selection color, focus-visible outlines
- **Performance guards** — WebGL shaders pause when offscreen or tab is hidden; pointer effects only on fine pointers
- **`prefers-reduced-motion` respected everywhere** — loader skipped, shaders render a single static frame, reveals shown instantly

## External dependencies (CDN)
- Three.js r128 (cdnjs)
- Lenis v1 (jsDelivr)
- Google Fonts: Clash Display, Cabinet Grotesk, JetBrains Mono
