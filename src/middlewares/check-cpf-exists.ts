import { FastifyReply, FastifyRequest } from 'fastify'
import prisma from '../database/client'

import { z } from 'zod'

export async function checkCpfExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const validCpf = z.object({
    cpf: z.string(),
  })

  const { cpf } = validCpf.parse(request.body)

  const user = await prisma.user.findUnique({
    where: { cpf },
  })

  if (user) {
    return reply.status(409).send({
      message: 'CPF already exists',
    })
  }
}
