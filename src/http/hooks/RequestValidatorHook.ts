import { preValidationHookHandler } from 'fastify';

export const superUserValidator: preValidationHookHandler = (request, reply, done) => {
  const superUser = request.headers['x-super-user'] as string;

  if (!superUser || superUser !== 'true') {
    reply.code(401).send('Not a super user');
  }

  done();
};

export const userValidator: preValidationHookHandler = (request, reply, done) => {
  const userId = request.headers['x-user-id'] as string;

  if (!userId || userId.length === 0) {
    reply.code(401).send('Missing user id');
  }

  done();
};

export const userCompanyValidator: preValidationHookHandler = (request, reply, done) => {
  const companyId = request.headers['x-user-company'] as string;

  if (!companyId || companyId.length === 0) {
    reply.code(401).send('Missing user company');
  }

  done();
};

export const userPermissionsValidator: preValidationHookHandler = (request, reply, done) => {
  const userPermissions = request.headers['x-user-permissions'] as string;

  if (!userPermissions || userPermissions.length === 0) {
    reply.code(401).send('Missing user permissions');
  }

  done();
};
