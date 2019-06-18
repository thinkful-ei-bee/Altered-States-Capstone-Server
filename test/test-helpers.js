const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function cleanTables(db) {
  return db.transaction(trx => {
    trx.raw('TRUNCATE user, entry')
      .then(() => 
        Promise.all([
          trx.raw('ALTER SEQUENCE user_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE entry_id_seq minvalue 0 START WITH 1'),
          trx.raw('SELECT setval(\'user_id_seq\', 0)'),
          trx.raw('SELECT setval(\'entry_id_seq\', 0)'),
        ])
      );
  });
}

async function seedEntries(db, users, entries) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into('entry').insert(entries);

    await trx.raw(
      `SELECT setval('entry_id_seq', ?)`,
      [entries[entries.length - 1].id],
    );
  });
}


function makeUsersArray() {
  return [
    {
      id: 1,
      name: 'Testman',
      username: 'firstTester',
      password: 'Schkept1!ck'
    },

    {
      id: 2,
      name: 'Boiled',
      username: 'boild_skrmsher',
      password: 'Temp0rar7',
    },

    {
      id: 3,
      name: 'TumRick',
      username: 'hndi-tmrik',
      password: 'ex6sSS!!!',
    }
  ];
}

function makeEntriesArray() {
  return [
    {
      id: 1,
      text: 'Hi, this is great.',
      happiness: 40,
      face_url: 'www.images.com/hi',
      tone_joy: 3,
      tone_fear: 0,
      tone_sadness: 10,
      tone_anger: 0,
      tone_analytical: 40,
      tone_confident: 0,
      tone_tentative: 0,
      face_anger: 45,
      face_contempt: 12,
      face_disgust: 0,
      face_fear: 30,
      face_happiness: 0,
      face_neutral: 0,
      face_sadness: 0,
      face_surprise: 0,
      user_id: 1
    },

    {
      id: 2,
      text: 'Wow, amazing.',
      happiness: 20,
      face_url: 'www.images.com/alright',
      tone_joy: 33,
      tone_fear: 0,
      tone_sadness: 0,
      tone_anger: 0,
      tone_analytical: 40,
      tone_confident: 0,
      tone_tentative: 0,
      face_anger: 0,
      face_contempt: 0,
      face_disgust: 0,
      face_fear: 0,
      face_happiness: 44,
      face_neutral: 20,
      face_sadness: 0,
      face_surprise: 0,
      user_id: 3
    },

    {
      id: 3,
      text: 'This is the third entry',
      happiness: 50,
      face_url: 'www.images.com/third',
      tone_joy: 0,
      tone_fear: 0,
      tone_sadness: 30,
      tone_anger: 0,
      tone_analytical: 0,
      tone_confident: 34,
      tone_tentative: 0,
      face_anger: 0,
      face_contempt: 12,
      face_disgust: 0,
      face_fear: 50,
      face_happiness: 0,
      face_neutral: 0,
      face_sadness: 0,
      face_surprise: 0,
      user_id: 2
    }
  ];
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));

  return db.into('user')
    .insert(preppedUsers)
    .then(() => 
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('user_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function makeAuthHeader(user, secret=process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });

  return `Bearer ${token}`;
}

function makeMaliciousArticle(user) {
  const maliciousArticle = {
    id: 911,
    date_created: new Date(),
    user_id: user.id,
    text: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedArticle = {
    ...makeExpectedEntry([user], maliciousArticle),
    text: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousArticle,
    expectedArticle,
  }
}

function seedMaliciousArticle(db, user, entry) {
  return db
    .into('user')
    .insert([user])
    .then(() =>
      db
        .into('entry')
        .insert([entry])
    )
    .catch(e => console.log('ERROR: ', e))
}

function makeExpectedEntry(userTable, entry) {
  const user = userTable.find(author => author.id === entry.user_id);

  return {
    id: entry.id,
    date_created: entry.date_created.toISOString(),
    text: entry.text,
    happiness: entry.happiness,
    face_url: entry.face_url,
    tone_joy: entry.tone_joy,
    tone_fear: entry.tone_fear,
    tone_sadness: entry.tone_sadness,
    tone_anger: entry.tone_anger,
    tone_analytical: entry.tone_analytical,
    tone_confident: entry.tone_confident,
    tone_tentative: entry.tone_tentative,
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



module.exports = {
  cleanTables,
  makeUsersArray,
  makeEntriesArray,
  seedUsers,
  seedMaliciousArticle,
  seedEntries,
  makeAuthHeader,
  makeMaliciousArticle,
  makeExpectedEntry,
};