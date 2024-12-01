// const express = require('express');
// const { addMovie, listMovies } = require('../controllers/movieController');
// const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
// const router = express.Router();

// router.post('/add', authenticateToken, authorizeAdmin, addMovie);
// router.get('/', listMovies);

// module.exports = router;

// const express = require('express');
// const { addMovie, listMovies } = require('../controllers/movieController');
// const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
// const router = express.Router();

// router.post('/add', authenticateToken, authorizeAdmin, addMovie);
// router.get('/', listMovies);

// module.exports = router;



// const express = require('express');
// const { addMovie, listMovies, editMovie, deleteMovie } = require('../controllers/movieController');
// const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
// const router = express.Router();

// router.post('/add', authenticateToken, authorizeAdmin, addMovie);
// router.get('/', listMovies);
// router.put('/edit/:id', authenticateToken, authorizeAdmin, editMovie);  // Route for editing a movie
// router.delete('/delete/:id', authenticateToken, authorizeAdmin, deleteMovie);  // Route for deleting a movie

// module.exports = router;
// ======================
// const express = require('express');
// const { addMovie, listMovies, editMovie, deleteMovie } = require('../controllers/movieController');
// const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
// const multer = require('multer');
// const path = require('path');

// const router = express.Router();

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage });

// router.post('/add', authenticateToken, authorizeAdmin, upload.single('image'), addMovie);
// router.get('/', listMovies);
// router.put('/edit/:id', authenticateToken, authorizeAdmin, upload.single('image'), editMovie);
// router.delete('/delete/:id', authenticateToken, authorizeAdmin, deleteMovie);

// module.exports = router;


// const express = require('express');
// const { addMovie, listMovies, editMovie, deleteMovie } = require('../controllers/movieController');
// const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
// const multer = require('multer');
// const path = require('path');

// const router = express.Router();

// // Configure multer for handling image uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Temporary folder for image uploads
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage });

// // Route for adding a movie (requires authentication and admin authorization)
// router.post('/add', authenticateToken, authorizeAdmin, upload.single('image'), addMovie);

// // Route for listing all movies (public access)
// router.get('/', listMovies);

// // Route for editing a movie (requires authentication and admin authorization)
// router.put('/edit/:id', authenticateToken, authorizeAdmin, upload.single('image'), editMovie);

// // Route for deleting a movie (requires authentication and admin authorization)
// router.delete('/delete/:id', authenticateToken, authorizeAdmin, deleteMovie);

// module.exports = router;

const express = require('express');
const { addMovie, listMovies, editMovie, deleteMovie, getMovie } = require('../controllers/movieController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage(); // Stores files as buffer
const upload = multer({ storage });

router.post('/add', authenticateToken, authorizeAdmin, upload.single('image'), addMovie); // Add with image upload
router.get('/', listMovies);
router.put('/edit/:id', authenticateToken, authorizeAdmin, upload.single('image'), editMovie); // Edit with image upload
router.delete('/delete/:id', authenticateToken, authorizeAdmin, deleteMovie);
router.get('/:id', getMovie); // Route to fetch a single movie by ID

module.exports = router;

