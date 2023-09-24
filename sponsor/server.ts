import fastifyCors from "fastify-cors";

const fastify = require('fastify')({
  logger: true
})

fastify.register(require('./post'))
fastify.register(require('./health'))
fastify.register(fastifyCors, {
  "origin": "*",
  "credentials": "true",
  "preflightContinue": true,
  "optionsSuccessStatus": 201,
  "allowedHeaders": "Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range",
  "methods": "GET,POST,OPTIONS,PUT,DELETE,PATCH"
  });
fastify.addHook('onSend', (request, reply, payload, next) => {
    reply.header("Access-Control-Allow-Origin", "");
    reply.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Cache-Control");
    next()
    });

fastify.listen({ port: 3000,
host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})