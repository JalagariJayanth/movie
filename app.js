const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbpath = path.join(__dirname, "moviesData.db");

let db = null;

const initializedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost/3000/");
    });
  } catch (e) {
    console.log(`DB error :${e.message}`);
    process.exit(1);
  }
};
initializedbandserver();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getmoviesname = `SELECT movie_name FROM movie`;
  const moviesarray = await db.all(getmoviesname);
  response.send(
    moviesarray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const addmovie = `
  INSERT INTO 
         movie (director_id,movie_name,lead_actor)
    VALUES (
          ${directorId},
         '${movieName}',
         '${leadActor}')`;
  await db.run(addmovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovie = `
    SELECT *
    FROM 
       movie
    WHERE movie_id = ${movieId}`;
  const requiremovie = await db.all(getmovie);
  response.send(convertDbObjectToResponseObject(requiremovie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const updatedetails = `
    UPDATE movie 
    SET director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    where movie_id = ${movieId}`;
  await db.run(updatedetails);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletemovie = `
    DELETE FROM movie
    WHERE movie_id = ${movieId}`;
  await db.run(deletemovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directors = `SELECT * FROM director`;
  const directorsarray = await db.all(directors);
  response.send(
    directorsarray.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getmoviename = `
    SELECT movie_name FROM movie
    WHERE director_id = ${directorId}`;
  const moviearray = await db.all(getmoviename);
  response.send(
    moviearray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
