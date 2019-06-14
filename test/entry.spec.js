const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const knex = require('knex');
const knexCleaner = require('knex-cleaner');
const helpers = require('./test-helpers');

describe('Entry', () => {
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

  beforeEach('insert users', () => {
    helpers.seedUsers(db, testUsers);
  });
  describe('POST /api/entry', () => {


    const entry = testEntries[0];

    it('returns 201 when user submits entry', () => {
      return supertest(app)
        .post('/api/entry')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send( entry )
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.text).to.eql(entry.text);
          expect(res.body.happiness).to.eql(entry.happiness);
          expect(res.body.face_url).to.eql(entry.face_url);
          expect(res.body.tone_joy).to.eql(entry.Joy);
          expect(res.body.tone_fear).to.eql(entry.Fear);
          expect(res.body.tone_sadness).to.eql(entry.Sadness);
          expect(res.body.tone_anger).to.eql(entry.Anger);
          expect(res.body.tone_analytical).to.eql(entry.Analytical);
          expect(res.body.tone_confident).to.eql(entry.Confident);
          expect(res.body.tone_tentative).to.eql(entry.Tentative);
          expect(res.body.face_anger).to.eql(entry.face_anger);
          expect(res.body.face_contempt).to.eql(entry.face_contempt);
          expect(res.body.face_disgust).to.eql(entry.face_disgust);
          expect(res.body.face_fear).to.eql(entry.face_fear);
          expect(res.body.face_happiness).to.eql(entry.face_happiness);
          expect(res.body.face_neutral).to.eql(entry.face_neutral);
          expect(res.body.face_sadness).to.eql(entry.face_sadness);
          expect(res.body.face_surprise).to.eql(entry.face_surprise);
          expect(res.body.user_id).to.eql(entry.user_id);
        })
        .expect(res => {
          db.from('entry')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.text).to.eql(entry.text);
              expect(row.happiness).to.eql(entry.happiness);
              expect(row.face_url).to.eql(entry.face_url);
              expect(row.tone_joy).to.eql(entry.Joy);
              expect(row.tone_fear).to.eql(entry.Fear);
              expect(row.tone_sadness).to.eql(entry.Sadness);
              expect(row.tone_anger).to.eql(entry.Anger);
              expect(row.tone_analytical).to.eql(entry.Analytical);
              expect(row.tone_confident).to.eql(entry.Confident);
              expect(row.tone_tentative).to.eql(entry.Tentative);
              expect(row.face_anger).to.eql(entry.face_anger);
              expect(row.face_contempt).to.eql(entry.face_contempt);
              expect(row.face_disgust).to.eql(entry.face_disgust);
              expect(row.face_fear).to.eql(entry.face_fear);
              expect(row.face_happiness).to.eql(entry.face_happiness);
              expect(row.face_neutral).to.eql(entry.face_neutral);
              expect(row.face_sadness).to.eql(entry.face_sadness);
              expect(row.face_surprise).to.eql(entry.face_surprise);
              expect(row.user_id).to.eql(entry.user_id);
            });
        });
    });
  });

  describe('GET /api/entry/list', () => {

    it ('returns 200 and an array when valid user & populated', () => {
      before('insert users', () => helpers.seedUsers(db, testUsers));
      return supertest(app)
        .get('/api/entry/list')
        .set('authorization', helpers.makeAuthHeader(testUser))
        .expect(200);
    });

    context('Given an XSS attack with an entry', () => {
      const { maliciousArticle, expectedArticle } = helpers.makeMaliciousArticle(testUser);
      console.log('EXPECTED ARTICLE: ', expectedArticle);

      const evilUser = {
        id: 666,
        name: 'Luke',
        password: 'What3489efhv',
        username: 'GakHacker'
      };

      beforeEach('seed malicious entry', () => {
        return helpers.seedMaliciousArticle(db, evilUser, maliciousArticle);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/entry/list')
          .set('Authorization', helpers.makeAuthHeader(evilUser))
          .expect(200)
          .expect(res => {
            console.log('RES: ', res.body);
            expect(res.body.text).to.eql(expectedArticle.text);
          });
      });
    });
  });
});