const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const knex = require('knex');
const knexCleaner = require('knex-cleaner');
const helpers = require('./test-helpers');

describe('Auth', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  before('create knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  beforeEach('seed users', () => {
    helpers.seedUsers(db, testUsers);
  });

  before('cleanup', () => knexCleaner.clean(db));
  afterEach('cleanup', () => knexCleaner.clean(db));

  after('disconnect from db', () => db.destroy());

  describe('POST /api/auth/login', () => {
    const requiredFields = ['username', 'password'];

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        username: testUser.username,
        password: testUser.password,
      };

      it(`responds 400 when ${field} is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, { error: `Missing ${field} in request body` });
      });
    });

    it('responds 200 and jwt when valid username and password', () => {
      const userValidCreds = {
        username: testUser.username,
        password: testUser.password,
      };

      const expectedToken = jwt.sign(
        {user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.username,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256'
        },
      );

      return supertest(app)
        .post('/api/auth/login')
        .send(userValidCreds)
        .expect(200, { authToken: expectedToken });
    });
  });
});