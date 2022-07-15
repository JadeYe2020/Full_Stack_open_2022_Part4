const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sumOfLikes, blog) => {
    return sumOfLikes += blog.likes
  } , 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }
  
  let maxLikes = 0
  blogs.forEach(blog => {
    if (blog.likes > maxLikes) {
      maxLikes = blog.likes
    }
  })

  const favBlog = blogs.find(blog => blog.likes === maxLikes)

  return {
    title: favBlog.title,
    author: favBlog.author,
    likes: favBlog.likes
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const blogsCount = _.countBy(blogs, 'author')
  const names = Object.keys(blogsCount)

  const topAuthor = {
    author: names[0],
    blogs: blogsCount[names[0]]
  }

  names.forEach(name => {
    if (blogsCount[name] > topAuthor.blogs) {
      topAuthor.author = name,
      topAuthor.blogs = blogsCount[name]
    }
  })

  return topAuthor
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const blogsCount = _.countBy(blogs, 'author')
  const authors = Object.keys(blogsCount)

  const mostLikesAuthor = {
    author: authors[0],
    likes: 0
  }

  authors.forEach(author => {
    let likesCount = blogs
      .filter(blog => blog.author === author)
      .reduce((likes, blog) => {
        return likes += blog.likes
      }, 0)

    if (likesCount > mostLikesAuthor.likes) {
      mostLikesAuthor.author = author
      mostLikesAuthor.likes = likesCount
    }
  })

  return mostLikesAuthor
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}