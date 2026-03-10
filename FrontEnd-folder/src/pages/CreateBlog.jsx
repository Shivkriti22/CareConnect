import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'
import './CreateBlog.css'

const DISEASE_CATEGORIES = [
  'Heart Disease',
  'Diabetes',
  'Cancer',
  'Mental Health',
  'Respiratory Diseases',
  'Arthritis',
  'Neurological Disorders',
  'Autoimmune Diseases',
  'Other'
]

function CreateBlog() {
  const navigate = useNavigate()
  const { isAuthenticated, token, user } = useAuth()
  const [blogData, setBlogData] = useState({ title: '', blog: '', authorName: user?.name || '', category: '' })
  const [blogErrors, setBlogErrors] = useState({})
  const [blogTouched, setBlogTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [apiError, setApiError] = useState('')

  const validateBlog = (field, value) => {
    switch (field) {
      case 'title':
        if (!value.trim()) return 'Title is required'
        if (value.trim().length < 3) return 'Title must be at least 3 characters'
        return ''
      case 'blog':
        if (!value.trim()) return 'Blog content is required'
        if (value.trim().length < 20) return 'Blog content must be at least 20 characters'
        return ''
      case 'authorName':
        if (!value.trim()) return "Author's name is required"
        return ''
      case 'category':
        if (!value) return 'Please select a disease category'
        return ''
      default:
        return ''
    }
  }

  const handleBlogChange = (e) => {
    const { name, value } = e.target
    setBlogData((prev) => ({ ...prev, [name]: value }))
    if (blogTouched[name]) {
      setBlogErrors((prev) => ({ ...prev, [name]: validateBlog(name, value) }))
    }
  }

  const handleBlogBlur = (e) => {
    const { name, value } = e.target
    setBlogTouched((prev) => ({ ...prev, [name]: true }))
    setBlogErrors((prev) => ({ ...prev, [name]: validateBlog(name, value) }))
  }

  const handleBlogSubmit = async (e) => {
    e.preventDefault()
    const newBlogTouched = { title: true, blog: true, authorName: true, category: true }
    const newBlogErrors = {
      title: validateBlog('title', blogData.title),
      blog: validateBlog('blog', blogData.blog),
      authorName: validateBlog('authorName', blogData.authorName),
      category: validateBlog('category', blogData.category),
    }
    setBlogTouched(newBlogTouched)
    setBlogErrors(newBlogErrors)

    if (newBlogErrors.title || newBlogErrors.blog || newBlogErrors.authorName || newBlogErrors.category) return

    setIsSubmitting(true)
    setApiError('')

    try {
      const response = await fetch('http://localhost:5000/api/stories/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: blogData.title,
          body: blogData.blog,
          authorName: blogData.authorName,
          diseaseType: blogData.category,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create story')
      }

      setSubmitSuccess(true)
      // Redirect to blogs page after 2 seconds
      setTimeout(() => {
        navigate('/blogs')
      }, 2000)
    } catch (error) {
      setApiError(error.message || 'Failed to create story. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="share-story">
        <div className="share-story__content">
          <header className="share-story__header">
            <h1>Story Shared!</h1>
            <p className="share-story__intro">
              Thank you for sharing your health journey. Your story will help others feel less alone.
            </p>
          </header>

          <div className="share-story__form-card">
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
              <h2 style={{ marginBottom: '10px' }}>Story published successfully!</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>Redirecting to all stories...</p>
              <Link to="/blogs" className="auth__link">View All Stories</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="share-story">
        <div className="share-story__content">
          <header className="share-story__header">
            <h1>Share Your Story</h1>
            <p className="share-story__intro">
              Your experience matters. By sharing your health journey—the challenges, the breakthroughs, 
              and the lessons learned—you can help others feel less alone and more hopeful. Every story 
              contributes to a community of support and understanding.
            </p>
            <p className="share-story__intro">
              Sign in below to share your story and connect with others who may be on a similar path.
            </p>
          </header>

          <div className="share-story__form-card">
            <h2 className="share-story__form-title">Sign in to share</h2>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
              Please sign in to your account to share your health story.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <Link to="/login" className="auth__submit" style={{ textAlign: 'center', textDecoration: 'none' }}>
                Sign In
              </Link>
              <p className="auth__footer" style={{ textAlign: 'center' }}>
                Don't have an account? <Link to="/signup" className="auth__link">Sign up</Link> to join our community.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="share-story">
      <div className="share-story__content">
        <header className="share-story__header">
          <h1>Share Your Story</h1>
          <p className="share-story__intro">
            Your experience matters. By sharing your health journey—the challenges, the breakthroughs, 
            and the lessons learned—you can help others feel less alone and more hopeful. Every story 
            contributes to a community of support and understanding.
          </p>
        </header>

        <div className="share-story__form-card">
          <h2 className="share-story__form-title">Create Your Story</h2>

          {apiError && (
            <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee', borderRadius: '4px', color: '#c33', fontSize: '14px' }}>
              {apiError}
            </div>
          )}
          
          <form onSubmit={handleBlogSubmit} className="auth__form" noValidate>
            <div className="auth__field">
              <label htmlFor="blog-title">Title</label>
              <input
                id="blog-title"
                type="text"
                name="title"
                value={blogData.title}
                onChange={handleBlogChange}
                onBlur={handleBlogBlur}
                placeholder="Enter blog title"
                className={blogErrors.title ? 'auth__input auth__input--error' : 'auth__input'}
                aria-invalid={!!blogErrors.title}
                aria-describedby={blogErrors.title ? 'blog-title-error' : undefined}
              />
              {blogErrors.title && (
                <span id="blog-title-error" className="auth__error" role="alert">
                  {blogErrors.title}
                </span>
              )}
            </div>

            <div className="auth__field">
              <label htmlFor="blog-content">Blog Content</label>
              <textarea
                id="blog-content"
                name="blog"
                value={blogData.blog}
                onChange={handleBlogChange}
                onBlur={handleBlogBlur}
                placeholder="Write your blog content here..."
                className={blogErrors.blog ? 'auth__input auth__input--error' : 'auth__input'}
                rows="8"
                aria-invalid={!!blogErrors.blog}
                aria-describedby={blogErrors.blog ? 'blog-content-error' : undefined}
              />
              {blogErrors.blog && (
                <span id="blog-content-error" className="auth__error" role="alert">
                  {blogErrors.blog}
                </span>
              )}
            </div>

            <div className="auth__field">
              <label htmlFor="blog-author">Author's Name</label>
              <input
                id="blog-author"
                type="text"
                name="authorName"
                value={blogData.authorName}
                onChange={handleBlogChange}
                onBlur={handleBlogBlur}
                placeholder="Your name"
                className={blogErrors.authorName ? 'auth__input auth__input--error' : 'auth__input'}
                aria-invalid={!!blogErrors.authorName}
                aria-describedby={blogErrors.authorName ? 'blog-author-error' : undefined}
              />
              {blogErrors.authorName && (
                <span id="blog-author-error" className="auth__error" role="alert">
                  {blogErrors.authorName}
                </span>
              )}
            </div>

            <div className="auth__field">
              <label htmlFor="blog-category">Category of Disease</label>
              <select
                id="blog-category"
                name="category"
                value={blogData.category}
                onChange={handleBlogChange}
                onBlur={handleBlogBlur}
                className={blogErrors.category ? 'auth__input auth__input--error' : 'auth__input'}
                aria-invalid={!!blogErrors.category}
                aria-describedby={blogErrors.category ? 'blog-category-error' : undefined}
              >
                <option value="">Select a category...</option>
                {DISEASE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {blogErrors.category && (
                <span id="blog-category-error" className="auth__error" role="alert">
                  {blogErrors.category}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Share Your Story'}
            </button>
          </form>

          <p className="auth__footer">
            <Link to="/blogs" className="auth__link">Back to Stories</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreateBlog
