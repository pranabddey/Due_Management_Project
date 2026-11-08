const express = require('express');
const app = express();

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// AWS SDK v3 configuration
const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    
  }
});

const bucketName = 's3lamda-test-pranab';

app.get('/listObjects', async (req, res) => {
  try {
    const params = {
      Bucket: bucketName
    };

    // Use ListObjectsV2Command to list objects in the S3 bucket
    const data = await s3Client.send(new ListObjectsV2Command(params));

    const fileTypes = {};
    let totalSize = 0;

    // Process data to calculate file types and total size
    data.Contents.forEach(object => {
      const fileName = object.Key;
      const fileSize = object.Size;
      const fileExtension = fileName.split('.').pop();

      if (fileTypes[fileExtension]) {
        fileTypes[fileExtension].count++;
        fileTypes[fileExtension].Size += fileSize;
      } else {
        fileTypes[fileExtension] = {
          count: 1,
          Size: fileSize
        };
      }
      totalSize += fileSize;
    });

    const totalSizeMB = totalSize / (1024 * 1024);

    // Prepare the JSON response body
    const responseBody = {
      bucketName: params.Bucket,
      fileTypes: fileTypes,
      totalSizeBytes: totalSize,
      totalSizeMB: totalSizeMB.toFixed(2)
    };

    // Send JSON response
    res.json(responseBody);

  } catch (err) {
    console.error("Error retrieving objects:", err);
    res.status(500).json({ error: "Failed to retrieve objects" });
  }
});

const port = 3600;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
