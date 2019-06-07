CREATE TABLE "entry" (
  "id" SERIAL PRIMARY KEY,
  "date_created" TIMESTAMP NOT NULL DEFAULT now(),
  "text" TEXT,
  "happiness" SMALLINT,
  "face_url" TEXT,
  "tone_joy" SMALLINT,
  "tone_fear" SMALLINT,
  "tone_sadness" SMALLINT,
  "tone_anger" SMALLINT,
  "tone_analytical" SMALLINT,
  "tone_confident" SMALLINT,
  "tone_tentative" SMALLINT,
  "face_anger" SMALLINT,
  "face_contempt" SMALLINT,
  "face_disgust" SMALLINT,
  "face_fear" SMALLINT,
  "face_happiness" SMALLINT,
  "face_neutral" SMALLINT,
  "face_sadness" SMALLINT,
  "face_surprise" SMALLINT,
  "user_id" INTEGER REFERENCES "user"(id)
    ON DELETE CASCADE NOT NULL
);