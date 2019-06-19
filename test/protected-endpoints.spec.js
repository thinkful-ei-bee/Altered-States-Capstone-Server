const supertest = require('supertest');
const app = require('../src/app');
const knex = require('knex');
const knexCleaner = require('knex-cleaner');
const helpers = require('./test-helpers');

describe('Protected Endpoints', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testEntries = helpers.makeEntriesArray();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  before('cleanup', () => knexCleaner.clean(db));
  afterEach('cleanup', () => knexCleaner.clean(db));

  after('disconnect from db', () => db.destroy());

//   beforeEach('insert users', () => {
//     helpers.seedUsers(db, testUsers);
//   });

  beforeEach('insert articles', () => {
    helpers.seedEntries(db, testUsers, testEntries);
  });

  const protectedEndpoints = [
    {
      name: 'GET /api/entry/list',
      path: '/api/entry/list',
      method: supertest(app).get,
    },

    {
      name: 'GET /api/entry/id/:id',
      path: '/api/entry/id/1',
      method: supertest(app).get,
    },

    {
      name: 'POST /api/auth/refresh',
      path: '/api/auth/refresh',
      method: supertest(app).post,
    },
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it('responds 401 when no bearer token', () => {
        return endpoint.method(endpoint.path)
          .expect(401, { error: 'Missing bearer token' });
      });

      it('responds 401 unauthorized request when invalid JWT secret', () => {
        const validUser = testUser;
        const invalidSecret = 'bad-secret';

        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: 'Unauthorized request' });
      });

      it('responds 401 unauthorized request when invalid sub in payload', () => {
        const invalidUser = { username: 'iwasneverreallyhere', id: 1 };

        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized request' });
      });
    });
  });
});
