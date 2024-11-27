// utils/s3Utils.js
const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    // aws_access_key_id: "ASIAXCVR2NBEQEZDTWO2",
    // aws_secret_access_key: "yZa+WJJYYyHDOUNTW6BxnqR5l/dCZCJKzlWxr+my",
    // aws_session_token: "IQoJb3JpZ2luX2VjEOD//////////wEaCXVzLXdlc3QtMiJHMEUCIQDD8Z329YFAR9WYRuKgpz24z/Ul3RRbwji/PeV5p1ZHBQIgCynRVikxPhHXt8DkRwgRp59+Dgv/uPSSmEkRa1rks8kqtAIIeRAAGgw0ODY3Nzc5NzI4MDkiDLFkn9iuKI/gV0AKQSqRAq4yzO3ywfcg1GQQLXmEwuFNnN1VJtwees2uopuR+C9aL0K77o7vMBQ91iLnDjZmHesMWaqm6LTpUqESk2MGwGJo8opa38TRa9cq3kx1mRj9819fnJ27afhgPkUjpUBgChdb8aVln1MC/wcXtZuuwbIqCDJRA9+F1aAAHnGiAdLer0AJxtYl8qCLwmfUSjVptsgUTdid4Y1Y0EQu0DkRmNJh14hlWuEG+SUIu0UBTs7KvCQNWuWk0B8ji0ARFb2+QnI7LGiuQIlmviYC9X0y+QuNRPceueEbBTzG6e6Upt5pQ/bVAsxuHKNC6ItRmOr5P2B9JzLv8lAEHOh+eb7/kmRcmO0R1jzGUfHQ9ZgVONaLZjCb8fK5BjqdASSDngQ3VD+VFveyB68w6hMJdCekkbEQeDO+8VJ+lRCnUgAX+HSFEMH4DnHcXStkWgo5Cljj/wOMDeC+DOHBNXn0iIlmmQ8JOvfGU6RHmsZ9N0TLLssJfSlMN+SgkY6/22wqV5BJRB4LVxRkf95obCAzKTfA42NqR++3A+rbQjDCXXyiFV2cSK80YrRn9gaGoKo9Ep8YZzm8ZGmwn2g="
    region: process.env.AWS_REGION,
});

// Upload function
const uploadImageToS3 = async (filePath, key) => {
    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    };

    try {
        const data = await s3.upload(params).promise();
        return data.Location;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

// Delete function
const deleteImageFromS3 = async (key) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    };

    try {
        await s3.deleteObject(params).promise();
        console.log(`Image ${key} deleted from S3.`);
    } catch (error) {
        console.error("Error deleting file from S3:", error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

module.exports = { uploadImageToS3, deleteImageFromS3 };
