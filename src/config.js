'use strict';

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  DATABASE_URL: process.env.DATABASE_URL, 
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL
};