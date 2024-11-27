
// const AWS = require('aws-sdk');
// const multer = require('multer');
// const multerS3 = require('multer-s3');

// // Configure AWS SDK
// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Set this in your .env file
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Set this in your .env file
//     region: process.env.AWS_REGION, // Your S3 bucket region
// });

// // Configure Multer to use S3
// const upload = multer({
//     storage: multerS3({
//         s3,
//         bucket: process.env.AWS_BUCKET_NAME, // Your S3 bucket name
//         metadata: (req, file, cb) => {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: (req, file, cb) => {
//             cb(null, `movies/${Date.now()}_${file.originalname}`); // File path in the bucket
//         },
//     }),
// });

// module.exports = upload;
// const { Upload } = require('@aws-sdk/lib-storage');
// const s3Client = require('./s3'); // Import your configured S3 client

// const uploadFile = async (file) => {
//     const upload = new Upload({
//         client: s3Client,
//         params: {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: `movies/${Date.now()}_${file.originalname}`,
//             Body: file.buffer, // File buffer from Multer
//         },
//     });

//     try {
//         const result = await upload.done();
//         console.log('File uploaded successfully:', result.Location);
//         return result.Location; // Return S3 URL
//     } catch (err) {
//         console.error('Error uploading file:', err);
//         throw err;
//     }
// };

// module.exports = { uploadFile };
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
    },
});

const uploadFile = async (file) => {
    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `movies/${Date.now()}_${file.originalname}`,
            Body: file.buffer, // File buffer from Multer
            ContentType: file.mimetype, // Set the correct MIME type
        },
    });

    try {
        const result = await upload.done();
        console.log('File uploaded successfully:', result.Key);
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.Key}`;
    } catch (err) {
        console.error('Error uploading file:', err);
        throw err;
    }
};

module.exports = { s3Client, uploadFile };


// https://mitesh-movie-poster.s3.us-east-1.amazonaws.com/movies/1732065380387_WIN_20240821_11_30_13_Pro.jpg
// https://mitesh-movie-poster.s3.us-east-1.amazonaws.com/movies/1732065380387_WIN_20240821_11_30_13_Pro.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAXCVR2NBE4RZNRK2V%2F20241120%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241120T011756Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIBVepoyyYqNZpoghGyfRkS2ObzDt6hhw7TWGCr8xSrmfAiEA3GwgoZgSZVLpCW5eBjzKAcblQIbh%2FW%2FYe7yOgsdasU8qiAMIgv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw0ODY3Nzc5NzI4MDkiDHAdQVY23sh0hHFrtyrcAvYnVBktlylX07oJ8GjZ3FKdisETXP0riE8e%2B6LXF7j5N%2FqBdbCWxkZcYzrb8mJqL3fvHxvLse%2F0rO378JnDqIQOSWpVY0gTIgHsjt4fWfsgXwoOBP2qiJD3zKUN4YWHi3X9VNK4AnDcsacdH%2Fxe5WrIkRID%2Bny3tJP2dCF4PL3BbL8da2H6gH940zCJ4QwM%2BZMebrl2OXx3mxBK72hj6t60Z7rnItotK4UT3eeTFpJp5y5GMFIz%2FJCBzzjPAovlNap6%2BLZKA%2FpwnS0E4mPoSxRqz1leJOg4IGIZhBQZyhvXa93noeZeN1%2FCGohiyjrSzr9vvlx2oNz4aj05bTZP%2BbAroWcM25I4IhLK%2B7JVA7G0onJpj5%2BzspTTPXeR25bvBIPTGL6bC61XpBfF%2FeJaewxWPKKNM%2FG8wXfAY9X24T7s16MCbVBX3Gvk7wMzmIkELlDj8VSD7DeSLxGLfDDD7PS5BjqHAiWzfn2nmg2KC5Gs5kXobHF47RTibR%2BH7kq4COnw3PhgNmVD7Ahi7oeUCUFX8SU1%2BXU8y12z4aDZQ744FAFkoVtmGqiZ3gQijr8RbNpUMjfeSUGFbbREObV6shjUUuP4qpULx9VTsgqYMzEJPf3Crqk%2Fizl7sxz3jsr1ak9sTw4Eigm6kLe8BKmAJMywK1iR6Bf0ANRDCLt%2B%2BNmvdpxfBlrUA2Ssn6jNt08rgJOO2enePGZu8G4yoMUqdbyWhDKdiYttDfiPdqBCOwaQlBmusmD%2BZgA4cbzzq8g1DRPazB9cdISvI54jTdK92xtPURFwqZH73mjZmhgDFPK1t1gz4MyV%2FTWNiqnn&X-Amz-Signature=1e54db89bb6b03374775e199c09d50cab090277ffe88bc387c73cf8415abbcd0&X-Amz-SignedHeaders=host&response-content-disposition=inline