import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { knex } from '../database/database'
import { validateMealsShema, validateQuery } from './validatesRqeq'

export async function mealsRoutes(app: FastifyInstance) {
  const mealsTable = 'meals'
  app.get('/', async (request, reply) => {
    const { sessionId } = request.cookies
    const meals = await knex(mealsTable).where('user_id', sessionId).select()
    if (!meals) {
      return reply.status(404).send({
        message: 'Meals not found',
      })
    }
    return meals
  })

  app.get('/:id', async (request, reply) => {
    const { id } = validateQuery.parse(request.params)

    const meal = await knex(mealsTable).where('id', id).select().first()

    if (!meal) {
      return reply.status(404).send({
        message: 'Meal not found',
      })
    }

    return meal
  })

  app.get('/metrics', async (request, reply) => {
    const { sessionId } = request.cookies
    const totalMeals = await knex(mealsTable)
      .where('user_id', sessionId)
      .orderBy('created_at', 'desc')

    if (!totalMeals) {
      return reply.status(404).send({
        message: 'No Meals register',
      })
    }

    const totalMealsIntoDiet = await knex(mealsTable)
      .where({
        user_id: sessionId,
        into_diet: true,
      })
      .count('id', { as: 'total' })
      .first()

    const totalMealsOutOffDiet = await knex(mealsTable)
      .where({
        user_id: sessionId,
        into_diet: false,
      })
      .count('id', { as: 'total' })
      .first()

    const { bestOnDietSequence } = totalMeals.reduce(
      (acc, meal) => {
        if (meal.into_diet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestOnDietSequence) {
          acc.bestOnDietSequence = acc.currentSequence
        }

        return acc
      },
      { bestOnDietSequence: 0, currentSequence: 0 },
    )

    return reply.status(201).send({
      total_meals: totalMeals.length,
      into_diet: totalMealsIntoDiet?.total,
      outof_diet: totalMealsOutOffDiet?.total,
      bestOnDietSequence,
    })
  })

  app.post('/', async (request, reply) => {
    const { sessionId } = request.cookies
    const { name, description, intoDiet } = validateMealsShema.parse(
      request.body,
    )

    await knex(mealsTable).insert({
      id: crypto.randomUUID(),
      name,
      description,
      into_diet: intoDiet,
      user_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const { id } = validateQuery.parse(request.params)
    const { name, description, intoDiet } = validateMealsShema.parse(
      request.body,
    )

    await knex(mealsTable)
      .where('id', id)
      .update({
        name,
        description,
        into_diet: intoDiet,
        updated_at: String(new Date().toLocaleString()),
      })

    return reply.status(201).send()
  })
  app.delete('/:id', async (request, reply) => {
    const { id } = validateQuery.parse(request.params)

    await knex(mealsTable).where('id', id).del()

    return reply.status(201).send(id)
  })
}
