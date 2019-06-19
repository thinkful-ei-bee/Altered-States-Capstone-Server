'use strict';

const express = require('express');
const AuthServices = require('./auth-services');
const path = require('path');
const requireAuth = require('../middleware/jwt-auth');
const AuthRouter = express.Router();
const bodyParser = express.json();

// Register a new user
AuthRouter
  .route('/register')
  .post(bodyParser, (req, res, next) => {
    
    // Grab creds
    const { name, username, password } = req.body;
    const newUser = { name, username, password };

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
              name,
              username,
              password: hashedPassword,
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

AuthRouter
  .route('/login')
  .post(bodyParser, (req, res, next) => {
    
    // Grab user creds
    const { username, password } = req.body;
    const userCreds = { username, password };

    // Check if username and password are present
    for (const [key, value] of Object.entries(userCreds)) {
      if (!value) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        });
      }
    }

    AuthServices.getUserWithUsername(req.app.get('db'), userCreds.username)
      .then(dbUser => {

        if (!dbUser) {
          return res.status(400).json({
            error: 'Incorrect username or password'
          });
        }

        return AuthServices.comparePasswords(userCreds.password, dbUser.password)
          .then(match => {
            if (!match) {
              return res.status(400).json({ 
                error: 'Incorrect username or password' 
              });
            }

            const sub = dbUser.username;
            const payload = { user_id: dbUser.id, name: dbUser.name };

            res.send({
              authToken: AuthServices.createJwt(sub, payload),
            });
          });
      })
      .catch(err => {
        console.error('ERROR: ', err);
        next();
      });
  });

AuthRouter
  .route('/refresh')
  .post(requireAuth, (req, res) => {
    const sub = req.user.username;
    const payload = { user_id: req.user.id, name: req.user.name };

    if (req.user.username) {
      res.send({
        authToken: AuthServices.createJwt(sub, payload)
      });
    }
  });

module.exports = AuthRouter;