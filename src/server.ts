import fastify from 'fastify'

const server = fastify()

server.get('/hello', () => {
  return 'world'
})

server.listen({ port: 3333 }).then(() => {
  console.log('Server listening on port 3333')
})
