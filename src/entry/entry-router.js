'use strict';

const express = require('express');
const requireAuth = require('../middleware/jwt-auth');
const EntryServices = require('./entry-services');
const path = require('path');
const EntryRouter = express.Router();
const jsonBodyParser = express.json();

EntryRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { 
      text,
      happiness,
      face_url,
      Anger,
      Joy,
      Fear,
      Sadness,
      Analytical,
      Confident,
      Tentative,
      face_anger,
      face_contempt,
      face_disgust,
      face_fear,
      face_happiness,
      face_neutral,
      face_sadness,
      face_surprise
    } = req.body;

    const newEntry = { 
      text,
      happiness,
      face_url,
      tone_anger: Anger,
      tone_joy: Joy,
      tone_fear: Fear,
      tone_sadness: Sadness,
      tone_analytical: Analytical,
      tone_confident: Confident,
      tone_tentative: Tentative,
      face_anger,
      face_contempt,
      face_disgust,
      face_fear,
      face_happiness,
      face_neutral,
      face_sadness,
      face_surprise
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
  .route('/id/:id')
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

        console.log('ENTRIES: ', entries);

        return res.status(200).json(entries.map(EntryServices.serializeEntry));
      })
      .catch(next);
  });

module.exports = EntryRouter;