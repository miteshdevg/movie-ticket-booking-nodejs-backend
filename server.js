require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const app = express();
const db = require('./config/db'); // Database configuration and connection
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cors = require('cors');
app.use(cors());

app.use(express.json()); // Parse incoming JSON requests
const bodyParser = require('body-parser');
// app.use(bodyParser);
// app.use(express.json()); // Parse incoming JSON requests
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests
// app.use(bodyParser.json());
app.use(bodyParser.json()); // Parse application/json 
app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded
// Route Setup
app.use('api/auth', authRoutes);
app.use('api/movies', movieRoutes);
app.use('api/bookings', bookingRoutes);

// Import models for table creation
const User = require('./models/User');
const Movie = require('./models/Movie');
const Booking = require('./models/Booking');

// Function to initialize database tables
const initializeTables = async () => {
    try {
        await User.createUserTable();
        await Movie.createMovieTable();
        await Booking.createBookingTable();
        console.log("Tables initialized successfully.");
    } catch (error) {
        console.error("Error initializing tables:", error);
    }
};

// Connect to the database and initialize tables
// db.authenticate()
//     .then(() => {
//         console.log("Database connected...");
//         initializeTables();
//     })
//     .catch((err) => console.error("Database connection error:", err));
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
    initializeTables()
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
