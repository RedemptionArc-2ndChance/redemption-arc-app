export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-6">
      {/* Hero */}
      <div className="text-center max-w-2xl">
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

        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg px-10 py-4 rounded-full transition-all transform hover:scale-105 shadow-2xl shadow-purple-900/50">
          Connect Wallet & Confess
        </button>

        <p className="text-gray-600 text-sm mt-4">
          No wallet data stored · On BASE · Weekly prizes
        </p>
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

      {/* Footer */}
      <div className="mt-24 text-gray-700 text-sm text-center">
        <p>Built on BASE · Powered by $REDEMPTION · Every Sunday</p>
        <p className="mt-1">redemptionarc.wtf</p>
      </div>
    </main>
  );
}
