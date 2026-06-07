import React, { useState } from 'react'
import { Youtube, ArrowRight, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { ingestVideo } from '../utils/api.js'

export default function HomePage({ onIngested }) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    setStatus('loading')
    setMessage('')
    try {
      const data = await ingestVideo(trimmed)
      setStatus('success')
      setMessage(`✓ ${data.chunks_stored} chunks stored — video is ready!`)
      setTimeout(() => {
        onIngested({ url: trimmed, videoId: data.video_id, chunksStored: data.chunks_stored })
      }, 800)
    } catch (err) {
      setStatus('error')
      setMessage(err?.response?.data?.detail || 'Failed to process video. Check the URL and try again.')
    }
  }

  const exampleUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/jNQXAC9IVRw',
    'https://www.youtube.com/watch?v=aircAruvnKk',
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      {/* BG decoration */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 60% 40%, rgba(108,99,255,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: 640, width: '100%', animation: 'fadeUp 0.5s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
            padding: '6px 16px', borderRadius: 99, fontSize: 12, color: 'var(--accent2)',
            marginBottom: 20, fontWeight: 500, letterSpacing: 0.5,
          }}>
            <span>⚡</span> AI-powered video knowledge base
          </div>

          <h1 style={{
            fontFamily: 'var(--font-head)', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800, lineHeight: 1.1, marginBottom: 16,
          }}>
            Talk to any{' '}
            <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              YouTube video
            </span>
          </h1>

          <p style={{ color: 'var(--text2)', fontSize: 17, lineHeight: 1.7 }}>
            Paste a YouTube URL, and ask anything. Get AI-powered answers with exact timestamps.
          </p>
        </div>

        {/* Input card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: var_radius2, padding: 24,
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            YouTube URL
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 14px' }}>
              <Youtube size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text)', fontSize: 14, padding: '13px 0',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={status === 'loading' || !url.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 20px', borderRadius: 'var(--radius)',
                background: status === 'loading' ? 'var(--bg3)' : 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: status === 'loading' || !url.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', transition: 'opacity 0.2s',
                opacity: !url.trim() ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {status === 'loading' ? (
                <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
              ) : (
                <>Process <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          {/* Status message */}
          {message && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius)',
              background: status === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)',
              border: `1px solid ${status === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}`,
              color: status === 'error' ? 'var(--danger)' : 'var(--success)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
            }}>
              {status === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
              {message}
            </div>
          )}
        </div>

        {/* Example URLs */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Try an example:</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {exampleUrls.map((u, i) => (
              <button
                key={i}
                onClick={() => setUrl(u)}
                style={{
                  padding: '6px 12px', borderRadius: 99, fontSize: 11,
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'border-color 0.15s',
                }}
              >
                Example {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
          {['🔍 Semantic search', '📍 Timestamps', '🧠 AI answers', '📄 PDF notes', '⚡ GPT-4o mini'].map(f => (
            <span key={f} style={{
              padding: '5px 12px', borderRadius: 99, fontSize: 12,
              background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)',
            }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const var_radius2 = 'var(--radius2)'
