import { FastifyInstance } from 'fastify'
import prisma from '../database/client'
import { createUserValidator } from '../validators'
import { middlewares } from '../middlewares'

export async function usersRoutes(app: FastifyInstance) {
  const { checkCpfExists, checkEmailExists, checkLoginExists } = middlewares

  app.post(
    '/',
    { preHandler: [checkCpfExists, checkEmailExists, checkLoginExists] },
    async (request, reply) => {
      const {
        name,
        email,
        login,
        password,
        motherName,
        cpf,
        birthDate,
        status,
        phone,
      } = createUserValidator.parse(request.body)

      await prisma.user.create({
        data: {
          name,
          email,
          login,
          password,
          motherName,
          cpf,
          birthDate,
          status,
          phone,
        },
      })

      return reply.status(201).send()
    },
  )

  app.get('/', async (request, reply) => {
    const users = await prisma.user.findMany()

    return reply.send(users).status(200)
  })

  app.patch('/:id', async (request, reply) => {
    return { hello: 'world' }
  })
}
