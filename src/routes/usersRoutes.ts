import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database/database'
import { validateQuery, validateUserShema } from './validatesRqeq'

export async function userRoutes(app: FastifyInstance) {
  const usersTable = 'users'
  app.get('/all', async () => {
    const users = await knex(usersTable).select('*')
    return users
  })

  app.get('/', async (request) => {
    const { sessionId } = request.cookies
    const user = await knex(usersTable).where('session_id', sessionId).select()
    return user
  })

  app.post('/', async (request, reply) => {
    const { name, email } = validateUserShema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/', // In which routes the cookies will be availables
        maxAge: 100 * 60 * 60 * 24 * 7, // 7 days to expire the cookies
      })
    }

    await knex(usersTable).insert({
      id: crypto.randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send({ sessionId })
  })

  app.put('/:id', async (request, reply) => {
    const validateUserName = z.object({
      name: z.string(),
    })

    const { name } = validateUserName.parse(request.body)
    const { id } = validateQuery.parse(request.params)

    await knex(usersTable).where('id', id).update({
      name,
    })

    return reply.status(201).send(name)
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = validateQuery.parse(request.params)

    await knex(usersTable).where('id', id).del()

    return reply.status(201).send(id)
  })
}
