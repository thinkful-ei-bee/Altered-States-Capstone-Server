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
      happiness,
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
      happiness,
      anger,
      fear,
      joy,
      sadness,
      analytical,
      confident,
      tenative,
    };

    
    // This is commented out because none of these
    // properties are actually required

    // for (const [key, value] of Object.entries(newEntry)) {
    //   if (!value) {
    //     return res.status(400).json({
    //       error: `Missing ${key} in request body`
    //     });
    //   }
    // }

    newEntry.user_id = req.user.id;

    EntryServices.insertEntry(req.app.get('db'), newEntry)
      .then(entry => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${entry.id}`))
          .json(entry);
      })
      .catch(next);
  });

EntryRouter
  .route('/:id')
  .get(requireAuth, (req, res, next) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'Missing id in request' });
    }

    EntryServices.getById(req.app.get('db'), id)
      .then(entry => {
        res.status(200).json(entry);
      })
      .catch(next);
  });

EntryRouter
  .route('/list')
  .get(requireAuth, (req, res, next) => {
    const id = req.user.id;

    if (!id) {
      return res.status(400).json({ error: 'Missing id in request' });
    }

    EntryServices.getAllByUserId(req.app.get('db'), id)
      .then(entries => {
        if (!entries) {
          return res.status(200).json();
        }

        return res.status(200).json(entries);
      })
      .catch(next);
  });

module.exports = EntryRouter;