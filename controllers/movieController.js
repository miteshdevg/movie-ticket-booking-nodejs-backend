const Movie = require('../models/Movie');
const crypto = require("crypto")

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
    },
    region: process.env.AWS_REGION,
})




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


// const editMovie = async (req, res) => {
//     const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = await import("@aws-sdk/client-s3");
//     const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

//     const movieId = req.params.id;
//     const { title, description, release_date, tickets: tickets_available, duration } = req.body;


//     console.log(
//         "\n title---->>", title, "\n description---->>", description, "\n release_date---->>", release_date, "\n tickets_available---->>", tickets_available, "\n duration---->>", duration
//     );

//     if (!title || !description || !release_date || !tickets_available || !duration) {
//         return res.status(400).json({ error: 'All fields are required, except for the image.' });
//     }

//     try {
//         // Fetch the current movie details
//         Movie.getMovieById(movieId, async (err, movie) => {
//             if (err) {
//                 if (err.message === "Movie not found") {
//                     return res.status(404).json({ error: "Movie not found" });
//                 }
//                 console.error("Error fetching movie:", err);
//                 return res.status(500).json({ error: "Error fetching movie." });
//             }

//             let imageUrl = movie.imageUrl; // Default to the existing image URL

//             // If a new image file is provided, upload it to S3
//             if (req.file) {
//                 const newImageKey = randomImageName();
//                 const uploadParams = {
//                     Bucket: process.env.AWS_BUCKET_NAME,
//                     Key: newImageKey,
//                     Body: req.file.buffer,
//                     ContentType: req.file.mimetype,
//                 };

//                 const uploadCommand = new PutObjectCommand(uploadParams);
//                 await s3.send(uploadCommand);

//                 // Delete the old image from S3 if it exists
//                 if (movie.imageUrl) {
//                     const deleteParams = {
//                         Bucket: process.env.AWS_BUCKET_NAME,
//                         Key: movie.imageUrl,
//                     };

//                     const deleteCommand = new DeleteObjectCommand(deleteParams);
//                     await s3.send(deleteCommand);
//                 }

//                 // Update the image URL to the new one
//                 imageUrl = newImageKey;
//             }

//             // Update the movie in the database
//             Movie.updateMovie(
//                 movieId,
//                 title,
//                 description,
//                 release_date,
//                 tickets_available,
//                 duration,
//                 imageUrl,
//                 async (err) => {
//                     if (err) {
//                         console.error("Error updating movie:", err);
//                         return res.status(500).json({ error: "Error updating movie." });
//                     }

//                     // Generate a signed URL for the new or existing image
//                     const getObjectParams = {
//                         Bucket: process.env.AWS_BUCKET_NAME,
//                         Key: imageUrl,
//                     };

//                     const command = new GetObjectCommand(getObjectParams);
//                     const signedUrl = await getSignedUrl(new S3Client(), command, { expiresIn: 600 * 10 });

//                     // Respond with the updated movie details
//                     res.status(200).json({
//                         id: movieId,
//                         title,
//                         description,
//                         release_date,
//                         tickets_available,
//                         duration,
//                         imageUrl: signedUrl,
//                     });
//                 }
//             );
//         });
//     } catch (err) {
//         console.error("Error updating movie:", err);
//         res.status(500).json({ error: "Error updating movie." });
//     }
// };
const editMovie = async (req, res) => {
    const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const movieId = req.params.id;
    const { title, description, release_date, tickets: tickets_available, duration } = req.body;

    if (!title || !description || !release_date || !tickets_available || !duration) {
        return res.status(400).json({ error: 'All fields are required, except for the image.' });
    }

    try {
        // Fetch the current movie details
        Movie.getMovieById(movieId, async (err, movie) => {
            if (err) {
                if (err.message === "Movie not found") {
                    return res.status(404).json({ error: "Movie not found" });
                }
                console.error("Error fetching movie:", err);
                return res.status(500).json({ error: "Error fetching movie." });
            }

            let imageUrl = movie.imageUrl; // Default to the existing image URL

            // If a new image file is provided, upload it to S3
            if (req.file) {
                const s3 = new S3Client();
                const newImageKey = `movies/${Date.now()}-${req.file.originalname}`;
                const uploadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: newImageKey,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                };

                // Upload new image to S3
                await s3.send(new PutObjectCommand(uploadParams));

                // Delete the old image from S3 if it exists
                if (movie.imageUrl) {
                    await s3.send(new DeleteObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: movie.imageUrl,
                    }));
                }

                imageUrl = newImageKey; // Update the image URL
            }

            // Update the movie in the database
            Movie.updateMovie(
                movieId,
                title,
                description,
                release_date,
                tickets_available,
                duration,
                imageUrl,
                async (err) => {
                    if (err) {
                        console.error("Error updating movie:", err);
                        return res.status(500).json({ error: "Error updating movie." });
                    }

                    // Generate signed URL for the updated image
                    const getObjectParams = { Bucket: process.env.AWS_BUCKET_NAME, Key: imageUrl };
                    const signedUrl = await getSignedUrl(new S3Client(), new GetObjectCommand(getObjectParams), {
                        expiresIn: 3600, // 1 hour
                    });

                    res.status(200).json({
                        id: movieId,
                        title,
                        description,
                        release_date,
                        tickets_available,
                        duration,
                        imageUrl: signedUrl,
                    });
                }
            );
        });
    } catch (err) {
        console.error("Error updating movie:", err);
        res.status(500).json({ error: "Error updating movie." });
    }
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
