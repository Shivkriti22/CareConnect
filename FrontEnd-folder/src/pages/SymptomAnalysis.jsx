import { useState } from 'react'
import './SymptomAnalysis.css'

const DURATION_OPTIONS = [
  'Less than 24 hours',
  '1–3 days',
  '4–7 days',
  '1–2 weeks',
  'More than 2 weeks',
]

const SEVERITY_OPTIONS = [
  { value: 1, label: 'Mild', desc: 'Noticeable but not disruptive' },
  { value: 2, label: 'Moderate', desc: 'Affects daily activities' },
  { value: 3, label: 'Moderate–Severe', desc: 'Significantly limits activities' },
  { value: 4, label: 'Severe', desc: 'Very difficult to function' },
  { value: 5, label: 'Extreme', desc: 'Unable to perform normal activities' },
]

function SymptomAnalysis() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    symptoms: '',
    duration: '',
    severity: '',
  })
  const [showResults, setShowResults] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [visibleSections, setVisibleSections] = useState({
    urgency: false,
    conditions: false,
    actions: false,
    disclaimer: false
  })

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
    else {
      // Submit form and call Ollama API
      submitAnalysis()
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // Submit form data to backend Ollama API
  const submitAnalysis = async () => {
    console.log('>>> Submit triggered', formData)
    setIsLoading(true)
    setApiError('')
    setLoadingMessage('Reading your symptoms...')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout

    // Cycle through loading messages
    const messages = [
      'Reading your symptoms...',
'Identifying possible conditions...',
'Putting it all together...',
'Evaluating symptom severity...',
'Preparing recommendations...',
'Almost done...'
    ]
    let messageIndex = 0
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length
      setLoadingMessage(messages[messageIndex])
    }, 2000)

    try {
      const response = await fetch('http://localhost:5000/api/symptom-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: formData.symptoms,
          duration: formData.duration,
          severity: formData.severity,
        }),
        signal: controller.signal
      })

      console.log('>>> Response received:', response.status)

      const data = await response.json()
      console.log('>>> Parsed result:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze symptoms')
      }

      // Clear loading message interval
      clearInterval(messageInterval)

      // Set analysis results and show results view
      setAnalysis(data.data)
      setShowResults(true)

      // Reveal sections progressively
      setTimeout(() => setVisibleSections(prev => ({ ...prev, urgency: true })), 0)
      setTimeout(() => setVisibleSections(prev => ({ ...prev, conditions: true })), 300)
      setTimeout(() => setVisibleSections(prev => ({ ...prev, actions: true })), 600)
      setTimeout(() => setVisibleSections(prev => ({ ...prev, disclaimer: true })), 900)

    } catch (error) {
      console.error('>>> Submit error:', error)
      clearInterval(messageInterval)
      if (error.name === 'AbortError') {
        setApiError('Request timeout. Ollama service may be overloaded. Please try again.')
      } else {
        setApiError(error.message || 'An error occurred. Please ensure the backend server is running and Ollama is accessible.')
      }
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }

  const resetAnalysis = () => {
    setStep(1)
    setFormData({ symptoms: '', duration: '', severity: '' })
    setShowResults(false)
    setAnalysis(null)
    setApiError('')
    setLoadingMessage('')
    setVisibleSections({
      urgency: false,
      conditions: false,
      actions: false,
      disclaimer: false
    })
  }

  const canProceed = () => {
    if (step === 1) return formData.symptoms.trim().length > 0
    if (step === 2) return formData.duration.length > 0
    if (step === 3) return formData.severity.length > 0
    return false
  }

  if (isLoading) {
    return (
      <div className="symptom-analysis">
        <div className="symptom-analysis__container">
          <header className="symptom-results__header">
            <div className="symptom-results__icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h1>Analyzing Your Symptoms</h1>
            <p>Please wait while the AI analyzes your symptoms...</p>
          </header>

          <div className="symptom-results__conditions" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>⚙️</div>
            <p style={{ fontSize: '18px', color: '#666' }}>{loadingMessage || 'Processing your information...'}</p>
          </div>
        </div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="symptom-analysis">
        <div className="symptom-analysis__container">
          <header className="symptom-results__header">
            <div className="symptom-results__icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <h1>Analysis Error</h1>
            <p>Something went wrong while analyzing your symptoms.</p>
          </header>

          <div className="symptom-results__conditions" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ padding: '20px', backgroundColor: '#fee', borderRadius: '8px', marginBottom: '20px', color: '#c33', fontSize: '16px' }}>
              {apiError}
            </div>
            <button type="button" className="recommendation-card__btn" onClick={resetAnalysis}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="symptom-analysis">
        <div className="symptom-analysis__container">
          <header className="symptom-results__header">
            <div className="symptom-results__icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h1>Analysis Results</h1>
            <p>Based on the symptoms you provided, here are preliminary insights. This is not a diagnosis.</p>
          </header>

          <section className="symptom-results__conditions">
            <h2>Possible Conditions</h2>
            <div className="conditions-grid">
              {analysis && analysis.possibleConditions && analysis.possibleConditions.length > 0 ? (
                analysis.possibleConditions.map((condition) => {
                  let badgeClass = 'less-likely';
                  if (condition.likelihood === 'High') badgeClass = 'common';
                  else if (condition.likelihood === 'Medium') badgeClass = 'possible';
                  
                  return (
                    <div key={condition.name} className="condition-card">
                      <span className={`condition-card__badge condition-card__badge--${badgeClass}`}>
                        {condition.likelihood} Likelihood
                      </span>
                      <div className="condition-card__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      </div>
                      <h3 className="condition-card__name">{condition.name}</h3>
                      <p style={{ fontSize: '13px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                        {condition.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p>No conditions found. Please try again.</p>
              )}
            </div>
          </section>

          <div className="symptom-results__disclaimer">
            <span className="symptom-results__disclaimer-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div>
              <strong>Important Disclaimer</strong>
              <p>
                {analysis?.disclaimer || 'This analysis is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment. AI-generated insights are preliminary and may be inaccurate. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.'}
              </p>
            </div>
          </div>

          {analysis && analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
            <div className="symptom-results__recommendation">
              <div className="recommendation-card">
                <div className="recommendation-card__icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3>Recommended Actions</h3>
                <ul style={{ textAlign: 'left', margin: '12px 0' }}>
                  {analysis.recommendedActions.map((action, index) => (
                    <li key={index} style={{ marginBottom: '8px', marginLeft: '20px' }}>
                      {action}
                    </li>
                  ))}
                </ul>
                <button type="button" className="recommendation-card__btn" onClick={resetAnalysis}>
                  Start New Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="symptom-analysis">
      <div className="symptom-analysis__container">
        <header className="symptom-analysis__header">
          <div className="symptom-analysis__header-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1>AI Symptom Analysis</h1>
          <p>Describe your symptoms for preliminary insights. This tool does not provide medical diagnosis.</p>
        </header>

        <div className="symptom-steps">
          <div className="symptom-steps__progress">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`symptom-steps__dot ${step >= s ? 'symptom-steps__dot--active' : ''}`}
                aria-current={step === s ? 'step' : undefined}
              >
                {s}
              </div>
            ))}
          </div>

          <div className="symptom-step">
            {step === 1 && (
              <div className="symptom-step__content">
                <h2>Describe Your Symptoms</h2>
                <p className="symptom-step__hint">List the symptoms you're experiencing (e.g., headache, fatigue, fever).</p>
                <textarea
                  placeholder="Enter your symptoms..."
                  value={formData.symptoms}
                  onChange={(e) => updateForm('symptoms', e.target.value)}
                  className="symptom-step__textarea"
                  rows={4}
                />
              </div>
            )}

            {step === 2 && (
              <div className="symptom-step__content">
                <h2>How Long Have You Had These Symptoms?</h2>
                <p className="symptom-step__hint">Select the duration that best describes your situation.</p>
                <div className="symptom-step__options">
                  {DURATION_OPTIONS.map((opt) => (
                    <label key={opt} className="symptom-step__option">
                      <input
                        type="radio"
                        name="duration"
                        value={opt}
                        checked={formData.duration === opt}
                        onChange={(e) => updateForm('duration', e.target.value)}
                      />
                      <span className="symptom-step__option-label">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="symptom-step__content">
                <h2>How Severe Are Your Symptoms?</h2>
                <p className="symptom-step__hint">Rate the overall impact on your daily life.</p>
                <div className="symptom-step__severity">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <label key={opt.value} className="symptom-step__severity-option">
                      <input
                        type="radio"
                        name="severity"
                        value={opt.value}
                        checked={formData.severity === String(opt.value)}
                        onChange={() => updateForm('severity', String(opt.value))}
                      />
                      <span className="symptom-step__severity-card">
                        <span className="symptom-step__severity-label">{opt.label}</span>
                        <span className="symptom-step__severity-desc">{opt.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="symptom-step__actions">
              {step > 1 && (
                <button type="button" className="symptom-step__btn symptom-step__btn--secondary" onClick={prevStep}>
                  ← Back
                </button>
              )}
              <button
                type="button"
                className="symptom-step__btn symptom-step__btn--primary"
                onClick={nextStep}
                disabled={!canProceed()}
              >
                {step < 3 ? 'Continue' : 'Get Analysis'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SymptomAnalysis
