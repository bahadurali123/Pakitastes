import { diskStorage } from "multer";
import { deletevideo, findFile, updateCloudinaryFile, uponCloudinary } from "../middleware/cloudinary.middleware.js";
import Category from "../models/category.modules.js";
import { CLOUD_RESOURCE_MANAGER } from "google-auth-library/build/src/auth/baseexternalclient.js";

const get_create_category = async (__, res)=>{
    try {
        
        // show category add form page
        res.status(200).json({message:"Successfully get form for create category!"})
    } catch (error) {
        res.status(500).json({message:"Someone error during get category!"})
    }
}

const post_create_category = async (req, res)=>{
    try {
        console.log("Category Psot!");
        const { name, discription} = req.body;
        // const file = req.file.path;
        const file = req.file.buffer;
        // console.log(name, discription, file)
        if (!name || !discription || !file ) {
            req.status(400).send({message:"All fiels are require!"});
            return;
        };
        if (name.length < 3 || name.length > 25 ) {
            req.status(400).send({message:"Name length is incorrect!"});
            return;
        };
        if (discription.length < 50 || discription.length > 500 ) {
            req.status(400).send({message:"Description length is incorrect!"});
            return;
        };
        const cloudinary_responce = await uponCloudinary(file);
        // // For diskStorage
        // const video = cloudinary_responce.url;

        // For memoryStorage
        const video = cloudinary_responce.secure_url;

        const newcategory = new Category({
            name,
            video,
            discription,
        });
        const save_category = await newcategory.save();
        res.status(200).json({ save_category, message:"Successfully get form for create category!"})
    } catch (error) {
        res.status(500).json({message:"Someone error during post category!"})
    }
};

const get_update_category = async (__, res)=>{
    try {
        // show update category form page
        res.status(200).json({message:"Successfully get form for update category!"})
    } catch (error) {
        res.status(500).json({message:"Someone error during get update category!", error})
    }
};

const put_update_category = async (req, res)=>{
    try {
        const { name, discription} = req.body;
        const id = req.params.id;
        // const file = req.file.path;
        const file = req.file.buffer;
        // console.log("Data", file, name, discription, id);

        if (!name || !discription ) {
            req.status(400).send({message:"All fiels are require!"});
            return;
        };
        if (name.length < 3 || name.length > 25 ) {
            req.status(400).send({message:"Name length is incorrect!"});
            return;
        };
        if (discription.length < 50 || discription.length > 500 ) {
            req.status(400).send({message:"Description length is incorrect!"});
            return;
        };
        
        const category = await Category.findById({_id: id});
        // Extrect Cloudinary picture id from picture url
        const find_file_Id = await findFile(category.video);
        const cloudinary_output = await updateCloudinaryFile(find_file_Id, file);
        const video = cloudinary_output;
        // console.log("Video: ", video);

        const newcategory = await Category.findOneAndUpdate(
            {
                _id:id 
            },
            {
                name,
                discription,
                video
            },
            {
                new: true
            }
        );

        res.status(200).json({ newcategory, message:"Successfully update category!"})
    } catch (error) {
        res.status(500).json({message:"Someone error during update category!"})
    }
};

const delete_category = async (req, res)=>{
    try {
        console.log("Category dalete!");
        const id = req.params.id;

        // Delete form DB
        const category = await Category.findOneAndDelete( { _id:id } );

        // Delete form cloudinary
        const public_file_Id = await findFile(category.video);
        await deletevideo(public_file_Id);

        res.status(200).json({ message:"Successfully delete category!"})
    } catch (error) {
        res.status(500).json({message:"Someone error during update category!"})
    }
};
export {
    get_create_category,
    post_create_category,
    get_update_category,
    put_update_category,
    delete_category
}