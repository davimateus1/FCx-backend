import { FastifyInstance } from 'fastify'
import { usersRoutes } from './users'
import { usersDocumentsRoutes } from './users-documents'
import { usersAuthRoutes } from './users-auth'

export async function routes(app: FastifyInstance) {
  app.register(usersRoutes, { prefix: '/users' })
  app.register(usersDocumentsRoutes, { prefix: '/users-documents' })
  app.register(usersAuthRoutes, { prefix: '/auth' })
}
