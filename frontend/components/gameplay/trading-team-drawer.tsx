'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, BrainCircuit } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Props {
  isOpen: boolean
  onClose: () => void
  marketContext: { price: number; rsi: number; macd: number; news: string }
}

export function TradingTeamDrawer({ isOpen, onClose, marketContext }: Props) {
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = { id: Math.random().toString(36).substring(7), role: 'user', content: inputValue.trim() }
    const newMessages = [...messages, userMessage]
    
    setMessages(newMessages)
    setInputValue('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          marketContext,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      if (!response.body) throw new Error('No readable stream')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      let aiContent = ''
      const assistantMessageId = Math.random().toString(36).substring(7)
      
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        aiContent += chunk
        setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: aiContent } : m))
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Connection error during AI analysis.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[499] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#0a0d0f] border-l border-[#1c2635] z-[500] flex flex-col shadow-2xl"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2635] bg-[#0d1117] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <BrainCircuit className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white tracking-wide">AI Trading Teacher</h3>
                  <p className="text-[11px] text-[#64748b]">Learn from market context</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#1c2635] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#334155 transparent',
              }}
            >
              {messages.length === 0 && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                  <BrainCircuit className="w-12 h-12 text-[#1c2635] mb-4" />
                  <p className="text-[#64748b] text-[13px] font-medium leading-relaxed">
                    Ask a question about the current market setup or trading concepts.<br/>
                    The AI Teacher will explain based on real-time data.
                  </p>
                </div>
              )}

              {messages.map((m) => {
                if (m.role === 'user') {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-[13px] leading-relaxed shadow-sm">
                        {m.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className="flex justify-start">
                    <div className="bg-[#1c2635] border border-[#334155] text-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[90%] text-[13px] leading-relaxed shadow-sm">
                      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-3 [&>strong]:text-white">
                        <ReactMarkdown>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start mt-2">
                  <div className="bg-[#1c2635] border border-[#334155] px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-500/60"
                        animate={{ y: [0, -3, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#1c2635] bg-[#0d1117] shrink-0">
              <form onSubmit={sendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question about the market..."
                  disabled={isLoading}
                  className="w-full bg-[#080b0e] border border-[#1c2635] rounded-xl pl-4 pr-12 py-3.5 text-[13px] text-white placeholder-[#64748b] focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-50 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-0 disabled:pointer-events-none transition-all"
                >
                  <Play className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
