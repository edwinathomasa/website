# Edwin Thomas — Interactive Portfolio & AI Voice Twin

Personal portfolio and interactive voice-enabled resume for **Edwin Thomas** (*Senior Mobile & Embedded Systems Software Engineer*). Built with **React 19**, **TypeScript**, and **Vite**, featuring an interactive AI Voice Assistant powered by **Google Gemini** and **ElevenLabs Text-to-Speech**.

---

## ✨ Key Features

- **Data-Driven Portfolio**: Single source of truth ([`src/data/profile.ts`](./src/data/profile.ts)) powering all career highlights, categorized technical skills, education, projects, and AI knowledge context.
- **Interactive AI Voice Assistant ("Ask Edwin AI")**:
  - **Speech-to-Text Input**: Uses the browser's native `SpeechRecognition` and `MediaDevices` APIs for live voice questions, with quick-prompt chips and a text input fallback.
  - **Custom Deterministic Q&A + Gemini LLM**: Matches custom rules in [`src/data/customResponses.ts`](./src/data/customResponses.ts) first, then queries **Google Gemini (`gemini-2.5-flash`)** grounded on the full profile dataset, with a local offline matcher fallback.
  - **ElevenLabs Cloned Voice Output**: Streams spoken responses using the ElevenLabs TTS API (`eleven_multilingual_v2`) with natural date/period normalization (e.g., `"06/2024 – Ongoing"` is spoken as `"June 2024 to Ongoing"`).
- **Atomic Design & Tokenized Styling**:
  - Components organized strictly into **Atoms**, **Molecules**, **Organisms**, **Templates**, and **Pages**.
  - Zero magic values: all colors, spacing, typography, radii, and shadows are defined as CSS custom properties in [`src/styles/variables.css`](./src/styles/variables.css), and all UI copy lives in [`src/constants/strings.ts`](./src/constants/strings.ts).

---

## 🏗️ Architecture & Engineering Principles

1. **Layered / Type-Driven Division**:
   - Unidirectional dependency flow: `types` → `constants` / `utils` / `data` → `services` → `state` → `hooks` → `containers` → `components`.
2. **Containers & Custom Hooks**:
   - Stateful orchestration lives in [`src/containers/`](./src/containers) (`PortfolioContainer`, `AiVoiceContainer`) and [`src/hooks/useVoiceChat.ts`](./src/hooks/useVoiceChat.ts), keeping all components under [`src/components/`](./src/components) purely presentational.
3. **Global Client State & Colocated UI State**:
   - [`PortfolioContext`](./src/state/PortfolioContext.tsx) provides global read-only access to the portfolio model.
   - Voice session state is colocated inside `AiVoiceContainer` and input keystroke state is colocated inside `VoiceInputForm`, preventing unnecessary re-renders across static portfolio sections.
4. **Discriminated Unions for Strict State**:
   - Voice session state is modeled as a strict discriminated union (`VoiceSessionStatus` in [`src/types/voice.ts`](./src/types/voice.ts)) managed by [`voiceSessionReducer`](./src/state/voiceReducer.ts), making impossible states unrepresentable at compile time.

```
src/
├── types/                  # Readonly TypeScript interfaces & discriminated unions
├── constants/              # Frozen config (config.ts) & UI copy tokens (strings.ts)
├── utils/                  # Speech date/period formatter (speechFormat.ts)
├── data/                   # Portfolio data (profile.ts) & custom Q&A (customResponses.ts)
├── services/
│   ├── ai/                 # Gemini client & profile knowledge base
│   └── audio/              # ElevenLabs TTS & browser SpeechRecognition adapters
├── state/                  # PortfolioContext & voiceSessionReducer
├── hooks/                  # useVoiceChat custom orchestration hook
├── containers/             # Stateful containers (PortfolioContainer, AiVoiceContainer)
├── components/             # Pure presentational Atomic Design UI
│   ├── atoms/              # Avatar, Chip, ExternalLink, IconButton, SectionHeading, StatusDot
│   ├── molecules/          # ChatBubble, ProjectCard, SkillCategoryCard, SocialLinksBar, TimelineItem, VoiceInputForm
│   ├── organisms/          # Header, ProfileSection, SkillsSection, ExperienceSection, EducationSection, ProjectsSection, Footer, AiVoicePanel, AiVoiceWidget
│   ├── templates/          # PortfolioTemplate
│   └── pages/              # HomePage
└── styles/                 # CSS custom properties (variables.css), sections.css, voice-chat.css
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** `>= 20.x` and **npm**
- A modern browser with Web Speech API support (Chrome, Edge, or Safari) for microphone voice input

### 2. Environment Variables
Copy `.env.example` to `.env` in the project root and configure your keys:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY="your_gemini_api_key_here"
ELEVENLABS_API_KEY="sk_your_51_char_elevenlabs_secret_key"
ELEVENLABS_VOICE_ID="your_elevenlabs_voice_id"
```

> **Note**: `.env` is git-ignored. Ensure `ELEVENLABS_API_KEY` is your 51-character `sk_...` secret key (not the 64-character Key ID hash).

### 3. Install & Run

| Command | Description |
| :--- | :--- |
| `npm install` | Install project dependencies |
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build production bundle to `dist/` |
| `npm run lint` | Run ESLint across all TypeScript/React files |
| `npm start` or `./run-preview.sh` | Build production bundle and open the preview server in your browser |
| `./clean-rebuild.sh` | Clean `node_modules` & caches, reinstall, build, and launch preview |

---

## 🛠️ Customization Guide

- **Update Resume / Portfolio Content**: Edit [`src/data/profile.ts`](./src/data/profile.ts). Both the visual sections and the AI Voice Assistant update automatically.
- **Add Custom AI Q&A Rules**: Add static or dynamic `(profile) => string` rules in [`src/data/customResponses.ts`](./src/data/customResponses.ts).
- **Edit UI Labels & Copy**: Update [`src/constants/strings.ts`](./src/constants/strings.ts).
- **Adjust Theme Colors & Spacing**: Modify the CSS custom properties in [`src/styles/variables.css`](./src/styles/variables.css).
