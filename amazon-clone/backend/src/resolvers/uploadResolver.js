// backend/src/resolvers/uploadResolver.js
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadResolver = {
  Mutation: {
    async getPresignedUrl(_, { fileName, fileType }) {
      const key = `uploads/${Date.now()}_${fileName}`;
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
      });
      // Expire in 60 seconds
      const url = await getSignedUrl(s3, command, { expiresIn: 60 });
      return url;
    },
    async deleteS3File(_, { key }) {
      try {
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
        }));
        return true;
      } catch (err) {
        console.error("S3 deletion failed:", err.message);
        return false;
      }
    }

  }
};

module.exports = uploadResolver;
