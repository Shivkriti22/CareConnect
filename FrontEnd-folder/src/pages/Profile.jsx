import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated, user, setUser } = useAuth()
  const [authoredBlogs, setAuthoredBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsError, setContactsError] = useState('')
  const [activeChatUser, setActiveChatUser] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsError, setRequestsError] = useState('')
  const [requestActionLoadingId, setRequestActionLoadingId] = useState(null)

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
    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      navigate('/login')
      return
    }

    // Initialize form data with current user values
    setFormData({ name: user.name || '', email: user.email || '' })
    setLoading(false)
  }, [isAuthenticated, user, navigate])

  // Fetch user's authored stories
  useEffect(() => {
    // Only fetch stories after user is authenticated
    if (!isAuthenticated || !user || !user.id) {
      return
    }

    const fetchAuthoredStories = async () => {
      try {
        const token = localStorage.getItem('careconnect-token')
        const response = await fetch('http://localhost:5000/api/stories/my-stories', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch stories')
        }

        // Transform the data
        const transformedStories = data.stories.map((story) => ({
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
          readTime: '5 min read',
        }))

        setAuthoredBlogs(transformedStories)
      } catch (err) {
        console.error('Error fetching authored stories:', err)
        // On error, leave authoredBlogs empty - empty state will be shown
      }
    }

    fetchAuthoredStories()
  }, [isAuthenticated, user])

  const fetchContacts = async () => {
    if (!isAuthenticated || !user) return

    setContactsLoading(true)
    setContactsError('')

    try {
      const token = localStorage.getItem('careconnect-token')
      const response = await fetch('http://localhost:5000/api/chat/contacts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load connected users')
      }

      setConnectedUsers(data.contacts || [])
    } catch (err) {
      setContactsError(err.message || 'Failed to load connected users')
    } finally {
      setContactsLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    if (!isAuthenticated || !user) return

    setRequestsLoading(true)
    setRequestsError('')

    try {
      const token = localStorage.getItem('careconnect-token')
      const response = await fetch('http://localhost:5000/api/connections/requests/received', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load connection requests')
      }

      setPendingRequests(data.requests || [])
    } catch (err) {
      setRequestsError(err.message || 'Failed to load connection requests')
    } finally {
      setRequestsLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
    fetchPendingRequests()
  }, [isAuthenticated, user])

  const handleRequestAction = async (requestId, action) => {
    try {
      setRequestActionLoadingId(requestId)
      setRequestsError('')

      const token = localStorage.getItem('careconnect-token')
      const response = await fetch(`http://localhost:5000/api/connections/requests/${requestId}`, {
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

      setPendingRequests((prev) => prev.filter((item) => item.requestId !== requestId))
      fetchContacts()
    } catch (err) {
      setRequestsError(err.message || `Failed to ${action} request`)
    } finally {
      setRequestActionLoadingId(null)
    }
  }

  const fetchConversation = async (otherUserId) => {
    if (!isAuthenticated || !otherUserId) return

    setChatLoading(true)
    setChatError('')

    try {
      const token = localStorage.getItem('careconnect-token')
      const response = await fetch(`http://localhost:5000/api/chat/${otherUserId}/messages`, {
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
      setChatError(err.message || 'Failed to load chat messages')
    } finally {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    if (!activeChatUser) return

    fetchConversation(activeChatUser.userId)

    const intervalId = setInterval(() => {
      fetchConversation(activeChatUser.userId)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [activeChatUser])

  const handleSendMessage = async () => {
    const content = chatInput.trim()
    if (!activeChatUser || !content) return

    setSendingMessage(true)
    setChatError('')

    try {
      const token = localStorage.getItem('careconnect-token')
      const response = await fetch(`http://localhost:5000/api/chat/${activeChatUser.userId}/messages`, {
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
      fetchContacts()
    } catch (err) {
      setChatError(err.message || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleEditClick = () => {
    setIsEditMode(true)
    setEditError('')
    setEditSuccess(false)
  }

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return
    }
    setDeleteError('')
    setDeleteSuccess('')
    try {
      const token = localStorage.getItem('careconnect-token')
      const response = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete story')
      }
      setAuthoredBlogs((prev) => prev.filter((b) => b.id !== storyId))
      setDeleteSuccess('Story deleted successfully')
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  const handleCancelClick = () => {
    setIsEditMode(false)
    setFormData({ name: user.name || '', email: user.email || '' })
    setEditError('')
    setEditSuccess(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveClick = async () => {
    setEditError('')
    setEditSuccess(false)

    // Validation
    if (!formData.name.trim()) {
      setEditError('Name is required')
      return
    }
    if (!formData.email.trim()) {
      setEditError('Email is required')
      return
    }

    setIsSaving(true)

    try {
      // Call update profile API
      const token = localStorage.getItem('careconnect-token')
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      // Update localStorage with new user data
      localStorage.setItem('careconnect-user', JSON.stringify(data.user))
      setUser(data.user)
 
      // Update form
setFormData({
  name: data.user.name,
  email: data.user.email
})

      setEditSuccess(true)
      setIsEditMode(false)

      // Reload user data through useAuth context (you may need to add a refresh method)
      // For now, we'll update formData which will show the success message
      setTimeout(() => {
        setEditSuccess(false)
      }, 2000)
    } catch (error) {
      setEditError(error.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your stories and data will be permanently deleted.'
    )

    if (!confirmed) {
      return
    }

    setIsDeletingAccount(true)
    setEditError('')

    try {
      const token = localStorage.getItem('careconnect-token')
      const response = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account')
      }

      // Clear localStorage
      localStorage.removeItem('careconnect-token')
      localStorage.removeItem('careconnect-user')

      // Clear user context
      setUser(null)

      // Redirect to home
      navigate('/')
    } catch (error) {
      setEditError(error.message || 'Failed to delete account. Please try again.')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="profile">
        <div className="profile__container">
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile">
      <div className="profile__container">
        {/* User Info */}
        <section className="profile__user">
          {!isEditMode ? (
            <>
              <div className="profile__user-header">
                <div className="profile__avatar">{user?.name?.charAt(0) || 'U'}</div>
                <div className="profile__info">
                  <h1 className="profile__name">{user?.name || 'User'}</h1>
                  <p className="profile__email">{user?.email || ''}</p>
                  <button
                    type="button"
                    className="profile__edit-btn"
                    onClick={handleEditClick}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="profile__delete-account-btn"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                title="Delete your account permanently"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </>
          ) : (
            <div className="profile__edit-form">
              <h2 className="profile__edit-title">Edit Profile</h2>

              {editError && (
                <div className="profile__edit-error">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="profile__edit-success">
                  Profile updated successfully!
                </div>
              )}

              <div className="profile__edit-field">
                <label htmlFor="profile-name">Name</label>
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="profile__edit-input"
                />
              </div>

              <div className="profile__edit-field">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email"
                  className="profile__edit-input"
                />
              </div>

              <div className="profile__edit-actions">
                <button
                  type="button"
                  className="profile__edit-save-btn"
                  onClick={handleSaveClick}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="profile__edit-cancel-btn"
                  onClick={handleCancelClick}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Authored Blogs */}
        <section className="profile__section">
          <h2>My Stories</h2>
          {deleteError && <div className="profile__delete-error">{deleteError}</div>}
          {deleteSuccess && <div className="profile__delete-success">{deleteSuccess}</div>}
          {authoredBlogs.length > 0 ? (
            <div className="profile__grid">
              {authoredBlogs.map((blog) => (
                <div key={blog.id} className="profile__card-wrapper">
                  <Link to={`/story/${blog.id}`} className="profile__card">
                    <span className="profile__card-category">{blog.category}</span>
                    <h3 className="profile__card-title">{blog.title}</h3>
                    <p className="profile__card-excerpt">{blog.excerpt}</p>
                    <span className="profile__card-meta">{blog.date} · {blog.readTime}</span>
                  </Link>
                  <div className="profile__card-actions">
                    <Link to={`/blogs/edit/${blog.id}`} className="profile__card-action-btn">Edit</Link>
                    <button
                      type="button"
                      className="profile__card-action-btn profile__card-action-btn--delete"
                      onClick={() => handleDeleteStory(blog.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile__empty">
              <p>You haven't posted any stories yet.</p>
              <Link to="/blogs/create" className="profile__empty-link">Share your first story</Link>
            </div>
          )}
        </section>

        {/* Connected Users */}
        <section className="profile__section">
          <h2>Connection Requests</h2>
          {requestsLoading && <div className="profile__empty"><p>Loading requests...</p></div>}
          {requestsError && <div className="profile__delete-error">{requestsError}</div>}
          {!requestsLoading && !requestsError && pendingRequests.length === 0 && (
            <div className="profile__empty"><p>No pending requests</p></div>
          )}
          {!requestsLoading && pendingRequests.length > 0 && (
            <div className="profile__grid" style={{ marginBottom: '20px' }}>
              {pendingRequests.map((request) => (
                <div key={request.requestId} className="profile__card-wrapper">
                  <div className="profile__card">
                    <h3 className="profile__card-title">{request.name}</h3>
                    <p className="profile__card-excerpt">{request.email}</p>
                    <span className="profile__card-meta">
                      Request sent {new Date(request.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="profile__card-actions">
                    <button
                      type="button"
                      className="profile__card-action-btn"
                      onClick={() => handleRequestAction(request.requestId, 'accept')}
                      disabled={requestActionLoadingId === request.requestId}
                    >
                      {requestActionLoadingId === request.requestId ? 'Working...' : 'Accept'}
                    </button>
                    <button
                      type="button"
                      className="profile__card-action-btn profile__card-action-btn--delete"
                      onClick={() => handleRequestAction(request.requestId, 'decline')}
                      disabled={requestActionLoadingId === request.requestId}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2>Connected Users</h2>
          {contactsLoading && <div className="profile__empty"><p>Loading connected users...</p></div>}
          {contactsError && <div className="profile__delete-error">{contactsError}</div>}

          {!contactsLoading && !contactsError && connectedUsers.length === 0 && (
            <div className="profile__empty">
              <p>No connections yet</p>
            </div>
          )}

          {!contactsLoading && connectedUsers.length > 0 && (
            <div className="profile__grid">
              {connectedUsers.map((contact) => (
                <button
                  key={contact.userId}
                  type="button"
                  className="profile__card"
                  style={{ textAlign: 'left', cursor: 'pointer', background: activeChatUser?.userId === contact.userId ? 'rgba(0, 212, 170, 0.08)' : undefined }}
                  onClick={() => setActiveChatUser(contact)}
                >
                  <h3 className="profile__card-title">{contact.name}</h3>
                  <p className="profile__card-excerpt">{contact.lastMessage}</p>
                  <span className="profile__card-meta">
                    {new Date(contact.lastMessageAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {activeChatUser && (
        <div className="profile-chat-overlay">
          <div className="profile-chat-panel">
            <div className="profile-chat-header">
              <h3 className="profile-chat-title">{activeChatUser.name}</h3>
              <button
                className="profile-chat-close"
                onClick={() => setActiveChatUser(null)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            <div className="profile-chat-messages">
              {chatError && <div className="profile__delete-error">{chatError}</div>}
              {chatLoading && chatMessages.length === 0 && <p className="profile-chat-empty">Loading messages...</p>}
              {!chatLoading && chatMessages.length === 0 && <p className="profile-chat-empty">No messages yet.</p>}

              {chatMessages.map((msg) => {
                const isMine = String(msg.sender) === String(user?.id)
                return (
                  <div
                    key={msg._id}
                    style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: isMine ? '#cde9b8' : '#f1f1f1',
                        color: '#111',
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
            </div>

            <div className="profile-chat-input-form">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message..."
                className="profile-chat-input"
              />
              <button
                type="button"
                className="profile-chat-send-btn"
                onClick={handleSendMessage}
                disabled={sendingMessage || !chatInput.trim()}
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
