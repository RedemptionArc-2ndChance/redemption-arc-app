import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, asset, loss_amount_usd, confession_id, tg_username } = await req.json();

    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 });

    const lossStr = loss_amount_usd
      ? `$${Number(loss_amount_usd).toLocaleString()}`
      : 'an undisclosed amount';

    const { data, error } = await resend.emails.send({
      from: 'Lazarus <lazarus@redemptionarc.wtf>',
      to: email,
      subject: '🪦 Your confession has been received',
      html: `
        <div style="background:#0a0a0f;color:#e5e5e5;font-family:monospace;padding:40px;max-width:600px;margin:0 auto;">
          <div style="font-size:32px;margin-bottom:8px;">🪦</div>
          <h1 style="color:#a78bfa;font-size:24px;margin:0 0 24px;">Your confession is on the chain.</h1>

          <p style="color:#9ca3af;line-height:1.6;">
            You lost ${lossStr} on ${asset || 'crypto'}. The chain remembers. So do we.
          </p>

          <p style="color:#9ca3af;line-height:1.6;">
            You've been entered into this week's draw:
          </p>

          <div style="border:1px solid #374151;border-radius:8px;padding:16px;margin:24px 0;">
            <div style="margin-bottom:12px;">
              <span style="color:#a78bfa;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Second Chance Prize</span>
              <div style="color:#fff;font-size:18px;font-weight:bold;margin-top:4px;">$25 cash</div>
              <div style="color:#6b7280;font-size:12px;">weighted random draw by loss size</div>
            </div>
            <div>
              <span style="color:#f59e0b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">It Takes a Village Prize</span>
              <div style="color:#fff;font-size:18px;font-weight:bold;margin-top:4px;">$25 in $RDMPT</div>
              <div style="color:#6b7280;font-size:12px;">community votes for most painful story</div>
            </div>
          </div>

          <p style="color:#9ca3af;line-height:1.6;">
            Winners announced every Sunday. Join the community to vote and to be voted for:
          </p>

          <a href="https://t.me/RedemptionArcWTF" style="display:inline-block;background:#a78bfa;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0;">
            Join the Telegram →
          </a>

          <p style="color:#4b5563;font-size:12px;margin-top:32px;border-top:1px solid #1f2937;padding-top:16px;">
            Your worst trade might be your best story.<br>
            — Lazarus @ redemptionarc.wtf
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err: any) {
    console.error('Confirmation email error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
