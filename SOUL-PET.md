# Soul Pet

## What It Is

A dark, minimal web app where girls get a "soul pet" — a creature born from their psyche that answers their questions with uncanny specificity. Think Co-Star meets Tamagotchi meets a therapist who actually gets it.

**Live:** Deployed on Vercel (soul-pet.vercel.app)
**Repo:** github.com/Lovefish49/soul-pet
**Stack:** Single HTML file + Vercel Edge API (SSE streaming) + Gemini AI

## Core Insight (March 16, 2026)

Co-Star's genius isn't astrology — it's selling girls permission to think about themselves. The birth chart is a one-time input that generates infinite "personalized" output. The content doesn't need to be right, just specific enough that her brain does the work. Soul Pet steals this architecture but with actually personalized AI answers instead of templated fortune cookies.

## Architecture

### The Flow
```
Splash → Name → Identity Selector → (MBTI / Astro / Attachment) → "What do you wish people understood?" → Soul Read → Egg Reveal → ASK YOUR PET (the product)
```

### Three Tabs (Post-Onboarding)
1. **Ask** — Chat interface. She asks anything, pet answers from her soul stage persona. Suggested questions as chips. Full conversation context.
2. **Insights** — Auto-extracted closing lines from each conversation. Her personal collection of "things my pet said that hit."
3. **Pet** — Profile screen. Egg with crack/glow animation, XP bar (10 XP per ask), soul stage name, stats, identity signals.

### Onboarding Screens
1. **Splash** — Silver orb, "You already know. Your pet just sees it differently."
2. **Name** — Underline input, minimal
3. **Identity Selector** — 2×2 grid: MBTI, Astrology, Attachment, Numerology. Multi-select, only shows sub-screens for selected ones.
4. **MBTI** — 4×4 chip grid, all 16 types
5. **Astro** — 3-column zodiac grid with symbols
6. **Attachment** — 4 vertical options with descriptions (Secure, Anxious, Avoidant, Fearful-Avoidant)
7. **"What do you wish people understood about you?"** — The real signal. Open textarea.
8. **Soul Read** — AI-generated psychological portrait. Streams in real-time. Title + 4 paragraphs + closing line. This is the "holy shit, it knows me" moment that makes the pet feel real.
9. **Egg Reveal** — Soul orb collapses → egg appears → "Your pet is here"

### The Ask Interface
- Chat-style: questions right-aligned (boxed), answers left-aligned
- Answer format: mono body paragraphs + serif italic closer (the screenshot line)
- 4 default suggestion chips: "Am I settling?" / "Why can't I let go?" / "What am I really afraid of?" / "Why do I push people away?"
- Pet has full context: name, astro, MBTI, attachment, soul stage, unseen answer, entire conversation history (last 10 messages)
- Each answer builds on the last — it remembers

## Design System (Co-Star Aesthetic)

- **Background:** Pure #000
- **Fonts:** Space Mono (body/labels/buttons) + Instrument Serif (headings/closers)
- **Border-radius:** 0 everywhere. Sharp edges only.
- **Buttons:** White fill, black text, uppercase mono, no rounding
- **Inputs:** Underline-only for text, transparent backgrounds
- **Cards/Tiles:** Transparent with 1px white border at 10-12% opacity
- **Chips:** Same — transparent, thin border, uppercase mono
- **Color:** Monochrome. White, grays, black. No accent colors.
- **Vibe:** Brutalist editorial. The text does the work, not the design.

## API (`/api/reflect.js`)

### Edge Function
- Runtime: Vercel Edge, maxDuration: 60s
- Streams SSE from Gemini → client

### Models
- **Onboarding (soul read):** `gemini-3-pro-preview` — quality matters for the first impression
- **Ask:** `gemini-3-flash-preview` — fast, cheap, conversational
- maxOutputTokens: 8192

### Prompt Architecture
5 system prompts:
1. **`onboarding`** — Soul reader. Generates the psychological portrait from name/MBTI/astro/attachment/unseen answer.
2. **`ask`** — Soul pet voice. Warm, direct, unnervingly specific. 2-4 paragraphs + closing line. Knows her profile, remembers conversation history.
3. **`emotion`** — (Legacy) Daily reflection from color picker
4. **`decision`** — (Legacy) Decision mirror from voice input
5. **`person`** — (Legacy) Relationship mirror

### Context Sent to Ask
```json
{
  "name": "...",
  "stage": "The Controlled Storm",
  "astro": "Scorpio",
  "mbti": "INFJ",
  "attachment": "Anxious",
  "unseen": "I wish people knew how much I overthink...",
  "history": [{"role":"user","text":"..."}, {"role":"pet","text":"..."}]
}
```

History is trimmed: pet responses capped at 80 chars in context, max 6 exchanges sent.

## XP / Gamification

- +10 XP per question asked
- 100 XP to "hatch"
- Status evolves: Hatching → Something stirs → Shell is cracking → Ready to hatch
- Stats tracked: questions asked, insights earned
- Egg has crack SVG overlay + glow ring + float animation

## Key Decisions & Lessons

### Truncation Saga
Answers kept getting cut off mid-sentence. Root causes:
1. Gemini Pro is slow — Vercel edge default 25s timeout killed the stream
2. maxOutputTokens was too low (started at 600, now 8192)
3. Conversation history was eating prompt tokens
4. **Fix:** Switched ask to Flash (fast), bumped maxDuration to 60s, trimmed history, bumped token limit

### Name Hallucination
Pet called a user "12" — Gemini was inventing names from noise when none was provided. Fix: explicit "She did not share her name" in prompt when empty.

### Stream Buffer Bug
Early versions had a buffer flush issue — last SSE chunk wasn't being processed on stream end. Fixed by flushing remaining buffer when `done: true`.

### Co-Star Redesign
Original design was premium-app aesthetic (rounded corners, gradients, SF Pro). Shifted to brutal minimalism: Space Mono + Instrument Serif, zero border-radius, pure black, white CTAs. Design becomes invisible — text carries everything.

### Feature Consolidation
Started with 4 separate activities (emotion color picker, decision scan with voice, relationship mirror, convo decoder). Consolidated everything into single "Ask Your Pet" chat interface. The old activities became suggested question categories, not separate screens.

## File Structure
```
soul-pet/
├── index.html          # Everything — all screens, CSS, JS in one file
├── api/
│   └── reflect.js      # Vercel Edge function — Gemini SSE proxy
├── package.json
├── vercel.json
└── SOUL-PET.md         # This file
```

## Git History (Chronological)
1. `init: Soul Pet onboarding UI` — Splash, name, identity picker
2. `feat: add MBTI + astro input screens`
3. `feat: add 'what do you wish people knew' screen`
4. `feat: soul read report + egg unboxing`
5. `feat: egg crack + enter app + home screen`
6. `feat: split pet screen + explore home + activity grid`
7. `feat: emotion color picker + relationship mirror`
8. `feat: decision scan with voice input`
9. `feat: wire real Claude API — streaming`
10. Switched Claude → Gemini 2.0 Flash → Gemini 3 Pro
11. Multiple prompt rewrites (Gemini kept echoing instructions)
12. Multiple stream truncation fixes
13. `redesign: Co-Star aesthetic`
14. `rebuild: Ask Your Pet as core feature` — gut 4 activities, single chat
15. `feat: profile screen (egg, XP, stats)`
16. `fix: maxDuration 60s, 8192 tokens`

## Monetization Model (Designed, Not Built)
- **Free:** Daily nudge + 3 pet asks/month
- **Ask packs:** $4.99/10 questions (Co-Star model — impulse buy)
- **Subscription:** $9.99/mo — unlimited asks + all features + weekly soul report
- Daily nudge is the retention hook. Ask box is impulse revenue. Subscription for addicts.

## What's Next
- Push notifications / daily nudge (zero-effort daily content)
- Convo Decoder (paste a conversation, pet reads between the lines)
- Egg hatching animation at 100 XP → pet creature reveal
- Multiple pet evolution stages
- Social: share your pet's best lines
- Persistence (localStorage or auth + DB)
