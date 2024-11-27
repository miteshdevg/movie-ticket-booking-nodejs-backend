// const db = require('../config/db');

// const createUserTable = () => {
//   const sql = `
//       CREATE TABLE IF NOT EXISTS Users (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             username VARCHAR(255) NOT NULL UNIQUE,
//             email VARCHAR(255) NOT NULL UNIQUE,
//             password VARCHAR(255) NOT NULL,
//             role ENUM('user', 'admin') DEFAULT 'user'
//         ); `;
//   // const sql = `
//   //   CREATE TABLE IF NOT EXISTS users (
//   //     id INT AUTO_INCREMENT PRIMARY KEY,
//   //     username VARCHAR(255) NOT NULL,
//   //     password VARCHAR(255) NOT NULL,
//   //     role ENUM('user', 'admin') DEFAULT 'user'
//   //   )
//   // `;
//   db.query(sql, (err) => {
//     if (err) throw err;
//     console.log("User table created or already exists.");
//   });
// };

// const insertUser = (username, password, role = 'user', callback) => {
//   const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
//   db.query(sql, [username, password, role], callback);
// };

// const findUserByUsername = (username, callback) => {
//   const sql = "SELECT * FROM users WHERE username = ?";
//   db.query(sql, [username], callback);
// };

// module.exports = { createUserTable, insertUser, findUserByUsername };


const db = require('../config/db');

// Function to create the Users table
const createUserTable = () => {
  const sql = `
      CREATE TABLE IF NOT EXISTS Users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('user', 'admin') DEFAULT 'user'
        );`;

  db.query(sql, (err) => {
    if (err) {
      console.error("Error creating Users table:", err);
      throw err; // Consider handling the error gracefully in production
    }
    console.log("User table created or already exists.");
  });
};

// Function to insert a user into the Users table
const insertUser = (username, email, password, role = 'user', callback) => {
  const sql = "INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [username, email, password, role], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      return callback(err);
    }
    callback(null, result);
  });
};

// Function to find a user by username
const findUserByUsername = (username, callback) => {
  const sql = "SELECT * FROM Users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Error finding user by username:", err);
      return callback(err);
    }
    callback(null, results);
  });
};

module.exports = { createUserTable, insertUser, findUserByUsername };
