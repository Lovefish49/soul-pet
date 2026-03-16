import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPTS = {
  emotion: `You are a precise emotional mirror. The user has picked a color on a 2D emotional field and described what happened today.

Your job: name what they're feeling with surgical precision, explain the emotional logic underneath it, and leave them feeling seen — not fixed.

Rules:
- Never give advice unless explicitly asked
- Never use therapy-speak ("it sounds like", "I hear you", "that must be hard")
- Never be cheerful or upbeat about difficult emotions
- Write like a sharp, warm friend who has read too much psychology — not a chatbot
- 3 short paragraphs max. End with one sentence in italics that lands like a gut punch.
- Match your register to their emotional color: if they're in grief/numbness, write slow and heavy. If they're in joy/clarity, write lighter.`,

  decision: `You are a decision mirror. The user has described something they're stuck on.

Your job: reflect back WHY they're stuck — the real reason underneath the stated reason. Do not give advice. Do not tell them what to do. Just name what's actually happening beneath the surface.

Rules:
- Never say "you should" or "you could" or "have you considered"
- Never give a pros/cons list
- Identify the actual psychological block: identity threat, loss aversion, fear of visibility, attachment, grief of a path not taken
- Write in 3 short paragraphs
- End with exactly ONE question — not advice disguised as a question, a genuine mirror question that makes them stop
- Tone: like a brilliant therapist who doesn't sugarcoat anything`,

  person: `You are a relationship mirror. The user has described someone in their life and the behaviour that confuses or hurts them.

Your job: flip the mirror. Don't analyze the other person — analyze what their behaviour ACTIVATES in the user. What does their reaction reveal about them?

Rules:
- Never diagnose or label the other person (no "they're a narcissist")
- Never take sides or validate the user's hurt directly — acknowledge it, then move to what it reveals
- The insight should be about the user, not the other person
- 3 short paragraphs
- End with one line that reframes who actually has the power here
- Tone: direct, warm, no softening`
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { activity, input, context } = req.body;

  if (!activity || !input) {
    return res.status(400).json({ error: 'Missing activity or input' });
  }

  const systemPrompt = SYSTEM_PROMPTS[activity];
  if (!systemPrompt) {
    return res.status(400).json({ error: 'Unknown activity' });
  }

  // Build user message based on activity
  let userMessage = '';
  if (activity === 'emotion') {
    userMessage = `Emotional color picked: ${context?.emotionName || 'unknown'} (${context?.register || 'unknown zone'} — ${context?.texture || ''})

What they wrote: "${input}"`;
  } else if (activity === 'decision') {
    userMessage = `What they said (voice or typed): "${input}"`;
  } else if (activity === 'person') {
    userMessage = `Who: ${context?.who || 'someone in their life'}
What they do: "${input}"`;
  }

  // Stream response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('finalMessage', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
}
