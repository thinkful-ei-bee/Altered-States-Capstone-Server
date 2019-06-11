'use strict';

const xss = require('xss');

const EntryServices = {

  getById(db, id) {
    return db('entry')
      .select('*')
      .where('entry.id', id)
      .first();
  },

  insertEntry(db, newEntry) {
    return db
      .insert(newEntry)
      .into('entry')
      .returning('*')
      .then(([ entry ]) => entry)
      .then(entry => EntryServices.getById(db, entry.id));
  },

  getAllByUserId(db, id) {
    return db('entry')
      .select('*')
      // .where('entry.user_id', id);
      .where('user_id', id);
  },

  serializeEntry(entry) {
    return {
      id: entry.id,
      date_created: entry.date_created,
      text: xss(entry.text),
      happiness: entry.happiness,
      face_url: entry.face_url,
      Joy: entry.Joy,
      Fear: entry.Fear,
      Sadness: entry.Sadness,
      Anger: entry.Anger,
      Analytical: entry.Analytical,
      Confident: entry.Confident,
      Tentative: entry.Tentative,
      face_anger: entry.face_anger,
      face_contempt: entry.face_contempt,
      face_disgust: entry.face_disgust,
      face_fear: entry.face_fear,
      face_happiness: entry.face_happiness,
      face_neutral: entry.face_neutral,
      face_sadness: entry.face_sadness,
      face_surprise: entry.face_surprise,
      user_id: entry.user_id
    };
  }
};

module.exports = EntryServices;