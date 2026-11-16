# Edwin Thomas — Interactive Glassmorphism Portfolio & AI Voice Twin

Personal portfolio and interactive voice-enabled resume for **Edwin Thomas** (*Senior Mobile & Embedded Systems Software Engineer*). Built with **React 19**, **TypeScript**, **Vite**, and a custom **WebGL 3D Particles** shader backdrop layered beneath a translucent **Glassmorphism** UI and an **AI Voice Assistant** powered by **Google Gemini** and **ElevenLabs Text-to-Speech**.

---

## ✨ Key Features

- **WebGL 3D Particles Backdrop ([`src/Particles.tsx`](./src/Particles.tsx))**:
  - Full-screen, fixed, non-blocking 3D WebGL particle field (`200` glowing white `#ffffff` particles with radial glow, twinkle modulation, 3D orbital rotation, intro expansion, and cursor parallax).
- **Translucent Glassmorphism UI ([`src/components/GlassResume.tsx`](./src/components/GlassResume.tsx) & [`src/index.css`](./src/index.css))**:
  - Styled with a **bone white (`#F9F6EE`)** typography hierarchy and multi-layered frosted glass cards (`backdrop-filter: blur(...)`).
  - Dual independently scrolling transparent containers (left sidebar for Profile, Contact, Technical Skills, and Education; right main pane for Career Highlights and Projects) so the animated particle field remains visible through the UI at all times.
- **Data-Driven Resume ([`src/data/profile.ts`](./src/data/profile.ts))**:
  - Single source of truth powering all visual resume sections and grounding the AI Voice Assistant's knowledge base.
- **Interactive AI Voice Assistant ([`src/components/GlassVoiceAssistant.tsx`](./src/components/GlassVoiceAssistant.tsx))**:
  - **Speech-to-Text Input**: Uses the browser's `SpeechRecognition` and `MediaDevices` APIs for live voice questions, alongside quick-prompt chips and a text input bar.
  - **3-Tier Intelligence**: Matches custom rules in [`src/data/customResponses.ts`](./src/data/customResponses.ts) first, then queries **Google Gemini (`gemini-2.5-flash`)** grounded on [`src/data/profile.ts`](./src/data/profile.ts), with an offline keyword fallback.
  - **ElevenLabs Cloned Voice Output**: Streams spoken responses using the ElevenLabs TTS API (`eleven_multilingual_v2`) with automatic date/period speech normalization (`"06/2024 – Ongoing"` → `"June 2024 to Ongoing"`).

---

## 🏗️ Project Structure

```text
src/
├── main.tsx                        # Application entry point
├── App.tsx                         # Root layout pairing fixed Particles backdrop with GlassResume
├── Particles.tsx                   # Custom WebGL 3D Particles component (vertex + fragment shaders)
├── index.css                       # Bone-white theme tokens, glassmorphism surfaces & responsive grid
├── components/
│   ├── GlassResume.tsx             # Top glass navbar + left/right transparent scrolling containers
│   └── GlassVoiceAssistant.tsx     # Floating glassmorphism AI Voice Assistant dock & dialog
├── data/
│   ├── profile.ts                  # Resume data (bio, skills, experience, projects, education)
│   └── customResponses.ts          # Deterministic Q&A rules for instant AI responses
├── state/
│   ├── PortfolioContext.tsx        # Read-only React Context for profile data
│   └── voiceReducer.ts             # Discriminated union state machine (idle/listening/thinking/speaking)
├── hooks/
│   └── useVoiceChat.ts             # Orchestrates SpeechRecognition, Gemini LLM, and ElevenLabs audio
├── services/
│   ├── ai/                         # Gemini client (geminiService.ts) & knowledge builder (profileKnowledge.ts)
│   └── audio/                      # ElevenLabs TTS (elevenLabsTts.ts) & mic STT (speechRecognition.ts)
├── constants/
│   ├── config.ts                   # Environment & API constants
│   └── strings.ts                  # Centralized UI labels & accessibility strings
├── types/
│   ├── profile.ts                  # Readonly TypeScript interfaces for resume entities
│   └── voice.ts                    # Discriminated union types for voice session & chat turns
└── utils/
    └── speechFormat.ts             # Date/period natural language formatter for TTS
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** `>= 20.x` and **npm**
- A modern browser with WebGL and Web Speech API support (Chrome, Edge, or Safari)

### 2. Environment Variables
Copy `.env.example` to `.env` in `website/edwinwebsite/` and configure your API keys:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY="your_gemini_api_key_here"
ELEVENLABS_API_KEY="sk_your_51_char_elevenlabs_secret_key"
ELEVENLABS_VOICE_ID="your_elevenlabs_voice_id"
```

### 3. Commands

| Command | Description |
| :--- | :--- |
| `npm install` | Install project dependencies |
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build production bundle to `dist/` |
| `npm run lint` | Run ESLint across all TypeScript/React files |
| `npm start` or `./run-preview.sh` | Build production bundle and open the preview server |
| `./clean-rebuild.sh` | Clean `node_modules` & caches, reinstall, build, and launch preview |
