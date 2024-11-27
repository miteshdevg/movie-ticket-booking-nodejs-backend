// const Movie = require('../models/Movie');

// const addMovie = (req, res) => {
//     const { title, description, release_date } = req.body;
//     Movie.addMovie(title, description, release_date, (err) => {
//         if (err) return res.status(500).send("Error adding movie.");
//         res.status(201).send("Movie added successfully.");
//     });
// };

// const listMovies = (req, res) => {
//     Movie.getMovies((err, results) => {
//         if (err) return res.status(500).send("Error fetching movies.");
//         res.json(results);
//     });
// };

// module.exports = { addMovie, listMovies };

// const { s3Client } = require('../config/s3');
const Movie = require('../models/Movie');
const crypto = require("crypto")

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// const addMovie = (req, res) => {
//     console.log("hello world");

//     const { title, description, release_date, tickets_available } = req.body;
//     Movie.addMovie(title, description, release_date, tickets_available, (err) => {
//         if (err) {
//             console.log("while adding", err);
//             return res.status(500).send("Error adding movie.");
//         }
//         res.status(201).send("Movie added successfully.");
//     });
// };
// const { uploadFile, s3Client } = require('../config/s3'); // Import S3 upload logic
// const Movie = require('../models/movie'); // Your Movie model

// const { uploadFile } = require('../config/s3');
// const Movie = require('../models/movie');
// const { S3Client } = require("@aws-sdk/client-s3");


// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// const getSignedUrls

// const client = new S3Client(clientParams);
// const command = new GetObjectCommand(getObjectParams);
// const url = await getSignedUrl(client, command, { expiresIn: 3600 });

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
    },
    region: process.env.AWS_REGION,
})


// const addMovie = async (req, res) => {
//     try {
//         console.log("-->>>", req.body);
//         const created_by = req.user.id;  // Assuming you are storing the user ID in req.user from the JWT token
//         console.log("created_by-->>", created_by);

//         const { title, description, release_date, tickets: tickets_available } = req.body;
//         // Upload file to S3
//         console.log("req.file-->>", req.file);

//         const randomImageName = () => crypto.randomBytes(8).toString('hex')
//         // req.file.buffer
//         const imageUrl = randomImageName()
//         const params = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: imageUrl,
//             Body: req.file.buffer,
//             ContentType: req.file.mimetype,
//         }
//         const command = new PutObjectCommand(params)
//         await s3.send(command)

//         // const imageUrl = req.file ? await uploadFile(req.file) : null;
//         console.log("imageUrl---->>>", imageUrl);

//         // Save movie details in the database
//         await Movie.addMovie(title, description, release_date, tickets_available, imageUrl);

//         res.status(201).json({ message: 'Movie added successfully.' });
//     } catch (err) {
//         console.error('Error adding movie:', err);
//         res.status(500).json({ error: 'Error adding movie.' });
//     }
// };

// const addMovie = async (req, res) => {
//     try {
//         const { title, description, release_date, tickets: tickets_available, duration } = req.body;

//         // Check if all necessary fields are present
//         if (!title || !description || !release_date || !tickets_available || !duration || !req.file) {
//             return res.status(400).json({ error: 'All fields are required, including the movie image.' });
//         }

//         // Convert duration and tickets_available to numbers
//         const parsedDuration = Number(duration);
//         const parsedTicketsAvailable = Number(tickets_available);

//         if (isNaN(parsedDuration) || isNaN(parsedTicketsAvailable)) {
//             return res.status(400).json({ error: 'Duration and tickets must be numbers.' });
//         }

//         // Get the user ID from the authenticated token (assuming the user info is in req.user)
//         const created_by = req.user.id;

//         // Upload the image to cloud storage (e.g., S3)
//         const imageUrl = await uploadImageToS3(req.file);

//         // Save the movie to the database with the created_by field
//         await Movie.addMovie(title, description, release_date, parsedTicketsAvailable, parsedDuration, imageUrl, created_by, (err) => {
//             if (err) {
//                 console.error('Error adding movie:', err);
//                 return res.status(500).json({ error: 'Error adding movie.' });
//             }
//             res.status(201).json({ message: 'Movie added successfully.' });
//         });
//     } catch (err) {
//         console.error('Error adding movie:', err);
//         res.status(500).json({ error: 'Error adding movie.' });
//     }
// };

const randomImageName = () => crypto.randomBytes(8).toString('hex');

const addMovie = async (req, res) => {
    try {
        const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

        const { title, description, release_date, tickets: tickets_available, duration } = req.body;

        if (!title || !description || !release_date || !tickets_available || !duration || !req.file) {
            return res.status(400).json({ error: 'All fields are required, including the movie image.' });
        }

        const created_by = req.user.id; // Assuming you store the user ID in req.user

        const imageUrl = randomImageName();
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageUrl,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        console.log("imageUrl---->>>", imageUrl);
        const getObjectParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageUrl,
        };
        const commandforget = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(new S3Client(), commandforget, { expiresIn: 600 * 10 });

        // Save movie details in the database
        Movie.addMovie(
            title,
            description,
            release_date,
            tickets_available,
            duration,
            imageUrl,
            created_by,
            (err, createdMovie) => {
                if (err) {
                    console.error('Error saving movie to database:', err);
                    return res.status(500).json({ error: 'Error saving movie to database.' });
                }

                // Respond with the created movie object
                res.status(201).json({
                    ...createdMovie, imageUrl: url
                });
            }
        );
    } catch (err) {
        console.error('Error adding movie:', err);
        res.status(500).json({ error: 'Error adding movie.' });
    }
};
// const addMovie = async (req, res) => {
//     try {
//         const { title, description, release_date, tickets: tickets_available, duration } = req.body;

//         if (!title || !description || !release_date || !tickets_available || !duration || !req.file) {
//             return res.status(400).json({ error: 'All fields are required, including the movie image.' });
//         }
//         // Get the user ID from the session or JWT token
//         const created_by = req.user.id;  // Assuming you are storing the user ID in req.user from the JWT token

//         const randomImageName = () => crypto.randomBytes(8).toString('hex');
//         const imageUrl = randomImageName();
//         const params = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: imageUrl,
//             Body: req.file.buffer,
//             ContentType: req.file.mimetype,
//         };
//         const command = new PutObjectCommand(params);
//         await s3.send(command);

//         console.log("imageUrl---->>>", imageUrl);

//         // Save movie details in the database
//         await Movie.addMovie(title, description, release_date, tickets_available, duration, imageUrl, created_by);  // Pass created_by

//         res.status(201).json({ message: 'Movie added successfully.' });
//     } catch (err) {
//         console.error('Error adding movie:', err);
//         res.status(500).json({ error: 'Error adding movie.' });
//     }
// };

// const addMovie = async (req, res) => {
//     try {
//         const { title, description, release_date, tickets_available } = req.body;

//         // Upload file to S3 and get the file URL
//         const imageUrl = req.file ? await uploadFile(req.file) : null;

//         // Save movie data to the database
//         await Movie.addMovie(title, description, release_date, tickets_available, imageUrl);
//         res.status(201).send('Movie added successfully.');
//     } catch (err) {
//         console.error('Error adding movie:', err);
//         res.status(500).send('Error adding movie.');
//     }
// };


// const clientParams = { region: "us-east-1" }; // Update your region
// const client = new S3Client(clientParams);

// const getObjectParams = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: "your-object-key"
// };
// const command = new GetObjectCommand(getObjectParams);
// const url = await getSignedUrl(client, command, { expiresIn: 600 * 10 })
module.exports = { addMovie };
const listMovies = async (req, res) => {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    try {
        // Assuming Movie.getMovies uses a callback, you can promisify it
        const results = await new Promise((resolve, reject) => {
            Movie.getMovies((err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!results || results.length === 0) {
            return res.status(404).send("No movies found.");
        }

        // Ensure you wait for all async operations to complete
        const imagePromises = results.map(async (i) => {
            const getObjectParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: i.imageUrl,
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(new S3Client(), command, { expiresIn: 600 * 10 });
            return { ...i, imageUrl: url }; // Return the updated movie object
        });

        // Wait for all promises to resolve
        const imageresults = await Promise.all(imagePromises);

        // Send the final response with updated movies
        res.json(imageresults);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching movies.");
    }
};

const editMovie = (req, res) => {
    const movieId = req.params.id;
    const { title, description, release_date } = req.body;
    Movie.updateMovie(movieId, title, description, release_date, (err) => {
        if (err) return res.status(500).send("Error updating movie.");
        res.status(200).send("Movie updated successfully.");
    });
};

const getMovie = async (req, res) => {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    try {
        const movieId = req.params.id;

        // Fetch movie details from the database
        Movie.getMovieById(movieId, async (err, movie) => {
            if (err) {
                if (err.message === "Movie not found") {
                    return res.status(404).json({ error: "Movie not found" });
                }
                console.error("Error fetching movie:", err);
                return res.status(500).json({ error: "Error fetching movie." });
            }

            // Generate signed URL for the image
            if (movie.imageUrl) {
                const getObjectParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: movie.imageUrl,
                };
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(new S3Client(), command, { expiresIn: 600 * 10 });
                movie.imageUrl = url; // Update the movie object with the signed URL
            }

            // Respond with the movie details
            res.json(movie);
        });
    } catch (err) {
        console.error("Error fetching movie:", err);
        res.status(500).json({ error: "Error fetching movie." });
    }
};

const deleteMovie = (req, res) => {
    const movieId = req.params.id;
    Movie.deleteMovie(movieId, async (err, results) => {
        if (err) return res.status(500).send("Error deleting movie.");
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: results.imageUrl,
        };
        const command = new DeleteObjectCommand(params)
        await s3.send(command)
        res.status(200).send("Movie Deleted successfully");
    });
};

module.exports = { addMovie, listMovies, editMovie, deleteMovie, getMovie, randomImageName };
