const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const blogs = [
      {
        id: '5a422aa71b54a676234d17f8',
        title: 'First blog',
        author: 'Jane Doe',
        url: 'http://somelink.com',
        likes: 5
      }
    ]

    expect(listHelper.totalLikes(blogs)).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = [
      {
        id: '5a422aa71b54a676234d17f8',
        title: 'First blog',
        author: 'Jane Doe',
        url: 'http://somelink.com',
        likes: 5
      },
      {
        id: '5a422b3a1b54a676234d17f9',
        title: 'Second blog',
        author: 'John Doe',
        url: 'http://somelink.com',
        likes: 2
      },
      {
        id: '5a422b3a1b54a676234d17fa',
        title: 'Third blog',
        author: 'Jane Doe',
        url: 'http://somelink.com',
        likes: 7
      }
    ]

    expect(listHelper.totalLikes(blogs)).toBe(14)
  })
})