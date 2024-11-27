const express = require('express');
const { bookTicket, viewBookings, markAsWatched } = require('../controllers/bookingController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/book', authenticateToken, bookTicket);
router.get('/cart', authenticateToken, viewBookings);
router.post('/scanner', authenticateToken, authorizeAdmin, markAsWatched);

module.exports = router;
