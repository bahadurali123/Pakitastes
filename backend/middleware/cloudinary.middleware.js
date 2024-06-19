import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    // secure: true // Return "https" URLs by setting secure: true
});

// Function to upload file on cloudinary
const uponCloudinary = async (file) => {
    try {
        const options = {
            resource_type: 'auto'
        }
        const data = await cloudinary.uploader.upload(file, options);
        // console.log("Cloudinary data is: ", data);
        fs.unlinkSync(file);
        return data;
    } catch (error) {
        fs.unlinkSync(file);
        console.log("Some Error during file uploading on cloudinary", error);
    }
};

// Function to find public ID from existing file url 
function findFile(url) {
    // Extract the substring between the last slashe (/) two last coma (.) 
    const startIndex = url.lastIndexOf('/') + 1;
    const endIndex = url.lastIndexOf('.');
    const publicId = url.substring(startIndex, endIndex);
    return publicId;
  };

// Function to update a file on Cloudinary
const updateCloudinaryFile = async (publicId, newFile) => {
    try {
        const options = {
            public_id: publicId, // Public ID of the existing file to update
            overwrite: true,  // Allow overwriting the existing file
            resource_type: 'auto'
        }
        // Upload the new file to Cloudinary
        const result = await cloudinary.uploader.upload(newFile, options);

        // Return the updated file URL
        fs.unlinkSync(newFile);
        return result.secure_url;
    } catch (error) {
        fs.unlinkSync(newFile);
        console.error('Error updating file:', error);
        // throw error;
    }
};
// Function to destroy the existing file with the obtained public ID
const deletefile = async (publicId)=>{
    try {
        const deleteFile = await cloudinary.uploader.destroy(publicId);
        return deleteFile;
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}
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
}

export {
    uponCloudinary,
    findFile,
    updateCloudinaryFile,
    deletefile,
    deletevideo
};