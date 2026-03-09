import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'
import './CreateBlog.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [blogData, setBlogData] = useState({ title: '', blog: '', authorName: '', category: '' })
  const [errors, setErrors] = useState({})
  const [blogErrors, setBlogErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [blogTouched, setBlogTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validate = (field, value) => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address'
        return ''
      case 'password':
        if (!value) return 'Password is required'
        return ''
      default:
        return ''
    }
  }

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }))
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

  const handleBlogSubmit = (e) => {
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
    setTimeout(() => {
      setIsSubmitting(false)
      // Here you can handle the blog submission (e.g., send to server)
      console.log('Blog submitted:', blogData)
      alert('Blog submitted successfully!')
    }, 800)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newTouched = { email: true, password: true }
    const newErrors = {
      email: validate('email', formData.email),
      password: validate('password', formData.password),
    }
    setTouched(newTouched)
    setErrors(newErrors)

    if (newErrors.email || newErrors.password) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
    }, 800)
  }

  if (submitSuccess) {
    return (
      <div className="share-story">
        <div className="share-story__content">
          <header className="share-story__header">
            <h1>Create Your Blog</h1>
            <p className="share-story__intro">
              Share your health journey and inspire others with your story.
            </p>
          </header>

          <div className="share-story__form-card">
            
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
                {isSubmitting ? 'Submitting...' : 'Submit Blog'}
              </button>
            </form>

            <p className="auth__footer">
              <Link to="/blogs" className="auth__link">Back to Blogs</Link>
            </p>
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
          <p className="share-story__intro">
            Sign in below to share your story and connect with others who may be on a similar path.
          </p>
        </header>

        <div className="share-story__form-card">
          <h2 className="share-story__form-title">Sign in to share</h2>
          <form onSubmit={handleSubmit} className="auth__form" noValidate>
            <div className="auth__field">
              <label htmlFor="share-email">Email</label>
              <input
                id="share-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                autoComplete="email"
                className={errors.email ? 'auth__input auth__input--error' : 'auth__input'}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'share-email-error' : undefined}
              />
              {errors.email && (
                <span id="share-email-error" className="auth__error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="auth__field">
              <label htmlFor="share-password">Password</label>
              <input
                id="share-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="current-password"
                className={errors.password ? 'auth__input auth__input--error' : 'auth__input'}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'share-password-error' : undefined}
              />
              {errors.password && (
                <span id="share-password-error" className="auth__error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth__footer">
            Don't have an account? <Link to="/signup" className="auth__link">Sign up</Link> to join our community.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreateBlog
