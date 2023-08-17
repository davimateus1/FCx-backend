import { z } from 'zod'

const userValidator = z.object({
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

const userQueryValidator = z.object({
  search: z.string().optional(),
  minAge: z.string().optional(),
  maxAge: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
})

const idValidator = z.object({
  id: z.string(),
})

const softDeleteUserBodyValidator = z.object({
  status: z.enum(['active', 'inactive', 'blocked']),
})

const loginValidator = z.object({
  login: z.string(),
  password: z.string(),
})

const recoverPasswordValidator = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const validators = {
  idValidator,
  userValidator,
  loginValidator,
  userQueryValidator,
  recoverPasswordValidator,
  softDeleteUserBodyValidator,
}
