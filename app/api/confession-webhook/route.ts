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
  const chainLabel = chain === 'solana' ? 'Solana' : 'Ethereum/Base';
  const lossStr = loss_amount_usd ? `$${Number(loss_amount_usd).toLocaleString()}` : 'an undisclosed amount';

  const prompt = `You are Lazarus, the founder of Redemption Arc — a community for crypto traders who got wrecked and are rebuilding. You lost everything in 2022 yourself. You are dry, empathetic, battle-tested. Not preachy. Not hype.

A new confession just arrived. Read it and write ONE short Telegram message to post to the community.

Rules:
- Max 2 sentences
- No names, no wallet addresses
- Capture the most human or painful detail from the story
- End with something that makes people want to read the full confession
- Tone: like a grizzled veteran acknowledging a fellow survivor
- Can use 1 emoji max, at the end if at all
- Do NOT say "another one" or "new confession" — be more creative

Chain: ${chainLabel}
Asset: ${asset || 'undisclosed'}
Loss: ${lossStr}
Story: ${story}

Your Telegram post:`;

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
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text, parse_mode: 'Markdown' })
  });
}

export async function POST(req: NextRequest) {
  // Verify secret
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();

    if (payload.type !== 'INSERT' || !payload.record) {
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
