require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Blog = require('./models/blog')
const middleware = require('./utils/middleware')

// const blogSchema = new mongoose.Schema({
//   title: String,
//   author: String,
//   url: String,
//   likes: Number
// })

// blogSchema.set('toJSON', {
//   transform: (document, returnedObj) => {
//     returnedObj.id = returnedObj._id.toString()
//     delete returnedObj._id
//     delete returnedObj.__v
//   }
// })

// const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = process.env.MONGODB_URI
mongoose.connect(mongoUrl)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connecting to MongoDB', error.message)
  })

app.use(cors())
app.use(express.json())

app.use(middleware.requestLogger)

app.get('/', (request, response) => {
  response.send('<h1>Bloglist Backend</h1>')
})

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})