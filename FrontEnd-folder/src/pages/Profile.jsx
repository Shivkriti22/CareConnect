import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [authoredBlogs, setAuthoredBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)

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

  const handleEditClick = () => {
    setIsEditMode(true)
    setEditError('')
    setEditSuccess(false)
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
      const response = await fetch('http://localhost:5000/api/auth/profile', {
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
              <div className="profile__avatar">{user?.name?.charAt(0) || 'U'}</div>
              <div className="profile__info">
                <h1 className="profile__name">{user?.name || 'User'}</h1>
                <p className="profile__email">{user?.email || ''}</p>
                <p className="profile__meta">Account ID: {user?.id || ''}</p>
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
          {authoredBlogs.length > 0 ? (
            <div className="profile__grid">
              {authoredBlogs.map((blog) => (
                <Link to={`/story/${blog.id}`} key={blog.id} className="profile__card">
                  <span className="profile__card-category">{blog.category}</span>
                  <h3 className="profile__card-title">{blog.title}</h3>
                  <p className="profile__card-excerpt">{blog.excerpt}</p>
                  <span className="profile__card-meta">{blog.date} · {blog.readTime}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="profile__empty">
              <p>You haven't posted any stories yet.</p>
              <Link to="/blogs/create" className="profile__empty-link">Share your first story</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Profile
