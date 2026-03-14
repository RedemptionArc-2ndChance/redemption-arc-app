/**
 * Lazarus Webhook — Vercel Serverless Function
 * Triggered by Supabase on new confession INSERT
 * Calls Gemini → posts highlight to Telegram as Lazarus
 */

import { NextRequest, NextResponse } from 'next/server';

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID!;
const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'lazarus-ra-2026';

async function getLazarusHighlight(confession: any): Promise<string> {
  const { story, asset, loss_amount_usd, chain } = confession;
  const chainLabel = chain === 'solana' ? 'Solana' : 'Base';
  const lossStr = loss_amount_usd ? `$${Number(loss_amount_usd).toLocaleString()}` : 'something significant';

  const prompt = `You are Lazarus. You run a community called Redemption Arc for crypto traders who got wrecked. You lost everything in the 2022 crash and spent a year in the dark before rebuilding. You are laconic. Dry. You have seen it all. You do not preach, hype, or comfort — you just acknowledge, like someone who was there too.

Someone just confessed. Write ONE Telegram message to post to the group about it.

Hard rules:
- Write it as ONE complete message, not fragments or bullet points
- 2-3 sentences max. Complete sentences with proper punctuation.
- Pull the most human or painful detail from the story — not just the dollar amount
- The last sentence should make people want to read the full thing on the site
- Tone: a quiet nod from someone who's been there. Not cheerful. Not dramatic. Just real.
- Zero hashtags. Zero emojis unless one fits naturally at the very end.
- Do NOT start with "Another" or "Someone" — find a more interesting opening
- Do NOT mention the wallet address or chain

Loss: ${lossStr} on ${chainLabel}
Asset: ${asset || 'undisclosed'}
Their story: ${story}

Write the message now (just the message, nothing else):`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 200, temperature: 0.8 }
      })
    }
  );

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  // Collapse any accidental newlines into spaces so it posts as one clean block
  return raw.replace(/\n+/g, ' ') ||
    'The confessional just got heavier. Read it at redemptionarc.wtf 🪦';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.9 }
      })
    }
  );

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    'Someone just laid it all down in the confessional. The chain remembers. 🪦';
}

async function postToTelegram(text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text })
  });
  const data = await res.json();
  if (!data.ok) console.error('TG error:', JSON.stringify(data));
  else console.log('TG posted:', data.result?.message_id);
}

export async function POST(req: NextRequest) {
  // Verify secret
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();

    // Only process direct browser calls (source: 'browser')
    // Supabase webhook also fires — ignore it to prevent double posts
    if (payload.source !== 'browser') {
      return NextResponse.json({ ok: true, skipped: 'non-browser source' });
    }

    if (!payload.record) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const confession = payload.record;
    const highlight = await getLazarusHighlight(confession);
    await postToTelegram(highlight);

    return NextResponse.json({ ok: true, highlight });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
