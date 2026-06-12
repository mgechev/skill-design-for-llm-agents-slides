# Skill Design for LLM Agents - Slide Deck

This repository contains the interactive slide deck for the presentation "Skill Design for LLM Agents: Writing good skills that actually work" delivered at the AI Coding Summit in July 2026.

The deck is built entirely with semantic HTML, vanilla CSS, and client-side JavaScript, featuring rich animations, responsive scaling, and interactive components.

## Topics Covered

- Agentic Systems and Architectures: A breakdown of how modern AI agents operate and communicate.
- The ReAct Loop: Walkthrough of the core agent loop (reasoning and acting).
- Agent Skills: What skills are and how they differ from scripts.
- Skill Design Best Practices:
  - Procedural instructions
  - Frontmatter optimization
  - Progressive disclosure
  - Repetitive task scripting
  - Skill composition
- Testing and Evals: Agentic testing pyramids, evaluation terminology, and automated skill grading with skillgrade.

## Features

- Responsive Viewport Scaling: The slides are built for a strict 16:9 aspect ratio and scale automatically to fit any screen size.
- Interactive Terminal Simulations: Slide 43 features a live terminal animation showing skill execution.
- Interactive State Machine: Slide 44 contains a state machine visualization.
- Keyboard Navigation:
  - Next slide: Right Arrow, Spacebar, Page Down
  - Previous slide: Left Arrow, Backspace, Page Up
  - First/Last slide: Home / End keys
  - Fullscreen toggle: F key
- Hash Deep Linking: Every slide updates the URL hash (e.g., `#24`), allowing direct sharing of specific slides and maintaining state on reload.
- Smooth Transitions: Integrates native browser View Transitions API for animations between slides.

## Running Locally

To run the slides locally, serve the root directory using any HTTP server:

Using Python:
```bash
python3 -m http.server 8081
```

Using Node.js (npx):
```bash
npx serve -p 8081
```

Once started, open `http://localhost:8081` in your web browser.
