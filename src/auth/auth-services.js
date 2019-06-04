/* eslint-disable no-useless-escape */
'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xss  = require('xss');
const config = require('../config');

const REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const AuthServices = {
  getById(db, id) {
    return db
      .select('*')
      .from('user')
      .where('user.id', id)
      .first();
  },

  validatePassword(password) {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (password.length > 72) {
      return 'Password cannot be longer than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not begin or end with spaces';
    }
    if (!REGEX.test(password)) {
      return 'Password must contain an uppercase and lowercase letter, a number, and a special character';
    }
    return null;
  },

  hasUserWithUsername(db, username) {
    return db('user')
      .where({ username })
      .first()
      .then(user => !!user);
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('user')
      .returning('*')
      .then(([user]) => user)
      .then(user => {
        return AuthServices.getById(db, user.id);
      });
  },

  serializeUser(user) {
    return {
      id: user.id,
      username: xss(user.username),
    };
  },

  getUserWithUsername(db, username) {
    return db('user')
      .where({ username })
      .first();
  },

  comparePasswords(loginPassword, hash) {
    return bcrypt.compare(loginPassword, hash);
  },

  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: 'HS256'
    });
  },

  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  },

  parseBasicToken(token) {
    return Buffer.from(token, 'base64')
      .toString()
      .split(':');
  }
};

module.exports = AuthServices;