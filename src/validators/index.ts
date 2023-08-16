import { z } from 'zod'

export const createUserValidator = z.object({
  name: z.string(),
  login: z.string(),
  password: z.string(),
  email: z.string().email(),
  phone: z.string(),
  cpf: z.string(),
  birthDate: z.string(),
  motherName: z.string(),
  status: z.enum(['active', 'inactive', 'blocked']),
})
