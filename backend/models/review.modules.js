import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
    },
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
    rating: {
        type: Number,
        require: true,
        minimum: 1,
        maximum: 5,
    },
    review: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;