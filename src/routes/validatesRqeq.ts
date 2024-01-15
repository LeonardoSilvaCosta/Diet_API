import { z } from 'zod'

export const validateUserShema = z.object({
  name: z.string(),
  email: z.string(),
})

export const validateMealsShema = z.object({
  name: z.string(),
  description: z.string(),
  intoDiet: z.boolean(),
})

export const validateQuery = z.object({
  id: z.string(),
})
