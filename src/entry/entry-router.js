const express = require('express');
const requireAuth = require('../middleware/jwt-auth');
const EntryServices = require('./entry-services');
const path = require('path');
const EntryRouter = express.Router();
const bodyParser = express.json();

EntryRouter
  .route('/')
  .post(requireAuth, bodyParser, (req, res, next) => {
    const { 
      text,
      anger,
      fear,
      joy,
      sadness,
      analytical,
      confident,
      tenative,
    } = req.body;

    const newEntry = { 
      text,
      anger,
      fear,
      joy,
      sadness,
      analytical,
      confident,
      tenative,
    };

    for (const [key, value] of Object.entries(newEntry)) {
      if (!value) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        });
      }
    }

    newEntry.user_id = req.user.id;

    EntryServices.insertEntry(req.app.get('db'), newEntry)
      .then(entry => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${entry.id}`))
          .json(entry);
      })
      .catch(next);
  });

module.exports = EntryRouter;