'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot } from 'lucide-react'

// ─── Keyword → Response map (20 educational responses) ───
const responses: [RegExp, string][] = [
    [/rsi|relative strength|oversold/i,
        "RSI at 23 means the stock is deeply oversold — technically 'cheap' on momentum terms. BUT here's the trap: in a solvency crisis, oversold becomes more oversold. RSI saved no one who held Lehman on Sept 15. Context > indicators every time."],
    [/macd|momentum|bearish cross/i,
        "MACD at -2.4 with a bearish cross confirms downward momentum is in full force. The histogram bars are expanding — that means selling pressure is INCREASING, not decreasing. No divergence signal to suggest a reversal is near."],
    [/volume|high vol|why.*vol/i,
        "Volume at 8.7× average is institutional panic. Mutual funds, banks, and hedge funds are dumping at any price to reduce exposure. When volume spikes on red days like this, it signals capitulation — large holders giving up."],
    [/hint|stuck|help me|what should/i,
        "Here's your hint without spoiling it:\nLook at three things in order:\n1. Has the stock respected any support level?\n2. Is today's news operational bad news or EXISTENTIAL bad news?\n3. When institutions are selling at 8.7× volume, who is buying?"],
    [/chart|pattern|candlestick/i,
        "The chart shows 53 trading days of lower highs and lower lows — a textbook downtrend. Each bounce attempt was weaker than the last. The last 2 weeks show near-vertical decline with massive red candles and almost no green recovery days."],
    [/bankrupt|lehman|chapter 11/i,
        "Lehman filed Chapter 11 at 1:45 AM this morning. That means they cannot meet short-term debt obligations despite having assets. The equity (stock) in a Chapter 11 filing typically goes to near-zero because debt holders get paid first."],
    [/bail|government|fed|rescue/i,
        "The Fed let Lehman fail after rescuing Bear Stearns in March 2008. The message: not everyone gets saved. This removed the 'government will step in' safety net that traders had assumed was there."],
    [/support|resistance|level/i,
        "The previous support at $4.50 broke 3 days ago and is now acting as resistance. The next 'support' would be technical levels from 1995-1998 — but in a bankruptcy, technical support is irrelevant. Fundamentals overwhelm technicals in these moments."],
    [/today|what happened|news today/i,
        "Right now (7:23 AM, pre-market):\n- Lehman has filed Chapter 11\n- Merrill Lynch sold to Bank of America\n- AIG is also teetering (down 60% pre-market)\n- Fed convening emergency session\n- Asian markets down 5-8%\nThis is not a bad earnings report. This is a financial system event."],
    [/korea|kdb|deal/i,
        "The Korea Development Bank was exploring a potential acquisition of Lehman in August. The stock rallied +16% that week on the rumors. But the deal fell through on Sept 9, causing a 45% single-day crash. False hope is the cruelest catalyst."],
    [/bear stearns|bear.*stearns/i,
        "Bear Stearns collapsed in March 2008 and was rescued by the Fed (sold to JPMorgan at $10/share). Many traders assumed Lehman would get the same treatment. They were wrong. The government decided to draw a line."],
    [/aig|insurance/i,
        "AIG is down 60% in pre-market right now. They're the world's largest insurer and have massive exposure to credit default swaps tied to subprime mortgages. If AIG falls too, the entire financial system's counterparty risk explodes."],
    [/bounce|recovery|oversold.*buy/i,
        "Dead cat bounces happen even in terminal declines. Lehman bounced from $13 to $17 in July, and from $12.95 to $14.90 on KDB rumors in August. Both failed. The question is: does TODAY's news create a bounce opportunity or is this different?"],
    [/short|sell.*short/i,
        "Short interest in Lehman was extremely high through 2008. Short sellers were proven right. But timing short positions during panic is dangerous — even in collapses, short squeezes can trigger violent upward moves."],
    [/put|option|call/i,
        "The options market was pricing extreme moves. Put premiums (betting on decline) skyrocketed. The implied volatility on LEH options exceeded 200% — the market was saying 'anything can happen, but probably down.'"],
    [/cds|credit default|swap/i,
        "Lehman's CDS spread hit record levels, meaning the cost to insure against their default was astronomical. This is the bond market saying 'we think default is near-certain.' Bond markets are usually right."],
    [/vix|fear|volatil/i,
        "The VIX (fear index) is at 31.7 and climbing. For context, normal is 12-18. Above 30 signals extreme fear. It would eventually reach 80 during the peak of this crisis. We're still in the early innings of the panic."],
    [/merrill|bank of america|boa/i,
        "Merrill Lynch was sold to Bank of America over the same weekend Lehman collapsed. The CEO of Merrill saw what was happening to Lehman and struck a deal at $50B before his bank suffered the same fate. Smart survival move."],
    [/history|158.*year|institution/i,
        "Lehman Brothers survived the Civil War, two World Wars, the Great Depression, and every previous financial crisis in 158 years. The market thought 'too big to fail' meant 'will not fail.' Those are very different things."],
    [/focus|where.*look|what.*analyze/i,
        "Three things in order: 1) The overall trend (lower highs for 53 straight days) 2) Today's news severity (bankruptcy = existential, not operational) 3) Volume confirmation (institutions dumping). Don't predict a bounce just because RSI is oversold — context is everything here."],
]

const DEFAULT_RESPONSE = "Sharp observation. My suggestion: before picking your direction, ask yourself — is this a 'temporary problem' or a 'permanent problem'? That single question often cuts through the noise."

function getAIResponse(input: string): string {
    const lower = input.toLowerCase()
    for (const [pattern, response] of responses) {
        if (pattern.test(lower)) return response
    }
    return DEFAULT_RESPONSE
}

// ─── Types ───────────────────────────────────────────────
interface Message {
    role: 'ai' | 'user'
    text: string
}

const quickQuestions = [
    'What is RSI?',
    'Chart pattern?',
    'Give me a hint',
    'Why is volume high?',
]

// ─── Component ───────────────────────────────────────────
interface AITutorProps {
    isOpen: boolean
    onClose: () => void
}

export function AITutor({ isOpen, onClose }: AITutorProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            text: "I'm your trading assistant. What do you want to know about Lehman Brothers, the chart, or market signals?",
        },
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const chatRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
        }, 50)
    }, [])

    const sendMessage = useCallback(
        (text: string) => {
            if (!text.trim()) return
            const userMsg: Message = { role: 'user', text: text.trim() }
            setMessages((prev) => [...prev, userMsg])
            setInput('')
            setIsTyping(true)
            scrollToBottom()

            setTimeout(() => {
                const aiResponse = getAIResponse(text)
                setMessages((prev) => [...prev, { role: 'ai', text: aiResponse }])
                setIsTyping(false)
                scrollToBottom()
            }, 800)
        },
        [scrollToBottom]
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(input)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[499] bg-black/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        className="fixed right-0 top-0 bottom-0 w-[320px] bg-[#080808] border-l border-[#1a1a1a] z-[500] flex flex-col"
                        initial={{ x: 320 }}
                        animate={{ x: 0 }}
                        exit={{ x: 320 }}
                        transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#111]">
                            <div className="flex items-center gap-2">
                                <span className="text-[15px] font-semibold text-white">AI Tutor</span>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-[#141414] transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[11px] text-white/25 px-4 py-2 border-b border-[#111]">
                            Ask anything about this scenario
                        </p>

                        {/* Quick questions */}
                        <div className="grid grid-cols-2 gap-2 p-3 border-b border-[#111]">
                            {quickQuestions.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => sendMessage(q)}
                                    className="text-left text-[12px] text-white/35 bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-2.5 py-2 hover:border-[#333] hover:text-white/60 hover:bg-[#111] transition-all cursor-pointer"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Messages */}
                        <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {msg.role === 'ai' && (
                                        <div className="flex gap-2 max-w-[90%]">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-white/20 block mb-1">ZDM AI</span>
                                                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl rounded-tl-sm px-3 py-2.5">
                                                    <p className="text-[13px] text-white/55 leading-relaxed whitespace-pre-line">{msg.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {msg.role === 'user' && (
                                        <div className="bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] rounded-xl rounded-tr-sm px-3 py-2.5 max-w-[85%]">
                                            <p className="text-[13px] text-white/55 leading-relaxed">{msg.text}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <motion.div
                                    className="flex gap-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <div className="bg-[#111] border border-[#1a1a1a] rounded-xl rounded-tl-sm px-4 py-3">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((d) => (
                                                <motion.span
                                                    key={d}
                                                    className="w-1.5 h-1.5 rounded-full bg-white/30"
                                                    animate={{ scale: [0.6, 1, 0.6] }}
                                                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 border-t border-[#111]">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="flex-1 h-9 px-3 bg-[#111] border border-[#1a1a1a] rounded-lg text-[13px] text-white placeholder:text-white/20 focus:border-[#333] focus:outline-none transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                                    style={{
                                        backgroundColor: 'rgba(34,197,94,0.1)',
                                        border: '1px solid #22c55e',
                                        color: '#22c55e',
                                    }}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
