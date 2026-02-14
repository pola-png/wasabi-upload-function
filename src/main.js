const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

module.exports = async ({ req, res, log, error }) => {
  try {
    log('Function started');
    
    const fileName = req.headers['x-file-name'] || `${Date.now()}_upload`;
    const fileType = req.headers['x-file-type'] || 'application/octet-stream';

    log(`Uploading file: ${fileName}, type: ${fileType}`);

    if (!req.body || req.bodyRaw.length === 0) {
      throw new Error('No file data received');
    }

    const s3Client = new S3Client({
      region: process.env.WASABI_REGION || 'us-east-1',
      endpoint: process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
      credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY,
        secretAccessKey: process.env.WASABI_SECRET_KEY
      }
    });

    const command = new PutObjectCommand({
      Bucket: process.env.WASABI_BUCKET || 'xapzap-media',
      Key: `media/${fileName}`,
      Body: Buffer.from(req.bodyRaw, 'base64'),
      ContentType: fileType
    });

    await s3Client.send(command);

    log(`Upload successful: ${fileName}`);

    return res.json({
      success: true,
      url: `/media/${fileName}`,
      fileName
    });

  } catch (err) {
    error(`Upload failed: ${err.message}`);
    return res.json({ error: err.message }, 500);
  }
};
