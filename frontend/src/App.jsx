import React, { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import HomePage from './pages/HomePage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import SummaryPage from './pages/SummaryPage.jsx'
import NotesPage from './pages/NotesPage.jsx'

export default function App() {
  const [page, setPage] = useState('home')
  const [videoData, setVideoData] = useState(null) // { url, videoId, chunksStored }
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleVideoIngested = useCallback((data) => {
    setVideoData(data)
    setPage('chat')
  }, [])

  const renderPage = () => {
    switch (page) {
      case 'home':    return <HomePage onIngested={handleVideoIngested} />
      case 'chat':    return <ChatPage videoData={videoData} />
      case 'summary': return <SummaryPage videoData={videoData} />
      case 'notes':   return <NotesPage />
      default:        return <HomePage onIngested={handleVideoIngested} />
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        page={page}
        setPage={setPage}
        videoData={videoData}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 240 : 64,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}>
        {renderPage()}
      </main>
    </div>
  )
}
