import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
    age: '',
    gender: '',
  })
  const [showResults, setShowResults] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [relatedStories, setRelatedStories] = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [relatedError, setRelatedError] = useState('')
  const [visibleSections, setVisibleSections] = useState({
    urgency: false,
    conditions: false,
    actions: false,
    disclaimer: false
  })

  // Load persisted analysis results from localStorage on component mount
  useEffect(() => {
    try {
      const persistedShowResults = localStorage.getItem('symptom-showResults')
      const persistedAnalysis = localStorage.getItem('symptom-analysis')
      const persistedRelatedStories = localStorage.getItem('symptom-relatedStories')

      if (persistedShowResults === 'true' && persistedAnalysis) {
        setShowResults(true)
        setAnalysis(JSON.parse(persistedAnalysis))
        if (persistedRelatedStories) {
          setRelatedStories(JSON.parse(persistedRelatedStories))
        }
        // Reveal sections progressively
        setTimeout(() => setVisibleSections(prev => ({ ...prev, urgency: true })), 0)
        setTimeout(() => setVisibleSections(prev => ({ ...prev, conditions: true })), 300)
        setTimeout(() => setVisibleSections(prev => ({ ...prev, actions: true })), 600)
        setTimeout(() => setVisibleSections(prev => ({ ...prev, disclaimer: true })), 900)
      }
    } catch (err) {
      console.error('Error loading persisted analysis:', err)
    }
  }, [])

  // Persist analysis results to localStorage whenever they change
  useEffect(() => {
    if (showResults && analysis) {
      try {
        localStorage.setItem('symptom-showResults', 'true')
        localStorage.setItem('symptom-analysis', JSON.stringify(analysis))
      } catch (err) {
        console.error('Error saving analysis to localStorage:', err)
      }
    }
  }, [showResults, analysis])

  // Persist related stories to localStorage whenever they change
  useEffect(() => {
    if (relatedStories.length > 0) {
      try {
        localStorage.setItem('symptom-relatedStories', JSON.stringify(relatedStories))
      } catch (err) {
        console.error('Error saving related stories to localStorage:', err)
      }
    }
  }, [relatedStories])

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 5) setStep(step + 1)
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
'Evaluating symptom severity...',
'Putting it all together...',
'Preparing recommendations...',
'Almost done...'
    ]
    let messageIndex = 0
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length
      setLoadingMessage(messages[messageIndex])
    }, 2500)

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
          age: parseInt(formData.age),
          gender: formData.gender,
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
    setFormData({ symptoms: '', duration: '', severity: '', age: '', gender: '' })
    setShowResults(false)
    setAnalysis(null)
    setApiError('')
    setLoadingMessage('')
    setRelatedStories([])
    setVisibleSections({
      urgency: false,
      conditions: false,
      actions: false,
      disclaimer: false
    })
    // Clear persisted data from localStorage
    try {
      localStorage.removeItem('symptom-showResults')
      localStorage.removeItem('symptom-analysis')
      localStorage.removeItem('symptom-relatedStories')
    } catch (err) {
      console.error('Error clearing persisted analysis:', err)
    }
  }

  const canProceed = () => {
    if (step === 1) return formData.symptoms.trim().length > 0
    if (step === 2) return formData.duration.length > 0
    if (step === 3) return formData.severity.length > 0
    if (step === 4) return formData.age && formData.age > 0 && formData.age < 150
    if (step === 5) return formData.gender.length > 0
    return false
  }

  // Fetch related stories based on diagnosed conditions once results are available
  useEffect(() => {
    if (!showResults || !analysis || !analysis.possibleConditions || analysis.possibleConditions.length === 0) {
      setRelatedStories([])
      return
    }

    const conditionNames = Array.from(
      new Set(
        analysis.possibleConditions
          .map((c) => (c.name || '').trim().toLowerCase())
          .filter(Boolean)
      )
    )

    if (conditionNames.length === 0) {
      setRelatedStories([])
      return
    }

    const fetchRelated = async () => {
      try {
        setRelatedLoading(true)
        setRelatedError('')

        const response = await fetch('http://localhost:5000/api/stories/')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch stories')
        }

        const transformedStories = data.stories.map((story) => ({
          id: story._id,
          title: story.title,
          excerpt: story.body.substring(0, 150) + '...',
          author: story.authorName,
          date: new Date(story.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          category: story.diseaseType,
        }))

        // Fuzzy matching: normalize and check containment or shared words
        const normalize = (str) =>
          (str || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(Boolean)

        const CATEGORY_SYNONYMS = {
          'mental health': [
            'anxiety',
            'panic',
            'depression',
            'stress',
            'ptsd',
            'ocd',
            'bipolar',
            'schizophrenia',
            'insomnia',
            'sleep',
            'burnout'
          ],
          respiratory: [
            'asthma',
            'bronchitis',
            'pneumonia',
            'copd',
            'cough',
            'shortness of breath',
            'wheezing',
            'sinusitis',
            'rhinitis',
            'cold',
            'flu'
          ],
          digestive: [
            'acid reflux',
            'gerd',
            'gastritis',
            'ulcer',
            'ibs',
            'ibd',
            'crohn',
            'colitis',
            'constipation',
            'diarrhea',
            'nausea',
            'vomiting',
            'stomach',
            'abdominal pain'
          ],
          cardiovascular: [
            'hypertension',
            'high blood pressure',
            'heart attack',
            'angina',
            'arrhythmia',
            'palpitations',
            'stroke',
            'cholesterol',
            'heart failure',
            'chest pain'
          ],
          neurological: [
            'migraine',
            'headache',
            'seizure',
            'epilepsy',
            'parkinson',
            'alzheimer',
            'neuropathy',
            'numbness',
            'tingling',
            'dizziness',
            'vertigo'
          ],
          skin: [
            'eczema',
            'psoriasis',
            'acne',
            'rash',
            'dermatitis',
            'hives',
            'urticaria',
            'infection',
            'fungal',
            'itching',
            'skin'
          ],
          musculoskeletal: [
            'arthritis',
            'joint pain',
            'back pain',
            'sprain',
            'strain',
            'muscle pain',
            'tendonitis',
            'tendinitis',
            'osteoporosis',
            'sciatica'
          ],
          endocrine: [
            'diabetes',
            'hypothyroid',
            'hyperthyroid',
            'thyroid',
            'pcos',
            'hormone',
            'adrenal',
            'cushing',
            'addison'
          ],
          reproductive: [
            'pregnancy',
            'menstrual',
            'period',
            'ovulation',
            'infertility',
            'endometriosis',
            'fibroid',
            'sti',
            'std',
            'vaginitis',
            'yeast infection'
          ],
          urinary: [
            'uti',
            'urinary tract',
            'bladder',
            'kidney stone',
            'stones',
            'cystitis',
            'urination',
            'incontinence',
            'prostate'
          ],
          eye: [
            'conjunctivitis',
            'pink eye',
            'dry eye',
            'glaucoma',
            'cataract',
            'vision',
            'blurred vision',
            'eye pain',
            'uveitis'
          ],
          ear: [
            'ear infection',
            'otitis',
            'tinnitus',
            'hearing loss',
            'vertigo',
            'ear pain',
            'wax'
          ],
          immune: [
            'allergy',
            'allergic',
            'autoimmune',
            'lupus',
            'rheumatoid',
            'immunodeficiency',
            'inflammation',
            'inflammatory'
          ],
          'infectious disease': [
            'infection',
            'viral',
            'bacterial',
            'fungal',
            'parasite',
            'covid',
            'influenza',
            'flu',
            'tuberculosis',
            'hepatitis',
            'strep'
          ],
          nutritional: [
            'malnutrition',
            'vitamin deficiency',
            'iron deficiency',
            'anemia',
            'dehydration',
            'low b12',
            'folate',
            'calcium deficiency'
          ]
        }

        const isFuzzyMatch = (conditionName, diseaseType) => {
          const cond = (conditionName || '').toLowerCase().trim()
          const dis = (diseaseType || '').toLowerCase().trim()
          if (!cond || !dis) return false

          // Simple contains check either way
          if (cond.includes(dis) || dis.includes(cond)) return true

          const condWords = normalize(conditionName)
          const disWords = normalize(diseaseType)
          if (condWords.length === 0 || disWords.length === 0) return false

          const stopWords = new Set(['disease', 'syndrome', 'disorder', 'condition'])
          const condSet = new Set(condWords.filter((w) => !stopWords.has(w)))
          const disSet = new Set(disWords.filter((w) => !stopWords.has(w)))

          let overlap = 0
          condSet.forEach((w) => {
            if (disSet.has(w)) overlap += 1
          })

          if (overlap > 0) return true

          // Category synonym layer: allow broad diseaseType categories to match specific conditions (and vice versa)
          // This runs only if the existing contains/overlap logic didn't match.
          const condText = ` ${normalize(conditionName).join(' ')} `
          const disText = ` ${normalize(diseaseType).join(' ')} `

          for (const [categoryKey, keywords] of Object.entries(CATEGORY_SYNONYMS)) {
            const cat = categoryKey.toLowerCase()

            const diseaseIsBroadCategory = dis.includes(cat) || disText.includes(` ${cat} `)
            const conditionIsBroadCategory = cond.includes(cat) || condText.includes(` ${cat} `)

            if (diseaseIsBroadCategory) {
              if (keywords.some((kw) => cond.includes(kw) || condText.includes(` ${normalize(kw).join(' ')} `))) {
                return true
              }
            }

            if (conditionIsBroadCategory) {
              if (keywords.some((kw) => dis.includes(kw) || disText.includes(` ${normalize(kw).join(' ')} `))) {
                return true
              }
            }
          }

          return false
        }

        const matched = transformedStories.filter((story) => {
          const diseaseType = story.category || ''
          return conditionNames.some((condName) => isFuzzyMatch(condName, diseaseType))
        })

        setRelatedStories(matched.slice(0, 3))
      } catch (err) {
        console.error('Error fetching related stories:', err)
        setRelatedError(err.message || 'Failed to load related stories')
        setRelatedStories([])
      } finally {
        setRelatedLoading(false)
      }
    }

    fetchRelated()
  }, [showResults, analysis])

  if (isLoading) {
    return (
      <div className="symptom-analysis">
        <div className="symptom-analysis__container">
          <header className="skeleton-header">
            <div className="skeleton-icon skeleton"></div>
            <div className="skeleton-title skeleton"></div>
            <div className="skeleton-subtitle skeleton"></div>
          </header>

          {/* Possible Conditions Section */}
          <section className="skeleton-section">
            <div className="skeleton-section-title skeleton"></div>
            <div className="skeleton-grid">
              {[1, 2, 3].map((index) => (
                <div key={index} className="skeleton-card">
                  <div className="skeleton-card-badge skeleton"></div>
                  <div className="skeleton-card-icon skeleton"></div>
                  <div className="skeleton-card-title skeleton"></div>
                  <div className="skeleton-card-text skeleton"></div>
                  <div className="skeleton-card-text skeleton"></div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Actions Section */}
          <section className="skeleton-recommendation">
            <div className="skeleton-recommendation-icon skeleton"></div>
            <div className="skeleton-recommendation-title skeleton"></div>
            <div className="skeleton-item skeleton"></div>
            <div className="skeleton-item skeleton"></div>
            <div className="skeleton-item skeleton"></div>
            <div className="skeleton-button skeleton"></div>
          </section>
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

          {/* Related Stories based on diagnosed conditions */}
          <section className="symptom-results__conditions" style={{ marginTop: '32px' }}>
            <h2>Related Stories</h2>
            {relatedLoading && (
              <p style={{ textAlign: 'center', color: '#666' }}>Finding stories from people with similar conditions...</p>
            )}
            {relatedError && !relatedLoading && (
              <p style={{ textAlign: 'center', color: '#c33' }}>Could not load related stories.</p>
            )}
            {!relatedLoading && !relatedError && relatedStories.length > 0 && (
              <div className="conditions-grid">
                {relatedStories.map((story) => (
                  <Link
                    key={story.id}
                    to={`/story/${story.id}`}
                    className="blog-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="blog-card__category">{story.category}</span>
                    <h3 className="blog-card__title">{story.title}</h3>
                    <p className="blog-card__excerpt">{story.excerpt}</p>
                    <div className="blog-card__meta">
                      <span className="blog-card__author">{story.author}</span>
                      <span className="blog-card__meta-dot">·</span>
                      <span>{story.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!relatedLoading && !relatedError && relatedStories.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666' }}>No related stories found yet.</p>
            )}
          </section>

          {/* Find People Like Me section - reusing authors from related stories */}
          <section className="symptom-results__conditions" style={{ marginTop: '32px' }}>
            <h2>Find People Like Me</h2>
            {relatedLoading ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Loading similar people...</p>
            ) : relatedStories.length > 0 ? (
              (() => {
                // Extract unique authors from relatedStories
                const uniqueAuthors = Array.from(
                  new Map(
                    relatedStories
                      .map((story) => [story.author, story.author])
                      .filter(([author]) => author && author.trim())
                  ).values()
                );

                return uniqueAuthors.length > 0 ? (
                  <div className="similar-users-container">
                    {uniqueAuthors.map((author) => (
                      <Link
                        key={author}
                        to={`/profile/${author}`}
                        className="similar-user-card"
                        style={{ textDecoration: 'none' }}
                        title={author}
                      >
                        <div className="similar-user-avatar">{author.charAt(0).toUpperCase()}</div>
                        <p className="similar-user-name">{author}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    No similar users found. Be the first to share your experience!
                  </p>
                );
              })()
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No similar users found. Be the first to share your experience!
              </p>
            )}
          </section>
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
            {[1, 2, 3, 4, 5].map((s) => (
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

            {step === 4 && (
              <div className="symptom-step__content">
                <h2>What Is Your Age?</h2>
                <p className="symptom-step__hint">Enter your age in years. This helps improve symptom analysis.</p>
                <input
                  type="number"
                  min="1"
                  max="150"
                  placeholder="Enter your age..."
                  value={formData.age}
                  onChange={(e) => updateForm('age', e.target.value)}
                  className="symptom-step__input"
                />
              </div>
            )}

            {step === 5 && (
              <div className="symptom-step__content">
                <h2>What Is Your Gender?</h2>
                <p className="symptom-step__hint">Select your gender. This helps tailor the analysis.</p>
                <div className="symptom-step__options">
                  {['Male', 'Female', 'Other'].map((genderOption) => (
                    <label key={genderOption} className="symptom-step__option">
                      <input
                        type="radio"
                        name="gender"
                        value={genderOption}
                        checked={formData.gender === genderOption}
                        onChange={(e) => updateForm('gender', e.target.value)}
                      />
                      <span className="symptom-step__option-label">{genderOption}</span>
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
                {step < 5 ? 'Continue' : 'Get Analysis'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SymptomAnalysis
