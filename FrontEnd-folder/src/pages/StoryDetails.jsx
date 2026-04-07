import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import StoryReactions from '../components/StoryReactions'
import './StoryDetails.css'

function StoryDetails() {
  const { id } = useParams()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, token, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/stories/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch story')
        }

        setStory(data.story)
      // clear previous delete status
      setDeleteError('')
      setDeleteSuccess('')
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

  const isOwner = isAuthenticated && user && story.user && user.id === story.user

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this story?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/stories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete story')
      setDeleteSuccess('Story deleted successfully')
      // redirect after short delay
      setTimeout(() => navigate('/blogs'), 1500)
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  const handleEdit = () => {
    navigate(`/blogs/edit/${id}`)
  }

  return (
    <div className="story-details">
      {deleteError && <div className="story-details__error">{deleteError}</div>}
      {deleteSuccess && <div className="story-details__success">{deleteSuccess}</div>}
      <article className="story-details__article">
        <header className="story-details__header">
          <h1 className="story-details__title">{story.title}</h1>
          {isOwner && (
            <div className="story-details__actions">
              <button className="story-details__action-btn" onClick={handleEdit}>Edit</button>
              <button className="story-details__action-btn story-details__action-btn--delete" onClick={handleDelete}>Delete</button>
            </div>
          )}
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

        {/* Reactions Component */}
        <div className="story-details__reactions">
          <StoryReactions storyId={id} initialReactions={story.reactions} />
        </div>
      </article>
    </div>
  )
}

export default StoryDetails