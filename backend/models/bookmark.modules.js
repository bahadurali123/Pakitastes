import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "",
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    status: {
        type: Boolean,
        default: false,
    }
}, {timestamps: true});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;