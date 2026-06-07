import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120_000,
})

export const ingestVideo = (url) =>
  api.post('/ingest', { url }).then(r => r.data)

export const queryVideo = (question, video_id = null) =>
  api.post('/query', { question, video_id }).then(r => r.data)

export const summarizeVideo = (video_id) =>
  api.post('/summarize', { video_id }).then(r => r.data)

export const explainTimestamp = (video_id, timestamp) =>
  api.post('/summarize/explain-timestamp', { video_id, timestamp }).then(r => r.data)

export const uploadNotes = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/notes/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export default api
