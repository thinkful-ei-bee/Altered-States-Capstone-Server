const bcrypt = require('bcryptjs');
const xss  = require('xss');

const REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const AuthServices = {
  getById(db, id) {
    return db
      .select('*')
      .from('users')
      .where('users.id', id)
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
      return 'Password must contain an uppercase and lowercase letter, a number, and a character';
    }
    return null;
  },

  hasUserWithUsername(db, username) {
    return db('users')
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
      .into('users')
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
      date_created: new Date(user.date_created),
    };
  },
};

module.exports = AuthServices;