import { FastifyReply, FastifyRequest } from 'fastify'
import prisma from '../database/client'

import { z } from 'zod'

export async function checkLoginExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const validLogin = z.object({
    login: z.string(),
  })

  const { login } = validLogin.parse(request.body)

  const user = await prisma.user.findUnique({
    where: { login },
  })

  if (user) {
    return reply.status(409).send({
      message: 'Login already exists',
    })
  }
}
