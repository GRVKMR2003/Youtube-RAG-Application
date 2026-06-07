import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader, Clock, Youtube, MessageSquare } from 'lucide-react'
import { queryVideo } from '../utils/api.js'

function TimestampBadge({ ts, url, onClick }) {
  return (
    <button
      onClick={() => onClick(ts.timestamp, url)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 99, fontSize: 12,
        background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
        color: 'var(--accent3)', cursor: 'pointer', fontFamily: 'var(--font-body)',
        transition: 'background 0.15s', margin: '2px',
      }}
      title={ts.text}
    >
      <Clock size={11} /> {ts.timestamp_label}
    </button>
  )
}

function ChatBubble({ msg, onTimestampClick }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16, animation: 'fadeUp 0.3s ease',
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 10, marginTop: 2,
        }}>
          <span style={{ fontSize: 14 }}>⚡</span>
        </div>
      )}
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser
            ? 'linear-gradient(135deg, var(--accent), #8b5cf6)'
            : 'var(--bg2)',
          border: isUser ? 'none' : '1px solid var(--border)',
          color: 'var(--text)', fontSize: 14, lineHeight: 1.6,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {msg.content}
        </div>
        {msg.sources && msg.sources.length > 0 && (
          <div style={{ marginTop: 8, paddingLeft: 4 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Sources:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {msg.sources.map((s, i) => (
                <TimestampBadge key={i} ts={s} url={s.source} onClick={onTimestampClick} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage({ videoData }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: videoData
        ? `Video loaded! (ID: ${videoData.videoId})\n\nAsk me anything about it — I'll answer with timestamps so you can jump right to the relevant part.`
        : 'Please ingest a video first from the home page.',
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [playerTs, setPlayerTs] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: q }])
    setLoading(true)
    try {
      const data = await queryVideo(q, videoData?.videoId)
      setMessages(m => [...m, { role: 'assistant', content: data.answer, sources: data.sources }])
    } catch (err) {
      setMessages(m => [...m, {
        role: 'assistant',
        content: '⚠️ ' + (err?.response?.data?.detail || 'Something went wrong. Please try again.'),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleTimestampClick = (timestamp, url) => {
    setPlayerTs({ timestamp, url })
  }

  const videoId = videoData?.videoId
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}${playerTs ? `?start=${Math.floor(playerTs.timestamp)}&autoplay=1` : ''}`
    : null

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Chat panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg2)',
        }}>
          <MessageSquare size={18} color="var(--accent2)" />
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>Ask Questions</span>
          {videoData && (
            <span style={{
              marginLeft: 'auto', fontSize: 12, color: 'var(--text3)',
              background: 'var(--bg3)', padding: '3px 10px', borderRadius: 99,
              border: '1px solid var(--border)',
            }}>
              {videoData.videoId}
            </span>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} onTimestampClick={handleTimestampClick} />
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>⚡</div>
              <div style={{
                padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
              }}>
                <div className="dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} style={{ height: 24 }} />
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius2)', padding: '8px 8px 8px 16px',
          }}>
            <textarea
              rows={1}
              placeholder={videoData ? 'Ask anything about the video…' : 'Ingest a video first'}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
              }}
              disabled={!videoData || loading}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)',
                resize: 'none', lineHeight: 1.5, padding: '4px 0',
                maxHeight: 120, overflowY: 'auto',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || !videoData}
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: input.trim() && videoData ? 'linear-gradient(135deg, var(--accent), #8b5cf6)' : 'var(--bg)',
                border: 'none', cursor: input.trim() && videoData ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              {loading
                ? <Loader size={16} color="var(--text2)" style={{ animation: 'spin 1s linear infinite' }} />
                : <Send size={16} color={input.trim() && videoData ? '#fff' : 'var(--text3)'} />
              }
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 8 }}>
            Press Enter to send · Shift+Enter for new line · Click timestamps to jump in video
          </p>
        </div>
      </div>

      {/* Video panel */}
      {embedUrl && (
        <div style={{
          width: 380, borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', background: 'var(--bg2)',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Youtube size={16} color="var(--danger)" />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Video Preview</span>
          </div>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              key={playerTs?.timestamp}
              src={embedUrl}
              title="YouTube video"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
          {playerTs && (
            <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Jumped to</div>
              <div style={{ fontSize: 14, color: 'var(--accent3)', fontWeight: 500 }}>
                ⏱ {playerTs.timestamp_label || Math.floor(playerTs.timestamp) + 's'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
