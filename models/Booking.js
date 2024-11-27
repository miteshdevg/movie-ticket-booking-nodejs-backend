const db = require('../config/db');
const { randomImageName } = require('../controllers/movieController');

// const createBookingTable = () => {
//   const sql = `
//     CREATE TABLE IF NOT EXISTS Bookings (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     user_id INT,
//     movie_id INT,
//     booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     qr_code VARCHAR(255) UNIQUE,  -- Unique QR code for each booking
//     watched BOOLEAN DEFAULT FALSE,  -- Status flag for watched
//     FOREIGN KEY (user_id) REFERENCES Users(id),
//     FOREIGN KEY (movie_id) REFERENCES Movies(id)
// );
//   `;
//   db.query(sql, (err) => {
//     if (err) throw err;
//     console.log("Booking table created or already exists.");
//   });
// };

const createBookingTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS Bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    movie_id INT,
    num_tickets INT DEFAULT 1,  -- Number of tickets booked
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qr_code VARCHAR(255) UNIQUE,  -- Unique QR code for each booking
    watched BOOLEAN DEFAULT FALSE,  -- Status flag for watched
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (movie_id) REFERENCES Movies(id)
);
  `;
  db.query(sql, (err) => {
    if (err) throw err;
    console.log("Booking table created or already exists.");
  });
};

// const bookTicket = (user_id, movie_id, callback) => {
//   const sql = "INSERT INTO bookings (user_id, movie_id) VALUES (?, ?)";
//   db.query(sql, [user_id, movie_id], callback);
// };

// const bookTicket = (user_id, movie_id, callback) => {
//   const qr_code = randomImageName()
//   // Start a transaction (ensure atomicity)
//   db.beginTransaction((err) => {
//     if (err) return callback(err);
//     // Check tickets available for the movie
//     const sqlCheckTickets = "SELECT tickets_available FROM movies WHERE id = ?";
//     db.query(sqlCheckTickets, [movie_id], (err, results) => {
//       if (err) {
//         return db.rollback(() => callback(err));
//       }
//       const availableTickets = results[0]?.tickets_available || 0;
//       if (availableTickets <= 0) {
//         return db.rollback(() => callback(new Error("No tickets available for this movie")));
//       }
//       // Decrease ticket count by 1
//       const sqlUpdateTickets = "UPDATE movies SET tickets_available = tickets_available - 1 WHERE id = ?";
//       db.query(sqlUpdateTickets, [movie_id], (err) => {
//         if (err) {
//           return db.rollback(() => callback(err));
//         }

//         // Insert booking record
//         const sqlInsertBooking = "INSERT INTO bookings (user_id, movie_id,qr_code) VALUES (?,?,?)";
//         db.query(sqlInsertBooking, [user_id, movie_id, qr_code], (err, results) => {
//           if (err) {
//             return db.rollback(() => callback(err));
//           }

//           // Commit transaction
//           db.commit((err) => {
//             if (err) {
//               return db.rollback(() => callback(err));
//             }
//             callback(null, results);
//           });
//         });
//       });
//     });
//   });
// };

const bookTicket = (user_id, movie_id, num_tickets, callback) => {
  const qr_code = randomImageName();
  // Start a transaction (ensure atomicity)
  db.beginTransaction((err) => {
    if (err) return callback(err);

    // Check tickets available for the movie
    const sqlCheckTickets = "SELECT tickets_available FROM movies WHERE id = ?";
    db.query(sqlCheckTickets, [movie_id], (err, results) => {
      if (err) {
        return db.rollback(() => callback(err));
      }
      const availableTickets = results[0]?.tickets_available || 0;
      if (availableTickets < num_tickets) {
        return db.rollback(() => callback(new Error("Not enough tickets available for this movie")));
      }

      // Decrease ticket count by num_tickets
      const sqlUpdateTickets = "UPDATE movies SET tickets_available = tickets_available - ? WHERE id = ?";
      db.query(sqlUpdateTickets, [num_tickets, movie_id], (err) => {
        if (err) {
          return db.rollback(() => callback(err));
        }

        // Insert booking record
        const sqlInsertBooking = "INSERT INTO bookings (user_id, movie_id, num_tickets, qr_code) VALUES (?, ?, ?, ?)";
        db.query(sqlInsertBooking, [user_id, movie_id, num_tickets, qr_code], (err, results) => {
          if (err) {
            return db.rollback(() => callback(err));
          }

          // Commit transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => callback(err));
            }
            callback(null, results);
          });
        });
      });
    });
  });
};

const markAsWatched = (qr_code, callback) => {
  const sql = "UPDATE bookings SET watched = TRUE WHERE qr_code = ?";
  db.query(sql, [qr_code], callback);
};

const getUserBookings = (user_id, callback) => {
  const sql = `
    SELECT movies.title, movies.description, bookings.booking_date, bookings.qr_code,movies.imageUrl,bookings.num_tickets,movies.release_date,bookings.watched
    FROM bookings 
    JOIN movies ON bookings.movie_id = movies.id 
    WHERE bookings.user_id = ?
  `;
  db.query(sql, [user_id], callback);
};

module.exports = { createBookingTable, bookTicket, getUserBookings, markAsWatched };
