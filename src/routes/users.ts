import { FastifyInstance } from 'fastify'
import prisma from '../database/client'
import { validators } from '../validators'
import { middlewares } from '../middlewares'
import bcrypt from 'bcrypt'

export async function usersRoutes(app: FastifyInstance) {
  const { checkCpfExists, checkEmailExists, checkLoginExists } = middlewares
  const {
    idValidator,
    editUserValidator,
    userQueryValidator,
    createUserValidator,
    softDeleteUserBodyValidator,
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
      } = createUserValidator.parse(request.body)

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
    const { search, maxAge, minAge, from, to, status, page } =
      userQueryValidator.parse(request.query)

    const pageSize = 10
    const offset = (Number(page) - 1) * Number(pageSize)

    const startDate = new Date(from ?? '')
    startDate.setUTCHours(0, 0, 0, 0)

    const endDate = new Date(to ?? '')
    endDate.setUTCHours(23, 59, 59, 999)

    const query = {
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
        ...(from &&
          to && {
            OR: [
              { birthDate: { gte: startDate, lte: endDate } },
              { createdAt: { gte: startDate, lte: endDate } },
              { updatedAt: { gte: startDate, lte: endDate } },
            ],
          }),
        status: {
          ...(status && { equals: status }),
        },
      },
    }

    const users = await prisma.user.findMany({
      take: Number(pageSize),
      skip: offset || 0,
      orderBy: { id: 'asc' },
      ...query,
    })

    const totalPages = Math.ceil(
      (await prisma.user.count({ ...query })) / pageSize,
    )

    return reply.status(200).send({
      users,
      totalPages,
    })
  })

  app.get('/:id', async (request, reply) => {
    const { id } = idValidator.parse(request.params)

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    })

    return reply.status(200).send(user)
  })

  app.patch('/:id', async (request, reply) => {
    const { id } = idValidator.parse(request.params)

    const {
      name,
      email,
      login,
      motherName,
      cpf,
      birthDate,
      status,
      phone,
      age,
    } = editUserValidator.parse(request.body)

    const existingUsers = await prisma.user.findMany({
      where: {
        NOT: { id: Number(id) },
        OR: [{ cpf }, { login }, { email }],
      },
    })

    if (existingUsers.length > 0) {
      return reply.status(400).send({
        message: 'CPF, login or email already exists.',
      })
    }

    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        login,
        motherName,
        cpf,
        birthDate,
        status,
        phone,
        age,
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

  app.delete('/all', async (_, reply) => {
    await prisma.user.updateMany({
      where: { status: 'active' },
      data: { status: 'inactive' },
    })

    return reply.status(204).send()
  })
}
