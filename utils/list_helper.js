const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sumOfLikes, blog) => {
    return sumOfLikes += blog.likes
  } , 0)
}

module.exports = {
  dummy,
  totalLikes
}