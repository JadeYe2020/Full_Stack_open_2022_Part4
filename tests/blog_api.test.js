const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = await new Blog(blog)
    await blogObject.save()
  }
})

test('Blogs are returned with the correct amount and in the JSON format', async () => {
  const response = await api.get('/api/blogs')
    .expect('Content-Type', /application\/json/)

  expect(response.body).toHaveLength(helper.initialBlogs.length) 
})

test('the unique identifier property of the blog posts is named id', async () => {
  const blogsAtEnd = await helper.blogsInDb()
  const blogToTest = blogsAtEnd[0]

  expect(blogToTest.id).toBeDefined()
})

test('a new blog post can be added', async () => {
  const newBlog = {
    title: 'Test creating a new blog',
    author: 'testing',
    url: 'http://testing.test',
    likes: 6
  }
  
  await api.post('/api/blogs', newBlog)
    .send(newBlog)
    .expect(201)
  
  const blogsAtEnd = await helper.blogsInDb()
  const titles = blogsAtEnd.map(blog => blog.title)
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  expect(titles).toContain(newBlog.title)
})

afterAll(() => {
  mongoose.connection.close()
})