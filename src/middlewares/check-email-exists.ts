import { FastifyReply, FastifyRequest } from 'fastify'
import prisma from '../database/client'

import { z } from 'zod'

export async function checkEmailExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const validEmail = z.object({
    email: z.string().email(),
  })

  const { email } = validEmail.parse(request.body)

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (user) {
    return reply.status(409).send({
      message: 'Email already exists',
    })
  }
}
