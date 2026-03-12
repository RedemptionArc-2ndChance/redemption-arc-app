'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// Major crypto cultural moments — used to generate contextual Certificate of Release
const CRYPTO_LORE: { keywords: string[], era: string, context: string }[] = [
  {
    keywords: ['luna', 'ust', 'terra', 'do kwon'],
    era: '2022 — The LUNA Collapse',
    context: 'Do Kwon had 750,000 Twitter followers and a podcast. He called skeptics "poor." LUNA was going to revolutionize money. Then $40 billion evaporated in 72 hours. You weren\'t stupid. You were early to the exit — just not early enough.'
  },
  {
    keywords: ['bayc', 'bored ape', 'nft', 'opensea', 'azuki', 'doodle', 'pudgy'],
    era: '2021–2022 — The NFT Delirium',
    context: 'A JPEG of a bored monkey was selling for $300,000. Celebrities were minting. SNL did a skit. The New York Times ran a feature. You weren\'t delusional — you were watching a cultural moment unfold and you wanted in. The vibe was real, even if the floor wasn\'t.'
  },
  {
    keywords: ['ftx', 'sam', 'sbf', 'alameda', 'solana', 'sol'],
    era: '2022 — The FTX Collapse',
    context: 'SBF was on magazine covers. FTX had a Super Bowl ad. The exchange was "safe." Congress loved him. Then the balance sheet leaked. $8 billion in customer funds: gone. You trusted a system that was designed to look trustworthy. That\'s not a character flaw — that\'s fraud.'
  },
  {
    keywords: ['doge', 'dogecoin', 'shib', 'shiba', 'pepe', 'floki', 'meme'],
    era: '2021 — The Meme Coin Era',
    context: 'Elon tweeted a dog. A currency created as a joke became the 4th largest crypto by market cap. Ordinary people were becoming millionaires in weeks. The absurdity WAS the point. You didn\'t miss the logic — there was no logic. There was only vibes, and for a moment, the vibes were right.'
  },
  {
    keywords: ['3ac', 'three arrows', 'celsius', 'blockfi', 'voyager', 'nexo'],
    era: '2022 — The CeFi Implosion',
    context: 'The pitch was simple: earn 18% on your crypto. The institutions were backing it. The founders had yachts. Celsius had 1.7 million users. Three Arrows Capital managed $18 billion. Then the dominoes fell — all of them, in the same summer. You weren\'t naive. You were one of millions.'
  },
  {
    keywords: ['eth', 'ethereum', '2017', '2018', 'ico'],
    era: '2017–2018 — The ICO Bubble',
    context: 'Every whitepaper promised to disrupt everything. ETH was the rocket fuel. EOS raised $4 billion. Tron launched with a plagiarized whitepaper and still pumped 1,000%. You were watching the birth of a new asset class and it looked exactly like a revolution — because part of it was.'
  },
  {
    keywords: ['bitcoin', 'btc', '2017', 'december'],
    era: 'December 2017 — The Bitcoin Peak',
    context: 'BTC hit $19,783 on December 17, 2017. Your dentist was talking about it. Your Uber driver had a mining rig. CNBC was running a Bitcoin ticker. The bubble was obvious in retrospect — but at $15K, $16K, $17K, it looked like it was just getting started. You weren\'t wrong to believe. You were just early to the exit.'
  },
  {
    keywords: ['defi', 'yield', 'farm', 'ape', 'sushi', 'uniswap', 'compound', 'aave'],
    era: '2020–2021 — DeFi Summer',
    context: '"Just yield farm, bro." APYs of 1,000%. Liquidity mining. Food coins. Rugpulls disguised as protocols. Everyone was an on-chain degen that summer. The protocols were real, the yields were not — but for a few months, the music played and everyone danced.'
  },
  {
    keywords: ['pendle', 'ether.fi', 'restaking', 'eigenlayer', 'points'],
    era: '2024 — The Points Meta',
    context: 'Restaking promised yield on yield. Points were the new token. Eigenlayer\'s waitlist had 50,000 people. The airdrop was supposed to change everything. You were playing the meta correctly — the meta just changed faster than the rewards materialized.'
  },
]

function getContext(story: string, asset: string): { era: string, context: string } {
  const text = (story + ' ' + asset).toLowerCase()
  for (const item of CRYPTO_LORE) {
    if (item.keywords.some(k => text.includes(k))) {
      return { era: item.era, context: item.context }
    }
  }
  // Default — universal crypto grief
  return {
    era: 'The Crypto Markets',
    context: 'The market doesn\'t care about your research. It doesn\'t care about your conviction. It doesn\'t care that you read the whitepaper, that you believed in the team, that you sized correctly. The market does what it does — and sometimes it does it right on top of you. You are not the first. You will not be the last. That\'s not a consolation — it\'s a community.'
  }
}

function getCurrentWeek(): { week: number, year: number } {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
  return { week, year: now.getFullYear() }
}

type Step = 'form' | 'certificate' | 'community' | 'submitted'

export default function ConfessPage() {
  const [step, setStep] = useState<Step>('form')
  const [wallet, setWallet] = useState('')
  const [asset, setAsset] = useState('')
  const [lossAmount, setLossAmount] = useState('')
  const [story, setStory] = useState('')
  const [certificate, setCertificate] = useState('')
  const [contextInfo, setContextInfo] = useState<{ era: string, context: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confessionId, setConfessionId] = useState<string | null>(null)
  // Community join state
  const [email, setEmail] = useState('')
  const [xFollowed, setXFollowed] = useState(false)
  const [tgJoined, setTgJoined] = useState(false)
  const [skipCommunity, setSkipCommunity] = useState(false)

  const generateCertificate = () => {
    const ctx = getContext(story, asset)
    setContextInfo(ctx)
    const lossLine = lossAmount ? '$' + Number(lossAmount).toLocaleString() : 'an amount I still cannot say out loud'
    const assetLine = asset || 'a trade I would rather forget'
    const cert = `I, holder of wallet ${wallet.slice(0, 6)}...${wallet.slice(-4)}, hereby confess to the chain and to the community:

I lost ${lossLine} on ${assetLine}.

${story}

I carried this loss in silence. I refreshed charts at 3am. I told myself it would come back.

It did not come back.

And so — on this day — I release it. Not because the market gave it back. Not because I am over it. But because carrying it forward costs more than letting it go.

This is my Redemption Arc.

— ${ctx.era}`
    setCertificate(cert)
    setStep('certificate')
  }

  const submitConfession = async (villageEligible: boolean) => {
    setLoading(true)
    setError('')
    try {
      const { week, year } = getCurrentWeek()

      // If joining community, save member record first
      if (villageEligible && email) {
        await supabase.from('community_members').upsert({
          wallet_address: wallet,
          email,
          x_followed: xFollowed,
          tg_joined: tgJoined,
          village_eligible: true,
        }, { onConflict: 'wallet_address' })
      }

      const { data, error: err } = await supabase
        .from('confessions')
        .insert({
          wallet_address: wallet,
          story,
          loss_amount_usd: lossAmount ? parseFloat(lossAmount) : null,
          asset: asset || null,
          certificate_text: certificate,
          week_number: week,
          year,
          village_eligible: villageEligible,
        })
        .select('id')
        .single()

      if (err) throw err
      setConfessionId(data.id)
      setStep('submitted')
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-6 py-16">
      
      {/* Step: Form */}
      {step === 'form' && (
        <div className="w-full max-w-xl">
          <a href="/" className="text-gray-600 text-sm hover:text-gray-400 mb-8 inline-block">← Back</a>
          
          <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 text-red-400 text-sm font-semibold tracking-widest uppercase mb-6">
            The Confessional
          </div>
          
          <h1 className="text-4xl font-black mb-3">Tell Us What Happened</h1>
          <p className="text-gray-400 mb-10">No judgment. Only witnesses. The chain remembers — but the community forgives.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Your Wallet Address *</label>
              <input
                type="text"
                placeholder="0x..."
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 font-mono text-sm"
              />
              <p className="text-gray-600 text-xs mt-1">Used to identify your on-chain position. Never stored with your identity.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">The Asset</label>
                <input
                  type="text"
                  placeholder="ETH, LUNA, BAYC..."
                  value={asset}
                  onChange={e => setAsset(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Estimated Loss (USD)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={lossAmount}
                  onChange={e => setLossAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">What Happened? *</label>
              <textarea
                placeholder="I bought the top. I held through the bottom. I sold the bottom. Then it recovered. Tell us everything."
                value={story}
                onChange={e => setStory(e.target.value)}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
              />
              <p className="text-gray-600 text-xs mt-1">This is what the community votes on. Be honest. Be specific. Be human.</p>
            </div>

            <button
              onClick={generateCertificate}
              disabled={!wallet || !story}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-lg px-10 py-4 rounded-full transition-all transform hover:scale-[1.02] shadow-2xl shadow-purple-900/50"
            >
              Generate My Certificate of Release →
            </button>
          </div>
        </div>
      )}

      {/* Step: Certificate */}
      {step === 'certificate' && contextInfo && (
        <div className="w-full max-w-2xl">
          <div className="border border-purple-500/30 bg-purple-500/5 rounded-3xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📜</div>
              <h2 className="text-2xl font-black">Certificate of Release</h2>
              <p className="text-purple-400 text-sm mt-1">{contextInfo.era}</p>
            </div>

            <div className="bg-black/30 rounded-2xl p-6 font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
              {certificate}
            </div>

            {/* Cultural Context Card */}
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-2xl p-5 mb-6">
              <div className="text-yellow-400 font-bold text-sm mb-2 uppercase tracking-wider">Historical Context</div>
              <p className="text-gray-300 text-sm leading-relaxed italic">"{contextInfo.context}"</p>
            </div>

            <div className="text-center text-gray-500 text-xs mb-6">
              This confession will enter the weekly draw automatically.<br/>
              The community votes every Sunday. Winners announced on-chain.
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep('form')}
                className="flex-1 border border-white/10 hover:border-white/20 text-gray-400 font-semibold py-3 rounded-full transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => setStep('community')}
                className="flex-2 flex-grow bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-full transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Community Join */}
      {step === 'community' && (
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏘️</div>
            <div className="inline-block bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">
              Join the Village
            </div>
            <h2 className="text-3xl font-black mb-3">Want to compete for the Village Prize?</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              The <span className="text-purple-400 font-semibold">Second Chance draw ($25)</span> is automatic — you're already in.<br/>
              To be eligible for <span className="text-purple-400 font-semibold">It Takes a Village ($25 in $RDMPT)</span>, join the community of survivors.
            </p>
          </div>

          <div className="border border-purple-500/20 bg-purple-500/5 rounded-3xl p-6 mb-4 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Your Email *</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm"
              />
              <p className="text-gray-600 text-xs mt-1">For weekly draw notifications only. No spam, ever.</p>
            </div>

            {/* X Follow */}
            <div className="flex items-center justify-between border border-white/8 rounded-xl p-4">
              <div>
                <div className="font-semibold text-sm">Follow on X</div>
                <div className="text-gray-500 text-xs mt-0.5">@RedemptionArcWTF</div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/RedemptionArcWTF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs border border-white/15 text-gray-300 hover:bg-white/5 px-4 py-1.5 rounded-full transition-all"
                >
                  Follow →
                </a>
                <button
                  onClick={() => setXFollowed(!xFollowed)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    xFollowed ? 'bg-purple-500 border-purple-500' : 'border-gray-600'
                  }`}
                >
                  {xFollowed && <span className="text-white text-xs">✓</span>}
                </button>
              </div>
            </div>

            {/* Telegram */}
            <div className="flex items-center justify-between border border-white/8 rounded-xl p-4">
              <div>
                <div className="font-semibold text-sm">Join Telegram</div>
                <div className="text-gray-500 text-xs mt-0.5">Community of survivors</div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://t.me/RedemptionArcWTF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs border border-white/15 text-gray-300 hover:bg-white/5 px-4 py-1.5 rounded-full transition-all"
                >
                  Join →
                </a>
                <button
                  onClick={() => setTgJoined(!tgJoined)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    tgJoined ? 'bg-purple-500 border-purple-500' : 'border-gray-600'
                  }`}
                >
                  {tgJoined && <span className="text-white text-xs">✓</span>}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => submitConfession(!!email)}
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full transition-all"
            >
              {loading ? 'Submitting...' : 'Join the Village & Submit →'}
            </button>
          </div>

          {/* Skip option */}
          <div className="text-center">
            <button
              onClick={() => submitConfession(false)}
              disabled={loading}
              className="text-gray-600 hover:text-gray-400 text-sm transition-all"
            >
              Skip — just enter the Second Chance draw
            </button>
          </div>
        </div>
      )}

      {/* Step: Submitted */}
      {step === 'submitted' && (
        <div className="w-full max-w-xl text-center">
          <div className="text-6xl mb-6">🕊️</div>
          <h2 className="text-4xl font-black mb-4">It's Done.</h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Your confession is on the record. The community will witness it.<br/>
            You're entered in this week's draw.
          </p>

          <div className="border border-green-500/20 bg-green-500/5 rounded-2xl p-6 mb-8 text-left">
            <div className="text-green-400 font-bold mb-3">You're in for:</div>
            <div className="flex gap-4">
              <div className="flex-1 text-center border border-white/8 rounded-xl p-3">
                <div className="text-2xl font-black">🎲</div>
                <div className="text-yellow-400 font-bold text-sm mt-1">$25 Cash</div>
                <div className="text-gray-500 text-xs mt-0.5">Second Chance Draw</div>
                <div className="text-green-400 text-xs mt-1">✓ Entered</div>
              </div>
              <div className={`flex-1 text-center border rounded-xl p-3 ${email ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/8 opacity-50'}`}>
                <div className="text-2xl font-black">🏘️</div>
                <div className="text-purple-400 font-bold text-sm mt-1">$RDMPT</div>
                <div className="text-gray-500 text-xs mt-0.5">It Takes a Village</div>
                <div className={`text-xs mt-1 ${email ? 'text-green-400' : 'text-gray-600'}`}>
                  {email ? '✓ Village Eligible' : '✗ Not entered'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href="/"
              className="flex-1 border border-white/10 hover:border-white/20 text-gray-400 font-semibold py-3 rounded-full transition-all text-center"
            >
              Home
            </a>
            <a
              href="/confessions"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-full transition-all text-center"
            >
              See All Confessions →
            </a>
          </div>
        </div>
      )}
    </main>
  )
}
