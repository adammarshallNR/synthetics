var assert = require("assert")
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set thresholds and other variables
const config = {
    minFileSize:5000
};
/* 
Set the Bucket name & object returned - these are used when calling the main function getObjectDetails.  
In most cases using this synthetic to check a file that is uploaded daily, the filename will remain the same, or 
perhaps with a datestamp, or will be the latest one, and the script can be modified as such - if modifying to look
for the latest file, make sure there is a check to ensure it has also been uploaded within the last X hours or the
same day the synthetic executes on (in UTC)
*/
const bucketDetails = {
    Bucket: "synthetic-monitor-test-adam-marshall",
    File: "generated.json"
   };

// Create S3 service object
var s3 = new AWS.S3(
  {
    apiVersion: '2006-03-01',
    region: 'eu-west-2',
    accessKeyId: $secure.AWSACCESSKEYID,
    secretAccessKey: $secure.AWSACCESSKEY
  }
);

//Gets all the objects in the specified bucket
async function getObjectDetails(bucketName, fileName) {
  let object;

  try {
    const params = {
      Bucket: bucketName
    };

    const response = await s3.listObjects(params).promise();

    if (response.Contents.length > 0) {
      object = response.Contents.find(item => item.Key === fileName);

      if (!object) {
        throw new Error(`No object with key "${fileName}" found in the bucket`);
      }
    } else {
      throw new Error('No objects found in the bucket');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }

  return object; 
}

  //Do the work and compare the sizes
  (async () => {
      const object = await getObjectDetails(bucketDetails.Bucket, bucketDetails.File);
      console.log(object);
        // Assertion
            assert.ok(object.Size > config.minFileSize, 'Object size is less than config.minfilesize')
  })();