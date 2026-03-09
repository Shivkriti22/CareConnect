import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validate = (field, value, data = formData) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        return ''
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address'
        return ''
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        return ''
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== data.password) return 'Passwords do not match'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const newData = { ...formData, [name]: value }
    setFormData(newData)
    if (touched[name]) {
      const error = validate(name, value, newData)
      if (name === 'password' && touched.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          [name]: error,
          confirmPassword: validate('confirmPassword', newData.confirmPassword, newData),
        }))
      } else {
        setErrors((prev) => ({ ...prev, [name]: error }))
      }
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }))
    if (name === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validate('confirmPassword', formData.confirmPassword),
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newTouched = { name: true, email: true, password: true, confirmPassword: true }
    const newErrors = {
      name: validate('name', formData.name),
      email: validate('email', formData.email),
      password: validate('password', formData.password),
      confirmPassword: validate('confirmPassword', formData.confirmPassword),
    }
    setTouched(newTouched)
    setErrors(newErrors)

    if (Object.values(newErrors).some(Boolean)) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
    }, 800)
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
          <h2>Account created</h2>
          <p>Welcome to CareConnect! (Demo — no backend)</p>
          <Link to="/" className="auth__link">Go to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <header className="auth__header">
          <h1>Create Account</h1>
          <p>Join CareConnect to share and explore health stories</p>
        </header>

        <form onSubmit={handleSubmit} className="auth__form" noValidate>
          <div className="auth__field">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Your name"
              autoComplete="name"
              className={errors.name ? 'auth__input auth__input--error' : 'auth__input'}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'signup-name-error' : undefined}
            />
            {errors.name && (
              <span id="signup-name-error" className="auth__error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className="auth__field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              autoComplete="email"
              className={errors.email ? 'auth__input auth__input--error' : 'auth__input'}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
            />
            {errors.email && (
              <span id="signup-email-error" className="auth__error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="auth__field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className={errors.password ? 'auth__input auth__input--error' : 'auth__input'}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'signup-password-error' : undefined}
            />
            {errors.password && (
              <span id="signup-password-error" className="auth__error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className="auth__field">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              className={errors.confirmPassword ? 'auth__input auth__input--error' : 'auth__input'}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
            />
            {errors.confirmPassword && (
              <span id="signup-confirm-error" className="auth__error" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="auth__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth__footer">
          Already have an account? <Link to="/login" className="auth__link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
