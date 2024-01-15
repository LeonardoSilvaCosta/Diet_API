import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('Users Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all') // clean databese
    execSync('npm run knex migrate:latest') // create again
  })

  it('should be able to create a new user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining('sessionId')]),
    )
  })

  it('Should be able to list all users', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = response.get('Set-Cookie')
    const usersLists = await request(app.server)
      .get('/users/all')
      .set('Cookie', cookies)
      .expect(200)

    expect(usersLists.body).toEqual([
      expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@gmail.com',
      }),
    ])
  })

  it('Should be able to delete a user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    const userLists = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    const userId = userLists.body[0].id

    await request(app.server)
      .delete(`/users/${userId}`)
      .set('Cookie', cookies)
      .expect(201)
  })

  it('Shold be able to update a user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    const userLists = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    const userId = userLists.body[0].id

    await request(app.server)
      .put(`/users/${userId}`)
      .send({
        name: 'John Doe Mars',
      })
      .set('Cookie', cookies)
      .expect(201)
  })
})
