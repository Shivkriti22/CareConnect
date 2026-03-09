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

const MOCK_CONDITIONS = [
  { name: 'Tension Headache', match: '72%', type: 'Common', typeClass: 'common' },
  { name: 'Migraine', match: '58%', type: 'Possible', typeClass: 'possible' },
  { name: 'Sinusitis', match: '34%', type: 'Less likely', typeClass: 'less-likely' },
]

function SymptomAnalysis() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    symptoms: '',
    duration: '',
    severity: '',
  })
  const [showResults, setShowResults] = useState(false)

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
    else {
      setShowResults(true)
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const resetAnalysis = () => {
    setStep(1)
    setFormData({ symptoms: '', duration: '', severity: '' })
    setShowResults(false)
  }

  const canProceed = () => {
    if (step === 1) return formData.symptoms.trim().length > 0
    if (step === 2) return formData.duration.length > 0
    if (step === 3) return formData.severity.length > 0
    return false
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
              {MOCK_CONDITIONS.map((condition, index) => (
                <div key={condition.name} className="condition-card">
                  <span className={`condition-card__badge condition-card__badge--${condition.typeClass}`}>
                    {condition.type}
                  </span>
                  <div className="condition-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <h3 className="condition-card__name">{condition.name}</h3>
                  <span className="condition-card__match">{condition.match} match</span>
                </div>
              ))}
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
                This analysis is for informational purposes only and does not replace professional
                medical advice, diagnosis, or treatment. AI-generated insights are preliminary and
                may be inaccurate. Always seek the advice of a qualified healthcare provider with
                any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>

          <div className="symptom-results__recommendation">
            <div className="recommendation-card">
              <div className="recommendation-card__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3>Recommendation</h3>
              <p>
                We recommend consulting a healthcare professional for an accurate diagnosis and
                appropriate treatment plan. Share your symptoms, duration, and severity with your
                doctor for the best care.
              </p>
              <button type="button" className="recommendation-card__btn" onClick={resetAnalysis}>
                Start New Analysis
              </button>
            </div>
          </div>
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
