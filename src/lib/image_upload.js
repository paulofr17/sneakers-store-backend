const { v4: uuidv4 } = require('uuid');
const { Storage } = require("@google-cloud/storage");

const projectId = process.env.GOOGLE_STORAGE_PROJECT_ID;
//const keyFilename = "./key.json"; 
const storage = new Storage({
  // projectId,
  // keyFilename,
});
const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME); 

module.exports = {
  generateImagesUrl: (files) => {
    return new Promise((resolve, reject) => {
      try {
        if (files) {
          // Upload each file to the specified bucket
          const uploadPromises = files.map((uploadedFile) => {
            // Create filename using uuid, populate url in files and initialize file stream 
            const fileName = uuidv4() + '.jpg';
            uploadedFile.url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            const fileStream = bucket.file(fileName).createWriteStream({});
    
            // Send content to file stream
            fileStream.end(uploadedFile.buffer);
    
            // Handle errors during file upload
            fileStream.on('error', (error) => {
              reject({ error: `Error uploading file ${uploadedFile.originalname}` });
            });
    
            return new Promise((resolve, reject) => {
              fileStream.on('finish', resolve);
            });
          });
          
          // Wait for all uploads to complete
          Promise.all(uploadPromises).then(() => {
            resolve(files);
          }).catch(error => {
            reject({ error: 'Error during file uploads' });
          });
        }
      } catch (error) {
        reject({ error: `Error uploading files...` });
      }
    });
  },
}