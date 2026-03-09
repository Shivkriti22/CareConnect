import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'
import './CreateBlog.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function CreateBlog() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
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
      <div className="share-story share-story--success">
        <div className="share-story__card share-story__card--success">
          <div className="auth__success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>You're all set!</h2>
          <p>You're signed in and ready to share your health story. The story creation form will be available here soon.</p>
          <Link to="/blogs" className="auth__link">Browse Health Stories</Link>
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
