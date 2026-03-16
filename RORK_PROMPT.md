# Soul Pet — iOS App (React Native / Expo)

## App Summary

Soul Pet is a dark, minimal iOS app where users get a "soul pet" — a creature born from their psyche that answers their deepest questions with uncanny specificity. Think Co-Star meets Tamagotchi meets a therapist who actually gets you. Target audience: Gen Z women 18-28.

The core loop: Onboard → Get a personalized soul read → Receive your pet egg → Ask your pet anything → Collect insights → Watch your egg hatch through XP.

---

## Design System (CRITICAL — Follow Exactly)

### Colors
- Background: `#000000` (pure black, every screen)
- Primary text: `#E0E0E0`
- Dim text: `#555555`
- Borders: `rgba(255,255,255,0.12)` (1px, everywhere)
- Selected/active borders: `#FFFFFF`
- Selected background: `rgba(255,255,255,0.06)`
- Button fill: `#FFFFFF` background, `#000000` text
- No accent colors. No gradients on UI. Monochrome only.

### Typography
Two font families only:
1. **Space Mono** (monospace) — body text, labels, buttons, inputs, navigation. This is the default font for everything.
2. **Instrument Serif** (serif) — headings, soul stage names, insight closers, poetic lines. Used sparingly for emphasis.

Font specs:
- Labels: Space Mono, 10px, letter-spacing 0.25em, uppercase, color #555
- Body: Space Mono, 13px, line-height 1.85, color #888
- Headings: Instrument Serif, 28px, weight 400, color #E0E0E0
- Closer text (poetic lines): Instrument Serif, 16-18px, italic, color #E0E0E0
- Buttons: Space Mono, 11px, weight 700, letter-spacing 0.2em, uppercase
- Nav tabs: Space Mono, 10px, letter-spacing 0.15em, uppercase

### Layout Rules
- **Border radius: 0 everywhere.** No rounded corners on anything — buttons, cards, inputs, chips, modals. Sharp edges only.
- Padding: 28px horizontal on most screens, 40px vertical
- Max content width: 340px, centered
- Cards: transparent background, 1px border at rgba(255,255,255,0.08)
- Inputs: transparent background, 1px border, no fill
- Text inputs for name: bottom-border only (underline style), centered text, 18px

### Buttons
- Primary: white fill (#FFF), black text (#000), full width (max 320px), padding 16px 48px, Space Mono 11px bold uppercase
- Ghost: transparent, 1px white border at 20% opacity, same font
- Skip: no border, no background, dim text (#555), uppercase, below primary button

### Animations
- Screen transitions: 0.6s opacity fade
- Egg float: gentle 3s ease-in-out infinite translateY(-6px) bob
- Orb breathe: 4s ease-in-out scale(1) → scale(1.04) infinite
- Dot pulse loading: 3 dots pulsing scale + opacity, staggered 0.2s
- Fade up: opacity 0 → 1 + translateY(16px → 0)

---

## Screen Flow (10 Screens Total)

### Screen 0: Splash
- Center: silver/white orb (radial gradient, 160px, with outer ring, breathing animation)
- Below orb: "You already know." (Instrument Serif, 28px) — fades up after 1.2s
- Below that: "Your pet just sees it differently" (label style) — fades up after 2s
- Bottom: "BEGIN" ghost button — fades in after 2.8s
- Tapping orb or "Begin" → Screen 1

### Screen 1: Name
- Top: thin progress bar (2px, white fill at 33%)
- Label: "01"
- Heading: "What do we call you?" (Instrument Serif)
- Input: underline-only text input, centered, placeholder "Your name"
- Button: "CONTINUE" (primary white)
- → Screen 2

### Screen 2: Identity Selector
- Progress bar at 40%
- Label: "02"
- Heading: "How do you understand yourself?" (Instrument Serif)
- 2×2 grid of identity tiles. Each tile is a tappable card with:
  - Symbol (20px emoji/glyph)
  - Title (Space Mono, 10px bold uppercase)
  - Subtitle (11px, dim)
- The 4 tiles:
  1. ✦ MBTI — "Personality type"
  2. ☽ Astrology — "Sun sign"
  3. ♡ Attachment — "How you love"
  4. ∞ Numerology — "Life path"
- Multi-select: tapping toggles selection (border goes white, bg gets slight fill)
- "CONTINUE" button → routes to the first selected sub-screen
- "Discover later" skip link → jumps to Screen 3 (Unseen Question)

### Screen 2b: MBTI Picker
- Progress bar at 55%
- Label: "MBTI"
- Heading: "What's your type?"
- 4×4 chip grid with all 16 MBTI types: INTJ, INTP, ENTJ, ENTP, INFJ, INFP, ENFJ, ENFP, ISTJ, ISFJ, ESTJ, ESFJ, ISTP, ISFP, ESTP, ESFP
- Each chip: transparent bg, 1px border, uppercase Space Mono 10px
- Single select: tap to choose (border goes white)
- "CONTINUE" + "Not sure" skip
- → Next selected identity screen, or Screen 3

### Screen 2c: Astrology Picker
- Progress bar at 70%
- Label: "Astrology"
- Heading: "What's your sun sign?"
- 3-column chip grid, 12 zodiac signs with symbols:
  ♈ Aries, ♉ Taurus, ♊ Gemini, ♋ Cancer, ♌ Leo, ♍ Virgo, ♎ Libra, ♏ Scorpio, ♐ Sagittarius, ♑ Capricorn, ♒ Aquarius, ♓ Pisces
- Each chip has the symbol (18px) above the name
- Single select
- "CONTINUE" + "Skip"
- → Next selected identity screen, or Screen 3

### Screen 2d: Attachment Style Picker
- Progress bar at 75%
- Label: "Attachment"
- Heading: "How do you love?"
- 4 vertical cards (not a grid — full-width stacked):
  1. **Secure** — "Comfortable with closeness and independence"
  2. **Anxious** — "Crave closeness, fear abandonment"
  3. **Avoidant** — "Value independence, pull away from closeness"
  4. **Fearful-Avoidant** — "Want closeness but fear it too"
- Each card: left-aligned, title 12px white, description 10px dim, padding 16px
- Single select
- "CONTINUE" + "Not sure" skip
- → Screen 3

### Screen 3: The Unseen Question
- Progress bar at 90%
- Label: "One last thing"
- Heading: "What do you wish people understood about you?" (Instrument Serif, 24px)
- Multiline textarea: transparent bg, 1px border, Space Mono 13px, 320px wide, min-height 120px
- Placeholder: "No wrong answers."
- "SHOW ME" primary button + "Skip"
- → Screen 4 (triggers AI soul read)

### Screen 4: Soul Read (AI-Powered)
- Scrollable screen, top-aligned
- Label: "Your Soul Stage"
- Stage title: Instrument Serif, 32px (e.g. "A Quiet Crown of Static")
- Divider: 40px white line at 15% opacity
- Body: 3-4 paragraphs, Space Mono 13px, #888, line-height 1.85. Streams in real-time from AI.
- Closer: Instrument Serif, 18px, italic, #E0E0E0 (the screenshot line)
- Button: "MEET YOUR PET" (primary, appears after text finishes)

**AI Integration:** POST to `/api/reflect` with `activity: 'onboarding'`. Sends name, MBTI, astro sign, attachment style, and the unseen answer. Returns an SSE stream of the soul portrait. The portrait has a title line, then blank line, then paragraphs separated by blank lines, then a closing sentence.

**Fallback (if API fails):** Show hardcoded default profile:
- Stage: "The Controlled Storm"
- Body: 4 paragraphs about processing the world fast, talking yourself out of things, intimacy feeling risky, curated self vs real self
- Closer: "You don't want to be saved. You want someone who doesn't need you to explain yourself."

### Screen 5: Egg Unboxing
- Label: "Something is forming"
- Center: Silver orb (70px, radial gradient, glowing)
- After 1s: orb shrinks and fades out
- After 1.8s: egg appears (80×100px egg shape with radial gradient, soft glow shadow, floating animation)
- Label changes to: "Your pet is here."
- Subtitle shows the soul stage name
- After 3s: "ENTER" button fades in
- → Screen 6

### Screen 6: Ask Your Pet (THE CORE PRODUCT)
**This is the main screen. Everything leads here.**

Layout (chat-style, full height):
- **Header** (fixed top): Small egg (48×60px, floating) + soul stage name (Instrument Serif 16px) + "Ask anything" label
- **Message area** (scrollable, fills remaining space):
  - Empty state (before first ask): centered egg visual + "Ask me anything." (Instrument Serif 22px) + "I already know who you are. Now ask what you're afraid to." (Space Mono 12px, #888)
  - After asking: chat bubbles. Questions right-aligned with 1px border box. Answers left-aligned, no border.
- **Suggestion chips** (above input): horizontal wrap layout, shown until 2+ messages exist
  - "Am I settling?"
  - "Why can't I let go?"
  - "What am I really afraid of?"
  - "Why do I push people away?"
  - Each chip: 1px border, transparent, Space Mono 11px, tappable → fills input and sends
- **Input bar** (fixed bottom, above tab nav): textarea (auto-growing, max 120px) + "ASK" send button (white fill, Space Mono 11px bold)

**Message styling:**
- User question (`.msg-q`): right-aligned, max-width 80%, 1px border, padding 14px 18px, Space Mono 13px
- Pet answer (`.msg-a`): left-aligned, max-width 90%
  - Body paragraphs: Space Mono 13px, color #999, line-height 1.8
  - Closing line (last short paragraph): Instrument Serif 16px, italic, color #E0E0E0, margin-top 12px
- Loading state: 3 pulsing dots

**AI Integration:** POST to `/api/reflect` with `activity: 'ask'`. Context includes name, soul stage, astro, MBTI, attachment, unseen answer, and last 10 chat messages (pet responses trimmed to 80 chars). Returns SSE stream. Render incrementally as tokens arrive.

**After each answer completes:**
- Add +10 XP
- Extract the closing line (last paragraph if under 200 chars, else first sentence) → save to insights array
- Push to chat history

### Screen 7: Daily Insights
- Top-aligned, scrollable
- Header: "Daily Insights" label + "What you've been learning" (Instrument Serif 22px)
- Content: list of insight cards. Each card:
  - Border: 1px at rgba(255,255,255,0.08), padding 20px
  - Question text: Space Mono 11px, dim, with timestamp (e.g. "Am I settling? · 10:15 AM")
  - Insight text: Instrument Serif 17px, italic, in quotes (e.g. *"The version of yourself you're performing for him isn't lighter. It's just emptier."*)
- Empty state: "Nothing here yet" + "Ask your pet something first. Insights appear as you talk."

### Screen 8: Pet Profile
- Top-aligned, scrollable
- **Egg hero** (centered):
  - Egg visual (100×126px) with crack SVG overlay (polyline cracks drawn on top) + outer glow ring (120px circle, 1px border, floating reverse)
  - Soul stage name: Instrument Serif 22px
  - Status label that changes with XP:
    - 0-19 XP: "Hatching in progress"
    - 20-49 XP: "Something stirs inside"
    - 50-99 XP: "Shell is cracking"
    - 100 XP: "Ready to hatch"

- **XP Section** (card with 1px border):
  - "SOUL XP" label + "0 / 100" counter
  - Progress bar: 2px height, white fill, animated width
  - "What cracks the shell" sub-label + 3 items:
    - Ask a question +10 XP
    - Ask something vulnerable +20 XP
    - Return daily +15 XP

- **Stats** (2-column grid):
  - Left card: questions asked count (Instrument Serif 28px)
  - Right card: insights earned count (Instrument Serif 28px)

- **Last Insight** (card, hidden until first insight):
  - "Last insight" label + the closing line in Instrument Serif italic

- **Your Signals** (card):
  - Shows selected identity tags as chip badges: MBTI type, zodiac sign, attachment style
  - If none selected: "Discovering..."

---

## Navigation

Bottom tab bar (fixed, all 3 main screens share it):
- **Ask** | **Insights** | **Pet**
- Style: 1px top border at rgba(255,255,255,0.06), black background
- Tabs: Space Mono 10px, uppercase, letter-spacing 0.15em
- Active tab: white text. Inactive: #555

Tab bar only appears on Screens 6, 7, 8 (after onboarding).

---

## API Integration

### Endpoint
The app calls a single API endpoint: `POST /api/reflect`

For the Rork build, use this as the backend URL (already deployed on Vercel):
`https://soul-pet.vercel.app/api/reflect`

### Request Format
```json
{
  "activity": "onboarding" | "ask",
  "input": "user's text input",
  "context": {
    "name": "Luna",
    "mbti": "INFJ",
    "astro": "Scorpio",
    "attachment": "Anxious",
    "stage": "A Quiet Crown of Static",
    "unseen": "I wish people knew how much I overthink everything",
    "history": [
      {"role": "user", "text": "Am I settling?"},
      {"role": "pet", "text": "You're not settling. You're negotiating..."}
    ]
  }
}
```

### Response Format
Server-Sent Events (SSE) stream:
```
data: {"text": "You process the world "}
data: {"text": "faster than most."}
data: {"text": " You read the room"}
...
data: {"done": true}
```

Parse each SSE line, extract `text` field, concatenate and render incrementally. When `done: true` arrives, finalize the message.

### For Onboarding (activity: "onboarding")
- Send: name, mbti, astro, attachment in context
- Input: the unseen answer ("What do you wish people understood about you?")
- Response: Soul stage portrait. First line is the title. Then paragraphs separated by double newlines. Last line is the closer.

### For Ask (activity: "ask")
- Send: full context including stage, unseen, and chat history (last 10 messages, pet responses trimmed to 80 chars)
- Input: the user's question
- Response: 2-4 paragraphs + closing line. Render body in mono, closer in serif italic.

---

## State Management

All state is in-memory (no persistence for MVP). Store:
```
userName: string
chosenMbti: string | null
chosenAstro: string | null
chosenAttach: string | null
currentStage: string (set after soul read)
unseenAnswer: string
chatHistory: [{role: 'user'|'pet', text: string}]
insights: [{q: string, closer: string, timestamp: number}]
totalXP: number
totalAsks: number
```

---

## Persistence (Optional Enhancement)

Use AsyncStorage to save:
- User profile (name, MBTI, astro, attachment, stage, unseen answer)
- Chat history
- Insights
- XP progress

Restore on app launch. If profile exists, skip onboarding and go straight to Ask screen.

---

## Key UX Details

1. **Streaming text:** Answers must stream in token by token, not appear all at once. This is critical for the experience — watching the pet "think" and write in real-time.
2. **Auto-scroll:** Message area scrolls to bottom as new tokens arrive.
3. **Suggestion chips hide** after 2+ messages in the conversation.
4. **Input auto-grows** vertically as user types (max 120px height).
5. **Enter key sends** (without shift). Shift+Enter for newline.
6. **Send button disables** while waiting for response.
7. **Loading dots** (3 pulsing dots) shown while waiting for first token.
8. **Keyboard avoidance:** Input bar should stay above keyboard on iOS.
9. **Screen transitions:** Smooth 0.6s opacity fade between all screens.
10. **No splash screen delay beyond animations.** The splash is the first screen the user interacts with, not a loading screen.

---

## What NOT to Include

- No authentication / login
- No push notifications (yet)
- No payment / paywall
- No social features
- No settings screen
- No onboarding carousel / tutorial
- No Android-specific styling (iOS only for now)
- No dark/light mode toggle (always dark)
