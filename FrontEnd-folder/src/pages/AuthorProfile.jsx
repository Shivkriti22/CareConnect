import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthorProfile.css'

function AuthorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token, user } = useAuth()
  const [author, setAuthor] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('not_connected')
  const [connectionRequestId, setConnectionRequestId] = useState(null)
  const [connectionLoading, setConnectionLoading] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const [connectionActionLoading, setConnectionActionLoading] = useState(false)
  const chatEndRef = useRef(null)

  const renderMessageTicks = (msg, isMine) => {
    if (!isMine) return null

    const isRead = Boolean(msg.readAt)
    const isDelivered = Boolean(msg.deliveredAt)
    const tick = isDelivered || isRead ? '✓✓' : '✓'
    const tickColor = isRead ? '#1d9bf0' : '#8f97a3'

    return (
      <span style={{ marginLeft: '6px', color: tickColor, fontWeight: 700, fontSize: '11px' }}>
        {tick}
      </span>
    )
  }

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch user details
        const userResponse = await fetch(`http://localhost:5000/api/auth/user/${id}`)
        const userData = await userResponse.json()

        if (!userResponse.ok) {
          throw new Error(userData.message || 'Failed to fetch user')
        }

        setAuthor(userData.data)

        // Fetch user's blogs
        const blogsResponse = await fetch(`http://localhost:5000/api/stories/user/${id}`)
        const blogsData = await blogsResponse.json()

        if (blogsResponse.ok) {
          // Transform the data
          const transformedBlogs = blogsData.stories.map((story) => ({
            id: story._id,
            title: story.title,
            excerpt: story.body.substring(0, 150) + '...',
            author: story.authorName,
            date: new Date(story.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            category: story.diseaseType,
            readTime: '5 min read'
          }))

          setBlogs(transformedBlogs)
        }
      } catch (err) {
        console.error('Error fetching author data:', err)
        setError(err.message || 'Failed to load author profile')
      } finally {
        setLoading(false)
      }
    }

    fetchAuthorData()
  }, [id])

  const fetchConnectionStatus = async () => {
    if (!isAuthenticated || !token || !id) {
      setConnectionStatus('not_connected')
      return
    }

    if (user?.id && String(user.id) === String(id)) {
      setConnectionStatus('self')
      return
    }

    try {
      setConnectionError('')
      setConnectionLoading(true)

      const response = await fetch(`http://localhost:5000/api/connections/${id}/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get connection status')
      }

      setConnectionStatus(data.status || 'not_connected')
      setConnectionRequestId(data.requestId || null)
    } catch (err) {
      setConnectionError(err.message || 'Failed to load connection status')
    } finally {
      setConnectionLoading(false)
    }
  }

  useEffect(() => {
    fetchConnectionStatus()
  }, [id, isAuthenticated, token, user])

  const handleConnectRequest = async () => {
    if (!isAuthenticated || !token) {
      navigate('/login')
      return
    }

    try {
      setConnectionActionLoading(true)
      setConnectionError('')

      const response = await fetch(`http://localhost:5000/api/connections/${id}/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send request')
      }

      setConnectionStatus(data.status || 'pending_sent')
      setConnectionRequestId(data.requestId || null)
    } catch (err) {
      setConnectionError(err.message || 'Failed to send request')
    } finally {
      setConnectionActionLoading(false)
    }
  }

  const handleRespondToRequest = async (action) => {
    if (!connectionRequestId || !token) {
      return
    }

    try {
      setConnectionActionLoading(true)
      setConnectionError('')

      const response = await fetch(`http://localhost:5000/api/connections/requests/${connectionRequestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} request`)
      }

      setConnectionStatus(action === 'accept' ? 'connected' : 'not_connected')
      if (action !== 'accept') {
        setConnectionRequestId(null)
      }
    } catch (err) {
      setConnectionError(err.message || `Failed to ${action} request`)
    } finally {
      setConnectionActionLoading(false)
    }
  }

  const fetchConversation = async () => {
    if (!isAuthenticated || !token || !user || !id) {
      return
    }

    try {
      setChatError('')
      setChatLoading(true)

      const response = await fetch(`http://localhost:5000/api/chat/${id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load chat messages')
      }

      setChatMessages(data.messages || [])
    } catch (err) {
      setChatError(err.message || 'Failed to load chat')
    } finally {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    if (!showChat || connectionStatus !== 'connected') {
      return
    }

    fetchConversation()

    const intervalId = setInterval(() => {
      fetchConversation()
    }, 5000)

    return () => clearInterval(intervalId)
  }, [showChat, id, isAuthenticated, token, user, connectionStatus])

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, showChat])

  const handleSendMessage = async () => {
    const content = chatInput.trim()

    if (!content || !token) {
      return
    }

    setIsSending(true)
    setChatError('')

    try {
      const response = await fetch(`http://localhost:5000/api/chat/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      setChatMessages((prev) => [...prev, data.data])
      setChatInput('')
    } catch (err) {
      setChatError(err.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  if (loading) {
    return (
      <div className="author-profile">
        <div className="author-profile-container">
          <p style={{ textAlign: 'center' }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !author) {
    return (
      <div className="author-profile">
        <div className="author-profile-container">
          <div className="author-profile-error">
            <h2>Profile Not Found</h2>
            <p>{error || 'This author profile could not be found.'}</p>
            <Link to="/blogs" className="author-profile-back-link">← Back to Stories</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="author-profile">
      <div className="author-profile-container">
        {/* Author Header */}
        <div className="author-profile-header">
          <button className="author-profile-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="author-profile-card">
            <div className="author-profile-avatar">
              {author.name.charAt(0).toUpperCase()}
            </div>
            <div className="author-profile-info">
              <h1 className="author-profile-name">{author.name}</h1>
              <div className="author-profile-details">
                <div className="author-profile-detail">
                  <span className="author-profile-detail-label">Age</span>
                  <span className="author-profile-detail-value">
                    {author.age || '—'}
                  </span>
                </div>
                <div className="author-profile-detail">
                  <span className="author-profile-detail-label">Gender</span>
                  <span className="author-profile-detail-value">
                    {author.gender || '—'}
                  </span>
                </div>
              </div>
              {connectionError && (
                <p style={{ color: '#ff6b6b', marginTop: '10px', fontSize: '13px' }}>{connectionError}</p>
              )}

              {connectionLoading ? (
                <button className="author-profile-connect-btn" disabled>Loading...</button>
              ) : connectionStatus === 'self' ? null : connectionStatus === 'connected' ? (
                <button className="author-profile-connect-btn" onClick={() => setShowChat(true)}>
                  Connected
                </button>
              ) : connectionStatus === 'pending_sent' ? (
                <button className="author-profile-connect-btn" disabled>
                  Request Sent
                </button>
              ) : connectionStatus === 'pending_received' ? (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button className="author-profile-connect-btn" onClick={() => handleRespondToRequest('accept')} disabled={connectionActionLoading}>
                    Accept
                  </button>
                  <button className="author-profile-connect-btn" onClick={() => handleRespondToRequest('decline')} disabled={connectionActionLoading} style={{ background: '#7a8799' }}>
                    Decline
                  </button>
                </div>
              ) : (
                <button className="author-profile-connect-btn" onClick={handleConnectRequest} disabled={connectionActionLoading}>
                  {connectionActionLoading ? 'Sending...' : 'Connect'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Author's Blogs */}
        <div className="author-profile-blogs">
          <h2 className="author-profile-blogs-title">Their Stories</h2>
          {blogs.length === 0 ? (
            <p className="author-profile-no-blogs">No stories yet</p>
          ) : (
            <div className="author-profile-blogs-grid">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/story/${blog.id}`}
                  className="author-profile-blog-card"
                >
                  <span className="author-profile-blog-category">{blog.category}</span>
                  <h3 className="author-profile-blog-title">{blog.title}</h3>
                  <p className="author-profile-blog-excerpt">{blog.excerpt}</p>
                  <div className="author-profile-blog-meta">
                    <span>{blog.date}</span>
                    <span>·</span>
                    <span>{blog.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && connectionStatus === 'connected' && (
        <div className="author-profile-chat-overlay">
          <div className="author-profile-chat-panel">
            {/* Chat Header */}
            <div className="author-profile-chat-header">
              <h3 className="author-profile-chat-title">{author.name}</h3>
              <button
                className="author-profile-chat-close"
                onClick={() => setShowChat(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {/* Messages Area */}
            <div className="author-profile-chat-messages">
              {!isAuthenticated && (
                <p className="author-profile-chat-empty">
                  Please sign in to start chatting.
                </p>
              )}

              {isAuthenticated && chatLoading && chatMessages.length === 0 && (
                <p className="author-profile-chat-empty">Loading messages...</p>
              )}

              {isAuthenticated && chatError && (
                <p className="author-profile-chat-empty" style={{ color: '#c33' }}>
                  {chatError}
                </p>
              )}

              {isAuthenticated && !chatLoading && !chatError && chatMessages.length === 0 && (
                <p className="author-profile-chat-empty">Start a conversation...</p>
              )}

              {isAuthenticated && chatMessages.map((msg) => {
                const isMine = String(msg.sender) === String(user?.id)

                return (
                  <div
                    key={msg._id}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      marginBottom: '10px'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: isMine ? '#dcf8c6' : '#f1f1f1',
                        color: '#222',
                        fontSize: '14px'
                      }}
                    >
                      <div>{msg.content}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {renderMessageTicks(msg, isMine)}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="author-profile-chat-input-form">
              <input
                type="text"
                className="author-profile-chat-input"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={!isAuthenticated || isSending}
              />
              <button
                className="author-profile-chat-send-btn"
                onClick={handleSendMessage}
                disabled={!isAuthenticated || isSending || !chatInput.trim()}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthorProfile
