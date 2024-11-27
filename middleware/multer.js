const multer = require('multer');

const storage = multer.memoryStorage(); // Stores files as buffer
const upload = multer({ storage });

module.exports = upload;
