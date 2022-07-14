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

test('if the likes property is missing from the request the value is 0', async () => {
  const newBlog = {
    title: 'Test creating a new blog with no likes prop',
    author: 'testing',
    url: 'http://testing.test'
  }

  await api.post('/api/blogs', newBlog)
    .send(newBlog)
    .expect(201)
  
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const blogsAdded = blogsAtEnd[blogsAtEnd.length -1]
  expect(blogsAdded.likes).toEqual(0)
})

test('the title and url properties are missing cannot be added', async () => {
  const newBlogNoTitle = {
    author: 'testing',
    url: 'http://testing.test',
    likes: 6
  }
  const newBlogNoUrl = {
    title: 'Test creating a new blog but no url',
    author: 'testing2',
    likes: 5
  }

  await api.post('/api/blogs', newBlogNoTitle)
    .expect(400)
  
  await api.post('/api/blogs', newBlogNoUrl)
    .expect(400)
})

test('delete a blog post', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToRemove = blogsAtStart[0]

  await api.delete(`/api/blogs/${blogToRemove.id}`)
    .expect(204)
  
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
  
  const titles = blogsAtEnd.map(blog => blog.title)
  expect(titles).not.toContain(blogToRemove.title)
})

test('update a post with one more like', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  const blogWithNewLikes = {
    likes: blogToUpdate.likes + 1
  }
  
  await api.put(`/api/blogs/${blogToUpdate.id}`, blogWithNewLikes)
    .send(blogWithNewLikes)
  const blogsAtEnd = await helper.blogsInDb()
  console.log(blogsAtEnd)
  const blogUpdated = blogsAtEnd.find(b => b.id === blogToUpdate.id)
  expect(blogUpdated.likes).toEqual(blogToUpdate.likes + 1)
})

afterAll(() => {
  mongoose.connection.close()
})