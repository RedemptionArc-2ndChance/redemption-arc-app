"use client";
import { useEffect, useState } from "react";

function usePrizePool() {
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const prizeWallet = "0x211094117ca68e62d957af8312d5a18821d8a147";
        const data = "0x70a08231" + "000000000000000000000000" + prizeWallet.slice(2);
        const res = await fetch("https://base.llamarpc.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", data }, "latest"], id: 1 }),
        });
        const json = await res.json();
        const raw = json.result;
        if (raw && raw !== "0x") setBalance(parseInt(raw, 16) / 1e6);
      } catch {}
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);
  return balance;
}

export default function Home() {
  const prizePool = usePrizePool();
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-6">
      {/* Hero */}
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.jpg"
            alt="Redemption Arc"
            className="w-48 h-48 object-contain"
          />
        </div>

        <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 text-red-400 text-sm font-semibold tracking-widest uppercase mb-8">
          Every Loss Has a Second Chapter
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none">
          Your Crypto{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Redemption Arc
          </span>{" "}
          Starts Here
        </h1>

        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          Confess your worst trade. Release the pain. Let the community witness it.
          The greater your disaster — the greater your shot at redemption.
        </p>

        <a href="/confess" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg px-10 py-4 rounded-full transition-all transform hover:scale-105 shadow-2xl shadow-purple-900/50">
          Connect Wallet & Confess
        </a>

        <p className="text-gray-600 text-sm mt-4">
          No wallet data stored · On BASE · Weekly prizes
        </p>
      </div>

      {/* Live Prize Pool */}
      <div className="mt-12 w-full max-w-sm">
        <div className="border border-green-500/30 bg-green-500/5 rounded-2xl p-5 text-center">
          <div className="text-xs font-bold text-green-400/60 tracking-widest uppercase mb-1">Live Prize Pool</div>
          <div className="text-4xl font-black text-green-400 mb-1">
            {prizePool !== null ? `$${prizePool.toFixed(2)}` : "—"} <span className="text-xl">USDC</span>
          </div>
          <div className="text-gray-500 text-xs">Held in <span className="text-green-400/70">redemptionprizes.base.eth</span> · Verified on-chain</div>
          <a href="https://basescan.org/address/0x211094117ca68e62d957af8312d5a18821d8a147" target="_blank" rel="noopener noreferrer"
            className="inline-block mt-3 text-xs text-green-400/50 hover:text-green-400 transition-colors">
            View on BaseScan →
          </a>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {[
          {
            step: "01",
            title: "Confess Your Loss",
            desc: "Connect your wallet. Our AI finds your worst on-chain trade and presents it with the gravity it deserves.",
            color: "border-red-500/20 bg-red-500/5",
          },
          {
            step: "02",
            title: "Set It Free",
            desc: "Sign a message. Release the weight of that trade. Get a shareable Certificate of Release.",
            color: "border-purple-500/20 bg-purple-500/5",
          },
          {
            step: "03",
            title: "Get Redeemed",
            desc: "Enter the Second Chance draw. The community votes for the most painful story. Two winners every Sunday.",
            color: "border-pink-500/20 bg-pink-500/5",
          },
        ].map((item) => (
          <div key={item.step} className={`border rounded-2xl p-6 ${item.color}`}>
            <div className="text-4xl font-black text-gray-700 mb-3">{item.step}</div>
            <h3 className="text-lg font-bold mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Prizes */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">🎲</div>
          <div className="text-yellow-400 font-bold text-lg mb-1">Second Chance</div>
          <div className="text-3xl font-black mb-2">$25</div>
          <div className="text-gray-400 text-sm">Weighted random draw.<br/>Bigger loss = more entries.</div>
        </div>
        <div className="border border-purple-500/20 bg-purple-500/5 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">🏘️</div>
          <div className="text-purple-400 font-bold text-lg mb-1">It Takes a Village</div>
          <div className="text-3xl font-black mb-2">$25 in $RDMPT</div>
          <div className="text-gray-400 text-sm">Community votes.<br/>The people decide who suffered most.</div>
        </div>
      </div>

      {/* Video */}
      <div className="mt-20 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="inline-block bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-gray-400 text-sm font-semibold tracking-widest uppercase mb-4">
            The Story
          </div>
          <h2 className="text-2xl font-black">Watch Before You Confess</h2>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
          <video
            src="https://d19fa2ka4qs0b8.cloudfront.net/clips/g75JkFRtBZY/20260312_203907-redemption-arc-second-chance-for-crypto-survivors.mp4"
            poster="/logo.jpg"
            controls
            playsInline
            className="w-full"
          />
        </div>
        <p className="text-center text-gray-600 text-xs mt-3 italic">
          "Certificate of Release" — your worst trade might be your best story.
        </p>
      </div>

      {/* Roadmap */}
      <div className="mt-24 max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="inline-block bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-gray-400 text-sm font-semibold tracking-widest uppercase mb-4">
            The Mission
          </div>
          <h2 className="text-3xl font-black">Five Stages of Redemption</h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { num: "I", icon: "🔦", title: "Find the Survivors", desc: "Confess your worst trade. You are not alone.", tg: false },
              { num: "II", icon: "🤝", title: "Regroup & Support", desc: "Join the Telegram. The community witnesses your story. You witness theirs. Released pain becomes shared strength.", tg: true },
              { num: "III", icon: "🩹", title: "Feed the Most Needy", desc: "Weekly prizes go to those who lost the most. Bigger loss — bigger shot.", tg: false },
              { num: "IV", icon: "💪", title: "Make Us Stronger", desc: "Stay in the Telegram. We are organizing. Transforming released pain into the next mega-community. Hold $RDMPT. The LP is coming.", tg: true },
              { num: "V", icon: "⚔️", title: "Get Back in the Game", desc: "Redeemed. Rebuilt. Ready. Your arc isn't over.", tg: false },
            ].map((stage, i) => (
              <div key={i} className={`relative text-center p-5 border rounded-2xl transition-all ${stage.tg ? 'border-purple-500/25 bg-purple-500/5 hover:border-purple-500/50' : 'border-white/8 bg-white/2 hover:border-purple-500/30'}`}>
                <div className="text-xs font-bold text-purple-500/60 tracking-widest mb-2">STAGE {stage.num}</div>
                <div className="text-3xl mb-3">{stage.icon}</div>
                <h3 className="font-bold text-sm mb-2 leading-tight">{stage.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{stage.desc}</p>
                {stage.tg && (
                  <a href="https://t.me/RedemptionArcWTF" target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs text-purple-400 border border-purple-500/30 rounded-full px-3 py-1 hover:bg-purple-500/10 transition-all">
                    📢 Join Telegram →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 text-gray-700 text-sm text-center">
        <p>Built on BASE · Powered by $REDEMPTION · Every Sunday</p>
        <p className="mt-1">redemptionarc.wtf</p>
      </div>
    </main>
  );
}
