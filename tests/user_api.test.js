const bcrypt = require('bcrypt')
const User = require('../models/user')

const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
})

describe('try to create an invalid user', () => {

  test('cannot create a user without a username', async ()=> {    
    const newUser = { password: 'newUsersPwd' }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(1)
  })

  test('cannot create a user without a password', async ()=> {    
    const newUser = { username: 'IHaveNoPassword' }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    
    expect(response.body.error).toEqual('password missing')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(1)
  })

  test('cannot create a user with a password less than 3 characters long', async ()=> {    
    const newUser = { 
      username: 'IHaveShortPassword',
      password: 'm1' 
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    
    expect(response.body.error).toEqual('password is too short')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(1)
  })

  test('cannot create a user with a username less than 3 characters long', async ()=> {    
    const newUser = { 
      username: 'me',
      password: 'normalpwd' 
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(1)
  })
})