import { allBlogs } from './blogs'

export const mockUser = {
  name: 'Sarah M.',
  email: 'sarah@example.com',
  memberSince: 'January 2024',
}

export const authoredBlogIds = ['1']

export const savedBlogIds = ['2', '4', '5']

export function getAuthoredBlogs() {
  return allBlogs.filter((blog) => authoredBlogIds.includes(blog.id))
}

export function getSavedBlogs() {
  return allBlogs.filter((blog) => savedBlogIds.includes(blog.id))
}
