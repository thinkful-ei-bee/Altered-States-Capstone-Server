CREATE TABLE "entry" (
  "id" SERIAL PRIMARY KEY,
  "date_created" TIMESTAMP NOT NULL DEFAULT now(),
  "text" TEXT,
  "happiness" SMALLINT,
  "joy" SMALLINT,
  "fear" SMALLINT,
  "sadness" SMALLINT,
  "anger" SMALLINT,
  "analytical" SMALLINT,
  "confident" SMALLINT,
  "tentative" SMALLINT,
  "user_id" INTEGER REFERENCES "user"(id)
    ON DELETE CASCADE NOT NULL
);