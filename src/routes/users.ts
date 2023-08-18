import { FastifyInstance } from 'fastify'
import prisma from '../database/client'
import { validators } from '../validators'
import { middlewares } from '../middlewares'
import bcrypt from 'bcrypt'

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
    {
      preHandler: [checkCpfExists, checkEmailExists, checkLoginExists],
    },

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

      const hashedPassword = await bcrypt.hash(password, 10)

      await prisma.user.create({
        data: {
          name,
          email,
          login,
          password: hashedPassword,
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
    const { search, maxAge, minAge, date, status, page, pageSize } =
      userQueryValidator.parse(request.query)

    const offset = (Number(page) - 1) * Number(pageSize)

    const startDate = new Date(date ?? '')
    startDate.setUTCHours(0, 0, 0, 0)

    const endDate = new Date(date ?? '')
    endDate.setUTCHours(23, 59, 59, 999)

    const users = await prisma.user.findMany({
      take: Number(pageSize) || 10,
      skip: offset || 0,
      orderBy: { id: 'asc' },
      where: {
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
        OR: [
          {
            birthDate: {
              ...(date && { gte: startDate, lte: endDate }),
            },
          },
          {
            createdAt: {
              ...(date && { gte: startDate, lte: endDate }),
            },
          },
          {
            updatedAt: {
              ...(date && { gte: startDate, lte: endDate }),
            },
          },
        ],
        status: {
          ...(status && { equals: status }),
        },
      },
    })

    return reply.status(200).send(users)
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

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        login,
        password: hashedPassword,
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
