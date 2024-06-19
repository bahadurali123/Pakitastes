import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            require: true,
            lowercase: true,
        },
        price: {
            type: Number,
            require: true,
        },
        picture:{
            type: String,
            require: true,
        },
        stockQty:{
            type: Number,
            require: true,
        },
        discription:{
            type: String,
        },
        storeId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            require: true,
        },
        categoryId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            require: true,
        },
    },
    {timestamps: true}
);

const Product = mongoose.model("Product", productSchema);
export default Product;