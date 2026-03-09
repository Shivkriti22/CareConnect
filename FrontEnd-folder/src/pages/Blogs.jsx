import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { allBlogs } from '../data/blogs'
import './Blogs.css'

const CATEGORIES = ['All', ...new Set(allBlogs.map((b) => b.category))]

function Blogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

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
  }, [searchQuery, selectedCategory])

  return (
    <div className="blogs-page">
      <header className="blogs-header">
        <h1 className="blogs-title">Health Stories</h1>
        <p className="blogs-subtitle">Read and share authentic health journeys from real people.</p>
      </header>

      <div className="blogs-toolbar">
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
        <div className="blogs-filters">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`blogs-filter-btn ${selectedCategory === category ? 'blogs-filter-btn--active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="blogs-grid">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <Link to={`/blogs/${blog.id}`} key={blog.id} className="blog-card">
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
          ))
        ) : (
          <p className="blogs-empty">No stories match your search. Try adjusting your filters.</p>
        )}
      </div>
    </div>
  )
}

export default Blogs
