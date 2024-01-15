import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { mealsRoutes } from './routes/mealsRoutes'
import { userRoutes } from './routes/usersRoutes'
import { checkSessionIdExist } from './middlewares/check-session-id'

export const app = fastify()

app.register(cookie) // set cookies
app.addHook('preHandler', checkSessionIdExist)

app.register(userRoutes, {
  prefix: 'users',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})
