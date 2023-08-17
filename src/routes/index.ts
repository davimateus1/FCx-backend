import { FastifyInstance } from 'fastify'
import { usersRoutes } from './users'
import { usersDocumentsRoutes } from './users-documents'

export async function routes(app: FastifyInstance) {
  app.register(usersRoutes, { prefix: '/users' })
  app.register(usersDocumentsRoutes, { prefix: '/users-documents' })
}
