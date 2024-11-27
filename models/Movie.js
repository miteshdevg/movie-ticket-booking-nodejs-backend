// const db = require('../config/db');

// const createMovieTable = () => {
//   const sql = `
//     CREATE TABLE IF NOT EXISTS Movies (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     title VARCHAR(255) NOT NULL,
//     description TEXT,
//     release_date DATE,
//     duration INT,  -- in minutes
//     created_by INT,  -- ID of the admin who added the movie
//     FOREIGN KEY (created_by) REFERENCES Users(id)
// );
// `;
//   // const sql = `
//   //   CREATE TABLE IF NOT EXISTS movies (
//   //     id INT AUTO_INCREMENT PRIMARY KEY,
//   //     title VARCHAR(255) NOT NULL,
//   //     description TEXT,
//   //     release_date DATE
//   //   )
//   // `;
//   db.query(sql, (err) => {
//     if (err) throw err;
//     console.log("Movie table created or already exists.");
//   });
// };

// const addMovie = (title, description, release_date, callback) => {
//   const sql = "INSERT INTO movies (title, description, release_date) VALUES (?, ?, ?)";
//   db.query(sql, [title, description, release_date], callback);
// };

// const getMovies = (callback) => {
//   const sql = "SELECT * FROM movies";
//   db.query(sql, callback);
// };

// module.exports = { createMovieTable, addMovie, getMovies };

const db = require('../config/db');

const createMovieTable = () => {
  const sql = `
        CREATE TABLE IF NOT EXISTS movies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            release_date DATE,
            duration INT,  -- in minutes
           tickets_available INT,
           imageUrl VARCHAR(255),  -- column to store the S3 image URL
            created_by INT,  -- ID of the admin who added the movie
            FOREIGN KEY (created_by) REFERENCES Users(id)
        )
    `;
  db.query(sql, (err) => {
    if (err) throw err;
    console.log("Movie table created or already exists.");
  });
};


const addMovie = (title, description, release_date, tickets_available, duration, imageUrl, created_by, callback) => {
  const insertSql = `
    INSERT INTO movies (title, description, release_date, tickets_available, duration, imageUrl, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertSql, [title, description, release_date, tickets_available, duration, imageUrl, created_by], (err, insertResult) => {
    if (err) return callback(err);

    // Get the inserted movie using the generated ID
    const selectSql = `SELECT * FROM movies WHERE id = ?`;
    db.query(selectSql, [insertResult.insertId], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]); // Return the inserted movie
    });
  });
};



const updateMovie = (id, title, description, release_date, tickets_available, imageUrl, callback) => {
  const sql = "UPDATE movies SET title = ?, description = ?, release_date = ?, tickets_available = ?, image_url = ? WHERE id = ?";
  db.query(sql, [title, description, release_date, tickets_available, imageUrl, id], callback);
};

const getMovies = (callback) => {
  const sql = "SELECT * FROM movies";
  db.query(sql, callback);
};

const deleteMovie = (id, callback) => {
  const sqlForget = "SELECT * FROM movies WHERE id = ?";
  const sqlDelete = "DELETE FROM movies WHERE id = ?";

  // First, retrieve the movie to be deleted
  db.query(sqlForget, [id], (err, result) => {
    if (err) {
      return callback(err); // Pass any error to callback
    }

    // If movie exists, proceed with the delete
    if (result.length > 0) {
      const deletedMovie = result[0]; // The movie to be deleted

      // Now, delete the movie from the database
      db.query(sqlDelete, [id], (deleteErr) => {
        if (deleteErr) {
          return callback(deleteErr); // Pass any error to callback
        }
        // Return the deleted movie as the result
        callback(null, deletedMovie);
      });
    } else {
      callback(new Error("Movie not found"));
    }
  });
};

const getMovieById = (id, callback) => {
  const sql = "SELECT * FROM movies WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(new Error("Movie not found"));
    callback(null, results[0]); // Return the movie object
  });
};


module.exports = { createMovieTable, addMovie, getMovies, updateMovie, deleteMovie, getMovieById };




// const addMovie = (title, description, release_date, tickets_available, imageUrl, created_by, callback) => {
//   console.log("inside movie models-->>", imageUrl);

//   const sql = "INSERT INTO movies (title, description, release_date, tickets_available, imageUrl, created_by) VALUES (?, ?, ?, ?, ?, ?)";
//   db.query(sql, [title, description, release_date, tickets_available, imageUrl, created_by], callback);
// };
// const addMovie = (title, description, release_date, tickets_available, duration, imageUrl, created_by, callback) => {
//   const sql = `
//     INSERT INTO movies (title, description, release_date, tickets_available, duration, imageUrl, created_by)
//     VALUES (?, ?, ?, ?, ?, ?, ?)
//   `;
//   db.query(sql, [title, description, release_date, tickets_available, duration, imageUrl, created_by], callback);
// };

// // const addMovie = (title, description, release_date, callback) => {
// //   const sql = "INSERT INTO movies (title, description, release_date) VALUES (?, ?, ?)";
// //   db.query(sql, [title, description, release_date], callback);
// // };
// const addMovie = (title, description, release_date, tickets_available, callback) => {
//   const sql = "INSERT INTO movies (title, description, release_date, tickets_available) VALUES (?, ?, ?, ?)";
//   db.query(sql, [title, description, release_date, tickets_available], callback);
// };


// const getMovies = (callback) => {
//   const sql = "SELECT * FROM movies";
//   db.query(sql, callback);
// };

// const updateMovie = (id, title, description, release_date, callback) => {
//   const sql = "UPDATE movies SET title = ?, description = ?, release_date = ? WHERE id = ?";
//   db.query(sql, [title, description, release_date, id], callback);
// };

// const deleteMovie = (id, callback) => {
//   const sql = "DELETE FROM movies WHERE id = ?";
//   db.query(sql, [id], callback);
// };