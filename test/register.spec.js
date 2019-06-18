const supertest = require('supertest');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const knex = require('knex');
const knexCleaner = require('knex-cleaner');
const app = require('../src/app');
const helpers = require('./test-helpers');

const testUsers = helpers.makeUsersArray();
const testUser = testUsers[0];

describe('Registeration', () => {
  let db;

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

  describe('POST /api/auth/register', () => {
    
    const requiredFields = [ 'username', 'password', 'name' ];

    // Test each response when [requiredField] is missing
    requiredFields.forEach(field => {
      const userRegBody = {
        username: 'testUsername',
        password: 'testPa$$w0rd',
        name: 'testName',
      };

      it(`responds 400 missing field when ${field} is missing`, () => {
        delete userRegBody[field];

        return supertest(app)
          .post('/api/auth/register')
          .send(userRegBody)
          .expect(400, { error: `Missing ${field} in request body` });
      });

    });

    it('responds 400 when password is under 6 characters', () => {
      const userShortPass = {
        username: 'tooShort',
        password: '12345',
        name: 'lazyPasswordArtist'
      };

      return supertest(app)
        .post('/api/auth/register')
        .send(userShortPass)
        .expect(400, { error: 'Password must be at least 6 characters' });
    });

    it('responds 400 when password is over 72 characters', () => {
      const userLongPassword = {
        username: 'Dr.Unhackable',
        password: '*'.repeat(73),
        name: 'Ben',
      };

      return supertest(app)
        .post('/api/auth/register')
        .send(userLongPassword)
        .expect(400, { error: 'Password cannot be longer than 72 characters' });
    });

    it('responds 400 when password starts with a space', () => {
      const userSpacePass = {
        username: 'UncleDetja',
        password: ' j$$ !pitabre4d',
        name: 'EdEdEd'
      };

      return supertest(app)
        .post('/api/auth/register')
        .send(userSpacePass)
        .expect(400, { error: 'Password must not begin or end with spaces' });
    });

    it('responds 400 when password ends with a space', () => {
      const userSpaceEnd = {
        username: 'ThinkingPerson',
        password: 'Wi$em4n ',
        name: 'Penny'
      };

      return supertest(app)
        .post('/api/auth/register')
        .send(userSpaceEnd)
        .expect(400, { error: 'Password must not begin or end with spaces' });
    });

    it('responds 400 when password is not complex enough', () => {
      const userBasicPass = {
        username: 'PeteSpeet',
        password: 'Ayyyyyyyyaaahhh',
        name: 'GimmeDat',
      };

      return supertest(app)
        .post('/api/auth/register')
        .send(userBasicPass)
        .expect(400, { 
          error: 'Password must contain an uppercase and lowercase letter, a number, and a special character' 
        });
    });

    it('responds 400 when username is not unique', () => {
      const unoriginalUser = {
        username: testUser.username,
        password: 'Pa$$w0rd!',
        name: 'Vivian',
      };

      return supertest(app)
        .post('/api/auth/register')
        .send(unoriginalUser)
        .expect(400, { error: 'Username already exists' });
    });

    // Happy
    it('responds 201, serialized user, stored encrypted password', () => {
      const newUser = {
        username: 'Goodman',
        password: 'Pa$$w0rd!',
        name: 'Yusef',
      };

      return supertest(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.username).to.eql(newUser.username);
          //expect(res.body.name).to.eql(newUser.name);
          expect(res.body).to.not.have.property('password');
          expect(res.headers.location).to.eql(`/api/auth/register/${res.body.id}`);
        })
        .expect(res => 
          db.from('user')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.username).to.eql(newUser.username);
              expect(row.name).to.eql(newUser.name);

              return bcrypt.compare(newUser.password, row.password);
            })
            .then(match => {
              expect(match).to.be.true;
            })
        );
    });
  });
});