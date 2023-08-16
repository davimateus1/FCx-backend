import app from './app'
import './database'

app.listen({ port: 3030 }, () => {
  console.log('🚀 Server running at port 3030')
})
