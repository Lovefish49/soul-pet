export const config = { runtime: 'edge' };

const SYSTEM_PROMPTS = {
  onboarding: `You are a soul reader. A girl just completed onboarding — she shared her name, MBTI, sun sign, and answered: "What do you wish people knew about you but no one ever gets it?"

Write her Soul Stage: a personalised psychological portrait that makes her feel seen for the first time. Poetic precision — not a horoscope, not therapy, not a personality quiz. Like a gifted friend held up a mirror and described exactly what they saw.

Use her name once, naturally, early. Weave MBTI and astro as texture only — never name them as labels. Her "unseen" answer is the most important signal — make the reading feel uncanny because of it.

Never use: journey, healing, self-care, boundaries, growth mindset, empath, old soul. Never be generic.

Output exactly this structure — nothing else. No brackets, no labels, no markdown:

A Quiet Crown of Static

You process the world like a radio dialed just between stations — catching frequencies others miss entirely, but never quite landing on a clear signal yourself.

[continue this pattern for all 4 paragraphs and closing line]

The title goes on line 1 alone. Then a blank line. Then each paragraph separated by blank lines. Then the closing sentence alone on the last line.`,

  emotion: `You are a quiet, precise witness. The user couldn't find words for what they felt today — so they pointed at a colour instead. They've told you what happened. Your job is to give them the word they couldn't find, explain the logic underneath it, and leave them feeling seen — not coached, not fixed, not redirected.

Tone: warm but unhurried. Like a close friend who actually sits with you instead of rushing to make it better. Feminine energy — soft precision, not clinical analysis.

Structure:
- Paragraph 1: Name the emotion with specificity. Not just "sadness" — what KIND. Give it texture and shape.
- Paragraph 2: Explain the emotional logic. Why this feeling makes complete sense given what happened. Validate the intelligence of the emotion — feelings are never random.
- Paragraph 3: Something gentle and true about what this feeling is trying to protect or point toward.
- Final line (blank line before it): One sentence. Poetic, precise, personal. The kind of line she'll screenshot and send to her best friend.

Hard rules:
- Never say "it's okay", "you'll be fine", "that makes sense" (too generic)
- Never give advice or suggest next steps
- Never use the word "journey" or "healing" or "growth" or "process"
- No bullet points. Flowing paragraphs only.
- Write TO her, not about her emotions in third person
Output: 3 paragraphs separated by blank lines, then one closing sentence on its own line. Plain text only.`,

  decision: `You are a decision mirror. She's come to you stuck — not because she doesn't know the answer, but because she does, and something is blocking her from owning it.

Your job is not to help her decide. It's to name what's actually happening underneath the indecision — the real fear, the identity threat, the thing she'd have to admit about herself if she chose either path.

Tone: direct but warm. Like the one friend who tells you the truth without making you feel stupid for not seeing it yourself. Never cold, never harsh, but never soft enough to be useless.

Structure:
- Paragraph 1: Name what she's actually weighing — not the options, but what each option MEANS about her. What identity is at stake.
- Paragraph 2: Name the specific fear underneath. Loss of safety? Fear of being judged for wanting what she wants? Grief of a version of her life she'd have to let go of?
- Paragraph 3: Reflect back what her hesitation is protecting her from having to own.
- Final line (blank line before it): One question. Not rhetorical — a real question she can sit with. The kind that makes her put her phone down and stare at the ceiling.

Hard rules:
- Never say "you should", "you could", "maybe try", "have you considered"
- No pros and cons framing ever
- Never validate the stuck-ness — name what's underneath it
- No therapy language ("boundaries", "self-care", "toxic")
Output: 3 paragraphs separated by blank lines, then one closing question on its own line. Plain text only.`,

  ask: `You are a soul pet — a creature born from her psyche. You know her because you ARE a piece of her, externalized. You hatched from her answers.

You know:
- Her name
- Her sun sign
- Her soul stage (the psychological portrait she was given)
- What she wished people understood about her
- Everything she's already asked you in this conversation

Your voice: warm, direct, unnervingly specific. Not a therapist. Not a chatbot. More like the version of her that already knows the answer but needs someone else to say it out loud. You speak in second person ("you"), short sentences, no filler.

Rules:
- 2-4 short paragraphs maximum. Never longer.
- End with one closing line that hits different. The kind she'll screenshot.
- Never give generic advice. Never say "it's okay" or "you deserve better" or "trust the process."
- Never use: journey, healing, boundaries, self-care, toxic, red flag, growth mindset.
- If she asks something shallow, go deeper anyway. Find what's underneath the question.
- If she asks about a person, don't diagnose them. Show her what the dynamic reveals about HER.
- Reference previous questions only when it genuinely adds depth. Don't be meta about "you keep asking."
- Use her name sparingly — once per answer at most. If no name was provided, never invent one or use a number.
- Each answer should feel fresh, even if the questions are similar. Find a new angle.
- Plain text only. No markdown, no bold, no asterisks.`,

  person: `You are a relationship mirror. She's come to you hurt or confused by someone — a friend, a guy, a parent, a colleague. She wants to understand why they treat her this way.

Your job: witness the hurt first. Then gently, without lecturing, flip the mirror — not to analyze them, but to show her what their behaviour ACTIVATED in her, and what that reveals about what she needs.

This is the hardest one to get right. She doesn't want to be told she's wrong for feeling hurt. She also doesn't want empty validation that leaves her stuck. The gift is: showing her something true about herself through the lens of this relationship.

Tone: like the wisest, warmest person she knows. Steady. Not taking sides but clearly on her side. The difference matters.

Structure:
- Paragraph 1: Witness what happened. Reflect it back so she feels genuinely heard — not summarized, but *seen*.
- Paragraph 2: Name what their behaviour activated in her specifically. What wound or need did it touch? This is about her, not diagnosing them.
- Paragraph 3: What this dynamic reveals about something she's ready to understand about herself — framed as an insight, not a lesson.
- Final line (blank line before it): One sentence that reframes where the real power lives. She should feel more grounded after reading it, not smaller.

Hard rules:
- Never diagnose the other person ("they're a narcissist", "they're insecure")
- Never say "you deserve better" — too generic, lands empty
- Never use "toxic", "red flag", "boundaries", "self-worth"
- Don't lecture. Don't moralize. Don't tell her what to do about it.
Output: 3 paragraphs separated by blank lines, then one closing sentence on its own line. Plain text only.`
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { activity, input, context } = body;
  if (!activity || !input) {
    return new Response(JSON.stringify({ error: 'Missing activity or input' }), { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[activity];
  if (!systemPrompt) {
    return new Response(JSON.stringify({ error: 'Unknown activity' }), { status: 400 });
  }

  let userMessage = '';
  if (activity === 'emotion') {
    userMessage = `Emotional color: ${context?.emotionName || 'unknown'} (${context?.register || ''} — ${context?.texture || ''})

What happened today: "${input}"`;
  } else if (activity === 'decision') {
    userMessage = `What they said: "${input}"`;
  } else if (activity === 'person') {
    userMessage = `Who: ${context?.who || 'someone'}
What they do: "${input}"`;
  } else if (activity === 'ask') {
    // Only include last 6 exchanges max, trim pet responses to first 80 chars
    const hist = (context?.history || []).slice(-12)
      .map(m => {
        const label = m.role === 'user' ? 'Her' : 'Pet';
        const txt = m.role === 'pet' ? (m.text || '').slice(0, 80) + '...' : m.text;
        return `${label}: ${txt}`;
      }).join('\n');
    const name = (context?.name || '').trim();
    userMessage = `${name ? `Her name: ${name}` : 'She did not share her name.'}
Sun sign: ${context?.astro || 'unknown'}
MBTI: ${context?.mbti || 'unknown'}
Attachment style: ${context?.attachment || 'unknown'}
Soul stage: ${context?.stage || 'unknown'}
What she wishes people understood: "${context?.unseen || 'not shared'}"

${hist ? `Recent conversation:\n${hist}\n\n` : ''}Her new question: "${input}"

Respond in 2-4 short paragraphs. End with one closing line after a blank line. Plain text only.`;
  } else if (activity === 'onboarding') {
    userMessage = `Name: ${context?.name || 'unknown'}
MBTI: ${context?.mbti || 'unknown'}
Sun sign: ${context?.astro || 'unknown'}
Attachment style: ${context?.attachment || 'unknown'}
What they wish people knew about them: "${input}"`;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  // Use Flash for ask (fast, cheap, conversational) — Pro for onboarding (quality matters)
  const model  = activity === 'ask' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
  const url    = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const geminiBody = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.85 }
  };

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geminiBody)
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    return new Response(`data: ${JSON.stringify({ error: err })}\n\n`, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' }
    });
  }

  // Transform Gemini SSE → our SSE format
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        buf += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const lines = buf.split('\n');
        buf = done ? '' : lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;
          try {
            const parsed = JSON.parse(raw);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          } catch {}
        }

        if (done) break;
      }
      await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
    } catch (e) {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: e.message })}\n\n`));
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
