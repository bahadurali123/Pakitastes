import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
            lowercase: true,
            unique: true,
        },
        video: {
            type: String,
            require: true,
        },
        discription: {
            type: String,
            lowercase: true,
        }
    },
    { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;