import React, { useState } from 'react'
import { FileText, Loader, ChevronRight, Tag, Zap } from 'lucide-react'
import { summarizeVideo } from '../utils/api.js'

export default function SummaryPage({ videoData }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSummarize = async () => {
    if (!videoData) return
    setLoading(true)
    setError('')
    try {
      const data = await summarizeVideo(videoData.videoId)
      setSummary(data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to generate summary.')
    } finally {
      setLoading(false)
    }
  }

  if (!videoData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text2)' }}>
        Please ingest a video first.
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <FileText size={22} color="var(--accent2)" />
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>Video Summary</h1>
      </div>

      {!summary && !loading && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius2)', padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 8 }}>Generate a Summary</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>
            Get key points, topics, and a structured overview of your video.
          </p>
          <button
            onClick={handleSummarize}
            style={{
              padding: '12px 28px', borderRadius: 'var(--radius)',
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              border: 'none', color: '#fff', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <Zap size={16} /> Summarize Video
          </button>
        </div>
      )}

      {loading && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius2)', padding: 48, textAlign: 'center',
        }}>
          <Loader size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
          <p style={{ color: 'var(--text2)' }}>Analyzing video content…</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: 16, borderRadius: 'var(--radius)', marginBottom: 16,
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          color: 'var(--danger)',
        }}>{error}</div>
      )}

      {summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.4s ease' }}>
          {/* Title */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(56,189,248,0.08))',
            border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: 24,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Title</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700 }}>{summary.title}</h2>
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Overview</div>
            <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: 15 }}>{summary.summary}</p>
          </div>

          {/* Key points */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Key Points</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {summary.key_points.map((pt, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <ChevronRight size={16} color="var(--accent2)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, lineHeight: 1.6 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Topics Covered</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {summary.topics.map((t, i) => (
                <span key={i} style={{
                  padding: '6px 14px', borderRadius: 99, fontSize: 13,
                  background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
                  color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <Tag size={11} /> {t}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleSummarize}
            style={{
              alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 'var(--radius)',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              color: 'var(--text2)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            ↻ Re-generate
          </button>
        </div>
      )}
    </div>
  )
}
