'use strict';

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
  DATABASE_URL: process.env.DATABASE_URL, 
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,

  FACE_KEY: process.env.FACE_KEY,
  FACE_SECRET: process.env.FACE_SECRET,

  AZURE_KEY: process.env.AZURE_KEY
};