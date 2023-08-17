import { FastifyInstance } from 'fastify'
import prisma from '../database/client'

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import { validators } from '../validators'

export async function usersAuthRoutes(app: FastifyInstance) {
  const { loginValidator, recoverPasswordValidator } = validators

  app.post('/login', async (request, reply) => {
    const { login, password } = loginValidator.parse(request.body)

    const user = await prisma.user.findFirst({
      where: { login },
    })

    if (!user) {
      return reply.status(404).send({ message: 'User not found' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return reply.status(401).send({
        message: 'Invalid password',
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET ?? '',
      { expiresIn: '1d' },
    )

    return reply
      .send({
        token,
        user: {
          id: user.id,
          login: user.login,
          name: user.name,
          email: user.email,
        },
      })
      .code(200)
  })

  app.patch('/recover-password', async (request, reply) => {
    const { email, password } = recoverPasswordValidator.parse(request.body)

    const user = await prisma.user.findFirst({
      where: { email },
    })

    if (!user) {
      return reply.status(404).send({ message: 'User not found' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return reply.status(204).send()
  })
}
