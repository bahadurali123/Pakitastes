import multer from "multer";
import path from "path"

// For server environment

// ES6 not support __dirname so we use fileURLToPath for it
import { fileURLToPath } from 'url';
//we need to change up how __dirname is used for ES6 purposes
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log("path: ", path.join(__dirname, "../../public/images/tempimages"));
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, path.join(__dirname, "../../public/images/tempimages"))
    },
    diskStorage: function(req, file, cb){
        cb(null, file.originalname)
    }
});

// // For serverless environment
// const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
export default upload;