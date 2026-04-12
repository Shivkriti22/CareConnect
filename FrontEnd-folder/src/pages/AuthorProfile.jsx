import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './AuthorProfile.css'

function AuthorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [author, setAuthor] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showChat, setShowChat] = useState(false)

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
              <button className="author-profile-connect-btn" onClick={() => setShowChat(true)}>
                Connect
              </button>
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
      {showChat && (
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
              <p className="author-profile-chat-empty">Start a conversation...</p>
            </div>

            {/* Input Area */}
            <div className="author-profile-chat-input-form">
              <input
                type="text"
                className="author-profile-chat-input"
                placeholder="Type a message..."
              />
              <button className="author-profile-chat-send-btn">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthorProfile
