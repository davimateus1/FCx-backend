import { FastifyInstance } from 'fastify'
import prisma from '../database/client'
import { validators } from '../validators'
import { middlewares } from '../middlewares'

export async function usersRoutes(app: FastifyInstance) {
  const { checkCpfExists, checkEmailExists, checkLoginExists } = middlewares
  const {
    softDeleteUserBodyValidator,
    idValidator,
    userValidator,
    userQueryValidator,
  } = validators

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
      } = userValidator.parse(request.body)

      const age = new Date().getFullYear() - new Date(birthDate).getFullYear()

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
          age,
        },
      })

      return reply.status(201).send()
    },
  )

  app.get('/', async (request, reply) => {
    const { search, maxAge, minAge, date } = userQueryValidator.parse(
      request.query,
    )

    const users = await prisma.user.findMany({
      where: {
        deleted: false,
        ...(search && {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              email: {
                contains: search,
              },
            },
            {
              cpf: {
                contains: search,
              },
            },
          ],
        }),
        age: {
          ...(minAge && { gte: Number(minAge) }),
          ...(maxAge && { lte: Number(maxAge) }),
        },
        birthDate: {
          ...(date && { equals: new Date(date) }),
        },
        createdAt: {
          ...(date && { equals: new Date(date) }),
        },
        updatedAt: {
          ...(date && { equals: new Date(date) }),
        },
      },
    })

    return reply.send(users).status(200)
  })

  app.patch('/:id', async (request, reply) => {
    const { id } = idValidator.parse(request.params)

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
    } = userValidator.parse(request.body)

    await prisma.user.update({
      where: { id: Number(id) },
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

    return reply.status(204).send()
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = idValidator.parse(request.params)
    const { status } = softDeleteUserBodyValidator.parse(request.body)

    await prisma.user.update({
      where: { id: Number(id) },
      data: { status },
    })

    return reply.status(204).send()
  })
}
