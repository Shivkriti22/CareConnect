import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

  const handleSubmit = async (e) => {
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
    setApiError('')

    // Call login API
    const result = await login(formData.email, formData.password)

    if (result.success) {
      setSubmitSuccess(true)
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } else {
      setApiError(result.message || 'Login failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="auth auth--success">
        <div className="auth__card auth__card--success">
          <div className="auth__success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>Welcome back</h2>
          <p>You've successfully signed in. Redirecting...</p>
          <Link to="/" className="auth__link">Go to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <header className="auth__header">
          <h1>Sign In</h1>
          <p>Sign in to your CareConnect account</p>
        </header>

        {apiError && (
          <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee', borderRadius: '4px', color: '#c33', fontSize: '14px' }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth__form" noValidate>
          <div className="auth__field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              autoComplete="email"
              className={errors.email ? 'auth__input auth__input--error' : 'auth__input'}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
            {errors.email && (
              <span id="login-email-error" className="auth__error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="auth__field">
            <label htmlFor="login-password">Password</label>
            <div className="auth__input-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="current-password"
                className={errors.password ? 'auth__input auth__input--error' : 'auth__input'}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
              />
              <button
                type="button"
                className="auth__toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span id="login-password-error" className="auth__error" role="alert">
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
          Don't have an account? <Link to="/signup" className="auth__link">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
