const Booking = require('../models/Booking');

// const bookTicket = (req, res) => {
//     const { movie_id } = req.body;
//     Booking.bookTicket(req.user.id, movie_id, (err) => {
//         if (err) return res.status(500).send("Error booking ticket.");
//         res.status(201).send("Ticket booked successfully.");
//     });
// };
const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ region: 'us-east-1' });

const bookTicket = async (req, res) => {
    const { movie_id, num_tickets } = req.body;

    // Validate the number of tickets
    if (!num_tickets || num_tickets < 1) {
        return res.status(400).send("Invalid number of tickets.");
    }

    // Create the booking request payload
    const bookingRequest = {
        user_id: req.user.id,
        movie_id,
        num_tickets,
    };

    const params = {
        QueueUrl: process.env.SQS_QUEUE_URL, // Your SQS queue URL
        MessageBody: JSON.stringify(bookingRequest), // The message payload
    };

    try {
        // Send the message to SQS
        const result = await sqs.sendMessage(params).promise();
        console.log("Message sent to SQS successfully:", result);
        res.status(200).send("Booking request submitted successfully.");
    } catch (err) {
        console.error("Error sending message to SQS:", err);
        res.status(500).send("Failed to submit booking request.");
    }
};

// const bookTicket = (req, res) => {
//     const { movie_id, num_tickets } = req.body;

//     // Ensure num_tickets is provided and is a valid number
//     if (!num_tickets || num_tickets < 1) {
//         return res.status(400).send("Invalid number of tickets.");
//     }

//     Booking.bookTicket(req.user.id, movie_id, num_tickets, (err) => {
//         if (err) return res.status(500).send("Error booking ticket: " + err.message);
//         res.status(201).send("Ticket(s) booked successfully.");
//     });
// };

// const bookTicket = (req, res) => {
//     const { movie_id } = req.body;
//     Booking.bookTicket(req.user.id, movie_id, (err) => {
//         if (err) return res.status(500).send("Error booking ticket: " + err.message);
//         res.status(201).send("Ticket booked successfully.");
//     });
// };

// const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
// const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

const markAsWatched = (req, res) => {
    const { qr_code } = req.body;

    // Validate the qr_code
    if (!qr_code) {
        return res.status(400).send("QR code is required.");
    }

    // Use the Booking model to update the booking
    Booking.markAsWatched(qr_code, (err, results) => {
        if (err) {
            console.error("Error updating watched status:", err);
            return res.status(500).send("Error updating watched status.");
        }

        // Check if a row was updated
        if (results.affectedRows === 0) {
            return res.status(404).send("Booking not found or already marked as watched.");
        }

        // Success response
        res.status(200).send("Booking marked as watched successfully.");
    });
};

const viewBookings = async (req, res) => {

    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    try {
        // Fetch user bookings
        Booking.getUserBookings(req.user.id, async (err, results) => {
            if (err) return res.status(500).send("Error fetching bookings.");

            // Check if bookings are returned
            if (!results || results.length === 0) {
                return res.status(404).send("No bookings found.");
            }

            // Now fetch the signed URL for each booking's image
            const imagePromises = results.map(async (booking) => {
                if (booking.imageUrl) {
                    const getObjectParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: booking.imageUrl,
                    };
                    const command = new GetObjectCommand(getObjectParams);
                    const url = await getSignedUrl(new S3Client(), command, { expiresIn: 600 * 10 });
                    return { ...booking, imageUrl: url }; // Add the signed URL to the booking object
                }
                return booking; // If no imageUrl, return the booking object as is
            });

            // Wait for all signed URLs to be fetched
            const updatedBookings = await Promise.all(imagePromises);

            // Send the updated response with the signed image URLs
            res.json(updatedBookings);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching bookings.");
    }
};

// const viewBookings = (req, res) => {
//     Booking.getUserBookings(req.user.id, (err, results) => {
//         if (err) return res.status(500).send("Error fetching bookings.");
//         res.json(results);
//     });
// };

module.exports = { bookTicket, viewBookings, markAsWatched };
