import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    // secure: true // Return "https" URLs by setting secure: true
});

// Upload file in "diskstorage" with multer
// // His comment. Because we use serverless in production. which use memory storage.
// // Function to upload file on cloudinary
// const uponCloudinary = async (file) => {
//     try {
//         const options = {
//             resource_type: 'auto'
//         }
//         const data = await cloudinary.uploader.upload(file, options);
//         // console.log("Cloudinary data is: ", data);
//         fs.unlinkSync(file);
//         return data;
//     } catch (error) {
//         fs.unlinkSync(file);
//         console.log("Some Error during file uploading on cloudinary", error);
//     }
// };

// Function to find public ID from existing file url 
function findFile(url) {
    // Extract the substring between the last slashe (/) two last coma (.) 
    const startIndex = url.lastIndexOf('/') + 1;
    const endIndex = url.lastIndexOf('.');
    const publicId = url.substring(startIndex, endIndex);
    return publicId;
  };

// // Function to update a file on Cloudinary
// const updateCloudinaryFile = async (publicId, newFile) => {
//     try {
//         const options = {
//             public_id: publicId, // Public ID of the existing file to update
//             overwrite: true,  // Allow overwriting the existing file
//             resource_type: 'auto'
//         }
//         // Upload the new file to Cloudinary
//         const result = await cloudinary.uploader.upload(newFile, options);

//         // Return the updated file URL
//         fs.unlinkSync(newFile);
//         return result.secure_url;
//     } catch (error) {
//         fs.unlinkSync(newFile);
//         console.error('Error updating file:', error);
//         // throw error;
//     }
// };

// Function to destroy the existing file with the obtained public ID
const deletefile = async (publicId)=>{
    try {
        const deleteFile = await cloudinary.uploader.destroy(publicId);
        return deleteFile;
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

const deletevideo = async (publicId)=>{
    try {
        const options = {
            resource_type: 'video' 
        }
        const deleteFile = await cloudinary.uploader.destroy(publicId, options);
        return deleteFile;
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};







// Upload file in "memoryStorage" with multer for serverless functionality.
// Function to upload file on cloudinary
const uponCloudinary = async (file) => {
    return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
            if (error) {
                console.log("Reject", error);
                reject(error);
            } else {
                console.log("File successfully uploaded to Cloudinary", result.secure_url);
                resolve(result);
            }
        });
        
        // Convert buffer to a readable stream and pipe it to Cloudinary's upload stream
        const stream = Readable.from(file);
        stream.pipe(uploadStream);
    });
};

const updateCloudinaryFile = async (publicId, fileBuffer) => {
    return new Promise((resolve, reject) => {
        const options = {
            public_id: publicId, // Public ID of the existing file to update
            overwrite: true,     // Allow overwriting the existing file
            resource_type: 'auto'
        };

        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) {
                console.error('Error updating file:', error);
                reject(error);
            } else {
                console.log("File successfully updated in Cloudinary", result.secure_url);
                resolve(result.secure_url);
            }
        });

        const stream = Readable.from(fileBuffer);
        stream.pipe(uploadStream);
    });
};
export {
    uponCloudinary,
    findFile,
    updateCloudinaryFile,
    deletefile,
    deletevideo
};