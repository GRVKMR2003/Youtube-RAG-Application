import React from 'react'
import { Youtube, MessageSquare, FileText, Upload, Home, ChevronLeft, ChevronRight, Zap } from 'lucide-react'

const NAV = [
  { id: 'home',    icon: Home,           label: 'New Video' },
  { id: 'chat',    icon: MessageSquare,  label: 'Ask Questions' },
  { id: 'summary', icon: FileText,       label: 'Summary' },
  { id: 'notes',   icon: Upload,         label: 'Upload Notes' },
]

export default function Sidebar({ page, setPage, videoData, open, setOpen }) {
  const s = {
    sidebar: {
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: open ? 240 : 64,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      transition: 'width 0.3s ease',
      display: 'flex', flexDirection: 'column',
      zIndex: 100, overflow: 'hidden',
    },
    logo: {
      display: 'flex', alignItems: 'center', gap: 10,
      padding: open ? '20px 20px 12px' : '20px 16px 12px',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
    },
    logoIcon: {
      width: 32, height: 32, borderRadius: 8,
      background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    logoText: {
      fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18,
      color: 'var(--text)', whiteSpace: 'nowrap',
      opacity: open ? 1 : 0, transition: 'opacity 0.2s',
    },
    nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 },
    navBtn: (active) => ({
      display: 'flex', alignItems: 'center', gap: 12,
      padding: open ? '10px 14px' : '10px',
      borderRadius: 'var(--radius)',
      background: active ? 'rgba(108,99,255,0.18)' : 'transparent',
      border: active ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
      color: active ? 'var(--accent2)' : 'var(--text2)',
      cursor: 'pointer', width: '100%', textAlign: 'left',
      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 500 : 400,
      transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden',
    }),
    navLabel: {
      opacity: open ? 1 : 0, transition: 'opacity 0.2s',
    },
    videoChip: {
      margin: '0 8px 12px',
      padding: '10px 12px',
      borderRadius: 'var(--radius)',
      background: 'rgba(56,189,248,0.08)',
      border: '1px solid rgba(56,189,248,0.2)',
      fontSize: 12, color: 'var(--accent3)',
      display: open && videoData ? 'block' : 'none',
      overflow: 'hidden',
    },
    toggleBtn: {
      margin: 8, padding: '8px',
      display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-end' : 'center',
      background: 'none', border: 'none', color: 'var(--text3)',
      cursor: 'pointer', borderRadius: 'var(--radius)',
    },
  }

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoIcon}><Zap size={16} color="#fff" /></div>
        <span style={s.logoText}>VideoMind</span>
      </div>

      <nav style={s.nav}>
        {NAV.map(({ id, icon: Icon, label }) => {
          const disabled = (id === 'chat' || id === 'summary') && !videoData
          return (
            <button
              key={id}
              onClick={() => !disabled && setPage(id)}
              style={{ ...s.navBtn(page === id), opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
              title={!open ? label : ''}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span style={s.navLabel}>{label}</span>
            </button>
          )
        })}
      </nav>

      {videoData && (
        <div style={s.videoChip}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, opacity: 0.7 }}>Active Video</div>
          <div style={{ fontWeight: 500, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {videoData.videoId}
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{videoData.chunksStored} chunks stored</div>
        </div>
      )}

      <button style={s.toggleBtn} onClick={() => setOpen(o => !o)}>
        {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </aside>
  )
}
