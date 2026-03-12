'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Confession = {
  id: string
  wallet_address: string
  story: string
  loss_amount_usd: number | null
  asset: string | null
  certificate_text: string | null
  week_number: number
  year: number
  created_at: string
  is_winner_second_chance: boolean
  is_winner_village: boolean
  vote_count?: number
}

export default function ConfessionsPage() {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<string | null>(null)
  const [voterWallet, setVoterWallet] = useState('')
  const [showVoteInput, setShowVoteInput] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const currentWeek = (() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
    return { week, year: now.getFullYear() }
  })()

  useEffect(() => {
    fetchConfessions()
  }, [])

  async function fetchConfessions() {
    setLoading(true)
    const { data: conf } = await supabase
      .from('confessions')
      .select('*')
      .eq('week_number', currentWeek.week)
      .eq('year', currentWeek.year)
      .order('created_at', { ascending: false })

    const { data: votes } = await supabase
      .from('votes')
      .select('confession_id')
      .eq('week_number', currentWeek.week)
      .eq('year', currentWeek.year)

    const counts: Record<string, number> = {}
    votes?.forEach(v => {
      counts[v.confession_id] = (counts[v.confession_id] || 0) + 1
    })

    setConfessions(conf || [])
    setVoteCounts(counts)
    setLoading(false)
  }

  async function submitVote(confessionId: string) {
    if (!voterWallet.startsWith('0x')) {
      showToast('Enter a valid wallet address to vote')
      return
    }
    setVoting(confessionId)
    const { error } = await supabase.from('votes').insert({
      confession_id: confessionId,
      voter_wallet: voterWallet,
      week_number: currentWeek.week,
      year: currentWeek.year,
    })
    if (error) {
      if (error.code === '23505') showToast('You already voted this week!')
      else showToast('Vote failed — try again')
    } else {
      showToast('Vote cast! 🗳️')
      setVoteCounts(prev => ({ ...prev, [confessionId]: (prev[confessionId] || 0) + 1 }))
      setShowVoteInput(null)
      setVoterWallet('')
    }
    setVoting(null)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function shortenWallet(w: string) {
    return `${w.slice(0, 6)}...${w.slice(-4)}`
  }

  function formatLoss(n: number | null) {
    if (!n) return null
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
    return `$${n.toLocaleString()}`
  }

  const totalLost = confessions.reduce((sum, c) => sum + (c.loss_amount_usd || 0), 0)
  const sortedByVotes = [...confessions].sort(
    (a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0)
  )

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-16">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-2xl z-50 transition-all">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <a href="/" className="text-gray-600 text-sm hover:text-gray-400">← Home</a>
          <a href="/confess" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-5 py-2 rounded-full hover:opacity-90 transition-all">
            + Add Mine
          </a>
        </div>

        <div className="mb-10">
          <div className="inline-block bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Week {currentWeek.week} Confessions
          </div>
          <h1 className="text-4xl font-black mb-2">The Community Confessional</h1>
          <p className="text-gray-400">Vote for the most painful story. Winner gets <span className="text-purple-400 font-semibold">$25 in $RDMPT</span> every Sunday.</p>
        </div>

        {/* Stats bar */}
        {confessions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="border border-white/5 bg-white/3 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black">{confessions.length}</div>
              <div className="text-gray-500 text-xs mt-1">Confessions</div>
            </div>
            <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-red-400">{formatLoss(totalLost)}</div>
              <div className="text-gray-500 text-xs mt-1">Total Pain</div>
            </div>
            <div className="border border-purple-500/20 bg-purple-500/5 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-purple-400">
                {Object.values(voteCounts).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-gray-500 text-xs mt-1">Votes Cast</div>
            </div>
          </div>
        )}

        {/* Confessions list */}
        {loading ? (
          <div className="text-center text-gray-600 py-20">Loading confessions...</div>
        ) : confessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🤫</div>
            <p className="text-gray-500">No confessions yet this week.</p>
            <a href="/confess" className="inline-block mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3 rounded-full">
              Be the First →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedByVotes.map((c, i) => {
              const votes = voteCounts[c.id] || 0
              const isExpanded = expandedId === c.id
              const isVoting = showVoteInput === c.id
              const isLeading = i === 0 && votes > 0

              return (
                <div
                  key={c.id}
                  className={`border rounded-2xl p-6 transition-all ${
                    isLeading
                      ? 'border-purple-500/40 bg-purple-500/8'
                      : 'border-white/8 bg-white/3 hover:border-white/15'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {isLeading && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                          👑 Leading
                        </span>
                      )}
                      {c.asset && (
                        <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">
                          {c.asset}
                        </span>
                      )}
                      {c.loss_amount_usd && (
                        <span className="text-red-400 font-black text-lg">
                          {formatLoss(c.loss_amount_usd)}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 text-xs font-mono shrink-0">
                      {shortenWallet(c.wallet_address)}
                    </div>
                  </div>

                  {/* Story */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {isExpanded ? c.story : c.story.length > 200 ? c.story.slice(0, 200) + '...' : c.story}
                    {c.story.length > 200 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className="text-purple-400 ml-2 hover:text-purple-300 text-xs"
                      >
                        {isExpanded ? 'less' : 'read more'}
                      </button>
                    )}
                  </p>

                  {/* Certificate preview */}
                  {isExpanded && c.certificate_text && (
                    <div className="bg-black/30 rounded-xl p-4 mb-4 font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                      {c.certificate_text}
                    </div>
                  )}

                  {/* Bottom row — votes + vote button */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-gray-600 text-xs">
                      {votes > 0 ? (
                        <span className="text-purple-400 font-semibold">{votes} vote{votes !== 1 ? 's' : ''}</span>
                      ) : (
                        <span>No votes yet</span>
                      )}
                    </div>

                    {!isVoting ? (
                      <button
                        onClick={() => setShowVoteInput(c.id)}
                        className="text-sm border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 px-4 py-1.5 rounded-full transition-all font-semibold"
                      >
                        🗳️ Vote
                      </button>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Your 0x wallet..."
                          value={voterWallet}
                          onChange={e => setVoterWallet(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 w-40"
                        />
                        <button
                          onClick={() => submitVote(c.id)}
                          disabled={voting === c.id}
                          className="text-xs bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-full font-semibold transition-all"
                        >
                          {voting === c.id ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => { setShowVoteInput(null); setVoterWallet('') }}
                          className="text-gray-600 hover:text-gray-400 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-700 text-xs">
          <p>Draws run every Sunday · Winners announced on-chain · Built on BASE</p>
        </div>
      </div>
    </main>
  )
}
