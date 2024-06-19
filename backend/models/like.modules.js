import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "",
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
    },
    status: {
        type: Boolean,
        default: false,
    }
},{timestamps: true});

const Like = mongoose.model("Like", likeSchema);

export default Like;