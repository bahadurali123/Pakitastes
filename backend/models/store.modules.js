import mongoose from "mongoose";
// import bcrypt from "bcrypt";

const storeSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            require: true,
            lowercase: true,
            unique: true,
        },
        email:{
            type: String,
            require: true,
            lowercase: true,
            unique: true,
        },
        logo:{
            type: String,
        },
        banner:{
            type: String,
        },
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"",
            require: true,
        },
        description:{
            type: String,
            lowercase: true,
        }
    },
    {timestamps: true}
);


const Store = mongoose.model("Store", storeSchema);
export default Store;