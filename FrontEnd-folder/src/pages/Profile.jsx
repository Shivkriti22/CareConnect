import { Link } from 'react-router-dom'
import { mockUser, getAuthoredBlogs, getSavedBlogs } from '../data/profile'
import './Profile.css'

function Profile() {
  const authoredBlogs = getAuthoredBlogs()
  const savedBlogs = getSavedBlogs()

  return (
    <div className="profile">
      <div className="profile__container">
        {/* User Info */}
        <section className="profile__user">
          <div className="profile__avatar">{mockUser.name.charAt(0)}</div>
          <div className="profile__info">
            <h1 className="profile__name">{mockUser.name}</h1>
            <p className="profile__email">{mockUser.email}</p>
            <p className="profile__meta">Member since {mockUser.memberSince}</p>
          </div>
        </section>

        {/* Authored Blogs */}
        <section className="profile__section">
          <h2>My Stories</h2>
          {authoredBlogs.length > 0 ? (
            <div className="profile__grid">
              {authoredBlogs.map((blog) => (
                <Link to={`/blogs/${blog.id}`} key={blog.id} className="profile__card">
                  <span className="profile__card-category">{blog.category}</span>
                  <h3 className="profile__card-title">{blog.title}</h3>
                  <p className="profile__card-excerpt">{blog.excerpt}</p>
                  <span className="profile__card-meta">{blog.date} · {blog.readTime}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="profile__empty">
              <p>You haven't shared any stories yet.</p>
              <Link to="/blogs/create" className="profile__empty-link">Share your first story</Link>
            </div>
          )}
        </section>

        {/* Saved Blogs */}
        <section className="profile__section">
          <h2>Saved Stories</h2>
          {savedBlogs.length > 0 ? (
            <div className="profile__grid">
              {savedBlogs.map((blog) => (
                <Link to={`/blogs/${blog.id}`} key={blog.id} className="profile__card">
                  <span className="profile__card-category">{blog.category}</span>
                  <h3 className="profile__card-title">{blog.title}</h3>
                  <p className="profile__card-excerpt">{blog.excerpt}</p>
                  <span className="profile__card-meta">{blog.author} · {blog.readTime}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="profile__empty">
              <p>No saved stories yet.</p>
              <Link to="/blogs" className="profile__empty-link">Explore health stories</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Profile
