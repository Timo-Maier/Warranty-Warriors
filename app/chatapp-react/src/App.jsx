import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './App.module.css'

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

function WarrantyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function TypingDots() {
  return (
    <span className={styles.typingDots}>
      <span /><span /><span />
    </span>
  )
}

async function callAgent(query) {
  const res = await fetch('/odata/v4/agent/analyzeWarrantyClaims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.value ?? data
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const reply = await callAgent(text)
      setMessages(prev => [...prev, { role: 'assistant', content: String(reply) }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setInput('')
    setLoading(false)
  }

  const isEmpty = messages.length === 0 && !loading

  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img src="/logo.png" alt="MANN+HUMMEL" className={styles.headerLogo} />
        </div>
        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={clearChat} title="Clear conversation">
            <TrashIcon />
            <span>Clear chat</span>
          </button>
        )}
      </header>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <span className={styles.sidebarHeading}>About</span>
          <p className={styles.sidebarInfo}>
            Ask about failure patterns, cost drivers, regional trends, supplier quality, claim volumes, or anomalies in your warranty dataset.
          </p>
        </div>
      </aside>

      {/* Chat column */}
      <div className={styles.chatColumn}>
        <main className={styles.main}>
          {isEmpty && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><WarrantyIcon /></div>
              <h2>Analyze your warranty claims data</h2>
              <p>Identify failure patterns, cost drivers, and anomalies across your claims dataset.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`${styles.row} ${msg.role === 'user' ? styles.rowUser : styles.rowAssistant}`}>
              {msg.role === 'assistant' && (
                <span className={styles.avatar}><WarrantyIcon /></span>
              )}
              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                    table: ({ node, ...props }) => <div className={styles.tableWrap}><table {...props} /></div>,
                    a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
                  }}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.row} ${styles.rowAssistant}`}>
              <span className={styles.avatar}><WarrantyIcon /></span>
              <div className={`${styles.bubble} ${styles.bubbleAssistant} ${styles.bubbleLoading}`}>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        {/* Footer input */}
        <footer className={styles.footer}>
          <div className={styles.inputWrap}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe a pattern, anomaly, or question about your warranty data…"
              rows={1}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              title="Send message"
            >
              <SendIcon />
            </button>
          </div>
          <p className={styles.hint}>Enter to send · Shift+Enter for new line</p>
        </footer>
      </div>
    </div>
  )
}
