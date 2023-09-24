const fastify = require('fastify')({
  logger: true
})

fastify.register(require('./post'))
fastify.register(require('./health'))

fastify.listen({ port: 3000,
host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})