import fastify from 'fastify'
import { routes } from './routes'
import cors from '@fastify/cors'

const app = fastify()

app.register(cors, { origin: '*' })

routes(app)

export default app
