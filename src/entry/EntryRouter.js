const express = require('express');
const requireAuth = require('../middleware/jwt-auth');
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


  });

module.exports = EntryRouter;