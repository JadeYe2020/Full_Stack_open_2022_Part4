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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}