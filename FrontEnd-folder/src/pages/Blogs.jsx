import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StoryReactions from '../components/StoryReactions'
import './Blogs.css'

function Blogs() {
  const [allBlogs, setAllBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')

  // auth info
  const token = localStorage.getItem('careconnect-token')
  const userString = localStorage.getItem('careconnect-user')
  const user = userString ? JSON.parse(userString) : null
  const isAuthenticated = !!token

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Really delete this story?')) return
    setDeleteError('')
    setDeleteSuccess('')
    try {
      const res = await fetch(`http://localhost:5000/api/stories/${blogId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not delete')
      setAllBlogs((prev) => prev.filter((b) => b.id !== blogId))
      setDeleteSuccess('Story deleted.')
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  useEffect(() => {
    const fetchAllStories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stories/')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch stories')
        }

        // Transform the data to match frontend structure
        const transformedStories = data.stories.map((story) => ({
          id: story._id,
          title: story.title,
          excerpt: story.body.substring(0, 150) + '...',
          author: story.authorName,
          authorBio: `Health story by ${story.authorName}`,
          date: new Date(story.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          category: story.diseaseType,
          readTime: '5 min read',
          tags: [story.diseaseType.toLowerCase()],
          content: [story.body],
          userId: story.user, // this is the owner id
          reactions: story.reactions // Add reactions data
        }))

        setAllBlogs(transformedStories)
      } catch (err) {
        console.error('Error fetching stories:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAllStories()
  }, [])

  const CATEGORIES = ['All', ...new Set(allBlogs.map((b) => b.category))]

  const filteredBlogs = useMemo(() => {
    return allBlogs.filter((blog) => {
      const matchesSearch =
        searchQuery === '' ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === 'All' || blog.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, allBlogs])

  return (
    <div className="blogs-page">
      <header className="blogs-header">
        <h1 className="blogs-title">Health Stories</h1>
        <p className="blogs-subtitle">Read and share authentic health journeys from real people.</p>
      </header>

      <div className="blogs-toolbar">
        <div className="blogs-toolbar-row">
          <div className="blogs-search">
            <span className="blogs-search-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blogs-search-input"
              aria-label="Search health stories"
            />
          </div>

          <div className="blogs-category">
            <select
              className="blogs-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter((c) => c !== 'All').map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {deleteError && <p style={{ color: '#c33', textAlign: 'center' }}>{deleteError}</p>}
      {deleteSuccess && <p style={{ color: 'green', textAlign: 'center' }}>{deleteSuccess}</p>}
      <div className="blogs-grid">
        {loading && <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Loading stories...</p>}
        {error && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#c33' }}>Error: {error}</p>}
        {!loading && !error && filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div key={blog.id} className="blog-card-wrapper">
              <Link to={`/story/${blog.id}`} className="blog-card">
                <span className="blog-card__category">{blog.category}</span>
                <h3 className="blog-card__title">{blog.title}</h3>
                <p className="blog-card__excerpt">{blog.excerpt}</p>
                <div className="blog-card__meta">
                  <span className="blog-card__author">{blog.author}</span>
                  <span className="blog-card__meta-dot">·</span>
                  <span>{blog.readTime}</span>
                </div>
                <div className="blog-card__tags">
                  {blog.tags.map((tag) => (
                    <span key={tag} className="blog-card__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
              <div className="blog-card__reactions">
                <StoryReactions storyId={blog.id} initialReactions={blog.reactions} />
              </div>
              {isAuthenticated && user && user.id === blog.userId && (
                <div className="blog-card-actions">
                  <Link to={`/blogs/edit/${blog.id}`} className="blog-card-action-btn">Edit</Link>
                  <button
                    className="blog-card-action-btn blog-card-action-btn--delete"
                    onClick={() => handleDeleteBlog(blog.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : !loading && !error ? (
          <p className="blogs-empty">No stories match your search. Try adjusting your filters.</p>
        ) : null}
      </div>
    </div>
  )
}

export default Blogs
