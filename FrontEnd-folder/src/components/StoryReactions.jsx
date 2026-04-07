import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './StoryReactions.css'

const REACTIONS = [
  { type: 'helpful', emoji: '❤️', label: 'Helpful' },
  { type: 'relatable', emoji: '🤝', label: 'Relatable' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' }
]

function StoryReactions({ storyId, initialReactions = null }) {
  const { isAuthenticated } = useAuth()
  const [reactions, setReactions] = useState(initialReactions || {
    helpful: { count: 0, users: [] },
    relatable: { count: 0, users: [] },
    insightful: { count: 0, users: [] }
  })
  const [userReaction, setUserReaction] = useState(null)
  const [animatingReaction, setAnimatingReaction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch reactions on mount
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/stories/${storyId}/reactions`)
        const data = await response.json()
        
        if (data.success) {
          setReactions(data.reactions)
          setUserReaction(data.userReaction)
        }
      } catch (err) {
        console.error('Error fetching reactions:', err)
      }
    }

    fetchReactions()
  }, [storyId])

  const handleReaction = async (reactionType) => {
    if (!isAuthenticated) {
      alert('Please log in to react to stories')
      return
    }

    setLoading(true)
    setError('')
    setAnimatingReaction(reactionType)

    try {
      const response = await fetch(`http://localhost:5000/api/stories/${storyId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('careconnect-token')}`
        },
        body: JSON.stringify({ reactionType })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to react')
      }

      // Update UI with new reaction state
      setReactions(data.reactions)
      
      // Update user reaction state
      if (data.hasReacted) {
        setUserReaction(reactionType)
      } else {
        setUserReaction(null)
      }

      // Trigger animation
      setTimeout(() => setAnimatingReaction(null), 300)
    } catch (err) {
      console.error('Reaction error:', err)
      setError(err.message || 'Failed to update reaction')
      setAnimatingReaction(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="story-reactions">
      {error && <p className="story-reactions__error">{error}</p>}
      
      <div className="story-reactions__container">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.type}
            className={`story-reactions__button ${
              userReaction === reaction.type ? 'story-reactions__button--active' : ''
            } ${animatingReaction === reaction.type ? 'story-reactions__button--animating' : ''}`}
            onClick={() => handleReaction(reaction.type)}
            disabled={loading}
            title={`React: ${reaction.label}`}
          >
            <span className="story-reactions__emoji">{reaction.emoji}</span>
            <span className="story-reactions__label">{reaction.label}</span>
            <span className="story-reactions__count">{reactions[reaction.type]?.count || 0}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default StoryReactions
