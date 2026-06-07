import React, { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { uploadNotes } from '../utils/api.js'

export default function NotesPage() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [uploads, setUploads] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    setStatus('loading')
    setMessage('')
    try {
      const data = await uploadNotes(file)
      setStatus('success')
      setMessage(`✓ ${data.chunks_stored} chunks stored from "${data.filename}"`)
      setUploads(u => [...u, { name: data.filename, chunks: data.chunks_stored, id: data.doc_id }])
    } catch (err) {
      setStatus('error')
      setMessage(err?.response?.data?.detail || 'Upload failed.')
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Upload size={22} color="var(--accent2)" />
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>Upload Notes</h1>
      </div>
      <p style={{ color: 'var(--text2)', marginBottom: 32 }}>
        Upload PDFs or text files to combine with your video knowledge. Ask questions across all sources.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius2)', padding: 48,
          textAlign: 'center', cursor: 'pointer',
          background: dragging ? 'rgba(108,99,255,0.06)' : 'var(--bg2)',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        {status === 'loading' ? (
          <Loader size={36} color="var(--accent)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        ) : (
          <Upload size={36} color={dragging ? 'var(--accent)' : 'var(--text3)'} style={{ margin: '0 auto 12px' }} />
        )}
        <p style={{ fontWeight: 600, marginBottom: 6 }}>
          {status === 'loading' ? 'Uploading…' : 'Drop a file or click to browse'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text3)' }}>Supports PDF and TXT files</p>
      </div>

      {/* Status */}
      {message && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 'var(--radius)',
          background: status === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)',
          border: `1px solid ${status === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}`,
          color: status === 'error' ? 'var(--danger)' : 'var(--success)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
        }}>
          {status === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          {message}
        </div>
      )}

      {/* Uploaded files list */}
      {uploads.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Uploaded this session
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {uploads.map((u, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '12px 16px',
              }}>
                <FileText size={18} color="var(--accent2)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{u.chunks} chunks · doc {u.id}</div>
                </div>
                <CheckCircle size={16} color="var(--success)" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
