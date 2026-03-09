import { Link } from 'react-router-dom'
import { featuredBlogs } from '../data/blogs'
import './Home.css'

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__headline">
            Real health stories.{' '}
            <br />
            <span className="hero__headline-accent">AI-powered insights.</span>{' '}
            Responsible care.
          </h1>
          <p className="hero__tagline">Connecting people through shared experiences.</p>
          <p className="hero__subtext">
            CareConnect empowers you to share personal health experiences and access
            AI-assisted symptom analysis, all while promoting responsible healthcare
            guidance.
          </p>
          <div className="hero__ctas">
            <Link to="/blogs" className="hero__btn hero__btn--primary">
              <span className="hero__btn-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <line x1="8" y1="7" x2="16" y2="7" />
                  <line x1="8" y1="11" x2="16" y2="11" />
                </svg>
              </span>
              Explore Health Stories
            </Link>
            <Link to="/symptom-analysis" className="hero__btn hero__btn--secondary">
              <span className="hero__btn-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </span>
              Analyze Symptoms
            </Link>
            <Link to="/blogs/create" className="hero__btn hero__btn--secondary">
              <span className="hero__btn-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              Share Your Experience
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features__grid">
          <article className="feature-card">
            <div className="feature-card__icon feature-card__icon--teal">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="8" y1="7" x2="16" y2="7" />
                <line x1="8" y1="11" x2="16" y2="11" />
                <line x1="8" y1="15" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="feature-card__title">Share Experiences</h3>
            <p className="feature-card__desc">
              Read and share authentic health journeys from real people facing similar challenges.
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-card__icon feature-card__icon--blue">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3 className="feature-card__title">AI-Assisted Analysis</h3>
            <p className="feature-card__desc">
              Get preliminary symptom insights while understanding the importance of professional care.
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-card__icon feature-card__icon--green">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="feature-card__title">Responsible Guidance</h3>
            <p className="feature-card__desc">
              Ethical healthcare communication with clear disclaimers and professional referrals.
            </p>
          </article>
        </div>
      </section>

      {/* Featured Health Stories */}
      <section className="featured">
        <div className="featured__header">
          <h2 className="featured__title">Featured Health Stories</h2>
          <Link to="/blogs" className="featured__view-all">
            View all
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
        <div className="featured__grid">
          {featuredBlogs.map((blog) => (
            <Link to={`/blogs/${blog.id}`} key={blog.id} className="blog-card">
              <div className="blog-card__content">
                <span className="blog-card__category">{blog.category}</span>
                <h3 className="blog-card__title">{blog.title}</h3>
                <p className="blog-card__excerpt">{blog.excerpt}</p>
                <div className="blog-card__meta">
                  <span>{blog.author}</span>
                  <span className="blog-card__meta-dot">·</span>
                  <span>{blog.date}</span>
                  <span className="blog-card__meta-dot">·</span>
                  <span>{blog.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="featured__cta">
          <Link to="/blogs/create" className="featured__share-btn">
            <span className="featured__share-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </span>
            Share Your Story
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__content">
          <p className="footer__tagline">CareConnect — Connecting people through shared experiences.</p>
          <div className="footer__links">
            <Link to="/blogs">Health Stories</Link>
            <Link to="/symptom-analysis">Analyze Symptoms</Link>
            <Link to="/blogs/create">Share Your Story</Link>
          </div>
          <p className="footer__copy">© {new Date().getFullYear()} CareConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
