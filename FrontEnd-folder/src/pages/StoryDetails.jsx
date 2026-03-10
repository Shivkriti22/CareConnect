import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './StoryDetails.css'

function StoryDetails() {
  const { id } = useParams()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/stories/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch story')
        }

        setStory(data.story)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [id])

  if (loading) {
    return (
      <div className="story-details">
        <div className="story-details__loading">Loading story...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="story-details">
        <div className="story-details__error">Error: {error}</div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="story-details">
        <div className="story-details__not-found">Story not found</div>
      </div>
    )
  }

  return (
    <div className="story-details">
      <article className="story-details__article">
        <header className="story-details__header">
          <h1 className="story-details__title">{story.title}</h1>
          <div className="story-details__meta">
            <span className="story-details__author">By {story.authorName}</span>
            <span className="story-details__separator">·</span>
            <span className="story-details__category">{story.diseaseType}</span>
            <span className="story-details__separator">·</span>
            <span className="story-details__date">
              {new Date(story.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>
        <div className="story-details__content">
          <p className="story-details__body">{story.body}</p>
        </div>
      </article>
    </div>
  )
}

export default StoryDetails