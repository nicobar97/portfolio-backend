import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest } from "fastify";
import { FastifyPluginAsync, FastifyPluginOptions } from "fastify/types/plugin";

const WelcomeController: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) => {
  fastify.get(
    "/",
    {
      preValidation: [],
    },
    async (request, reply) =>
      reply.code(201).send(`Hello from ip ${request.ip}`)
  );
};

export default fp(async (app, _opts) =>
  app.register(WelcomeController, {
    prefix: "/",
  })
);
