const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = await new Blog(blog)
    await blogObject.save()
  }

  // initialize a root user
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()
})

describe('do not need authentication', () => {
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
  
  test('update a post with one more like', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const blogWithNewLikes = {
      likes: blogToUpdate.likes + 1
    }
    
    await api.put(`/api/blogs/${blogToUpdate.id}`, blogWithNewLikes)
      .send(blogWithNewLikes)
    const blogsAtEnd = await helper.blogsInDb()
    const blogUpdated = blogsAtEnd.find(b => b.id === blogToUpdate.id)
    expect(blogUpdated.likes).toEqual(blogToUpdate.likes + 1)
  })
})

describe('Requests that require authentication', () => {
  test('a new blog post can be added with correct user login', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret'})
    
    const token = response.body.token
      
    const newBlog = {
      title: 'Test creating a new blog',
      author: 'testing',
      url: 'http://testing.test',
      likes: 6
    }
  
    await api.post('/api/blogs')
      .send(newBlog)
      .set('authorization', `bearer ${token}`)
      .expect(201)
      
    const blogsAtEnd = await helper.blogsInDb()
    const titles = blogsAtEnd.map(blog => blog.title)
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain(newBlog.title)
  })

  test('cannot add new posts with no token', async () => {
    const token = ''
      
    const newBlog = {
      title: 'Test creating a new blog',
      author: 'testing',
      url: 'http://testing.test',
      likes: 6
    }
  
    await api.post('/api/blogs')
      .send(newBlog)
      .set('authorization', `bearer ${token}`)
      .expect(401)
      
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)    
  })

  test('if the likes property is missing from the request the value is 0', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret'})
    
    const token = response.body.token
    
    const newBlog = {
      title: 'Test creating a new blog with no likes prop',
      author: 'testing',
      url: 'http://testing.test'
    }
  
    await api.post('/api/blogs')
      .send(newBlog)
      .set('authorization', `bearer ${token}`)
      .expect(201)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const blogsAdded = blogsAtEnd[blogsAtEnd.length -1]
    expect(blogsAdded.likes).toEqual(0)
  })
  
  test('the title and url properties are missing cannot be added', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret'})
  
    const token = response.body.token
    
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
      .set('authorization', `bearer ${token}`)
      .expect(400)
    
    await api.post('/api/blogs', newBlogNoUrl)
      .set('authorization', `bearer ${token}`)
      .expect(400)
  })
  
  test('delete a blog post created by the same user', async () => {
    // initialize a new post created by root user
    const user = await User.findOne()
    const newPostByRoot = {
      _id: '5a422bc61b54a676234d1789',
      title: 'new blog on testing',
      author: 'someone',
      url: 'http://blog.dummy.com/testing.html',
      likes: 0,
      __v: 0,
      user: user._id
    }
    let newPost = await Blog(newPostByRoot)
    await newPost.save()
  
    const blogsAtStart = await helper.blogsInDb()
    const blogToRemove = blogsAtStart[blogsAtStart.length -1]
  
    // get the token value
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret'})  
    const token = response.body.token
  
    await api.delete(`/api/blogs/${blogToRemove.id}`)
      .set('authorization', `bearer ${token}`)
      .expect(204)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
    
    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(blogToRemove.title)
  })

  test('cannot delete a blog post without correct token', async () => {
    // initialize a new post created by root user
    const user = await User.findOne()
    const newPostByRoot = {
      _id: '5a422bc61b54a676234d1789',
      title: 'new blog on testing',
      author: 'someone',
      url: 'http://blog.dummy.com/testing.html',
      likes: 0,
      __v: 0,
      user: user._id
    }
    let newPost = await Blog(newPostByRoot)
    await newPost.save()
  
    const blogsAtStart = await helper.blogsInDb()
    const blogToRemove = blogsAtStart[blogsAtStart.length -1]
  
    const token = ''
  
    await api.delete(`/api/blogs/${blogToRemove.id}`)
      .set('authorization', `bearer ${token}`)
      .expect(401)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})