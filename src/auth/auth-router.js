const express = require('express');
const AuthServices = require('./auth-services');
const path = require('path');
const AuthRouter = express.Router();
const bodyParser = express.json();

// Register a new user
AuthRouter
  .route('/register')
  .post(bodyParser, (res, req, next) => {
    
    // Grab creds
    const { username, password } = req.body;
    const newUser = { username, password };

    // Check for username and password
    for (const [key, value] of Object.entries(newUser)) {
      if (!value) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        });
      }
    }

    // Check if password is valid
    const passwordError = AuthServices.validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check if username is already taken
    AuthServices.hasUserWithUsername(req.app.get('db'), username)
      .then(userExists => {
        if (userExists) {
          return res.status(400).json({ error: 'Username already exists' });  
        }

        // If valid username, encrypt password
        return AuthServices.hashPassword(password)
          .then(hashedPassword => {
            // create a new user obj with encypted password
            const newUser = {
              username,
              password: hashedPassword,
              date_created: 'now()',
            };

            // Insert new user into db
            AuthServices.insertUser(req.app.get('db'), newUser)
              .then(user => {
                res.status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(AuthServices.serializeUser(user));
              });
          });
      })
      .catch(next);
  });

module.exports = AuthRouter;