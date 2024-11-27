// config/db.js
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// db.connect((err) => {
//     if (err) throw err;
//     console.log('Connected to MySQL Database.');
// });



// const { Sequelize } = require('sequelize');
// // require('dotenv').config();

// const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
//     host: process.env.DB_HOST,
//     dialect: 'mysql', // Make sure to specify the correct dialect for MySQL
//     logging: false
// });

module.exports = db;

// module.exports = db;
