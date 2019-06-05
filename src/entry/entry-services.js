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
  }
};

module.exports = EntryServices;