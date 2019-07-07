'use strict';

const express = require('express');
const requireAuth = require('../middleware/jwt-auth');
const EntryServices = require('./entry-services');
const path = require('path');
const EntryRouter = express.Router();
const jsonBodyParser = express.json();
const axios = require('axios');
const config = require('../config');

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
        res.status(200).json(EntryServices.serializeEntry(entry));
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

        return res.status(200).json(entries.map(EntryServices.serializeEntry));
      })
      .catch(next);
  });

EntryRouter
  .route('/:id')
  .delete(requireAuth, (req, res,next) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'Missing id in request' });
    }

    if (typeof id !== 'number') {
      return res.status(400).json({ error: 'Request id must be a number' });
    }

    EntryServices.deleteEntry(req.app.get('db'), id)
      .then(entryId => {
        res.status(200).json(entryId);
      })
      .catch(next);
  });

EntryRouter
  .route('/selfie/:id')
  .delete(requireAuth, (req, res, next) => {
    const id = req.params.id;

    axios.delete(`https://${config.FACE_KEY}:${config.FACE_SECRET}@api.cloudinary.com/v1_1/mood-flux/resources/image/upload?public_ids=selfies/${id}`)
      .then((response) => {
        return res.status(200).json(response.data);
      })
      .catch(next);
  });


EntryRouter
  .route('/face')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {

    axios.post('https://centralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=emotion', {
      url: req.body.selfie_url
    },
    {
      headers: {
        'content-type': 'application/json',
        'Ocp-Apim-Subscription-Key': `${config.AZURE_KEY}`
      }
    })
      .then((response) => {
        return res.status(200).json(response.data);
      })
      .catch(next);
  });

module.exports = EntryRouter;