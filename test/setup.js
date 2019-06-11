'use strict';

const { expect } = require('chai');
const supertest = require('supertest');

process.env.TZ = 'UCT';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRY = '3m';

require('dotenv').config();

process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL
  || 'postgresql://silas@localhost/moods-test';

global.expect = expect;
global.supertest = supertest;