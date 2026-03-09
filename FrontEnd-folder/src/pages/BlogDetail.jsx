import { useParams, Link } from 'react-router-dom'
import { getBlogById, getRelatedBlogs } from '../data/blogs'
import './BlogDetail.css'

function BlogDetail() {
  const { id } = useParams()
  const blog = getBlogById(id)

  if (!blog) {
    return (
      <div className="blog-detail blog-detail--not-found">
        <h1>Story Not Found</h1>
        <p>This health story could not be found.</p>
        <Link to="/blogs" className="blog-detail__back-link">← Back to Health Stories</Link>
      </div>
    )
  }

  const relatedBlogs = getRelatedBlogs(blog.id, blog.category)

  return (
    <article className="blog-detail">
      <header className="blog-detail__header">
        <span className="blog-detail__category">{blog.category}</span>
        <h1 className="blog-detail__title">{blog.title}</h1>
        <div className="blog-detail__meta">
          <span className="blog-detail__author">{blog.author}</span>
          <span className="blog-detail__meta-sep">·</span>
          <span>{blog.date}</span>
          <span className="blog-detail__meta-sep">·</span>
          <span>{blog.readTime}</span>
        </div>
        <div className="blog-detail__tags">
          {blog.tags.map((tag) => (
            <span key={tag} className="blog-detail__tag">{tag}</span>
          ))}
        </div>
      </header>

      <div className="blog-detail__disclaimer">
        <span className="blog-detail__disclaimer-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </span>
        <div>
          <strong>Medical Disclaimer</strong>
          <p>
            The content on CareConnect is for informational purposes only and does not constitute
            medical advice. Personal health stories reflect individual experiences and may not
            apply to your situation. Always consult a qualified healthcare professional for
            medical decisions. If you have a medical emergency, seek immediate care.
          </p>
        </div>
      </div>

      <div className="blog-detail__content">
        {blog.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <section className="blog-detail__author-section">
        <h3>About the Author</h3>
        <div className="blog-detail__author-card">
          <div className="blog-detail__author-avatar" aria-hidden="true">
            {blog.author.charAt(0)}
          </div>
          <div>
            <p className="blog-detail__author-name">{blog.author}</p>
            <p className="blog-detail__author-bio">{blog.authorBio}</p>
          </div>
        </div>
      </section>

      {relatedBlogs.length > 0 && (
        <section className="blog-detail__related">
          <h2>Related Stories</h2>
          <div className="blog-detail__related-grid">
            {relatedBlogs.map((related) => (
              <Link to={`/blogs/${related.id}`} key={related.id} className="blog-detail__related-card">
                <span className="blog-detail__related-category">{related.category}</span>
                <h3 className="blog-detail__related-title">{related.title}</h3>
                <p className="blog-detail__related-excerpt">{related.excerpt}</p>
                <span className="blog-detail__related-meta">{related.author} · {related.readTime}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="blog-detail__footer">
        <Link to="/blogs" className="blog-detail__back-link">← Back to Health Stories</Link>
      </div>
    </article>
  )
}

export default BlogDetail
