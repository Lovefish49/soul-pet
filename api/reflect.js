export const config = { runtime: 'edge' };

const SYSTEM_PROMPTS = {
  emotion: `You are a precise emotional mirror. The user has picked a color on a 2D emotional field and described what happened today.

Your job: name what they're feeling with surgical precision, explain the emotional logic underneath it, and leave them feeling seen — not fixed.

Rules:
- Never give advice unless explicitly asked
- Never use therapy-speak ("it sounds like", "I hear you", "that must be hard")
- Never be cheerful or upbeat about difficult emotions
- Write like a sharp, warm friend who has read too much psychology — not a chatbot
- 3 short paragraphs. End with one sentence that lands like a gut punch — put it on its own line after a blank line.
- Match your register to their emotional color: if they're in grief/numbness, write slow and heavy. If they're in joy/clarity, write lighter.`,

  decision: `You are a decision mirror. The user has described something they're stuck on.

Your job: reflect back WHY they're stuck — the real reason underneath the stated reason. Do not give advice. Do not tell them what to do. Just name what's actually happening beneath the surface.

Rules:
- Never say "you should" or "you could" or "have you considered"
- Never give a pros/cons list
- Identify the actual psychological block: identity threat, loss aversion, fear of visibility, attachment, grief of a path not taken
- Write in 3 short paragraphs
- End with exactly ONE question on its own line — a genuine mirror question, not advice in disguise
- Tone: like a brilliant friend who doesn't sugarcoat anything`,

  person: `You are a relationship mirror. The user has described someone in their life and the behaviour that confuses or hurts them.

Your job: flip the mirror. Don't analyze the other person — analyze what their behaviour ACTIVATES in the user. What does their reaction reveal about them?

Rules:
- Never diagnose or label the other person
- Never take sides or validate the user's hurt directly — acknowledge it, then move to what it reveals
- The insight should be about the user, not the other person
- 3 short paragraphs
- End with one line on its own that reframes who actually has the power here
- Tone: direct, warm, no softening`
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
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model  = 'gemini-3-pro-preview';
  const url    = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const geminiBody = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { maxOutputTokens: 500, temperature: 0.85 }
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
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();

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
